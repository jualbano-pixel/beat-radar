import type {
  AiTechEditorialBucket,
  AiTechFilterSummary,
  AiTechGeography,
  AiTechSystemAxis,
  NormalizedStory,
  StoryDrop
} from "./types.js";

type AiTechImportanceTier = "high" | "medium" | "low_auto_exclude";

type AiTechRuleMatch = {
  id: string;
  axis?: AiTechSystemAxis;
  keywordMatches: string[];
};

type AiTechClassification = {
  primaryAxis?: AiTechSystemAxis;
  editorialBucket: AiTechEditorialBucket;
  axisScores: Record<AiTechSystemAxis, number>;
  geography: AiTechGeography;
  downstreamRelevance: boolean;
  phSeaRelevanceScore: number;
  inclusionMatches: AiTechRuleMatch[];
  exclusionMatches: AiTechRuleMatch[];
  materialitySignals: string[];
  hardExcluded: boolean;
  passesInclusion: boolean;
  importanceTier: AiTechImportanceTier;
  failsInterpretationQuality: boolean;
};

const AXIS_PRIORITY: AiTechSystemAxis[] = [
  "policy_regulation",
  "enterprise_adoption",
  "infrastructure_compute",
  "labor_workflow_impact",
  "distribution_integration",
  "models_platforms"
];

const PH_SOURCES = [
  "BusinessWorld AI/Tech",
  "Inquirer Tech",
  "Inquirer Business AI/Tech",
  "Philippine Star Tech",
  "Philippine Star Business AI/Tech",
  "Malaya Business AI/Tech",
  "Department of Information and Communications Technology",
  "National Economic and Development Authority",
  "Department of Trade and Industry",
  "Bangko Sentral ng Pilipinas AI/Tech"
];

const PH_OFFICIAL_SOURCES = [
  "Department of Information and Communications Technology",
  "National Economic and Development Authority",
  "Department of Trade and Industry",
  "Bangko Sentral ng Pilipinas AI/Tech"
];

const GLOBAL_PLATFORM_TERMS = [
  "openai",
  "anthropic",
  "google",
  "microsoft",
  "meta",
  "nvidia",
  "claude",
  "gemini",
  "copilot",
  "chatgpt",
  "gpt",
  "llama"
];

const PH_TERMS = [
  "philippines",
  "philippine",
  "filipino",
  "filipinos",
  "manila",
  "luzon",
  "visayas",
  "mindanao",
  "cebu",
  "davao",
  "dict",
  "department of information and communications technology",
  "dti",
  "neda",
  "bsp",
  "bangko sentral",
  "peza",
  "bpo",
  "call center",
  "contact center",
  "peso",
  "php"
];

const SEA_TERMS = [
  "asean",
  "southeast asia",
  "southeast asias",
  "south east asia",
  "sea",
  "sea companies",
  "singapore",
  "indonesia",
  "malaysia",
  "thailand",
  "vietnam",
  "viet nam",
  "brunei",
  "cambodia",
  "laos",
  "myanmar",
  "regional"
];

const AI_ANCHOR_TERMS = [
  "ai",
  "artificial intelligence",
  "generative ai",
  "genai",
  "machine learning",
  "large language model",
  "language model",
  "llm",
  "gpt",
  "chatgpt",
  "openai",
  "anthropic",
  "claude",
  "gemini",
  "copilot",
  "meta ai",
  "llama",
  "model",
  "models",
  "agent",
  "agents",
  "automation",
  "computer vision",
  "natural language",
  "predictive analytics"
];

const AXIS_TERMS: Record<AiTechSystemAxis, string[]> = {
  models_platforms: [
    "model",
    "models",
    "gpt",
    "chatgpt",
    "claude",
    "gemini",
    "llama",
    "reasoning model",
    "multimodal",
    "foundation model",
    "platform",
    "system card",
    "benchmark",
    "model release"
  ],
  enterprise_adoption: [
    "deploy",
    "deployed",
    "deployment",
    "rollout",
    "implemented",
    "implementation",
    "adoption",
    "enterprise",
    "businesses",
    "bank",
    "banks",
    "insurer",
    "retail",
    "manufacturing",
    "logistics",
    "customer service",
    "operations",
    "back office"
  ],
  policy_regulation: [
    "policy",
    "regulation",
    "regulatory",
    "rules",
    "framework",
    "roadmap",
    "guidelines",
    "governance",
    "privacy",
    "data protection",
    "cybersecurity",
    "compliance",
    "dict",
    "bsp",
    "dti",
    "neda",
    "government"
  ],
  infrastructure_compute: [
    "data center",
    "datacenter",
    "cloud",
    "gpu",
    "gpus",
    "chip",
    "chips",
    "semiconductor",
    "compute",
    "computing capacity",
    "telco",
    "telecom",
    "5g",
    "subsea cable",
    "fiber",
    "sovereign cloud",
    "region",
    "availability zone"
  ],
  distribution_integration: [
    "api",
    "apis",
    "sdk",
    "developer",
    "developers",
    "integration",
    "integrated",
    "copilot",
    "workspace",
    "office",
    "teams",
    "app",
    "apps",
    "ecosystem",
    "plugin",
    "platform access",
    "pricing"
  ],
  labor_workflow_impact: [
    "workers",
    "workforce",
    "jobs",
    "labor",
    "labour",
    "workflow",
    "workflows",
    "productivity",
    "automation",
    "automate",
    "reskilling",
    "upskilling",
    "training",
    "teachers",
    "students",
    "bpo",
    "call center",
    "contact center"
  ]
};

const INCLUSION_RULES: Array<{
  id: string;
  axis: AiTechSystemAxis;
  keywords: string[];
}> = [
  {
    id: "affects_ph_sea_ai_policy_or_regulation",
    axis: "policy_regulation",
    keywords: AXIS_TERMS.policy_regulation
  },
  {
    id: "shows_real_enterprise_adoption_or_deployment",
    axis: "enterprise_adoption",
    keywords: AXIS_TERMS.enterprise_adoption
  },
  {
    id: "impacts_local_workforce_or_business_workflows",
    axis: "labor_workflow_impact",
    keywords: AXIS_TERMS.labor_workflow_impact
  },
  {
    id: "changes_infrastructure_access_compute_cloud_telco",
    axis: "infrastructure_compute",
    keywords: AXIS_TERMS.infrastructure_compute
  },
  {
    id: "reflects_regional_competition_asean_positioning",
    axis: "policy_regulation",
    keywords: ["asean", "southeast asia", "regional", "competition", "investment", "roadmap"]
  },
  {
    id: "shifts_platform_capability_used_in_real_workflows",
    axis: "distribution_integration",
    keywords: [
      "api",
      "integration",
      "developer",
      "copilot",
      "workspace",
      "teams",
      "pricing",
      "available",
      "enterprise",
      "workflow"
    ]
  }
];

const MATERIALITY_TERMS = [
  "deploy",
  "deployed",
  "deployment",
  "rollout",
  "implemented",
  "adoption",
  "enterprise",
  "workflow",
  "workers",
  "workforce",
  "pricing",
  "price",
  "subscription",
  "api",
  "access",
  "available",
  "cloud",
  "data center",
  "gpu",
  "compute",
  "policy",
  "regulation",
  "guidelines",
  "roadmap",
  "compliance",
  "bsp",
  "dict",
  "bpo",
  "call center"
];

const GLOBAL_DOWNSTREAM_TERMS = [
  "pricing",
  "price",
  "subscription",
  "api",
  "developer",
  "developers",
  "enterprise",
  "business",
  "workflow",
  "workflows",
  "deployment",
  "available",
  "access",
  "cloud",
  "data center",
  "gpu",
  "chip",
  "compute",
  "copilot",
  "workspace",
  "office",
  "teams",
  "security",
  "privacy",
  "compliance",
  "regulation"
];

const GLOBAL_MATERIAL_DOWNSTREAM_TERMS = [
  "pricing",
  "price",
  "subscription",
  "api",
  "developer",
  "developers",
  "enterprise",
  "deployment",
  "deployed",
  "rollout",
  "access",
  "cloud",
  "data center",
  "gpu",
  "chip",
  "compute",
  "security",
  "privacy",
  "compliance",
  "regulation",
  "sovereign cloud",
  "cost",
  "reliability"
];

const EXCLUSION_RULES: Array<{
  id: string;
  keywords: string[];
}> = [
  {
    id: "generic_ai_hype",
    keywords: [
      "ai will change everything",
      "future of ai",
      "what is ai",
      "could transform",
      "might transform",
      "revolutionize everything"
    ]
  },
  {
    id: "speculative_opinion_without_deployment",
    keywords: [
      "opinion",
      "thought leadership",
      "prediction",
      "predictions",
      "could someday",
      "in the future",
      "will change"
    ]
  },
  {
    id: "funding_without_deployment",
    keywords: [
      "funding",
      "fundraise",
      "raised",
      "valuation",
      "invests",
      "investment",
      "acquire",
      "acquires",
      "acquisition",
      "bought"
    ]
  },
  {
    id: "feature_release_without_real_usage",
    keywords: ["launch", "launches", "released", "new feature", "feature drop", "update"]
  },
  {
    id: "global_news_without_ph_sea_or_downstream_impact",
    keywords: ["openai", "google", "microsoft", "meta", "anthropic", "nvidia"]
  }
];

const HIGH_VALUE_TERMS = [
  "dict",
  "bsp",
  "regulation",
  "rules",
  "guidelines",
  "deployment",
  "rollout",
  "data center",
  "cloud region",
  "sovereign cloud",
  "gpu",
  "bpo",
  "call center",
  "pricing",
  "api"
];

const PLATFORM_VENDOR_TERMS = [
  "openai",
  "anthropic",
  "google",
  "microsoft",
  "meta",
  "nvidia",
  "claude",
  "gemini",
  "chatgpt",
  "codex",
  "copilot",
  "api",
  "model",
  "models",
  "platform",
  "developer",
  "developers",
  "cloud",
  "azure",
  "workspace"
];

const CAPABILITY_WATCH_TERMS = [
  "pricing",
  "price",
  "cost",
  "reliability",
  "api",
  "available",
  "availability",
  "access",
  "model",
  "models",
  "mini",
  "nano",
  "lite",
  "developer",
  "developers",
  "integration",
  "integrated",
  "cloud",
  "infrastructure",
  "foundry",
  "compute",
  "gpu",
  "sovereign cloud"
];

const HARD_MOVEMENT_TERMS = [
  "deploy",
  "deployed",
  "deployment",
  "rollout",
  "implemented",
  "implementation",
  "customer",
  "customers",
  "enterprise",
  "enterprises",
  "data center",
  "cloud region",
  "sovereign cloud",
  "gpu",
  "compute",
  "regulation",
  "regulatory",
  "rules",
  "guidelines",
  "policy",
  "pricing",
  "price",
  "cost",
  "access",
  "security",
  "compliance"
];

const INTERPRETATION_FORMAT_TERMS = [
  "why",
  "how",
  "analysis",
  "commentary",
  "opinion",
  "blind spot",
  "risk",
  "risks",
  "without",
  "remains out of reach",
  "dead",
  "new era",
  "challenge",
  "challenges",
  "barrier",
  "barriers",
  "constraint",
  "constraints",
  "friction",
  "governance",
  "scaling",
  "scale",
  "adoption"
];

const INTERPRETATION_QUALITY_TERMS = [
  "market",
  "businesses",
  "companies",
  "enterprise",
  "enterprises",
  "sector",
  "industry",
  "adoption",
  "constraint",
  "constraints",
  "barrier",
  "barriers",
  "friction",
  "scaling",
  "scale",
  "survey",
  "data",
  "report",
  "singapore",
  "indonesia",
  "malaysia",
  "thailand",
  "vietnam",
  "southeast asia",
  "southeast asias",
  "regional",
  "competition",
  "governance",
  "risk",
  "risks",
  "labour",
  "labor",
  "workforce",
  "cheap labour",
  "organisations",
  "organizations"
];

const LOW_VALUE_INTERPRETATION_TERMS = [
  "prompt tips",
  "tips",
  "tricks",
  "how to use",
  "beginner",
  "guide",
  "list",
  "listicle",
  "motivational",
  "future of ai",
  "ai is the future",
  "what is ai"
];

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsKeyword(text: string, keyword: string): boolean {
  const haystack = normalizeText(text);
  const needle = normalizeText(keyword);

  if (!haystack || !needle) {
    return false;
  }

  return new RegExp(`(^|\\s)${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(
    haystack
  );
}

function matchingTerms(text: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => containsKeyword(text, keyword));
}

function hasAny(text: string, keywords: string[]): boolean {
  return matchingTerms(text, keywords).length > 0;
}

function storyText(story: NormalizedStory): string {
  return `${story.title} ${story.summary ?? ""}`;
}

function detectGeography(story: NormalizedStory): AiTechGeography {
  const text = storyText(story);

  if (hasAny(text, PH_TERMS) || PH_OFFICIAL_SOURCES.includes(story.source)) {
    return "ph";
  }

  if (hasAny(text, SEA_TERMS)) {
    return "sea";
  }

  if (PH_SOURCES.includes(story.source) && !hasAny(text, GLOBAL_PLATFORM_TERMS)) {
    return "ph";
  }

  return "global";
}

function phSeaRelevanceScore(story: NormalizedStory, geography: AiTechGeography): number {
  const text = storyText(story);

  if (geography === "ph") {
    return 6 + matchingTerms(text, PH_TERMS).length;
  }

  if (geography === "sea") {
    return 3 + matchingTerms(text, SEA_TERMS).length;
  }

  return 0;
}

function downstreamRelevance(story: NormalizedStory, geography: AiTechGeography): boolean {
  const text = storyText(story);

  if (geography !== "global") {
    return true;
  }

  return hasAny(text, GLOBAL_DOWNSTREAM_TERMS);
}

function hasGlobalMaterialDownstream(story: NormalizedStory): boolean {
  return hasAny(storyText(story), GLOBAL_MATERIAL_DOWNSTREAM_TERMS);
}

function ruleMatches(story: NormalizedStory): AiTechRuleMatch[] {
  const text = storyText(story);

  return INCLUSION_RULES
    .map((rule) => ({
      id: rule.id,
      axis: rule.axis,
      keywordMatches: matchingTerms(text, rule.keywords)
    }))
    .filter((match) => match.keywordMatches.length > 0);
}

function exclusionMatches(story: NormalizedStory): AiTechRuleMatch[] {
  const text = storyText(story);

  return EXCLUSION_RULES
    .map((rule) => ({
      id: rule.id,
      keywordMatches: matchingTerms(text, rule.keywords)
    }))
    .filter((match) => match.keywordMatches.length > 0);
}

function materialitySignals(story: NormalizedStory): string[] {
  return matchingTerms(storyText(story), MATERIALITY_TERMS);
}

function scoreAxes(matches: AiTechRuleMatch[], story: NormalizedStory): Record<AiTechSystemAxis, number> {
  const text = storyText(story);
  const scores = Object.fromEntries(
    AXIS_PRIORITY.map((axis) => [axis, matchingTerms(text, AXIS_TERMS[axis]).length])
  ) as Record<AiTechSystemAxis, number>;

  for (const match of matches) {
    if (match.axis) {
      scores[match.axis] += 3 + match.keywordMatches.length;
    }
  }

  return scores;
}

function choosePrimaryAxis(scores: Record<AiTechSystemAxis, number>): AiTechSystemAxis | undefined {
  const best = AXIS_PRIORITY
    .map((axis) => ({ axis, score: scores[axis] }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return AXIS_PRIORITY.indexOf(left.axis) - AXIS_PRIORITY.indexOf(right.axis);
    })[0];

  return best.score > 0 ? best.axis : undefined;
}

function isFeatureOnlyGlobalDrop(
  story: NormalizedStory,
  geography: AiTechGeography,
  materiality: string[]
): boolean {
  const text = storyText(story);

  return (
    geography === "global" &&
    hasAny(text, ["launch", "launches", "released", "new feature", "feature drop", "update"]) &&
    materiality.filter((signal) => !["available", "access"].includes(signal)).length === 0
  );
}

function hasConcreteCoreMovement(
  story: NormalizedStory,
  primaryAxis: AiTechSystemAxis | undefined,
  geography: AiTechGeography,
  materiality: string[]
): boolean {
  const text = storyText(story);

  if (
    geography !== "global" &&
    primaryAxis === "policy_regulation" &&
    hasAny(text, ["policy", "regulation", "regulatory", "rules", "guidelines", "roadmap", "dict", "bsp", "dti", "neda"])
  ) {
    return true;
  }

  if (
    primaryAxis === "infrastructure_compute" &&
    hasAny(text, ["data center", "cloud", "gpu", "compute", "telco", "5g", "sovereign cloud", "infrastructure"])
  ) {
    return true;
  }

  if (
    primaryAxis === "enterprise_adoption" &&
    (
      hasAny(text, ["deploy", "deployed", "deployment", "rollout", "implemented", "customer", "enterprise", "enterprises"]) ||
      materiality.includes("deployment") ||
      materiality.includes("enterprise")
    )
  ) {
    return true;
  }

  if (
    primaryAxis === "labor_workflow_impact" &&
    hasAny(text, ["workers", "workforce", "jobs", "bpo", "call center", "workflow", "operations", "customer service"])
  ) {
    return true;
  }

  if (
    hasAny(text, ["pricing", "price", "cost", "access"]) &&
    hasAny(text, ["deployment", "enterprise", "teams", "api", "developers", "workflow", "cloud"])
  ) {
    return true;
  }

  return hasAny(text, HARD_MOVEMENT_TERMS) && geography !== "global";
}

function isCapabilityWatchStory(
  story: NormalizedStory,
  primaryAxis: AiTechSystemAxis | undefined,
  geography: AiTechGeography
): boolean {
  const text = storyText(story);

  return (
    (geography === "global" || hasAny(text, PLATFORM_VENDOR_TERMS)) &&
    (
      primaryAxis === "distribution_integration" ||
      primaryAxis === "models_platforms" ||
      primaryAxis === "infrastructure_compute" ||
      hasAny(text, CAPABILITY_WATCH_TERMS)
    ) &&
    hasAny(text, CAPABILITY_WATCH_TERMS)
  );
}

function hasInterpretationQualityAnchor(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, INTERPRETATION_QUALITY_TERMS) ||
    /\b\d+(?:\.\d+)?\s?(?:%|percent|x|m|b|million|billion)\b/i.test(text)
  );
}

function isInterpretationStory(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, INTERPRETATION_FORMAT_TERMS) &&
    !hasAny(text, LOW_VALUE_INTERPRETATION_TERMS) &&
    hasInterpretationQualityAnchor(story)
  );
}

function isExplicitPlatformUpdate(story: NormalizedStory): boolean {
  const title = story.title;
  const text = storyText(story);
  const vendorSource = ["OpenAI Blog", "Google AI Blog", "Microsoft Blog AI"].includes(story.source);
  const updateTitle =
    hasAny(title, ["pricing", "price", "cost", "api", "apis", "access", "available", "availability", "model", "models", "cloud", "compute", "gpu", "integration", "integrated"]) &&
    hasAny(text, ["introducing", "introduces", "offers", "available", "adds", "new ways", "build with", "announcing", "updates", "tiers", "enterprise", "teams"]);

  return vendorSource || updateTitle;
}

function looksLikeLowQualityInterpretation(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, INTERPRETATION_FORMAT_TERMS) &&
    (
      hasAny(text, LOW_VALUE_INTERPRETATION_TERMS) ||
      !hasInterpretationQualityAnchor(story)
    )
  );
}

function hasHardDeploymentMovement(
  story: NormalizedStory,
  primaryAxis: AiTechSystemAxis | undefined,
  geography: AiTechGeography
): boolean {
  const text = storyText(story);

  if (
    geography !== "global" &&
    primaryAxis === "policy_regulation" &&
    hasAny(text, ["policy", "regulation", "regulatory", "rules", "guidelines", "roadmap", "dict", "bsp", "dti", "neda"])
  ) {
    return true;
  }

  if (
    primaryAxis === "infrastructure_compute" &&
    hasAny(text, ["data center", "cloud region", "sovereign cloud", "gpu", "compute", "telco", "5g", "availability zone"])
  ) {
    return true;
  }

  if (
    primaryAxis === "enterprise_adoption" &&
    (
      hasAny(text, ["deploy", "deployed", "deployment", "rollout", "implemented", "implementation", "customer", "customers"]) ||
      (
        hasAny(text, ["enterprise", "enterprises"]) &&
        hasAny(text, ["workflow", "workflows", "operations", "customer service", "cloud", "agent", "agents", "chatgpt enterprise", "codex"])
      )
    )
  ) {
    return true;
  }

  if (
    primaryAxis === "labor_workflow_impact" &&
    hasAny(text, ["workers", "workforce", "jobs", "bpo", "call center", "workflow", "operations", "customer service"]) &&
    hasAny(text, ["deploy", "deployment", "implemented", "automation", "automate", "training", "reskilling", "upskilling"])
  ) {
    return true;
  }

  return false;
}

function hasGlobalCorePhSeaImpact(
  story: NormalizedStory,
  primaryAxis: AiTechSystemAxis | undefined
): boolean {
  const text = storyText(story);
  const regionalAccessTerms = [
    ...PH_TERMS,
    ...SEA_TERMS,
    "apac",
    "asia pacific",
    "asia-pacific"
  ];
  const regionalRolloutTerms = [
    "rollout",
    "rolled out",
    "launch",
    "launched",
    "available",
    "availability",
    "access",
    "expansion",
    "expanded",
    "opens",
    "opened"
  ];

  if (hasAny(text, PH_TERMS) || hasAny(text, SEA_TERMS)) {
    return true;
  }

  if (
    primaryAxis === "infrastructure_compute" &&
    hasAny(text, ["cloud region", "availability zone", "sovereign cloud", "data residency", "data center", "compute region"]) &&
    hasAny(text, regionalAccessTerms)
  ) {
    return true;
  }

  if (
    hasAny(text, ["pricing", "price", "cost", "access", "available", "availability"]) &&
    hasAny(text, regionalAccessTerms)
  ) {
    return true;
  }

  if (
    hasAny(text, ["bpo", "call center", "contact center", "offshoring", "outsourcing", "telco", "telecom", "bank", "banks", "banking", "remittance", "fintech"]) &&
    hasAny(text, ["deploy", "deployed", "deployment", "rollout", "implemented", "workflow", "operations", "customer service", "access", "pricing"])
  ) {
    return true;
  }

  if (
    hasAny(text, regionalAccessTerms) &&
    hasAny(text, regionalRolloutTerms)
  ) {
    return true;
  }

  return false;
}

function assignAiTechEditorialBucket(
  story: NormalizedStory,
  primaryAxis: AiTechSystemAxis | undefined,
  geography: AiTechGeography,
  materiality: string[]
): AiTechEditorialBucket {
  const text = storyText(story);
  const coreMovement = hasConcreteCoreMovement(story, primaryAxis, geography, materiality);
  const capabilityWatch = isCapabilityWatchStory(story, primaryAxis, geography);
  const interpretation = isInterpretationStory(story);
  const hardDeploymentMovement = hasHardDeploymentMovement(story, primaryAxis, geography);
  const coreCandidate = coreMovement || hardDeploymentMovement;
  const platformOnlyCapability =
    capabilityWatch &&
    !hardDeploymentMovement &&
    isExplicitPlatformUpdate(story) &&
    (
      geography === "global" ||
      hasAny(text, PLATFORM_VENDOR_TERMS)
    );

  if (interpretation && !isExplicitPlatformUpdate(story)) {
    return "interpretation";
  }

  if (platformOnlyCapability) {
    return "capability_watch";
  }

  if (geography === "global" && coreCandidate) {
    if (!hasGlobalCorePhSeaImpact(story, primaryAxis) || capabilityWatch) {
      return "capability_watch";
    }
  }

  if (interpretation && (geography !== "global" || !hardDeploymentMovement)) {
    return "interpretation";
  }

  if (coreCandidate) {
    return "core_signal";
  }

  if (capabilityWatch) {
    return "capability_watch";
  }

  if (interpretation) {
    return "interpretation";
  }

  if (geography === "global") {
    return "capability_watch";
  }

  return "core_signal";
}

export function classifyAiTechStory(story: NormalizedStory): AiTechClassification {
  const text = storyText(story);
  const geography = detectGeography(story);
  const phSeaScore = phSeaRelevanceScore(story, geography);
  const downstream = downstreamRelevance(story, geography);
  const inclusionMatches = ruleMatches(story);
  const exclusionRuleMatches = exclusionMatches(story);
  const materiality = materialitySignals(story);
  const axisScores = scoreAxes(inclusionMatches, story);
  const primaryAxis = choosePrimaryAxis(axisScores);
  const editorialBucket = assignAiTechEditorialBucket(
    story,
    primaryAxis,
    geography,
    materiality
  );
  const failsInterpretationQuality = looksLikeLowQualityInterpretation(story);
  const hasAiSignal = hasAny(text, AI_ANCHOR_TERMS);
  const passesGlobalGate =
    geography !== "global" ||
    hasGlobalMaterialDownstream(story) ||
    hasAny(text, SEA_TERMS);
  const passesInclusion = hasAiSignal && inclusionMatches.length > 0 && downstream && passesGlobalGate;
  const hardExcluded =
    !hasAiSignal ||
    !downstream ||
    !passesGlobalGate ||
    isFeatureOnlyGlobalDrop(story, geography, materiality) ||
    (
      geography === "global" &&
      !downstream &&
      exclusionRuleMatches.some((match) => match.id === "global_news_without_ph_sea_or_downstream_impact")
    ) ||
    (
      exclusionRuleMatches.some((match) => match.id === "generic_ai_hype") &&
      materiality.length === 0
    ) ||
    (
      geography === "global" &&
      exclusionRuleMatches.some((match) => match.id === "global_news_without_ph_sea_or_downstream_impact") &&
      materiality.length === 0
    ) ||
    (
      exclusionRuleMatches.some((match) => match.id === "funding_without_deployment") &&
      !hasAny(text, ["deploy", "deployment", "rollout", "customer", "enterprise"])
    ) ||
    (
      exclusionRuleMatches.some((match) => match.id === "speculative_opinion_without_deployment") &&
      materiality.length < 2
    ) ||
    failsInterpretationQuality;
  const highValue =
    phSeaScore >= 6 ||
    hasAny(text, HIGH_VALUE_TERMS) ||
    inclusionMatches.length >= 2;
  const importanceTier: AiTechImportanceTier = hardExcluded || !passesInclusion
    ? "low_auto_exclude"
    : highValue
      ? "high"
      : "medium";

  return {
    primaryAxis,
    editorialBucket,
    axisScores,
    geography,
    downstreamRelevance: downstream,
    phSeaRelevanceScore: phSeaScore,
    inclusionMatches,
    exclusionMatches: exclusionRuleMatches,
    materialitySignals: materiality,
    hardExcluded,
    passesInclusion,
    importanceTier,
    failsInterpretationQuality
  };
}

export function summarizeAiTechClassification(
  classification: AiTechClassification
): AiTechFilterSummary {
  return {
    primary_axis: classification.primaryAxis,
    editorial_bucket: classification.editorialBucket,
    geography: classification.geography,
    downstream_relevance: classification.downstreamRelevance,
    importance_tier: classification.importanceTier,
    inclusion_rule_ids: classification.inclusionMatches.map((match) => match.id),
    exclusion_rule_ids: classification.exclusionMatches.map((match) => match.id),
    ph_sea_relevance_score: classification.phSeaRelevanceScore,
    materiality_signals: classification.materialitySignals
  };
}

export function evaluateAiTechRelevance(story: NormalizedStory): {
  kept: boolean;
  classification: AiTechClassification;
  drop?: StoryDrop;
} {
  const classification = classifyAiTechStory(story);
  const summary = summarizeAiTechClassification(classification);

  if (classification.passesInclusion && !classification.hardExcluded) {
    return {
      kept: true,
      classification
    };
  }

  const details = classification.hardExcluded
    ? `Matched AI/Tech exclusion gate: ${summary.exclusion_rule_ids.join(", ") || "no_ai_or_no_downstream_relevance"}`
    : "Did not change understanding of PH/SEA AI policy, adoption, workflow impact, infrastructure, distribution, or platform capability used in real workflows";

  return {
    kept: false,
    classification,
    drop: {
      source: story.source,
      title: story.title,
      url: story.url,
      date: story.publishedAt,
      reason: "low_relevance",
      details,
      ai_tech_filter: summary
    }
  };
}
