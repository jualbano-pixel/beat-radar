"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const sources_js_1 = require("../config/sources.js");
const annotate_js_1 = require("../lib/annotate.js");
const dedupe_js_1 = require("../lib/dedupe.js");
const editorial_js_1 = require("../lib/editorial.js");
const exclusions_js_1 = require("../lib/exclusions.js");
const html_js_1 = require("../lib/fetchers/html.js");
const rss_js_1 = require("../lib/fetchers/rss.js");
const normalize_js_1 = require("../lib/normalize.js");
const editorial_layer_js_1 = require("../lib/editorial-layer.js");
const prioritize_js_1 = require("../lib/prioritize.js");
const quality_js_1 = require("../lib/quality.js");
const ranking_js_1 = require("../lib/ranking.js");
const relevance_js_1 = require("../lib/relevance.js");
const weekly_packet_js_1 = require("../lib/weekly-packet.js");
async function fetchStoriesForSource(source) {
    if (source.type === "rss") {
        return (0, rss_js_1.fetchRssStories)(source);
    }
    return (0, html_js_1.fetchHtmlStories)(source);
}
async function run() {
    const fetchedAt = new Date().toISOString();
    const candidateStoriesBySource = new Map();
    const results = [];
    const allDroppedStories = [];
    const timeMode = process.env.AI_TECH_TIME_MODE === "context" ||
        process.env.AI_TECH_TIME_MODE === "archive"
        ? "context"
        : "current";
    const keptCountBySource = new Map();
    for (const source of sources_js_1.sources) {
        try {
            const rawStories = await fetchStoriesForSource(source);
            const normalizationResult = (0, normalize_js_1.normalizeStoriesForSource)(rawStories, source, fetchedAt);
            const hardExclusionResult = (0, exclusions_js_1.applyHardExclusions)(normalizationResult.kept);
            const reviewResult = (0, quality_js_1.reviewStories)(hardExclusionResult.kept);
            const relevanceResult = (0, relevance_js_1.filterStoriesByRelevance)(reviewResult.kept, {
                enabled: true
            });
            const timeFilteredResult = (0, editorial_js_1.applyTimeModeFilter)(relevanceResult.kept, source, fetchedAt, timeMode);
            candidateStoriesBySource.set(source.name, timeFilteredResult.kept);
            keptCountBySource.set(source.name, timeFilteredResult.kept.length);
            allDroppedStories.push(...normalizationResult.dropped, ...hardExclusionResult.dropped, ...reviewResult.dropped, ...relevanceResult.dropped, ...timeFilteredResult.dropped);
            results.push({
                source: source.name,
                success: true,
                fetchedCount: rawStories.length,
                normalizedCount: normalizationResult.kept.length,
                droppedCount: normalizationResult.dropped.length +
                    hardExclusionResult.dropped.length +
                    reviewResult.dropped.length +
                    relevanceResult.dropped.length +
                    timeFilteredResult.dropped.length,
                keptCount: timeFilteredResult.kept.length
            });
        }
        catch (error) {
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
    const dedupeResult = (0, dedupe_js_1.dedupeStories)(allCandidateStories);
    allDroppedStories.push(...dedupeResult.dropped);
    for (const droppedStory of dedupeResult.dropped) {
        const currentKeptCount = keptCountBySource.get(droppedStory.source) ?? 0;
        keptCountBySource.set(droppedStory.source, Math.max(0, currentKeptCount - 1));
    }
    const dedupedStoriesBySource = new Map();
    for (const story of dedupeResult.kept) {
        const storiesForSource = dedupedStoriesBySource.get(story.source) ?? [];
        storiesForSource.push(story);
        dedupedStoriesBySource.set(story.source, storiesForSource);
    }
    const cappedStories = [];
    for (const source of sources_js_1.sources) {
        const uniqueStories = dedupedStoriesBySource.get(source.name) ?? [];
        const capResult = (0, editorial_js_1.applySourceCap)(uniqueStories, source, timeMode);
        cappedStories.push(...capResult.kept);
        allDroppedStories.push(...capResult.dropped);
        const result = results.find((entry) => entry.source === source.name);
        if (result?.success) {
            const dedupeDropsForSource = dedupeResult.dropped.filter((story) => story.source === result.source).length;
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
    const annotatedStories = (0, annotate_js_1.annotateStories)(finalStories, {
        timeMode
    });
    const rankingResult = (0, ranking_js_1.rankStories)(annotatedStories);
    const editorialStories = (0, editorial_layer_js_1.editorialLayer)(rankingResult.rankedStories);
    const outputDir = node_path_1.default.resolve(process.cwd(), "output");
    const outputFile = node_path_1.default.join(outputDir, "stories.json");
    const droppedOutputFile = node_path_1.default.join(outputDir, "dropped_stories.json");
    const topStoriesOutputFile = node_path_1.default.join(outputDir, "top_stories.json");
    const weeklyPacketOutputFile = node_path_1.default.join(outputDir, "weekly_editorial_packet.json");
    const weeklyPacketMarkdownOutputFile = node_path_1.default.join(outputDir, "weekly_editorial_packet.md");
    const topStoriesSelection = (0, prioritize_js_1.selectTopStories)(editorialStories);
    const weeklyEditorialPacket = (0, weekly_packet_js_1.buildWeeklyEditorialPacket)(editorialStories, allDroppedStories, topStoriesSelection, timeMode, fetchedAt);
    await (0, promises_1.mkdir)(outputDir, { recursive: true });
    await (0, promises_1.writeFile)(outputFile, JSON.stringify(editorialStories, null, 2));
    await (0, promises_1.writeFile)(droppedOutputFile, JSON.stringify(allDroppedStories.map((story) => ({
        title: story.title ?? "",
        source: story.source,
        date: story.date ?? "",
        reason_dropped: story.reason
    })), null, 2));
    await (0, promises_1.writeFile)(topStoriesOutputFile, JSON.stringify(topStoriesSelection, null, 2));
    await (0, promises_1.writeFile)(weeklyPacketOutputFile, JSON.stringify(weeklyEditorialPacket, null, 2));
    await (0, promises_1.writeFile)(weeklyPacketMarkdownOutputFile, (0, weekly_packet_js_1.renderWeeklyEditorialPacketMarkdown)(weeklyEditorialPacket));
    for (const result of results) {
        if (result.success) {
            console.log(`[${result.source}] fetched=${result.fetchedCount} normalized=${result.normalizedCount} dropped=${result.droppedCount} kept=${result.keptCount}`);
        }
        else {
            console.log(`[${result.source}] failed - ${result.error ?? "Unknown error"}`);
        }
    }
    if (allDroppedStories.length > 0) {
        console.log("Dropped stories:");
        for (const drop of allDroppedStories) {
            console.log(`- [${drop.source}] ${drop.reason}: ${drop.title ?? drop.url ?? "Untitled"}${drop.details ? ` (${drop.details})` : ""}`);
        }
    }
    console.log(`Total deduped output count: ${editorialStories.length} (time mode: ${timeMode})`);
    if (rankingResult.convergenceTopics.length > 0) {
        console.log("Coverage convergence:");
        for (const topic of rankingResult.convergenceTopics.slice(0, 10)) {
            console.log(`- ${topic.sources.length} sources: ${topic.stories[0]?.title ?? topic.topicKey}`);
        }
    }
    console.log(`Saved output to ${outputFile}`);
    console.log(`Saved dropped stories to ${droppedOutputFile}`);
    console.log(`Saved top stories to ${topStoriesOutputFile}`);
    console.log(`Saved weekly editorial packet to ${weeklyPacketOutputFile}`);
    console.log(`Saved weekly editorial markdown to ${weeklyPacketMarkdownOutputFile}`);
}
run().catch((error) => {
    console.error("Scraper run failed:", error);
    process.exitCode = 1;
});
