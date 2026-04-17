import type {
  NormalizedStory,
  PropertyEditorialBucket,
  PropertyFilterSummary,
  PropertyGeography,
  PropertySystemAxis,
  StoryDrop
} from "./types.js";

type PropertyImportanceTier = "high" | "medium" | "low_auto_exclude";

type PropertyRuleMatch = {
  id: string;
  axis?: PropertySystemAxis;
  keywordMatches: string[];
};

export type PropertyClassification = {
  primaryAxis?: PropertySystemAxis;
  editorialBucket: PropertyEditorialBucket;
  axisScores: Record<PropertySystemAxis, number>;
  geography: PropertyGeography;
  downstreamRelevance: boolean;
  phRelevanceScore: number;
  inclusionMatches: PropertyRuleMatch[];
  exclusionMatches: PropertyRuleMatch[];
  materialitySignals: string[];
  stressSignal: boolean;
  hardExcluded: boolean;
  passesInclusion: boolean;
  importanceTier: PropertyImportanceTier;
};

const AXIS_PRIORITY: PropertySystemAxis[] = [
  "stress_signals",
  "demand_affordability",
  "capital_flows",
  "policy_regulation",
  "supply_development",
  "usage_patterns"
];

const PH_SOURCES = [
  "Bangko Sentral ng Pilipinas Property",
  "Santos Knight Frank Market Reports",
  "Department of Finance Property",
  "BusinessWorld Property",
  "BusinessMirror Property",
  "Inquirer Business Property",
  "Philippine Star Property",
  "Malaya Business Property"
];

const PH_OFFICIAL_SOURCES = [
  "Bangko Sentral ng Pilipinas Property",
  "Department of Finance Property"
];

const PH_TERMS = [
  "philippines",
  "philippine",
  "filipino",
  "filipinos",
  "metro manila",
  "manila",
  "luzon",
  "visayas",
  "mindanao",
  "cebu",
  "davao",
  "quezon city",
  "makati",
  "taguig",
  "bgc",
  "bonifacio global city",
  "ortigas",
  "dhsud",
  "bsp",
  "bangko sentral",
  "neda",
  "dof",
  "psa",
  "peso",
  "php"
];

const SEA_TERMS = [
  "asean",
  "southeast asia",
  "south east asia",
  "singapore",
  "indonesia",
  "malaysia",
  "thailand",
  "vietnam",
  "regional"
];

const PROPERTY_ANCHOR_TERMS = [
  "property",
  "real estate",
  "housing",
  "residential",
  "condominium",
  "condo",
  "office",
  "retail",
  "mall",
  "hotel",
  "hotels",
  "hospitality",
  "industrial",
  "logistics",
  "warehouse",
  "land",
  "township",
  "developer",
  "developers",
  "leasing",
  "lease",
  "rent",
  "rental",
  "reit",
  "reits",
  "mortgage",
  "mortgage lending",
  "housing loan",
  "housing loans",
  "housing lending",
  "housing credit",
  "home financing",
  "home loan",
  "home loans",
  "home lending",
  "real estate lending",
  "residential real estate lending",
  "construction"
];

const HOUSING_CREDIT_TERMS = [
  "home financing",
  "green home financing",
  "home loan",
  "home loans",
  "home lending",
  "mortgage",
  "mortgages",
  "mortgage lending",
  "housing loan",
  "housing loans",
  "housing lending",
  "green housing lending",
  "housing credit",
  "property credit",
  "real estate lending",
  "residential real estate lending",
  "residential property lending",
  "housing finance",
  "housing financing",
  "home buyers",
  "homebuyers"
];

const PROPERTY_CREDIT_POLICY_TERMS = [
  "capital charge",
  "capital charges",
  "capital requirement",
  "capital requirements",
  "lower capital charge",
  "lower capital requirement",
  "reduced capital charge",
  "reduced capital requirement",
  "policy",
  "regulation",
  "regulatory",
  "lending rule",
  "lending rules",
  "financing incentive",
  "financing incentives",
  "credit incentive",
  "credit incentives",
  "prudential",
  "risk weight",
  "risk weights",
  "reserve requirement",
  "bsp",
  "bangko sentral",
  "regulator"
];

const PROPERTY_FINANCING_ANCHOR_TERMS = [
  "property",
  "real estate",
  "housing",
  "residential",
  "residential property",
  "condominium",
  "condo",
  "office",
  "retail",
  "mall",
  "industrial real estate",
  "warehouse",
  "land",
  "township",
  "leasing",
  "lease",
  "rent",
  "rental",
  "reit",
  "reits",
  "construction",
  ...HOUSING_CREDIT_TERMS
];

const GENERIC_PROJECT_FINANCE_TERMS = [
  "solar farm",
  "solar power",
  "power project",
  "renewable energy",
  "energy portfolio",
  "green energy",
  "wind farm",
  "hydro project",
  "generation project"
];

const HOTEL_HOSPITALITY_ADJACENCY_TERMS = [
  "hotel",
  "hotels",
  "hotel operators",
  "hospitality",
  "hospitality industry",
  "tourism",
  "tourist arrivals"
];

const HOTEL_HOSPITALITY_OPERATING_PRESSURE_TERMS = [
  "energy costs",
  "fuel costs",
  "airfares",
  "flights",
  "airline",
  "airlines",
  "travel demand",
  "hotel demand",
  "operators",
  "operating costs",
  "costs weigh",
  "energy crisis"
];

const HOTEL_PROPERTY_USAGE_EVIDENCE_TERMS = [
  "hotel occupancy",
  "occupancy rate",
  "occupancy rates",
  "room rates",
  "average daily rate",
  "adr",
  "revpar",
  "rental rates",
  "lease rates",
  "vacancy",
  "leasing",
  "property utilization",
  "room supply",
  "hotel supply",
  "pipeline",
  "new rooms",
  "keys"
];

const AXIS_TERMS: Record<PropertySystemAxis, string[]> = {
  capital_flows: [
    "home financing",
    "green home financing",
    "home loan",
    "home loans",
    "housing loan",
    "housing loans",
    "housing lending",
    "green housing lending",
    "housing credit",
    "mortgage",
    "mortgages",
    "mortgage lending",
    "real estate lending",
    "residential real estate lending",
    "bank lending",
    "lending",
    "credit",
    "interest rate",
    "interest rates",
    "rate hike",
    "rate cut",
    "bsp",
    "bangko sentral",
    "financing",
    "financing incentive",
    "financing incentives",
    "funding",
    "debt",
    "bond",
    "notes",
    "capital raise",
    "capital allocation",
    "investment",
    "foreign investment",
    "reit",
    "reits"
  ],
  supply_development: [
    "new development",
    "developments",
    "construction",
    "construction activity",
    "building permits",
    "pipeline",
    "inventory",
    "new supply",
    "units",
    "launch",
    "launched",
    "expansion",
    "township",
    "project",
    "projects",
    "office space",
    "retail space",
    "industrial space",
    "logistics"
  ],
  demand_affordability: [
    "affordability",
    "affordable housing",
    "purchasing power",
    "price-to-income",
    "price to income",
    "buyer behavior",
    "buyers",
    "end-user",
    "end users",
    "demand",
    "rental demand",
    "rent",
    "rents",
    "rental",
    "lease rates",
    "price pressure",
    "price movement",
    "property price index",
    "residential real estate price index",
    "prices",
    "pricing",
    "household income"
  ],
  policy_regulation: [
    "policy",
    "regulation",
    "regulatory",
    "capital charge",
    "capital charges",
    "capital requirement",
    "capital requirements",
    "risk weight",
    "risk weights",
    "dhsud",
    "neda",
    "dof",
    "bsp",
    "bangko sentral",
    "psa",
    "housing program",
    "4ph",
    "pambansang pabahay",
    "zoning",
    "land use",
    "tax",
    "taxes",
    "incentive",
    "incentives",
    "building permits",
    "socialized housing"
  ],
  usage_patterns: [
    "occupancy",
    "leasing",
    "lease",
    "office demand",
    "return to office",
    "wfh",
    "work from home",
    "hybrid work",
    "retail traffic",
    "mall traffic",
    "foot traffic",
    "industrial demand",
    "logistics demand",
    "warehouse",
    "rental vs ownership",
    "rent vs buy"
  ],
  stress_signals: [
    "vacancy",
    "vacancies",
    "unsold inventory",
    "unsold units",
    "oversupply",
    "overhang",
    "slower take-up",
    "slower take up",
    "weak take-up",
    "weak take up",
  "absorption",
  "absorption rate",
    "absorption rates",
    "slows",
    "soften",
    "softens",
    "softening",
    "slowdown",
  "slower demand",
  "weak demand",
  "weaker demand",
    "demand weakness",
    "defaults",
    "default",
    "distress",
    "distressed",
    "project delays",
    "delays",
    "financing strain",
    "price pressure",
    "rental pressure",
    "mismatch",
    "purchasing power",
  "price-to-income",
  "price to income",
  "affordability pressure",
  "price and purchasing power",
  "price mismatch",
  "purchasing power mismatch"
  ]
};

const INCLUSION_RULES: Array<{
  id: string;
  axis: PropertySystemAxis;
  keywords: string[];
}> = [
  {
    id: "signals_property_stress_or_market_friction",
    axis: "stress_signals",
    keywords: AXIS_TERMS.stress_signals
  },
  {
    id: "shows_affordability_or_demand_pressure",
    axis: "demand_affordability",
    keywords: AXIS_TERMS.demand_affordability
  },
  {
    id: "moves_property_capital_or_financing",
    axis: "capital_flows",
    keywords: AXIS_TERMS.capital_flows
  },
  {
    id: "changes_property_policy_or_regulation",
    axis: "policy_regulation",
    keywords: AXIS_TERMS.policy_regulation
  },
  {
    id: "changes_supply_pipeline_or_inventory",
    axis: "supply_development",
    keywords: AXIS_TERMS.supply_development
  },
  {
    id: "shows_usage_occupancy_or_leasing_shift",
    axis: "usage_patterns",
    keywords: AXIS_TERMS.usage_patterns
  }
];

const MATERIALITY_TERMS = [
  "affordability",
  "purchasing power",
  "price pressure",
  "price movement",
  "property price index",
  "residential real estate price index",
  "vacancy",
  "unsold inventory",
  "oversupply",
  "take-up",
  "take up",
  "absorption",
  "occupancy",
  "leasing",
  "rental",
  "rent",
  "demand",
  "supply",
  "inventory",
  "pipeline",
  "construction",
  "building permits",
  "housing loan",
  "housing loans",
  "housing lending",
  "housing credit",
  "home financing",
  "green home financing",
  "green housing lending",
  "home loan",
  "home loans",
  "mortgage",
  "mortgages",
  "mortgage lending",
  "real estate lending",
  "residential real estate lending",
  "capital charge",
  "capital requirement",
  "financing incentive",
  "interest rate",
  "financing",
  "reit",
  "policy",
  "regulation",
  "tax",
  "zoning",
  "project delays",
  "defaults",
  "distress",
  "mismatch",
  "weaker demand",
  "rental pressure",
  "affordability pressure",
  "price-to-income",
  "price to income"
];

const HARD_MARKET_EVIDENCE_TERMS = [
  "property price index",
  "residential real estate price index",
  "price movement",
  "price movements",
  "price pressure",
  "price decline",
  "price increase",
  "rent levels",
  "rental rates",
  "lease rates",
  "vacancy",
  "vacancies",
  "occupancy",
  "take-up",
  "take up",
  "absorption",
  "absorption rate",
  "absorption rates",
  "inventory",
  "inventory overhang",
  "unsold inventory",
  "unsold units",
  "oversupply",
  "overhang",
  "leasing pressure",
  "rental pressure",
  "housing loan",
  "housing loans",
  "housing lending",
  "housing credit",
  "home financing",
  "green home financing",
  "green housing lending",
  "home loan",
  "home loans",
  "mortgage",
  "mortgages",
  "mortgage lending",
  "real estate lending",
  "residential real estate lending",
  "capital charge",
  "capital charges",
  "capital requirement",
  "capital requirements",
  "financing incentive",
  "financing incentives",
  "risk weight",
  "risk weights",
  "interest rate",
  "interest rates",
  "financing strain",
  "policy",
  "regulation",
  "regulatory",
  "bsp",
  "bangko sentral",
  "dhsud",
  "neda",
  "dof",
  "project delays",
  "demand softness",
  "demand weakness",
  "weak demand",
  "weaker demand",
  "buyer weakness",
  "affordability",
  "affordability pressure",
  "purchasing power",
  "price-to-income",
  "price to income",
  "segment divergence",
  "geographic divergence",
  "sales mix"
];

const STRESS_PRIORITY_TERMS = [
  "vacancy",
  "vacancies",
  "unsold inventory",
  "unsold units",
  "oversupply",
  "overhang",
  "slower take-up",
  "slower take up",
  "weak take-up",
  "weak take up",
  "project delays",
  "delays",
  "affordability pressure",
  "weaker demand",
  "weak demand",
  "demand weakness",
  "distress",
  "distressed",
  "defaults",
  "default",
  "rental pressure",
  "mismatch",
  "price-to-income",
  "price to income",
  "price and purchasing power",
  "purchasing power mismatch"
];

const BROAD_REPORT_TITLE_TERMS = [
  "opportunities amid volatility",
  "amid volatility",
  "market outlook",
  "property outlook",
  "real estate outlook",
  "sector outlook",
  "outlook report",
  "market overview",
  "property overview",
  "real estate overview",
  "market summary",
  "research summary",
  "macro outlook",
  "opportunities",
  "volatility"
];

const SPECIFIC_REPORT_TITLE_ANCHOR_TERMS = [
  "vacancy",
  "rents",
  "rent",
  "lease",
  "leasing",
  "occupancy",
  "take-up",
  "take up",
  "absorption",
  "inventory",
  "unsold",
  "oversupply",
  "permits",
  "price",
  "prices",
  "affordability",
  "mortgage",
  "housing loan",
  "capital charge",
  "metro manila",
  "office",
  "residential",
  "retail",
  "industrial",
  "logistics",
  "hotel"
];

const DISCRETE_MARKET_MOVEMENT_TERMS = [
  "vacancy spike",
  "high vacancy",
  "vacancy rate",
  "rent correction",
  "rents decline",
  "rents fall",
  "rents drop",
  "rental correction",
  "inventory overhang",
  "unsold units",
  "unsold inventory",
  "permit decline",
  "permits fall",
  "permits decline",
  "supply pullback",
  "affordability pressure",
  "demand deterioration",
  "weaker demand",
  "demand weakness",
  "price slowdown",
  "prices slow",
  "price decline",
  "lower capital charge",
  "lower capital requirement",
  "mortgage rule",
  "housing credit"
];

const BROCHURE_TERMS = [
  "luxury living",
  "luxury lifestyle",
  "premier lifestyle",
  "exclusive community",
  "world-class amenities",
  "amenities",
  "amenity",
  "dream home",
  "vibrant community",
  "live-work-play",
  "green oasis",
  "curated",
  "award-winning",
  "award",
  "awards",
  "recognition",
  "ribbon-cutting",
  "groundbreaking ceremony",
  "topping off ceremony",
  "ceremony",
  "grand launch",
  "unveils showroom",
  "showroom",
  "open house"
];

const LIFESTYLE_EXCLUSION_TERMS = [
  "celebrity home",
  "house tour",
  "home decor",
  "interior design",
  "best places to invest",
  "where to invest",
  "best condo",
  "investment list",
  "listicle",
  "travel",
  "staycation",
  "promo",
  "discount",
  "reservation fee"
];

const DEVELOPER_PR_TERMS = [
  "launch",
  "launches",
  "launched",
  "unveils",
  "introduces",
  "opens",
  "breaks ground",
  "groundbreaking",
  "tops off",
  "expands",
  "expansion",
  "township",
  "master-planned",
  "mixed-use",
  "luxury",
  "amenities",
  "award",
  "ceremony"
];

const DEVELOPER_SURVIVAL_TERMS = [
  "inventory",
  "unsold",
  "pricing",
  "price",
  "prices",
  "sales",
  "take-up",
  "take up",
  "leasing",
  "occupancy",
  "vacancy",
  "financing",
  "funding",
  "capital",
  "capex",
  "investment",
  "hectare",
  "hectares",
  "gross floor area",
  "gfa",
  "sqm",
  "square meters",
  "units",
  "segment",
  "geographic",
  "luzon",
  "visayas",
  "mindanao",
  "cebu",
  "davao"
];

const DEVELOPER_CORE_EVIDENCE_TERMS = [
  "unsold",
  "unsold inventory",
  "vacancy",
  "occupancy",
  "leasing",
  "take-up",
  "take up",
  "absorption",
  "pricing",
  "price pressure",
  "sales",
  "financing",
  "funding",
  "capital allocation",
  "capex",
  "segment",
  "affordable",
  "affordability",
  "inventory",
  "supply"
];

const GEOGRAPHIC_SUPPLY_EVIDENCE_TERMS = [
  "hectare",
  "hectares",
  "gross floor area",
  "gfa",
  "sqm",
  "square meters",
  "units",
  "inventory",
  "supply",
  "pipeline",
  "luzon",
  "visayas",
  "mindanao",
  "cebu",
  "davao",
  "cavite",
  "laguna",
  "bulacan",
  "pampanga"
];

const CORPORATE_EARNINGS_TERMS = [
  "earnings",
  "profit",
  "profits",
  "net income",
  "income",
  "revenue",
  "revenues",
  "sales rose",
  "sales grew",
  "sales growth",
  "topline",
  "bottom line",
  "attributable income",
  "core net income",
  "profit growth",
  "revenue growth"
];

const CORPORATE_DEMAND_CLAIM_TERMS = [
  "strong demand",
  "steady demand",
  "sustained demand",
  "resilient demand",
  "robust demand",
  "healthy demand",
  "continued growth",
  "solid growth",
  "strong growth",
  "steady growth",
  "demand remains strong",
  "demand stayed strong",
  "market remains resilient"
];

const ADJACENT_BUSINESS_TERMS = [
  "arena",
  "arenas",
  "event venue",
  "event venues",
  "facility",
  "facilities",
  "manufacturing facility",
  "production facility",
  "operations",
  "operational",
  "plant operations",
  "warehouse operations",
  "distribution operations",
  "fulfillment operations",
  "industrial operations",
  "business operations",
  "plant",
  "factory",
  "powers",
  "supplies power",
  "energy supply",
  "electricity supply",
  "concert",
  "concerts",
  "events business",
  "ticket sales",
  "logistics demand",
  "sme demand",
  "small business demand",
  "general business demand",
  "operating activity"
];

const PROPERTY_USAGE_EVIDENCE_TERMS = [
  "office occupancy",
  "office vacancy",
  "mall traffic",
  "retail traffic",
  "foot traffic",
  "leasing",
  "lease rates",
  "occupancy",
  "vacancy",
  "rental demand",
  "rent levels",
  "warehouse occupancy",
  "industrial occupancy",
  "property utilization",
  "space utilization",
  "tenant demand",
  "tenant mix",
  "industrial real estate",
  "development",
  "new development",
  "property development"
];

const REAL_ESTATE_DEVELOPMENT_EVIDENCE_TERMS = [
  "real estate construction",
  "property construction",
  "construction activity",
  "building permits",
  "property inventory",
  "housing inventory",
  "condo inventory",
  "residential inventory",
  "office inventory",
  "development pipeline",
  "property pipeline",
  "real estate pipeline",
  "new supply",
  "office space",
  "retail space",
  "industrial space",
  "warehouse space",
  "gross floor area",
  "gfa",
  "hectare",
  "hectares",
  "sqm",
  "square meters",
  "units"
];

const CAPABILITY_WATCH_TERMS = [
  "reit",
  "reits",
  "mortgage",
  "housing loan",
  "loan product",
  "financing product",
  "digital mortgage",
  "proptech",
  "platform",
  "tool",
  "app",
  "developer strategy",
  "business model",
  "capital market",
  "bond",
  "notes"
];

const CAPABILITY_MATERIALITY_TERMS = [
  "housing loan",
  "housing loans",
  "mortgage",
  "mortgages",
  "financing",
  "funding",
  "interest rate",
  "interest rates",
  "reit",
  "reits",
  "capital market",
  "bond",
  "notes",
  "capital raise",
  "developer strategy",
  "business model",
  "capital allocation",
  "buyer behavior",
  "demand",
  "affordability"
];

const INTERPRETATION_TERMS = [
  "why",
  "how",
  "analysis",
  "commentary",
  "outlook",
  "signals",
  "suggests",
  "points to",
  "pressure",
  "risk",
  "risks",
  "mismatch",
  "uneven",
  "slowdown",
  "challenge",
  "headwind",
  "trend"
];

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9\s%.-]/g, " ")
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

function storyTitle(story: NormalizedStory): string {
  return story.title;
}

function hasNumberSignal(text: string): boolean {
  return /\b\d+(?:\.\d+)?\s?(?:%|percent|bps|basis points|m|b|million|billion|hectares?|sqm|square meters?|units?)\b/i.test(
    text
  );
}

function isBroadGenericReportTitle(story: NormalizedStory): boolean {
  const title = storyTitle(story);

  return (
    hasAny(title, BROAD_REPORT_TITLE_TERMS) &&
    !hasAny(title, SPECIFIC_REPORT_TITLE_ANCHOR_TERMS)
  );
}

function hasDiscreteMarketMovementSignal(story: NormalizedStory): boolean {
  const text = storyText(story);
  const title = storyTitle(story);

  return (
    hasAny(title, DISCRETE_MARKET_MOVEMENT_TERMS) ||
    (
      hasAny(text, DISCRETE_MARKET_MOVEMENT_TERMS) &&
      hasAny(text, ["new", "latest", "quarter", "q1", "q2", "q3", "q4", "year-on-year", "year on year", "fell", "declined", "rose", "increased", "slowed", "hit", "reached"]) &&
      hasNumberSignal(text)
    )
  );
}

function detectGeography(story: NormalizedStory): PropertyGeography {
  const text = storyText(story);

  if (hasAny(text, PH_TERMS) || PH_OFFICIAL_SOURCES.includes(story.source)) {
    return "ph";
  }

  if (PH_SOURCES.includes(story.source) && !hasAny(text, SEA_TERMS)) {
    return "ph";
  }

  if (hasAny(text, SEA_TERMS)) {
    return "sea";
  }

  return "global";
}

function phRelevanceScore(story: NormalizedStory, geography: PropertyGeography): number {
  if (geography === "ph") {
    return 6 + matchingTerms(storyText(story), PH_TERMS).length;
  }

  if (geography === "sea") {
    return 2 + matchingTerms(storyText(story), SEA_TERMS).length;
  }

  return 0;
}

function downstreamRelevance(story: NormalizedStory, geography: PropertyGeography): boolean {
  const text = storyText(story);

  if (geography === "ph") {
    return true;
  }

  if (geography === "sea") {
    return (
      hasAny(text, PH_TERMS) &&
      hasAny(text, ["capital", "investment", "reit", "rates", "office", "industrial", "logistics", "housing", "property"])
    );
  }

  return (
    hasAny(text, ["philippines", "philippine", "bsp", "rates", "interest rates", "capital flows", "foreign investment", "reit"]) &&
    hasAny(text, [...PROPERTY_ANCHOR_TERMS, ...MATERIALITY_TERMS])
  );
}

function ruleMatches(story: NormalizedStory): PropertyRuleMatch[] {
  const text = storyText(story);
  const matches = INCLUSION_RULES
    .map((rule) => ({
      id: rule.id,
      axis: rule.axis,
      keywordMatches: matchingTerms(text, rule.keywords)
    }))
    .filter((match) => match.keywordMatches.length > 0);

  if (hasHousingCreditPolicyBridge(story)) {
    matches.push({
      id: "links_housing_credit_policy_to_property_financing",
      axis: "capital_flows",
      keywordMatches: [
        ...matchingTerms(text, PROPERTY_CREDIT_POLICY_TERMS),
        ...matchingTerms(text, HOUSING_CREDIT_TERMS)
      ]
    });
  }

  return matches;
}

function exclusionMatches(story: NormalizedStory): PropertyRuleMatch[] {
  const text = storyText(story);
  const exclusions: PropertyRuleMatch[] = [];

  const brochureMatches = matchingTerms(text, BROCHURE_TERMS);
  if (brochureMatches.length > 0) {
    exclusions.push({ id: "brochure_or_amenity_pr_without_market_signal", keywordMatches: brochureMatches });
  }

  const lifestyleMatches = matchingTerms(text, LIFESTYLE_EXCLUSION_TERMS);
  if (lifestyleMatches.length > 0) {
    exclusions.push({ id: "lifestyle_or_investment_listicle", keywordMatches: lifestyleMatches });
  }

  const developerMatches = matchingTerms(text, DEVELOPER_PR_TERMS);
  if (developerMatches.length > 0 && !hasAny(text, DEVELOPER_SURVIVAL_TERMS)) {
    exclusions.push({ id: "developer_pr_without_market_evidence", keywordMatches: developerMatches });
  }

  return exclusions;
}

function materialitySignals(story: NormalizedStory): string[] {
  const text = storyText(story);
  const matches = matchingTerms(text, MATERIALITY_TERMS);

  if (hasHousingCreditPolicyBridge(story)) {
    matches.push("housing_credit_policy_signal");
  }

  if (hasAny(text, STRESS_PRIORITY_TERMS)) {
    matches.push("property_stress_priority");
  }

  if (hasNumberSignal(text)) {
    matches.push("quantified_property_signal");
  }

  return [...new Set(matches)];
}

function scoreAxes(
  matches: PropertyRuleMatch[],
  story: NormalizedStory
): Record<PropertySystemAxis, number> {
  const text = storyText(story);
  const scores = Object.fromEntries(
    AXIS_PRIORITY.map((axis) => [axis, matchingTerms(text, AXIS_TERMS[axis]).length])
  ) as Record<PropertySystemAxis, number>;

  for (const match of matches) {
    if (match.axis) {
      scores[match.axis] += 3 + match.keywordMatches.length;
    }
  }

  if (scores.stress_signals > 0) {
    scores.stress_signals += 5;
  }

  if (scores.demand_affordability > 0) {
    scores.demand_affordability += 3;
  }

  if (hasAny(text, STRESS_PRIORITY_TERMS)) {
    scores.stress_signals += 4;
  }

  return scores;
}

function choosePrimaryAxis(scores: Record<PropertySystemAxis, number>): PropertySystemAxis | undefined {
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

function isDeveloperPrStory(story: NormalizedStory): boolean {
  return hasAny(storyText(story), DEVELOPER_PR_TERMS);
}

function hasDeveloperMarketEvidence(story: NormalizedStory): boolean {
  return hasAny(storyText(story), DEVELOPER_SURVIVAL_TERMS);
}

function hasHardMarketEvidence(story: NormalizedStory): boolean {
  return hasAny(storyText(story), HARD_MARKET_EVIDENCE_TERMS);
}

function hasHousingCreditPolicyBridge(story: NormalizedStory): boolean {
  const text = storyText(story);

  return hasAny(text, PROPERTY_CREDIT_POLICY_TERMS) && hasAny(text, HOUSING_CREDIT_TERMS);
}

function isCorporateEarningsStory(story: NormalizedStory): boolean {
  return hasAny(storyText(story), CORPORATE_EARNINGS_TERMS);
}

function hasCorporateDemandClaim(story: NormalizedStory): boolean {
  return hasAny(storyText(story), CORPORATE_DEMAND_CLAIM_TERMS);
}

function isClaimOnlyCorporateNarrative(story: NormalizedStory): boolean {
  return (
    (isCorporateEarningsStory(story) || hasCorporateDemandClaim(story)) &&
    !hasHardMarketEvidence(story)
  );
}

function isAdjacentBusinessOnly(story: NormalizedStory): boolean {
  const text = storyText(story);

  return hasAny(text, ADJACENT_BUSINESS_TERMS) && !hasAny(text, PROPERTY_USAGE_EVIDENCE_TERMS);
}

function isGenericNonPropertyFinancing(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, ["financing", "funding", "loan", "debt", "capital", "financial close"]) &&
    hasAny(text, GENERIC_PROJECT_FINANCE_TERMS) &&
    !hasAny(text, PROPERTY_FINANCING_ANCHOR_TERMS)
  );
}

function isHotelHospitalityOperatingPressureOnly(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, HOTEL_HOSPITALITY_ADJACENCY_TERMS) &&
    hasAny(text, HOTEL_HOSPITALITY_OPERATING_PRESSURE_TERMS) &&
    !hasAny(text, HOTEL_PROPERTY_USAGE_EVIDENCE_TERMS)
  );
}

function hasHotelPropertyUsageEvidence(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, HOTEL_HOSPITALITY_ADJACENCY_TERMS) &&
    hasAny(text, HOTEL_PROPERTY_USAGE_EVIDENCE_TERMS)
  );
}

function matchesFacilityOperationsExclusion(story: NormalizedStory): boolean {
  return hasAny(storyText(story), ADJACENT_BUSINESS_TERMS);
}

function hasFacilityOperationsOverride(story: NormalizedStory): boolean {
  return hasAny(storyText(story), PROPERTY_USAGE_EVIDENCE_TERMS);
}

function hasDeveloperCoreEvidence(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    (
      hasAny(text, DEVELOPER_CORE_EVIDENCE_TERMS) &&
      hasHardMarketEvidence(story)
    ) ||
    (
      hasAny(text, GEOGRAPHIC_SUPPLY_EVIDENCE_TERMS) &&
      hasNumberSignal(text) &&
      hasAny(text, ["inventory", "supply", "pipeline", "units", "hectare", "hectares", "capital", "funding", "investment"])
    )
  );
}

function hasStructuralPressure(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, STRESS_PRIORITY_TERMS) ||
    (
      hasAny(text, ["changed", "changes", "shift", "shifts", "shifting", "slows", "slower", "weakens", "tightens", "reprices", "increased", "increase", "rises", "rose"]) &&
      hasAny(text, ["demand", "supply", "pricing", "prices", "rent", "rental", "leasing", "financing", "rates", "buyers"])
    )
  );
}

function hasHardMovement(
  story: NormalizedStory,
  primaryAxis: PropertySystemAxis | undefined,
  geography: PropertyGeography,
  materiality: string[]
): boolean {
  const text = storyText(story);

  if (geography !== "ph") {
    return false;
  }

  if (isCorporateEarningsStory(story) || hasCorporateDemandClaim(story)) {
    return false;
  }

  if (isAdjacentBusinessOnly(story)) {
    return false;
  }

  if (isDeveloperPrStory(story) && !hasDeveloperCoreEvidence(story)) {
    return false;
  }

  if (primaryAxis === "stress_signals") {
    return hasStructuralPressure(story);
  }

  if (primaryAxis === "demand_affordability") {
    return (
      hasAny(text, ["affordability", "affordability pressure", "purchasing power", "price-to-income", "price to income", "property price index", "residential real estate price index", "price movement", "rental pressure", "weaker demand", "buyer behavior"]) &&
      (hasStructuralPressure(story) || hasNumberSignal(text))
    );
  }

  if (
    primaryAxis === "usage_patterns" &&
    hasAny(text, ["vacancy", "occupancy", "leasing", "office demand", "return to office", "rental demand", "industrial demand"]) &&
    (hasStructuralPressure(story) || hasNumberSignal(text))
  ) {
    return true;
  }

  if (
    primaryAxis === "capital_flows" &&
    hasAny(text, ["housing loan", "housing lending", "housing credit", "home financing", "home loan", "mortgage", "mortgage lending", "real estate lending", "interest rate", "bank lending", "funding", "capital", "capital charge", "capital requirement", "financing", "capital allocation"]) &&
    (hasAny(text, ["demand", "rates", "rate", "pressure", "tightening", "easing", "buyers", "developers", "property"]) || hasNumberSignal(text))
  ) {
    return true;
  }

  if (hasHousingCreditPolicyBridge(story)) {
    return true;
  }

  if (
    primaryAxis === "policy_regulation" &&
    hasAny(text, ["policy", "regulation", "dhsud", "bsp", "neda", "dof", "tax", "zoning", "land use", "4ph"])
  ) {
    return true;
  }

  if (
    primaryAxis === "supply_development" &&
    hasAny(text, REAL_ESTATE_DEVELOPMENT_EVIDENCE_TERMS) &&
    (!isDeveloperPrStory(story) || hasDeveloperCoreEvidence(story))
  ) {
    return true;
  }

  return !isDeveloperPrStory(story) && materiality.length >= 2 && hasNumberSignal(text);
}

function isInterpretationStory(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    hasAny(text, INTERPRETATION_TERMS) &&
    (hasAny(text, MATERIALITY_TERMS) || hasNumberSignal(text)) &&
    !hasAny(text, LIFESTYLE_EXCLUSION_TERMS)
  );
}

function isSoftInterpretationOnly(story: NormalizedStory): boolean {
  const text = storyText(story);

  return (
    isInterpretationStory(story) &&
    !hasNumberSignal(text) &&
    hasAny(text, ["what", "why", "how", "analysis", "commentary", "outlook", "suggests", "points to", "second-order", "implications"])
  );
}

function isCorporateInterpretationOnly(story: NormalizedStory): boolean {
  return (
    (isCorporateEarningsStory(story) || hasCorporateDemandClaim(story)) &&
    hasHardMarketEvidence(story)
  );
}

function isCapabilityWatchStory(
  story: NormalizedStory,
  primaryAxis: PropertySystemAxis | undefined
): boolean {
  const text = storyText(story);

  return (
    hasAny(text, CAPABILITY_WATCH_TERMS) &&
    (
      primaryAxis === "capital_flows" ||
      primaryAxis === "policy_regulation" ||
      hasAny(text, ["developer strategy", "business model", "reit", "financing", "capital market", "mortgage"])
    ) &&
    hasAny(text, CAPABILITY_MATERIALITY_TERMS) &&
    (hasAny(text, MATERIALITY_TERMS) || hasNumberSignal(text))
  );
}

function assignPropertyEditorialBucket(
  story: NormalizedStory,
  primaryAxis: PropertySystemAxis | undefined,
  geography: PropertyGeography,
  materiality: string[]
): PropertyEditorialBucket {
  const hardMovement = hasHardMovement(story, primaryAxis, geography, materiality);
  const interpretation = isInterpretationStory(story);
  const capabilityWatch = isCapabilityWatchStory(story, primaryAxis);

  if (geography !== "ph") {
    return interpretation ? "interpretation" : "capability_watch";
  }

  if (
    capabilityWatch &&
    hasAny(storyText(story), ["tool", "app", "platform", "loan product", "financing product", "digital mortgage"])
  ) {
    return "capability_watch";
  }

  if (isCorporateInterpretationOnly(story)) {
    return "interpretation";
  }

  if (isSoftInterpretationOnly(story)) {
    return "interpretation";
  }

  if (
    isBroadGenericReportTitle(story) &&
    !hasDiscreteMarketMovementSignal(story)
  ) {
    return "interpretation";
  }

  if (hardMovement) {
    return "core_signal";
  }

  if (interpretation) {
    return "interpretation";
  }

  if (capabilityWatch) {
    return "capability_watch";
  }

  return "interpretation";
}

export function classifyPropertyStory(story: NormalizedStory): PropertyClassification {
  const text = storyText(story);
  const geography = detectGeography(story);
  const inclusionMatches = ruleMatches(story);
  const exclusions = exclusionMatches(story);
  const materiality = materialitySignals(story);
  const axisScores = scoreAxes(inclusionMatches, story);
  const primaryAxis = choosePrimaryAxis(axisScores);
  const downstream = downstreamRelevance(story, geography);
  const hasPropertyAnchor = hasAny(text, PROPERTY_ANCHOR_TERMS);
  const stressSignal = axisScores.stress_signals > 0 || hasAny(text, STRESS_PRIORITY_TERMS);
  const developerPrWithoutEvidence =
    isDeveloperPrStory(story) && !hasDeveloperMarketEvidence(story);
  const corporateNarrativeWithoutEvidence = isClaimOnlyCorporateNarrative(story);
  const adjacentBusinessWithoutUsageEvidence = isAdjacentBusinessOnly(story);
  const genericNonPropertyFinancing = isGenericNonPropertyFinancing(story);
  const hotelHospitalityOperatingPressureOnly =
    isHotelHospitalityOperatingPressureOnly(story);
  const facilityOperationsExcluded =
    matchesFacilityOperationsExclusion(story) && !hasFacilityOperationsOverride(story);
  const brochureWithoutMateriality =
    exclusions.some((match) => match.id === "brochure_or_amenity_pr_without_market_signal") &&
    materiality.length === 0;
  const lifestyleExcluded =
    exclusions.some((match) => match.id === "lifestyle_or_investment_listicle") &&
    !hasHotelPropertyUsageEvidence(story);
  const hardExcluded =
    !hasPropertyAnchor ||
    !downstream ||
    developerPrWithoutEvidence ||
    corporateNarrativeWithoutEvidence ||
    genericNonPropertyFinancing ||
    hotelHospitalityOperatingPressureOnly ||
    facilityOperationsExcluded ||
    adjacentBusinessWithoutUsageEvidence ||
    brochureWithoutMateriality ||
    lifestyleExcluded;
  const passesInclusion =
    hasPropertyAnchor &&
    downstream &&
    inclusionMatches.length > 0 &&
    materiality.length > 0 &&
    !facilityOperationsExcluded &&
    !hardExcluded;
  const editorialBucket = assignPropertyEditorialBucket(
    story,
    primaryAxis,
    geography,
    materiality
  );
  const highValue =
    geography === "ph" &&
    (
      stressSignal ||
      primaryAxis === "demand_affordability" ||
      primaryAxis === "policy_regulation" ||
      materiality.includes("quantified_property_signal") ||
      inclusionMatches.length >= 2
    );
  const importanceTier: PropertyImportanceTier = hardExcluded || !passesInclusion
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
    phRelevanceScore: phRelevanceScore(story, geography),
    inclusionMatches,
    exclusionMatches: exclusions,
    materialitySignals: materiality,
    stressSignal,
    hardExcluded,
    passesInclusion,
    importanceTier
  };
}

export function summarizePropertyClassification(
  classification: PropertyClassification
): PropertyFilterSummary {
  return {
    primary_axis: classification.primaryAxis,
    editorial_bucket: classification.editorialBucket,
    geography: classification.geography,
    downstream_relevance: classification.downstreamRelevance,
    importance_tier: classification.importanceTier,
    inclusion_rule_ids: classification.inclusionMatches.map((match) => match.id),
    exclusion_rule_ids: classification.exclusionMatches.map((match) => match.id),
    ph_relevance_score: classification.phRelevanceScore,
    materiality_signals: classification.materialitySignals,
    stress_signal: classification.stressSignal
  };
}

export function evaluatePropertyRelevance(story: NormalizedStory): {
  kept: boolean;
  classification: PropertyClassification;
  drop?: StoryDrop;
} {
  const classification = classifyPropertyStory(story);
  const summary = summarizePropertyClassification(classification);

  if (classification.passesInclusion && !classification.hardExcluded) {
    return {
      kept: true,
      classification
    };
  }

  return {
    kept: false,
    classification,
    drop: {
      source: story.source,
      title: story.title,
      url: story.url,
      date: story.publishedAt,
      reason: "low_relevance",
      details: classification.hardExcluded
        ? "Excluded by Property / Real Estate hard gates for PR, lifestyle, weak geography, or no market signal"
        : "No material Property / Real Estate signal cleared the inclusion gate",
      property_filter: summary
    }
  };
}
