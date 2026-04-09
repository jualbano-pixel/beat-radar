"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.annotateStories = annotateStories;
const TAG_GROUPS = [
    {
        tag: "ai_models",
        keywords: [
            "gpt",
            "llm",
            "model",
            "language model",
            "multimodal",
            "reasoning",
            "codex",
            "sora",
            "operator"
        ]
    },
    {
        tag: "ai_research",
        keywords: [
            "benchmark",
            "eval",
            "evaluation",
            "alignment",
            "safety",
            "system card",
            "theorem proving",
            "reinforcement learning",
            "embeddings"
        ]
    },
    {
        tag: "ai_infrastructure",
        keywords: [
            "gpu",
            "chip",
            "chips",
            "compute",
            "inference",
            "training",
            "data center",
            "semiconductor",
            "api"
        ]
    },
    {
        tag: "applied_ai",
        keywords: [
            "workflow",
            "automation",
            "productivity",
            "use case",
            "customer service",
            "business",
            "enterprise",
            "developer",
            "developers"
        ]
    }
];
function normalizeText(value) {
    return value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/dall[\s\u00b7._-]*e/g, "dalle")
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function hasKeyword(text, keyword) {
    const haystack = normalizeText(text);
    const needle = normalizeText(keyword);
    return haystack.includes(needle);
}
function buildTags(story) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const tags = TAG_GROUPS.filter((group) => group.keywords.some((keyword) => hasKeyword(text, keyword))).map((group) => group.tag);
    return tags.length > 0 ? tags : ["general_ai_tech"];
}
function annotateStories(stories, options) {
    return stories.map((story) => {
        const reasonKept = [
            "passed_hard_exclusion_check",
            "passed_editorial_relevance",
            "passed_quality_review",
            `passed_time_mode:${options.timeMode}`,
            "within_source_cap"
        ];
        return {
            ...story,
            date: story.publishedAt,
            tags: buildTags(story),
            reason_kept: reasonKept
        };
    });
}
