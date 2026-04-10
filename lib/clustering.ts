import { sourceWeightByName } from "../config/ranking.js";
import type {
  ClusterKind,
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

const THEME_RULES: Array<{
  id: string;
  label: string;
  keywords: string[];
  tags?: string[];
  reasonCodes?: ReasonCode[];
  angleSignals?: string[];
}> = [
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
      entities,
      event_label: eventLabel,
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

function getThemeMatches(story: NormalizedStory): ThemeMatch[] {
  const text = `${story.title} ${story.summary ?? ""}`;
  const matches: ThemeMatch[] = [];

  for (const rule of THEME_RULES) {
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

  const themeClusters: ThemeCluster[] = [...themeMap.entries()]
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
        story_count: entry.story_ids.size,
        cluster_ids: [...entry.cluster_ids],
        story_ids: [...entry.story_ids],
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
    .sort((left, right) => right.story_count - left.story_count);

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
