import {
  energyExclusionRules,
  energyInclusionRules,
  energyImportanceTiers,
  type EnergyExclusionRule,
  type EnergyInclusionRule
} from "../config/energy-rules.js";
import type { EnergySystemAxis, NormalizedStory, StoryDrop } from "./types.js";

export type EnergyImportanceTierName = "high" | "medium" | "low_auto_exclude";

export type EnergyRuleMatch = {
  id: string;
  category?: EnergySystemAxis | "system_pressure";
  keywordMatches: string[];
};

export type EnergyExclusionMatch = EnergyRuleMatch & {
  allowIfSystemImpact: boolean;
  materialityOverrideApplied: boolean;
};

export type EnergyClassification = {
  primaryCategory?: EnergySystemAxis;
  categoryScores: Record<EnergySystemAxis, number>;
  inclusionMatches: EnergyRuleMatch[];
  exclusionMatches: EnergyExclusionMatch[];
  overriddenExclusionMatches: EnergyExclusionMatch[];
  materialitySignals: string[];
  demandPressure: boolean;
  systemPressure: boolean;
  passesInclusion: boolean;
  hardExcluded: boolean;
  importanceTier: EnergyImportanceTierName;
};

const ENERGY_CATEGORY_PRIORITY: EnergySystemAxis[] = [
  "supply",
  "demand",
  "price",
  "policy",
  "infrastructure",
  "external_forces"
];

const SYSTEM_PRESSURE_CATEGORY_HINTS: Record<EnergySystemAxis, string[]> = {
  supply: [
    "major outage",
    "forced outage",
    "reserve margin",
    "fuel shock",
    "import disruption"
  ],
  demand: ["reserve margin"],
  price: ["rate hike", "rollback", "fuel shock"],
  policy: [],
  infrastructure: ["red alert", "yellow alert", "bottleneck", "major outage"],
  external_forces: ["fuel shock", "import disruption"]
};

const MATERIALITY_KEYWORDS = [
  "mw",
  "megawatt",
  "megawatts",
  "gw",
  "gigawatt",
  "gigawatts",
  "kwh",
  "mwh",
  "capacity",
  "commissioning",
  "commissioned",
  "commercial operations",
  "energized",
  "grid connection",
  "interconnection",
  "transmission",
  "supply agreement",
  "power supply agreement",
  "contracted capacity",
  "fuel supply",
  "tariff",
  "rate hike",
  "generation charge",
  "outage",
  "reserve margin",
  "red alert",
  "yellow alert",
  "import disruption",
  "brownout"
];

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9\s.%/-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

  return new RegExp(`(^|\\s)${escapeRegex(needle)}(?=\\s|$)`, "i").test(haystack);
}

function matchedKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => containsKeyword(text, keyword));
}

function storyText(story: NormalizedStory): string {
  return `${story.title} ${story.summary ?? ""}`;
}

function emptyCategoryScores(): Record<EnergySystemAxis, number> {
  return {
    supply: 0,
    demand: 0,
    price: 0,
    policy: 0,
    infrastructure: 0,
    external_forces: 0
  };
}

function matchInclusionRules(text: string): EnergyRuleMatch[] {
  return energyInclusionRules.flatMap((rule: EnergyInclusionRule) => {
    const keywordMatches = matchedKeywords(text, rule.signalKeywords);

    return keywordMatches.length > 0
      ? [{ id: rule.id, category: rule.category, keywordMatches }]
      : [];
  });
}

function matchMaterialitySignals(text: string): string[] {
  const keywordSignals = matchedKeywords(text, MATERIALITY_KEYWORDS);
  const numericSignals = /\b\d+(?:\.\d+)?\s?(mw|gw|kwh|mwh|%|percent|billion|million|php|p\/kwh|pesos?)\b/i.test(text)
    ? ["quantified_energy_impact"]
    : [];

  return [...new Set([...keywordSignals, ...numericSignals])];
}

function hasMaterialSystemImpact(
  rule: EnergyExclusionRule,
  inclusionMatches: EnergyRuleMatch[],
  materialitySignals: string[]
): boolean {
  if (!rule.allowIfSystemImpact) {
    return false;
  }

  return inclusionMatches.length > 0 && materialitySignals.length > 0;
}

function matchExclusionRules(
  text: string,
  inclusionMatches: EnergyRuleMatch[],
  materialitySignals: string[]
): {
  active: EnergyExclusionMatch[];
  overridden: EnergyExclusionMatch[];
} {
  const active: EnergyExclusionMatch[] = [];
  const overridden: EnergyExclusionMatch[] = [];

  for (const rule of energyExclusionRules) {
    const keywordMatches = matchedKeywords(text, rule.signalKeywords);

    if (keywordMatches.length === 0) {
      continue;
    }

    const materialityOverrideApplied = hasMaterialSystemImpact(
      rule,
      inclusionMatches,
      materialitySignals
    );
    const match = {
      id: rule.id,
      keywordMatches,
      allowIfSystemImpact: rule.allowIfSystemImpact,
      materialityOverrideApplied
    };

    if (materialityOverrideApplied) {
      overridden.push(match);
    } else {
      active.push(match);
    }
  }

  return { active, overridden };
}

function scoreCategories(inclusionMatches: EnergyRuleMatch[]): Record<EnergySystemAxis, number> {
  const scores = emptyCategoryScores();

  for (const match of inclusionMatches) {
    if (!match.category) {
      continue;
    }

    if (match.category === "system_pressure") {
      for (const category of ENERGY_CATEGORY_PRIORITY) {
        const hintMatches = matchedKeywords(
          match.keywordMatches.join(" "),
          SYSTEM_PRESSURE_CATEGORY_HINTS[category]
        );
        scores[category] += hintMatches.length;
      }

      continue;
    }

    scores[match.category] += match.keywordMatches.length;
  }

  return scores;
}

function choosePrimaryCategory(
  categoryScores: Record<EnergySystemAxis, number>,
  inclusionMatches: EnergyRuleMatch[]
): EnergySystemAxis | undefined {
  const directCandidates = ENERGY_CATEGORY_PRIORITY.filter(
    (category) => categoryScores[category] > 0
  );

  if (directCandidates.length > 0) {
    return directCandidates.sort((left, right) => {
      const scoreDelta = categoryScores[right] - categoryScores[left];

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return ENERGY_CATEGORY_PRIORITY.indexOf(left) - ENERGY_CATEGORY_PRIORITY.indexOf(right);
    })[0];
  }

  return inclusionMatches.some((match) => match.category === "system_pressure")
    ? "infrastructure"
    : undefined;
}

function classifyImportance(
  classification: Pick<
    EnergyClassification,
    "hardExcluded" | "passesInclusion" | "inclusionMatches" | "systemPressure" | "materialitySignals"
  >
): EnergyImportanceTierName {
  if (classification.hardExcluded || !classification.passesInclusion) {
    return "low_auto_exclude";
  }

  const highSignals = energyImportanceTiers.find((tier) => tier.tier === "high")?.signals ?? [];
  const inclusionText = classification.inclusionMatches
    .flatMap((match) => match.keywordMatches)
    .join(" ");
  const highSignalMatch = matchedKeywords(inclusionText, highSignals).length > 0;

  if (classification.systemPressure || highSignalMatch || classification.materialitySignals.includes("quantified_energy_impact")) {
    return "high";
  }

  return "medium";
}

export function classifyEnergyStory(story: NormalizedStory): EnergyClassification {
  const text = storyText(story);
  const inclusionMatches = matchInclusionRules(text);
  const materialitySignals = matchMaterialitySignals(text);
  const exclusions = matchExclusionRules(text, inclusionMatches, materialitySignals);
  const categoryScores = scoreCategories(inclusionMatches);
  const systemPressure = inclusionMatches.some((match) => match.category === "system_pressure");
  const demandPressure = inclusionMatches.some((match) => match.category === "demand");
  const primaryCategory = choosePrimaryCategory(categoryScores, inclusionMatches);
  const hardExcluded = exclusions.active.some((match) => {
    const rule = energyExclusionRules.find((entry) => entry.id === match.id);

    return rule?.hardFilter ?? true;
  });
  const passesInclusion = inclusionMatches.length > 0 && Boolean(primaryCategory);
  const baseClassification = {
    primaryCategory,
    categoryScores,
    inclusionMatches,
    exclusionMatches: exclusions.active,
    overriddenExclusionMatches: exclusions.overridden,
    materialitySignals,
    demandPressure,
    systemPressure,
    passesInclusion,
    hardExcluded
  };

  return {
    ...baseClassification,
    importanceTier: classifyImportance(baseClassification)
  };
}

export function passesEnergyInclusion(story: NormalizedStory): boolean {
  const classification = classifyEnergyStory(story);

  return classification.passesInclusion && !classification.hardExcluded;
}

export function matchesEnergyHardExclusion(story: NormalizedStory): {
  excluded: boolean;
  matches: EnergyExclusionMatch[];
  overriddenMatches: EnergyExclusionMatch[];
} {
  const classification = classifyEnergyStory(story);

  return {
    excluded: classification.hardExcluded,
    matches: classification.exclusionMatches,
    overriddenMatches: classification.overriddenExclusionMatches
  };
}

function buildDrop(story: NormalizedStory, details: string): StoryDrop {
  return {
    source: story.source,
    title: story.title,
    url: story.url,
    date: story.publishedAt,
    reason: "low_relevance",
    details
  };
}

export function evaluateEnergyRelevance(story: NormalizedStory): {
  kept: boolean;
  classification: EnergyClassification;
  drop?: StoryDrop;
} {
  const classification = classifyEnergyStory(story);

  if (classification.hardExcluded) {
    return {
      kept: false,
      classification,
      drop: buildDrop(
        story,
        `Matched Energy hard exclusion: ${classification.exclusionMatches.map((match) => match.id).join(", ")}`
      )
    };
  }

  if (!classification.passesInclusion) {
    return {
      kept: false,
      classification,
      drop: buildDrop(
        story,
        "Did not change understanding of Energy supply, demand, price, policy, infrastructure, external exposure, or system_pressure"
      )
    };
  }

  return {
    kept: true,
    classification
  };
}
