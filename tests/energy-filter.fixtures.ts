import type { EnergySystemAxis, NormalizedStory } from "../lib/types.js";

export type EnergyFilterExpected = {
  kept: boolean;
  primaryCategory?: EnergySystemAxis;
  systemPressure: boolean;
  reason: string;
  reasonRuleId: string;
};

export type EnergyFilterFixture = {
  name: string;
  story: NormalizedStory;
  expected: EnergyFilterExpected;
};

function story(
  id: string,
  title: string,
  summary = ""
): NormalizedStory {
  return {
    id,
    source: "Energy Fixture",
    beat: "ph_sea_energy",
    title,
    url: `https://example.com/${id}`,
    date: "2026-04-12",
    publishedAt: "2026-04-12T00:00:00.000Z",
    summary,
    tags: [],
    reason_kept: [],
    fetchedAt: "2026-04-12T00:00:00.000Z"
  };
}

export const energyFilterFixtures: EnergyFilterFixture[] = [
  {
    name: "peak demand seasonal demand story",
    story: story(
      "peak-demand",
      "Peak demand rises as heat pushes Luzon load near available supply",
      "Industrial load and commercial load lifted power consumption during the seasonal demand spike."
    ),
    expected: {
      kept: true,
      primaryCategory: "demand",
      systemPressure: false,
      reason: "kept by demand pressure rule",
      reasonRuleId: "affects_demand_pressure"
    }
  },
  {
    name: "red alert grid story",
    story: story(
      "red-alert",
      "NGCP places Luzon grid on red alert as transmission bottleneck cuts reserve margin",
      "The grid warning points to reliability pressure across the power system."
    ),
    expected: {
      kept: true,
      primaryCategory: "infrastructure",
      systemPressure: true,
      reason: "kept by grid reliability and system pressure rules",
      reasonRuleId: "signals_system_stress_or_easing"
    }
  },
  {
    name: "forced outage supply story",
    story: story(
      "forced-outage",
      "Forced outage cuts generation capacity and lowers reserve margin",
      "Maintenance at a major plant tightened available supply."
    ),
    expected: {
      kept: true,
      primaryCategory: "supply",
      systemPressure: true,
      reason: "kept by supply availability and system pressure rules",
      reasonRuleId: "affects_supply_availability"
    }
  },
  {
    name: "tariff recovery mechanism policy story",
    story: story(
      "tariff-recovery",
      "ERC ruling approves recovery mechanism for generation charge tariff",
      "The decision changes how electricity rate costs are passed through to consumers."
    ),
    expected: {
      kept: true,
      primaryCategory: "price",
      systemPressure: false,
      reason: "kept by pricing and policy intervention rules",
      reasonRuleId: "affects_pricing_or_cost_transmission"
    }
  },
  {
    name: "fuel price oil transmission story",
    story: story(
      "fuel-price",
      "Oil price increase lifts pump price and generation charge outlook",
      "Higher fuel costs are moving through electricity rate expectations."
    ),
    expected: {
      kept: true,
      primaryCategory: "price",
      systemPressure: false,
      reason: "kept by cost transmission rule",
      reasonRuleId: "affects_pricing_or_cost_transmission"
    }
  },
  {
    name: "import disruption logistics bottleneck story",
    story: story(
      "import-disruption",
      "Coal import disruption and shipping logistics bottleneck pressure regional supply",
      "The logistics issue could transmit into Philippine fuel supply timing."
    ),
    expected: {
      kept: true,
      primaryCategory: "external_forces",
      systemPressure: true,
      reason: "kept by external pressure and system pressure rules",
      reasonRuleId: "external_pressure_impacts_local_system"
    }
  },
  {
    name: "sustainability campaign story",
    story: story(
      "sustainability-campaign",
      "Power firm launches green sustainability campaign",
      "The campaign promotes ESG goals and a clean energy future."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded as ESG or sustainability PR without system impact",
      reasonRuleId: "esg_or_sustainability_pr"
    }
  },
  {
    name: "ceremonial minor project story",
    story: story(
      "ceremonial-project",
      "Utility inaugurates ceremonial minor solar project",
      "Executives attended the groundbreaking for a rooftop solar installation with no scale or timing disclosed."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded as ceremonial or minor project without material system effect",
      reasonRuleId: "minor_or_ceremonial_project"
    }
  },
  {
    name: "material supply agreement story",
    story: story(
      "material-supply-agreement",
      "Power firm signs 600 MW supply agreement to add capacity by June",
      "The contract includes a grid connection timeline and contracted capacity for commercial operations."
    ),
    expected: {
      kept: true,
      primaryCategory: "supply",
      systemPressure: false,
      reason: "kept because material supply agreement overrides announcement exclusion",
      reasonRuleId: "non_system_announcement"
    }
  },
  {
    name: "ambiguous mixed category story",
    story: story(
      "mixed-policy-price-grid",
      "DOE directive targets price control after yellow alert and fuel supply disruption",
      "The policy move affects tariff recovery while the grid remains under reliability pressure."
    ),
    expected: {
      kept: true,
      primaryCategory: "policy",
      systemPressure: true,
      reason: "kept with one primary category despite policy, price, infrastructure, supply, and system pressure matches",
      reasonRuleId: "signals_system_stress_or_easing"
    }
  }
];
