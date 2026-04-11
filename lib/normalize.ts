import { createHash } from "node:crypto";

import type {
  Beat,
  NormalizedStory,
  NormalizationResult,
  RawStoryResult,
  SourceDefinition,
  StoryDrop
} from "./types.js";

function buildStoryId(story: {
  title: string;
  url: string;
  publishedAt: string;
}): string {
  const seed = story.url || `${story.title}:${story.publishedAt}`;

  return createHash("sha256").update(seed).digest("hex").slice(0, 12);
}

function isValidDate(value?: string): value is string {
  if (!value) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function sanitizeSummary(summary?: string): string | undefined {
  if (!summary) {
    return undefined;
  }

  const cleaned = summary.replace(/\s+/g, " ").trim();

  return cleaned || undefined;
}

function buildDrop(
  story: RawStoryResult,
  reason: StoryDrop["reason"],
  details: string
): StoryDrop {
  return {
    source: story.source,
    title: story.title?.trim(),
    url: story.url?.trim(),
    date: story.publishedAt?.trim(),
    reason,
    details
  };
}

export function normalizeStories(
  rawStories: RawStoryResult[],
  beat: Beat,
  fetchedAt: string
): NormalizationResult {
  const kept: NormalizedStory[] = [];
  const dropped: StoryDrop[] = [];

  for (const story of rawStories) {
    const title = story.title?.trim();
    const url = story.url?.trim();
    const publishedAt = story.publishedAt?.trim();

    if (!title) {
      dropped.push(buildDrop(story, "missing_title", "Missing title from source"));
      continue;
    }

    if (!url) {
      dropped.push(buildDrop(story, "missing_url", "Missing URL from source"));
      continue;
    }

    if (!publishedAt) {
      dropped.push(
        buildDrop(story, "missing_published_at", "Missing published date from source")
      );
      continue;
    }

    if (!isValidDate(publishedAt)) {
      dropped.push(buildDrop(story, "invalid_date", "Published date is not parseable"));
      continue;
    }

    const isoPublishedAt = new Date(publishedAt).toISOString();

    const normalized: NormalizedStory = {
      id: buildStoryId({
        title,
        url,
        publishedAt
      }),
      source: story.source,
      beat,
      title,
      url,
      date: isoPublishedAt,
      publishedAt: isoPublishedAt,
      tags: [],
      reason_kept: [],
      fetchedAt
    };

    const summary = sanitizeSummary(story.summary);

    if (summary) {
      normalized.summary = summary;
    }

    kept.push(normalized);
  }

  return { kept, dropped };
}

export function normalizeStoriesForSource(
  rawStories: RawStoryResult[],
  source: SourceDefinition,
  fetchedAt: string
): NormalizationResult {
  const stories = source.useFetchedAtWhenMissingDate
    ? rawStories.map((story) => ({
        ...story,
        publishedAt: story.publishedAt ?? fetchedAt
      }))
    : rawStories;

  return normalizeStories(stories, source.beat, fetchedAt);
}
