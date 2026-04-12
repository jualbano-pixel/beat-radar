import type { EnergySystemAxis } from "../lib/types.js";

export type EnergyInterpretation =
  | "tightening"
  | "expanding"
  | "fragile"
  | "rising"
  | "stable"
  | "spiking"
  | "softening"
  | "easing"
  | "sticky"
  | "price_signal_distorted"
  | "stabilizing"
  | "market_distorting"
  | "cost_shifting"
  | "improving"
  | "lagging"
  | "bottlenecked"
  | "pressure_increasing"
  | "pressure_easing"
  | "transmitting_locally";

export type EnergySignalCategoryDefinition = {
  category: EnergySystemAxis;
  tracks: string;
  includes: string[];
  interpretations: EnergyInterpretation[];
};

export type EnergyInclusionRule = {
  id: string;
  category: EnergySystemAxis | "system_pressure";
  includeIf: string;
  signalKeywords: string[];
};

export type EnergyExclusionRule = {
  id: string;
  excludeIf: string;
  hardFilter: boolean;
  signalKeywords: string[];
  allowIfSystemImpact: boolean;
  materialityOverride?: string;
};

export type EnergyImportanceTier = {
  tier: "high" | "medium" | "low_auto_exclude";
  definition: string;
  signals: string[];
};

export type EnergyOutputSection = {
  id: "editorial_read" | "themes" | "cluster_breakdown" | "signals_to_watch";
  label: string;
  requirement: string;
};

export type EnergyCriticalRule = {
  id: string;
  rule: string;
};

export const energyEditorialContract = {
  lens:
    "Track how supply, price, policy, demand, infrastructure, and external forces move across the Philippine and relevant Southeast Asian energy system.",
  systemReality: [
    "Energy flows through generation, transmission, distribution, and consumption.",
    "The grid connects supply to demand.",
    "Policy is shaped by the Department of Energy and regulated by the Energy Regulatory Commission.",
    "National Grid Corporation of the Philippines is core to grid state, alerts, and transmission constraints."
  ],
  primaryCategoryRule:
    "Each included story must have exactly one primary Energy signal category.",
  importanceRule:
    "A story is important only if it changes understanding of supply availability, demand pressure, price direction, infrastructure reliability, policy burden shifting, external exposure, or system pressure.",
  optimizationTarget:
    "Optimize for signal clarity and system movement detection, not volume, completeness, or coverage."
} as const;

export const energySignalCategories: EnergySignalCategoryDefinition[] = [
  {
    category: "supply",
    tracks: "Availability of energy in the system.",
    includes: [
      "generation capacity",
      "outages and maintenance",
      "fuel supply",
      "coal, LNG, and oil availability",
      "imports",
      "reserve margins",
      "contracts and supply agreements"
    ],
    interpretations: ["tightening", "expanding", "fragile"]
  },
  {
    category: "demand",
    tracks: "Load pressure on the system.",
    includes: [
      "peak demand",
      "seasonal spikes",
      "heat and holiday demand",
      "industrial load",
      "commercial load",
      "economic-linked demand growth"
    ],
    interpretations: ["rising", "stable", "spiking", "softening"]
  },
  {
    category: "price",
    tracks: "Cost movement and transmission through fuel, wholesale, generation, and retail prices.",
    includes: [
      "oil prices",
      "pump prices",
      "electricity rates",
      "WESM and spot market movement",
      "generation charges",
      "pass-through",
      "price lag"
    ],
    interpretations: ["rising", "easing", "sticky", "price_signal_distorted"]
  },
  {
    category: "policy",
    tracks: "Intervention in pricing, supply, market behavior, and cost allocation.",
    includes: [
      "subsidies",
      "tax changes",
      "tariffs",
      "ERC rulings",
      "DOE directives",
      "price controls",
      "recovery mechanisms"
    ],
    interpretations: ["stabilizing", "market_distorting", "cost_shifting"]
  },
  {
    category: "infrastructure",
    tracks: "System capability, reliability, and bottlenecks between supply and demand.",
    includes: [
      "transmission projects",
      "grid congestion",
      "interconnections",
      "project delays",
      "reliability issues",
      "brownouts",
      "red and yellow alerts"
    ],
    interpretations: ["improving", "lagging", "bottlenecked", "fragile"]
  },
  {
    category: "external_forces",
    tracks: "External drivers that may transmit into Philippine or Southeast Asian supply, cost, or reliability.",
    includes: [
      "global oil markets",
      "global LNG markets",
      "global coal markets",
      "geopolitics",
      "shipping and logistics",
      "ASEAN energy developments"
    ],
    interpretations: ["pressure_increasing", "pressure_easing", "transmitting_locally"]
  }
];

export const energyInclusionRules: EnergyInclusionRule[] = [
  {
    id: "affects_supply_availability",
    category: "supply",
    includeIf: "The story changes understanding of available generation, fuel, imports, reserve margins, outages, maintenance, or supply contracts.",
    signalKeywords: [
      "generation capacity",
      "outage",
      "maintenance",
      "fuel supply",
      "coal",
      "LNG",
      "oil",
      "imports",
      "reserve margin",
      "supply agreement"
    ]
  },
  {
    id: "affects_pricing_or_cost_transmission",
    category: "price",
    includeIf: "The story changes price direction or explains how costs move through fuel, wholesale power, generation charges, or retail rates.",
    signalKeywords: [
      "oil price",
      "pump price",
      "electricity rate",
      "WESM",
      "spot market",
      "generation charge",
      "tariff",
      "pass-through",
      "recovery"
    ]
  },
  {
    id: "affects_demand_pressure",
    category: "demand",
    includeIf: "The story changes understanding of peak demand, seasonal load spikes, industrial or commercial load, or demand pressure relative to available supply.",
    signalKeywords: [
      "peak demand",
      "peak load",
      "seasonal demand",
      "heat",
      "holiday demand",
      "industrial load",
      "commercial load",
      "power consumption",
      "electricity consumption",
      "demand growth",
      "available supply",
      "reserve margin"
    ]
  },
  {
    id: "affects_grid_or_infrastructure_reliability",
    category: "infrastructure",
    includeIf: "The story changes understanding of grid reliability, transmission capability, interconnection, congestion, brownouts, or alerts.",
    signalKeywords: [
      "transmission",
      "grid",
      "NGCP",
      "interconnection",
      "congestion",
      "brownout",
      "red alert",
      "yellow alert",
      "reliability"
    ]
  },
  {
    id: "reflects_policy_intervention",
    category: "policy",
    includeIf: "The story reflects DOE, ERC, or government action that changes supply, pricing, tariffs, subsidies, taxes, controls, or cost recovery.",
    signalKeywords: [
      "DOE",
      "ERC",
      "directive",
      "ruling",
      "subsidy",
      "tax",
      "tariff",
      "price control",
      "recovery mechanism"
    ]
  },
  {
    id: "signals_system_stress_or_easing",
    category: "system_pressure",
    includeIf: "The story indicates pressure building or easing anywhere in generation, transmission, distribution, consumption, cost, or reliability.",
    signalKeywords: [
      "red alert",
      "yellow alert",
      "major outage",
      "forced outage",
      "reserve margin",
      "fuel shock",
      "import disruption",
      "bottleneck",
      "rate hike",
      "rollback"
    ]
  },
  {
    id: "external_pressure_impacts_local_system",
    category: "external_forces",
    includeIf: "The story shows external commodity, geopolitical, logistics, or ASEAN pressure affecting Philippine supply, price, or reliability.",
    signalKeywords: [
      "Brent",
      "global oil",
      "LNG market",
      "coal market",
      "geopolitical",
      "shipping",
      "logistics",
      "ASEAN",
      "regional supply"
    ]
  }
];

export const energyExclusionRules: EnergyExclusionRule[] = [
  {
    id: "esg_or_sustainability_pr",
    excludeIf: "The story is ESG, sustainability, climate, or clean-energy narrative without measurable system impact.",
    hardFilter: true,
    signalKeywords: ["ESG", "sustainability", "green campaign", "net zero", "clean energy future"],
    allowIfSystemImpact: true,
    materialityOverride:
      "Keep if it includes measurable capacity, timing, grid connection, tariff effect, supply effect, or reliability consequence."
  },
  {
    id: "corporate_promotion",
    excludeIf: "The story is corporate promotion, branding, marketing, sponsorship, or reputation management.",
    hardFilter: true,
    signalKeywords: ["campaign", "brand", "sponsorship", "showcase", "publicity"],
    allowIfSystemImpact: true,
    materialityOverride:
      "Keep system-relevant partnerships, contracts, or projects when they materially affect supply, price, infrastructure, reliability, execution timing, or policy burden."
  },
  {
    id: "non_system_announcement",
    excludeIf: "The story announces company activity without measurable effect on supply, price, infrastructure, policy, external exposure, or system pressure.",
    hardFilter: true,
    signalKeywords: ["announces", "signs", "launches", "unveils", "plans"],
    allowIfSystemImpact: true,
    materialityOverride:
      "Keep if the announcement has concrete scale, timing, contract volume, capacity, outage, interconnection, fuel supply, tariff, or execution consequence."
  },
  {
    id: "awards_or_recognition",
    excludeIf: "The story is about awards, rankings, recognition, ceremonies, or executive visibility.",
    hardFilter: true,
    signalKeywords: ["award", "awards", "recognition", "ceremony", "honored"],
    allowIfSystemImpact: false,
    materialityOverride:
      "No override unless the award item also contains a separate concrete system action; the award itself is never the reason to include."
  },
  {
    id: "speculative_technology",
    excludeIf: "The story is speculative technology with no deployment relevance, scale, timing, or system effect.",
    hardFilter: true,
    signalKeywords: ["prototype", "future technology", "could transform", "pilot concept"],
    allowIfSystemImpact: true,
    materialityOverride:
      "Keep only if deployment scale, timing, grid integration, supply effect, or cost effect is concrete."
  },
  {
    id: "minor_or_ceremonial_project",
    excludeIf: "The story is a ceremonial launch or minor installation without scale, timing, grid, supply, or cost consequence.",
    hardFilter: true,
    signalKeywords: ["inaugurates", "groundbreaking", "minor solar", "rooftop solar", "ceremonial"],
    allowIfSystemImpact: true,
    materialityOverride:
      "Keep if the project has material capacity, location relevance, commissioning timing, transmission linkage, supply impact, or price/reliability consequence."
  }
];

export const energyImportanceTiers: EnergyImportanceTier[] = [
  {
    tier: "high",
    definition: "Changes understanding of system pressure, reliability, supply availability, demand pressure, price direction, policy burden shifting, or external exposure.",
    signals: [
      "grid alerts",
      "red or yellow alerts",
      "major outages",
      "tariff changes",
      "fuel shocks",
      "large capacity additions",
      "transmission bottlenecks",
      "subsidy or tax moves",
      "import disruptions"
    ]
  },
  {
    tier: "medium",
    definition: "Relevant if tied to system movement, direction, scale, timing, or confirmation.",
    signals: [
      "system-relevant project updates",
      "demand reports",
      "trend-linked fuel price movements",
      "system-relevant contract awards",
      "infrastructure timelines"
    ]
  },
  {
    tier: "low_auto_exclude",
    definition: "Exclude unless there is measurable supply, price, infrastructure, policy, external exposure, or system-pressure impact.",
    signals: [
      "ESG PR",
      "sustainability campaigns",
      "awards",
      "executive quotes with no action",
      "minor solar installs",
      "generic clean energy future stories",
      "corporate announcements without system impact"
    ]
  }
];

export const energyOutputSections: EnergyOutputSection[] = [
  {
    id: "editorial_read",
    label: "Editorial Read",
    requirement:
      "Two to three sentences describing system movement, not a summary of news volume."
  },
  {
    id: "themes",
    label: "Themes",
    requirement:
      "Maximum two to three high-confidence structural movements."
  },
  {
    id: "cluster_breakdown",
    label: "Cluster Breakdown",
    requirement:
      "Grouped stories that support the dominant themes; one cluster should support one dominant theme."
  },
  {
    id: "signals_to_watch",
    label: "Signals to Watch",
    requirement:
      "Lower-confidence or emerging developments that do not yet justify theme promotion."
  }
];

export const energyCriticalRules: EnergyCriticalRule[] = [
  {
    id: "no_duplication_across_themes",
    rule: "Each cluster has one dominant theme."
  },
  {
    id: "under_group_rather_than_over_group",
    rule: "Weak signals go to Signals to Watch."
  },
  {
    id: "no_single_story_themes_unless_critical",
    rule: "Single-story themes are allowed only for a major outage or major policy shift."
  },
  {
    id: "movement_over_event",
    rule: "Do not report events; interpret direction."
  }
];

export const energyToneRules = [
  "analytical",
  "system-level",
  "non-dramatic",
  "no ESG language",
  "no transition fluff",
  "no vague forecasting",
  "no hedging"
] as const;
