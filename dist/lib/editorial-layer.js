"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorialLayer = editorialLayer;
const AI_TECH_KEYWORDS = {
    immediacy: [
        "today",
        "now",
        "launch",
        "announced",
        "introducing",
        "rollout",
        "release",
        "debuts",
        "new"
    ],
    impact: [
        "acquire",
        "acquisition",
        "partnership",
        "funding",
        "investment",
        "billions",
        "regulation",
        "policy",
        "infrastructure",
        "compute",
        "api",
        "enterprise",
        "platform"
    ],
    continuity: [
        "update",
        "next phase",
        "continued",
        "again",
        "ongoing",
        "expands",
        "scales",
        "follow-up",
        "deeper",
        "roadmap"
    ],
    relevance: [
        "enterprise",
        "developers",
        "developer",
        "business",
        "pricing",
        "workflow",
        "productivity",
        "integration",
        "deployment",
        "customer"
    ],
    policy: [
        "approval",
        "bill",
        "regulation",
        "regulatory",
        "doe",
        "sec",
        "court",
        "antitrust",
        "compliance",
        "governance",
        "policy"
    ],
    shift: [
        "shift",
        "change",
        "pivot",
        "new direction",
        "next phase",
        "reposition",
        "redefine"
    ],
    execution: [
        "delay",
        "bottleneck",
        "shortage",
        "cost",
        "pressure",
        "constraint",
        "latency",
        "reliability",
        "capacity"
    ],
    market: [
        "funding",
        "investment",
        "valuation",
        "demand",
        "spending",
        "pricing",
        "revenue",
        "market"
    ],
    localBusiness: [
        "philippines",
        "philippine",
        "manila",
        "peso",
        "php",
        "sme",
        "small business",
        "bpo",
        "local company"
    ]
};
const PHILIPPINE_MOTORING_KEYWORDS = {
    immediacy: [
        "today",
        "now",
        "launch",
        "launched",
        "arrives",
        "announced",
        "available",
        "new",
        "increase",
        "rollback"
    ],
    impact: [
        "price",
        "prices",
        "pricing",
        "srp",
        "financing",
        "fuel",
        "infrastructure",
        "charging",
        "regulation",
        "policy",
        "lto",
        "dotr",
        "supply",
        "demand",
        "sales"
    ],
    continuity: [
        "backlog",
        "continues",
        "again",
        "shift",
        "trend",
        "rollout",
        "expands",
        "transition",
        "growth",
        "decline"
    ],
    relevance: [
        "philippines",
        "philippine",
        "manila",
        "buyers",
        "owners",
        "drivers",
        "commuters",
        "financing",
        "affordable",
        "fuel",
        "registration"
    ],
    policy: [
        "lto",
        "dotr",
        "mmda",
        "ltfrb",
        "policy",
        "regulation",
        "regulatory",
        "enforcement",
        "registration",
        "license",
        "plates",
        "emissions"
    ],
    shift: [
        "shift",
        "change",
        "pivot",
        "transition",
        "growth",
        "decline",
        "segment",
        "preference"
    ],
    execution: [
        "delay",
        "backlog",
        "shortage",
        "constraint",
        "infrastructure",
        "charging",
        "supply",
        "availability",
        "capacity"
    ],
    market: [
        "price",
        "prices",
        "pricing",
        "srp",
        "financing",
        "demand",
        "sales",
        "market",
        "segment",
        "affordability"
    ],
    localBusiness: [
        "philippines",
        "philippine",
        "manila",
        "peso",
        "php",
        "dealers",
        "distributor",
        "lto",
        "dotr"
    ]
};
function keywordsForStory(story) {
    return story.beat === "philippine_motoring"
        ? PHILIPPINE_MOTORING_KEYWORDS
        : AI_TECH_KEYWORDS;
}
const ANGLE_SIGNAL_RULES = [
    {
        phrase: "policy pressure building",
        keywords: ["policy", "regulation", "regulatory", "compliance"]
    },
    {
        phrase: "regulation moving ahead of capacity",
        keywords: ["policy", "regulation", "capacity", "constraint", "infrastructure"]
    },
    {
        phrase: "infrastructure lag visible",
        keywords: ["compute", "gpu", "data center", "inference", "cloud", "capacity"],
        tags: ["ai_infrastructure"]
    },
    {
        phrase: "developer workflow changing",
        keywords: ["api", "developer", "developers", "tool", "runtime", "sdk"]
    },
    {
        phrase: "enterprise adoption pressure rising",
        keywords: ["enterprise", "business", "deployment", "workflow", "adoption"]
    },
    {
        phrase: "competitive position shifting",
        keywords: ["acquire", "acquisition", "partnership", "platform", "reposition"]
    },
    {
        phrase: "safety pressure building",
        keywords: ["safety", "security", "governance", "risk"]
    },
    {
        phrase: "cost pressure building",
        keywords: ["pricing", "cost", "latency", "reliability"]
    },
    {
        phrase: "execution gap showing",
        keywords: ["delay", "bottleneck", "shortage", "constraint", "friction"]
    },
    {
        phrase: "demand still unproven",
        keywords: ["demand", "adoption", "uptake", "traction", "early days"]
    },
    {
        phrase: "investment caution showing",
        keywords: ["funding", "investment", "valuation", "spending", "revenue"]
    },
    {
        phrase: "transition friction emerging",
        keywords: ["transition", "rollout", "migration", "shift", "change"]
    },
    {
        phrase: "supply risk rising",
        keywords: ["supply", "chip", "chips", "shortage", "capacity"]
    },
    {
        phrase: "local operators exposed",
        keywords: ["philippines", "philippine", "manila", "bpo", "local company"]
    },
    {
        phrase: "narrative outrunning reality",
        keywords: ["despite", "however", "pushback", "risk", "gap"]
    },
    {
        phrase: "ongoing platform expansion",
        keywords: ["expands", "scale", "next phase", "rollout", "roadmap"]
    }
];
const PHILIPPINE_MOTORING_ANGLE_SIGNAL_RULES = [
    {
        phrase: "pricing pressure building",
        keywords: ["srp", "price", "prices", "pricing", "financing", "affordability"],
        tags: ["pricing_pressure"]
    },
    {
        phrase: "ownership cost reality surfacing",
        keywords: ["fuel", "maintenance", "insurance", "registration", "operating cost"],
        tags: ["ownership_cost"]
    },
    {
        phrase: "EV transition gap visible",
        keywords: ["ev", "hybrid", "charging", "battery", "range"],
        tags: ["ev_transition_gap"]
    },
    {
        phrase: "infrastructure constraint showing",
        keywords: ["road", "toll", "traffic", "congestion", "charging station", "infrastructure"],
        tags: ["motoring_infrastructure"]
    },
    {
        phrase: "regulation moving into ownership reality",
        keywords: ["lto", "dotr", "mmda", "ltfrb", "registration", "license", "enforcement"],
        tags: ["regulation_enforcement"]
    },
    {
        phrase: "supply constraint shaping choice",
        keywords: ["supply", "inventory", "availability", "backlog", "production"],
        tags: ["supply_availability"]
    },
    {
        phrase: "consumer demand shifting by segment",
        keywords: ["demand", "sales", "segment", "suv", "pickup", "mpv"],
        tags: ["consumer_demand_shift"]
    },
    {
        phrase: "product launch reveals market bet",
        keywords: ["launch", "launched", "arrives", "now available", "srp", "variant"],
        tags: ["product_market_signal"]
    }
];
const SOURCE_RELEVANCE_BONUS = {
    "TechCrunch": 1,
    "The Verge": 1,
    "Wired": 1,
    "OpenAI Blog": 1,
    "Google AI Blog": 1,
    "NVIDIA Blog": 1,
    "TopGear Philippines": 1,
    "CarGuide PH": 1,
    "BusinessWorld": 1,
    "Inquirer Business": 1,
    "Philstar Business": 1
};
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
function countHits(text, keywords) {
    const normalized = normalizeText(text);
    return keywords.reduce((count, keyword) => {
        return normalized.includes(normalizeText(keyword)) ? count + 1 : count;
    }, 0);
}
function clampScore(value) {
    return Math.max(0, Math.min(5, value));
}
function scoreDimension(text, baseKeywords, tagBonus = 0) {
    const hits = countHits(text, baseKeywords);
    if (hits >= 4) {
        return clampScore(5 + tagBonus);
    }
    if (hits === 3) {
        return clampScore(4 + tagBonus);
    }
    if (hits === 2) {
        return clampScore(3 + tagBonus);
    }
    if (hits === 1) {
        return clampScore(2 + tagBonus);
    }
    return clampScore(tagBonus);
}
function scoreStory(story, tagFrequency) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const tags = new Set(story.tags);
    const keywords = keywordsForStory(story);
    const recurringTags = story.tags.filter((tag) => (tagFrequency.get(tag) ?? 0) >= 8).length;
    const immediacy = scoreDimension(text, keywords.immediacy);
    const impact = scoreDimension(text, keywords.impact, tags.has("ai_infrastructure") ||
        tags.has("ai_models") ||
        tags.has("pricing_pressure") ||
        tags.has("regulation_enforcement")
        ? 1
        : 0);
    const continuity = scoreDimension(text, keywords.continuity, recurringTags > 0 ? 1 : 0);
    const relevance = scoreDimension(text, keywords.relevance, (tags.has("applied_ai") ? 1 : 0) + (SOURCE_RELEVANCE_BONUS[story.source] ?? 0));
    const distinctiveness = clampScore(5 -
        Math.max(0, recurringTags - 1) +
        (countHits(text, keywords.shift) > 0 ? 1 : 0) +
        (countHits(text, keywords.policy) > 0 ? 1 : 0));
    const priority_breakdown = {
        immediacy,
        impact,
        continuity,
        relevance,
        distinctiveness
    };
    const priority_score = (priority_breakdown.immediacy +
        priority_breakdown.impact +
        priority_breakdown.continuity +
        priority_breakdown.relevance +
        priority_breakdown.distinctiveness) *
        4;
    return {
        priority_score,
        priority_breakdown
    };
}
function assignEditorialBucket(story, breakdown, priorityScore) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const keywords = keywordsForStory(story);
    if (breakdown.immediacy >= 4 && breakdown.impact >= 4 && priorityScore >= 72) {
        return "urgent_important";
    }
    if (breakdown.continuity >= 4 ||
        (priorityScore >= 56 && countHits(text, keywords.shift) > 0)) {
        return "structural_trend";
    }
    if (priorityScore >= 36 || breakdown.continuity >= 2) {
        return "context_watch";
    }
    return "background";
}
function assignReasonCode(story, tagFrequency) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const keywords = keywordsForStory(story);
    if (story.beat === "philippine_motoring" &&
        countHits(text, ["launch", "launched", "arrives", "now available", "srp", "variant"]) > 0) {
        return "product_signal";
    }
    if (countHits(text, keywords.policy) > 0) {
        return "policy_regulatory_move";
    }
    if (countHits(text, keywords.localBusiness) > 0) {
        return "local_business_relevance";
    }
    if (countHits(text, keywords.execution) > 0) {
        return "execution_consequence";
    }
    if (countHits(text, keywords.market) > 0) {
        return "market_signal";
    }
    if (countHits(text, keywords.shift) > 0) {
        return "meaningful_shift";
    }
    if (story.tags.some((tag) => (tagFrequency.get(tag) ?? 0) >= 8) ||
        countHits(text, keywords.continuity) >= 2) {
        return "developing_pattern";
    }
    if (countHits(text, ["partnership", "acquire", "acquisition", "platform"]) > 0) {
        return "industry_repositioning";
    }
    if (countHits(text, ["update", "expands", "further", "again"]) > 0) {
        return "ongoing_story_advance";
    }
    if (countHits(text, ["however", "despite", "pushback", "risk"]) > 0) {
        return "counterpoint";
    }
    return "watchlist_signal";
}
function buildAngleSignals(story) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const tags = new Set(story.tags);
    const rules = story.beat === "philippine_motoring"
        ? PHILIPPINE_MOTORING_ANGLE_SIGNAL_RULES
        : ANGLE_SIGNAL_RULES;
    const phrases = rules.filter((rule) => {
        const keywordMatch = countHits(text, rule.keywords) > 0;
        const tagMatch = rule.tags ? rule.tags.some((tag) => tags.has(tag)) : false;
        return keywordMatch || tagMatch;
    }).map((rule) => rule.phrase);
    if (phrases.length > 0) {
        return [...new Set(phrases)].slice(0, 3);
    }
    return buildFallbackAngleSignals(story);
}
function buildFallbackAngleSignals(story) {
    const text = `${story.title} ${story.summary ?? ""}`;
    const tags = new Set(story.tags);
    const keywords = keywordsForStory(story);
    if (tags.has("pricing_pressure")) {
        return ["pricing pressure building"];
    }
    if (tags.has("ev_transition_gap")) {
        return ["EV transition gap visible"];
    }
    if (tags.has("regulation_enforcement")) {
        return ["regulation moving into ownership reality"];
    }
    if (tags.has("supply_availability")) {
        return ["supply constraint shaping choice"];
    }
    if (tags.has("ai_infrastructure")) {
        return ["infrastructure pressure worth watching"];
    }
    if (tags.has("applied_ai")) {
        return ["adoption pressure worth watching"];
    }
    if (tags.has("ai_models")) {
        return ["model competition tightening"];
    }
    if (countHits(text, keywords.policy) > 0) {
        return ["policy pressure worth watching"];
    }
    if (countHits(text, keywords.execution) > 0) {
        return ["execution pressure building"];
    }
    if (countHits(text, keywords.market) > 0) {
        return ["market confidence still forming"];
    }
    if (countHits(text, keywords.shift) > 0) {
        return ["strategic direction shifting"];
    }
    return ["early sign worth tracking"];
}
function improveReasonKept(story, reasonCode) {
    const specificReasonByCode = {
        policy_regulatory_move: "High-impact policy move with likely downstream business effects.",
        developing_pattern: "Confirms a pattern now appearing across multiple items.",
        execution_consequence: "Shows where strategy is running into execution reality.",
        meaningful_shift: "Marks a real change in direction with likely downstream effects.",
        local_business_relevance: "Strong local business relevance with likely downstream effects.",
        ongoing_story_advance: "Advances an ongoing story with a material new turn.",
        counterpoint: "Useful counterpoint to the dominant narrative.",
        market_signal: "Reveals something concrete about demand, spending, or market confidence.",
        industry_repositioning: "Shows competitive repositioning that could reshape the field.",
        watchlist_signal: "Early sign worth tracking if repeated.",
        product_signal: "Reveals what manufacturers think the market will buy or can afford."
    };
    const existingSpecificReasons = story.reason_kept.filter((reason) => !reason.startsWith("passed_") &&
        reason !== "within_source_cap" &&
        reason !== "passed_hard_exclusion_check" &&
        reason !== "passed_editorial_relevance" &&
        reason !== "passed_quality_review");
    const systemReasons = story.reason_kept.filter((reason) => !existingSpecificReasons.includes(reason));
    const enrichedPrimaryReason = existingSpecificReasons.length > 0
        ? `${existingSpecificReasons[0]} ${specificReasonByCode[reasonCode]}`
        : specificReasonByCode[reasonCode];
    return [enrichedPrimaryReason, ...systemReasons];
}
function buildTagFrequency(stories) {
    const tagFrequency = new Map();
    for (const story of stories) {
        for (const tag of story.tags) {
            tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
        }
    }
    return tagFrequency;
}
function editorialLayer(stories) {
    const tagFrequency = buildTagFrequency(stories);
    return stories.map((story) => {
        const { priority_score, priority_breakdown } = scoreStory(story, tagFrequency);
        const reason_code = assignReasonCode(story, tagFrequency);
        const editorial_bucket = assignEditorialBucket(story, priority_breakdown, priority_score);
        return {
            ...story,
            priority_score,
            priority_breakdown,
            editorial_bucket,
            reason_code,
            angle_signals: buildAngleSignals(story),
            reason_kept: improveReasonKept(story, reason_code)
        };
    });
}
