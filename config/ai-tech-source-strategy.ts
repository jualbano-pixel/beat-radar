export type AiTechSourceTier =
  | "tier_1_ph_policy_ground_truth"
  | "tier_2_ph_business_adoption"
  | "tier_3_regional_asean"
  | "tier_4_global_filtered";

export type AiTechSourceStrategyEntry = {
  tier: AiTechSourceTier;
  function: string;
  sources: string[];
  useFor: string[];
  reliability: "stable" | "unstable" | "limited_access" | "architectural_only";
  ingestionScope: "core" | "conservative" | "architectural_only";
  notes: string;
};

export const aiTechSourceStrategy: AiTechSourceStrategyEntry[] = [
  {
    tier: "tier_1_ph_policy_ground_truth",
    function: "PH / policy / ground truth",
    sources: [
      "DICT",
      "Philippine AI Roadmap / government sources",
      "NEDA",
      "DTI",
      "BSP"
    ],
    useFor: [
      "AI policy",
      "digital economy direction",
      "government deployment",
      "finance-sector AI regulation"
    ],
    reliability: "stable",
    ingestionScope: "conservative",
    notes:
      "Use official feeds when stable. Some roadmap pages are architectural references rather than core ingestion endpoints."
  },
  {
    tier: "tier_2_ph_business_adoption",
    function: "PH business / adoption layer",
    sources: [
      "BusinessWorld",
      "Inquirer Tech / Business",
      "PhilStar Tech / Business",
      "Malaya Business"
    ],
    useFor: [
      "enterprise adoption",
      "local deployment",
      "workflow impact",
      "business model changes",
      "local platform distribution"
    ],
    reliability: "stable",
    ingestionScope: "core",
    notes:
      "Primary ingestion layer for PH/SEA AI-system intelligence. Broad business feeds are filtered hard for actual AI deployment or policy movement."
  },
  {
    tier: "tier_3_regional_asean",
    function: "Regional / ASEAN",
    sources: [
      "ASEAN technology policy sources",
      "SEA startup and tech coverage",
      "regional infrastructure, cloud, and telco coverage"
    ],
    useFor: [
      "ASEAN positioning",
      "regional regulatory movement",
      "cloud or telco capacity",
      "competition for AI investment and talent"
    ],
    reliability: "architectural_only",
    ingestionScope: "architectural_only",
    notes:
      "Keep architectural until stable, consistently scrapeable endpoints are selected."
  },
  {
    tier: "tier_4_global_filtered",
    function: "Global platform and capability drivers",
    sources: [
      "OpenAI",
      "Google",
      "Microsoft",
      "Meta",
      "major technology reporting outlets"
    ],
    useFor: [
      "platform capability shifts",
      "pricing or access changes",
      "developer distribution",
      "enterprise deployment dependencies"
    ],
    reliability: "stable",
    ingestionScope: "conservative",
    notes:
      "Global stories are not core by default. They must affect real usage, pricing, access, deployment, or PH/SEA downstream exposure."
  }
];
