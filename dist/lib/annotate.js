"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.annotateStories = annotateStories;
const TAG_GROUPS_BY_BEAT = {
    ai_tech: [
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
    ],
    philippine_motoring: [
        {
            tag: "pricing_pressure",
            keywords: ["srp", "price", "prices", "pricing", "financing", "loan", "monthly", "affordable", "affordability"]
        },
        {
            tag: "ownership_cost",
            keywords: ["fuel", "maintenance", "insurance", "registration", "operating cost", "ownership cost", "total cost"]
        },
        {
            tag: "ev_transition_gap",
            keywords: ["ev", "electric vehicle", "hybrid", "charging", "charger", "battery", "range"]
        },
        {
            tag: "motoring_infrastructure",
            keywords: ["road", "roads", "toll", "expressway", "traffic", "congestion", "charging station", "infrastructure"]
        },
        {
            tag: "regulation_enforcement",
            keywords: ["lto", "dotr", "mmda", "ltfrb", "policy", "regulation", "enforcement", "registration", "license"]
        },
        {
            tag: "supply_availability",
            keywords: ["supply", "inventory", "availability", "backlog", "production", "import", "deliveries"]
        },
        {
            tag: "consumer_demand_shift",
            keywords: ["demand", "sales", "segment", "suv", "pickup", "mpv", "buyers", "market share"]
        },
        {
            tag: "product_market_signal",
            keywords: ["launch", "launched", "arrives", "now available", "philippines", "srp", "variant", "variants"]
        }
    ]
};
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
    if (!haystack || !needle) {
        return false;
    }
    return new RegExp(`(^|\\s)${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(haystack);
}
function buildTags(story) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const groups = TAG_GROUPS_BY_BEAT[story.beat] ?? TAG_GROUPS_BY_BEAT.ai_tech;
    const tags = groups.filter((group) => group.keywords.some((keyword) => hasKeyword(text, keyword))).map((group) => group.tag);
    return tags.length > 0 ? tags : [`general_${story.beat}`];
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
