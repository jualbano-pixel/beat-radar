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
    displayName: "Technology / Digital Economy",
    timeModeEnvVar: "AI_TECH_TIME_MODE",
    structure: {
      system_axes: [
        "ai_automation",
        "enterprise_technology",
        "telecom_connectivity",
        "cybersecurity",
        "digital_policy_regulation",
        "data_centers_infrastructure",
        "startups_vc",
        "consumer_technology"
      ],
      inclusion_requirement:
        "Include only Technology / Digital Economy stories that change how people, businesses, or governments use technology through adoption, infrastructure, connectivity, cybersecurity, regulation, investment, or material consumer behavior.",
      geographic_lens:
        "Boost Philippine signals strongly, boost Southeast Asian signals moderately, and allow global signals only when they affect real usage, pricing, access, security, infrastructure, regulation, or deployment.",
      global_gate:
        "Global technology stories must have downstream relevance; generic product launches, hype, benchmark-only updates, and vendor news without practical impact are excluded.",
      house_question:
        "Does this change how people, businesses, or governments use technology?"
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
