import { relevanceConfigByBeat } from "../config/relevance.js";
import {
  evaluateAiTechRelevance,
  summarizeAiTechClassification
} from "./ai-tech-filter.js";
import { classifyBankingStory } from "./banking.js";
import {
  evaluateEnergyRelevance,
  summarizeEnergyClassification
} from "./energy-filter.js";
import {
  classifyPropertyStory,
  evaluatePropertyRelevance,
  summarizePropertyClassification
} from "./property-filter.js";
import type { NormalizedStory, RelevanceResult, StoryDrop } from "./types.js";

type RelevanceOptions = {
  enabled?: boolean;
};

const NORMALIZATION_REPLACEMENTS: Array<[RegExp, string]> = [
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

const MOTORING_LAUNCH_TERMS = [
  "launch",
  "launched",
  "launches",
  "unveil",
  "unveils",
  "introduce",
  "introduces",
  "arrives",
  "now available",
  "debuts",
  "new model"
];

const MOTORING_CONTEXT_TERMS = [
  "philippines",
  "philippine",
  "manila",
  "srp",
  "price",
  "prices",
  "pricing",
  "financing",
  "loan",
  "monthly",
  "downpayment",
  "affordability",
  "affordable",
  "demand",
  "segment",
  "market",
  "buyers",
  "sales",
  "ownership cost",
  "operating cost",
  "fuel",
  "maintenance",
  "insurance",
  "registration",
  "lto",
  "dotr",
  "charging",
  "infrastructure",
  "hybrid",
  "ev",
  "evs",
  "electrified",
  "supply",
  "inventory",
  "backlog",
  "availability",
  "regulation",
  "enforcement"
];

const MOTORING_DOMAIN_TERMS = [
  "car",
  "cars",
  "vehicle",
  "vehicles",
  "automotive",
  "auto",
  "motor",
  "motoring",
  "suv",
  "pickup",
  "mpv",
  "sedan",
  "crossover",
  "motorcycle",
  "fuel",
  "diesel",
  "gasoline",
  "pump price",
  "oil price",
  "toll",
  "road",
  "roads",
  "traffic",
  "congestion",
  "transport",
  "mobility",
  "lto",
  "dotr",
  "mmda",
  "ltfrb",
  "ev",
  "evs",
  "electrified",
  "hybrid",
  "charging",
  "carmaker",
  "carmakers",
  "dealer",
  "dealership"
];

function normalizeText(value: string): string {
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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsKeyword(text: string, keyword: string): boolean {
  const haystack = normalizeText(text);
  const needle = normalizeText(keyword);

  if (!haystack || !needle) {
    return false;
  }

  const pattern = new RegExp(`(^|\\s)${escapeRegex(needle)}(?=\\s|$)`, "i");

  return pattern.test(haystack);
}

function countMatches(text: string, keywords: string[]): number {
  let score = 0;

  for (const keyword of keywords) {
    if (containsKeyword(text, keyword)) {
      score += 1;
    }
  }

  return score;
}

function matchesAny(text: string, keywords: string[]): boolean {
  return countMatches(text, keywords) > 0;
}

function hasResearchSignal(text: string): boolean {
  const normalized = normalizeText(text);

  return RESEARCH_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

function hasAppliedSignal(text: string): boolean {
  const normalized = normalizeText(text);

  return APPLIED_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

function hasResearchSignalInStory(story: NormalizedStory): boolean {
  return hasResearchSignal(story.title) || hasResearchSignal(story.summary ?? "");
}

function hasAiAnchor(text: string): boolean {
  return matchesAny(text, AI_ANCHOR_TERMS);
}

function isMotoringBeat(story: NormalizedStory): boolean {
  return story.beat === "philippine_motoring";
}

function isBankingBeat(story: NormalizedStory): boolean {
  return story.beat === "ph_sea_banking";
}

function isEnergyBeat(story: NormalizedStory): boolean {
  return story.beat === "ph_sea_energy";
}

function isAiTechBeat(story: NormalizedStory): boolean {
  return story.beat === "ai_tech";
}

function isPropertyBeat(story: NormalizedStory): boolean {
  return story.beat === "property_real_estate";
}

function hasMotoringLaunchSignal(text: string): boolean {
  return matchesAny(text, MOTORING_LAUNCH_TERMS);
}

function hasMotoringEditorialContext(text: string): boolean {
  const normalized = normalizeText(text);

  return (
    matchesAny(text, MOTORING_CONTEXT_TERMS) ||
    matchesAny(text, ["priced", "starts at", "starting price"]) ||
    /\bp\s?\d/.test(normalized)
  );
}

function hasMotoringDomainSignal(text: string): boolean {
  const normalized = normalizeText(text);

  return (
    matchesAny(text, MOTORING_DOMAIN_TERMS) ||
    matchesAny(text, ["srp", "priced", "starts at", "starting price"]) ||
    /\bp\s?\d/.test(normalized)
  );
}

function isMotoringSpecialistSource(source: string): boolean {
  return ["TopGear Philippines", "CarGuide PH"].includes(source);
}

function hasBroadSourceMotoringSignal(story: NormalizedStory): boolean {
  return (
    isMotoringSpecialistSource(story.source) ||
    matchesAny(story.title, MOTORING_DOMAIN_TERMS)
  );
}

function hasMotoringPhilippineRelevance(text: string, source: string): boolean {
  return (
    matchesAny(text, ["philippines", "philippine", "manila", "lto", "dotr", "mmda", "ltfrb", "peso", "php"]) ||
    [
      "TopGear Philippines",
      "CarGuide PH",
      "BusinessWorld",
      "Inquirer Business",
      "Philstar Business"
    ].includes(source)
  );
}

function passesMotoringLaunchGate(story: NormalizedStory): boolean {
  const combinedText = `${story.title} ${story.summary ?? ""}`;

  if (!hasMotoringLaunchSignal(combinedText)) {
    return true;
  }

  return (
    hasMotoringPhilippineRelevance(combinedText, story.source) &&
    hasMotoringEditorialContext(combinedText)
  );
}

function matchesKeepSignalCategory(
  text: string,
  keywords: string[]
): boolean {
  return countMatches(text, keywords) > 0;
}

function getKeepSignalCategories(story: NormalizedStory): string[] {
  const config = relevanceConfigByBeat[story.beat];
  const title = normalizeText(story.title);
  const summary = normalizeText(story.summary ?? "");
  const combinedText = `${title} ${summary}`.trim();
  const categories: string[] = [];
  const keepSignals = config.keep_signal_keywords;

  if (isBankingBeat(story)) {
    const classification = classifyBankingStory(story);

    if (!classification.passesGate || classification.movementScore < 5) {
      return categories;
    }

    for (const fn of classification.functions) {
      categories.push(`banking_${fn}`);
    }

    for (const direction of classification.directions) {
      categories.push(`banking_${direction}`);
    }

    categories.push(`banking_${classification.scope}`);

    return [...new Set(categories)];
  }

  if (isMotoringBeat(story)) {
    if (!hasBroadSourceMotoringSignal(story)) {
      return categories;
    }

    const isProductSignal =
      matchesKeepSignalCategory(combinedText, keepSignals.model_release) &&
      hasMotoringDomainSignal(combinedText) &&
      passesMotoringLaunchGate(story);

    if (isProductSignal) {
      categories.push("product_signal");
    }

    const isInfrastructureGap =
      matchesKeepSignalCategory(combinedText, keepSignals.ai_infrastructure) &&
      hasMotoringDomainSignal(combinedText) &&
      hasMotoringPhilippineRelevance(combinedText, story.source);

    if (isInfrastructureGap) {
      categories.push("infrastructure_gap");
    }

    const isPolicyRegulation =
      matchesKeepSignalCategory(combinedText, keepSignals.policy_regulation) &&
      hasMotoringDomainSignal(combinedText) &&
      hasMotoringPhilippineRelevance(combinedText, story.source);

    if (isPolicyRegulation) {
      categories.push("policy_regulation");
    }

    const isCostDemandSignal =
      (matchesAny(combinedText, config.core_ai_keywords) ||
        matchesAny(combinedText, config.adjacent_tech_keywords)) &&
      hasMotoringDomainSignal(combinedText) &&
      hasMotoringPhilippineRelevance(combinedText, story.source);

    if (isCostDemandSignal) {
      categories.push("cost_or_demand_signal");
    }

    return categories;
  }

  if (isPropertyBeat(story)) {
    const classification = classifyPropertyStory(story);

    if (!classification.passesInclusion || classification.hardExcluded) {
      return categories;
    }

    return classification.inclusionMatches.map((match) => `property_${match.id}`);
  }

  const isModelRelease =
    matchesKeepSignalCategory(combinedText, keepSignals.model_release) &&
    (matchesAny(combinedText, config.core_ai_keywords) ||
      matchesAny(combinedText, ["gpt", "model", "models", "system card", "codex"]));

  if (isModelRelease) {
    categories.push("model_release");
  }

  const isDeveloperPlatform =
    matchesKeepSignalCategory(combinedText, keepSignals.developer_platform) &&
    hasAiAnchor(combinedText);

  if (isDeveloperPlatform) {
    categories.push("developer_platform");
  }

  const isAiInfrastructure =
    matchesKeepSignalCategory(combinedText, keepSignals.ai_infrastructure) &&
    (matchesAny(combinedText, config.ai_infra_keywords) ||
      matchesAny(combinedText, ["openai", "anthropic", "nvidia", "ai"]));

  if (isAiInfrastructure) {
    categories.push("ai_infrastructure");
  }

  const isEnterpriseRollout =
    matchesKeepSignalCategory(combinedText, keepSignals.enterprise_rollout) &&
    hasAiAnchor(combinedText);

  if (isEnterpriseRollout) {
    categories.push("enterprise_rollout");
  }

  const isStrategicPartnership =
    matchesKeepSignalCategory(combinedText, keepSignals.strategic_partnership) &&
    hasAiAnchor(combinedText);

  if (isStrategicPartnership) {
    categories.push("strategic_partnership");
  }

  const isPolicyRegulation =
    matchesKeepSignalCategory(combinedText, keepSignals.policy_regulation) &&
    (hasAiAnchor(combinedText) ||
      matchesAny(combinedText, ["openai", "anthropic", "google", "meta", "microsoft"]));

  if (isPolicyRegulation) {
    categories.push("policy_regulation");
  }

  const isLicensingCopyright =
    matchesKeepSignalCategory(combinedText, keepSignals.licensing_copyright) &&
    hasAiAnchor(combinedText);

  if (isLicensingCopyright) {
    categories.push("licensing_copyright");
  }

  const isSafetyGovernance =
    matchesKeepSignalCategory(combinedText, keepSignals.safety_governance) &&
    hasAiAnchor(combinedText);

  if (isSafetyGovernance) {
    categories.push("safety_governance");
  }

  const isStrategicFinance =
    matchesKeepSignalCategory(combinedText, keepSignals.strategic_finance) &&
    hasAiAnchor(combinedText);

  if (isStrategicFinance) {
    categories.push("strategic_finance");
  }

  return categories;
}

export function scoreStory(story: NormalizedStory): number {
  const config = relevanceConfigByBeat[story.beat];
  const title = normalizeText(story.title);
  const summary = normalizeText(story.summary ?? "");

  if (isBankingBeat(story)) {
    const classification = classifyBankingStory(story);

    if (!classification.passesGate || classification.movementScore < 5) {
      return classification.totalScore;
    }

    return classification.totalScore;
  }

  if (isPropertyBeat(story)) {
    const classification = classifyPropertyStory(story);
    const axisScore = Object.values(classification.axisScores).reduce(
      (total, score) => total + score,
      0
    );
    const tierBoost = classification.importanceTier === "high" ? 3 : 0;

    return axisScore + classification.materialitySignals.length + tierBoost;
  }

  const coreScore =
    countMatches(title, config.core_ai_keywords) * 3 +
    countMatches(summary, config.core_ai_keywords) * 2;
  const infraScore =
    countMatches(title, config.ai_infra_keywords) * 2 +
    countMatches(summary, config.ai_infra_keywords);
  const adjacentScore =
    countMatches(title, config.adjacent_tech_keywords) * 2 +
    countMatches(summary, config.adjacent_tech_keywords);
  if (isMotoringBeat(story)) {
    if (!hasMotoringDomainSignal(`${title} ${summary}`)) {
      return 0;
    }

    if (!hasBroadSourceMotoringSignal(story)) {
      return 0;
    }

    const localBoost =
      hasMotoringPhilippineRelevance(`${title} ${summary}`, story.source) ? 3 : 0;
    const launchPenalty =
      hasMotoringLaunchSignal(`${title} ${summary}`) &&
      !passesMotoringLaunchGate(story)
        ? -8
        : 0;

    return coreScore + infraScore + adjacentScore + localBoost + launchPenalty;
  }

  const aiAnchorScore = coreScore + infraScore;
  const appliedScore =
    aiAnchorScore > 0 || hasAppliedSignal(title) || hasAppliedSignal(summary)
      ? countMatches(title, config.applied_human_keywords) * 2 +
        countMatches(summary, config.applied_human_keywords)
      : 0;

  const titleResearchBoost = hasResearchSignal(title) ? 2 : 0;
  const summaryResearchBoost = hasResearchSignal(summary) ? 1 : 0;
  const titleAppliedBoost = hasAppliedSignal(title) && aiAnchorScore > 0 ? 2 : 0;
  const summaryAppliedBoost =
    hasAppliedSignal(summary) && aiAnchorScore > 0 ? 1 : 0;

  return (
    coreScore +
    infraScore +
    adjacentScore +
    appliedScore +
    titleResearchBoost +
    summaryResearchBoost +
    titleAppliedBoost +
    summaryAppliedBoost
  );
}

function hasDirectAiSignal(story: NormalizedStory): boolean {
  const config = relevanceConfigByBeat[story.beat];
  const title = normalizeText(story.title);
  const summary = normalizeText(story.summary ?? "");
  const combinedText = `${title} ${summary}`.trim();

  return (
    countMatches(combinedText, config.core_ai_keywords) > 0 ||
    countMatches(combinedText, config.ai_infra_keywords) > 0 ||
    hasResearchSignalInStory(story)
  );
}

function hasDirectBeatSignal(story: NormalizedStory): boolean {
  if (isBankingBeat(story)) {
    const classification = classifyBankingStory(story);

    return classification.passesGate && classification.movementScore >= 5;
  }

  if (!isMotoringBeat(story)) {
    if (isPropertyBeat(story)) {
      const classification = classifyPropertyStory(story);

      return classification.passesInclusion && !classification.hardExcluded;
    }

    return hasDirectAiSignal(story);
  }

  const config = relevanceConfigByBeat[story.beat];
  const combinedText = normalizeText(`${story.title} ${story.summary ?? ""}`);

  return (
    hasMotoringPhilippineRelevance(combinedText, story.source) &&
    hasMotoringDomainSignal(combinedText) &&
    hasBroadSourceMotoringSignal(story) &&
    (countMatches(combinedText, config.core_ai_keywords) > 0 ||
      countMatches(combinedText, config.ai_infra_keywords) > 0 ||
      countMatches(combinedText, config.adjacent_tech_keywords) > 0 ||
      countMatches(combinedText, config.applied_human_keywords) > 0)
  );
}

export function isObviousJunk(story: NormalizedStory): boolean {
  const config = relevanceConfigByBeat[story.beat];
  const title = story.title;
  const summary = story.summary ?? "";
  const titleLower = title.toLowerCase();

  if (matchesAny(title, config.junk_keywords)) {
    return true;
  }

  if (isBankingBeat(story)) {
    return classifyBankingStory(story).hardExcluded;
  }

  if (isPropertyBeat(story)) {
    return classifyPropertyStory(story).hardExcluded;
  }

  if (
    /(^best\s)|(\bbest .* of\b)|(\bour favorite\b)|(\btop \d+\b)|(\broundup\b)|(\bgift guide\b)/i.test(
      title
    )
  ) {
    return true;
  }

  if (
    /(\bcoupon\b)|(\bcoupons\b)|(\bpromo code\b)|(\bdiscount\b)|(\bsale\b)|(\bprice drop\b)|(\bpercent off\b)|(\boff right now\b)/i.test(
      `${title} ${summary}`
    )
  ) {
    return true;
  }

  if (
    titleLower.includes("earbuds") ||
    titleLower.includes("phone case") ||
    titleLower.includes("apple watch bands") ||
    titleLower.includes("outdoor pizza ovens")
  ) {
    return true;
  }

  if (isMotoringBeat(story)) {
    const combinedText = `${title} ${summary}`;

    if (
      /(\bwallpaper\b)|(\brender\b)|(\bspy shots?\b)|(\bteaser\b)|(\bconcept only\b)|(\bdie[- ]cast\b)|(\bscale model\b)/i.test(
        combinedText
      )
    ) {
      return true;
    }

    if (
      hasMotoringLaunchSignal(combinedText) &&
      !passesMotoringLaunchGate(story)
    ) {
      return true;
    }
  }

  return false;
}

export function passesBaselineEditorialRelevance(story: NormalizedStory): boolean {
  if (isObviousJunk(story)) {
    return false;
  }

  const keepSignalCategories = getKeepSignalCategories(story);

  if (keepSignalCategories.length > 0) {
    return true;
  }

  if (!hasDirectBeatSignal(story)) {
    return false;
  }

  return scoreStory(story) >= 2;
}

export function evaluateStoryRelevance(story: NormalizedStory): {
  kept: boolean;
  story?: NormalizedStory;
  drop?: StoryDrop;
} {
  if (isPropertyBeat(story)) {
    const evaluation = evaluatePropertyRelevance(story);
    const propertyFilter = summarizePropertyClassification(evaluation.classification);

    if (evaluation.kept) {
      return {
        kept: true,
        story: {
          ...story,
          property_filter: propertyFilter
        }
      };
    }

    return {
      kept: false,
      drop: evaluation.drop
        ? {
            ...evaluation.drop,
            property_filter: propertyFilter
          }
        : undefined
    };
  }

  if (isAiTechBeat(story)) {
    const evaluation = evaluateAiTechRelevance(story);
    const aiTechFilter = summarizeAiTechClassification(evaluation.classification);

    if (evaluation.kept) {
      return {
        kept: true,
        story: {
          ...story,
          ai_tech_filter: aiTechFilter
        }
      };
    }

    return {
      kept: false,
      drop: evaluation.drop
        ? {
            ...evaluation.drop,
            ai_tech_filter: aiTechFilter
          }
        : undefined
    };
  }

  if (isEnergyBeat(story)) {
    const evaluation = evaluateEnergyRelevance(story);
    const energyFilter = summarizeEnergyClassification(evaluation.classification);

    if (evaluation.kept) {
      return {
        kept: true,
        story: {
          ...story,
          energy_filter: energyFilter
        }
      };
    }

    return {
      kept: false,
      drop: evaluation.drop
        ? {
            ...evaluation.drop,
            energy_filter: energyFilter
          }
        : undefined
    };
  }

  if (isObviousJunk(story)) {
    const bankingClassification = isBankingBeat(story)
      ? classifyBankingStory(story)
      : null;

    return {
      kept: false,
      drop: {
        source: story.source,
        title: story.title,
        url: story.url,
        date: story.publishedAt,
        reason: "low_relevance",
        details:
          bankingClassification?.exclusionReason ??
          "Matched junk, shopping, or consumer-tech listicle filters"
      }
    };
  }

  const score = scoreStory(story);
  const config = relevanceConfigByBeat[story.beat];
  const keepSignalCategories = getKeepSignalCategories(story);

  if (score >= config.min_score || keepSignalCategories.length > 0) {
    if (keepSignalCategories.length > 0 || hasDirectBeatSignal(story)) {
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

export function filterStoriesByRelevance(
  stories: NormalizedStory[],
  options: RelevanceOptions = {}
): RelevanceResult {
  if (!options.enabled) {
    return {
      kept: stories,
      dropped: []
    };
  }

  const kept: NormalizedStory[] = [];
  const dropped: StoryDrop[] = [];

  for (const story of stories) {
    const evaluation = evaluateStoryRelevance(story);

    if (evaluation.kept) {
      kept.push(evaluation.story ?? story);
      continue;
    }

    if (evaluation.drop) {
      dropped.push(evaluation.drop);
    }
  }

  return { kept, dropped };
}
