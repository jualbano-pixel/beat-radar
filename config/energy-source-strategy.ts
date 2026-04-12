import type { Beat } from "../lib/types.js";

export type SourceReliability = "stable" | "unstable" | "limited_access";

export type EnergySourceFunction =
  | "system_operators"
  | "business_policy_reporting"
  | "external_global_drivers"
  | "supporting_signals";

export type EnergySourceStrategyEntry = {
  name: string;
  reliability: SourceReliability;
  ingestionRole:
    | "core_candidate"
    | "conservative_official_candidate"
    | "external_context_candidate"
    | "limited_supporting_candidate";
  notes: string;
};

export type EnergySourceStrategyCategory = {
  tier: 1 | 2 | 3 | 4;
  function: EnergySourceFunction;
  label: string;
  role: string;
  sources: EnergySourceStrategyEntry[];
};

export type EnergySourceStrategy = {
  beat: Beat;
  principle: string;
  categories: EnergySourceStrategyCategory[];
};

export const phSeaEnergySourceStrategy: EnergySourceStrategy = {
  beat: "ph_sea_energy",
  principle:
    "Organize sources by function first; promote only stable RSS or consistently scrapeable pages into ingestion later.",
  categories: [
    {
      tier: 1,
      function: "system_operators",
      label: "System operators",
      role: "Ground truth for supply, grid conditions, regulatory action, and policy signals.",
      sources: [
        {
          name: "Department of Energy",
          reliability: "unstable",
          ingestionRole: "conservative_official_candidate",
          notes: "High-trust official source; include conservatively if updates are consistently reachable."
        },
        {
          name: "Energy Regulatory Commission",
          reliability: "unstable",
          ingestionRole: "conservative_official_candidate",
          notes: "High-trust policy and tariff source; likely needs reliability testing before core ingestion."
        },
        {
          name: "National Grid Corporation of the Philippines",
          reliability: "unstable",
          ingestionRole: "conservative_official_candidate",
          notes: "High-trust grid and alert source; do not force into core ingestion if endpoint behavior is inconsistent."
        }
      ]
    },
    {
      tier: 2,
      function: "business_policy_reporting",
      label: "Core business and policy reporting",
      role: "Primary ingestion layer for interpretation, market impact, and policy consequences.",
      sources: [
        {
          name: "BusinessWorld",
          reliability: "stable",
          ingestionRole: "core_candidate",
          notes: "Core Philippine business source; preferred for stable RSS-based ingestion."
        },
        {
          name: "Inquirer Business",
          reliability: "stable",
          ingestionRole: "core_candidate",
          notes: "Core Philippine business source; useful for price, utility, and consumer impact coverage."
        },
        {
          name: "BusinessMirror",
          reliability: "stable",
          ingestionRole: "core_candidate",
          notes: "Core business and policy source; prefer RSS or native feed behavior if reliable."
        },
        {
          name: "Philippine Star Business",
          reliability: "stable",
          ingestionRole: "core_candidate",
          notes: "Core business source; useful for company, policy, and consumer-cost framing."
        },
        {
          name: "Malaya Business",
          reliability: "stable",
          ingestionRole: "core_candidate",
          notes: "Core Philippine business source; useful for utility, fuel, tariff, and policy follow-through."
        }
      ]
    },
    {
      tier: 3,
      function: "external_global_drivers",
      label: "External and global energy drivers",
      role: "Commodity, geopolitical, and regional pressure that may transmit into Philippine energy costs or supply.",
      sources: [
        {
          name: "Reuters Energy",
          reliability: "limited_access",
          ingestionRole: "external_context_candidate",
          notes: "High-value global energy coverage, but access and redistribution constraints may limit ingestion."
        },
        {
          name: "EIA",
          reliability: "stable",
          ingestionRole: "external_context_candidate",
          notes: "Stable official global energy context; useful for oil, gas, LNG, and commodity pressure."
        },
        {
          name: "IEA",
          reliability: "stable",
          ingestionRole: "external_context_candidate",
          notes: "Stable global energy context; useful for regional demand, supply, and transition pressure."
        },
        {
          name: "ASEAN energy sources",
          reliability: "stable",
          ingestionRole: "external_context_candidate",
          notes: "Use for regional supply, demand, interconnection, and competition for fuel or capacity."
        }
      ]
    },
    {
      tier: 4,
      function: "supporting_signals",
      label: "Supporting signals",
      role: "Secondary confirmation only; not a main ingestion base until specific feeds prove reliable.",
      sources: [
        {
          name: "Generation companies",
          reliability: "limited_access",
          ingestionRole: "limited_supporting_candidate",
          notes: "Use selectively for outages, capacity, fuel supply, and project execution confirmation."
        },
        {
          name: "Infrastructure updates",
          reliability: "limited_access",
          ingestionRole: "limited_supporting_candidate",
          notes: "Use selectively for grid, transmission, port, LNG, and project milestone confirmation."
        },
        {
          name: "Weather signals",
          reliability: "stable",
          ingestionRole: "limited_supporting_candidate",
          notes: "Use as context for demand, outage, hydro, heat, storm, and reliability pressure."
        },
        {
          name: "Inflation reports",
          reliability: "stable",
          ingestionRole: "limited_supporting_candidate",
          notes: "Use as secondary confirmation for fuel, electricity, transport, and household cost transmission."
        },
        {
          name: "Port and logistics updates",
          reliability: "limited_access",
          ingestionRole: "limited_supporting_candidate",
          notes: "Use only when shipping, import timing, fuel delivery, or logistics constraints affect local energy supply or prices."
        }
      ]
    }
  ]
};
