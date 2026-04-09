import type { AiTechTimeMode } from "../config/time-modes.js";
import type { NormalizedStory, StoryDrop } from "./types.js";

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

type ThemeCluster = {
  theme: string;
  story_count: number;
  stories: string[];
};

type WeeklyEditorialPacket = {
  week_of: string;
  time_mode: AiTechTimeMode;
  top_stories: TopStory[];
  secondary_signals: SecondarySignal[];
  context_watch: ContextWatchItem[];
  theme_clusters: ThemeCluster[];
  notes: {
    top_story_count: number;
    secondary_count: number;
    context_count: number;
  };
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
): ThemeCluster[] {
  const combined = [...topStories, ...secondarySignals];
  const clusters: ThemeCluster[] = [];

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

export function renderWeeklyEditorialPacketMarkdown(
  packet: WeeklyEditorialPacket
): string {
  const lines: string[] = [];

  lines.push("# Weekly Editorial Packet");
  lines.push("");
  lines.push(`- Week of: ${packet.week_of}`);
  lines.push(`- Time mode: ${packet.time_mode}`);
  lines.push(`- Top stories: ${packet.notes.top_story_count}`);
  lines.push(`- Secondary signals: ${packet.notes.secondary_count}`);
  lines.push(`- Context watch: ${packet.notes.context_count}`);
  lines.push("");
  lines.push("## Top Stories");
  lines.push("");

  for (const story of packet.top_stories) {
    lines.push(`### ${story.title}`);
    lines.push(`- Source: ${story.source}`);
    lines.push(`- Date: ${formatDate(story.date)}`);
    lines.push(`- ${renderLink(story.original_url)}`);
    lines.push(`- What happened: ${story.what_happened}`);
    lines.push(`- Why this matters: ${story.why_this_matters}`);
    lines.push("");
  }

  lines.push("## Secondary Signals");
  lines.push("");

  for (const story of packet.secondary_signals) {
    lines.push(`### ${story.title}`);
    lines.push(`- Source: ${story.source}`);
    lines.push(`- Date: ${formatDate(story.date)}`);
    lines.push(`- ${renderLink(story.original_url)}`);
    if (story.summary) {
      lines.push(`- Summary: ${story.summary}`);
    }
    lines.push(`- Note: ${story.note}`);
    lines.push("");
  }

  lines.push("## Context Watch");
  lines.push("");

  for (const story of packet.context_watch) {
    lines.push(`### ${story.title}`);
    lines.push(`- Source: ${story.source}`);
    lines.push(`- Date: ${formatDate(story.date)}`);
    lines.push(`- ${renderLink(story.original_url)}`);
    lines.push(`- Note: ${story.note}`);
    lines.push("");
  }

  lines.push("## Theme Clusters");
  lines.push("");

  for (const cluster of packet.theme_clusters) {
    lines.push(`### ${cluster.theme}`);
    lines.push(`- Story count: ${cluster.story_count}`);
    for (const title of cluster.stories) {
      lines.push(`- ${title}`);
    }
    lines.push("");
  }

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
  fetchedAt: string
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

  return {
    week_of: getWeekOf(stories, fetchedAt),
    time_mode: timeMode,
    top_stories: enrichedTopStories,
    secondary_signals: enrichedSecondarySignals,
    context_watch: contextWatch,
    theme_clusters: themeClusters,
    notes: {
      top_story_count: enrichedTopStories.length,
      secondary_count: enrichedSecondarySignals.length,
      context_count: contextWatch.length
    }
  };
}
