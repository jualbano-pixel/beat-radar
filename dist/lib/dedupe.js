"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dedupeStories = dedupeStories;
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}
function canonicalizeUrl(value) {
    try {
        const url = new URL(value);
        url.hash = "";
        url.protocol = url.protocol.toLowerCase();
        url.hostname = url.hostname.toLowerCase();
        if ((url.protocol === "https:" && url.port === "443") ||
            (url.protocol === "http:" && url.port === "80")) {
            url.port = "";
        }
        const trackingParams = [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            "utm_id",
            "utm_name",
            "utm_cid",
            "fbclid",
            "gclid"
        ];
        for (const key of trackingParams) {
            url.searchParams.delete(key);
        }
        url.pathname = url.pathname.replace(/\/+$/, "") || "/";
        url.searchParams.sort();
        return url.toString();
    }
    catch {
        return value.trim().toLowerCase();
    }
}
function normalizedTitleText(title) {
    return normalizeTitle(title).join(" ");
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
function dedupeStories(stories) {
    const kept = [];
    const seenUrls = new Set();
    const seenTitles = new Set();
    const dropped = [];
    for (const story of stories) {
        const normalizedUrl = canonicalizeUrl(story.url);
        const normalizedTitle = normalizedTitleText(story.title);
        if (seenUrls.has(normalizedUrl)) {
            dropped.push({
                source: story.source,
                title: story.title,
                url: story.url,
                date: story.publishedAt,
                reason: "deduped",
                details: `Dropped duplicate story by canonical URL: ${normalizedUrl}`
            });
            continue;
        }
        if (seenTitles.has(normalizedTitle)) {
            dropped.push({
                source: story.source,
                title: story.title,
                url: story.url,
                date: story.publishedAt,
                reason: "deduped",
                details: `Dropped duplicate story by normalized title: ${normalizedTitle}`
            });
            continue;
        }
        const similarTitleMatch = kept.find((existing) => {
            if (normalizedTitleText(existing.title) === normalizedTitle) {
                return true;
            }
            return titleSimilarity(existing.title, story.title) >= 0.85;
        });
        if (similarTitleMatch) {
            dropped.push({
                source: story.source,
                title: story.title,
                url: story.url,
                date: story.publishedAt,
                reason: "deduped",
                details: `Dropped near-duplicate story similar to: ${similarTitleMatch.title}`
            });
            continue;
        }
        seenUrls.add(normalizedUrl);
        seenTitles.add(normalizedTitle);
        kept.push({
            ...story,
            url: normalizedUrl
        });
    }
    return { kept, dropped };
}
