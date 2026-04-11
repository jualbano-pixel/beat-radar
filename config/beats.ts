import type { Beat } from "../lib/types.js";

export type BeatConfig = {
  beat: Beat;
  displayName: string;
  timeModeEnvVar: string;
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
  }
};

export function resolveBeat(value?: string): Beat {
  if (value === "philippine_motoring" || value === "ph_sea_banking") {
    return value;
  }

  return "ai_tech";
}
