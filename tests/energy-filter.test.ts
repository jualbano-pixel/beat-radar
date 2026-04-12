import assert from "node:assert/strict";

import { evaluateEnergyRelevance } from "../lib/energy-filter.js";
import { energyFilterFixtures } from "./energy-filter.fixtures.js";

for (const fixture of energyFilterFixtures) {
  const result = evaluateEnergyRelevance(fixture.story);
  const { classification } = result;

  assert.equal(
    result.kept,
    fixture.expected.kept,
    `${fixture.name}: kept/excluded mismatch`
  );
  assert.equal(
    classification.primaryCategory,
    fixture.expected.primaryCategory,
    `${fixture.name}: primary category mismatch`
  );
  assert.equal(
    classification.systemPressure,
    fixture.expected.systemPressure,
    `${fixture.name}: system_pressure mismatch`
  );

  const inclusionRuleIds = classification.inclusionMatches.map((match) => match.id);
  const exclusionRuleIds = classification.exclusionMatches.map((match) => match.id);
  const overriddenRuleIds = classification.overriddenExclusionMatches.map((match) => match.id);
  const actualReasonRuleIds = result.kept
    ? [...inclusionRuleIds, ...overriddenRuleIds]
    : exclusionRuleIds;

  assert.ok(
    actualReasonRuleIds.includes(fixture.expected.reasonRuleId),
    `${fixture.name}: expected reason rule ${fixture.expected.reasonRuleId}, got ${actualReasonRuleIds.join(", ")}`
  );
}

console.log(`Energy filter fixtures passed: ${energyFilterFixtures.length}`);
