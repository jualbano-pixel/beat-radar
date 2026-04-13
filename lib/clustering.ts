import { sourceWeightByName } from "../config/ranking.js";
import {
  bankingClusterClassification,
  bankingClusterKey,
  bankingThemeLabel
} from "./banking.js";
import type {
  ClusterKind,
  ClusterAssociatedStory,
  EventCluster,
  NormalizedStory,
  ReasonCode,
  ThemeCluster
} from "./types.js";

type EventVerbFamily =
  | "approval"
  | "launch"
  | "investment"
  | "acquisition"
  | "opening"
  | "delay"
  | "cut"
  | "increase"
  | "partnership"
  | "filing"
  | "none";

type ClusterStory = {
  story: NormalizedStory;
  index: number;
  normalizedTitleTokens: Set<string>;
  normalizedSummaryTokens: Set<string>;
  coreTitleTokens: Set<string>;
  eventVerbFamily: EventVerbFamily;
  entities: string[];
};

type ThemeMatch = {
  theme_id: string;
  theme_label: string;
  score: number;
};

type ThemeStrength = "primary" | "secondary" | "watch";

type EnergyClusterMovement =
  | "fuel_price_movement"
  | "electricity_rate_tariff_recovery"
  | "outage_alert_reliability_stress"
  | "project_execution_infrastructure_progress"
  | "policy_burden_shifting"
  | "external_shock_transmitting_locally";

type EnergyClusterAssignment = {
  key: EnergyClusterMovement;
  label: string;
  compressionLine: string;
  strongSingleStorySignal: boolean;
};

const EVENT_VERB_FAMILIES: Array<{
  family: EventVerbFamily;
  keywords: string[];
}> = [
  { family: "approval", keywords: ["approve", "approval", "clears", "greenlights"] },
  {
    family: "launch",
    keywords: [
      "launch",
      "unveil",
      "introduce",
      "debut",
      "release",
      "releases",
      "released",
      "announcing"
    ]
  },
  { family: "investment", keywords: ["invest", "investment", "fund", "capex", "funding"] },
  { family: "acquisition", keywords: ["acquire", "merger", "takeover", "buy", "acquisition"] },
  { family: "opening", keywords: ["opening", "inaugurate"] },
  { family: "delay", keywords: ["delay", "postpone", "hold", "suspend"] },
  { family: "cut", keywords: ["cut", "reduce", "layoff", "shutdown"] },
  { family: "increase", keywords: ["raise", "increase", "hike"] },
  { family: "partnership", keywords: ["sign", "agreement", "partnership", "partner"] },
  { family: "filing", keywords: ["file", "filing", "complaint", "case", "lawsuit"] }
];

const KNOWN_ENTITIES = [
  "openai",
  "anthropic",
  "google",
  "microsoft",
  "meta",
  "amazon",
  "aws",
  "nvidia",
  "canva",
  "gemini",
  "chatgpt",
  "codex",
  "sora",
  "wireguard",
  "microsoft",
  "apple",
  "tesla",
  "ford",
  "gm"
];

const TITLE_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "into",
  "after",
  "amid",
  "over",
  "about",
  "near",
  "more",
  "most",
  "new",
  "next",
  "latest",
  "phase",
  "our",
  "your",
  "its",
  "their",
  "this",
  "that",
  "these",
  "those",
  "build",
  "building",
  "introducing",
  "introduce",
  "launch",
  "launches",
  "launched",
  "unveil",
  "unveils",
  "unveiled",
  "debut",
  "debuts",
  "debuted",
  "announce",
  "announces",
  "announced",
  "accelerating",
  "accelerate",
  "introduces",
  "introducing",
  "acquire",
  "acquires",
  "acquisition",
  "acquiring",
  "partner",
  "partners",
  "partnership",
  "signs",
  "agreement",
  "invest",
  "investment",
  "funding",
  "raises",
  "raise",
  "opens",
  "opening",
  "opens",
  "updates",
  "update",
  "gets",
  "get",
  "make",
  "makes",
  "using",
  "use"
]);

const GENERIC_OBJECT_TOKENS = new Set([
  "ai",
  "tech",
  "model",
  "models",
  "platform",
  "platforms",
  "enterprise",
  "developer",
  "developers",
  "api",
  "apis",
  "tool",
  "tools",
  "runtime",
  "workflow",
  "workflows",
  "system",
  "systems",
  "agent",
  "agents",
  "application",
  "applications",
  "product",
  "products",
  "service",
  "services",
  "company",
  "companies",
  "generation",
  "generative"
]);

const MAX_BANKING_THEMES = 4;
const MAX_GENERIC_THEMES = 6;

const THEME_STRENGTH_RANK: Record<ThemeStrength, number> = {
  primary: 3,
  secondary: 2,
  watch: 1
};

type ThemeRule = {
  id: string;
  label: string;
  keywords: string[];
  tags?: string[];
  reasonCodes?: ReasonCode[];
  angleSignals?: string[];
};

const AI_TECH_THEME_RULES: ThemeRule[] = [
  {
    id: "models_platforms",
    label: "models and platform releases",
    keywords: ["gpt", "model", "api", "launch", "introduce", "release", "platform"],
    tags: ["ai_models"]
  },
  {
    id: "infrastructure_execution_gap",
    label: "infrastructure execution gap",
    keywords: ["compute", "gpu", "capacity", "inference", "cloud", "data center"],
    tags: ["ai_infrastructure"],
    angleSignals: ["infrastructure lag visible", "execution gap showing"]
  },
  {
    id: "capital_caution",
    label: "capital caution",
    keywords: ["investment", "funding", "valuation", "demand", "pricing"],
    reasonCodes: ["market_signal"]
  },
  {
    id: "policy_governance",
    label: "policy and governance pressure",
    keywords: ["policy", "regulation", "court", "compliance", "governance"],
    reasonCodes: ["policy_regulatory_move"]
  },
  {
    id: "supply_chain_strain",
    label: "supply chain strain",
    keywords: ["supply", "chip", "chips", "shortage", "capacity", "strain"],
    angleSignals: ["supply risk rising"]
  },
  {
    id: "enterprise_adoption",
    label: "enterprise adoption",
    keywords: ["enterprise", "workflow", "deployment", "customer", "business"],
    tags: ["applied_ai"]
  },
  {
    id: "industry_repositioning",
    label: "industry repositioning",
    keywords: ["partnership", "acquisition", "acquire", "agreement", "platform"],
    reasonCodes: ["industry_repositioning", "meaningful_shift"]
  }
];

const PHILIPPINE_MOTORING_THEME_RULES: ThemeRule[] = [
  {
    id: "pricing_pressure",
    label: "pricing pressure",
    keywords: ["srp", "price", "prices", "pricing", "financing", "affordability"],
    tags: ["pricing_pressure"],
    reasonCodes: ["market_signal"]
  },
  {
    id: "ownership_cost_reality",
    label: "ownership cost reality",
    keywords: ["fuel", "maintenance", "insurance", "registration", "operating cost"],
    tags: ["ownership_cost"],
    angleSignals: ["ownership cost reality surfacing"]
  },
  {
    id: "ev_transition_gap",
    label: "EV transition gap",
    keywords: ["ev", "electric vehicle", "hybrid", "charging", "battery", "range"],
    tags: ["ev_transition_gap"],
    angleSignals: ["EV transition gap visible"]
  },
  {
    id: "infrastructure_constraint",
    label: "infrastructure constraint",
    keywords: ["road", "roads", "toll", "traffic", "congestion", "charging station", "infrastructure"],
    tags: ["motoring_infrastructure"],
    angleSignals: ["infrastructure constraint showing"]
  },
  {
    id: "regulation_enforcement",
    label: "regulation and enforcement",
    keywords: ["lto", "dotr", "mmda", "ltfrb", "registration", "license", "enforcement", "policy", "regulation"],
    tags: ["regulation_enforcement"],
    reasonCodes: ["policy_regulatory_move"]
  },
  {
    id: "supply_availability",
    label: "supply and availability",
    keywords: ["supply", "inventory", "availability", "backlog", "production", "deliveries"],
    tags: ["supply_availability"],
    angleSignals: ["supply constraint shaping choice"]
  },
  {
    id: "consumer_demand_shift",
    label: "consumer demand shift",
    keywords: ["demand", "sales", "segment", "suv", "pickup", "mpv", "buyers", "market share"],
    tags: ["consumer_demand_shift"],
    reasonCodes: ["product_signal"]
  }
];

const PHILIPPINE_BANKING_THEME_RULES: ThemeRule[] = [
  {
    id: "credit_tightening",
    label: "Credit tightening is emerging",
    keywords: ["loan", "lending", "credit", "tighten", "tightening", "slowdown"],
    tags: ["banking_lending", "banking_tightening"]
  },
  {
    id: "credit_loosening",
    label: "Credit appetite is loosening",
    keywords: ["loan growth", "credit growth", "loosening", "expand lending"],
    tags: ["banking_lending", "banking_loosening"]
  },
  {
    id: "liquidity_preservation",
    label: "Liquidity is being preserved over growth",
    keywords: ["liquidity", "preserve", "buffer", "reserve requirement"],
    tags: ["banking_liquidity", "banking_preserving"]
  },
  {
    id: "deposit_shift",
    label: "Deposits are shifting toward yield",
    keywords: ["deposit", "deposits", "time deposit", "higher yield", "migration"],
    tags: ["banking_deposits", "banking_shifting"]
  },
  {
    id: "risk_repricing",
    label: "Risk is being quietly repriced",
    keywords: ["risk", "npl", "provision", "repricing", "exposure", "stress"],
    tags: ["banking_risk", "banking_repricing"]
  },
  {
    id: "funding_margin_pressure",
    label: "Funding costs are pressing margins",
    keywords: ["funding cost", "cost of funds", "margin pressure", "net interest margin"],
    tags: ["banking_funding", "banking_repricing"]
  },
  {
    id: "regulatory_pressure",
    label: "Regulatory pressure is tightening behavior",
    keywords: ["bsp", "central bank", "regulation", "reserve requirement", "capital requirement"],
    tags: ["banking_regulation"]
  },
  {
    id: "digital_deposit_competition",
    label: "Digital competition is pulling at deposits",
    keywords: ["digital bank", "digital banking", "fintech", "deposit competition", "fund migration"],
    tags: ["banking_digital_shift", "banking_deposits"]
  }
];

function themeRulesForStory(story: NormalizedStory): ThemeRule[] {
  if (story.beat === "ph_sea_banking") {
    return PHILIPPINE_BANKING_THEME_RULES;
  }

  return story.beat === "philippine_motoring"
    ? PHILIPPINE_MOTORING_THEME_RULES
    : AI_TECH_THEME_RULES;
}

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

function tokenize(value: string): Set<string> {
  return new Set(
    normalizeText(value)
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}

function coreTitleTokenize(value: string): Set<string> {
  const normalizedEntities = KNOWN_ENTITIES.map((entity) => normalizeText(entity));

  return new Set(
    normalizeText(value)
      .split(/\s+/)
      .filter((token) => token.length > 2)
      .filter((token) => !TITLE_STOPWORDS.has(token))
      .filter((token) => !GENERIC_OBJECT_TOKENS.has(token))
      .filter((token) => !normalizedEntities.includes(token))
  );
}

function hasKeywordMatch(text: string, keyword: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);

  if (normalizedKeyword.includes(" ")) {
    return normalizedText.includes(normalizedKeyword);
  }

  return tokenize(normalizedText).has(normalizedKeyword);
}

function overlapRatio(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of left) {
    if (right.has(token)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(left.size, right.size);
}

function hasDistinctiveSharedCoreToken(left: Set<string>, right: Set<string>): boolean {
  for (const token of left) {
    if (right.has(token) && token.length >= 5) {
      return true;
    }
  }

  return false;
}

function detectEventVerbFamily(text: string): EventVerbFamily {
  for (const entry of EVENT_VERB_FAMILIES) {
    if (entry.keywords.some((keyword) => hasKeywordMatch(text, keyword))) {
      return entry.family;
    }
  }

  return "none";
}

function extractEntities(text: string): string[] {
  const normalized = normalizeText(text);
  const entities = KNOWN_ENTITIES.filter((entity) =>
    normalized.includes(normalizeText(entity))
  );

  return entities.slice(0, 4);
}

function dateDistanceInDays(left: string, right: string): number {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();

  return Math.abs(leftTime - rightTime) / 86_400_000;
}

function summaryClarityScore(summary?: string): number {
  if (!summary) {
    return 0;
  }

  const length = summary.trim().length;

  if (length >= 90 && length <= 260) {
    return 2;
  }

  if (length >= 50) {
    return 1;
  }

  return 0;
}

function buildClusterStories(stories: NormalizedStory[]): ClusterStory[] {
  return stories.map((story, index) => ({
    story,
    index,
    normalizedTitleTokens: tokenize(story.title),
    normalizedSummaryTokens: tokenize(story.summary ?? ""),
    coreTitleTokens: coreTitleTokenize(story.title),
    eventVerbFamily: detectEventVerbFamily(`${story.title} ${story.summary ?? ""}`),
    entities: extractEntities(`${story.title} ${story.summary ?? ""}`)
  }));
}

function isSameEvent(left: ClusterStory, right: ClusterStory): boolean {
  const sameVerbFamily =
    left.eventVerbFamily !== "none" &&
    left.eventVerbFamily === right.eventVerbFamily;
  const sharedEntities = left.entities.filter((entity) => right.entities.includes(entity));
  const titleOverlap = overlapRatio(left.normalizedTitleTokens, right.normalizedTitleTokens);
  const summaryOverlap = overlapRatio(
    left.normalizedSummaryTokens,
    right.normalizedSummaryTokens
  );
  const coreTitleOverlap = overlapRatio(left.coreTitleTokens, right.coreTitleTokens);
  const sharedCoreTokens = [...left.coreTitleTokens].filter((token) =>
    right.coreTitleTokens.has(token)
  ).length;
  const hasDistinctiveCoreMatch = hasDistinctiveSharedCoreToken(
    left.coreTitleTokens,
    right.coreTitleTokens
  );
  const tagOverlap = left.story.tags.filter((tag) => right.story.tags.includes(tag)).length;
  const dateDistance = dateDistanceInDays(left.story.date, right.story.date);

  if (dateDistance > 10) {
    return false;
  }

  if (
    sameVerbFamily &&
    sharedEntities.length > 0 &&
    titleOverlap >= 0.4 &&
    (
      sharedCoreTokens >= 2 ||
      coreTitleOverlap >= 0.6 ||
      (sharedCoreTokens >= 1 &&
        hasDistinctiveCoreMatch &&
        (summaryOverlap >= 0.1 || tagOverlap >= 1))
    )
  ) {
    return true;
  }

  if (
    sharedEntities.length > 0 &&
    sharedCoreTokens >= 1 &&
    hasDistinctiveCoreMatch &&
    titleOverlap >= 0.3 &&
    summaryOverlap >= 0.1 &&
    dateDistance <= 3
  ) {
    return true;
  }

  if (
    sameVerbFamily &&
    titleOverlap >= 0.8 &&
    summaryOverlap >= 0.2 &&
    tagOverlap >= 1 &&
    (sharedCoreTokens >= 2 || coreTitleOverlap >= 0.65)
  ) {
    return true;
  }

  if (
    sharedEntities.length >= 2 &&
    titleOverlap >= 0.55 &&
    tagOverlap >= 1 &&
    (sharedCoreTokens >= 2 || coreTitleOverlap >= 0.6)
  ) {
    return true;
  }

  return false;
}

function buildEventLabel(stories: ClusterStory[], leadStory: ClusterStory): string {
  const sharedEntities = stories
    .flatMap((story) => story.entities)
    .filter((entity, index, all) => all.indexOf(entity) === index)
    .slice(0, 2);

  if (sharedEntities.length > 0 && leadStory.eventVerbFamily !== "none") {
    return `${sharedEntities.join(" / ")} ${leadStory.eventVerbFamily}`;
  }

  return leadStory.story.title;
}

function associatedStories(stories: NormalizedStory[]) {
  return stories.map((story) => ({
    id: story.id,
    title: story.title,
    url: story.url,
    source: story.source,
    published_at: story.publishedAt
  }));
}

function genericClusterCompressionLine(
  label: string,
  stories: NormalizedStory[]
): string {
  if (stories.length > 1) {
    return `Multiple reports point to the same development around ${label}, giving the cluster enough support for downstream treatment.`;
  }

  return `This story is the clearest available signal around ${label} in the current run.`;
}

function genericThemeSummary(
  label: string,
  stories: NormalizedStory[],
  dominantAngleSignals: string[]
): string {
  const leadSignal = dominantAngleSignals[0];

  if (leadSignal) {
    return `${label} is the shared editorial thread across ${stories.length} related stories. The strongest signal is ${leadSignal}.`;
  }

  return `${label} is the shared editorial thread across ${stories.length} related stories. The grouped stories give downstream article generation a bounded set of source material.`;
}

function bankingThemeSummaryFromLabel(label: string): string {
  const normalized = normalizeText(label);

  if (normalized.includes("credit tightening")) {
    return "Banks and regulators are giving more attention to loan terms, borrower capacity, and credit discipline than to simple volume growth.";
  }

  if (normalized.includes("risk")) {
    return "The useful signal is balance-sheet caution: bad loans, provisions, exposure, or stress are becoming harder to treat as background noise.";
  }

  if (normalized.includes("deposit")) {
    return "Deposit behavior matters because fund movement can change liquidity, funding costs, and competitive pressure across banks.";
  }

  if (normalized.includes("liquidity")) {
    return "Liquidity is the core read: banks appear more focused on buffers and optionality than on stretching for growth.";
  }

  if (normalized.includes("funding")) {
    return "Funding pressure matters because higher cost of funds can squeeze margins and force banks to reprice risk.";
  }

  if (normalized.includes("growth")) {
    return "Credit is still moving, but the important question is whether borrowers can keep absorbing it under tighter conditions.";
  }

  if (normalized.includes("discipline")) {
    return "The signal is not yet a full cycle turn, but loan rules and credit terms are moving onto the desk's watchlist.";
  }

  return "The signal is worth watching, but it is not yet strong enough to carry a directional system read.";
}

function canonicalThemeKey(label: string): string {
  const normalized = normalizeText(label);

  if (
    normalized.includes("credit tightening") ||
    normalized.includes("regulatory pressure is tightening")
  ) {
    return "credit_tightening";
  }

  if (normalized.includes("risk")) {
    return "risk_surface";
  }

  if (normalized.includes("liquidity")) {
    if (normalized.includes("easing")) {
      return "liquidity_easing";
    }

    if (normalized.includes("tightening")) {
      return "liquidity_tightening";
    }

    return "liquidity_preservation";
  }

  if (normalized.includes("deposit")) {
    if (normalized.includes("weakening")) {
      return "deposit_weakening";
    }

    if (normalized.includes("growing")) {
      return "deposit_growth";
    }

    return "deposit_shift";
  }

  if (normalized.includes("funding")) {
    return "funding_margin_pressure";
  }

  if (normalized.includes("growth")) {
    return "growth_strain";
  }

  if (normalized.includes("credit discipline") || normalized.includes("credit rules")) {
    return "credit_discipline_watch";
  }

  return normalized.replace(/\s+/g, "_");
}

function rewriteVagueBankingThemeLabel(label: string): string | null {
  const normalized = normalizeText(label);

  if (normalized.includes("deposit behavior needs confirmation")) {
    return "Deposit movement is on watch";
  }

  if (normalized.includes("funding pressure needs confirmation")) {
    return "Funding pressure is on watch";
  }

  if (normalized.includes("liquidity conditions need confirmation")) {
    return "Liquidity conditions are on watch";
  }

  if (normalized.includes("credit discipline is under review")) {
    return "Credit rules are moving onto the watchlist";
  }

  if (normalized.includes("banking watch signals need confirmation")) {
    return null;
  }

  return label;
}

function bankingThemeIsVague(label: string): boolean {
  const normalized = normalizeText(label);

  return (
    normalized.includes("needs confirmation") ||
    normalized.includes("signals are mixed") ||
    normalized.includes("on watch") ||
    normalized.includes("watchlist") ||
    normalized.includes("under review") ||
    normalized.includes("sector updates") ||
    normalized.includes("banking trends") ||
    normalized.includes("developments")
  );
}

function bankingThemeIsDirectional(label: string): boolean {
  const normalized = normalizeText(label);
  const directionalTerms = [
    "tightening",
    "rising",
    "shifting",
    "easing",
    "loosening",
    "falling",
    "weakening",
    "growing",
    "preserved",
    "preserving",
    "repriced",
    "repricing",
    "pressing",
    "strain",
    "surface"
  ];

  return directionalTerms.some((term) => normalized.includes(term));
}

function storyHasStrongDirectionalBankingBehavior(story: NormalizedStory): boolean {
  const signals = story.banking_signals;

  if (!signals) {
    return false;
  }

  const directional = signals.direction.some((direction) =>
    [
      "tightening",
      "loosening",
      "rising",
      "falling",
      "shifting",
      "preserving",
      "repricing"
    ].includes(direction)
  );
  const dimensions = signals.score_dimensions;

  return (
    directional &&
    dimensions.system_impact >= 4 &&
    dimensions.behavior_signal >= 4 &&
    dimensions.signal_strength >= 4
  );
}

function isNonBehavioralInstitutionalBankingStory(story: NormalizedStory): boolean {
  const signals = story.banking_signals;

  if (!signals) {
    return false;
  }

  const text = normalizeText(`${story.title} ${story.summary ?? ""}`);
  const institutionalEvent =
    /\b(event|ceremony|ceremonial|forum|conference|summit|meeting|iftar|hosts?|hosted|welcome|welcomes|visit|visits|cooperation|collaboration|memorandum|mou|partnership|award|awards|recognition)\b/.test(text);
  const hasBalanceSheetFunction = signals.function.some((fn) =>
    ["lending", "deposits", "liquidity", "funding", "risk"].includes(fn)
  );

  return (
    institutionalEvent &&
    !hasBalanceSheetFunction &&
    !storyHasStrongDirectionalBankingBehavior(story)
  );
}

function shouldPromoteBankingClusterToTheme(
  label: string,
  stories: NormalizedStory[]
): boolean {
  if (
    bankingThemeIsVague(label) ||
    !bankingThemeIsDirectional(label) ||
    stories.some(isNonBehavioralInstitutionalBankingStory)
  ) {
    return false;
  }

  if (stories.length >= 2) {
    return true;
  }

  return stories.some(storyHasStrongDirectionalBankingBehavior);
}

function dedupeAndLimitThemes(
  clusters: ThemeCluster[],
  maxThemes: number
): ThemeCluster[] {
  const byKey = new Map<string, ThemeCluster>();
  const mergeAssociatedStories = (
    left: ClusterAssociatedStory[] = [],
    right: ClusterAssociatedStory[] = []
  ): ClusterAssociatedStory[] => {
    const byId = new Map<string, ClusterAssociatedStory>();

    for (const story of [...left, ...right]) {
      if (!byId.has(story.id)) {
        byId.set(story.id, story);
      }
    }

    return [...byId.values()];
  };

  for (const cluster of clusters) {
    const key = canonicalThemeKey(cluster.theme_label);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, cluster);
      continue;
    }

    const mergedStoryIds = [...new Set([...existing.story_ids, ...cluster.story_ids])];
    const mergedClusterIds = [...new Set([...existing.cluster_ids, ...cluster.cluster_ids])];
    const mergedTopStoryRefs = [
      ...new Set([...existing.top_story_refs, ...cluster.top_story_refs])
    ].slice(0, 3);
    const existingRank = THEME_STRENGTH_RANK[(existing.theme_type ?? "watch") as ThemeStrength] ?? 1;
    const clusterRank = THEME_STRENGTH_RANK[(cluster.theme_type ?? "watch") as ThemeStrength] ?? 1;
    const lead = clusterRank > existingRank ? cluster : existing;
    const supporting = lead === existing ? cluster : existing;

    byKey.set(key, {
      ...lead,
      story_count: mergedStoryIds.length,
      cluster_ids: mergedClusterIds,
      story_ids: mergedStoryIds,
      associated_stories: mergeAssociatedStories(
        lead.associated_stories,
        supporting.associated_stories
      ),
      dominant_reason_codes: [
        ...new Set([...existing.dominant_reason_codes, ...cluster.dominant_reason_codes])
      ].slice(0, 3),
      dominant_angle_signals: [
        ...new Set([...existing.dominant_angle_signals, ...cluster.dominant_angle_signals])
      ].slice(0, 3),
      top_story_refs: mergedTopStoryRefs,
      theme_type:
        clusterRank > existingRank
          ? cluster.theme_type
          : existing.theme_type
    });
  }

  return [...byKey.values()]
    .sort((left, right) => {
      const rankDelta =
        (THEME_STRENGTH_RANK[(right.theme_type ?? "watch") as ThemeStrength] ?? 1) -
        (THEME_STRENGTH_RANK[(left.theme_type ?? "watch") as ThemeStrength] ?? 1);

      if (rankDelta !== 0) {
        return rankDelta;
      }

      if (right.story_count !== left.story_count) {
        return right.story_count - left.story_count;
      }

      return left.theme_label.localeCompare(right.theme_label);
    })
    .slice(0, maxThemes);
}

function bankingClusterCompressionLine(
  label: string,
  stories: NormalizedStory[]
): string {
  const normalizedLabel = normalizeText(label);
  const text = normalizeText(
    stories.map((story) => `${story.title} ${story.summary ?? ""}`).join(" ")
  );
  const hasPolicy = stories.some((story) => story.banking_signals?.driver.includes("policy"));
  const hasLending = stories.some((story) => story.banking_signals?.function.includes("lending"));
  const hasRisk = stories.some((story) => story.banking_signals?.function.includes("risk"));
  const hasRegulation = stories.some((story) =>
    story.banking_signals?.function.includes("regulation")
  );

  if (normalizedLabel.includes("credit tightening")) {
    if (hasPolicy && hasLending) {
      return "Regulatory and lending signals are pointing in the same direction: tighter credit discipline across the system.";
    }

    return "The cluster points to stricter credit conditions, with banks or regulators becoming less willing to let lending run on autopilot.";
  }

  if (
    normalizedLabel.includes("risk") ||
    hasRisk ||
    text.includes("bad loans") ||
    text.includes("capacity to pay")
  ) {
    return "Bad-loan and borrower-capacity signals suggest risk is beginning to surface beneath still-active lending.";
  }

  if (normalizedLabel.includes("liquidity")) {
    return "The grouped stories point to banks preserving buffers rather than stretching balance sheets for growth.";
  }

  if (normalizedLabel.includes("deposit")) {
    return "The grouped stories point to deposit movement that could change funding cost, liquidity, or competitive behavior.";
  }

  if (normalizedLabel.includes("growth")) {
    return "The cluster keeps loan growth in view, but the useful read is whether that growth is becoming harder for borrowers to carry.";
  }

  if (normalizedLabel.includes("discipline") || hasRegulation) {
    return "Loan rules and regulatory signals are putting credit discipline back on the banking desk's watchlist.";
  }

  return "The stories belong together as early banking-system signals, but the direction still needs confirmation.";
}

function pickLeadStory(stories: ClusterStory[]): ClusterStory {
  return [...stories].sort((left, right) => {
    const priorityDelta =
      (right.story.priority_score ?? 0) - (left.story.priority_score ?? 0);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const distinctivenessDelta =
      (right.story.priority_breakdown?.distinctiveness ?? 0) -
      (left.story.priority_breakdown?.distinctiveness ?? 0);
    if (distinctivenessDelta !== 0) {
      return distinctivenessDelta;
    }

    const clarityDelta =
      summaryClarityScore(right.story.summary) - summaryClarityScore(left.story.summary);
    if (clarityDelta !== 0) {
      return clarityDelta;
    }

    const sourceDelta =
      (sourceWeightByName[right.story.source] ?? 0) -
      (sourceWeightByName[left.story.source] ?? 0);
    if (sourceDelta !== 0) {
      return sourceDelta;
    }

    return left.index - right.index;
  })[0];
}

function buildEventClusters(clusterStories: ClusterStory[]): {
  stories: NormalizedStory[];
  eventClusters: EventCluster[];
} {
  const grouped = new Array<boolean>(clusterStories.length).fill(false);
  const eventClusters: EventCluster[] = [];
  const storyUpdates = new Map<string, Partial<NormalizedStory>>();
  let clusterCounter = 1;

  for (let index = 0; index < clusterStories.length; index += 1) {
    if (grouped[index]) {
      continue;
    }

    const seed = clusterStories[index];
    const members = [seed];
    grouped[index] = true;

    for (let compareIndex = index + 1; compareIndex < clusterStories.length; compareIndex += 1) {
      if (grouped[compareIndex]) {
        continue;
      }

      const candidate = clusterStories[compareIndex];

      if (isSameEvent(seed, candidate)) {
        members.push(candidate);
        grouped[compareIndex] = true;
      }
    }

    if (members.length < 2) {
      grouped[index] = false;
      continue;
    }

    const leadStory = pickLeadStory(members);
    const clusterId = `event_${String(clusterCounter).padStart(3, "0")}`;
    clusterCounter += 1;
    const entities = [...new Set(members.flatMap((member) => member.entities))].slice(0, 5);
    const eventLabel = buildEventLabel(members, leadStory);
    const supportingStoryIds = members
      .filter((member) => member.story.id !== leadStory.story.id)
      .map((member) => member.story.id);
    const primaryTheme = pickPrimaryThemeForEventCluster(
      members.map((member) => member.story)
    );

    eventClusters.push({
      cluster_id: clusterId,
      cluster_kind: "same_event",
      lead_story_id: leadStory.story.id,
      story_count: members.length,
      story_ids: members.map((member) => member.story.id),
      story_titles: members.map((member) => member.story.title),
      associated_stories: associatedStories(members.map((member) => member.story)),
      entities,
      event_label: eventLabel,
      compression_line: genericClusterCompressionLine(
        eventLabel,
        members.map((member) => member.story)
      ),
      priority_score: leadStory.story.priority_score ?? 0,
      editorial_bucket: leadStory.story.editorial_bucket ?? "background",
      primary_theme_id: primaryTheme?.theme_id,
      primary_theme_label: primaryTheme?.theme_label,
      supporting_story_ids: supportingStoryIds
    });

    for (const member of members) {
      storyUpdates.set(member.story.id, {
        cluster_id: clusterId,
        cluster_kind: "same_event",
        theme_id: primaryTheme?.theme_id,
        theme_label: primaryTheme?.theme_label
      });
    }
  }

  return {
    stories: clusterStories.map((entry) => ({
      ...entry.story,
      ...storyUpdates.get(entry.story.id)
    })),
    eventClusters
  };
}

function buildBankingBehaviorClusters(stories: NormalizedStory[]): {
  stories: NormalizedStory[];
  eventClusters: EventCluster[];
  themeClusters: ThemeCluster[];
} {
  const grouped = new Map<string, NormalizedStory[]>();

  for (const story of stories) {
    if (story.beat !== "ph_sea_banking" || !story.banking_signals) {
      continue;
    }

    const key = isNonBehavioralInstitutionalBankingStory(story)
      ? `banking_context_watch:${story.id}`
      : bankingClusterKey(story);
    const group = grouped.get(key) ?? [];
    group.push(story);
    grouped.set(key, group);
  }

  const storyUpdates = new Map<string, Partial<NormalizedStory>>();
  const eventClusters: EventCluster[] = [];
  const themeMap = new Map<
    string,
    {
      theme_id: string;
      theme_label: string;
      cluster_ids: Set<string>;
      story_ids: Set<string>;
      stories: NormalizedStory[];
      theme_type: "primary" | "secondary" | "watch";
    }
  >();
  let clusterCounter = 1;

  for (const [key, group] of [...grouped.entries()].sort((left, right) => {
    const leftScore = Math.max(...left[1].map((story) => story.movement_score ?? 0), 0);
    const rightScore = Math.max(...right[1].map((story) => story.movement_score ?? 0), 0);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return left[0].localeCompare(right[0]);
  })) {
    const sortedGroup = [...group].sort((left, right) => {
      const priorityDelta = (right.priority_score ?? 0) - (left.priority_score ?? 0);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return right.publishedAt.localeCompare(left.publishedAt);
    });
    const leadStory = sortedGroup[0];
    const signals = leadStory.banking_signals;

    if (!signals) {
      continue;
    }

    if (sortedGroup.every(isNonBehavioralInstitutionalBankingStory)) {
      for (const story of sortedGroup) {
        storyUpdates.set(story.id, {
          cluster_kind: "standalone",
          cluster_classification: "watch",
          editorial_bucket: "context_watch",
          theme_id: undefined,
          theme_label: undefined
        });
      }

      continue;
    }

    const clusterId = `banking_${String(clusterCounter).padStart(3, "0")}`;
    clusterCounter += 1;
    const classification = sortedGroup.some(isNonBehavioralInstitutionalBankingStory)
      ? "watch"
      : bankingClusterClassification(sortedGroup);
    const rawThemeLabel = bankingThemeLabel(leadStory);
    const themeLabel = rewriteVagueBankingThemeLabel(rawThemeLabel);
    const shouldPromoteTheme =
      themeLabel !== null &&
      shouldPromoteBankingClusterToTheme(themeLabel, sortedGroup);
    const themeId = themeLabel ? canonicalThemeKey(themeLabel) : undefined;
    const clusterType = sortedGroup.length > 1 ? "pattern" : "event";

    eventClusters.push({
      cluster_id: clusterId,
      cluster_kind: "same_event",
      lead_story_id: leadStory.id,
      story_count: sortedGroup.length,
      story_ids: sortedGroup.map((story) => story.id),
      story_titles: sortedGroup.map((story) => story.title),
      associated_stories: associatedStories(sortedGroup),
      entities: [
        ...new Set(sortedGroup.flatMap((story) => story.banking_signals?.entity_type ?? []))
      ],
      event_label: themeLabel ?? rawThemeLabel,
      compression_line: bankingClusterCompressionLine(themeLabel ?? rawThemeLabel, sortedGroup),
      priority_score: leadStory.priority_score ?? 0,
      editorial_bucket: leadStory.editorial_bucket ?? "background",
      cluster_type: clusterType,
      cluster_classification: classification,
      primary_theme_id: shouldPromoteTheme ? themeId : undefined,
      primary_theme_label: shouldPromoteTheme ? themeLabel : undefined,
      supporting_story_ids: sortedGroup.slice(1).map((story) => story.id)
    });

    const themeEntry =
      shouldPromoteTheme && themeId && themeLabel
        ? themeMap.get(themeId) ?? {
            theme_id: themeId,
            theme_label: themeLabel,
            cluster_ids: new Set<string>(),
            story_ids: new Set<string>(),
            stories: [],
            theme_type: classification
          }
        : null;

    if (themeEntry) {
      themeEntry.cluster_ids.add(clusterId);
      if (THEME_STRENGTH_RANK[classification] > THEME_STRENGTH_RANK[themeEntry.theme_type]) {
        themeEntry.theme_type = classification;
      }
    }

    for (const story of sortedGroup) {
      if (themeEntry) {
        themeEntry.story_ids.add(story.id);
        themeEntry.stories.push(story);
      }
      storyUpdates.set(story.id, {
        cluster_id: clusterId,
        cluster_kind: sortedGroup.length > 1 ? "same_topic_different_angle" : "standalone",
        cluster_type: clusterType,
        cluster_classification: classification,
        editorial_bucket: isNonBehavioralInstitutionalBankingStory(story)
          ? "context_watch"
          : story.editorial_bucket,
        theme_id: shouldPromoteTheme ? themeId : undefined,
        theme_label: shouldPromoteTheme ? themeLabel ?? undefined : undefined
      });
    }

    if (themeEntry) {
      themeMap.set(themeEntry.theme_id, themeEntry);
    }
  }

  const themeClusters: ThemeCluster[] = dedupeAndLimitThemes([...themeMap.values()]
    .map((entry) => {
      const reasonCounts = new Map<string, number>();
      const angleCounts = new Map<string, number>();

      for (const story of entry.stories) {
        if (story.reason_code) {
          reasonCounts.set(story.reason_code, (reasonCounts.get(story.reason_code) ?? 0) + 1);
        }

        for (const angle of story.angle_signals ?? []) {
          angleCounts.set(angle, (angleCounts.get(angle) ?? 0) + 1);
        }
      }

      return {
        theme_id: entry.theme_id,
        theme_label: entry.theme_label,
        theme_summary: bankingThemeSummaryFromLabel(entry.theme_label),
        story_count: entry.story_ids.size,
        cluster_ids: [...entry.cluster_ids],
        story_ids: [...entry.story_ids],
        associated_stories: associatedStories(
          [...entry.stories].sort((left, right) =>
            (right.priority_score ?? 0) - (left.priority_score ?? 0)
          )
        ),
        dominant_reason_codes: [...reasonCounts.entries()]
          .sort((left, right) => right[1] - left[1])
          .slice(0, 3)
          .map(([reason]) => reason as ReasonCode),
        dominant_angle_signals: [...angleCounts.entries()]
          .sort((left, right) => right[1] - left[1])
          .slice(0, 3)
          .map(([angle]) => angle),
        top_story_refs: [...entry.stories]
          .sort((left, right) => (right.priority_score ?? 0) - (left.priority_score ?? 0))
          .slice(0, 3)
          .map((story) => story.id),
        theme_type: entry.theme_type
      };
    })
    .sort((left, right) => {
      return (
        (THEME_STRENGTH_RANK[(right.theme_type ?? "watch") as ThemeStrength] ?? 1) -
        (THEME_STRENGTH_RANK[(left.theme_type ?? "watch") as ThemeStrength] ?? 1)
      );
    }), MAX_BANKING_THEMES);

  return {
    stories: stories.map((story) => ({
      ...story,
      ...storyUpdates.get(story.id)
    })),
    eventClusters,
    themeClusters
  };
}

const ENERGY_CLUSTER_DEFINITIONS: Record<
  EnergyClusterMovement,
  { label: string; compressionLine: string }
> = {
  fuel_price_movement: {
    label: "Fuel price movement",
    compressionLine:
      "Fuel prices are moving through pump-price signals, changing the near-term cost read for consumers and fuel-sensitive sectors."
  },
  electricity_rate_tariff_recovery: {
    label: "Electricity rate, tariff, or recovery movement",
    compressionLine:
      "Electricity cost recovery or tariff signals are moving through the regulated price chain rather than appearing as isolated company news."
  },
  outage_alert_reliability_stress: {
    label: "Outage, alert, or reliability stress",
    compressionLine:
      "Reliability stress is visible in grid, outage, reserve, or alert signals that point to pressure on the physical power system."
  },
  project_execution_infrastructure_progress: {
    label: "Project execution and infrastructure progress",
    compressionLine:
      "Infrastructure execution is moving through rehabilitation, EPC, commissioning, or delivery steps that affect system capability."
  },
  policy_burden_shifting: {
    label: "Policy burden shifting",
    compressionLine:
      "Policy action is shifting who absorbs Energy costs through taxes, credits, tariff treatment, subsidies, or recovery decisions."
  },
  external_shock_transmitting_locally: {
    label: "External shock transmitting locally",
    compressionLine:
      "External fuel, commodity, or geopolitical pressure is transmitting into local Energy cost, supply, or generation behavior."
  }
};

const ENERGY_OUTAGE_ALERT_TERMS = [
  "red alert",
  "yellow alert",
  "outage",
  "forced outage",
  "reserve margin",
  "brownout",
  "reliability stress",
  "grid alert"
];

const ENERGY_PROJECT_EXECUTION_TERMS = [
  "rehabilitation",
  "epc",
  "power plant",
  "solar power plant",
  "commissioning",
  "commissioned",
  "commercial operations",
  "grid connection",
  "interconnection",
  "capacity"
];

const ENERGY_FUEL_PRICE_TERMS = [
  "fuel price",
  "fuel prices",
  "pump price",
  "pump prices",
  "diesel",
  "gasoline",
  "kerosene",
  "lpg",
  "rollback",
  "price cut",
  "price hike",
  "per liter",
  "liter"
];

const ENERGY_ELECTRICITY_PRICE_TERMS = [
  "electricity rate",
  "electricity rates",
  "meralco",
  "generation charge",
  "generation cost",
  "generation costs",
  "tariff",
  "recovery mechanism",
  "recover cost",
  "wesm",
  "p/kwh",
  "kwh"
];

const ENERGY_POLICY_BURDEN_TERMS = [
  "vat",
  "tax",
  "taxes",
  "excise",
  "tax credit",
  "subsidy",
  "subsidies",
  "tariff",
  "waives",
  "suspends",
  "relief",
  "burden",
  "recover cost",
  "recovery mechanism"
];

const ENERGY_EXTERNAL_SHOCK_TERMS = [
  "middle east",
  "iran",
  "truce",
  "oil crisis",
  "energy shocks",
  "geopolitical",
  "global oil",
  "coal use",
  "lng market"
];

function energyStoryText(story: NormalizedStory): string {
  return `${story.title} ${story.summary ?? ""}`;
}

function textHasAny(text: string, terms: string[]): boolean {
  const normalized = normalizeText(text);

  return terms.some((term) => normalized.includes(normalizeText(term)));
}

function quantifiedEnergyPriceMove(text: string): boolean {
  return /\bp?\d+(?:\.\d+)?\s?(?:\/?\s?kwh|\/?\s?liter|centavos|pesos?)\b/i.test(text);
}

function energyClusterAssignment(story: NormalizedStory): EnergyClusterAssignment | null {
  const filter = story.energy_filter;

  if (!filter?.primary_category) {
    return null;
  }

  const text = energyStoryText(story);
  const rules = new Set(filter.inclusion_rule_ids);
  const materiality = filter.materiality_signals.join(" ");
  const assignment = (key: EnergyClusterMovement, strongSingleStorySignal: boolean) => ({
    key,
    label: ENERGY_CLUSTER_DEFINITIONS[key].label,
    compressionLine: ENERGY_CLUSTER_DEFINITIONS[key].compressionLine,
    strongSingleStorySignal
  });

  if (
    filter.system_pressure &&
    (
      textHasAny(text, ENERGY_OUTAGE_ALERT_TERMS) ||
      rules.has("affects_grid_or_infrastructure_reliability")
    )
  ) {
    return assignment("outage_alert_reliability_stress", true);
  }

  if (
    filter.primary_category === "infrastructure" &&
    textHasAny(`${text} ${materiality}`, ENERGY_PROJECT_EXECUTION_TERMS)
  ) {
    return assignment("project_execution_infrastructure_progress", true);
  }

  if (
    filter.primary_category === "policy" &&
    textHasAny(text, ENERGY_POLICY_BURDEN_TERMS)
  ) {
    return assignment("policy_burden_shifting", true);
  }

  if (
    filter.primary_category === "price" &&
    textHasAny(text, ENERGY_ELECTRICITY_PRICE_TERMS)
  ) {
    return assignment(
      "electricity_rate_tariff_recovery",
      filter.system_pressure || quantifiedEnergyPriceMove(text)
    );
  }

  if (
    filter.primary_category === "price" &&
    textHasAny(text, ENERGY_FUEL_PRICE_TERMS)
  ) {
    return assignment(
      "fuel_price_movement",
      filter.system_pressure || quantifiedEnergyPriceMove(text) || textHasAny(text, ["rollback"])
    );
  }

  if (
    (
      filter.primary_category === "external_forces" ||
      rules.has("external_pressure_impacts_local_system")
    ) &&
    textHasAny(text, ENERGY_EXTERNAL_SHOCK_TERMS)
  ) {
    return assignment(
      "external_shock_transmitting_locally",
      filter.primary_category === "external_forces"
    );
  }

  if (
    filter.primary_category === "supply" &&
    textHasAny(text, [
      "fuel supply",
      "lng supply",
      "coal supply",
      "oil supply",
      "generation fuel",
      "reserve margin",
      "import disruption",
      "supply agreement",
      "capacity",
      "outage"
    ])
  ) {
    return assignment("outage_alert_reliability_stress", filter.system_pressure);
  }

  return null;
}

function buildEnergyMovementClusters(stories: NormalizedStory[]): {
  stories: NormalizedStory[];
  eventClusters: EventCluster[];
  themeClusters: ThemeCluster[];
} {
  const grouped = new Map<EnergyClusterMovement, NormalizedStory[]>();
  const assignments = new Map<string, EnergyClusterAssignment>();

  for (const story of stories) {
    const assignment = energyClusterAssignment(story);

    if (!assignment) {
      continue;
    }

    assignments.set(story.id, assignment);
    const group = grouped.get(assignment.key) ?? [];
    group.push(story);
    grouped.set(assignment.key, group);
  }

  const storyUpdates = new Map<string, Partial<NormalizedStory>>();
  const eventClusters: EventCluster[] = [];
  let clusterCounter = 1;

  for (const [movementKey, group] of [...grouped.entries()].sort((left, right) => {
    const leftPriority = Math.max(...left[1].map((story) => story.priority_score ?? 0), 0);
    const rightPriority = Math.max(...right[1].map((story) => story.priority_score ?? 0), 0);

    if (rightPriority !== leftPriority) {
      return rightPriority - leftPriority;
    }

    return ENERGY_CLUSTER_DEFINITIONS[left[0]].label.localeCompare(
      ENERGY_CLUSTER_DEFINITIONS[right[0]].label
    );
  })) {
    const sortedGroup = [...group].sort((left, right) => {
      const priorityDelta = (right.priority_score ?? 0) - (left.priority_score ?? 0);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return right.publishedAt.localeCompare(left.publishedAt);
    });
    const shouldCreateCluster =
      sortedGroup.length > 1 ||
      Boolean(assignments.get(sortedGroup[0].id)?.strongSingleStorySignal);

    if (!shouldCreateCluster) {
      continue;
    }

    const leadStory = sortedGroup[0];
    const assignment = assignments.get(leadStory.id);

    if (!assignment) {
      continue;
    }

    const clusterId = `energy_${String(clusterCounter).padStart(3, "0")}`;
    clusterCounter += 1;
    const classification =
      sortedGroup.some((story) => story.energy_filter?.system_pressure)
        ? "primary"
        : sortedGroup.length > 1
          ? "secondary"
          : "watch";

    eventClusters.push({
      cluster_id: clusterId,
      cluster_kind: "same_event",
      lead_story_id: leadStory.id,
      story_count: sortedGroup.length,
      story_ids: sortedGroup.map((story) => story.id),
      story_titles: sortedGroup.map((story) => story.title),
      associated_stories: associatedStories(sortedGroup),
      entities: [],
      event_label: assignment.label,
      compression_line: assignment.compressionLine,
      priority_score: leadStory.priority_score ?? 0,
      editorial_bucket: leadStory.editorial_bucket ?? "background",
      cluster_type: sortedGroup.length > 1 ? "pattern" : "event",
      cluster_classification: classification,
      supporting_story_ids: sortedGroup.slice(1).map((story) => story.id)
    });

    for (const story of sortedGroup) {
      storyUpdates.set(story.id, {
        cluster_id: clusterId,
        cluster_kind: sortedGroup.length > 1 ? "same_topic_different_angle" : "standalone",
        cluster_type: sortedGroup.length > 1 ? "pattern" : "event",
        cluster_classification: classification
      });
    }
  }

  const themeResult = buildEnergyThemesFromClusters(eventClusters);

  for (const theme of themeResult.themeClusters) {
    for (const clusterId of theme.cluster_ids) {
      const cluster = eventClusters.find((entry) => entry.cluster_id === clusterId);

      if (!cluster) {
        continue;
      }

      cluster.primary_theme_id = theme.theme_id;
      cluster.primary_theme_label = theme.theme_label;

      for (const storyId of cluster.story_ids) {
        storyUpdates.set(storyId, {
          ...storyUpdates.get(storyId),
          theme_id: theme.theme_id,
          theme_label: theme.theme_label
        });
      }
    }
  }

  return {
    stories: stories.map((story) => ({
      ...story,
      ...storyUpdates.get(story.id),
      cluster_kind: storyUpdates.has(story.id) ? storyUpdates.get(story.id)?.cluster_kind : "standalone"
    })),
    eventClusters,
    themeClusters: themeResult.themeClusters
  };
}

function energyThemeForCluster(cluster: EventCluster): {
  theme_id: string;
  theme_label: string;
  theme_summary: string;
  theme_type: "primary" | "secondary";
} | null {
  if (cluster.story_count < 2 || cluster.cluster_classification === "watch") {
    return null;
  }

  switch (cluster.event_label) {
    case "Fuel price movement":
      return {
        theme_id: "energy_fuel_prices_easing",
        theme_label: "Fuel prices are easing through rollbacks",
        theme_summary:
          "Pump-price movement is pointing downward, with diesel, gasoline, and fuel-monitor stories reinforcing the same cost direction.",
        theme_type: cluster.cluster_classification === "primary" ? "primary" : "secondary"
      };
    case "Electricity rate, tariff, or recovery movement":
      return {
        theme_id: "energy_power_costs_moving_through_recovery",
        theme_label: "Electricity costs are moving through rates and recovery",
        theme_summary:
          "Regulated rate, tariff, and recovery signals are changing how generation and electricity costs pass through the system.",
        theme_type: cluster.cluster_classification === "primary" ? "primary" : "secondary"
      };
    case "Outage, alert, or reliability stress":
      return {
        theme_id: "energy_reliability_pressure_building",
        theme_label: "Reliability pressure is building in the power system",
        theme_summary:
          "Grid, outage, reserve, or alert signals point to tightening physical reliability rather than isolated operational noise.",
        theme_type: cluster.cluster_classification === "primary" ? "primary" : "secondary"
      };
    case "Project execution and infrastructure progress":
      return {
        theme_id: "energy_infrastructure_execution_advancing",
        theme_label: "Energy infrastructure execution is advancing",
        theme_summary:
          "Project execution signals show rehabilitation, EPC, commissioning, or delivery steps moving system capability forward.",
        theme_type: cluster.cluster_classification === "primary" ? "primary" : "secondary"
      };
    case "Policy burden shifting":
      return {
        theme_id: "energy_policy_shifting_cost_burden",
        theme_label: "Policy is shifting fuel-cost burdens",
        theme_summary:
          "Fiscal and regulatory actions are moving who absorbs Energy costs through subsidies, taxes, tariff treatment, credits, or recovery decisions.",
        theme_type: cluster.cluster_classification === "primary" ? "primary" : "secondary"
      };
    case "External shock transmitting locally":
      return {
        theme_id: "energy_external_shocks_transmitting_locally",
        theme_label: "External shocks are transmitting into local Energy costs",
        theme_summary:
          "External commodity or geopolitical pressure is showing up in local fuel, supply, or generation behavior.",
        theme_type: cluster.cluster_classification === "primary" ? "primary" : "secondary"
      };
    default:
      return null;
  }
}

function buildEnergyThemesFromClusters(eventClusters: EventCluster[]): {
  themeClusters: ThemeCluster[];
} {
  const themeClusters: ThemeCluster[] = [];
  const assignedThemeIds = new Set<string>();

  for (const cluster of eventClusters) {
    const theme = energyThemeForCluster(cluster);

    if (!theme || assignedThemeIds.has(theme.theme_id)) {
      continue;
    }

    assignedThemeIds.add(theme.theme_id);
    themeClusters.push({
      theme_id: theme.theme_id,
      theme_label: theme.theme_label,
      theme_summary: theme.theme_summary,
      story_count: cluster.story_count,
      cluster_ids: [cluster.cluster_id],
      story_ids: cluster.story_ids,
      associated_stories: cluster.associated_stories,
      dominant_reason_codes: [],
      dominant_angle_signals: [],
      top_story_refs: [cluster.lead_story_id],
      theme_type: theme.theme_type
    });
  }

  return {
    themeClusters: themeClusters.sort((left, right) => {
      const rankDelta =
        (THEME_STRENGTH_RANK[(right.theme_type ?? "watch") as ThemeStrength] ?? 1) -
        (THEME_STRENGTH_RANK[(left.theme_type ?? "watch") as ThemeStrength] ?? 1);

      if (rankDelta !== 0) {
        return rankDelta;
      }

      return right.story_count - left.story_count;
    })
  };
}

function getThemeMatches(story: NormalizedStory): ThemeMatch[] {
  const text = `${story.title} ${story.summary ?? ""}`;
  const matches: ThemeMatch[] = [];

  for (const rule of themeRulesForStory(story)) {
    const keywordHits = rule.keywords.filter((keyword) =>
      hasKeywordMatch(text, keyword)
    ).length;
    const tagHits = rule.tags?.filter((tag) => story.tags.includes(tag)).length ?? 0;
    const reasonHits = rule.reasonCodes?.includes(story.reason_code as ReasonCode) ? 1 : 0;
    const angleHits =
      rule.angleSignals?.filter((phrase) => story.angle_signals?.includes(phrase)).length ?? 0;
    const score = keywordHits * 2 + tagHits + reasonHits * 2 + angleHits * 2;

    if (score < 2) {
      continue;
    }

    matches.push({
      theme_id: rule.id,
      theme_label: rule.label,
      score
    });
  }

  return matches.sort((left, right) => right.score - left.score);
}

function detectTheme(story: NormalizedStory): { theme_id: string; theme_label: string } | null {
  const bestTheme = getThemeMatches(story)[0];

  return bestTheme
    ? {
        theme_id: bestTheme.theme_id,
        theme_label: bestTheme.theme_label
      }
    : null;
}

function pickPrimaryThemeForEventCluster(stories: NormalizedStory[]): ThemeMatch | null {
  const themeScores = new Map<string, ThemeMatch>();

  for (const story of stories) {
    for (const match of getThemeMatches(story)) {
      const current = themeScores.get(match.theme_id);

      if (!current) {
        themeScores.set(match.theme_id, { ...match });
        continue;
      }

      current.score += match.score;
    }
  }

  const rankedThemes = [...themeScores.values()].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.theme_id.localeCompare(right.theme_id);
  });

  const bestTheme = rankedThemes[0];

  if (!bestTheme || bestTheme.score < 3) {
    return null;
  }

  return bestTheme;
}

function buildThemeClusters(
  stories: NormalizedStory[],
  eventClusters: EventCluster[]
): {
  stories: NormalizedStory[];
  themeClusters: ThemeCluster[];
} {
  const themeMap = new Map<
    string,
    {
      theme_id: string;
      theme_label: string;
      cluster_ids: Set<string>;
      story_ids: Set<string>;
      stories: NormalizedStory[];
    }
  >();

  for (const eventCluster of eventClusters) {
    if (!eventCluster.primary_theme_id || !eventCluster.primary_theme_label) {
      continue;
    }

    const themedStories = stories.filter(
      (story) => story.cluster_id === eventCluster.cluster_id
    );
    const entry = themeMap.get(eventCluster.primary_theme_id) ?? {
      theme_id: eventCluster.primary_theme_id,
      theme_label: eventCluster.primary_theme_label,
      cluster_ids: new Set<string>(),
      story_ids: new Set<string>(),
      stories: []
    };

    entry.cluster_ids.add(eventCluster.cluster_id);

    for (const story of themedStories) {
      entry.story_ids.add(story.id);
      entry.stories.push({
        ...story,
        theme_id: eventCluster.primary_theme_id,
        theme_label: eventCluster.primary_theme_label
      });
    }

    themeMap.set(eventCluster.primary_theme_id, entry);
  }

  for (const story of stories) {
    if (story.cluster_kind === "same_event") {
      continue;
    }

    const theme = detectTheme(story);

    if (!theme) {
      continue;
    }

    const entry = themeMap.get(theme.theme_id) ?? {
      theme_id: theme.theme_id,
      theme_label: theme.theme_label,
      cluster_ids: new Set<string>(),
      story_ids: new Set<string>(),
      stories: []
    };

    entry.story_ids.add(story.id);
    entry.stories.push({
      ...story,
      theme_id: theme.theme_id,
      theme_label: theme.theme_label
    });
    themeMap.set(theme.theme_id, entry);
  }

  const updatedStories = stories.map((story) => {
    const theme =
      story.cluster_kind === "same_event"
        ? story.theme_id && story.theme_label
          ? { theme_id: story.theme_id, theme_label: story.theme_label }
          : null
        : detectTheme(story);
    const themedStoryCount = theme
      ? (themeMap.get(theme.theme_id)?.story_ids.size ?? 0)
      : 0;
    const clusterKind: ClusterKind =
      story.cluster_kind === "same_event"
        ? "same_event"
        : themedStoryCount > 1
          ? "same_topic_different_angle"
          : "standalone";

    return {
      ...story,
      cluster_kind: clusterKind,
      theme_id: theme?.theme_id,
      theme_label: theme?.theme_label
    };
  });

  const themeClusters: ThemeCluster[] = dedupeAndLimitThemes([...themeMap.entries()]
    .map(([themeId, entry]) => {
      const themeLabel = entry.theme_label;
      const reasonCounts = new Map<string, number>();
      const angleCounts = new Map<string, number>();

      for (const story of entry.stories) {
        if (story.reason_code) {
          reasonCounts.set(story.reason_code, (reasonCounts.get(story.reason_code) ?? 0) + 1);
        }

        for (const angleSignal of story.angle_signals ?? []) {
          angleCounts.set(angleSignal, (angleCounts.get(angleSignal) ?? 0) + 1);
        }
      }

      const topStoryRefs = [...entry.stories]
        .sort((left, right) => (right.priority_score ?? 0) - (left.priority_score ?? 0))
        .slice(0, 3)
        .map((story) => story.id);

      return {
        theme_id: themeId,
        theme_label: themeLabel,
        theme_summary: genericThemeSummary(
          themeLabel,
          entry.stories,
          [...angleCounts.entries()]
            .sort((left, right) => right[1] - left[1])
            .slice(0, 3)
            .map(([angle]) => angle)
        ),
        story_count: entry.story_ids.size,
        cluster_ids: [...entry.cluster_ids],
        story_ids: [...entry.story_ids],
        associated_stories: associatedStories(
          [...entry.stories].sort((left, right) =>
            (right.priority_score ?? 0) - (left.priority_score ?? 0)
          )
        ),
        dominant_reason_codes: [...reasonCounts.entries()]
          .sort((left, right) => right[1] - left[1])
          .slice(0, 3)
          .map(([reason]) => reason as ReasonCode),
        dominant_angle_signals: [...angleCounts.entries()]
          .sort((left, right) => right[1] - left[1])
          .slice(0, 3)
          .map(([angle]) => angle),
        top_story_refs: topStoryRefs
      };
    })
    .filter((cluster) => cluster.story_count > 1)
    .sort((left, right) => right.story_count - left.story_count), MAX_GENERIC_THEMES);

  return {
    stories: updatedStories,
    themeClusters
  };
}

export function clusterStories(stories: NormalizedStory[]): {
  stories: NormalizedStory[];
  eventClusters: EventCluster[];
  themeClusters: ThemeCluster[];
} {
  if (stories.every((story) => story.beat === "ph_sea_banking")) {
    return buildBankingBehaviorClusters(stories);
  }

  if (stories.every((story) => story.beat === "ph_sea_energy")) {
    return buildEnergyMovementClusters(stories);
  }

  const clusterStories = buildClusterStories(stories);
  const sameEventResult = buildEventClusters(clusterStories);
  const themeResult = buildThemeClusters(
    sameEventResult.stories,
    sameEventResult.eventClusters
  );

  return {
    stories: themeResult.stories.map((story) => ({
      ...story,
      cluster_kind: story.cluster_kind ?? "standalone"
    })),
    eventClusters: sameEventResult.eventClusters,
    themeClusters: themeResult.themeClusters
  };
}
