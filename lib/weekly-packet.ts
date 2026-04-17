import type { AiTechTimeMode } from "../config/time-modes.js";
import type {
  EventCluster,
  NormalizedStory,
  StoryDrop,
  ThemeCluster as StoryThemeCluster
} from "./types.js";

type PrioritizedStory = {
  title: string;
  source: string;
  date: string;
  summary: string;
  tags: string[];
  priority_score: number;
  priority_reasons: string[];
  original_url?: string;
};

type TopStory = PrioritizedStory & {
  what_happened: string;
  why_this_matters: string;
};

type SecondarySignal = PrioritizedStory & {
  note: string;
};

type ContextWatchItem = {
  title: string;
  source: string;
  date: string;
  original_url?: string;
  reason_dropped: "dropped_time_mode";
  context_score: number;
  context_reasons: string[];
  note: string;
};

type PacketThemeCluster = {
  theme: string;
  story_count: number;
  stories: string[];
};

type EnergyStoryRef = {
  id: string;
  title: string;
  source: string;
  url: string;
  primary_category?: string;
  importance_tier?: string;
  system_pressure?: boolean;
};

type EnergyClusterOutput = {
  cluster_id: string;
  label: string;
  story_count: number;
  classification?: string;
  cluster_type?: string;
  compression_line?: string;
  theme_id?: string;
  theme_label?: string;
  stories: EnergyStoryRef[];
};

type EnergyThemeOutput = {
  theme_id: string;
  theme: string;
  explanation: string;
  story_count: number;
  clusters: EnergyClusterOutput[];
};

type EnergySignalOutput = {
  cluster_id?: string;
  label: string;
  explanation?: string;
  stories: EnergyStoryRef[];
};

type EnergyEditorialOutput = {
  editorial_read: string;
  themes: EnergyThemeOutput[];
  cluster_breakdown: EnergyClusterOutput[];
  signals_to_watch: EnergySignalOutput[];
};

type AiTechStoryRef = {
  id: string;
  title: string;
  source: string;
  url: string;
  primary_axis?: string;
  editorial_bucket?: string;
  geography?: string;
  importance_tier?: string;
};

type AiTechEditorialOutput = {
  core_signals: AiTechStoryRef[];
  interpretation_layer: AiTechStoryRef[];
  capability_watch: AiTechStoryRef[];
};

type PropertyStoryRef = {
  id: string;
  title: string;
  source: string;
  url: string;
  primary_axis?: string;
  editorial_bucket?: string;
  geography?: string;
  importance_tier?: string;
  stress_signal?: boolean;
};

type PropertyEditorialOutput = {
  editorial_read: string[];
  core_signals: PropertyStoryRef[];
  interpretation_layer: PropertyStoryRef[];
  capability_watch: PropertyStoryRef[];
};

type WeeklyEditorialPacket = {
  week_of: string;
  time_mode: AiTechTimeMode;
  beat_name: string;
  editorial_read: string[];
  top_stories: TopStory[];
  secondary_signals: SecondarySignal[];
  context_watch: ContextWatchItem[];
  theme_clusters: PacketThemeCluster[];
  energy_output?: EnergyEditorialOutput;
  ai_tech_output?: AiTechEditorialOutput;
  property_output?: PropertyEditorialOutput;
  notes: {
    top_story_count: number;
    secondary_count: number;
    context_count: number;
  };
};

type EditorialBriefItem = {
  label: string;
  score: number;
  whyItMatters: string;
  pattern: string;
  tension: string;
  supportingStories: NormalizedStory[];
};

const THEME_RULES: Record<string, string[]> = {
  models: ["ai_models", "model_or_platform_change", "foundational_research"],
  infra: ["ai_infra", "infrastructure_move"],
  partnerships: ["strategic_partnership"],
  policy: ["policy_regulation", "policy_shift"],
  safety: ["ai_safety", "safety_or_governance"],
  enterprise: ["enterprise_ai", "enterprise_scale_signal"],
  "finance_m_and_a": ["strategic_finance"]
};

const CONTEXT_KEYWORDS = {
  impact: [
    "openai",
    "anthropic",
    "google",
    "microsoft",
    "meta",
    "amazon",
    "nvidia",
    "model",
    "models",
    "gpt",
    "api",
    "platform",
    "chatgpt",
    "codex",
    "sora"
  ],
  strategic: [
    "partnership",
    "partner",
    "policy",
    "regulation",
    "court",
    "antitrust",
    "safety",
    "governance",
    "licensing",
    "copyright",
    "investment",
    "acquire",
    "acquisition"
  ],
  breadth: [
    "enterprise",
    "developer",
    "developers",
    "users",
    "customer",
    "business",
    "platform",
    "integration",
    "pricing",
    "compliance",
    "cloud",
    "compute"
  ]
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

function sanitizeText(value: string): string {
  return value
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countKeywordHits(text: string, keywords: string[]): number {
  const normalized = normalizeText(text);

  return keywords.reduce((count, keyword) => {
    return normalized.includes(normalizeText(keyword)) ? count + 1 : count;
  }, 0);
}

function getWeekOf(stories: NormalizedStory[], fallbackDate: string): string {
  const latestDate =
    stories.length > 0
      ? stories
          .map((story) => new Date(story.publishedAt).getTime())
          .reduce((latest, current) => Math.max(latest, current), 0)
      : new Date(fallbackDate).getTime();
  const weekStart = new Date(latestDate);
  const utcDay = weekStart.getUTCDay();
  const diffToMonday = (utcDay + 6) % 7;

  weekStart.setUTCDate(weekStart.getUTCDate() - diffToMonday);
  weekStart.setUTCHours(0, 0, 0, 0);

  return weekStart.toISOString().slice(0, 10);
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().slice(0, 10);
}

function splitIntoSentences(summary: string): string[] {
  const cleanSummary = sanitizeText(summary);

  if (!cleanSummary) {
    return [];
  }

  return cleanSummary
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20)
    .slice(0, 5);
}

function joinSentences(sentences: string[], fallback: string): string {
  const clean = [...new Set(sentences.map((sentence) => sanitizeText(sentence)).filter(Boolean))];

  if (clean.length === 0) {
    return fallback;
  }

  return clean.join(" ");
}

function buildWhatHappened(story: PrioritizedStory): string {
  const summarySentences = splitIntoSentences(story.summary);

  if (summarySentences.length >= 2) {
    return joinSentences(summarySentences.slice(0, 4), sanitizeText(story.summary));
  }

  const sentences: string[] = [];
  const title = sanitizeText(story.title);
  const summary = sanitizeText(story.summary);

  if (summary) {
    sentences.push(summary);
  } else {
    sentences.push(`${title} was one of the strongest AI tech developments in this run.`);
  }

  if (story.tags.includes("ai_models")) {
    sentences.push("The development centers on an AI model, platform capability, or product release rather than a generic market update.");
  }

  if (story.tags.includes("ai_infrastructure")) {
    sentences.push("It includes a concrete infrastructure, compute, or deployment angle tied to how AI systems are built or run.");
  }

  if (story.tags.includes("applied_ai")) {
    sentences.push("The development also points to a practical deployment or usage context instead of staying purely theoretical.");
  }

  return joinSentences(
    sentences.slice(0, 4),
    `${title}. ${summary}`.trim()
  );
}

function buildWhyThisMatters(story: PrioritizedStory): string {
  const title = sanitizeText(story.title);
  const summary = sanitizeText(story.summary);
  const reasons = new Set(story.priority_reasons);
  const sentences: string[] = [];

  if (reasons.has("strategic_finance")) {
    sentences.push("This changes the competitive picture because it expands the capital base behind future model development, compute build-out, or acquisitions.");
  }

  if (reasons.has("infrastructure_move")) {
    sentences.push("It matters operationally because infrastructure shifts change what can be deployed, how fast systems can run, and what those deployments cost.");
  }

  if (reasons.has("model_or_platform_change")) {
    sentences.push("For developers and product teams, this can change what tools are available, what workflows are feasible, and where new application building moves next.");
  }

  if (reasons.has("strategic_partnership")) {
    sentences.push("The partnership angle matters because it can reshape distribution, integration paths, and which vendors become embedded in enterprise or government stacks.");
  }

  if (reasons.has("policy_shift")) {
    sentences.push("This has policy consequences because it can change compliance expectations, procurement decisions, or the terms under which AI systems are deployed.");
  }

  if (reasons.has("safety_or_governance")) {
    sentences.push("The safety angle matters because it affects how companies evaluate risk, set product guardrails, or justify broader adoption.");
  }

  if (reasons.has("enterprise_scale_signal")) {
    sentences.push("The enterprise angle gives this longer shelf life because it points to adoption in production environments rather than limited experimentation.");
  }

  if (reasons.has("broad_ecosystem_impact")) {
    sentences.push("The effects are likely to spread beyond one company because this touches multiple layers of the AI stack, from builders and buyers to platform operators.");
  } else if (reasons.has("multi_group_impact")) {
    sentences.push("This has broader editorial value because it affects more than one important constituency, such as developers, enterprise teams, or platform partners.");
  }

  if (sentences.length === 0) {
    if (summary) {
      sentences.push(`The practical consequence of ${title.toLowerCase()} is that it changes how AI products are built, deployed, or adopted.`);
    } else {
      sentences.push("This matters because it signals a concrete change in the AI market rather than a one-off announcement.");
    }
  }

  return joinSentences(sentences.slice(0, 4), summary || title);
}

function scoreContextDrop(
  story: StoryDrop,
  latestDroppedDate: number
): ContextWatchItem {
  const text = `${story.title ?? ""} ${story.details ?? ""}`;
  const contextReasons: string[] = [];
  let score = 0;

  if (countKeywordHits(text, CONTEXT_KEYWORDS.impact) >= 2) {
    score += 3;
    contextReasons.push("editorial_impact");
  } else if (countKeywordHits(text, CONTEXT_KEYWORDS.impact) >= 1) {
    score += 1.5;
    contextReasons.push("relevant_ai_signal");
  }

  if (countKeywordHits(text, CONTEXT_KEYWORDS.strategic) > 0) {
    score += 2.5;
    contextReasons.push("strategic_context");
  }

  const breadthHits = countKeywordHits(text, CONTEXT_KEYWORDS.breadth);

  if (breadthHits >= 2) {
    score += 2;
    contextReasons.push("broad_downstream_impact");
  } else if (breadthHits === 1) {
    score += 1;
    contextReasons.push("practical_context");
  }

  const storyTime = story.date ? new Date(story.date).getTime() : 0;
  const daysOld = Math.max(0, Math.floor((latestDroppedDate - storyTime) / 86_400_000));

  if (daysOld <= 30) {
    score += 1;
    contextReasons.push("recent_within_context_pool");
  } else if (daysOld <= 90) {
    score += 0.5;
  }

  return {
    title: sanitizeText(story.title ?? ""),
    source: story.source,
    date: story.date ?? "",
    original_url: story.url,
    reason_dropped: "dropped_time_mode",
    context_score: Number(score.toFixed(2)),
    context_reasons: contextReasons,
    note:
      contextReasons.includes("strategic_context")
        ? "Useful background item with longer-tail strategic context."
        : "Useful background context from outside the current monitoring window."
  };
}

function buildThemeClusters(
  topStories: TopStory[],
  secondarySignals: SecondarySignal[]
): PacketThemeCluster[] {
  const combined = [...topStories, ...secondarySignals];
  const clusters: PacketThemeCluster[] = [];

  for (const [theme, markers] of Object.entries(THEME_RULES)) {
    const matchingStories = combined.filter((story) =>
      [...story.tags, ...story.priority_reasons].some((marker) => markers.includes(marker))
    );

    if (matchingStories.length === 0) {
      continue;
    }

    clusters.push({
      theme,
      story_count: matchingStories.length,
      stories: matchingStories.slice(0, 6).map((story) => story.title)
    });
  }

  return clusters.sort((left, right) => right.story_count - left.story_count);
}

function buildStoryMap(stories: NormalizedStory[]): Map<string, NormalizedStory> {
  return new Map(stories.map((story) => [story.title, story]));
}

function enrichTopStory(
  story: PrioritizedStory & { why_it_matters: string },
  storyMap: Map<string, NormalizedStory>
): TopStory {
  const sourceStory = storyMap.get(story.title);
  const { why_it_matters: _unusedWhyItMatters, ...baseStory } = story;

  return {
    ...baseStory,
    title: sanitizeText(baseStory.title),
    summary: sanitizeText(baseStory.summary),
    original_url: sourceStory?.url ?? baseStory.original_url,
    what_happened: buildWhatHappened(baseStory),
    why_this_matters: buildWhyThisMatters(baseStory)
  };
}

function enrichSecondaryStory(
  story: PrioritizedStory & { note: string },
  storyMap: Map<string, NormalizedStory>
): SecondarySignal {
  const sourceStory = storyMap.get(story.title);

  return {
    ...story,
    title: sanitizeText(story.title),
    summary: sanitizeText(story.summary),
    original_url: sourceStory?.url ?? story.original_url
  };
}

function renderLink(url?: string): string {
  return url ? `[Original link](${url})` : "Original link unavailable";
}

function averagePriority(stories: NormalizedStory[]): number {
  if (stories.length === 0) {
    return 0;
  }

  return (
    stories.reduce((sum, story) => sum + (story.priority_score ?? 0), 0) / stories.length
  );
}

function buildStoryMapById(stories: NormalizedStory[]): Map<string, NormalizedStory> {
  return new Map(stories.map((story) => [story.id, story]));
}

function topValues(values: string[], limit: number): string[] {
  const counts = new Map<string, number>();

  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, limit)
    .map(([value]) => value);
}

function reasonLineForReasonCode(reasonCode?: string): string | null {
  switch (reasonCode) {
    case "execution_consequence":
      return "Execution problems are no longer abstract; they are showing up in operating decisions.";
    case "policy_regulatory_move":
      return "Policy movement is starting to shape operating choices before the rules are fully settled.";
    case "developing_pattern":
      return "More than one company is running into the same constraint, which makes this more than a one-off.";
    case "market_signal":
      return "Positioning is getting ahead of hard proof on demand, pricing power, or returns.";
    case "industry_repositioning":
      return "Competitive positioning is moving faster than the market has settled on durable winners.";
    case "meaningful_shift":
      return "This reads like a real directional change, not another routine weekly increment.";
    case "local_business_relevance":
      return "The downstream business effects are concrete enough to matter outside specialist circles.";
    case "ongoing_story_advance":
      return "An ongoing story has moved far enough to change the editorial calculation.";
    case "counterpoint":
      return "This cuts against the dominant storyline and is worth keeping in view.";
    case "watchlist_signal":
      return "This is still early, but it is the kind of signal that matters if it repeats.";
    default:
      return null;
  }
}

function inferPatternAndTension(
  reasonCodes: string[],
  angles: string[]
): { pattern: string; tension: string } {
  const joined = angles.join(" | ").toLowerCase();
  const joinedReasons = reasonCodes.join(" | ").toLowerCase();

  if (
    joined.includes("infrastructure lag") ||
    joined.includes("execution gap") ||
    joinedReasons.includes("execution_consequence")
  ) {
    return {
      pattern: "Infrastructure is scaling faster than coordination.",
      tension: "Tension: ambition vs capacity"
    };
  }

  if (
    joined.includes("policy pressure") ||
    joined.includes("regulation moving") ||
    joinedReasons.includes("policy_regulatory_move")
  ) {
    return {
      pattern: "Policy is moving faster than operating clarity.",
      tension: "Tension: policy vs execution"
    };
  }

  if (
    joined.includes("demand still unproven") ||
    joined.includes("adoption pressure") ||
    joinedReasons.includes("market_signal")
  ) {
    return {
      pattern: "Enterprise positioning is getting pushed ahead of proven demand.",
      tension: "Tension: adoption vs proof"
    };
  }

  if (joined.includes("supply risk")) {
    return {
      pattern: "Supply constraints are starting to show through the growth narrative.",
      tension: "Tension: growth narrative vs operating strain"
    };
  }

  if (
    joined.includes("competitive position") ||
    joinedReasons.includes("industry_repositioning")
  ) {
    return {
      pattern: "Competitive repositioning is accelerating before market roles are settled.",
      tension: "Tension: competition vs readiness"
    };
  }

  if (joined.includes("developer workflow")) {
    return {
      pattern: "Platform change is showing up first in developer workflow and tooling.",
      tension: "Tension: platform expansion vs developer readiness"
    };
  }

  return {
    pattern: "Platform expansion is outrunning stable operating models.",
    tension: "Tension: momentum vs operating reality"
  };
}

function inferPatternAndTensionForLabel(
  label: string,
  reasonCodes: string[],
  angles: string[]
): { pattern: string; tension: string } {
  const normalizedLabel = normalizeText(label);

  if (normalizedLabel.includes("pricing pressure")) {
    return {
      pattern: "Vehicle and fuel costs are pressing harder against household purchasing power.",
      tension: "Tension: affordability vs aspiration"
    };
  }

  if (normalizedLabel.includes("ownership cost")) {
    return {
      pattern: "The real cost of owning and using a vehicle is becoming harder to hide behind sticker prices.",
      tension: "Tension: cost vs usage"
    };
  }

  if (normalizedLabel.includes("ev transition")) {
    return {
      pattern: "EV and hybrid launches are moving faster than the everyday infrastructure around them.",
      tension: "Tension: adoption vs infrastructure"
    };
  }

  if (normalizedLabel.includes("infrastructure constraint")) {
    return {
      pattern: "Mobility demand is running into road, charging, and transport capacity limits.",
      tension: "Tension: usage vs capacity"
    };
  }

  if (normalizedLabel.includes("regulation and enforcement")) {
    return {
      pattern: "Rules are starting to bite where motoring culture and road discipline have been loose.",
      tension: "Tension: policy vs enforcement"
    };
  }

  if (normalizedLabel.includes("supply and availability")) {
    return {
      pattern: "Availability is becoming part of the market story, not just background logistics.",
      tension: "Tension: supply vs demand"
    };
  }

  if (normalizedLabel.includes("consumer demand shift")) {
    return {
      pattern: "Brands are testing what Filipino buyers will still stretch for under tighter cost pressure.",
      tension: "Tension: aspiration vs affordability"
    };
  }

  if (normalizedLabel.includes("motoring market signal")) {
    return {
      pattern: "The market is starting to show what buyers can still afford, and what they will not.",
      tension: "Tension: cost vs demand"
    };
  }

  if (normalizedLabel.includes("price growth slowdown")) {
    return {
      pattern: "Home-price growth is losing speed rather than confirming a clean demand rebound.",
      tension: "Tension: price resilience vs buyer capacity"
    };
  }

  if (normalizedLabel.includes("office market stress")) {
    return {
      pattern: "Office demand is still being tested by vacancy, rent, and tenant-cost pressure.",
      tension: "Tension: supply overhang vs usable demand"
    };
  }

  if (normalizedLabel.includes("residential permit weakness")) {
    return {
      pattern: "Residential construction signals are softening where demand is not strong enough to support faster building.",
      tension: "Tension: build pipeline vs real demand"
    };
  }

  if (normalizedLabel.includes("housing finance support")) {
    return {
      pattern: "Policy support is moving through housing finance, but it has not erased affordability pressure.",
      tension: "Tension: credit support vs household capacity"
    };
  }

  if (normalizedLabel.includes("property stress")) {
    return {
      pattern: "Stress signals are showing up in vacancy, oversupply, or weaker absorption rather than in launch volume.",
      tension: "Tension: inventory vs demand"
    };
  }

  if (normalizedLabel.includes("affordability pressure")) {
    return {
      pattern: "The market is being shaped by who can still buy, rent, or absorb higher housing costs.",
      tension: "Tension: prices vs purchasing power"
    };
  }

  if (normalizedLabel.includes("supply pipeline shift")) {
    return {
      pattern: "Supply is becoming more uneven as construction, inventory, and geography matter more than headline expansion.",
      tension: "Tension: development pipeline vs market balance"
    };
  }

  if (normalizedLabel.includes("credit tightening")) {
    return {
      pattern: "Credit rules and lending behavior are moving toward stricter discipline.",
      tension: "Tension: loan growth vs borrower quality"
    };
  }

  if (normalizedLabel.includes("borrower risk")) {
    return {
      pattern: "Borrower stress is becoming more visible beneath still-active lending.",
      tension: "Tension: growth vs asset quality"
    };
  }

  if (normalizedLabel.includes("liquidity preservation")) {
    return {
      pattern: "Banks are prioritizing buffers and optionality over aggressive balance-sheet expansion.",
      tension: "Tension: liquidity vs growth"
    };
  }

  if (normalizedLabel.includes("deposit funding shift")) {
    return {
      pattern: "Deposit movement is making funding cost and liquidity management harder to ignore.",
      tension: "Tension: funding stability vs margin pressure"
    };
  }

  if (normalizedLabel.includes("fuel price easing")) {
    return {
      pattern: "Fuel prices are easing at the pump, but cost relief remains exposed to external swings.",
      tension: "Tension: short-term relief vs oil exposure"
    };
  }

  if (normalizedLabel.includes("energy price pressure")) {
    return {
      pattern: "Energy costs are still feeding into household and business pressure.",
      tension: "Tension: cost recovery vs affordability"
    };
  }

  if (normalizedLabel.includes("supply reliability risk")) {
    return {
      pattern: "Supply and reserve signals are keeping reliability risk close to the surface.",
      tension: "Tension: demand needs vs available supply"
    };
  }

  if (normalizedLabel.includes("grid capacity risk")) {
    return {
      pattern: "Grid and project execution are shaping how much capacity the system can actually use.",
      tension: "Tension: infrastructure ambition vs delivery"
    };
  }

  if (normalizedLabel.includes("policy cost shift")) {
    return {
      pattern: "Policy decisions are shifting how energy costs move through utilities, businesses, and households.",
      tension: "Tension: cost recovery vs public burden"
    };
  }

  if (normalizedLabel.includes("external energy shock")) {
    return {
      pattern: "External fuel shocks are passing through to local prices, supply planning, and operating costs.",
      tension: "Tension: global exposure vs local resilience"
    };
  }

  if (normalizedLabel.includes("demand pressure")) {
    return {
      pattern: "Demand is making supply, price, and reliability constraints harder to absorb.",
      tension: "Tension: consumption needs vs system capacity"
    };
  }

  if (normalizedLabel.includes("model capability race")) {
    return {
      pattern: "Model capability is advancing, but usefulness depends on access, reliability, and workflow fit.",
      tension: "Tension: capability vs adoption"
    };
  }

  if (normalizedLabel.includes("compute capacity strain")) {
    return {
      pattern: "Compute demand is turning infrastructure into a strategic constraint.",
      tension: "Tension: scaling ambition vs capacity"
    };
  }

  if (normalizedLabel.includes("enterprise adoption")) {
    return {
      pattern: "Enterprise positioning is getting pushed ahead of proven demand.",
      tension: "Tension: adoption vs proof"
    };
  }

  if (normalizedLabel.includes("industry repositioning")) {
    return {
      pattern: "Competitive repositioning is accelerating before market roles are settled.",
      tension: "Tension: competition vs readiness"
    };
  }

  if (
    normalizedLabel.includes("models and platform") ||
    normalizedLabel.includes("platform update")
  ) {
    return {
      pattern: "Platform expansion is outrunning stable operating models.",
      tension: "Tension: momentum vs operating reality"
    };
  }

  if (normalizedLabel.includes("policy and governance")) {
    return {
      pattern: "Policy is moving faster than operating clarity.",
      tension: "Tension: policy vs execution"
    };
  }

  if (normalizedLabel.includes("ai safety governance")) {
    return {
      pattern: "Safety commitments are turning into product and governance constraints.",
      tension: "Tension: capability vs safeguards"
    };
  }

  if (normalizedLabel.includes("supply chain")) {
    return {
      pattern: "Supply constraints are starting to show through the growth narrative.",
      tension: "Tension: growth narrative vs operating strain"
    };
  }

  if (normalizedLabel.includes("capital caution")) {
    return {
      pattern: "Pricing and investment claims are running ahead of stable proof of demand.",
      tension: "Tension: investment vs demand"
    };
  }

  if (normalizedLabel.includes("critical infrastructure cyber risk")) {
    return {
      pattern: "Critical infrastructure risk is becoming harder to separate from day-to-day operations.",
      tension: "Tension: digital dependence vs system resilience"
    };
  }

  if (normalizedLabel.includes("ai policy signaling")) {
    return {
      pattern: "Policy positioning is becoming part of platform strategy rather than a side conversation.",
      tension: "Tension: influence vs operating clarity"
    };
  }

  if (normalizedLabel.includes("public infrastructure strain")) {
    return {
      pattern: "Public systems are showing how thin operating capacity can get under stress.",
      tension: "Tension: system dependence vs institutional capacity"
    };
  }

  if (normalizedLabel.includes("infrastructure execution")) {
    return {
      pattern: "Infrastructure is scaling faster than coordination.",
      tension: "Tension: ambition vs capacity"
    };
  }

  return inferPatternAndTension(reasonCodes, angles);
}

function buildEditorialWhyLine(
  reasonCodes: string[],
  angles: string[],
  reasonKept: string[]
): string {
  const joinedAngles = angles.join(" | ").toLowerCase();
  const joinedReasons = reasonCodes.join(" | ").toLowerCase();

  if (
    joinedAngles.includes("infrastructure lag") ||
    joinedAngles.includes("execution gap") ||
    joinedReasons.includes("execution_consequence")
  ) {
    return "Multiple players are adding capability faster than they can secure capacity, coordination, or deployment discipline.";
  }

  if (
    joinedAngles.includes("policy pressure") ||
    joinedAngles.includes("regulation moving") ||
    joinedReasons.includes("policy_regulatory_move")
  ) {
    return "Regulatory and governance pressure is starting to shape rollout decisions before operating rules are fully settled.";
  }

  if (
    joinedAngles.includes("enterprise adoption") ||
    joinedAngles.includes("demand still unproven") ||
    joinedReasons.includes("market_signal")
  ) {
    return "Vendors are pushing enterprise positioning before usage patterns, ROI, and buyer confidence have fully stabilized.";
  }

  if (
    joinedAngles.includes("competitive position") ||
    joinedReasons.includes("industry_repositioning")
  ) {
    return "Companies are repositioning quickly around control of distribution, developer workflow, and enterprise share.";
  }

  if (
    joinedAngles.includes("model competition") ||
    joinedAngles.includes("developer workflow changing")
  ) {
    return "Product and platform moves are starting to matter less as launches and more as battles over who controls the workflow.";
  }

  const reasonLine = reasonLineForReasonCode(reasonCodes[0]);

  if (reasonLine) {
    return reasonLine;
  }

  if (angles.length > 0) {
    if (angles[0].includes("infrastructure")) {
      return "Multiple players are adding capability faster than they can stabilize the operating layer.";
    }

    if (angles[0].includes("policy")) {
      return "The policy story is now shaping operating decisions rather than sitting off to the side.";
    }

    if (angles[0].includes("adoption") || angles[0].includes("demand")) {
      return "Vendors are pushing enterprise positioning before usage patterns and returns are fully settled.";
    }

    if (angles[0].includes("competitive")) {
      return "Competitive moves are arriving faster than the market has agreed on durable winners.";
    }

    if (angles[0].includes("supply")) {
      return "Capacity pressure is starting to surface in stories that were previously framed as growth stories.";
    }
  }

  if (reasonKept.some((reason) => reason.toLowerCase().includes("pattern now appearing"))) {
    return "More than one item now points in the same direction, which makes this worth treating as a live editorial thread.";
  }

  if (reasonKept.some((reason) => reason.toLowerCase().includes("policy move"))) {
    return "Policy movement is carrying visible downstream business consequences.";
  }

  return "Taken together, these items carry more editorial weight than any single story would on its own.";
}

function buildEditorialWhyLineForLabel(
  label: string,
  reasonCodes: string[],
  angles: string[],
  reasonKept: string[]
): string {
  const normalizedLabel = normalizeText(label);

  if (normalizedLabel.includes("pricing pressure")) {
    return "Price cuts, fuel swings, and SRP signals are turning affordability into the central motoring story.";
  }

  if (normalizedLabel.includes("ownership cost")) {
    return "The useful signal is not just what vehicles cost to buy, but what they cost to keep, fuel, register, and use.";
  }

  if (normalizedLabel.includes("ev transition")) {
    return "EV and hybrid momentum matters only if charging access, pricing, and everyday use can catch up.";
  }

  if (normalizedLabel.includes("infrastructure constraint")) {
    return "Road, charging, and mobility capacity are shaping what the market can actually absorb.";
  }

  if (normalizedLabel.includes("regulation and enforcement")) {
    return "Policy only changes driver and operator behavior when enforcement becomes visible and consistent.";
  }

  if (normalizedLabel.includes("supply and availability")) {
    return "Availability and inventory are becoming practical constraints on what buyers can choose and what dealers can push.";
  }

  if (normalizedLabel.includes("consumer demand shift")) {
    return "These stories show where manufacturers think Filipino buyers will compromise, stretch, or walk away.";
  }

  if (normalizedLabel.includes("motoring market signal")) {
    return "Early signal of where buyer interest, product strategy, and affordability may be moving next.";
  }

  if (normalizedLabel.includes("enterprise adoption")) {
    return "Enterprise rollout is getting pushed into the market before demand, ROI, and operating confidence have fully settled.";
  }

  if (normalizedLabel.includes("price growth slowdown")) {
    return "Slower property-price growth changes the read on demand, affordability, and pricing power.";
  }

  if (normalizedLabel.includes("office market stress")) {
    return "Office stress matters because vacancy, rents, and leasing behavior reveal real utilization, not promotional demand.";
  }

  if (normalizedLabel.includes("residential permit weakness")) {
    return "Permit weakness gives an early read on whether developers and buyers are pulling back from the residential pipeline.";
  }

  if (normalizedLabel.includes("housing finance support")) {
    return "Housing finance support matters only if it improves access enough to offset affordability pressure.";
  }

  if (normalizedLabel.includes("property stress")) {
    return "Vacancy, oversupply, and weak absorption are harder property signals than launch activity.";
  }

  if (normalizedLabel.includes("affordability pressure")) {
    return "Affordability pressure determines who can still buy or rent, and where demand starts to break.";
  }

  if (normalizedLabel.includes("supply pipeline shift")) {
    return "Pipeline shifts matter because new supply can worsen imbalance if demand is not keeping up.";
  }

  if (normalizedLabel.includes("credit tightening")) {
    return "Credit discipline changes how much risk banks are willing to carry and which borrowers can still access loans.";
  }

  if (normalizedLabel.includes("borrower risk")) {
    return "Borrower stress matters because loan growth is less useful if asset quality is weakening underneath it.";
  }

  if (normalizedLabel.includes("liquidity preservation")) {
    return "Liquidity management shapes whether banks stretch for growth or protect balance-sheet buffers.";
  }

  if (normalizedLabel.includes("deposit funding shift")) {
    return "Deposit movement can change funding costs, margins, and competitive pressure across banks.";
  }

  if (normalizedLabel.includes("fuel price easing")) {
    return "Pump-price relief matters because it quickly changes household transport costs and business operating pressure.";
  }

  if (normalizedLabel.includes("energy price pressure")) {
    return "Energy-price pressure feeds through to households, operators, and policy decisions.";
  }

  if (normalizedLabel.includes("supply reliability risk")) {
    return "Reliability risk matters when supply tightness can turn into outages, reserves pressure, or higher prices.";
  }

  if (normalizedLabel.includes("grid capacity risk")) {
    return "Grid and project execution determine whether new capacity can actually reach users.";
  }

  if (normalizedLabel.includes("policy cost shift")) {
    return "Policy decisions matter because they decide whether energy pressure lands on utilities, businesses, or consumers.";
  }

  if (normalizedLabel.includes("external energy shock")) {
    return "External shocks matter when they pass through to local prices, supply planning, or reliability risk.";
  }

  if (normalizedLabel.includes("demand pressure")) {
    return "Demand pressure can turn ordinary supply tightness into a price or reliability problem.";
  }

  if (normalizedLabel.includes("model capability race")) {
    return "Capability improvements matter when they change what users, developers, or enterprises can actually do.";
  }

  if (normalizedLabel.includes("compute capacity strain")) {
    return "Compute capacity is becoming one of the practical limits on AI scaling.";
  }

  if (normalizedLabel.includes("industry repositioning")) {
    return "These moves matter because they point to who is trying to lock up workflow, distribution, or strategic ground before the market settles.";
  }

  if (
    normalizedLabel.includes("models and platform") ||
    normalizedLabel.includes("platform update")
  ) {
    return "Launches are increasingly carrying platform consequences, not just product novelty, because they shape where developers and users spend time.";
  }

  if (normalizedLabel.includes("policy and governance")) {
    return "Governance pressure is becoming operational, with real consequences for rollout, compliance, and product posture.";
  }

  if (normalizedLabel.includes("ai safety governance")) {
    return "Safety work is becoming part of product posture and governance discipline rather than a separate reputational add-on.";
  }

  if (normalizedLabel.includes("supply chain")) {
    return "The growth story is now colliding with harder constraints in components, shipping, and delivery timelines.";
  }

  if (normalizedLabel.includes("capital caution")) {
    return "Funding and pricing claims are worth tracking because they reveal where AI demand still looks less settled than the narrative suggests.";
  }

  if (normalizedLabel.includes("critical infrastructure cyber risk")) {
    return "Cyber and infrastructure risk is starting to look like an operating problem, not just a security sidebar.";
  }

  if (normalizedLabel.includes("ai policy signaling")) {
    return "Policy signaling matters when companies start trying to shape the operating environment, not just react to it.";
  }

  if (normalizedLabel.includes("public infrastructure strain")) {
    return "These stories matter because they show how fragile operating systems can become before policymakers or operators catch up.";
  }

  return buildEditorialWhyLine(reasonCodes, angles, reasonKept);
}

function pickSupportingStories(
  stories: NormalizedStory[],
  limit: number
): NormalizedStory[] {
  return [...stories]
    .sort((left, right) => {
      const priorityDelta = (right.priority_score ?? 0) - (left.priority_score ?? 0);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return right.date.localeCompare(left.date);
    })
    .slice(0, limit);
}

function labelLooksLikeRawTitle(label: string): boolean {
  const normalized = sanitizeText(label);

  return (
    /^(introducing|announcing|openai|meta|google|microsoft|nvidia)\b/i.test(normalized) ||
    normalized.split(" ").length >= 5
  );
}

function deriveEditorialLabel(
  fallbackLabel: string,
  reasonCodes: string[],
  angles: string[],
  stories: NormalizedStory[]
): string {
  const text = normalizeText(
    `${fallbackLabel} ${stories.map((story) => `${story.title} ${story.summary ?? ""}`).join(" ")}`
  );

  if (stories.some((story) => story.beat === "philippine_motoring")) {
    if (
      text.includes("price") ||
      text.includes("pricing") ||
      text.includes("srp") ||
      text.includes("fuel") ||
      angles.some((angle) => angle.includes("pricing") || angle.includes("cost"))
    ) {
      return "pricing pressure";
    }

    if (
      text.includes("ev") ||
      text.includes("hybrid") ||
      text.includes("charging") ||
      text.includes("electrified") ||
      angles.some((angle) => angle.includes("EV transition"))
    ) {
      return "EV transition gap";
    }

    if (
      text.includes("lto") ||
      text.includes("dotr") ||
      text.includes("regulation") ||
      text.includes("enforcement") ||
      reasonCodes.includes("policy_regulatory_move")
    ) {
      return "regulation and enforcement";
    }

    if (
      text.includes("road") ||
      text.includes("toll") ||
      text.includes("traffic") ||
      text.includes("infrastructure")
    ) {
      return "infrastructure constraint";
    }

    if (text.includes("supply") || text.includes("inventory") || text.includes("availability")) {
      return "supply and availability";
    }

    if (
      text.includes("segment") ||
      text.includes("demand") ||
      text.includes("buyers") ||
      text.includes("market")
    ) {
      return "consumer demand shift";
    }
  }

  if (
    text.includes("acquire") ||
    text.includes("acquisition") ||
    text.includes("merger")
  ) {
    return "industry repositioning";
  }

  if (
    text.includes("gpu") ||
    text.includes("compute") ||
    text.includes("inference") ||
    text.includes("capacity") ||
    angles.some((angle) => angle.includes("infrastructure") || angle.includes("execution"))
  ) {
    return "infrastructure execution gap";
  }

  if (
    text.includes("enterprise") ||
    text.includes("adoption") ||
    text.includes("pricing") ||
    text.includes("workflow") ||
    angles.some((angle) => angle.includes("adoption") || angle.includes("demand"))
  ) {
    return "enterprise adoption";
  }

  if (
    text.includes("model") ||
    text.includes("api") ||
    text.includes("chatgpt") ||
    text.includes("gemini") ||
    text.includes("launch") ||
    text.includes("release")
  ) {
    return "models and platform releases";
  }

  if (
    text.includes("latest ai news") ||
    text.includes("live updates") ||
    text.includes("monthly roundup")
  ) {
    return "platform update cadence";
  }

  if (
    text.includes("wearable") ||
    text.includes("ipod shuffle") ||
    text.includes("consumer ai device")
  ) {
    return "consumer AI device experimentation";
  }

  if (
    text.includes("google vids") ||
    text.includes("share videos at no cost") ||
    text.includes("bundling")
  ) {
    return "platform bundling pressure";
  }

  if (
    text.includes("economic proposals") ||
    text.includes("economic proposal") ||
    text.includes("dc thinks")
  ) {
    return "AI policy signaling";
  }

  if (
    text.includes("media") ||
    text.includes("journalism") ||
    text.includes("politics") ||
    text.includes("democracy now")
  ) {
    return "media and platform politics";
  }

  if (
    text.includes("child safety") ||
    text.includes("safety blueprint") ||
    text.includes("governance") ||
    angles.some((angle) => angle.includes("safety"))
  ) {
    return "AI safety governance";
  }

  if (
    text.includes("hacker") ||
    text.includes("hackers") ||
    text.includes("critical infrastructure") ||
    text.includes("energy and water")
  ) {
    return "critical infrastructure cyber risk";
  }

  if (
    text.includes("emergency system") ||
    text.includes("hanging by a thread") ||
    text.includes("public services")
  ) {
    return "public infrastructure strain";
  }

  if (
    text.includes("gtc") ||
    text.includes("physical ai") ||
    text.includes("omniverse")
  ) {
    return "physical AI and industrial push";
  }

  if (
    text.includes("policy") ||
    text.includes("regulation") ||
    text.includes("court") ||
    text.includes("compliance") ||
    reasonCodes.includes("policy_regulatory_move")
  ) {
    return "policy and governance pressure";
  }

  if (
    text.includes("supply") ||
    text.includes("shortage") ||
    text.includes("shipping")
  ) {
    return "supply chain strain";
  }

  if (
    text.includes("investment") ||
    text.includes("valuation") ||
    text.includes("pricing pressure")
  ) {
    return "capital caution";
  }

  return sanitizeText(fallbackLabel);
}

function fallbackEditorialLabel(story: NormalizedStory): string {
  const text = normalizeText(
    `${story.title} ${story.summary ?? ""} ${story.tags.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`
  );

  if (story.beat === "philippine_motoring") {
    if (text.includes("price") || text.includes("pricing") || text.includes("srp") || text.includes("fuel")) {
      return "pricing pressure";
    }

    if (text.includes("ev") || text.includes("hybrid") || text.includes("charging") || text.includes("battery")) {
      return "EV transition gap";
    }

    if (text.includes("lto") || text.includes("dotr") || text.includes("regulation") || text.includes("enforcement")) {
      return "regulation and enforcement";
    }

    if (text.includes("road") || text.includes("toll") || text.includes("traffic") || text.includes("infrastructure")) {
      return "infrastructure constraint";
    }

    if (text.includes("supply") || text.includes("inventory") || text.includes("availability")) {
      return "supply and availability";
    }

    if (text.includes("segment") || text.includes("demand") || text.includes("buyers") || text.includes("market")) {
      return "consumer demand shift";
    }

    return "motoring market signal";
  }

  if (text.includes("media") || text.includes("journalism") || text.includes("politics")) {
    return "media and platform politics";
  }

  if (text.includes("device") || text.includes("wearable") || text.includes("consumer")) {
    return "consumer AI device experimentation";
  }

  if (text.includes("video") || text.includes("workspace") || text.includes("bundling")) {
    return "platform bundling pressure";
  }

  if (text.includes("safety")) {
    return "AI safety governance";
  }

  if (text.includes("supply") || text.includes("shipping") || text.includes("infrastructure")) {
    return "supply chain strain";
  }

  return "emerging AI signal";
}

function isWeakReason(reason?: string): boolean {
  if (!reason) {
    return true;
  }

  const normalized = reason.toLowerCase();

  return (
    normalized.includes("confirms a pattern") ||
    normalized.includes("passed_") ||
    normalized.includes("within_source_cap") ||
    normalized.includes("the pattern is") ||
    normalized.includes("a repeat pattern")
  );
}

function themeSanityScore(
  story: NormalizedStory,
  label: string,
  reasonCodes: string[],
  angles: string[]
): number {
  const text = normalizeText(
    `${story.title} ${story.summary ?? ""} ${story.tags.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`
  );
  const labelText = normalizeText(label);
  const labelTokens = labelText.split(/\s+/).filter((token) => token.length > 3);
  const consumerMismatch = [
    "vacuum",
    "coupon",
    "promo",
    "discount",
    "deal",
    "headphones",
    "laptop",
    "watch",
    "pizza oven"
  ].some((term) => text.includes(term));

  if (consumerMismatch) {
    return -10;
  }

  let score = 0;

  if (story.theme_label && normalizeText(story.theme_label) === labelText) {
    score += 5;
  }

  if (labelTokens.some((token) => text.includes(token))) {
    score += 2;
  }

  if (
    reasonCodes.some((code) => code && story.reason_code === code) ||
    angles.some((angle) => story.angle_signals?.includes(angle))
  ) {
    score += 2;
  }

  if (!isWeakReason(story.reason_kept[0])) {
    score += 1;
  }

  return score;
}

function sectionUnique(items: EditorialBriefItem[], limit: number): EditorialBriefItem[] {
  const seen = new Set<string>();
  const unique: EditorialBriefItem[] = [];

  for (const item of items) {
    if (seen.has(item.label)) {
      continue;
    }

    seen.add(item.label);
    unique.push(item);

    if (unique.length >= limit) {
      break;
    }
  }

  return unique;
}

function supportingReasonCandidates(story: NormalizedStory): string[] {
  const primary = story.reason_kept[0] ?? "";
  const text = normalizeText(
    `${story.title} ${story.summary ?? ""} ${story.tags.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`
  );
  const normalizedPrimary = primary.toLowerCase();
  const candidates: string[] = [];

  if (story.beat === "philippine_motoring") {
    if (
      text.includes("lto") ||
      text.includes("dotr") ||
      text.includes("enforcement") ||
      text.includes("registration") ||
      text.includes("regulation")
    ) {
      candidates.push("Shows where road rules are starting to meet actual driver behavior.");
      candidates.push("Makes enforcement part of the motoring cost and discipline story.");
    }

    if (
      text.includes("diesel") ||
      text.includes("gasoline") ||
      text.includes("fuel") ||
      text.includes("oil") ||
      text.includes("rollback")
    ) {
      candidates.push("Makes fuel-price pressure part of the buyer and operator story.");
      candidates.push("Shows how pump-price swings can quickly change household and fleet costs.");
    }

    if (
      text.includes("price") ||
      text.includes("pricing") ||
      text.includes("srp") ||
      text.includes("priced") ||
      text.includes("starting price")
    ) {
      candidates.push("Makes the affordability test visible, not just the launch claim.");
      candidates.push("Shows how brands are using price to keep buyers in the market.");
    }

    if (
      /\bev\b/.test(text) ||
      /\bevs\b/.test(text) ||
      text.includes("hybrid") ||
      text.includes("phev") ||
      text.includes("electrified")
    ) {
      candidates.push("Shows how electrified models are being pushed into a still-cost-sensitive market.");
      candidates.push("Keeps the EV transition tied to price, range, and everyday usability.");
    }

    if (text.includes("charging") || text.includes("charger") || text.includes("infrastructure")) {
      candidates.push("Makes the charging and infrastructure gap harder to avoid.");
      candidates.push("Shows where EV ambition still depends on practical access.");
    }

    if (
      text.includes("suv") ||
      text.includes("pickup") ||
      text.includes("mpv") ||
      text.includes("motorcycle") ||
      text.includes("segment")
    ) {
      candidates.push("Shows which vehicle segments brands think Filipino buyers will still stretch for.");
      candidates.push("Turns a product story into a read on buyer appetite.");
    }

    if (
      text.includes("dti") ||
      text.includes("fiscal") ||
      text.includes("tax") ||
      text.includes("incentive") ||
      text.includes("carmaker")
    ) {
      candidates.push("Connects policy support to what carmakers may actually bring to market.");
      candidates.push("Shows how government incentives could shape buyer choice and supply.");
    }

    if (
      text.includes("taxi") ||
      text.includes("fleet") ||
      text.includes("grab") ||
      text.includes("operators")
    ) {
      candidates.push("Shows how operating costs are changing the fleet and mobility equation.");
      candidates.push("Makes commercial usage a test case for broader adoption.");
    }

    if (text.includes("demand") || text.includes("buyers") || text.includes("market")) {
      candidates.push("Makes buyer demand easier to read through pricing and product choices.");
      candidates.push("Shows where market behavior is moving beyond launch-day noise.");
    }

    if (
      text.includes("launch") ||
      text.includes("launched") ||
      text.includes("unveils") ||
      text.includes("introduces") ||
      text.includes("makina")
    ) {
      candidates.push("Early signal of where product demand may be shifting.");
      candidates.push("Shows what brands think cost-conscious buyers may still consider.");
    }

    if (candidates.length === 0) {
      candidates.push("Adds a concrete read on buyer behavior in the Philippine motoring market.");
      candidates.push("Useful signal on what cost-conscious buyers and operators may do next.");
    }

    return candidates;
  }

  if (story.beat === "property_real_estate") {
    if (
      text.includes("housing credit") ||
      text.includes("housing loan") ||
      text.includes("home financing") ||
      text.includes("mortgage") ||
      text.includes("pag-ibig") ||
      text.includes("rental housing")
    ) {
      candidates.push("Shows how policy or credit support is trying to reach housing demand.");
      candidates.push("Adds financing context to the affordability story.");
    }

    if (
      text.includes("property price index") ||
      text.includes("residential real estate price index") ||
      text.includes("slowest increase") ||
      text.includes("price slowdown")
    ) {
      candidates.push("Shows how pricing power is changing against buyer capacity.");
      candidates.push("Makes affordability and demand pressure visible through price movement.");
    }

    if (
      text.includes("vacancy") ||
      text.includes("office demand") ||
      (text.includes("office") && (text.includes("leasing") || text.includes("rent"))) ||
      text.includes("tenant demand")
    ) {
      candidates.push("Shows real property utilization through vacancy, rents, or leasing demand.");
      candidates.push("Keeps the office read tied to occupancy and tenant behavior.");
    }

    if (
      text.includes("construction permits") ||
      text.includes("building permits") ||
      text.includes("weak residential demand") ||
      text.includes("construction")
    ) {
      candidates.push("Shows whether the residential build pipeline is losing momentum.");
      candidates.push("Connects construction activity to actual demand rather than expansion claims.");
    }

    if (story.property_filter?.stress_signal) {
      candidates.push("Keeps stress, vacancy, oversupply, or weak absorption at the center of the property read.");
    }

    if (candidates.length === 0) {
      candidates.push("Adds a concrete read on Philippine property demand, supply, financing, or stress.");
    }

    return [...new Set(candidates)];
  }

  if (story.beat === "ph_sea_banking") {
    if (text.includes("bad loans") || text.includes("npl") || text.includes("risk") || text.includes("defaults")) {
      candidates.push("Shows where borrower stress is starting to matter for asset quality.");
    }

    if (text.includes("credit") || text.includes("lending") || text.includes("loan")) {
      candidates.push("Connects bank behavior to actual credit conditions.");
    }

    if (text.includes("liquidity") || text.includes("deposit") || text.includes("funding")) {
      candidates.push("Makes funding and liquidity pressure visible beyond headline earnings.");
    }

    if (text.includes("bsp") || text.includes("policy") || text.includes("regulation")) {
      candidates.push("Shows how policy can change lending behavior or risk appetite.");
    }

    if (candidates.length === 0) {
      candidates.push("Adds a concrete read on credit, liquidity, risk, or policy behavior.");
    }

    return [...new Set(candidates)];
  }

  if (story.beat === "ph_sea_energy") {
    if (text.includes("pump price") || text.includes("rollback") || text.includes("diesel") || text.includes("gasoline")) {
      candidates.push("Shows how fuel-price movement is feeding into household and operating costs.");
    }

    if (text.includes("grid") || text.includes("transmission") || text.includes("power plant") || text.includes("capacity")) {
      candidates.push("Makes the capacity and delivery constraint concrete.");
    }

    if (text.includes("supply") || text.includes("reserve") || text.includes("outage")) {
      candidates.push("Shows where supply conditions could become a reliability problem.");
    }

    if (text.includes("erc") || text.includes("doe") || text.includes("policy") || text.includes("tariff")) {
      candidates.push("Shows how policy decisions can shift who absorbs energy costs.");
    }

    if (candidates.length === 0) {
      candidates.push("Adds a concrete read on price, supply, reliability, or policy pressure.");
    }

    return [...new Set(candidates)];
  }

  const genericPrimary =
    normalizedPrimary.includes("high-impact policy move with likely downstream business effects") ||
    normalizedPrimary.includes("marks a real change in direction with likely downstream effects") ||
    normalizedPrimary.includes("reveals something concrete about demand, spending, or market confidence");

  if (!isWeakReason(primary) && !genericPrimary) {
    candidates.push(primary);
  }

  if (story.angle_signals?.some((angle) => angle.includes("cost pressure"))) {
    candidates.push("Makes the cost of scaling visible.");
    candidates.push("Shows where the economics start to tighten.");
  }

  if (story.angle_signals?.some((angle) => angle.includes("supply"))) {
    candidates.push("Shows where supply strain is starting to hit the story.");
    candidates.push("Makes the supply-side constraint harder to ignore.");
  }

  if (
    story.angle_signals?.some((angle) => angle.includes("competitive")) ||
    text.includes("acquire") ||
    text.includes("partnership")
  ) {
    candidates.push("Shows who is trying to lock up position before the market settles.");
    candidates.push("Makes the strategic land grab more visible.");
  }

  if (
    story.angle_signals?.some((angle) => angle.includes("developer workflow")) ||
    text.includes("developer") ||
    text.includes("api")
  ) {
    candidates.push("Shows where platform control is shifting into developer workflow.");
    candidates.push("Shows how the fight is moving into the tooling layer.");
  }

  if (story.angle_signals?.some((angle) => angle.includes("safety"))) {
    candidates.push("Shows how safety posture is becoming part of product strategy.");
    candidates.push("Makes the governance pitch part of the product story.");
  }

  if (story.reason_code === "execution_consequence") {
    candidates.push("Shows where strategy is running into real operating limits.");
    candidates.push("Makes the execution constraint concrete.");
  }

  if (story.reason_code === "policy_regulatory_move") {
    candidates.push("Shows where policy pressure is starting to change operating choices.");
    candidates.push("Shows how regulation is starting to shape the playbook.");
  }

  if (story.reason_code === "market_signal") {
    candidates.push("Makes the demand and pricing question harder to ignore.");
    candidates.push("Shows where the market signal is firmer than the narrative.");
  }

  if (story.reason_code === "industry_repositioning") {
    candidates.push("Clarifies the competitive move behind the headline.");
    candidates.push("Shows how the positioning play is taking shape.");
  }

  if (story.reason_code === "meaningful_shift") {
    candidates.push("Marks a genuine change in direction, not another routine release.");
    candidates.push("Shows that this is more than another incremental update.");
  }

  if (text.includes("pricing") || text.includes("teams") || text.includes("cost")) {
    candidates.push("Shows how vendors are adjusting price and packaging to pull users deeper in.");
    candidates.push("Makes the monetization push easier to see.");
  }

  if (text.includes("security") || text.includes("trust") || text.includes("safe")) {
    candidates.push("Shows how trust and safety claims are being used to support adoption.");
    candidates.push("Shows how vendors are turning safety into an adoption lever.");
  }

  if (text.includes("energy") || text.includes("grid")) {
    candidates.push("Shows the energy burden that comes with scaling AI systems.");
    candidates.push("Makes the power cost of expansion visible.");
  }

  if (story.angle_signals?.some((angle) => angle.includes("infrastructure"))) {
    candidates.push("Makes the infrastructure strain visible.");
    candidates.push("Shows where the build-out starts to drag on execution.");
  }

  if (
    story.angle_signals?.some((angle) => angle.includes("adoption")) ||
    text.includes("enterprise")
  ) {
    candidates.push("Shows how vendors are trying to lock in enterprise trust before demand settles.");
    candidates.push("Shows how the enterprise pitch is arriving ahead of proof.");
  }

  if (story.angle_signals?.some((angle) => angle.includes("policy"))) {
    candidates.push("Makes the compliance pressure more concrete.");
    candidates.push("Shows the operating cost of policy pressure.");
  }

  if (text.includes("model") || text.includes("launch") || text.includes("release")) {
    candidates.push("Shows what the platform push looks like in practice.");
    candidates.push("Makes the launch strategy more concrete.");
  }

  candidates.push("Gives the theme a concrete operating example.");

  return [...new Set(candidates)];
}

function supportingReason(story: NormalizedStory, usedReasons?: Set<string>): string {
  const candidates = supportingReasonCandidates(story);

  if (!usedReasons) {
    return candidates[0];
  }

  for (const candidate of candidates) {
    const key = candidate.toLowerCase();

    if (usedReasons.has(key)) {
      continue;
    }

    usedReasons.add(key);
    return candidate;
  }

  const fallback = candidates[0];
  usedReasons.add(fallback.toLowerCase());
  return fallback;
}

function looksLikeRawThemeLabel(label?: string): boolean {
  if (!label) {
    return true;
  }

  const clean = sanitizeText(label);

  return labelLooksLikeRawTitle(clean) || /latest .* announced/i.test(clean);
}

function storyPresentationLabel(story: NormalizedStory): string {
  const beatSpecificLabel = beatSpecificStoryLabel(story);

  if (beatSpecificLabel) {
    return beatSpecificLabel;
  }

  if (!looksLikeRawThemeLabel(story.theme_label)) {
    return sanitizeText(story.theme_label ?? story.title);
  }

  const derived = deriveEditorialLabel(
    story.theme_label ?? story.title,
    story.reason_code ? [story.reason_code] : [],
    story.angle_signals ?? [],
    [story]
  );

  if (looksLikeRawThemeLabel(derived)) {
    return fallbackEditorialLabel(story);
  }

  return derived;
}

function beatSpecificStoryLabel(story: NormalizedStory): string | null {
  const text = normalizeText(
    [
      story.title,
      story.summary ?? "",
      story.tags.join(" "),
      story.angle_signals?.join(" ") ?? "",
      story.property_filter?.materiality_signals.join(" ") ?? "",
      story.ai_tech_filter?.materiality_signals.join(" ") ?? "",
      story.energy_filter?.materiality_signals.join(" ") ?? ""
    ].join(" ")
  );

  if (story.beat === "property_real_estate") {
    if (
      text.includes("property price index") ||
      text.includes("residential real estate price index") ||
      text.includes("slowest increase") ||
      text.includes("price slowdown") ||
      text.includes("prices soften")
    ) {
      return "price growth slowdown";
    }

    if (
      text.includes("office") &&
      (text.includes("vacancy") ||
        text.includes("leasing") ||
        text.includes("rent") ||
        text.includes("tenant demand") ||
        text.includes("office demand"))
    ) {
      return "office market stress";
    }

    if (
      text.includes("construction permits") ||
      text.includes("building permits") ||
      text.includes("weak residential demand") ||
      text.includes("permit decline")
    ) {
      return "residential permit weakness";
    }

    if (
      text.includes("housing credit") ||
      text.includes("housing loan") ||
      text.includes("home financing") ||
      text.includes("mortgage") ||
      text.includes("pag-ibig") ||
      text.includes("rental housing") ||
      text.includes("capital requirement")
    ) {
      return "housing finance support";
    }

    switch (story.property_filter?.primary_axis) {
      case "stress_signals":
        return "property stress";
      case "demand_affordability":
        return "affordability pressure";
      case "supply_development":
        return "supply pipeline shift";
      case "capital_flows":
        return "property credit conditions";
      case "policy_regulation":
        return "housing policy pressure";
      case "usage_patterns":
        return "usage and occupancy shift";
      default:
        return "property market pressure";
    }
  }

  if (story.beat === "ph_sea_banking") {
    const signals = story.banking_signals;

    if (signals?.function.includes("risk") || text.includes("bad loans") || text.includes("npl")) {
      return "borrower risk";
    }

    if (signals?.direction.includes("tightening") || text.includes("credit tightening")) {
      return "credit tightening";
    }

    if (signals?.function.includes("liquidity")) {
      return "liquidity preservation";
    }

    if (signals?.function.includes("deposits") || signals?.function.includes("funding")) {
      return "deposit funding shift";
    }

    if (signals?.function.includes("regulation") || signals?.driver.includes("policy")) {
      return "banking policy pressure";
    }

    if (signals?.function.includes("lending")) {
      return "lending conditions";
    }
  }

  if (story.beat === "ph_sea_energy") {
    switch (story.energy_filter?.primary_category) {
      case "price":
        return text.includes("rollback") ? "fuel price easing" : "energy price pressure";
      case "supply":
        return "supply reliability risk";
      case "policy":
        return "policy cost shift";
      case "infrastructure":
        return "grid capacity risk";
      case "demand":
        return "demand pressure";
      case "external_forces":
        return "external energy shock";
      default:
        break;
    }
  }

  if (story.beat === "ai_tech") {
    switch (story.ai_tech_filter?.primary_axis) {
      case "models_platforms":
        return "model capability race";
      case "enterprise_adoption":
        return "enterprise adoption";
      case "policy_regulation":
        return "AI governance pressure";
      case "infrastructure_compute":
        return "compute capacity strain";
      case "distribution_integration":
        return "platform distribution fight";
      case "labor_workflow_impact":
        return "workflow disruption";
      default:
        break;
    }
  }

  return null;
}

function buildStoryBriefItem(
  label: string,
  stories: NormalizedStory[]
): EditorialBriefItem {
  const uniqueStories = uniqueStoriesForDisplay(stories);
  const reasonCodes = topValues(
    uniqueStories.map((story) => story.reason_code ?? ""),
    3
  );
  const angles = topValues(
    uniqueStories.flatMap((story) => story.angle_signals ?? []),
    3
  );
  const reasonKept = uniqueStories.flatMap((story) => story.reason_kept ?? []);
  const patternAndTension = inferPatternAndTensionForLabel(label, reasonCodes, angles);
  const topPriority = Math.max(...uniqueStories.map((story) => story.priority_score ?? 0), 0);
  const propertyScoreBoost =
    uniqueStories.some((story) => story.property_filter?.stress_signal) ? 8 : 0;
  const hardSignalBoost =
    uniqueStories.some((story) =>
      story.property_filter?.editorial_bucket === "core_signal" ||
      story.ai_tech_filter?.editorial_bucket === "core_signal" ||
      story.energy_filter?.importance_tier === "high" ||
      story.editorial_bucket === "urgent_important"
    )
      ? 5
      : 0;
  const interpretationPenalty =
    uniqueStories.length > 0 &&
    uniqueStories.every((story) => story.property_filter?.editorial_bucket === "interpretation")
      ? 3
      : 0;

  return {
    label,
    score:
      topPriority +
      averagePriority(uniqueStories) +
      Math.min(uniqueStories.length, 4) +
      propertyScoreBoost +
      hardSignalBoost -
      interpretationPenalty,
    whyItMatters: buildEditorialWhyLineForLabel(label, reasonCodes, angles, reasonKept),
    pattern: patternAndTension.pattern,
    tension: patternAndTension.tension,
    supportingStories: pickSupportingStories(uniqueStories, 4)
  };
}

function uniqueStoriesForDisplay(stories: NormalizedStory[]): NormalizedStory[] {
  const seen = new Set<string>();
  const unique: NormalizedStory[] = [];

  for (const story of stories) {
    const key = story.url || story.id || normalizeText(story.title);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(story);
  }

  return unique;
}

function buildStoryBriefItems(stories: NormalizedStory[]): EditorialBriefItem[] {
  const grouped = new Map<string, NormalizedStory[]>();

  for (const story of stories) {
    const label = storyPresentationLabel(story);
    const current = grouped.get(label) ?? [];

    current.push(story);
    grouped.set(label, current);
  }

  return [...grouped.entries()]
    .map(([label, group]) => buildStoryBriefItem(label, group))
    .sort((left, right) => right.score - left.score);
}

function buildThemeBriefItem(
  themeCluster: StoryThemeCluster,
  storyMap: Map<string, NormalizedStory>
): EditorialBriefItem {
  const stories = themeCluster.story_ids
    .map((storyId) => storyMap.get(storyId))
    .filter((story): story is NormalizedStory => Boolean(story));
  const supportingStories =
    themeCluster.top_story_refs.length > 0
      ? themeCluster.top_story_refs
          .map((storyId) => storyMap.get(storyId))
          .filter((story): story is NormalizedStory => Boolean(story))
          .slice(0, 4)
      : pickSupportingStories(stories, 4);
  const dominantReasonCodes =
    themeCluster.dominant_reason_codes.length > 0
      ? themeCluster.dominant_reason_codes
      : topValues(
          stories.map((story) => story.reason_code ?? ""),
          3
        );
  const dominantAngles =
    themeCluster.dominant_angle_signals.length > 0
      ? themeCluster.dominant_angle_signals
      : topValues(
          stories.flatMap((story) => story.angle_signals ?? []),
          3
        );
  const label = looksLikeRawThemeLabel(themeCluster.theme_label)
    ? deriveEditorialLabel(
        themeCluster.theme_label,
        dominantReasonCodes,
        dominantAngles,
        stories
      )
    : sanitizeText(themeCluster.theme_label);
  const reasonKept = stories.flatMap((story) => story.reason_kept ?? []);
  const topPriority = Math.max(...stories.map((story) => story.priority_score ?? 0), 0);
  const score = topPriority + averagePriority(stories) + Math.min(themeCluster.story_count, 6);
  const filteredSupportingStories = supportingStories.filter(
    (story) => themeSanityScore(story, label, dominantReasonCodes, dominantAngles) >= 1
  );
  const finalSupportingStories =
    filteredSupportingStories.length > 0
      ? filteredSupportingStories
      : supportingStories.slice(0, 2);
  const patternAndTension = inferPatternAndTensionForLabel(
    label,
    dominantReasonCodes,
    dominantAngles
  );

  return {
    label,
    score,
    whyItMatters: buildEditorialWhyLineForLabel(
      label,
      dominantReasonCodes,
      dominantAngles,
      reasonKept
    ),
    pattern: patternAndTension.pattern,
    tension: patternAndTension.tension,
    supportingStories: finalSupportingStories
  };
}

function buildEventBriefItem(
  eventCluster: EventCluster,
  storyMap: Map<string, NormalizedStory>
): EditorialBriefItem {
  const stories = eventCluster.story_ids
    .map((storyId) => storyMap.get(storyId))
    .filter((story): story is NormalizedStory => Boolean(story));
  const reasonCodes = topValues(
    stories.map((story) => story.reason_code ?? ""),
    3
  );
  const angles = topValues(
    stories.flatMap((story) => story.angle_signals ?? []),
    3
  );
  const reasonKept = stories.flatMap((story) => story.reason_kept ?? []);
  const label = labelLooksLikeRawTitle(eventCluster.event_label)
    ? deriveEditorialLabel(eventCluster.event_label, reasonCodes, angles, stories)
    : sanitizeText(eventCluster.event_label);
  const score =
    eventCluster.priority_score +
    averagePriority(stories) +
    Math.min(eventCluster.story_count, 4);
  const patternAndTension = inferPatternAndTensionForLabel(label, reasonCodes, angles);
  const supportingStories = pickSupportingStories(stories, 3).filter(
    (story) => themeSanityScore(story, label, reasonCodes, angles) >= 1
  );

  return {
    label,
    score,
    whyItMatters: buildEditorialWhyLineForLabel(label, reasonCodes, angles, reasonKept),
    pattern: patternAndTension.pattern,
    tension: patternAndTension.tension,
    supportingStories: supportingStories.length > 0 ? supportingStories : stories.slice(0, 1)
  };
}

function buildWatchlistItems(
  stories: NormalizedStory[],
  usedStoryIds: Set<string>,
  blockedLabels: Set<string>
): EditorialBriefItem[] {
  const seenLabels = new Set<string>();

  return stories
    .filter((story) => !usedStoryIds.has(story.id))
    .filter((story) => (story.priority_score ?? 0) >= 24)
    .filter((story) => story.editorial_bucket !== "urgent_important")
    .sort((left, right) => (right.priority_score ?? 0) - (left.priority_score ?? 0))
    .filter((story) => {
      const label = storyPresentationLabel(story);

      if (seenLabels.has(label) || blockedLabels.has(label)) {
        return false;
      }

      if (
        themeSanityScore(
          story,
          label,
          story.reason_code ? [story.reason_code] : [],
          story.angle_signals ?? []
        ) < 1
      ) {
        return false;
      }

      seenLabels.add(label);
      return true;
    })
    .slice(0, 5)
    .map((story) => {
      const angles = story.angle_signals ?? [];
      const reasonCodes = story.reason_code ? [story.reason_code] : [];
      const label = storyPresentationLabel(story);
      const patternAndTension = inferPatternAndTensionForLabel(label, reasonCodes, angles);

      return {
        label,
        score: story.priority_score ?? 0,
        whyItMatters: buildEditorialWhyLineForLabel(
          label,
          reasonCodes,
          angles,
          story.reason_kept
        ),
        pattern: patternAndTension.pattern,
        tension: patternAndTension.tension,
        supportingStories: [story]
      };
    });
}

function renderSupportingStory(
  lines: string[],
  story: NormalizedStory,
  usedReasons?: Set<string>
): void {
  lines.push(
    `- [${sanitizeText(story.title)}](${story.url}) | ${story.source} | ${
      supportingReason(story, usedReasons)
    }`
  );
}

function renderBriefSection(
  lines: string[],
  title: string,
  items: EditorialBriefItem[],
  introLabel: "Why it matters" | "Editorial note" | "Why to watch"
): void {
  if (items.length === 0) {
    return;
  }

  lines.push(`## ${title}`);
  lines.push("");

  for (const item of items) {
    const usedReasons = new Set<string>();
    lines.push(`### ${item.label}`);
    lines.push(`- ${introLabel}: ${item.whyItMatters}`);
    lines.push(`- Pattern: ${item.pattern}`);
    lines.push(`- ${item.tension}`);
    lines.push(`- Supporting stories:`);

    for (const story of item.supportingStories) {
      renderSupportingStory(lines, story, usedReasons);
    }

    lines.push("");
  }
}

function renderWatchlistSection(lines: string[], items: EditorialBriefItem[]): void {
  if (items.length === 0) {
    return;
  }

  lines.push("## Watchlist");
  lines.push("");

  for (const item of items) {
    const singleStory = item.supportingStories.length === 1;

    if (singleStory) {
      const story = item.supportingStories[0];

      lines.push(`### Signal: ${item.label}`);
      lines.push(`- Why to watch: ${item.whyItMatters}`);
      lines.push(`- ${sanitizeText(story.title)} — ${story.source}`);
      lines.push(`- ${supportingReason(story)}`);
      lines.push("");
      continue;
    }

    const usedReasons = new Set<string>();
    lines.push(`### ${item.label}`);
    lines.push(`- Why to watch: ${item.whyItMatters}`);
    lines.push(`- Pattern: ${item.pattern}`);
    lines.push(`- ${item.tension}`);
    lines.push(`- Supporting stories:`);

    for (const story of item.supportingStories) {
      renderSupportingStory(lines, story, usedReasons);
    }

    lines.push("");
  }
}

function aiTechStoryRef(story: NormalizedStory): AiTechStoryRef {
  return {
    id: story.id,
    title: sanitizeText(story.title),
    source: story.source,
    url: story.url,
    primary_axis: story.ai_tech_filter?.primary_axis,
    editorial_bucket: story.ai_tech_filter?.editorial_bucket,
    geography: story.ai_tech_filter?.geography,
    importance_tier: story.ai_tech_filter?.importance_tier
  };
}

function buildAiTechEditorialOutput(stories: NormalizedStory[]): AiTechEditorialOutput | undefined {
  if (!stories.every((story) => story.beat === "ai_tech")) {
    return undefined;
  }

  const sortedStories = [...stories].sort((left, right) => {
    const tierRank = (tier?: string) => tier === "high" ? 2 : tier === "medium" ? 1 : 0;
    const tierDelta = tierRank(right.ai_tech_filter?.importance_tier) - tierRank(left.ai_tech_filter?.importance_tier);

    if (tierDelta !== 0) {
      return tierDelta;
    }

    return right.publishedAt.localeCompare(left.publishedAt);
  });

  return {
    core_signals: sortedStories
      .filter((story) => story.ai_tech_filter?.editorial_bucket === "core_signal")
      .map(aiTechStoryRef),
    interpretation_layer: sortedStories
      .filter((story) => story.ai_tech_filter?.editorial_bucket === "interpretation")
      .map(aiTechStoryRef),
    capability_watch: sortedStories
      .filter((story) => story.ai_tech_filter?.editorial_bucket === "capability_watch")
      .map(aiTechStoryRef)
  };
}

function propertyStoryRef(story: NormalizedStory): PropertyStoryRef {
  return {
    id: story.id,
    title: sanitizeText(story.title),
    source: story.source,
    url: story.url,
    primary_axis: story.property_filter?.primary_axis,
    editorial_bucket: story.property_filter?.editorial_bucket,
    geography: story.property_filter?.geography,
    importance_tier: story.property_filter?.importance_tier,
    stress_signal: story.property_filter?.stress_signal
  };
}

function hasStoryText(story: NormalizedStory, keywords: string[]): boolean {
  const text = `${story.title} ${story.summary ?? ""}`;

  return countKeywordHits(text, keywords) > 0;
}

function readHasAny(stories: NormalizedStory[], keywords: string[]): boolean {
  return stories.some((story) => hasStoryText(story, keywords));
}

function readHasTheme(themeClusters: StoryThemeCluster[], keywords: string[]): boolean {
  return themeClusters.some((theme) =>
    countKeywordHits(`${theme.theme_label} ${theme.theme_summary ?? ""}`, keywords) > 0
  );
}

function hasCoreBucket(stories: NormalizedStory[]): boolean {
  return stories.some((story) =>
    story.editorial_bucket === "urgent_important" ||
    story.property_filter?.editorial_bucket === "core_signal" ||
    story.ai_tech_filter?.editorial_bucket === "core_signal" ||
    story.energy_filter?.importance_tier === "high" ||
    story.cluster_classification === "primary"
  );
}

function buildThinEditorialRead(beatName: string): string[] {
  return [
    `${beatName} is thin this week; the safer read is narrow rather than sector-wide.`,
    "One or two signals can set the watchlist, but they are not enough to call a broader turn."
  ];
}

function buildPropertyEditorialRead(stories: NormalizedStory[]): string[] {
  if (stories.length === 0) {
    return buildThinEditorialRead("Property");
  }

  const bullets: string[] = [];
  const coreSignals = stories.filter(
    (story) => story.property_filter?.editorial_bucket === "core_signal"
  );
  const interpretations = stories.filter(
    (story) => story.property_filter?.editorial_bucket === "interpretation"
  );

  const hasPricePressure = readHasAny(stories, [
    "property price index",
    "residential real estate price index",
    "price slowdown",
    "prices slow",
    "prices soften",
    "price movement"
  ]);
  const hasOfficeStress = readHasAny(stories, [
    "vacancy",
    "office demand",
    "leasing",
    "rent",
    "rents",
    "stock",
    "tenant demand",
    "supply stress"
  ]);
  const hasConstructionSoftness = readHasAny(stories, [
    "construction permits",
    "building permits",
    "permit decline",
    "weak residential demand",
    "residential demand",
    "supply pullback"
  ]);
  const hasFinancingPolicy = readHasAny(stories, [
    "housing credit",
    "housing loan",
    "home financing",
    "mortgage",
    "rental housing",
    "capital charge",
    "capital requirement",
    "pag-ibig"
  ]);

  if (hasPricePressure && (hasOfficeStress || hasConstructionSoftness)) {
    bullets.push(
      "Price growth is slowing while usage and build signals still look uneven, keeping the week focused on pressure rather than expansion."
    );
  } else if (hasPricePressure) {
    bullets.push(
      "Price movement is the cleanest property signal this week, with softer growth doing more work than launch or expansion news."
    );
  }

  if (hasOfficeStress) {
    bullets.push(
      "Office remains a visible stress channel, with vacancy, rents, and tenant demand carrying more weight than developer positioning."
    );
  }

  if (hasConstructionSoftness) {
    bullets.push(
      "Residential construction looks softer where permit and demand signals point to a less aggressive build pipeline."
    );
  }

  if (hasFinancingPolicy) {
    bullets.push(
      "Housing finance and rental-housing policy are present, but support signals have not yet outweighed the pressure signs."
    );
  }

  if (interpretations.length > 0 && bullets.length < 3) {
    bullets.push(
      coreSignals.length > 0
        ? "The softer market reads add direction around the hard signals, but they do not by themselves prove a turn."
        : "Most of the week is interpretive, so the read should stay cautious until harder price, vacancy, inventory, lending, or policy evidence appears."
    );
  }

  if (bullets.length === 0) {
    bullets.push(
      "Property is narrow this week; the useful read is selective pressure, not a complete sector call.",
      "Harder signals should still outrank broad outlook pieces until more price, vacancy, inventory, lending, or policy evidence appears."
    );
  }

  return bullets.slice(0, 4);
}

function buildAiTechEditorialRead(stories: NormalizedStory[], themeClusters: StoryThemeCluster[]): string[] {
  if (stories.length === 0) {
    return buildThinEditorialRead("AI / Tech");
  }

  const bullets: string[] = [];
  const hasCapability = readHasAny(stories, [
    "model",
    "models",
    "reasoning",
    "benchmark",
    "agent",
    "agents",
    "sora",
    "gpt",
    "compute"
  ]) || readHasTheme(themeClusters, ["model", "capability", "compute"]);
  const hasAccessPricing = readHasAny(stories, [
    "pricing",
    "price",
    "subscription",
    "free",
    "api",
    "access",
    "availability",
    "rollout"
  ]);
  const hasGovernance = readHasAny(stories, [
    "regulation",
    "governance",
    "safety",
    "copyright",
    "privacy",
    "policy",
    "rules"
  ]) || readHasTheme(themeClusters, ["policy", "safety", "governance"]);
  const hasEnterprise = readHasAny(stories, [
    "enterprise",
    "workflow",
    "adoption",
    "deployment",
    "partnership",
    "customer",
    "regional",
    "philippines",
    "southeast asia"
  ]) || readHasTheme(themeClusters, ["enterprise", "adoption", "partnership"]);

  if (hasCapability && hasAccessPricing) {
    bullets.push(
      "Capability gains matter this week because access and pricing are also moving; the question is who can actually use the new tools at scale."
    );
  } else if (hasCapability) {
    bullets.push(
      "Capability remains the center of gravity, but the stronger read is practical movement rather than novelty."
    );
  }

  if (hasGovernance) {
    bullets.push(
      "Governance is still shaping the runway, with safety, copyright, privacy, or policy signals setting limits around adoption."
    );
  }

  if (hasEnterprise) {
    bullets.push(
      "Enterprise and regional adoption signals are useful when they show workflow change, not just another product announcement."
    );
  }

  if (bullets.length === 0) {
    bullets.push(
      stories.length <= 2
        ? "AI / Tech is narrow this week; the desk should treat the available signals as watchlist movement, not a broad cycle read."
        : "The week is fragmented, so the useful read is where capability, distribution, and governance start to overlap."
    );
  }

  return bullets.slice(0, 4);
}

function buildMotoringEditorialRead(stories: NormalizedStory[], themeClusters: StoryThemeCluster[]): string[] {
  if (stories.length === 0) {
    return buildThinEditorialRead("Motoring");
  }

  const bullets: string[] = [];
  const hasOwnershipCost = readHasAny(stories, [
    "fuel",
    "gasoline",
    "diesel",
    "pump price",
    "fare",
    "toll",
    "registration",
    "insurance",
    "cost",
    "price increase"
  ]) || readHasTheme(themeClusters, ["fuel", "cost", "price"]);
  const hasEvTransition = readHasAny(stories, [
    "ev",
    "electric vehicle",
    "charging",
    "battery",
    "hybrid",
    "e-mobility"
  ]) || readHasTheme(themeClusters, ["ev", "electric", "charging"]);
  const hasEnforcement = readHasAny(stories, [
    "enforcement",
    "lto",
    "ltfrb",
    "mmda",
    "violation",
    "coding",
    "traffic",
    "license",
    "franchise"
  ]) || readHasTheme(themeClusters, ["enforcement", "traffic", "regulation"]);
  const hasCapacity = readHasAny(stories, [
    "sales",
    "production",
    "supply",
    "import",
    "capacity",
    "dealership",
    "fleet",
    "public transport"
  ]) || readHasTheme(themeClusters, ["sales", "capacity", "supply"]);

  if (hasOwnershipCost) {
    bullets.push(
      "Ownership cost remains the pressure point, especially where fuel, fares, tolls, or compliance costs move faster than household budgets."
    );
  }

  if (hasEvTransition && hasCapacity) {
    bullets.push(
      "The EV transition is still tied to capacity questions: charging, supply, and fleet economics matter as much as model launches."
    );
  } else if (hasEvTransition) {
    bullets.push(
      "EV stories matter most when they move infrastructure or operating economics, not when they only add showroom noise."
    );
  }

  if (hasEnforcement) {
    bullets.push(
      "Enforcement and road-capacity signals keep the beat grounded in daily mobility constraints, not just vehicle demand."
    );
  }

  if (bullets.length === 0) {
    bullets.push(
      stories.length <= 2
        ? "Motoring is thin this week; the useful read is limited to the few cost, policy, or capacity signals on the desk."
        : "The week is mixed, so the clearest read is the tension between demand, operating costs, and transport capacity."
    );
  }

  return bullets.slice(0, 4);
}

function buildBankingEditorialRead(
  stories: NormalizedStory[],
  themeClusters: StoryThemeCluster[]
): string[] {
  if (stories.length === 0) {
    return buildThinEditorialRead("Banking");
  }

  const labels = themeClusters.map((theme) => normalizeText(theme.theme_label));
  const hasCreditTightening =
    labels.some((label) => label.includes("credit tightening")) ||
    stories.some((story) => story.banking_signals?.direction.includes("tightening"));
  const hasRisk =
    labels.some((label) => label.includes("risk")) ||
    stories.some((story) => story.banking_signals?.function.includes("risk")) ||
    readHasAny(stories, ["bad loans", "non-performing", "npl", "borrower stress", "defaults"]);
  const hasLiquidity =
    labels.some((label) => label.includes("liquidity")) ||
    stories.some((story) => story.banking_signals?.function.includes("liquidity"));
  const hasDeposits =
    labels.some((label) => label.includes("deposit")) ||
    stories.some((story) => story.banking_signals?.function.includes("deposits"));
  const hasPolicy =
    stories.some((story) => story.banking_signals?.driver.includes("policy")) ||
    readHasAny(stories, ["bsp", "capital requirement", "reserve requirement", "policy", "regulator"]);
  const hasGrowth =
    labels.some((label) => label.includes("growth")) ||
    readHasAny(stories, ["loan growth", "credit growth", "lending growth"]);

  const bullets: string[] = [];

  if (hasCreditTightening && hasRisk) {
    bullets.push(
      "Credit discipline and borrower risk are moving together, which makes loan quality more important than headline growth."
    );
  } else if (hasCreditTightening) {
    bullets.push(
      "Credit conditions are leaning tighter as banks or regulators put more weight on borrower capacity and lending discipline."
    );
  } else if (hasRisk) {
    bullets.push(
      "Risk is becoming harder to treat as background noise, especially where bad-loan or borrower-capacity signals surface."
    );
  }

  if (hasLiquidity || hasDeposits) {
    bullets.push(
      hasDeposits
        ? "Deposit movement keeps funding cost and liquidity management near the center of the banking read."
        : "Liquidity signals point to banks preserving buffers rather than stretching balance sheets for growth."
    );
  }

  if (hasPolicy && !hasCreditTightening) {
    bullets.push(
      "Policy remains a live driver, but its market impact depends on whether it changes credit behavior rather than just compliance posture."
    );
  }

  if (hasGrowth && bullets.length < 3) {
    bullets.push(
      "Loan growth still matters, but the useful question is whether borrowers can keep carrying credit under tighter or riskier conditions."
    );
  }

  if (bullets.length === 0) {
    bullets.push(
      "Banking is mostly watch-level this week; the desk should stay focused on credit behavior, funding pressure, and early risk."
    );
  }

  return bullets.slice(0, 4);
}

function buildEnergyEditorialReadFromStories(
  stories: NormalizedStory[],
  themeClusters: StoryThemeCluster[]
): string[] {
  if (stories.length === 0) {
    return buildThinEditorialRead("Energy");
  }

  const bullets: string[] = [];
  const hasFuelPrice =
    stories.some((story) => story.energy_filter?.primary_category === "price") ||
    readHasAny(stories, ["pump price", "rollback", "fuel price", "diesel", "gasoline", "lpg", "oil"]);
  const hasSupply =
    stories.some((story) => story.energy_filter?.primary_category === "supply") ||
    readHasAny(stories, ["supply", "reserve", "generation", "shortage", "outage", "red alert", "yellow alert"]);
  const hasPolicy =
    stories.some((story) => story.energy_filter?.primary_category === "policy") ||
    readHasAny(stories, ["erc", "doe", "policy", "tariff", "subsidy", "tax"]);
  const hasInfrastructure =
    stories.some((story) => story.energy_filter?.primary_category === "infrastructure") ||
    readHasAny(stories, ["grid", "transmission", "substation", "power plant", "commissioning", "interconnection"]);
  const hasDemandPressure =
    stories.some((story) => story.energy_filter?.demand_pressure) ||
    readHasAny(stories, ["demand", "consumption", "peak demand", "load"]);

  if (hasFuelPrice && hasPolicy) {
    bullets.push(
      "Fuel and policy signals are moving together, so the pressure is not just price direction but who absorbs the cost."
    );
  } else if (hasFuelPrice) {
    bullets.push(
      "Fuel prices are the clearest near-term signal, with pump-price movement still shaping household and business costs."
    );
  }

  if (hasSupply || hasInfrastructure) {
    bullets.push(
      hasInfrastructure
        ? "Grid and project-execution signals keep capacity risk on the desk, even when price stories dominate the week."
        : "Supply conditions remain the constraint to watch where reserves, outages, or generation availability move."
    );
  }

  if (hasDemandPressure) {
    bullets.push(
      "Demand pressure matters because it can turn ordinary supply tightness into a reliability or price problem."
    );
  }

  if (bullets.length === 0 && readHasTheme(themeClusters, ["external", "shock"])) {
    bullets.push(
      "External shocks are still relevant only where they pass through to local prices, supply, or reliability."
    );
  }

  if (bullets.length === 0) {
    bullets.push(
      stories.length <= 2
        ? "Energy is narrow this week; the desk should avoid a broad system call until price, supply, or reliability signals firm up."
        : "The week is mixed, with the useful read sitting at the intersection of price, supply, policy, and execution risk."
    );
  }

  return bullets.slice(0, 4);
}

function buildGenericEditorialRead(
  stories: NormalizedStory[],
  themeClusters: StoryThemeCluster[]
): string[] {
  if (stories.length === 0) {
    return buildThinEditorialRead("The beat");
  }

  const bullets: string[] = [];
  const primaryThemes = themeClusters
    .filter((theme) => theme.theme_type !== "watch")
    .sort((left, right) => right.story_count - left.story_count)
    .slice(0, 2);

  if (primaryThemes.length > 0) {
    const labels = primaryThemes.map((theme) => sanitizeText(theme.theme_label));
    bullets.push(
      labels.length === 1
        ? `${labels[0]} is carrying the week, but the read should stay tied to concrete movement rather than story count.`
        : `${labels[0]} and ${labels[1]} are carrying the week, with the sharper read in how those pressures interact.`
    );
  }

  if (hasCoreBucket(stories)) {
    bullets.push(
      "The strongest items point to actual movement, while softer stories should stay in a supporting role."
    );
  } else {
    bullets.push(
      "Most of the week is directional rather than decisive, so the desk should avoid calling a turn too early."
    );
  }

  return bullets.slice(0, 4);
}

function buildSharedEditorialRead(
  stories: NormalizedStory[],
  beatName: string,
  themeClusters: StoryThemeCluster[] = []
): string[] {
  const beat = stories[0]?.beat;

  if (beat === "property_real_estate") {
    return buildPropertyEditorialRead(stories);
  }

  if (beat === "ai_tech") {
    return buildAiTechEditorialRead(stories, themeClusters);
  }

  if (beat === "philippine_motoring") {
    return buildMotoringEditorialRead(stories, themeClusters);
  }

  if (beat === "ph_sea_banking") {
    return buildBankingEditorialRead(stories, themeClusters);
  }

  if (beat === "ph_sea_energy") {
    return buildEnergyEditorialReadFromStories(stories, themeClusters);
  }

  return buildGenericEditorialRead(stories, themeClusters.length > 0 ? themeClusters : [])
    .map((line) => line.replace(/^The beat\b/, beatName));
}

function buildPropertyEditorialOutput(stories: NormalizedStory[]): PropertyEditorialOutput | undefined {
  if (!stories.every((story) => story.beat === "property_real_estate")) {
    return undefined;
  }

  const sortedStories = [...stories].sort((left, right) => {
    const tierRank = (tier?: string) => tier === "high" ? 2 : tier === "medium" ? 1 : 0;
    const stressDelta =
      Number(right.property_filter?.stress_signal ?? false) -
      Number(left.property_filter?.stress_signal ?? false);
    const tierDelta =
      tierRank(right.property_filter?.importance_tier) -
      tierRank(left.property_filter?.importance_tier);

    if (stressDelta !== 0) {
      return stressDelta;
    }

    if (tierDelta !== 0) {
      return tierDelta;
    }

    return right.publishedAt.localeCompare(left.publishedAt);
  });

  return {
    editorial_read: buildPropertyEditorialRead(sortedStories),
    core_signals: sortedStories
      .filter((story) => story.property_filter?.editorial_bucket === "core_signal")
      .map(propertyStoryRef),
    interpretation_layer: sortedStories
      .filter((story) => story.property_filter?.editorial_bucket === "interpretation")
      .map(propertyStoryRef),
    capability_watch: sortedStories
      .filter((story) => story.property_filter?.editorial_bucket === "capability_watch")
      .map(propertyStoryRef)
  };
}

function energyStoryRef(story: NormalizedStory): EnergyStoryRef {
  return {
    id: story.id,
    title: sanitizeText(story.title),
    source: story.source,
    url: story.url,
    primary_category: story.energy_filter?.primary_category,
    importance_tier: story.energy_filter?.importance_tier,
    system_pressure: story.energy_filter?.system_pressure
  };
}

const ENERGY_WATCH_SYSTEM_TERMS = [
  "electricity",
  "power",
  "grid",
  "transmission",
  "distribution",
  "generation",
  "generator",
  "power plant",
  "substation",
  "interconnection",
  "reserve",
  "outage",
  "brownout",
  "red alert",
  "yellow alert",
  "wesm",
  "meralco",
  "erc",
  "doe",
  "ngcp",
  "fuel",
  "diesel",
  "gasoline",
  "kerosene",
  "lpg",
  "lng",
  "coal",
  "oil",
  "pump price",
  "generation charge",
  "electricity rate",
  "power rate",
  "rollback",
  "fuel tax",
  "cost recovery",
  "supply agreement",
  "hydro",
  "solar",
  "renewable",
  "commissioning",
  "rehabilitation",
  "epc"
];

const ENERGY_WATCH_MOVEMENT_TERMS = [
  "increase",
  "increases",
  "increased",
  "rise",
  "rises",
  "rising",
  "raise",
  "raises",
  "raised",
  "hike",
  "hikes",
  "cut",
  "cuts",
  "rollback",
  "easing",
  "suspend",
  "suspends",
  "waive",
  "waives",
  "recover",
  "recovery",
  "surge",
  "surges",
  "shortage",
  "disruption",
  "delay",
  "delays",
  "strained",
  "strain",
  "alert",
  "outage",
  "rehabilitation",
  "commissioning",
  "capacity",
  "contract",
  "agreement",
  "delivery",
  "imports",
  "supply"
];

const ENERGY_WATCH_WEAK_CONTEXT_TERMS = [
  "agricultural imports",
  "food imports",
  "farmers",
  "pork",
  "rice",
  "fishports",
  "flight",
  "flights",
  "airspace",
  "airport",
  "passenger",
  "tourism"
];

const ENERGY_WATCH_STRONG_SYSTEM_TERMS = [
  "electricity",
  "power",
  "grid",
  "transmission",
  "distribution",
  "generation",
  "power plant",
  "substation",
  "interconnection",
  "reserve",
  "outage",
  "brownout",
  "red alert",
  "yellow alert",
  "wesm",
  "meralco",
  "erc",
  "doe",
  "ngcp",
  "diesel",
  "gasoline",
  "kerosene",
  "lpg",
  "lng",
  "coal",
  "oil supply",
  "fuel supply",
  "fuel delivery",
  "pump price",
  "generation charge",
  "electricity rate",
  "power rate",
  "supply agreement",
  "hydro",
  "solar",
  "commissioning",
  "rehabilitation",
  "epc"
];

function textIncludesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function hasEnergyWatchSystemConsequence(story: NormalizedStory): boolean {
  const filter = story.energy_filter;

  if (!filter) {
    return false;
  }

  const text = normalizeText([
    story.title,
    story.summary ?? "",
    story.tags.join(" "),
    filter.materiality_signals.join(" ")
  ].join(" "));
  const hasSystemTerm = textIncludesAny(text, ENERGY_WATCH_SYSTEM_TERMS);
  const hasMovementTerm = textIncludesAny(text, ENERGY_WATCH_MOVEMENT_TERMS);
  const hasWeakContext = textIncludesAny(text, ENERGY_WATCH_WEAK_CONTEXT_TERMS);
  const hasStrongSystemTerm = textIncludesAny(text, ENERGY_WATCH_STRONG_SYSTEM_TERMS);

  if (!hasSystemTerm) {
    return false;
  }

  if (hasWeakContext && !hasStrongSystemTerm) {
    return false;
  }

  if (
    filter.system_pressure ||
    filter.demand_pressure ||
    filter.importance_tier === "high"
  ) {
    return true;
  }

  if (!hasMovementTerm) {
    return false;
  }

  if (
    filter.primary_category === "external_forces" &&
    !filter.inclusion_rule_ids.includes("external_pressure_impacts_local_system")
  ) {
    return false;
  }

  return true;
}

function energyClusterOutput(
  cluster: EventCluster,
  storyMap: Map<string, NormalizedStory>
): EnergyClusterOutput {
  return {
    cluster_id: cluster.cluster_id,
    label: sanitizeText(cluster.event_label),
    story_count: cluster.story_count,
    classification: cluster.cluster_classification,
    cluster_type: cluster.cluster_type,
    compression_line: cluster.compression_line
      ? sanitizeText(cluster.compression_line)
      : undefined,
    theme_id: cluster.primary_theme_id,
    theme_label: cluster.primary_theme_label,
    stories: cluster.story_ids
      .map((storyId) => storyMap.get(storyId))
      .filter((story): story is NormalizedStory => Boolean(story))
      .map(energyStoryRef)
  };
}

function energyEditorialRead(themes: EnergyThemeOutput[], signals: EnergySignalOutput[]): string {
  if (themes.length === 0) {
    return signals.length > 0
      ? "Energy has watch signals on the desk, but none is broad enough yet to carry a confident system read."
      : "Energy is quiet this week; the desk should wait for firmer price, supply, reliability, or policy movement.";
  }

  const labels = themes.map((theme) => normalizeText(theme.theme));
  const clauses: string[] = [];

  if (labels.some((label) => label.includes("fuel prices") && label.includes("easing"))) {
    clauses.push("fuel prices are easing through pump-price rollbacks");
  }

  if (labels.some((label) => label.includes("policy") && label.includes("burden"))) {
    clauses.push("policy is shifting who absorbs fuel-cost pressure");
  }

  if (labels.some((label) => label.includes("infrastructure") && label.includes("advancing"))) {
    clauses.push("project execution is moving forward");
  }

  if (labels.some((label) => label.includes("reliability") && label.includes("building"))) {
    clauses.push("reliability pressure is building");
  }

  if (labels.some((label) => label.includes("electricity costs"))) {
    clauses.push("electricity costs are moving through regulated recovery channels");
  }

  if (labels.some((label) => label.includes("external shocks"))) {
    clauses.push("external shocks are transmitting into local Energy conditions");
  }

  const movementRead = clauses.length > 0
    ? clauses.join("; ")
    : themes.map((theme) => theme.theme).join("; ");

  return `${movementRead.charAt(0).toUpperCase()}${movementRead.slice(1)}. The strongest read is system movement, not story volume: price, policy, and execution signals are carrying the beat this week.`;
}

function buildEnergyEditorialOutput(
  stories: NormalizedStory[],
  eventClusters: EventCluster[] = [],
  themeClusters: StoryThemeCluster[] = []
): EnergyEditorialOutput | undefined {
  if (!stories.every((story) => story.beat === "ph_sea_energy")) {
    return undefined;
  }

  const storyMap = buildStoryMapById(stories);
  const clusterById = new Map(eventClusters.map((cluster) => [cluster.cluster_id, cluster]));
  const clusterBreakdown = eventClusters.map((cluster) =>
    energyClusterOutput(cluster, storyMap)
  );
  const themes = themeClusters
    .map((theme) => {
      const clusters = theme.cluster_ids
        .map((clusterId) => clusterById.get(clusterId))
        .filter((cluster): cluster is EventCluster => Boolean(cluster))
        .map((cluster) => energyClusterOutput(cluster, storyMap));

      return {
        theme_id: theme.theme_id,
        theme: sanitizeText(theme.theme_label),
        explanation: sanitizeText(theme.theme_summary ?? ""),
        story_count: theme.story_count,
        clusters
      };
    })
    .filter((theme) => theme.clusters.length > 0);
  const themedClusterIds = new Set(themes.flatMap((theme) =>
    theme.clusters.map((cluster) => cluster.cluster_id)
  ));
  const signalClusters = eventClusters
    .filter((cluster) => !themedClusterIds.has(cluster.cluster_id))
    .map((cluster) => ({
      cluster_id: cluster.cluster_id,
      label: sanitizeText(cluster.event_label),
      explanation: cluster.compression_line ? sanitizeText(cluster.compression_line) : undefined,
      stories: energyClusterOutput(cluster, storyMap).stories
    }));
  const clusteredStoryIds = new Set(eventClusters.flatMap((cluster) => cluster.story_ids));
  const unclusteredSignals = stories
    .filter((story) => !clusteredStoryIds.has(story.id))
    .filter(hasEnergyWatchSystemConsequence)
    .map((story) => ({
      label: sanitizeText(story.energy_filter?.primary_category ?? "Unclustered Energy signal"),
      explanation: "Kept by the Energy filter but not strong enough to join a system-movement cluster.",
      stories: [energyStoryRef(story)]
    }));
  const signalsToWatch = [...signalClusters, ...unclusteredSignals];

  return {
    editorial_read: energyEditorialRead(themes, signalsToWatch),
    themes,
    cluster_breakdown: clusterBreakdown,
    signals_to_watch: signalsToWatch
  };
}

function bankingThemeRank(themeType?: string): number {
  if (themeType === "primary") {
    return 3;
  }

  if (themeType === "secondary") {
    return 2;
  }

  return 1;
}

function bankingClusterRank(cluster: EventCluster): number {
  return bankingThemeRank(cluster.cluster_classification);
}

function bankingThemeRead(theme: StoryThemeCluster, stories: NormalizedStory[]): string {
  const label = normalizeText(theme.theme_label);

  if (label.includes("credit tightening")) {
    return "Banks and regulators are giving more attention to loan terms, borrower capacity, and credit discipline than to simple volume growth.";
  }

  if (label.includes("risk")) {
    return "The useful signal is balance-sheet caution: bad loans, provisions, exposure, or stress are becoming harder to treat as background noise.";
  }

  if (label.includes("deposit")) {
    return "Deposit behavior matters here because fund movement can change liquidity, funding costs, and competitive pressure across banks.";
  }

  if (label.includes("liquidity")) {
    return "Liquidity is the core read: banks appear more focused on buffers and optionality than on stretching for growth.";
  }

  if (label.includes("funding")) {
    return "Funding pressure matters because higher cost of funds can squeeze margins and force banks to reprice risk.";
  }

  if (label.includes("growth")) {
    return "Credit is still moving, but the important question is whether borrowers can keep absorbing it under tighter conditions.";
  }

  if (label.includes("discipline")) {
    return "The signal is not yet a full cycle turn, but loan rules and credit terms are moving onto the desk's watchlist.";
  }

  return "The signal is worth watching, but it is not yet strong enough to carry a directional system read.";
}

function bankingWatchClusterHasSystemValue(
  cluster: EventCluster,
  clusterStories: NormalizedStory[],
  visibleThemes: StoryThemeCluster[]
): boolean {
  const label = normalizeText(cluster.event_label);
  const promotedLabels = visibleThemes.map((theme) => normalizeText(theme.theme_label));
  const hasCreditTighteningTheme = promotedLabels.some((theme) =>
    theme.includes("credit tightening")
  );

  if (
    hasCreditTighteningTheme &&
    cluster.story_count === 1 &&
    (label.includes("watchlist") || label.includes("credit rules"))
  ) {
    return false;
  }

  if (cluster.story_count > 1) {
    return true;
  }

  return clusterStories.some((story) => {
    const signals = story.banking_signals;

    if (!signals) {
      return false;
    }

    const hasBalanceSheetSignal = signals.function.some((fn) =>
      ["deposits", "liquidity", "funding", "risk"].includes(fn)
    );

    return hasBalanceSheetSignal && (story.movement_score ?? 0) >= 5;
  });
}

function bankingWatchClusterLabel(
  cluster: EventCluster,
  clusterStories: NormalizedStory[]
): string {
  const label = normalizeText(cluster.event_label);
  const functions = new Set(
    clusterStories.flatMap((story) => story.banking_signals?.function ?? [])
  );

  if (
    cluster.story_count === 1 &&
    (label.includes("on watch") ||
      label.includes("watchlist") ||
      label.includes("needs confirmation"))
  ) {
    if (functions.has("liquidity")) {
      return "Liquidity signal";
    }

    if (functions.has("deposits")) {
      return "Deposit signal";
    }

    if (functions.has("funding")) {
      return "Funding signal";
    }

    if (functions.has("risk")) {
      return "Risk signal";
    }

    return "Banking signal";
  }

  return cluster.event_label;
}

function bankingWatchClusterRead(
  cluster: EventCluster,
  clusterStories: NormalizedStory[]
): string {
  const functions = new Set(
    clusterStories.flatMap((story) => story.banking_signals?.function ?? [])
  );

  if (cluster.story_count === 1) {
    if (functions.has("liquidity")) {
      return "One liquidity and reserve signal is worth monitoring, but it needs confirmation before becoming a system read.";
    }

    if (functions.has("deposits")) {
      return "One deposit-linked data point adds funding color, but it needs confirmation before carrying a theme.";
    }

    if (functions.has("funding")) {
      return "One funding signal is useful color, but it is not broad enough yet to define bank behavior.";
    }
  }

  return cluster.compression_line ?? bankingClusterCompression(cluster, clusterStories);
}

function renderBankingStoryLine(lines: string[], story: NormalizedStory): void {
  lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${story.source}`);
}

function bankingClusterCompression(
  cluster: EventCluster,
  stories: NormalizedStory[]
): string {
  const label = normalizeText(cluster.event_label);
  const text = normalizeText(stories.map((story) => `${story.title} ${story.summary ?? ""}`).join(" "));
  const hasPolicy = stories.some((story) => story.banking_signals?.driver.includes("policy"));
  const hasLending = stories.some((story) => story.banking_signals?.function.includes("lending"));
  const hasRisk = stories.some((story) => story.banking_signals?.function.includes("risk"));
  const hasRegulation = stories.some((story) => story.banking_signals?.function.includes("regulation"));

  if (label.includes("credit tightening")) {
    if (hasPolicy && hasLending) {
      return "Regulatory and lending signals are pointing in the same direction: tighter credit discipline across the system.";
    }

    return "The cluster points to stricter credit conditions, with banks or regulators becoming less willing to let lending run on autopilot.";
  }

  if (label.includes("risk") || hasRisk || text.includes("bad loans") || text.includes("capacity to pay")) {
    return "Bad-loan and borrower-capacity signals suggest risk is beginning to surface beneath still-active lending.";
  }

  if (label.includes("liquidity")) {
    if (label.includes("easing")) {
      return "The cluster points to easier liquidity conditions, but it still needs confirmation from more bank-behavior signals.";
    }

    return "The grouped stories point to banks preserving buffers rather than stretching balance sheets for growth.";
  }

  if (label.includes("deposit")) {
    return "The grouped stories point to deposit movement that could change funding cost, liquidity, or competitive behavior.";
  }

  if (label.includes("growth")) {
    return "The cluster keeps loan growth in view, but the useful read is whether that growth is becoming harder for borrowers to carry.";
  }

  if (label.includes("discipline") || hasRegulation) {
    return "Loan rules and regulatory signals are putting credit discipline back on the banking desk's watchlist.";
  }

  return "The stories belong together as early banking-system signals, but the direction still needs confirmation.";
}

function renderEditorialRead(lines: string[], packet: WeeklyEditorialPacket): void {
  lines.push("## Editorial Read");
  lines.push("");

  if (packet.editorial_read.length === 0) {
    lines.push("- There is not enough signal this week for a confident desk read.");
    lines.push("");
    return;
  }

  for (const bullet of packet.editorial_read.slice(0, 4)) {
    lines.push(`- ${sanitizeText(bullet)}`);
  }

  lines.push("");
}

function renderBankingMarkdown(
  packet: WeeklyEditorialPacket,
  stories: NormalizedStory[],
  eventClusters: EventCluster[],
  themeClusters: StoryThemeCluster[]
): string {
  const lines: string[] = [];
  const storyMap = buildStoryMapById(stories);
  const clusteredStoryIds = new Set(
    eventClusters
      .flatMap((cluster) => cluster.story_ids)
  );
  const standaloneStories = stories
    .filter((story) => !clusteredStoryIds.has(story.id))
    .filter((story) => story.editorial_bucket !== "context_watch")
    .filter((story) => story.cluster_classification === "watch")
    .sort((left, right) => (right.priority_score ?? 0) - (left.priority_score ?? 0))
    .slice(0, 8);
  const standaloneStoryIds = new Set(standaloneStories.map((story) => story.id));
  const contextWatch = stories
    .filter((story) => (story.movement_score ?? 0) >= 5)
    .filter((story) => !clusteredStoryIds.has(story.id))
    .filter((story) => !standaloneStoryIds.has(story.id))
    .filter((story) => story.cluster_classification === "watch" || story.editorial_bucket === "context_watch")
    .sort((left, right) => (right.movement_score ?? 0) - (left.movement_score ?? 0))
    .slice(0, 8);
  const visibleThemes = [...themeClusters]
    .sort((left, right) => {
      const rankDelta = bankingThemeRank(right.theme_type) - bankingThemeRank(left.theme_type);

      if (rankDelta !== 0) {
        return rankDelta;
      }

      return right.story_count - left.story_count;
    })
    .filter((theme) => theme.theme_type !== "watch" || theme.story_count >= 2)
    .slice(0, 4);
  const clusterById = new Map(eventClusters.map((cluster) => [cluster.cluster_id, cluster]));
  const coreClusters = visibleThemes.flatMap((theme) =>
    theme.cluster_ids
      .map((clusterId) => clusterById.get(clusterId))
      .filter((cluster): cluster is EventCluster => Boolean(cluster))
  );
  const coreClusterIds = new Set(coreClusters.map((cluster) => cluster.cluster_id));
  const watchClusters = eventClusters
    .filter((cluster) => !coreClusterIds.has(cluster.cluster_id))
    .filter((cluster) => {
      const clusterStories = cluster.story_ids
        .map((storyId) => storyMap.get(storyId))
        .filter((story): story is NormalizedStory => Boolean(story));

      return bankingWatchClusterHasSystemValue(cluster, clusterStories, visibleThemes);
    })
    .sort((left, right) => {
      const rankDelta = bankingClusterRank(right) - bankingClusterRank(left);

      if (rankDelta !== 0) {
        return rankDelta;
      }

      return right.priority_score - left.priority_score;
    });

  lines.push(`# ${packet.beat_name}`);
  lines.push("");
  lines.push(`Week of ${packet.week_of}`);
  lines.push("");
  renderEditorialRead(lines, packet);
  lines.push("## Themes");
  lines.push("");

  for (const theme of visibleThemes) {
    const themeStories = theme.top_story_refs
      .map((storyId) => storyMap.get(storyId))
      .filter((story): story is NormalizedStory => Boolean(story));

    lines.push(`### ${sanitizeText(theme.theme_label)}`);
    lines.push(bankingThemeRead(theme, themeStories));
    lines.push("");

    for (const story of themeStories.slice(0, 3)) {
      renderBankingStoryLine(lines, story);
    }

    lines.push("");
  }

  lines.push("## Cluster breakdown");
  lines.push("");

  for (const cluster of coreClusters) {
    const clusterStories = cluster.story_ids
      .map((storyId) => storyMap.get(storyId))
      .filter((story): story is NormalizedStory => Boolean(story));

    lines.push(`### ${sanitizeText(cluster.event_label)}`);
    lines.push(bankingClusterCompression(cluster, clusterStories));
    lines.push("");

    for (const story of clusterStories.slice(0, 4)) {
      renderBankingStoryLine(lines, story);
    }

    lines.push("");
  }

  lines.push("## Signals to watch");
  lines.push("");

  if (watchClusters.length === 0) {
    lines.push("- No weaker banking-system signal added enough value outside the main movements.");
  } else {
    for (const cluster of watchClusters.slice(0, 6)) {
      const clusterStories = cluster.story_ids
        .map((storyId) => storyMap.get(storyId))
        .filter((story): story is NormalizedStory => Boolean(story));
      const leadStory = clusterStories[0];

      if (!leadStory) {
        continue;
      }

      lines.push(
        `- **${sanitizeText(bankingWatchClusterLabel(cluster, clusterStories))}:** ${sanitizeText(bankingWatchClusterRead(cluster, clusterStories))} [${sanitizeText(leadStory.title)}](${leadStory.url}) | ${leadStory.source}`
      );
    }
  }

  lines.push("");
  lines.push("## Standalone signals");
  lines.push("");

  if (standaloneStories.length === 0) {
    lines.push("- No standalone banking-system signal cleared the watch threshold outside the active clusters.");
  } else {
    for (const story of standaloneStories) {
      renderBankingStoryLine(lines, story);
    }
  }

  lines.push("");
  lines.push("## Context watch");
  lines.push("");

  if (contextWatch.length === 0) {
    lines.push("- No additional weak banking-system signals cleared the watch threshold.");
  } else {
    for (const story of contextWatch) {
      renderBankingStoryLine(lines, story);
    }
  }

  lines.push("");

  return lines.join("\n");
}

function renderEnergyStoryRef(lines: string[], story: EnergyStoryRef): void {
  const metadata = [
    story.source,
    story.primary_category ? `category: ${story.primary_category}` : "",
    story.importance_tier ? `tier: ${story.importance_tier}` : "",
    story.system_pressure ? "system_pressure" : ""
  ].filter(Boolean).join(" | ");

  lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${metadata}`);
}

function renderEnergyMarkdown(packet: WeeklyEditorialPacket): string {
  const output = packet.energy_output;
  const lines: string[] = [];

  lines.push(`# ${packet.beat_name}`);
  lines.push("");
  lines.push(`Week of ${packet.week_of}`);
  lines.push("");

  if (!output) {
    renderEditorialRead(lines, packet);

    return lines.join("\n");
  }

  renderEditorialRead(lines, packet);
  lines.push("## Themes");
  lines.push("");

  if (output.themes.length === 0) {
    lines.push("- No cluster cleared the Energy theme threshold.");
    lines.push("");
  } else {
    for (const theme of output.themes) {
      lines.push(`### ${sanitizeText(theme.theme)}`);
      lines.push(sanitizeText(theme.explanation));
      lines.push("");

      for (const cluster of theme.clusters) {
        lines.push(`- Supporting cluster: ${sanitizeText(cluster.label)} (${cluster.cluster_id})`);
      }

      lines.push("");
    }
  }

  lines.push("## Cluster breakdown");
  lines.push("");

  if (output.cluster_breakdown.length === 0) {
    lines.push("- No Energy movement clusters were formed.");
    lines.push("");
  } else {
    for (const cluster of output.cluster_breakdown) {
      lines.push(`### ${sanitizeText(cluster.label)} (${cluster.cluster_id})`);
      if (cluster.theme_label) {
        lines.push(`Theme: ${sanitizeText(cluster.theme_label)}`);
      } else {
        lines.push("Theme: none");
      }
      if (cluster.compression_line) {
        lines.push(sanitizeText(cluster.compression_line));
      }
      lines.push("");

      for (const story of cluster.stories) {
        renderEnergyStoryRef(lines, story);
      }

      lines.push("");
    }
  }

  lines.push("## Signals to watch");
  lines.push("");

  if (output.signals_to_watch.length === 0) {
    lines.push("- No unthemed Energy clusters or unclustered signals remain.");
  } else {
    for (const signal of output.signals_to_watch) {
      const label = signal.cluster_id
        ? `${sanitizeText(signal.label)} (${signal.cluster_id})`
        : sanitizeText(signal.label);
      lines.push(`### ${label}`);
      if (signal.explanation) {
        lines.push(sanitizeText(signal.explanation));
        lines.push("");
      }

      for (const story of signal.stories) {
        renderEnergyStoryRef(lines, story);
      }

      lines.push("");
    }
  }

  return lines.join("\n");
}

function renderAiTechStoryRef(lines: string[], story: AiTechStoryRef): void {
  const metadata = [
    story.source,
    story.primary_axis ? `axis: ${story.primary_axis}` : "",
    story.geography ? `geo: ${story.geography}` : "",
    story.importance_tier ? `tier: ${story.importance_tier}` : ""
  ].filter(Boolean).join(" | ");

  lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${metadata}`);
}

function renderAiTechBucket(
  lines: string[],
  title: string,
  stories: AiTechStoryRef[],
  emptyText: string
): void {
  lines.push(`## ${title}`);
  lines.push("");

  if (stories.length === 0) {
    lines.push(`- ${emptyText}`);
    lines.push("");
    return;
  }

  for (const story of stories) {
    renderAiTechStoryRef(lines, story);
  }

  lines.push("");
}

function renderAiTechMarkdown(packet: WeeklyEditorialPacket): string {
  const output = packet.ai_tech_output;
  const lines: string[] = [];

  lines.push(`# ${packet.beat_name}`);
  lines.push("");
  lines.push(`Week of ${packet.week_of}`);
  lines.push("");
  renderEditorialRead(lines, packet);

  if (!output) {
    lines.push("## Core Signals");
    lines.push("");
    lines.push("- No AI/Tech editorial bucket output was generated for this run.");
    lines.push("");

    return lines.join("\n");
  }

  renderAiTechBucket(
    lines,
    "Core Signals",
    output.core_signals,
    "No hard AI-system movement is strong enough for Core Signals."
  );
  renderAiTechBucket(
    lines,
    "Interpretation Layer",
    output.interpretation_layer,
    "No grounded interpretation cleared the quality gate."
  );
  renderAiTechBucket(
    lines,
    "Platform / Capability Watch",
    output.capability_watch,
    "No downstream platform or capability enabler is material enough this week."
  );

  return lines.join("\n");
}

function renderPropertyStoryRef(lines: string[], story: PropertyStoryRef): void {
  const details = [
    story.primary_axis,
    story.importance_tier,
    story.geography,
    story.stress_signal ? "stress signal" : undefined
  ].filter(Boolean);

  lines.push(`- [${story.title}](${story.url})`);
  lines.push(`  - Source: ${story.source}${details.length > 0 ? ` | ${details.join(" | ")}` : ""}`);
}

function renderPropertyBucket(
  lines: string[],
  title: string,
  stories: PropertyStoryRef[],
  emptyText: string
): void {
  lines.push(`## ${title}`);
  lines.push("");

  if (stories.length === 0) {
    lines.push(`- ${emptyText}`);
    lines.push("");
    return;
  }

  for (const story of stories) {
    renderPropertyStoryRef(lines, story);
  }

  lines.push("");
}

function renderPropertyMarkdown(packet: WeeklyEditorialPacket): string {
  const output = packet.property_output;
  const lines: string[] = [];

  lines.push(`# ${packet.beat_name}`);
  lines.push("");
  lines.push(`Week of ${packet.week_of}`);
  lines.push("");
  renderEditorialRead(lines, packet);

  if (!output) {
    lines.push("## Core Signals");
    lines.push("");
    lines.push("- No Property / Real Estate editorial bucket output was generated for this run.");
    lines.push("");

    return lines.join("\n");
  }

  renderPropertyBucket(
    lines,
    "Core Signals",
    output.core_signals,
    "No hard property-market movement is strong enough for Core Signals."
  );
  renderPropertyBucket(
    lines,
    "Interpretation Layer",
    output.interpretation_layer,
    "No grounded pressure reading is strong enough this week."
  );
  renderPropertyBucket(
    lines,
    "Capability Watch",
    output.capability_watch,
    "No material financing, REIT, tool, or developer-strategy context stands out this week."
  );

  return lines.join("\n");
}

function buildPatternBullets(
  primaryItems: EditorialBriefItem[],
  structuralItems: EditorialBriefItem[],
  watchlistItems: EditorialBriefItem[]
): string[] {
  return [...new Set(
    [...primaryItems, ...structuralItems, ...watchlistItems].map((item) => item.pattern)
  )].slice(0, 5);
}

export function renderWeeklyEditorialPacketMarkdown(
  packet: WeeklyEditorialPacket,
  stories: NormalizedStory[],
  eventClusters: EventCluster[],
  themeClusters: StoryThemeCluster[]
): string {
  const lines: string[] = [];
  const storyMap = buildStoryMapById(stories);
  const themeItems = themeClusters
    .map((themeCluster) => buildThemeBriefItem(themeCluster, storyMap))
    .sort((left, right) => right.score - left.score);
  const coveredThemeIds = new Set(themeClusters.slice(0, themeItems.length).map((theme) => theme.theme_id));
  const eventItems = eventClusters
    .filter((cluster) => !cluster.primary_theme_id || !coveredThemeIds.has(cluster.primary_theme_id))
    .map((cluster) => buildEventBriefItem(cluster, storyMap))
    .sort((left, right) => right.score - left.score);
  const storyItems = buildStoryBriefItems(stories);
  const storyFirstBeats = new Set([
    "ai_tech",
    "ph_sea_banking",
    "ph_sea_energy",
    "property_real_estate"
  ]);
  const useStorySignalsFirst = stories.some((story) => storyFirstBeats.has(story.beat));
  const primarySignalItems = useStorySignalsFirst ? storyItems : themeItems;
  const secondarySignalItems = useStorySignalsFirst ? themeItems : storyItems;
  const whatMattersMost = sectionUnique(primarySignalItems, 4);

  if (!useStorySignalsFirst && whatMattersMost.length < 5) {
    const seenLabels = new Set(whatMattersMost.map((item) => item.label));

    for (const item of eventItems) {
      if (seenLabels.has(item.label)) {
        continue;
      }

      whatMattersMost.push(item);
      seenLabels.add(item.label);

      if (whatMattersMost.length >= 5) {
        break;
      }
    }
  }

  if (!useStorySignalsFirst && whatMattersMost.length < 5) {
    const seenLabels = new Set(whatMattersMost.map((item) => item.label));

    for (const item of secondarySignalItems) {
      if (seenLabels.has(item.label)) {
        continue;
      }

      whatMattersMost.push(item);
      seenLabels.add(item.label);

      if (whatMattersMost.length >= 5) {
        break;
      }
    }
  }

  const usedStoryIds = new Set(
    whatMattersMost.flatMap((item) => item.supportingStories.map((story) => story.id))
  );
  const blockedLabels = new Set(whatMattersMost.map((item) => item.label));
  const structuralShifts = sectionUnique(
    primarySignalItems
    .slice(4, 10)
    .filter((item) => !blockedLabels.has(item.label))
    .filter((item) =>
      item.supportingStories.some((story) => !usedStoryIds.has(story.id))
    ),
    4
  );

  if (!useStorySignalsFirst && structuralShifts.length < 3) {
    for (const item of eventItems) {
      if (blockedLabels.has(item.label)) {
        continue;
      }

      if (!item.supportingStories.some((story) => !usedStoryIds.has(story.id))) {
        continue;
      }

      structuralShifts.push(item);
      blockedLabels.add(item.label);

      for (const story of item.supportingStories) {
        usedStoryIds.add(story.id);
      }

      if (structuralShifts.length >= 3) {
        break;
      }
    }
  }

  if (!useStorySignalsFirst && structuralShifts.length < 3) {
    for (const item of secondarySignalItems) {
      if (blockedLabels.has(item.label)) {
        continue;
      }

      if (!item.supportingStories.some((story) => !usedStoryIds.has(story.id))) {
        continue;
      }

      structuralShifts.push(item);
      blockedLabels.add(item.label);

      for (const story of item.supportingStories) {
        usedStoryIds.add(story.id);
      }

      if (structuralShifts.length >= 3) {
        break;
      }
    }
  }

  for (const item of structuralShifts) {
    blockedLabels.add(item.label);
    for (const story of item.supportingStories) {
      usedStoryIds.add(story.id);
    }
  }

  const watchlist = buildWatchlistItems(stories, usedStoryIds, blockedLabels).slice(0, 5);
  const patternBullets = buildPatternBullets(
    whatMattersMost,
    structuralShifts,
    watchlist
  );

  lines.push(`# Weekly Editorial Packet — ${packet.beat_name}`);
  lines.push("");
  lines.push(`Week of ${packet.week_of}`);
  lines.push("");
  renderEditorialRead(lines, packet);
  renderBriefSection(lines, "What matters most", whatMattersMost, "Why it matters");
  renderBriefSection(lines, "Structural shifts", structuralShifts, "Editorial note");
  renderWatchlistSection(lines, watchlist);
  lines.push("## What seems to be happening");
  lines.push("");

  for (const bullet of patternBullets) {
    lines.push(`- ${bullet}`);
  }

  lines.push("");

  return lines.join("\n");
}

export function buildWeeklyEditorialPacket(
  stories: NormalizedStory[],
  droppedStories: StoryDrop[],
  topStoriesSelection: {
    top_stories: Array<PrioritizedStory & { why_it_matters: string }>;
    secondary_signals: Array<PrioritizedStory & { note: string }>;
  },
  timeMode: AiTechTimeMode,
  fetchedAt: string,
  beatName = "AI / Tech",
  eventClusters: EventCluster[] = [],
  storyThemeClusters: StoryThemeCluster[] = []
): WeeklyEditorialPacket {
  const storyMap = buildStoryMap(stories);
  const enrichedTopStories = topStoriesSelection.top_stories.map((story) =>
    enrichTopStory(story, storyMap)
  );
  const enrichedSecondarySignals = topStoriesSelection.secondary_signals.map((story) =>
    enrichSecondaryStory(story, storyMap)
  );
  const droppedTimeModeStories = droppedStories.filter(
    (story) => story.reason === "dropped_time_mode" && story.title && story.date
  );
  const latestDroppedDate =
    droppedTimeModeStories.length > 0
      ? droppedTimeModeStories
          .map((story) => new Date(story.date ?? fetchedAt).getTime())
          .reduce((latest, current) => Math.max(latest, current), 0)
      : new Date(fetchedAt).getTime();
  const contextWatch = droppedTimeModeStories
    .map((story) => scoreContextDrop(story, latestDroppedDate))
    .filter((story) => story.context_score > 0)
    .sort((left, right) => {
      if (right.context_score !== left.context_score) {
        return right.context_score - left.context_score;
      }

      return right.date.localeCompare(left.date);
    })
    .slice(0, 15);
  const themeClusters = buildThemeClusters(
    enrichedTopStories,
    enrichedSecondarySignals
  );
  const energyOutput = buildEnergyEditorialOutput(
    stories,
    eventClusters,
    storyThemeClusters
  );
  const aiTechOutput = buildAiTechEditorialOutput(stories);
  const propertyOutput = buildPropertyEditorialOutput(stories);
  const editorialRead = buildSharedEditorialRead(stories, beatName, storyThemeClusters);
  const bucketedOutput = energyOutput || propertyOutput;

  return {
    week_of: getWeekOf(stories, fetchedAt),
    time_mode: timeMode,
    beat_name: beatName,
    editorial_read: editorialRead,
    top_stories: bucketedOutput ? [] : enrichedTopStories,
    secondary_signals: bucketedOutput ? [] : enrichedSecondarySignals,
    context_watch: bucketedOutput ? [] : contextWatch,
    theme_clusters: bucketedOutput ? [] : themeClusters,
    energy_output: energyOutput,
    ai_tech_output: aiTechOutput,
    property_output: propertyOutput,
    notes: {
      top_story_count: bucketedOutput ? 0 : enrichedTopStories.length,
      secondary_count: bucketedOutput ? 0 : enrichedSecondarySignals.length,
      context_count: bucketedOutput ? 0 : contextWatch.length
    }
  };
}
