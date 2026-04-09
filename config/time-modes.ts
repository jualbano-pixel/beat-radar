export type AiTechTimeMode = "current" | "context";

export type TimeModeConfig = {
  daysBackOverride?: number | null;
  maxItemsMultiplier: number;
};

export const aiTechTimeModeConfig: Record<AiTechTimeMode, TimeModeConfig> = {
  current: {
    daysBackOverride: undefined,
    maxItemsMultiplier: 1
  },
  context: {
    daysBackOverride: 365,
    maxItemsMultiplier: 3
  }
};
