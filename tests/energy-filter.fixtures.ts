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
  },
  {
    name: "local infrastructure bottleneck affecting fuel delivery",
    story: story(
      "port-congestion-fuel-delivery",
      "Port logistics bottleneck delays fuel supply delivery to island power plants",
      "The congestion affects import timing and local reliability for plants dependent on shipped fuel."
    ),
    expected: {
      kept: true,
      primaryCategory: "infrastructure",
      systemPressure: true,
      reason: "kept because local logistics bottleneck affects delivery capability and reliability",
      reasonRuleId: "signals_system_stress_or_easing"
    }
  },
  {
    name: "global price move with weak local transmission",
    story: story(
      "weak-global-price-transmission",
      "Global oil price rises as Brent market tightens",
      "No Philippine pump price, tariff, pass-through, or local supply effect was cited."
    ),
    expected: {
      kept: true,
      primaryCategory: "price",
      systemPressure: false,
      reason: "kept as a weak price signal because oil price movement is present but local transmission is not confirmed",
      reasonRuleId: "affects_pricing_or_cost_transmission"
    }
  },
  {
    name: "policy announcement with no clear execution impact",
    story: story(
      "policy-no-execution",
      "Government energy office announces clean energy future awareness campaign",
      "The statement focused on public messaging and gave no measurable implementation details."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded because campaign-style policy language lacks execution or system impact",
      reasonRuleId: "esg_or_sustainability_pr"
    }
  },
  {
    name: "mixed demand and supply heatwave outage story",
    story: story(
      "heatwave-outage-demand-supply",
      "Heatwave pushes peak demand as forced outage cuts generation capacity",
      "Available supply tightened as power consumption rose and reserve margin fell."
    ),
    expected: {
      kept: true,
      primaryCategory: "supply",
      systemPressure: true,
      reason: "kept as supply-led stress despite demand pressure also being present",
      reasonRuleId: "affects_supply_availability"
    }
  },
  {
    name: "heavy keyword overlap across categories",
    story: story(
      "overlap-tariff-grid-fuel-policy",
      "ERC tariff ruling follows DOE directive after grid congestion and LNG fuel supply disruption",
      "The recovery mechanism affects electricity rate pass-through while transmission constraints and import disruption remain unresolved."
    ),
    expected: {
      kept: true,
      primaryCategory: "policy",
      systemPressure: true,
      reason: "kept with one primary category from heavier policy evidence despite broad overlap",
      reasonRuleId: "reflects_policy_intervention"
    }
  },
  {
    name: "fuel VAT policy does not default to supply",
    story: story(
      "fuel-vat-policy",
      "Senator proposes removing VAT on fuel products",
      "The tax measure would change cost allocation for motorists but cites no physical availability change."
    ),
    expected: {
      kept: true,
      primaryCategory: "policy",
      systemPressure: false,
      reason: "kept as policy intervention rather than physical supply",
      reasonRuleId: "reflects_policy_intervention"
    }
  },
  {
    name: "Meralco generation cost rate increase",
    story: story(
      "meralco-generation-cost-rate-increase",
      "Meralco raises rates on higher generation costs",
      "The electricity rate increase reflects generation cost pass-through to consumers."
    ),
    expected: {
      kept: true,
      primaryCategory: "price",
      systemPressure: false,
      reason: "kept by price movement and cost transmission language",
      reasonRuleId: "affects_pricing_or_cost_transmission"
    }
  },
  {
    name: "diesel gasoline pump price movement",
    story: story(
      "diesel-gasoline-pump-price-cut",
      "Diesel price cut seen as gasoline rollback takes effect",
      "The pump price movement eases fuel costs for local consumers."
    ),
    expected: {
      kept: true,
      primaryCategory: "price",
      systemPressure: true,
      reason: "kept by pump-price movement and system_pressure easing language",
      reasonRuleId: "affects_pricing_or_cost_transmission"
    }
  },
  {
    name: "Agus Pulangi rehabilitation project",
    story: story(
      "agus-pulangi-rehabilitation",
      "PSALM enters talks for Agus-Pulangi rehabilitation",
      "The rehabilitation aims to improve hydropower reliability and restore generation capacity."
    ),
    expected: {
      kept: true,
      primaryCategory: "infrastructure",
      systemPressure: false,
      reason: "kept because rehabilitation affects execution and reliability",
      reasonRuleId: "affects_grid_or_infrastructure_reliability"
    }
  },
  {
    name: "EPC solar power plant execution",
    story: story(
      "epc-solar-power-plant",
      "Renewables firm seals EPC deal for solar power plant",
      "The contract covers commissioning and commercial operations for new capacity."
    ),
    expected: {
      kept: true,
      primaryCategory: "infrastructure",
      systemPressure: false,
      reason: "kept because EPC execution changes project delivery timing",
      reasonRuleId: "affects_grid_or_infrastructure_reliability"
    }
  },
  {
    name: "administrative DOE meeting logistics",
    story: story(
      "doe-meeting-logistics",
      "DOE rules out travel for ASEAN energy meetings",
      "The agency shifted attendance to virtual meetings to reduce travel costs, with no operational market decision."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded because meeting logistics do not change the Energy system",
      reasonRuleId: "administrative_government_logistics"
    }
  },
  {
    name: "generic subsidies and tax incentives",
    story: story(
      "generic-subsidies-tax-incentives",
      "Subsidies and tax incentives proposed to boost employment",
      "The proposal covers broad employer support and does not identify a direct utility charge or household cost allocation."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded because fiscal policy lacks direct Energy burden shifting",
      reasonRuleId: "no_energy_inclusion_match"
    }
  },
  {
    name: "valid fuel subsidy burden shifting",
    story: story(
      "fuel-subsidy-burden-shifting",
      "Fuel subsidy proposed as diesel prices rise",
      "The subsidy would shift energy cost burden from transport consumers after pump price increases."
    ),
    expected: {
      kept: true,
      primaryCategory: "policy",
      systemPressure: false,
      reason: "kept because the subsidy directly affects fuel cost burden",
      reasonRuleId: "reflects_policy_intervention"
    }
  },
  {
    name: "financial market rates excluded",
    story: story(
      "financial-market-rates",
      "T-bill rates ease across all tenors",
      "Treasury yields fell as investors monitored US-Iran talks."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded because financial rates are not Energy price transmission",
      reasonRuleId: "no_energy_inclusion_match"
    }
  },
  {
    name: "non energy commodity imports excluded",
    story: story(
      "abaca-imports",
      "Abaca users forced to import as producers untangle supply chain",
      "The fiber industry faces commodity supply chain issues and imports from Ecuador."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded because imports do not affect Energy supply availability",
      reasonRuleId: "no_energy_inclusion_match"
    }
  },
  {
    name: "valid fuel import availability",
    story: story(
      "fuel-import-availability",
      "LNG supply imports delayed, tightening fuel availability for power plants",
      "The import disruption affects generation fuel and reserve margin planning."
    ),
    expected: {
      kept: true,
      primaryCategory: "supply",
      systemPressure: true,
      reason: "kept because imports affect physical Energy availability",
      reasonRuleId: "affects_supply_availability"
    }
  },
  {
    name: "valid electricity rates",
    story: story(
      "valid-electricity-rates",
      "Electricity rates rise on higher generation costs",
      "Generation cost pass-through lifted the retail power rate."
    ),
    expected: {
      kept: true,
      primaryCategory: "price",
      systemPressure: false,
      reason: "kept because electricity rates reflect Energy cost transmission",
      reasonRuleId: "affects_pricing_or_cost_transmission"
    }
  },
  {
    name: "valid plural fuel prices",
    story: story(
      "plural-fuel-prices",
      "Oil price watch: Fuel prices down by as much as P23 per liter",
      "Local pump prices moved lower for gasoline and diesel."
    ),
    expected: {
      kept: true,
      primaryCategory: "price",
      systemPressure: false,
      reason: "kept because plural fuel prices are Energy price movement",
      reasonRuleId: "affects_pricing_or_cost_transmission"
    }
  },
  {
    name: "fuel price monitoring without movement excluded",
    story: story(
      "fuel-price-monitoring",
      "PCC expands monitoring of fuel prices",
      "The agency said it will monitor industries dependent on fuel inputs."
    ),
    expected: {
      kept: false,
      systemPressure: false,
      reason: "excluded because monitoring fuel prices does not state movement or cost transmission",
      reasonRuleId: "no_energy_inclusion_match"
    }
  }
];
