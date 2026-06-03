import type { AiTechSystemAxis, NormalizedStory } from "../lib/types.js";

type AiTechFilterFixture = {
  name: string;
  story: NormalizedStory;
  expected: {
    kept: boolean;
    primaryAxis?: AiTechSystemAxis;
    reasonRuleId: string;
  };
};

function story(
  title: string,
  summary: string,
  source = "Department of Trade and Industry AI Economy"
): NormalizedStory {
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    source,
    beat: "ai_tech",
    title,
    url: `https://example.com/${encodeURIComponent(title)}`,
    date: "2026-05-28T00:00:00.000Z",
    publishedAt: "2026-05-28T00:00:00.000Z",
    summary,
    tags: [],
    reason_kept: [],
    fetchedAt: "2026-05-28T00:00:00.000Z"
  };
}

export const aiTechFilterFixtures: AiTechFilterFixture[] = [
  {
    name: "trusted source soft AI-economic transition passes",
    story: story(
      "DTI advances digital economy roadmap for MSME adoption",
      "The roadmap sets implementation targets for data governance, skills programs, and digital infrastructure investment."
    ),
    expected: {
      kept: true,
      primaryAxis: "digital_policy_regulation",
      reasonRuleId: "trusted_source_policy_economic_transition"
    }
  },
  {
    name: "trusted source low-materiality rhetoric stays out",
    story: story(
      "DICT speech highlights AI innovation",
      "The agency promoted digital transformation during a forum and urged stakeholders to support innovation.",
      "Department of Information and Communications Technology AI Policy"
    ),
    expected: {
      kept: false,
      reasonRuleId: "affects_digital_policy_or_regulation"
    }
  },
  {
    name: "generic source soft digitalization language stays out",
    story: story(
      "Leaders promote digital transformation at business forum",
      "Officials discussed trusted technology and workforce transition but announced no deployment, budget, or named framework.",
      "BusinessWorld AI/Tech"
    ),
    expected: {
      kept: false,
      reasonRuleId: "no_ai_or_no_downstream_relevance"
    }
  },
  {
    name: "philippine BPO AI workflow transition passes as labor impact",
    story: story(
      "BPO operators redesign contact-center workflows around agentic AI",
      "Philippine IT-BPM firms are using automation and productivity systems to shift customer service roles and reskill workers.",
      "IBPAP IT-BPM AI Transition"
    ),
    expected: {
      kept: true,
      primaryAxis: "ai_automation",
      reasonRuleId: "changes_ai_automation_or_workflows"
    }
  },
  {
    name: "telecom expansion passes as connectivity signal",
    story: story(
      "Globe expands 5G broadband coverage across Visayas business districts",
      "The network expansion adds fiber backhaul and 5G sites to improve connectivity for enterprises, public services, and households.",
      "BusinessWorld AI/Tech"
    ),
    expected: {
      kept: true,
      primaryAxis: "telecom_connectivity",
      reasonRuleId: "expands_telecom_or_connectivity_access"
    }
  },
  {
    name: "cybersecurity breach passes as resilience signal",
    story: story(
      "Major Philippine retailer discloses data breach after ransomware attack",
      "The security incident exposed customer records and forced new cybersecurity controls, data privacy reporting, and business continuity measures.",
      "Inquirer Tech"
    ),
    expected: {
      kept: true,
      primaryAxis: "cybersecurity",
      reasonRuleId: "shows_cybersecurity_incident_or_resilience_shift"
    }
  },
  {
    name: "cloud erp deployment passes as enterprise technology",
    story: story(
      "Manufacturer rolls out cloud ERP across Philippine plants",
      "The enterprise software deployment changes procurement, inventory, and finance operations as the company completes a cloud migration.",
      "BusinessWorld AI/Tech"
    ),
    expected: {
      kept: true,
      primaryAxis: "enterprise_technology",
      reasonRuleId: "shows_enterprise_technology_adoption_or_deployment"
    }
  },
  {
    name: "data center buildout passes as infrastructure",
    story: story(
      "New Luzon data center campus secures power for cloud capacity expansion",
      "The data center investment adds compute capacity, cloud region resilience, and power requirements for enterprise and government workloads.",
      "Philippine Economic Zone Authority Digital Infrastructure"
    ),
    expected: {
      kept: true,
      primaryAxis: "data_centers_infrastructure",
      reasonRuleId: "changes_data_center_cloud_or_compute_capacity"
    }
  },
  {
    name: "startup funding passes only with ecosystem impact",
    story: story(
      "Fintech startup raises Series A to expand digital payments for MSMEs",
      "The funding round will support merchant adoption, new enterprise customers, and Southeast Asia ecosystem expansion.",
      "e27 SEA Tech"
    ),
    expected: {
      kept: true,
      primaryAxis: "startups_vc",
      reasonRuleId: "signals_startup_vc_or_technology_investment"
    }
  },
  {
    name: "routine gadget launch without market shift stays out",
    story: story(
      "Brand X launches new smartphone with brighter screen",
      "The device is now available with minor camera updates but no pricing, market share, adoption, or ecosystem impact.",
      "Inquirer Tech"
    ),
    expected: {
      kept: false,
      reasonRuleId: "routine_gadget_launch_without_market_shift"
    }
  },
  {
    name: "consumer device story passes when market behavior shifts",
    story: story(
      "Budget smartphones gain market share as Filipino buyers delay upgrades",
      "New shipment data shows consumer behavior shifting toward lower-cost devices, changing market share and mobile payments adoption.",
      "Inquirer Tech"
    ),
    expected: {
      kept: true,
      primaryAxis: "consumer_technology",
      reasonRuleId: "changes_consumer_technology_behavior_or_market_structure"
    }
  },
  {
    name: "benchmark only model update stays out",
    story: story(
      "OpenAI releases minor model update with higher benchmark score",
      "The update improves evaluation results but shows no deployment, pricing, customer, security, infrastructure, or policy impact.",
      "OpenAI Blog"
    ),
    expected: {
      kept: false,
      reasonRuleId: "benchmark_or_minor_model_update_without_impact"
    }
  }
];
