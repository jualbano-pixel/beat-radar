import type {
  EditorialBucket,
  NormalizedStory,
  PriorityBreakdown,
  ReasonCode
} from "./types.js";

const KEYWORDS = {
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

const ANGLE_SIGNAL_RULES: Array<{ phrase: string; keywords: string[]; tags?: string[] }> = [
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

const SOURCE_RELEVANCE_BONUS: Record<string, number> = {
  "TechCrunch": 1,
  "The Verge": 1,
  "Wired": 1,
  "OpenAI Blog": 1,
  "Google AI Blog": 1,
  "NVIDIA Blog": 1
};

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countHits(text: string, keywords: string[]): number {
  const normalized = normalizeText(text);

  return keywords.reduce((count, keyword) => {
    return normalized.includes(normalizeText(keyword)) ? count + 1 : count;
  }, 0);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(5, value));
}

function scoreDimension(text: string, baseKeywords: string[], tagBonus = 0): number {
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

function scoreStory(
  story: NormalizedStory,
  tagFrequency: Map<string, number>
): {
  priority_score: number;
  priority_breakdown: PriorityBreakdown;
} {
  const text = `${story.title} ${story.summary ?? ""}`;
  const tags = new Set(story.tags);
  const recurringTags = story.tags.filter((tag) => (tagFrequency.get(tag) ?? 0) >= 8).length;

  const immediacy = scoreDimension(text, KEYWORDS.immediacy);
  const impact = scoreDimension(
    text,
    KEYWORDS.impact,
    tags.has("ai_infrastructure") || tags.has("ai_models") ? 1 : 0
  );
  const continuity = scoreDimension(
    text,
    KEYWORDS.continuity,
    recurringTags > 0 ? 1 : 0
  );
  const relevance = scoreDimension(
    text,
    KEYWORDS.relevance,
    (tags.has("applied_ai") ? 1 : 0) + (SOURCE_RELEVANCE_BONUS[story.source] ?? 0)
  );
  const distinctiveness = clampScore(
    5 -
      Math.max(0, recurringTags - 1) +
      (countHits(text, KEYWORDS.shift) > 0 ? 1 : 0) +
      (countHits(text, KEYWORDS.policy) > 0 ? 1 : 0)
  );

  const priority_breakdown = {
    immediacy,
    impact,
    continuity,
    relevance,
    distinctiveness
  };
  const priority_score =
    (priority_breakdown.immediacy +
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

function assignEditorialBucket(
  story: NormalizedStory,
  breakdown: PriorityBreakdown,
  priorityScore: number
): EditorialBucket {
  const text = `${story.title} ${story.summary ?? ""}`;

  if (breakdown.immediacy >= 4 && breakdown.impact >= 4 && priorityScore >= 72) {
    return "urgent_important";
  }

  if (
    breakdown.continuity >= 4 ||
    (priorityScore >= 56 && countHits(text, KEYWORDS.shift) > 0)
  ) {
    return "structural_trend";
  }

  if (priorityScore >= 36 || breakdown.continuity >= 2) {
    return "context_watch";
  }

  return "background";
}

function assignReasonCode(
  story: NormalizedStory,
  tagFrequency: Map<string, number>
): ReasonCode {
  const text = `${story.title} ${story.summary ?? ""}`;

  if (countHits(text, KEYWORDS.policy) > 0) {
    return "policy_regulatory_move";
  }

  if (countHits(text, KEYWORDS.localBusiness) > 0) {
    return "local_business_relevance";
  }

  if (countHits(text, KEYWORDS.execution) > 0) {
    return "execution_consequence";
  }

  if (countHits(text, KEYWORDS.market) > 0) {
    return "market_signal";
  }

  if (countHits(text, KEYWORDS.shift) > 0) {
    return "meaningful_shift";
  }

  if (
    story.tags.some((tag) => (tagFrequency.get(tag) ?? 0) >= 8) ||
    countHits(text, KEYWORDS.continuity) >= 2
  ) {
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

function buildAngleSignals(story: NormalizedStory): string[] {
  const text = `${story.title} ${story.summary ?? ""}`;
  const tags = new Set(story.tags);
  const phrases = ANGLE_SIGNAL_RULES.filter((rule) => {
    const keywordMatch = countHits(text, rule.keywords) > 0;
    const tagMatch = rule.tags ? rule.tags.some((tag) => tags.has(tag)) : false;

    return keywordMatch || tagMatch;
  }).map((rule) => rule.phrase);

  if (phrases.length > 0) {
    return [...new Set(phrases)].slice(0, 3);
  }

  return buildFallbackAngleSignals(story);
}

function buildFallbackAngleSignals(story: NormalizedStory): string[] {
  const text = `${story.title} ${story.summary ?? ""}`;
  const tags = new Set(story.tags);

  if (tags.has("ai_infrastructure")) {
    return ["infrastructure pressure worth watching"];
  }

  if (tags.has("applied_ai")) {
    return ["adoption pressure worth watching"];
  }

  if (tags.has("ai_models")) {
    return ["model competition tightening"];
  }

  if (countHits(text, KEYWORDS.policy) > 0) {
    return ["policy pressure worth watching"];
  }

  if (countHits(text, KEYWORDS.execution) > 0) {
    return ["execution pressure building"];
  }

  if (countHits(text, KEYWORDS.market) > 0) {
    return ["market confidence still forming"];
  }

  if (countHits(text, KEYWORDS.shift) > 0) {
    return ["strategic direction shifting"];
  }

  return ["early sign worth tracking"];
}

function improveReasonKept(
  story: NormalizedStory,
  reasonCode: ReasonCode
): string[] {
  const specificReasonByCode: Record<ReasonCode, string> = {
    policy_regulatory_move:
      "High-impact policy move with likely downstream business effects.",
    developing_pattern:
      "Confirms a pattern now appearing across multiple items.",
    execution_consequence:
      "Shows where strategy is running into execution reality.",
    meaningful_shift:
      "Marks a real change in direction with likely downstream effects.",
    local_business_relevance:
      "Strong local business relevance with likely downstream effects.",
    ongoing_story_advance:
      "Advances an ongoing story with a material new turn.",
    counterpoint:
      "Useful counterpoint to the dominant narrative.",
    market_signal:
      "Reveals something concrete about demand, spending, or market confidence.",
    industry_repositioning:
      "Shows competitive repositioning that could reshape the field.",
    watchlist_signal:
      "Early sign worth tracking if repeated."
  };

  const existingSpecificReasons = story.reason_kept.filter(
    (reason) =>
      !reason.startsWith("passed_") &&
      reason !== "within_source_cap" &&
      reason !== "passed_hard_exclusion_check" &&
      reason !== "passed_editorial_relevance" &&
      reason !== "passed_quality_review"
  );

  const systemReasons = story.reason_kept.filter((reason) => !existingSpecificReasons.includes(reason));
  const enrichedPrimaryReason =
    existingSpecificReasons.length > 0
      ? `${existingSpecificReasons[0]} ${specificReasonByCode[reasonCode]}`
      : specificReasonByCode[reasonCode];

  return [enrichedPrimaryReason, ...systemReasons];
}

function buildTagFrequency(stories: NormalizedStory[]): Map<string, number> {
  const tagFrequency = new Map<string, number>();

  for (const story of stories) {
    for (const tag of story.tags) {
      tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
    }
  }

  return tagFrequency;
}

export function editorialLayer(stories: NormalizedStory[]): NormalizedStory[] {
  const tagFrequency = buildTagFrequency(stories);

  return stories.map((story) => {
    const { priority_score, priority_breakdown } = scoreStory(story, tagFrequency);
    const reason_code = assignReasonCode(story, tagFrequency);
    const editorial_bucket = assignEditorialBucket(
      story,
      priority_breakdown,
      priority_score
    );

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
