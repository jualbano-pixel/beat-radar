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

export type ClusterKind =
  | "same_event"
  | "same_topic_different_angle"
  | "standalone";

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
  cluster_id?: string;
  cluster_kind?: ClusterKind;
  theme_id?: string;
  theme_label?: string;
  fetchedAt: string;
};

export type EventCluster = {
  cluster_id: string;
  cluster_kind: "same_event";
  lead_story_id: string;
  story_count: number;
  story_ids: string[];
  story_titles: string[];
  entities: string[];
  event_label: string;
  priority_score: number;
  editorial_bucket: EditorialBucket;
  primary_theme_id?: string;
  primary_theme_label?: string;
  supporting_story_ids: string[];
};

export type ThemeCluster = {
  theme_id: string;
  theme_label: string;
  story_count: number;
  cluster_ids: string[];
  story_ids: string[];
  dominant_reason_codes: ReasonCode[];
  dominant_angle_signals: string[];
  top_story_refs: string[];
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
