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
      "Department of Information and Communications Technology AI Policy",
      "Department of Trade and Industry AI Economy",
      "NEDA Digital Economy",
      "Department of Labor and Employment Workforce Transition",
      "TESDA Skills and Workforce Transition",
      "Bangko Sentral ng Pilipinas AI/Tech"
    ],
    useFor: [
      "AI policy",
      "digital economy direction",
      "government deployment",
      "finance-sector AI regulation",
      "workforce transition"
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
      "Malaya Business",
      "IBPAP IT-BPM AI Transition",
      "Philippine Economic Zone Authority Digital Infrastructure",
      "Board of Investments Digital Economy"
    ],
    useFor: [
      "enterprise adoption",
      "local deployment",
      "workflow impact",
      "business model changes",
      "local platform distribution",
      "IT-BPM and BPO operating-model shifts",
      "digital infrastructure investment"
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
      "ASEAN Digital Economy and AI Governance",
      "ERIA Digital Economy",
      "Asian Development Bank Digital Economy",
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
    ingestionScope: "conservative",
    notes:
      "Ingest conservatively with hard materiality gates for DEFA, ADGMIN, AMMSTI, AI governance, workforce readiness, and digital infrastructure movement."
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
