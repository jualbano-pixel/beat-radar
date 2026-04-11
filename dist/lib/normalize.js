"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeStories = normalizeStories;
exports.normalizeStoriesForSource = normalizeStoriesForSource;
const node_crypto_1 = require("node:crypto");
function buildStoryId(story) {
    const seed = story.url || `${story.title}:${story.publishedAt}`;
    return (0, node_crypto_1.createHash)("sha256").update(seed).digest("hex").slice(0, 12);
}
function isValidDate(value) {
    if (!value) {
        return false;
    }
    return !Number.isNaN(Date.parse(value));
}
function sanitizeSummary(summary) {
    if (!summary) {
        return undefined;
    }
    const cleaned = summary.replace(/\s+/g, " ").trim();
    return cleaned || undefined;
}
function buildDrop(story, reason, details) {
    return {
        source: story.source,
        title: story.title?.trim(),
        url: story.url?.trim(),
        date: story.publishedAt?.trim(),
        reason,
        details
    };
}
function normalizeStories(rawStories, beat, fetchedAt) {
    const kept = [];
    const dropped = [];
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
            dropped.push(buildDrop(story, "missing_published_at", "Missing published date from source"));
            continue;
        }
        if (!isValidDate(publishedAt)) {
            dropped.push(buildDrop(story, "invalid_date", "Published date is not parseable"));
            continue;
        }
        const isoPublishedAt = new Date(publishedAt).toISOString();
        const normalized = {
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
function normalizeStoriesForSource(rawStories, source, fetchedAt) {
    const stories = source.useFetchedAtWhenMissingDate
        ? rawStories.map((story) => ({
            ...story,
            publishedAt: story.publishedAt ?? fetchedAt
        }))
        : rawStories;
    return normalizeStories(stories, source.beat, fetchedAt);
}
