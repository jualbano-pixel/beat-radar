import type { Beat, EnergyBeatStructure } from "../lib/types.js";

export type BeatConfig = {
  beat: Beat;
  displayName: string;
  timeModeEnvVar: string;
  structure?: EnergyBeatStructure;
};

export const beatConfigs: Record<Beat, BeatConfig> = {
  ai_tech: {
    beat: "ai_tech",
    displayName: "AI / Tech",
    timeModeEnvVar: "AI_TECH_TIME_MODE"
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
  }
};

export function resolveBeat(value?: string): Beat {
  if (value === "philippine_motoring" || value === "ph_sea_banking" || value === "ph_sea_energy") {
    return value;
  }

  return "ai_tech";
}
