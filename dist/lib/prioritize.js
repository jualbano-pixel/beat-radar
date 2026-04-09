"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectTopStories = selectTopStories;
const ranking_js_1 = require("../config/ranking.js");
const IMPACT_KEYWORDS = {
    major_ai_company: [
        "openai",
        "anthropic",
        "google",
        "microsoft",
        "meta",
        "amazon",
        "nvidia"
    ],
    model_or_platform: [
        "gpt",
        "model",
        "models",
        "system card",
        "api",
        "developer",
        "platform",
        "codex",
        "chatgpt",
        "sora",
        "operator"
    ],
    infrastructure: [
        "gpu",
        "chip",
        "chips",
        "cloud",
        "compute",
        "inference",
        "training",
        "data center",
        "datacenter",
        "semiconductor"
    ],
    policy: [
        "policy",
        "regulation",
        "court",
        "antitrust",
        "lawsuit",
        "doj",
        "eu",
        "governance"
    ],
    partnership: [
        "partnership",
        "partner",
        "agreement",
        "collaboration",
        "joint"
    ]
};
const STRATEGIC_KEYWORDS = {
    safety_governance: [
        "safety",
        "alignment",
        "security",
        "governance",
        "risk",
        "eval",
        "evaluation",
        "model spec",
        "system card"
    ],
    enterprise_rollout: [
        "enterprise",
        "deployment",
        "rollout",
        "scale",
        "scaling",
        "developers",
        "developer",
        "for work",
        "business"
    ],
    finance_strategy: [
        "fund",
        "funding",
        "investment",
        "invest",
        "acquire",
        "acquisition",
        "stake"
    ],
    research_ecosystem: [
        "research",
        "benchmark",
        "theoretical",
        "alignment",
        "infrastructure",
        "language model",
        "multimodal",
        "reasoning"
    ]
};
const BREADTH_KEYWORDS = {
    enterprise: [
        "enterprise",
        "business",
        "workforce",
        "customer",
        "deployment",
        "rollout",
        "adoption",
        "operations",
        "small business"
    ],
    developers: [
        "developer",
        "developers",
        "api",
        "sdk",
        "runtime",
        "tool",
        "tools",
        "platform",
        "integration"
    ],
    end_users: [
        "users",
        "user",
        "chatgpt",
        "app",
        "apps",
        "workflow",
        "productivity",
        "distribution",
        "usability"
    ],
    platforms: [
        "cloud",
        "compute",
        "infrastructure",
        "integration",
        "pricing",
        "model serving",
        "data center",
        "distribution"
    ],
    regulators: [
        "policy",
        "regulation",
        "compliance",
        "court",
        "antitrust",
        "governance",
        "regulators",
        "legal"
    ]
};
const MINOR_ITEM_KEYWORDS = [
    "beta",
    "preview",
    "tips",
    "how to",
    "experiment",
    "demo",
    "minor update",
    "small update"
];
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2);
}
function normalizeText(value) {
    return value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
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
function countKeywordHits(text, keywords) {
    const normalized = normalizeText(text);
    return keywords.reduce((count, keyword) => {
        return normalized.includes(normalizeText(keyword)) ? count + 1 : count;
    }, 0);
}
function buildCoverageMap(stories) {
    const coverageMap = new Map();
    for (const story of stories) {
        const matchedKey = [...coverageMap.keys()].find((key) => {
            const groupedStories = coverageMap.get(key) ?? [];
            return (key === buildTopicKey(story.title) ||
                groupedStories.some((existing) => titleSimilarity(existing.title, story.title) >= 0.6));
        });
        if (matchedKey) {
            coverageMap.get(matchedKey)?.push(story);
            continue;
        }
        coverageMap.set(buildTopicKey(story.title), [story]);
    }
    return coverageMap;
}
function getRecencyBoost(publishedAt, latestDate) {
    const storyTime = new Date(publishedAt).getTime();
    const daysOld = Math.max(0, Math.floor((latestDate - storyTime) / 86_400_000));
    if (daysOld <= 1) {
        return 0.6;
    }
    if (daysOld <= 3) {
        return 0.4;
    }
    if (daysOld <= 7) {
        return 0.2;
    }
    return 0;
}
function buildWhyItMatters(reasons) {
    const reasonSet = new Set(reasons);
    if (reasonSet.has("broad_ecosystem_impact")) {
        return "This belongs in the top group because its effects reach across multiple parts of the ecosystem, such as enterprises, developers, platforms, users, or regulators. It has practical consequences beyond a narrow technical audience.";
    }
    if (reasonSet.has("multi_group_impact")) {
        return "This matters because it changes how more than one important group can build, buy, deploy, or govern AI. The impact is broader than a single product or research update.";
    }
    if (reasonSet.has("policy_shift")) {
        return "This could change the rules or incentives around how AI companies build and ship products. It has consequences beyond a single product cycle.";
    }
    if (reasonSet.has("infrastructure_move")) {
        return "This matters because infrastructure changes shape what the ecosystem can build next. It affects cost, capability, or speed at platform scale.";
    }
    if (reasonSet.has("strategic_partnership")) {
        return "This is more than a routine announcement because it signals where major AI platforms and partners are aligning. That can influence distribution, adoption, or competitive position.";
    }
    if (reasonSet.has("model_or_platform_change")) {
        return "This belongs in the top group because it changes what developers, businesses, or users can do with an important AI platform. It has clear downstream ecosystem impact.";
    }
    if (reasonSet.has("safety_or_governance")) {
        return "This matters because it affects how AI systems are governed, evaluated, or deployed responsibly. Those choices can shape the broader direction of the market.";
    }
    if (reasonSet.has("enterprise_scale_signal")) {
        return "This is a strong editorial signal because it shows how AI is moving into real-world deployment at scale. It points to traction beyond experimentation.";
    }
    if (reasonSet.has("broader_trend")) {
        return "This surfaced because it looks like part of a larger theme rather than a one-off. Multiple related signals suggest it has wider editorial significance.";
    }
    return "This surfaced because it appears to have meaningful ecosystem impact and is stronger than the average item in the daily radar.";
}
function buildSecondaryNote(reasons) {
    if (reasons.includes("broad_ecosystem_impact")) {
        return "Useful because it has broad practical impact across the AI ecosystem.";
    }
    if (reasons.includes("multi_group_impact")) {
        return "Useful because it affects more than one important audience or buyer group.";
    }
    if (reasons.includes("broader_trend")) {
        return "Useful supporting signal within a broader theme.";
    }
    if (reasons.includes("enterprise_scale_signal")) {
        return "Shows practical adoption or rollout worth tracking.";
    }
    if (reasons.includes("model_or_platform_change")) {
        return "Relevant platform or product movement, but not top-tier today.";
    }
    if (reasons.includes("policy_shift")) {
        return "Worth watching for downstream regulatory impact.";
    }
    return "Useful supporting editorial signal.";
}
function getBreadthSignals(text) {
    const signals = [];
    if (countKeywordHits(text, BREADTH_KEYWORDS.enterprise) > 0) {
        signals.push("enterprise");
    }
    if (countKeywordHits(text, BREADTH_KEYWORDS.developers) > 0) {
        signals.push("developers");
    }
    if (countKeywordHits(text, BREADTH_KEYWORDS.end_users) > 0) {
        signals.push("end_users");
    }
    if (countKeywordHits(text, BREADTH_KEYWORDS.platforms) > 0) {
        signals.push("platforms");
    }
    if (countKeywordHits(text, BREADTH_KEYWORDS.regulators) > 0) {
        signals.push("regulators");
    }
    return signals;
}
function scoreStory(story, topicCoverage, latestDate) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const reasons = [];
    let score = 0;
    if (countKeywordHits(text, IMPACT_KEYWORDS.major_ai_company) > 0 &&
        countKeywordHits(text, IMPACT_KEYWORDS.model_or_platform) > 0) {
        score += 4;
        reasons.push("model_or_platform_change");
    }
    if (countKeywordHits(text, IMPACT_KEYWORDS.infrastructure) > 0) {
        score += 3.5;
        reasons.push("infrastructure_move");
    }
    if (countKeywordHits(text, IMPACT_KEYWORDS.policy) > 0) {
        score += 3.5;
        reasons.push("policy_shift");
    }
    if (countKeywordHits(text, IMPACT_KEYWORDS.partnership) > 0 &&
        countKeywordHits(text, IMPACT_KEYWORDS.major_ai_company) > 0) {
        score += 3;
        reasons.push("strategic_partnership");
    }
    if (countKeywordHits(text, STRATEGIC_KEYWORDS.safety_governance) > 0) {
        score += 2.5;
        reasons.push("safety_or_governance");
    }
    if (countKeywordHits(text, STRATEGIC_KEYWORDS.enterprise_rollout) > 0) {
        score += 2;
        reasons.push("enterprise_scale_signal");
    }
    if (countKeywordHits(text, STRATEGIC_KEYWORDS.finance_strategy) > 0 &&
        countKeywordHits(text, IMPACT_KEYWORDS.major_ai_company) > 0) {
        score += 2;
        reasons.push("strategic_finance");
    }
    if (countKeywordHits(text, STRATEGIC_KEYWORDS.research_ecosystem) > 0 &&
        (story.tags.includes("ai_research") || story.tags.includes("ai_models"))) {
        score += 1.5;
        reasons.push("foundational_research");
    }
    const breadthSignals = getBreadthSignals(text);
    if (breadthSignals.length >= 3) {
        score += 4;
        reasons.push("broad_ecosystem_impact");
    }
    else if (breadthSignals.length === 2) {
        score += 2.5;
        reasons.push("multi_group_impact");
    }
    else if (breadthSignals.length === 1) {
        score += 1;
        reasons.push("practical_usability_impact");
    }
    if (topicCoverage > 1) {
        score += Math.min(2, (topicCoverage - 1) * 0.75);
        reasons.push("broader_trend");
    }
    score += getRecencyBoost(story.publishedAt, latestDate);
    if ((ranking_js_1.sourceWeightByName[story.source] ?? 0) > 0) {
        score += 0.2;
        reasons.push("editorial_source_confirmation");
    }
    if (countKeywordHits(text, MINOR_ITEM_KEYWORDS) > 0) {
        score -= 1;
        reasons.push("minor_or_routine");
    }
    if (reasons.includes("foundational_research") &&
        !reasons.includes("broad_ecosystem_impact") &&
        !reasons.includes("multi_group_impact") &&
        !reasons.includes("enterprise_scale_signal")) {
        score -= 1.25;
        reasons.push("narrow_research_scope");
    }
    if (story.tags.includes("general_ai_tech")) {
        score -= 0.5;
    }
    return {
        story,
        priorityScore: Number(score.toFixed(2)),
        priorityReasons: [...new Set(reasons)],
        topicKey: buildTopicKey(story.title),
        topicCoverage
    };
}
function toOutputStory(scored) {
    return {
        title: scored.story.title,
        source: scored.story.source,
        date: scored.story.publishedAt,
        summary: scored.story.summary ?? "",
        tags: scored.story.tags,
        priority_score: scored.priorityScore,
        priority_reasons: scored.priorityReasons
    };
}
function selectTopStories(stories) {
    if (stories.length === 0) {
        return {
            top_stories: [],
            secondary_signals: []
        };
    }
    const coverageMap = buildCoverageMap(stories);
    const latestDate = Math.max(...stories.map((story) => new Date(story.publishedAt).getTime()));
    const scoredStories = stories
        .map((story) => {
        const topicCoverage = [...coverageMap.values()].find((group) => group.includes(story))?.length ?? 1;
        return scoreStory(story, topicCoverage, latestDate);
    })
        .sort((left, right) => {
        if (right.priorityScore !== left.priorityScore) {
            return right.priorityScore - left.priorityScore;
        }
        return right.story.publishedAt.localeCompare(left.story.publishedAt);
    });
    const topTarget = Math.min(8, Math.max(5, Math.min(stories.length, 8)));
    const secondaryTarget = Math.min(20, Math.max(10, Math.min(stories.length - topTarget, 15)));
    const topStories = [];
    const secondarySignals = [];
    const usedTopicKeys = new Set();
    for (const scored of scoredStories) {
        const alreadyUsedTopic = usedTopicKeys.has(scored.topicKey);
        if (topStories.length < topTarget && !alreadyUsedTopic) {
            topStories.push(scored);
            usedTopicKeys.add(scored.topicKey);
            continue;
        }
        if (secondarySignals.length < secondaryTarget) {
            secondarySignals.push(scored);
        }
    }
    for (const scored of scoredStories) {
        if (topStories.length >= topTarget) {
            break;
        }
        if (!topStories.includes(scored)) {
            topStories.push(scored);
        }
    }
    return {
        top_stories: topStories.map((scored) => ({
            ...toOutputStory(scored),
            why_it_matters: buildWhyItMatters(scored.priorityReasons)
        })),
        secondary_signals: secondarySignals
            .filter((scored) => !topStories.includes(scored))
            .slice(0, secondaryTarget)
            .map((scored) => ({
            ...toOutputStory(scored),
            note: buildSecondaryNote(scored.priorityReasons)
        }))
    };
}
