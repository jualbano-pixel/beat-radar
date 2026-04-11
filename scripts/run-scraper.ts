import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { beatConfigs, resolveBeat } from "../config/beats.js";
import type { AiTechTimeMode } from "../config/time-modes.js";
import { sources } from "../config/sources.js";
import { annotateStories } from "../lib/annotate.js";
import { clusterStories } from "../lib/clustering.js";
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
  Beat,
  NormalizedStory,
  RawStoryResult,
  SourceDefinition,
  SourceRunSummary,
  StoryDrop
} from "../lib/types.js";

type LatestManifest = Partial<
  Record<
    Beat,
    {
      beat_name?: string;
      latest_packet: string;
      archived_packet: string;
      updated_at?: string;
    }
  >
>;

async function fetchStoriesForSource(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  if (source.type === "rss") {
    return fetchRssStories(source);
  }

  return fetchHtmlStories(source);
}

function relativePathForManifest(filePath: string): string {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

async function readLatestManifest(manifestFile: string): Promise<LatestManifest> {
  try {
    return JSON.parse(await readFile(manifestFile, "utf8")) as LatestManifest;
  } catch {
    return {};
  }
}

function allRegisteredBeats(): Beat[] {
  return Object.keys(beatConfigs) as Beat[];
}

function beatsForRun(): Beat[] {
  if (process.env.BEAT) {
    return [resolveBeat(process.env.BEAT)];
  }

  return allRegisteredBeats();
}

async function runBeat(
  beat: Beat,
  fetchedAt: string,
  runDate: string
): Promise<void> {
  const beatConfig = beatConfigs[beat];
  const candidateStoriesBySource = new Map<string, NormalizedStory[]>();
  const results: SourceRunSummary[] = [];
  const allDroppedStories: StoryDrop[] = [];
  const requestedTimeMode = process.env[beatConfig.timeModeEnvVar];
  const timeMode: AiTechTimeMode =
    requestedTimeMode === "context" ||
    requestedTimeMode === "archive"
      ? "context"
      : "current";
  const keptCountBySource = new Map<string, number>();
  const beatSources = sources.filter((source) => source.beat === beat);

  for (const source of beatSources) {
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

  for (const source of beatSources) {
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
  const clusteringResult = clusterStories(editorialStories);
  const outputDir = path.resolve(process.cwd(), "output", beat);
  const outputFile = path.join(outputDir, "stories.json");
  const droppedOutputFile = path.join(outputDir, "dropped_stories.json");
  const topStoriesOutputFile = path.join(outputDir, "top_stories.json");
  const eventClustersOutputFile = path.join(outputDir, "event_clusters.json");
  const themeClustersOutputFile = path.join(outputDir, "theme_clusters.json");
  const weeklyPacketOutputFile = path.join(
    outputDir,
    "weekly_editorial_packet.json"
  );
  const weeklyPacketMarkdownOutputFile = path.join(
    outputDir,
    "weekly_editorial_packet.md"
  );
  const topStoriesSelection = selectTopStories(clusteringResult.stories);
  const weeklyEditorialPacket = buildWeeklyEditorialPacket(
    clusteringResult.stories,
    allDroppedStories,
    topStoriesSelection,
    timeMode,
    fetchedAt,
    beatConfig.displayName
  );
  const archiveOutputDir = path.join(outputDir, runDate);
  const latestDir = path.resolve(process.cwd(), "latest");
  const latestMarkdownOutputFile = path.join(latestDir, `${beat}.md`);
  const latestManifestOutputFile = path.join(latestDir, "latest.json");
  const archiveOutputFile = path.join(archiveOutputDir, "stories.json");
  const archiveDroppedOutputFile = path.join(
    archiveOutputDir,
    "dropped_stories.json"
  );
  const archiveTopStoriesOutputFile = path.join(
    archiveOutputDir,
    "top_stories.json"
  );
  const archiveEventClustersOutputFile = path.join(
    archiveOutputDir,
    "event_clusters.json"
  );
  const archiveThemeClustersOutputFile = path.join(
    archiveOutputDir,
    "theme_clusters.json"
  );
  const archiveWeeklyPacketOutputFile = path.join(
    archiveOutputDir,
    "weekly_editorial_packet.json"
  );
  const archiveWeeklyPacketMarkdownOutputFile = path.join(
    archiveOutputDir,
    "weekly_editorial_packet.md"
  );

  await mkdir(outputDir, { recursive: true });
  await mkdir(archiveOutputDir, { recursive: true });
  await mkdir(latestDir, { recursive: true });
  const storiesJson = JSON.stringify(clusteringResult.stories, null, 2);
  const droppedStoriesJson = JSON.stringify(
    allDroppedStories.map((story) => ({
      title: story.title ?? "",
      source: story.source,
      date: story.date ?? "",
      reason_dropped: story.reason
    })),
    null,
    2
  );
  const topStoriesJson = JSON.stringify(topStoriesSelection, null, 2);
  const eventClustersJson = JSON.stringify(
    clusteringResult.eventClusters,
    null,
    2
  );
  const themeClustersJson = JSON.stringify(
    clusteringResult.themeClusters,
    null,
    2
  );

  await writeFile(outputFile, storiesJson);
  await writeFile(
    droppedOutputFile,
    droppedStoriesJson
  );
  await writeFile(topStoriesOutputFile, topStoriesJson);
  await writeFile(eventClustersOutputFile, eventClustersJson);
  await writeFile(themeClustersOutputFile, themeClustersJson);
  const weeklyPacketJson = JSON.stringify(weeklyEditorialPacket, null, 2);
  const weeklyPacketMarkdown = renderWeeklyEditorialPacketMarkdown(
    weeklyEditorialPacket,
    clusteringResult.stories,
    clusteringResult.eventClusters,
    clusteringResult.themeClusters
  );

  await writeFile(weeklyPacketOutputFile, weeklyPacketJson);
  await writeFile(weeklyPacketMarkdownOutputFile, weeklyPacketMarkdown);
  await writeFile(archiveOutputFile, storiesJson);
  await writeFile(archiveDroppedOutputFile, droppedStoriesJson);
  await writeFile(archiveTopStoriesOutputFile, topStoriesJson);
  await writeFile(archiveEventClustersOutputFile, eventClustersJson);
  await writeFile(archiveThemeClustersOutputFile, themeClustersJson);
  await writeFile(archiveWeeklyPacketOutputFile, weeklyPacketJson);
  await writeFile(archiveWeeklyPacketMarkdownOutputFile, weeklyPacketMarkdown);
  await writeFile(latestMarkdownOutputFile, weeklyPacketMarkdown);

  const latestManifest = await readLatestManifest(latestManifestOutputFile);
  latestManifest[beat] = {
    beat_name: beatConfig.displayName,
    latest_packet: relativePathForManifest(latestMarkdownOutputFile),
    archived_packet: relativePathForManifest(archiveWeeklyPacketMarkdownOutputFile),
    updated_at: fetchedAt
  };
  await writeFile(
    latestManifestOutputFile,
    JSON.stringify(latestManifest, null, 2)
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
    `Total deduped output count: ${clusteringResult.stories.length} (beat: ${beat}, time mode: ${timeMode})`
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
  console.log(`Saved event clusters to ${eventClustersOutputFile}`);
  console.log(`Saved theme clusters to ${themeClustersOutputFile}`);
  console.log(`Saved weekly editorial packet to ${weeklyPacketOutputFile}`);
  console.log(
    `Saved weekly editorial markdown to ${weeklyPacketMarkdownOutputFile}`
  );
  console.log(`Saved archived weekly packet to ${archiveWeeklyPacketOutputFile}`);
  console.log(
    `Saved archived weekly markdown to ${archiveWeeklyPacketMarkdownOutputFile}`
  );
  console.log(`Saved latest weekly markdown to ${latestMarkdownOutputFile}`);
  console.log(`Saved latest manifest to ${latestManifestOutputFile}`);
}

async function run(): Promise<void> {
  const fetchedAt = new Date().toISOString();
  const runDate = fetchedAt.slice(0, 10);
  const beats = beatsForRun();

  for (const beat of beats) {
    console.log(`\n=== Running beat: ${beat} ===`);
    await runBeat(beat, fetchedAt, runDate);
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Scraper run failed:", error);
    process.exit(1);
  });
