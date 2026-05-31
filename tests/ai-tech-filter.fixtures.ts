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
      primaryAxis: "labor_workflow_impact",
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
      reasonRuleId: "affects_ph_sea_ai_policy_or_regulation"
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
      primaryAxis: "labor_workflow_impact",
      reasonRuleId: "impacts_local_workforce_or_business_workflows"
    }
  }
];
