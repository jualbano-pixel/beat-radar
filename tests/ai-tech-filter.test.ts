import assert from "node:assert/strict";

import { evaluateAiTechRelevance } from "../lib/ai-tech-filter.js";
import { aiTechFilterFixtures } from "./ai-tech-filter.fixtures.js";

for (const fixture of aiTechFilterFixtures) {
  const result = evaluateAiTechRelevance(fixture.story);
  const { classification } = result;

  assert.equal(
    result.kept,
    fixture.expected.kept,
    `${fixture.name}: kept/excluded mismatch`
  );

  if (fixture.expected.primaryAxis !== undefined) {
    assert.equal(
      classification.primaryAxis,
      fixture.expected.primaryAxis,
      `${fixture.name}: primary axis mismatch`
    );
  }

  const inclusionRuleIds = classification.inclusionMatches.map((match) => match.id);
  const exclusionRuleIds = classification.exclusionMatches.map((match) => match.id);
  const actualReasonRuleIds = result.kept
    ? inclusionRuleIds
    : classification.hardExcluded
      ? [...inclusionRuleIds, ...exclusionRuleIds, "no_ai_or_no_downstream_relevance"]
      : ["no_ai_or_no_downstream_relevance"];

  assert.ok(
    actualReasonRuleIds.includes(fixture.expected.reasonRuleId),
    `${fixture.name}: expected reason rule ${fixture.expected.reasonRuleId}, got ${actualReasonRuleIds.join(", ")}`
  );
}

console.log(`AI/Tech filter fixtures passed: ${aiTechFilterFixtures.length}`);
