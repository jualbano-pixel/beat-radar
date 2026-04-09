export type Beat = "ai_tech";

export type SourceType = "rss" | "html";

export type AiTechTimeMode = "current" | "context";

export type EditorialBucket =
  | "urgent_important"
  | "structural_trend"
  | "context_watch"
  | "background";

export type ReasonCode =
  | "meaningful_shift"
  | "developing_pattern"
  | "policy_regulatory_move"
  | "local_business_relevance"
  | "ongoing_story_advance"
  | "counterpoint"
  | "market_signal"
  | "execution_consequence"
  | "industry_repositioning"
  | "watchlist_signal";

export type PriorityBreakdown = {
  immediacy: number;
  impact: number;
  continuity: number;
  relevance: number;
  distinctiveness: number;
};

export type SourceDefinition = {
  name: string;
  beat: Beat;
  type: SourceType;
  url: string;
  maxItems?: number;
  daysBack?: number;
  selectors?: {
    item?: string;
    title?: string;
    link?: string;
    date?: string;
    summary?: string;
  };
};

export type RawStoryResult = {
  source: string;
  title?: string;
  url?: string;
  publishedAt?: string;
  summary?: string;
};

export type NormalizedStory = {
  id: string;
  source: string;
  beat: Beat;
  title: string;
  url: string;
  date: string;
  publishedAt: string;
  summary?: string;
  tags: string[];
  reason_kept: string[];
  priority_score?: number;
  priority_breakdown?: PriorityBreakdown;
  editorial_bucket?: EditorialBucket;
  reason_code?: ReasonCode;
  angle_signals?: string[];
  fetchedAt: string;
};

export type StoryDropReason =
  | "missing_title"
  | "missing_url"
  | "missing_published_at"
  | "invalid_url"
  | "invalid_date"
  | "garbage_title"
  | "garbage_summary"
  | "hard_excluded_commerce"
  | "hard_excluded_event_promo"
  | "dropped_time_mode"
  | "over_source_limit"
  | "low_relevance"
  | "deduped";

export type StoryDrop = {
  source: string;
  title?: string;
  url?: string;
  date?: string;
  reason: StoryDropReason;
  details?: string;
};

export type ReviewResult = {
  kept: NormalizedStory[];
  dropped: StoryDrop[];
};

export type NormalizationResult = {
  kept: NormalizedStory[];
  dropped: StoryDrop[];
};

export type RelevanceResult = {
  kept: NormalizedStory[];
  dropped: StoryDrop[];
};

export type DedupeResult = {
  kept: NormalizedStory[];
  dropped: StoryDrop[];
};

export type SourceRunSummary = {
  source: string;
  success: boolean;
  fetchedCount: number;
  normalizedCount: number;
  droppedCount: number;
  keptCount: number;
  error?: string;
};
