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
  "digital_policy_regulation",
  "cybersecurity",
  "telecom_connectivity",
  "data_centers_infrastructure",
  "enterprise_technology",
  "ai_automation",
  "startups_vc",
  "consumer_technology"
];

const PH_SOURCES = [
  "BusinessWorld AI/Tech",
  "Inquirer Tech",
  "Inquirer Business AI/Tech",
  "Philippine Star Tech",
  "Philippine Star Business AI/Tech",
  "Malaya Business AI/Tech",
  "Department of Information and Communications Technology AI Policy",
  "Department of Trade and Industry AI Economy",
  "NEDA Digital Economy",
  "IBPAP IT-BPM AI Transition",
  "Philippine Economic Zone Authority Digital Infrastructure",
  "Board of Investments Digital Economy",
  "Department of Labor and Employment Workforce Transition",
  "TESDA Skills and Workforce Transition",
  "Bangko Sentral ng Pilipinas AI/Tech"
];

const PH_OFFICIAL_SOURCES = [
  "Department of Information and Communications Technology AI Policy",
  "Department of Trade and Industry AI Economy",
  "NEDA Digital Economy",
  "Philippine Economic Zone Authority Digital Infrastructure",
  "Board of Investments Digital Economy",
  "Department of Labor and Employment Workforce Transition",
  "TESDA Skills and Workforce Transition",
  "Bangko Sentral ng Pilipinas AI/Tech"
];

const TRUSTED_SOFT_AI_SOURCES = [
  ...PH_OFFICIAL_SOURCES,
  "IBPAP IT-BPM AI Transition",
  "ASEAN Digital Economy and AI Governance",
  "ERIA Digital Economy",
  "Asian Development Bank Digital Economy"
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

const MAJOR_TECH_VENDOR_TERMS = [
  ...GLOBAL_PLATFORM_TERMS,
  "apple",
  "amazon",
  "aws",
  "oracle",
  "salesforce",
  "sap",
  "servicenow",
  "cisco",
  "dell",
  "huawei",
  "samsung"
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
  "npc",
  "national privacy commission",
  "peza",
  "pldt",
  "globe",
  "dito",
  "converge",
  "smart",
  "gcash",
  "maya",
  "bpo",
  "it-bpm",
  "it bpm",
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
  ai_automation: [
    ...AI_ANCHOR_TERMS,
    "workflow automation",
    "robotic process automation",
    "rpa",
    "agentic",
    "agents"
  ],
  enterprise_technology: [
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
    "back office",
    "cloud migration",
    "erp",
    "crm",
    "sap",
    "salesforce",
    "oracle",
    "servicenow",
    "digital transformation",
    "productivity tools",
    "software as a service",
    "saas"
  ],
  digital_policy_regulation: [
    "law",
    "laws",
    "legislation",
    "bill",
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
    "data privacy",
    "national privacy commission",
    "npc",
    "cybersecurity",
    "cyber resilience",
    "deepfake",
    "deepfakes",
    "disinformation",
    "troll farm",
    "troll farms",
    "compliance",
    "dict",
    "bsp",
    "dti",
    "neda",
    "government"
  ],
  telecom_connectivity: [
    "pldt",
    "globe",
    "dito",
    "converge",
    "smart",
    "telco",
    "telecom",
    "5g",
    "broadband",
    "fiber",
    "fiber optic",
    "network expansion",
    "network rollout",
    "subsea cable",
    "submarine cable",
    "tower",
    "towers",
    "connectivity",
    "internet service",
    "coverage"
  ],
  cybersecurity: [
    "cybersecurity",
    "cyberattack",
    "cyber attack",
    "data breach",
    "breach",
    "ransomware",
    "malware",
    "phishing",
    "security incident",
    "security regulation",
    "enterprise security",
    "national cyber policy",
    "cyber resilience",
    "zero trust",
    "vulnerability",
    "hacked",
    "hackers"
  ],
  data_centers_infrastructure: [
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
    "subsea cable",
    "submarine cable",
    "fiber",
    "sovereign cloud",
    "region",
    "availability zone",
    "power requirement",
    "power requirements",
    "energy demand",
    "semiconductor supply chain"
  ],
  startups_vc: [
    "startup",
    "startups",
    "venture capital",
    "vc",
    "funding",
    "fundraise",
    "funding round",
    "seed round",
    "series a",
    "series b",
    "acquisition",
    "acquires",
    "merger",
    "ecosystem development",
    "entrepreneurship",
    "valuation"
  ],
  consumer_technology: [
    "smartphone",
    "smartphones",
    "laptop",
    "laptops",
    "wearable",
    "wearables",
    "gaming hardware",
    "consumer electronics",
    "device",
    "devices",
    "gadget",
    "gadgets",
    "market share",
    "shipments",
    "adoption",
    "consumer behavior",
    "ecosystem",
    "app store",
    "mobile payments"
  ]
};

const INCLUSION_RULES: Array<{
  id: string;
  axis: AiTechSystemAxis;
  keywords: string[];
}> = [
  {
    id: "affects_digital_policy_or_regulation",
    axis: "digital_policy_regulation",
    keywords: AXIS_TERMS.digital_policy_regulation
  },
  {
    id: "shows_enterprise_technology_adoption_or_deployment",
    axis: "enterprise_technology",
    keywords: AXIS_TERMS.enterprise_technology
  },
  {
    id: "changes_ai_automation_or_workflows",
    axis: "ai_automation",
    keywords: AXIS_TERMS.ai_automation
  },
  {
    id: "changes_data_center_cloud_or_compute_capacity",
    axis: "data_centers_infrastructure",
    keywords: AXIS_TERMS.data_centers_infrastructure
  },
  {
    id: "expands_telecom_or_connectivity_access",
    axis: "telecom_connectivity",
    keywords: AXIS_TERMS.telecom_connectivity
  },
  {
    id: "shows_cybersecurity_incident_or_resilience_shift",
    axis: "cybersecurity",
    keywords: AXIS_TERMS.cybersecurity
  },
  {
    id: "reflects_regional_competition_asean_positioning",
    axis: "digital_policy_regulation",
    keywords: ["asean", "southeast asia", "regional", "competition", "investment", "roadmap"]
  },
  {
    id: "signals_startup_vc_or_technology_investment",
    axis: "startups_vc",
    keywords: AXIS_TERMS.startups_vc
  },
  {
    id: "changes_consumer_technology_behavior_or_market_structure",
    axis: "consumer_technology",
    keywords: [
      ...AXIS_TERMS.consumer_technology,
      "market shift",
      "market share",
      "consumer adoption",
      "shipments",
      "ecosystem change",
      "industry direction"
    ]
  }
];

const SOFT_AI_POLICY_ECONOMY_TERMS = [
  "digital economy",
  "digital transformation",
  "ai readiness",
  "trusted technology",
  "trusted technologies",
  "responsible technology",
  "responsible technologies",
  "workforce transition",
  "sovereign cloud",
  "cyber resilience",
  "digital resilience",
  "digital infrastructure",
  "interoperability",
  "data governance",
  "digital public infrastructure",
  "digital government",
  "egov",
  "egovph",
  "cloud",
  "erp",
  "crm",
  "broadband",
  "5g",
  "telecom",
  "connectivity",
  "cybersecurity",
  "data privacy",
  "data center",
  "defa",
  "digital economy framework agreement",
  "adgmin",
  "ammsti",
  "it-bpm",
  "it bpm",
  "global capability center",
  "global capability centres"
];

const SOFT_AI_MATERIALITY_TERMS = [
  "roadmap",
  "framework",
  "implementation",
  "implemented",
  "implementing",
  "investment",
  "funding",
  "budget",
  "procurement",
  "deployment",
  "rollout",
  "workforce",
  "workers",
  "jobs",
  "msme",
  "msmes",
  "bpo",
  "it-bpm",
  "it bpm",
  "contact center",
  "call center",
  "data center",
  "datacenter",
  "subsea cable",
  "submarine cable",
  "cloud region",
  "sovereign cloud",
  "5g",
  "broadband",
  "fiber",
  "network expansion",
  "cybersecurity",
  "data breach",
  "ransomware",
  "data privacy",
  "npc",
  "national privacy commission",
  "erp",
  "crm",
  "cloud migration",
  "skills",
  "reskilling",
  "upskilling",
  "regulation",
  "regulatory",
  "rules",
  "guidelines",
  "adoption",
  "targets",
  "timeline",
  "deadline",
  "standards",
  "compliance",
  "operational",
  "operations",
  "market share",
  "shipments",
  "consumer behavior"
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
  "datacenter",
  "cloud region",
  "5g",
  "broadband",
  "fiber",
  "submarine cable",
  "subsea cable",
  "network expansion",
  "cybersecurity",
  "data breach",
  "ransomware",
  "security incident",
  "policy",
  "law",
  "legislation",
  "regulation",
  "guidelines",
  "roadmap",
  "framework",
  "implementation",
  "investment",
  "funding",
  "budget",
  "procurement",
  "compliance",
  "bsp",
  "dict",
  "bpo",
  "it-bpm",
  "it bpm",
  "call center",
  "contact center",
  "msme",
  "msmes",
  "skills",
  "reskilling",
  "upskilling",
  "data governance",
  "digital infrastructure",
  "subsea cable",
  "sovereign cloud",
  "cyber resilience",
  "market share",
  "shipments",
  "consumer behavior"
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
  "datacenter",
  "5g",
  "broadband",
  "cybersecurity",
  "data breach",
  "ransomware",
  "erp",
  "crm",
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
  "regulation",
  "market share",
  "shipments",
  "consumer behavior"
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
  "reliability",
  "5g",
  "broadband",
  "cybersecurity",
  "data breach",
  "ransomware",
  "adoption",
  "market share",
  "shipments"
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
    id: "routine_gadget_launch_without_market_shift",
    keywords: ["smartphone", "laptop", "wearable", "gadget", "device", "launch", "unveils", "now available"]
  },
  {
    id: "benchmark_or_minor_model_update_without_impact",
    keywords: ["benchmark", "eval", "evaluation", "minor update", "new model", "model update"]
  },
  {
    id: "vendor_marketing_without_measurable_impact",
    keywords: ["introducing", "announcing", "showcase", "leader", "award", "recognized", "magic quadrant"]
  },
  {
    id: "global_news_without_ph_sea_or_downstream_impact",
    keywords: MAJOR_TECH_VENDOR_TERMS
  }
];

const HIGH_VALUE_TERMS = [
  "dict",
  "dti",
  "neda",
  "defa",
  "adgmin",
  "ammsti",
  "bsp",
  "regulation",
  "rules",
  "guidelines",
  "framework",
  "roadmap",
  "deployment",
  "rollout",
  "implementation",
  "data center",
  "datacenter",
  "subsea cable",
  "submarine cable",
  "cloud region",
  "sovereign cloud",
  "5g",
  "broadband",
  "fiber",
  "network expansion",
  "cybersecurity",
  "data breach",
  "ransomware",
  "security incident",
  "npc",
  "data privacy",
  "erp",
  "crm",
  "gpu",
  "bpo",
  "it-bpm",
  "it bpm",
  "call center",
  "contact center",
  "workforce transition",
  "reskilling",
  "upskilling",
  "pricing",
  "api",
  "market share",
  "shipments",
  "consumer behavior"
];

const LOW_SIGNAL_GOVERNMENT_TERMS = [
  "ceremonial",
  "ceremony",
  "courtesy call",
  "keynote",
  "speech",
  "message of support",
  "awareness campaign",
  "webinar",
  "workshop",
  "forum",
  "roundtable",
  "celebrates",
  "celebrated",
  "commends",
  "vows",
  "urges",
  "calls for",
  "highlights",
  "underscores",
  "promotes",
  "lauds",
  "joins"
];

const HARD_PUBLIC_SECTOR_MATERIALITY_TERMS = [
  "funding",
  "budget",
  "procurement",
  "deployment",
  "deployed",
  "rollout",
  "implemented",
  "implementation",
  "investment",
  "regulation",
  "regulatory",
  "law",
  "legislation",
  "rules",
  "guidelines",
  "framework",
  "roadmap",
  "standards",
  "data center",
  "datacenter",
  "subsea cable",
  "submarine cable",
  "cloud region",
  "sovereign cloud",
  "5g",
  "broadband",
  "fiber",
  "network expansion",
  "cybersecurity",
  "data breach",
  "ransomware",
  "security incident",
  "skills",
  "reskilling",
  "upskilling",
  "adoption",
  "target",
  "targets",
  "deadline",
  "timeline",
  "pilot",
  "pilots",
  "launched",
  "launches"
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

function isTrustedSoftAiSource(source: string): boolean {
  return TRUSTED_SOFT_AI_SOURCES.includes(source);
}

function trustedSoftAiTransitionMatch(story: NormalizedStory): AiTechRuleMatch | undefined {
  if (!isTrustedSoftAiSource(story.source)) {
    return undefined;
  }

  const text = storyText(story);
  const softMatches = matchingTerms(text, SOFT_AI_POLICY_ECONOMY_TERMS);
  const materialityMatches = matchingTerms(text, SOFT_AI_MATERIALITY_TERMS);

  if (softMatches.length === 0 || materialityMatches.length === 0) {
    return undefined;
  }

  return {
    id: "trusted_source_policy_economic_transition",
    axis: hasAny(text, ["workforce", "jobs", "skills", "reskilling", "upskilling", "bpo", "it-bpm", "it bpm", "contact center", "call center"])
      ? "ai_automation"
      : hasAny(text, ["data center", "datacenter", "subsea cable", "submarine cable", "cloud region", "sovereign cloud", "digital infrastructure"])
        ? "data_centers_infrastructure"
        : hasAny(text, ["5g", "broadband", "fiber", "connectivity", "telecom", "telco"])
          ? "telecom_connectivity"
          : hasAny(text, ["cybersecurity", "data breach", "ransomware", "cyber resilience"])
            ? "cybersecurity"
            : "digital_policy_regulation",
    keywordMatches: [...new Set([...softMatches, ...materialityMatches])]
  };
}

function hasTrustedSoftAiTransitionSignal(story: NormalizedStory): boolean {
  return trustedSoftAiTransitionMatch(story) !== undefined;
}

function isLowMaterialityPublicSectorNoise(story: NormalizedStory): boolean {
  if (!isTrustedSoftAiSource(story.source)) {
    return false;
  }

  const text = storyText(story);

  return (
    hasAny(text, LOW_SIGNAL_GOVERNMENT_TERMS) &&
    !hasAny(text, HARD_PUBLIC_SECTOR_MATERIALITY_TERMS) &&
    !/\b\d+(?:\.\d+)?\s?(?:%|percent|m|b|million|billion|php|p|us\$|\$)\b/i.test(text)
  );
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
  const softAiTransitionMatch = trustedSoftAiTransitionMatch(story);

  const matches: AiTechRuleMatch[] = INCLUSION_RULES
    .map((rule) => ({
      id: rule.id,
      axis: rule.axis,
      keywordMatches: matchingTerms(text, rule.keywords)
    }))
    .filter((match) => match.keywordMatches.length > 0);

  if (softAiTransitionMatch) {
    matches.push(softAiTransitionMatch);
  }

  return matches;
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
    primaryAxis === "digital_policy_regulation" &&
    hasAny(text, ["policy", "law", "legislation", "bill", "regulation", "regulatory", "rules", "guidelines", "roadmap", "dict", "bsp", "dti", "neda", "npc"])
  ) {
    return true;
  }

  if (
    primaryAxis === "data_centers_infrastructure" &&
    hasAny(text, ["data center", "datacenter", "cloud", "gpu", "compute", "sovereign cloud", "infrastructure", "availability zone", "power requirement"])
  ) {
    return true;
  }

  if (
    primaryAxis === "telecom_connectivity" &&
    hasAny(text, ["pldt", "globe", "dito", "converge", "5g", "broadband", "fiber", "submarine cable", "subsea cable", "network expansion", "coverage"])
  ) {
    return true;
  }

  if (
    primaryAxis === "cybersecurity" &&
    hasAny(text, ["data breach", "ransomware", "cyberattack", "security incident", "cybersecurity", "vulnerability", "national cyber policy", "cyber resilience"])
  ) {
    return true;
  }

  if (
    primaryAxis === "enterprise_technology" &&
    (
      hasAny(text, ["deploy", "deployed", "deployment", "rollout", "implemented", "customer", "enterprise", "enterprises"]) ||
      materiality.includes("deployment") ||
      materiality.includes("enterprise")
    )
  ) {
    return true;
  }

  if (
    primaryAxis === "ai_automation" &&
    hasAny(text, ["workers", "workforce", "jobs", "bpo", "call center", "workflow", "operations", "customer service", "automation", "automate"])
  ) {
    return true;
  }

  if (
    primaryAxis === "consumer_technology" &&
    hasAny(text, ["market share", "shipments", "consumer behavior", "adoption", "ecosystem", "mobile payments", "industry direction"])
  ) {
    return true;
  }

  if (
    primaryAxis === "startups_vc" &&
    hasAny(text, ["funding", "investment", "acquisition", "startup", "venture capital"]) &&
    hasAny(text, ["enterprise", "infrastructure", "adoption", "customers", "ecosystem", "market", "southeast asia", "philippines"])
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
      primaryAxis === "ai_automation" ||
      primaryAxis === "enterprise_technology" ||
      primaryAxis === "data_centers_infrastructure" ||
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
    primaryAxis === "digital_policy_regulation" &&
    hasAny(text, ["policy", "law", "legislation", "bill", "regulation", "regulatory", "rules", "guidelines", "roadmap", "dict", "bsp", "dti", "neda", "npc"])
  ) {
    return true;
  }

  if (
    primaryAxis === "data_centers_infrastructure" &&
    hasAny(text, ["data center", "datacenter", "cloud region", "sovereign cloud", "gpu", "compute", "availability zone", "power requirement"])
  ) {
    return true;
  }

  if (
    primaryAxis === "telecom_connectivity" &&
    hasAny(text, ["5g", "broadband", "fiber", "submarine cable", "subsea cable", "network expansion", "coverage", "pldt", "globe", "dito", "converge"])
  ) {
    return true;
  }

  if (
    primaryAxis === "cybersecurity" &&
    hasAny(text, ["data breach", "ransomware", "cyberattack", "security incident", "cybersecurity", "vulnerability", "cyber resilience"])
  ) {
    return true;
  }

  if (
    primaryAxis === "enterprise_technology" &&
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
    primaryAxis === "ai_automation" &&
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
    primaryAxis === "data_centers_infrastructure" &&
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

function hasTechnologyDomainSignal(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, AI_ANCHOR_TERMS) ||
    hasAny(text, [
      "cloud",
      "erp",
      "crm",
      "enterprise software",
      "digital transformation",
      "telecom",
      "telco",
      "5g",
      "broadband",
      "fiber",
      "submarine cable",
      "subsea cable",
      "data center",
      "datacenter",
      "cybersecurity",
      "data breach",
      "ransomware",
      "data privacy",
      "digital economy",
      "digital government",
      "startup",
      "venture capital",
      "smartphone",
      "smartphones",
      "laptop",
      "laptops",
      "wearable",
      "wearables",
      "consumer electronics"
    ]) ||
    hasTrustedSoftAiTransitionSignal(story)
  );
}

function hasSystemicImportance(
  story: NormalizedStory,
  primaryAxis: AiTechSystemAxis | undefined,
  geography: AiTechGeography,
  materiality: string[],
  inclusionMatches: AiTechRuleMatch[]
): boolean {
  const text = storyText(story);

  return (
    hasConcreteCoreMovement(story, primaryAxis, geography, materiality) ||
    hasHardDeploymentMovement(story, primaryAxis, geography) ||
    inclusionMatches.length >= 2 ||
    hasAny(text, [
      "deployment",
      "rollout",
      "implemented",
      "implementation",
      "enterprise adoption",
      "business operations",
      "government services",
      "public services",
      "regulation",
      "rules",
      "law",
      "legislation",
      "data breach",
      "ransomware",
      "cyberattack",
      "security incident",
      "network expansion",
      "5g",
      "broadband",
      "submarine cable",
      "data center",
      "cloud region",
      "investment",
      "funding",
      "market share",
      "shipments",
      "consumer behavior",
      "adoption trend"
    ])
  );
}

function isRoutineProductOrVendorAnnouncement(
  story: NormalizedStory,
  primaryAxis: AiTechSystemAxis | undefined,
  materiality: string[]
): boolean {
  const text = storyText(story);
  const routineLaunch =
    hasAny(text, ["launch", "launches", "launched", "unveils", "introduces", "released", "now available"]) &&
    (
      primaryAxis === "consumer_technology" ||
      hasAny(text, ["smartphone", "laptop", "wearable", "gadget", "device", "feature", "new model"])
    );
  const minorAiUpdate =
    hasAny(text, ["benchmark", "eval", "evaluation", "minor update", "model update", "new model"]) &&
    !hasAny(text, ["deployment", "enterprise", "customers", "pricing", "security", "regulation", "infrastructure", "market share"]);
  const vendorMarketing =
    hasAny(text, ["award", "recognized", "leader", "showcase", "announcing", "introducing"]) &&
    hasAny(text, MAJOR_TECH_VENDOR_TERMS) &&
    !hasAny(text, ["customer", "customers", "deployment", "rollout", "adoption", "market share", "regulation", "data center", "security incident"]);
  const broaderImpact =
    materiality.some((signal) =>
      [
        "deployment",
        "rollout",
        "implemented",
        "investment",
        "funding",
        "regulation",
        "data breach",
        "ransomware",
        "network expansion",
        "market share",
        "shipments",
        "consumer behavior",
        "data center",
        "cloud region"
      ].includes(signal)
    ) ||
    hasAny(text, ["market share", "shipments", "consumer behavior", "adoption trend", "enterprise deployment", "government rollout", "policy impact"]);

  return (routineLaunch || minorAiUpdate || vendorMarketing) && !broaderImpact;
}

function explicitlySaysNoMaterialAction(story: NormalizedStory): boolean {
  const text = normalizeText(storyText(story));

  return (
    text.includes("no deployment") ||
    text.includes("no rollout") ||
    text.includes("no implementation") ||
    text.includes("no budget") ||
    text.includes("no funding") ||
    text.includes("no pricing") ||
    text.includes("no market share") ||
    text.includes("no adoption") ||
    text.includes("no ecosystem impact") ||
    text.includes("no named framework") ||
    text.includes("announced no")
  );
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
  const hasTechSignal = hasTechnologyDomainSignal(story);
  const hasSystemicSignal = hasSystemicImportance(
    story,
    primaryAxis,
    geography,
    materiality,
    inclusionMatches
  );
  const routineProductOrVendorAnnouncement = isRoutineProductOrVendorAnnouncement(
    story,
    primaryAxis,
    materiality
  );
  const noMaterialAction = explicitlySaysNoMaterialAction(story);
  const lowMaterialityPublicSectorNoise = isLowMaterialityPublicSectorNoise(story);
  const passesGlobalGate =
    geography !== "global" ||
    hasGlobalMaterialDownstream(story) ||
    hasAny(text, SEA_TERMS);
  const passesInclusion =
    hasTechSignal &&
    hasSystemicSignal &&
    inclusionMatches.length > 0 &&
    downstream &&
    passesGlobalGate;
  const hardExcluded =
    !hasTechSignal ||
    !hasSystemicSignal ||
    noMaterialAction ||
    routineProductOrVendorAnnouncement ||
    lowMaterialityPublicSectorNoise ||
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
      !hasAny(text, ["deploy", "deployment", "rollout", "customer", "enterprise", "implementation", "roadmap", "framework", "data center", "subsea cable", "submarine cable", "skills", "workforce", "market", "ecosystem", "infrastructure"])
    ) ||
    (
      exclusionRuleMatches.some((match) => match.id === "speculative_opinion_without_deployment") &&
      materiality.length < 2
    ) ||
    failsInterpretationQuality;
  const highValue =
    phSeaScore >= 6 ||
    hasAny(text, HIGH_VALUE_TERMS) ||
    inclusionMatches.length >= 2 ||
    hasSystemicSignal;
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
    ? `Matched Technology / Digital Economy exclusion gate: ${summary.exclusion_rule_ids.join(", ") || "no_technology_or_no_systemic_relevance"}`
    : "Did not change how people, businesses, or governments use technology through adoption, infrastructure, connectivity, cybersecurity, regulation, investment, or consumer behavior";

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
