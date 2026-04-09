"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreStory = scoreStory;
exports.isObviousJunk = isObviousJunk;
exports.passesBaselineEditorialRelevance = passesBaselineEditorialRelevance;
exports.evaluateStoryRelevance = evaluateStoryRelevance;
exports.filterStoriesByRelevance = filterStoriesByRelevance;
const relevance_js_1 = require("../config/relevance.js");
const NORMALIZATION_REPLACEMENTS = [
    [/dall[\s\u00b7._-]*e/gi, "dalle"],
    [/text[\s-]*to[\s-]*image/gi, "text to image"],
    [/fine[\s-]*tuning/gi, "fine tuning"],
    [/teacher[\s-]*student/gi, "teacher student"],
    [/large[\s-]*language[\s-]*models?/gi, "language models"],
    [/gpt[\s-]?(\d+(?:\.\d+)?)/gi, "gpt $1"]
];
const RESEARCH_SIGNAL_PATTERNS = [
    /\b(curriculum learning|teacher student|theorem proving|math word problems)\b/i,
    /\b(connecting text and images|creating images from text|image generation)\b/i,
    /\b(reinforcement learning|policy gradient|prompt injection|neural networks?)\b/i,
    /\b(transformers?|diffusion|embeddings?|multimodal|reasoning|alignment)\b/i,
    /\b(llms?|language models?|reason with|thinking with images)\b/i
];
const APPLIED_SIGNAL_PATTERNS = [
    /\b(using ai|use ai|created using ai|generated using ai|someone used ai to)\b/i,
    /\b(how to|ways to|save time|small business|customer service|real world)\b/i,
    /\b(marketing|sales|operations|workflow|productivity|hiring)\b/i,
    /\b(fun|weird|viral|trend|experiment|challenge|impact|ethical)\b/i
];
const AI_ANCHOR_TERMS = [
    "ai",
    "artificial intelligence",
    "generative ai",
    "model",
    "models",
    "llm",
    "language model",
    "language models",
    "gpt",
    "chatgpt",
    "openai",
    "anthropic",
    "claude",
    "gemini",
    "copilot",
    "codex",
    "sora",
    "operator",
    "api",
    "developer",
    "developers",
    "gpu",
    "chip",
    "chips",
    "compute",
    "inference",
    "training"
];
function normalizeText(value) {
    let normalized = value.normalize("NFKD").toLowerCase();
    normalized = normalized.replace(/[\u0300-\u036f]/g, "");
    normalized = normalized.replace(/[\u2010-\u2015]/g, "-");
    normalized = normalized.replace(/[’'`]/g, "");
    for (const [pattern, replacement] of NORMALIZATION_REPLACEMENTS) {
        normalized = normalized.replace(pattern, replacement);
    }
    normalized = normalized.replace(/[^a-z0-9\s-]/g, " ");
    normalized = normalized.replace(/-/g, " ");
    return normalized.replace(/\s+/g, " ").trim();
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function containsKeyword(text, keyword) {
    const haystack = normalizeText(text);
    const needle = normalizeText(keyword);
    if (!haystack || !needle) {
        return false;
    }
    const pattern = new RegExp(`(^|\\s)${escapeRegex(needle)}(?=\\s|$)`, "i");
    return pattern.test(haystack);
}
function countMatches(text, keywords) {
    let score = 0;
    for (const keyword of keywords) {
        if (containsKeyword(text, keyword)) {
            score += 1;
        }
    }
    return score;
}
function matchesAny(text, keywords) {
    return countMatches(text, keywords) > 0;
}
function hasResearchSignal(text) {
    const normalized = normalizeText(text);
    return RESEARCH_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalized));
}
function hasAppliedSignal(text) {
    const normalized = normalizeText(text);
    return APPLIED_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalized));
}
function hasResearchSignalInStory(story) {
    return hasResearchSignal(story.title) || hasResearchSignal(story.summary ?? "");
}
function hasAiAnchor(text) {
    return matchesAny(text, AI_ANCHOR_TERMS);
}
function matchesKeepSignalCategory(text, keywords) {
    return countMatches(text, keywords) > 0;
}
function getKeepSignalCategories(story) {
    const config = relevance_js_1.relevanceConfigByBeat[story.beat];
    const title = normalizeText(story.title);
    const summary = normalizeText(story.summary ?? "");
    const combinedText = `${title} ${summary}`.trim();
    const categories = [];
    const keepSignals = config.keep_signal_keywords;
    const isModelRelease = matchesKeepSignalCategory(combinedText, keepSignals.model_release) &&
        (matchesAny(combinedText, config.core_ai_keywords) ||
            matchesAny(combinedText, ["gpt", "model", "models", "system card", "codex"]));
    if (isModelRelease) {
        categories.push("model_release");
    }
    const isDeveloperPlatform = matchesKeepSignalCategory(combinedText, keepSignals.developer_platform) &&
        hasAiAnchor(combinedText);
    if (isDeveloperPlatform) {
        categories.push("developer_platform");
    }
    const isAiInfrastructure = matchesKeepSignalCategory(combinedText, keepSignals.ai_infrastructure) &&
        (matchesAny(combinedText, config.ai_infra_keywords) ||
            matchesAny(combinedText, ["openai", "anthropic", "nvidia", "ai"]));
    if (isAiInfrastructure) {
        categories.push("ai_infrastructure");
    }
    const isEnterpriseRollout = matchesKeepSignalCategory(combinedText, keepSignals.enterprise_rollout) &&
        hasAiAnchor(combinedText);
    if (isEnterpriseRollout) {
        categories.push("enterprise_rollout");
    }
    const isStrategicPartnership = matchesKeepSignalCategory(combinedText, keepSignals.strategic_partnership) &&
        hasAiAnchor(combinedText);
    if (isStrategicPartnership) {
        categories.push("strategic_partnership");
    }
    const isPolicyRegulation = matchesKeepSignalCategory(combinedText, keepSignals.policy_regulation) &&
        (hasAiAnchor(combinedText) ||
            matchesAny(combinedText, ["openai", "anthropic", "google", "meta", "microsoft"]));
    if (isPolicyRegulation) {
        categories.push("policy_regulation");
    }
    const isLicensingCopyright = matchesKeepSignalCategory(combinedText, keepSignals.licensing_copyright) &&
        hasAiAnchor(combinedText);
    if (isLicensingCopyright) {
        categories.push("licensing_copyright");
    }
    const isSafetyGovernance = matchesKeepSignalCategory(combinedText, keepSignals.safety_governance) &&
        hasAiAnchor(combinedText);
    if (isSafetyGovernance) {
        categories.push("safety_governance");
    }
    const isStrategicFinance = matchesKeepSignalCategory(combinedText, keepSignals.strategic_finance) &&
        hasAiAnchor(combinedText);
    if (isStrategicFinance) {
        categories.push("strategic_finance");
    }
    return categories;
}
function scoreStory(story) {
    const config = relevance_js_1.relevanceConfigByBeat[story.beat];
    const title = normalizeText(story.title);
    const summary = normalizeText(story.summary ?? "");
    const coreScore = countMatches(title, config.core_ai_keywords) * 3 +
        countMatches(summary, config.core_ai_keywords) * 2;
    const infraScore = countMatches(title, config.ai_infra_keywords) * 2 +
        countMatches(summary, config.ai_infra_keywords);
    const adjacentScore = countMatches(title, config.adjacent_tech_keywords) * 2 +
        countMatches(summary, config.adjacent_tech_keywords);
    const aiAnchorScore = coreScore + infraScore;
    const appliedScore = aiAnchorScore > 0 || hasAppliedSignal(title) || hasAppliedSignal(summary)
        ? countMatches(title, config.applied_human_keywords) * 2 +
            countMatches(summary, config.applied_human_keywords)
        : 0;
    const titleResearchBoost = hasResearchSignal(title) ? 2 : 0;
    const summaryResearchBoost = hasResearchSignal(summary) ? 1 : 0;
    const titleAppliedBoost = hasAppliedSignal(title) && aiAnchorScore > 0 ? 2 : 0;
    const summaryAppliedBoost = hasAppliedSignal(summary) && aiAnchorScore > 0 ? 1 : 0;
    return (coreScore +
        infraScore +
        adjacentScore +
        appliedScore +
        titleResearchBoost +
        summaryResearchBoost +
        titleAppliedBoost +
        summaryAppliedBoost);
}
function hasDirectAiSignal(story) {
    const config = relevance_js_1.relevanceConfigByBeat[story.beat];
    const title = normalizeText(story.title);
    const summary = normalizeText(story.summary ?? "");
    const combinedText = `${title} ${summary}`.trim();
    return (countMatches(combinedText, config.core_ai_keywords) > 0 ||
        countMatches(combinedText, config.ai_infra_keywords) > 0 ||
        hasResearchSignalInStory(story));
}
function isObviousJunk(story) {
    const config = relevance_js_1.relevanceConfigByBeat[story.beat];
    const title = story.title;
    const summary = story.summary ?? "";
    const titleLower = title.toLowerCase();
    if (matchesAny(title, config.junk_keywords)) {
        return true;
    }
    if (/(^best\s)|(\bbest .* of\b)|(\bour favorite\b)|(\btop \d+\b)|(\broundup\b)|(\bgift guide\b)/i.test(title)) {
        return true;
    }
    if (/(\bcoupon\b)|(\bcoupons\b)|(\bpromo code\b)|(\bdiscount\b)|(\bsale\b)|(\bprice drop\b)|(\bpercent off\b)|(\boff right now\b)/i.test(`${title} ${summary}`)) {
        return true;
    }
    if (titleLower.includes("earbuds") ||
        titleLower.includes("phone case") ||
        titleLower.includes("apple watch bands") ||
        titleLower.includes("outdoor pizza ovens")) {
        return true;
    }
    return false;
}
function passesBaselineEditorialRelevance(story) {
    if (isObviousJunk(story)) {
        return false;
    }
    const keepSignalCategories = getKeepSignalCategories(story);
    if (keepSignalCategories.length > 0) {
        return true;
    }
    if (!hasDirectAiSignal(story)) {
        return false;
    }
    return scoreStory(story) >= 2;
}
function evaluateStoryRelevance(story) {
    if (isObviousJunk(story)) {
        return {
            kept: false,
            drop: {
                source: story.source,
                title: story.title,
                url: story.url,
                date: story.publishedAt,
                reason: "low_relevance",
                details: "Matched junk, shopping, or consumer-tech listicle filters"
            }
        };
    }
    const score = scoreStory(story);
    const config = relevance_js_1.relevanceConfigByBeat[story.beat];
    const keepSignalCategories = getKeepSignalCategories(story);
    if (score >= config.min_score || keepSignalCategories.length > 0) {
        if (keepSignalCategories.length > 0 || hasDirectAiSignal(story)) {
            return { kept: true };
        }
    }
    return {
        kept: false,
        drop: {
            source: story.source,
            title: story.title,
            url: story.url,
            date: story.publishedAt,
            reason: "low_relevance",
            details: `Relevance score ${score} fell below threshold ${config.min_score}`
        }
    };
}
function filterStoriesByRelevance(stories, options = {}) {
    if (!options.enabled) {
        return {
            kept: stories,
            dropped: []
        };
    }
    const kept = [];
    const dropped = [];
    for (const story of stories) {
        const evaluation = evaluateStoryRelevance(story);
        if (evaluation.kept) {
            kept.push(story);
            continue;
        }
        if (evaluation.drop) {
            dropped.push(evaluation.drop);
        }
    }
    return { kept, dropped };
}
