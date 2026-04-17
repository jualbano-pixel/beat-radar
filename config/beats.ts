import type {
  AiTechBeatStructure,
  Beat,
  EnergyBeatStructure,
  PropertyBeatStructure
} from "../lib/types.js";

export type BeatConfig = {
  beat: Beat;
  displayName: string;
  timeModeEnvVar: string;
  structure?: EnergyBeatStructure | AiTechBeatStructure | PropertyBeatStructure;
};

export const beatConfigs: Record<Beat, BeatConfig> = {
  ai_tech: {
    beat: "ai_tech",
    displayName: "AI / Tech",
    timeModeEnvVar: "AI_TECH_TIME_MODE",
    structure: {
      system_axes: [
        "models_platforms",
        "enterprise_adoption",
        "policy_regulation",
        "infrastructure_compute",
        "distribution_integration",
        "labor_workflow_impact"
      ],
      inclusion_requirement:
        "Include only AI/Tech stories that change understanding of Philippine or Southeast Asian AI policy, enterprise adoption, workflow impact, infrastructure access, distribution, or platform capability used in real workflows.",
      geographic_lens:
        "Boost Philippine signals strongly, boost Southeast Asian signals moderately, and allow global signals only when they affect real usage, pricing, access, or deployment.",
      global_gate:
        "Global AI stories must have downstream relevance; generic feature drops, hype, and platform news without practical impact are excluded."
    }
  },
  philippine_motoring: {
    beat: "philippine_motoring",
    displayName: "Philippine Motoring",
    timeModeEnvVar: "PHILIPPINE_MOTORING_TIME_MODE"
  },
  ph_sea_banking: {
    beat: "ph_sea_banking",
    displayName: "Philippine / SEA Banking",
    timeModeEnvVar: "PH_SEA_BANKING_TIME_MODE"
  },
  ph_sea_energy: {
    beat: "ph_sea_energy",
    displayName: "Philippine / SEA Energy",
    timeModeEnvVar: "PH_SEA_ENERGY_TIME_MODE",
    structure: {
      system_axes: [
        "supply",
        "demand",
        "price",
        "policy",
        "infrastructure",
        "external_forces"
      ],
      system_flow: ["generation", "transmission", "distribution", "consumption"],
      system_operators: [
        "Department of Energy",
        "Energy Regulatory Commission",
        "National Grid Corporation of the Philippines"
      ],
      mandatory_questions: ["supply", "price", "policy", "system_pressure"],
      inclusion_requirement:
        "Include only stories that change understanding of supply, demand pressure, price, policy, infrastructure, external exposure, or system pressure.",
      detects_system_pressure: true
    }
  },
  property_real_estate: {
    beat: "property_real_estate",
    displayName: "Property / Real Estate",
    timeModeEnvVar: "PROPERTY_REAL_ESTATE_TIME_MODE",
    structure: {
      system_axes: [
        "capital_flows",
        "supply_development",
        "demand_affordability",
        "policy_regulation",
        "usage_patterns",
        "stress_signals"
      ],
      inclusion_requirement:
        "Include only Property / Real Estate stories that show material Philippine market movement in capital, supply, demand, policy, usage, or stress; do not keep property stories merely because they are about development.",
      geographic_lens:
        "Strongly prefer Philippine ground truth, allow Southeast Asian context when it affects Philippine capital, demand, policy, or sector behavior, and treat generic global property commentary as non-core.",
      global_gate:
        "Global property stories must have clear Philippine transmission through rates, capital flows, institutional investment, or policy; generic market commentary is excluded or demoted."
    }
  }
};

export function resolveBeat(value?: string): Beat {
  if (
    value === "philippine_motoring" ||
    value === "ph_sea_banking" ||
    value === "ph_sea_energy" ||
    value === "property_real_estate"
  ) {
    return value;
  }

  return "ai_tech";
}
