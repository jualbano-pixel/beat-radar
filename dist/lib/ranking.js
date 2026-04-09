"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankStories = rankStories;
const ranking_js_1 = require("../config/ranking.js");
const relevance_js_1 = require("./relevance.js");
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2);
}
function buildTopicKey(title) {
    return normalizeTitle(title).slice(0, 6).join(" ");
}
function titleSimilarity(left, right) {
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
function buildCoverageMap(stories) {
    const coverageMap = new Map();
    for (const story of stories) {
        const matchedEntry = [...coverageMap.values()].find((entry) => entry.topicKey === buildTopicKey(story.title) ||
            entry.stories.some((existingStory) => titleSimilarity(existingStory.title, story.title) >= 0.6));
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
function rankStories(stories) {
    const coverageMap = buildCoverageMap(stories);
    const rankings = stories.map((story) => {
        const coverage = [...coverageMap.values()].find((entry) => entry.stories.includes(story)) ??
            {
                topicKey: buildTopicKey(story.title),
                sources: [story.source],
                stories: [story]
            };
        const isEligibleForBoost = (0, relevance_js_1.passesBaselineEditorialRelevance)(story);
        const sourceWeight = isEligibleForBoost
            ? (ranking_js_1.sourceWeightByName[story.source] ?? 0)
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
