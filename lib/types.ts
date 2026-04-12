export type Beat = "ai_tech" | "philippine_motoring" | "ph_sea_banking" | "ph_sea_energy";

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
  | "watchlist_signal"
  | "product_signal";

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

export type BankingFunction =
  | "lending"
  | "deposits"
  | "liquidity"
  | "funding"
  | "risk"
  | "regulation"
  | "digital_shift";

export type BankingDirection =
  | "rising"
  | "falling"
  | "tightening"
  | "loosening"
  | "shifting"
  | "preserving"
  | "repricing";

export type BankingScope = "single_bank" | "multi_bank" | "system";

export type BankingDriver = "policy" | "market" | "institution" | "regional";

export type BankingEntityType =
  | "private_bank"
  | "state_bank"
  | "regulator"
  | "multilateral";

export type BankingSignals = {
  function: BankingFunction[];
  direction: BankingDirection[];
  scope: BankingScope;
  driver: BankingDriver[];
  entity_type: BankingEntityType[];
  movement_score: number;
  score_dimensions: {
    system_impact: number;
    behavior_signal: number;
    signal_strength: number;
    cross_confirmation: number;
    editorial_value: number;
    penalties: number;
  };
};

export type EnergySystemAxis =
  | "supply"
  | "demand"
  | "price"
  | "policy"
  | "infrastructure"
  | "external_forces";

export type EnergySystemStage =
  | "generation"
  | "transmission"
  | "distribution"
  | "consumption";

export type EnergyMandatoryQuestion =
  | "supply"
  | "price"
  | "policy"
  | "system_pressure";

export type EnergyBeatStructure = {
  system_axes: EnergySystemAxis[];
  system_flow: EnergySystemStage[];
  system_operators: string[];
  mandatory_questions: EnergyMandatoryQuestion[];
  inclusion_requirement: string;
  detects_system_pressure: boolean;
};

export type SourceDefinition = {
  name: string;
  beat: Beat;
  type: SourceType;
  url: string;
  maxItems?: number;
  daysBack?: number;
  preferNativeRssFetch?: boolean;
  useFetchedAtWhenMissingDate?: boolean;
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
  banking_signals?: BankingSignals;
  movement_score?: number;
  cluster_id?: string;
  cluster_kind?: ClusterKind;
  cluster_type?: "event" | "pattern";
  cluster_classification?: "primary" | "secondary" | "watch";
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
  associated_stories?: ClusterAssociatedStory[];
  entities: string[];
  event_label: string;
  compression_line?: string;
  priority_score: number;
  editorial_bucket: EditorialBucket;
  cluster_type?: "event" | "pattern";
  cluster_classification?: "primary" | "secondary" | "watch";
  primary_theme_id?: string;
  primary_theme_label?: string;
  supporting_story_ids: string[];
};

export type ThemeCluster = {
  theme_id: string;
  theme_label: string;
  theme_summary?: string;
  story_count: number;
  cluster_ids: string[];
  story_ids: string[];
  associated_stories?: ClusterAssociatedStory[];
  dominant_reason_codes: ReasonCode[];
  dominant_angle_signals: string[];
  top_story_refs: string[];
  theme_type?: "primary" | "secondary" | "watch";
};

export type ClusterAssociatedStory = {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
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
  health: SourceHealthStatus;
  fetchedCount: number;
  normalizedCount: number;
  droppedCount: number;
  keptCount: number;
  error?: string;
  errorKind?: SourceFailureKind;
};

export type SourceHealthStatus = "healthy" | "degraded" | "failing";

export type SourceFailureKind =
  | "http_error"
  | "dns_error"
  | "parse_error"
  | "timeout"
  | "network_error"
  | "unknown_error";

export type SourceHealthSummary = SourceRunSummary & {
  beat: Beat;
  url: string;
  type: SourceDefinition["type"];
  checkedAt: string;
};
