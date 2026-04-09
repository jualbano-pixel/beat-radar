"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTimeModeFilter = applyTimeModeFilter;
exports.applySourceCap = applySourceCap;
const time_modes_js_1 = require("../config/time-modes.js");
const DEFAULT_DAYS_BACK = 30;
function getCutoffDate(fetchedAt, daysBack) {
    const cutoff = new Date(fetchedAt);
    cutoff.setUTCDate(cutoff.getUTCDate() - daysBack);
    return cutoff;
}
function buildDrop(story, reason, details) {
    return {
        source: story.source,
        title: story.title,
        url: story.url,
        date: story.publishedAt,
        reason,
        details
    };
}
function applyTimeModeFilter(stories, source, fetchedAt, timeMode = "current") {
    const modeConfig = time_modes_js_1.aiTechTimeModeConfig[timeMode];
    const daysBack = modeConfig.daysBackOverride === undefined
        ? source.daysBack ?? DEFAULT_DAYS_BACK
        : modeConfig.daysBackOverride;
    if (daysBack === null) {
        return {
            kept: [...stories].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)),
            dropped: []
        };
    }
    const cutoff = getCutoffDate(fetchedAt, daysBack);
    const kept = [];
    const dropped = [];
    for (const story of stories) {
        const publishedAt = new Date(story.publishedAt);
        if (publishedAt >= cutoff) {
            kept.push(story);
            continue;
        }
        dropped.push(buildDrop(story, "dropped_time_mode", `Published before ${cutoff.toISOString()} (daysBack=${daysBack})`));
    }
    kept.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
    return { kept, dropped };
}
function applySourceCap(stories, source, timeMode = "current") {
    const modeConfig = time_modes_js_1.aiTechTimeModeConfig[timeMode];
    const sortedStories = [...stories].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
    const maxItems = source.maxItems
        ? Math.max(1, Math.floor(source.maxItems * modeConfig.maxItemsMultiplier))
        : undefined;
    if (!maxItems || sortedStories.length <= maxItems) {
        return {
            kept: sortedStories,
            dropped: []
        };
    }
    const kept = sortedStories.slice(0, maxItems);
    const overflow = sortedStories.slice(maxItems);
    const dropped = overflow.map((story) => buildDrop(story, "over_source_limit", `Exceeded maxItems=${maxItems} (mode=${timeMode})`));
    return { kept, dropped };
}
