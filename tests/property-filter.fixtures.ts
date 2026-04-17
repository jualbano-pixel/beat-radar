import type { NormalizedStory, PropertySystemAxis } from "../lib/types.js";

export type PropertyFilterExpected = {
  kept: boolean;
  primaryAxis?: PropertySystemAxis;
  editorialBucket?: string;
  stressSignal: boolean;
  reasonRuleId: string;
};

export type PropertyFilterFixture = {
  name: string;
  story: NormalizedStory;
  expected: PropertyFilterExpected;
};

function story(
  id: string,
  title: string,
  summary = "",
  source = "BusinessWorld Property"
): NormalizedStory {
  return {
    id,
    source,
    beat: "property_real_estate",
    title,
    url: `https://example.com/${id}`,
    date: "2026-04-16",
    publishedAt: "2026-04-16T00:00:00.000Z",
    summary,
    tags: [],
    reason_kept: [],
    fetchedAt: "2026-04-16T00:00:00.000Z"
  };
}

export const propertyFilterFixtures: PropertyFilterFixture[] = [
  {
    name: "vacancy and weaker office demand become core stress signal",
    story: story(
      "office-vacancy",
      "Metro Manila office vacancy rises as weaker demand slows leasing",
      "The Philippine office market is seeing slower take-up and rental pressure as tenants reassess space needs."
    ),
    expected: {
      kept: true,
      primaryAxis: "stress_signals",
      editorialBucket: "core_signal",
      stressSignal: true,
      reasonRuleId: "signals_property_stress_or_market_friction"
    }
  },
  {
    name: "affordability pressure is core demand movement",
    story: story(
      "affordability",
      "Condo prices outpace household purchasing power in Metro Manila",
      "Affordability pressure and higher mortgage rates are changing end-user demand in the Philippines."
    ),
    expected: {
      kept: true,
      primaryAxis: "stress_signals",
      editorialBucket: "core_signal",
      stressSignal: true,
      reasonRuleId: "signals_property_stress_or_market_friction"
    }
  },
  {
    name: "developer amenity launch without evidence is excluded",
    story: story(
      "luxury-launch",
      "Developer launches luxury condo with world-class amenities",
      "The grand launch highlights curated lifestyle spaces, exclusive community features, and award-winning design."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "developer_pr_without_market_evidence"
    }
  },
  {
    name: "developer expansion with scale and capital evidence survives",
    story: story(
      "scaled-expansion",
      "Developer expands Cavite township with 70-hectare project and new funding",
      "The Philippine developer said the expansion shifts capital allocation toward Luzon and adds residential inventory at meaningful scale."
    ),
    expected: {
      kept: true,
      primaryAxis: "supply_development",
      editorialBucket: "core_signal",
      stressSignal: false,
      reasonRuleId: "changes_supply_pipeline_or_inventory"
    }
  },
  {
    name: "generic global property commentary is not core",
    story: story(
      "global-commentary",
      "Global property investors debate whether offices are recovering",
      "The commentary points to a broad trend in office demand but does not show local transmission.",
      "Global Property Wire"
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "mortgage product context routes to capability watch",
    story: story(
      "mortgage-tool",
      "Bank rolls out digital mortgage tool as housing loan demand shifts",
      "The Philippine financing product may change how buyers compare housing loans, but the story is mainly enabling context."
    ),
    expected: {
      kept: true,
      primaryAxis: "capital_flows",
      editorialBucket: "capability_watch",
      stressSignal: false,
      reasonRuleId: "moves_property_capital_or_financing"
    }
  },
  {
    name: "luxury price launch is downgraded out of core",
    story: story(
      "luxury-priced-launch",
      "Developer launches luxury condo with units starting at P50 million",
      "The project highlights amenities and lifestyle positioning but gives no take-up, occupancy, or affordability impact."
    ),
    expected: {
      kept: true,
      editorialBucket: "interpretation",
      stressSignal: false,
      reasonRuleId: "changes_supply_pipeline_or_inventory"
    }
  },
  {
    name: "generic developer expansion without market evidence is excluded",
    story: story(
      "generic-expansion",
      "Developer expands premium township lifestyle brand",
      "The expansion highlights luxury amenities, awards, and a vibrant community."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "developer_pr_without_market_evidence"
    }
  },
  {
    name: "unsold inventory affordability mismatch is core stress",
    story: story(
      "unsold-affordability",
      "Unsold condo inventory rises as prices mismatch household purchasing power",
      "Metro Manila buyers are delaying purchases as affordability pressure and weaker demand slow absorption."
    ),
    expected: {
      kept: true,
      primaryAxis: "stress_signals",
      editorialBucket: "core_signal",
      stressSignal: true,
      reasonRuleId: "signals_property_stress_or_market_friction"
    }
  },
  {
    name: "soft market pressure reading routes to interpretation",
    story: story(
      "soft-pressure-read",
      "What slower leasing suggests for Philippine office demand",
      "The analysis points to uneven market pressure and second-order implications for landlords."
    ),
    expected: {
      kept: true,
      editorialBucket: "interpretation",
      stressSignal: false,
      reasonRuleId: "shows_usage_occupancy_or_leasing_shift"
    }
  },
  {
    name: "generic property app is not capability watch without capital relevance",
    story: story(
      "generic-property-app",
      "Startup launches property search app for condo listings",
      "The platform helps users browse homes and listings."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "developer_pr_without_market_evidence"
    }
  },
  {
    name: "developer earnings without market evidence are dropped",
    story: story(
      "century-earnings-claim",
      "Century profit rises on strong demand and continued growth",
      "The developer reported higher revenue and net income, citing sustained demand for its projects."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "developer earnings with occupancy evidence stay interpretation",
    story: story(
      "rockwell-earnings-occupancy",
      "Rockwell profit grows as office occupancy improves",
      "The developer reported higher net income and said occupancy in its Philippine office portfolio rose to 94%."
    ),
    expected: {
      kept: true,
      primaryAxis: "usage_patterns",
      editorialBucket: "interpretation",
      stressSignal: false,
      reasonRuleId: "shows_usage_occupancy_or_leasing_shift"
    }
  },
  {
    name: "corporate demand claim alone is not evidence",
    story: story(
      "resilient-demand-claim",
      "Developer sees resilient demand for premium residential projects",
      "The company said demand remains strong and revenue growth should continue this year."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "bsp price slowdown is core market truth",
    story: story(
      "bsp-price-slowdown",
      "BSP property price index growth slows as condo prices soften",
      "The residential real estate price index showed slower Philippine price movement, pointing to weaker housing demand.",
      "Bangko Sentral ng Pilipinas Property"
    ),
    expected: {
      kept: true,
      primaryAxis: "demand_affordability",
      editorialBucket: "core_signal",
      stressSignal: true,
      reasonRuleId: "shows_affordability_or_demand_pressure"
    }
  },
  {
    name: "bsp housing credit policy is core property financing signal",
    story: story(
      "bsp-green-home-financing",
      "BSP eyes lower capital charge to boost green home financing",
      "The Bangko Sentral said lower capital requirements could support green housing lending and improve mortgage access for home buyers.",
      "Bangko Sentral ng Pilipinas Property"
    ),
    expected: {
      kept: true,
      primaryAxis: "capital_flows",
      editorialBucket: "core_signal",
      stressSignal: false,
      reasonRuleId: "links_housing_credit_policy_to_property_financing"
    }
  },
  {
    name: "generic bank capital policy without property linkage is excluded",
    story: story(
      "generic-bank-capital-policy",
      "BSP studies lower capital charge to boost bank lending",
      "The regulator said the policy may support credit growth and financing for businesses.",
      "Bangko Sentral ng Pilipinas Property"
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "non-property project financing is excluded",
    story: story(
      "solar-project-financing",
      "Vena Group secures P2.7 billion to build new Ilocos Norte solar farm",
      "The renewable energy developer reached financial close for a solar power project and expanded its green energy portfolio.",
      "Manila Bulletin Business Property"
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "hotel energy-cost outlook is excluded without property usage evidence",
    story: story(
      "hotel-energy-outlook",
      "Energy costs weigh on hotel outlook — LPC",
      "Hotel operators in the Philippines are facing pressure from rising costs and weakening demand as airfares and flights dampen hotel demand.",
      "BusinessWorld Property"
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "hotel story survives with occupancy and room-rate evidence",
    story: story(
      "hotel-occupancy-rates",
      "Hotel occupancy and room rates weaken as travel demand slows",
      "Philippine hotel occupancy rates and average daily room rates declined, signaling weaker property utilization.",
      "BusinessWorld Property"
    ),
    expected: {
      kept: true,
      primaryAxis: "stress_signals",
      editorialBucket: "core_signal",
      stressSignal: true,
      reasonRuleId: "signals_property_stress_or_market_friction"
    }
  },
  {
    name: "broad market report title is interpretation unless it carries a discrete move",
    story: story(
      "broad-volatility-report",
      "Opportunities amid Volatility",
      "The Philippine property market faced high office vacancy rates, an oversupply of mid-market condos, and uneven demand across sectors.",
      "Santos Knight Frank Market Reports"
    ),
    expected: {
      kept: true,
      primaryAxis: "stress_signals",
      editorialBucket: "interpretation",
      stressSignal: true,
      reasonRuleId: "signals_property_stress_or_market_friction"
    }
  },
  {
    name: "adjacent arena activity is excluded without property usage evidence",
    story: story(
      "arena-events",
      "Arena events business lifts property company revenue",
      "Concerts and ticket sales improved operating activity, while the company cited steady demand."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "logistics demand needs leasing or utilization evidence",
    story: story(
      "generic-logistics-demand",
      "Logistics demand boosts developer outlook",
      "The company said SME demand and logistics activity remain robust across its businesses."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "facility operations story is excluded without property usage evidence",
    story: story(
      "facility-operations",
      "Company expands facility operations to serve stronger customer demand",
      "The Philippine business said its operations and facilities handled more activity."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "developer_pr_without_market_evidence"
    }
  },
  {
    name: "energy supply to manufacturing facility is excluded before supply rules",
    story: story(
      "corenergy-cebu-manufacturer",
      "COREnergy powers Cebu manufacturer with electricity supply deal",
      "The company supplies power to a manufacturing facility and supports industrial operations at the Cebu plant."
    ),
    expected: {
      kept: false,
      stressSignal: false,
      reasonRuleId: "no_property_inclusion_match"
    }
  },
  {
    name: "facility story survives when tied to industrial leasing",
    story: story(
      "facility-industrial-leasing",
      "Warehouse facility expansion lifts industrial real estate leasing",
      "The Philippine facility expansion increased warehouse occupancy and leasing demand in an industrial real estate park."
    ),
    expected: {
      kept: true,
      primaryAxis: "usage_patterns",
      editorialBucket: "core_signal",
      stressSignal: false,
      reasonRuleId: "shows_usage_occupancy_or_leasing_shift"
    }
  }
];
