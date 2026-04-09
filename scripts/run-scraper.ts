import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AiTechTimeMode } from "../config/time-modes.js";
import { sources } from "../config/sources.js";
import { annotateStories } from "../lib/annotate.js";
import { dedupeStories } from "../lib/dedupe.js";
import { applySourceCap, applyTimeModeFilter } from "../lib/editorial.js";
import { applyHardExclusions } from "../lib/exclusions.js";
import { fetchHtmlStories } from "../lib/fetchers/html.js";
import { fetchRssStories } from "../lib/fetchers/rss.js";
import { normalizeStoriesForSource } from "../lib/normalize.js";
import { editorialLayer } from "../lib/editorial-layer.js";
import { selectTopStories } from "../lib/prioritize.js";
import { reviewStories } from "../lib/quality.js";
import { rankStories } from "../lib/ranking.js";
import { filterStoriesByRelevance } from "../lib/relevance.js";
import {
  buildWeeklyEditorialPacket,
  renderWeeklyEditorialPacketMarkdown
} from "../lib/weekly-packet.js";
import type {
  NormalizedStory,
  RawStoryResult,
  SourceDefinition,
  SourceRunSummary,
  StoryDrop
} from "../lib/types.js";

async function fetchStoriesForSource(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  if (source.type === "rss") {
    return fetchRssStories(source);
  }

  return fetchHtmlStories(source);
}

async function run(): Promise<void> {
  const fetchedAt = new Date().toISOString();
  const candidateStoriesBySource = new Map<string, NormalizedStory[]>();
  const results: SourceRunSummary[] = [];
  const allDroppedStories: StoryDrop[] = [];
  const timeMode: AiTechTimeMode =
    process.env.AI_TECH_TIME_MODE === "context" ||
    process.env.AI_TECH_TIME_MODE === "archive"
      ? "context"
      : "current";
  const keptCountBySource = new Map<string, number>();

  for (const source of sources) {
    try {
      const rawStories = await fetchStoriesForSource(source);
      const normalizationResult = normalizeStoriesForSource(
        rawStories,
        source,
        fetchedAt
      );
      const hardExclusionResult = applyHardExclusions(normalizationResult.kept);
      const reviewResult = reviewStories(hardExclusionResult.kept);
      const relevanceResult = filterStoriesByRelevance(reviewResult.kept, {
        enabled: true
      });
      const timeFilteredResult = applyTimeModeFilter(
        relevanceResult.kept,
        source,
        fetchedAt,
        timeMode
      );

      candidateStoriesBySource.set(source.name, timeFilteredResult.kept);
      keptCountBySource.set(source.name, timeFilteredResult.kept.length);
      allDroppedStories.push(
        ...normalizationResult.dropped,
        ...hardExclusionResult.dropped,
        ...reviewResult.dropped,
        ...relevanceResult.dropped,
        ...timeFilteredResult.dropped
      );
      results.push({
        source: source.name,
        success: true,
        fetchedCount: rawStories.length,
        normalizedCount: normalizationResult.kept.length,
        droppedCount:
          normalizationResult.dropped.length +
          hardExclusionResult.dropped.length +
          reviewResult.dropped.length +
          relevanceResult.dropped.length +
          timeFilteredResult.dropped.length,
        keptCount: timeFilteredResult.kept.length
      });
    } catch (error) {
      results.push({
        source: source.name,
        success: false,
        fetchedCount: 0,
        normalizedCount: 0,
        droppedCount: 0,
        keptCount: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  const allCandidateStories = [...candidateStoriesBySource.values()].flat();
  const dedupeResult = dedupeStories(allCandidateStories);
  allDroppedStories.push(...dedupeResult.dropped);
  for (const droppedStory of dedupeResult.dropped) {
    const currentKeptCount = keptCountBySource.get(droppedStory.source) ?? 0;
    keptCountBySource.set(droppedStory.source, Math.max(0, currentKeptCount - 1));
  }

  const dedupedStoriesBySource = new Map<string, NormalizedStory[]>();

  for (const story of dedupeResult.kept) {
    const storiesForSource = dedupedStoriesBySource.get(story.source) ?? [];
    storiesForSource.push(story);
    dedupedStoriesBySource.set(story.source, storiesForSource);
  }

  const cappedStories: NormalizedStory[] = [];

  for (const source of sources) {
    const uniqueStories = dedupedStoriesBySource.get(source.name) ?? [];
    const capResult = applySourceCap(uniqueStories, source, timeMode);

    cappedStories.push(...capResult.kept);
    allDroppedStories.push(...capResult.dropped);

    const result = results.find((entry) => entry.source === source.name);

    if (result?.success) {
      const dedupeDropsForSource = dedupeResult.dropped.filter(
        (story) => story.source === result.source
      ).length;

      result.droppedCount += dedupeDropsForSource + capResult.dropped.length;
      result.keptCount = capResult.kept.length;
      keptCountBySource.set(source.name, capResult.kept.length);
    }
  }

  const finalStories = cappedStories;

  for (const result of results) {
    if (result.success) {
      result.keptCount = keptCountBySource.get(result.source) ?? result.keptCount;
    }
  }
  const annotatedStories = annotateStories(finalStories, {
    timeMode
  });
  const rankingResult = rankStories(annotatedStories);
  const editorialStories = editorialLayer(rankingResult.rankedStories);
  const outputDir = path.resolve(process.cwd(), "output");
  const outputFile = path.join(outputDir, "stories.json");
  const droppedOutputFile = path.join(outputDir, "dropped_stories.json");
  const topStoriesOutputFile = path.join(outputDir, "top_stories.json");
  const weeklyPacketOutputFile = path.join(
    outputDir,
    "weekly_editorial_packet.json"
  );
  const weeklyPacketMarkdownOutputFile = path.join(
    outputDir,
    "weekly_editorial_packet.md"
  );
  const topStoriesSelection = selectTopStories(editorialStories);
  const weeklyEditorialPacket = buildWeeklyEditorialPacket(
    editorialStories,
    allDroppedStories,
    topStoriesSelection,
    timeMode,
    fetchedAt
  );

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, JSON.stringify(editorialStories, null, 2));
  await writeFile(
    droppedOutputFile,
    JSON.stringify(
      allDroppedStories.map((story) => ({
        title: story.title ?? "",
        source: story.source,
        date: story.date ?? "",
        reason_dropped: story.reason
      })),
      null,
      2
    )
  );
  await writeFile(
    topStoriesOutputFile,
    JSON.stringify(topStoriesSelection, null, 2)
  );
  await writeFile(
    weeklyPacketOutputFile,
    JSON.stringify(weeklyEditorialPacket, null, 2)
  );
  await writeFile(
    weeklyPacketMarkdownOutputFile,
    renderWeeklyEditorialPacketMarkdown(weeklyEditorialPacket)
  );

  for (const result of results) {
    if (result.success) {
      console.log(
        `[${result.source}] fetched=${result.fetchedCount} normalized=${result.normalizedCount} dropped=${result.droppedCount} kept=${result.keptCount}`
      );
    } else {
      console.log(
        `[${result.source}] failed - ${result.error ?? "Unknown error"}`
      );
    }
  }

  if (allDroppedStories.length > 0) {
    console.log("Dropped stories:");
    for (const drop of allDroppedStories) {
      console.log(
        `- [${drop.source}] ${drop.reason}: ${drop.title ?? drop.url ?? "Untitled"}${drop.details ? ` (${drop.details})` : ""}`
      );
    }
  }

  console.log(
    `Total deduped output count: ${editorialStories.length} (time mode: ${timeMode})`
  );
  if (rankingResult.convergenceTopics.length > 0) {
    console.log("Coverage convergence:");
    for (const topic of rankingResult.convergenceTopics.slice(0, 10)) {
      console.log(
        `- ${topic.sources.length} sources: ${topic.stories[0]?.title ?? topic.topicKey}`
      );
    }
  }
  console.log(`Saved output to ${outputFile}`);
  console.log(`Saved dropped stories to ${droppedOutputFile}`);
  console.log(`Saved top stories to ${topStoriesOutputFile}`);
  console.log(`Saved weekly editorial packet to ${weeklyPacketOutputFile}`);
  console.log(
    `Saved weekly editorial markdown to ${weeklyPacketMarkdownOutputFile}`
  );
}

run().catch((error) => {
  console.error("Scraper run failed:", error);
  process.exitCode = 1;
});
