import { sourceWeightByName } from "../config/ranking.js";
import { passesBaselineEditorialRelevance } from "./relevance.js";
import type { NormalizedStory } from "./types.js";

type StoryRanking = {
  story: NormalizedStory;
  sourceWeight: number;
  convergenceScore: number;
  totalScore: number;
  topicKey: string;
  coverageSources: string[];
};

type TopicCoverage = {
  topicKey: string;
  sources: string[];
  stories: NormalizedStory[];
};

function normalizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function buildTopicKey(title: string): string {
  return normalizeTitle(title).slice(0, 6).join(" ");
}

function titleSimilarity(left: string, right: string): number {
  const leftTokens = new Set(normalizeTitle(left));
  const rightTokens = new Set(normalizeTitle(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;

  return union === 0 ? 0 : intersection / union;
}

function buildCoverageMap(stories: NormalizedStory[]): Map<string, TopicCoverage> {
  const coverageMap = new Map<string, TopicCoverage>();

  for (const story of stories) {
    const matchedEntry = [...coverageMap.values()].find(
      (entry) =>
        entry.topicKey === buildTopicKey(story.title) ||
        entry.stories.some(
          (existingStory) => titleSimilarity(existingStory.title, story.title) >= 0.6
        )
    );

    if (matchedEntry) {
      matchedEntry.stories.push(story);
      if (!matchedEntry.sources.includes(story.source)) {
        matchedEntry.sources.push(story.source);
      }
      continue;
    }

    const topicKey = buildTopicKey(story.title);
    coverageMap.set(topicKey, {
      topicKey,
      sources: [story.source],
      stories: [story]
    });
  }

  return coverageMap;
}

export function rankStories(stories: NormalizedStory[]): {
  rankedStories: NormalizedStory[];
  convergenceTopics: TopicCoverage[];
} {
  const coverageMap = buildCoverageMap(stories);
  const rankings: StoryRanking[] = stories.map((story) => {
    const coverage =
      [...coverageMap.values()].find((entry) => entry.stories.includes(story)) ??
      {
        topicKey: buildTopicKey(story.title),
        sources: [story.source],
        stories: [story]
      };
    const isEligibleForBoost = passesBaselineEditorialRelevance(story);
    const sourceWeight = isEligibleForBoost
      ? (sourceWeightByName[story.source] ?? 0)
      : 0;
    const convergenceScore = isEligibleForBoost
      ? Math.max(0, coverage.sources.length - 1) * 0.15
      : 0;
    const totalScore = sourceWeight + convergenceScore;

    return {
      story,
      sourceWeight,
      convergenceScore,
      totalScore,
      topicKey: coverage.topicKey,
      coverageSources: coverage.sources
    };
  });

  const rankedStories = rankings
    .sort((left, right) => {
      if (right.totalScore !== left.totalScore) {
        return right.totalScore - left.totalScore;
      }

      return right.story.publishedAt.localeCompare(left.story.publishedAt);
    })
    .map((entry) => entry.story);

  const convergenceTopics = [...coverageMap.values()]
    .filter((entry) => entry.sources.length > 1)
    .sort((left, right) => right.sources.length - left.sources.length);

  return {
    rankedStories,
    convergenceTopics
  };
}
