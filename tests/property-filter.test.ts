import assert from "node:assert/strict";

import { evaluatePropertyRelevance } from "../lib/property-filter.js";
import { propertyFilterFixtures } from "./property-filter.fixtures.js";

for (const fixture of propertyFilterFixtures) {
  const result = evaluatePropertyRelevance(fixture.story);
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
  if (fixture.expected.editorialBucket !== undefined) {
    assert.equal(
      classification.editorialBucket,
      fixture.expected.editorialBucket,
      `${fixture.name}: editorial bucket mismatch`
    );
  }
  assert.equal(
    classification.stressSignal,
    fixture.expected.stressSignal,
    `${fixture.name}: stress signal mismatch`
  );

  const inclusionRuleIds = classification.inclusionMatches.map((match) => match.id);
  const exclusionRuleIds = classification.exclusionMatches.map((match) => match.id);
  const actualReasonRuleIds = result.kept
    ? inclusionRuleIds
    : exclusionRuleIds.length > 0
      ? exclusionRuleIds
      : ["no_property_inclusion_match"];

  assert.ok(
    actualReasonRuleIds.includes(fixture.expected.reasonRuleId),
    `${fixture.name}: expected reason rule ${fixture.expected.reasonRuleId}, got ${actualReasonRuleIds.join(", ")}`
  );
}

console.log(`Property filter fixtures passed: ${propertyFilterFixtures.length}`);
