import type { NormalizedStory } from "./types.js";

const VENDOR_AUTHORED_SOURCES = new Set([
  "OpenAI Blog",
  "Google AI Blog",
  "Microsoft Blog AI"
]);

const REPORTED_SOURCES = new Set([
  "BusinessWorld AI/Tech",
  "Inquirer Tech",
  "Inquirer Business AI/Tech",
  "Philippine Star Business AI/Tech",
  "Malaya Business AI/Tech",
  "e27 SEA Tech",
  "TechCrunch AI"
]);

const REGULATORY_OR_OFFICIAL_SOURCES = new Set([
  "Bangko Sentral ng Pilipinas AI/Tech",
  "Department of Information and Communications Technology AI Policy",
  "Department of Trade and Industry AI Economy",
  "NEDA Digital Economy",
  "Philippine Economic Zone Authority Digital Infrastructure",
  "Board of Investments Digital Economy",
  "Department of Labor and Employment Workforce Transition",
  "TESDA Skills and Workforce Transition",
  "ASEAN Digital Economy and AI Governance",
  "ERIA Digital Economy",
  "Asian Development Bank Digital Economy"
]);

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function storyText(story: NormalizedStory): string {
  return normalizeText(`${story.title} ${story.summary ?? ""}`);
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalizeText(term)));
}

export function isVendorAuthoredTechnologyStory(story: NormalizedStory): boolean {
  return story.beat === "ai_tech" && VENDOR_AUTHORED_SOURCES.has(story.source);
}

export function isReportedTechnologyStory(story: NormalizedStory): boolean {
  return story.beat === "ai_tech" && REPORTED_SOURCES.has(story.source);
}

export function isOfficialTechnologyStory(story: NormalizedStory): boolean {
  return story.beat === "ai_tech" && REGULATORY_OR_OFFICIAL_SOURCES.has(story.source);
}

export function isVendorThoughtLeadership(story: NormalizedStory): boolean {
  if (!isVendorAuthoredTechnologyStory(story)) {
    return false;
  }

  const text = storyText(story);
  const hardDevelopment = hasAny(text, [
    "deploy",
    "deployed",
    "deployment",
    "rollout",
    "implemented",
    "implementation",
    "customer",
    "customers",
    "data center",
    "datacenter",
    "cloud region",
    "security incident",
    "data breach",
    "ransomware",
    "pricing",
    "price",
    "availability",
    "access"
  ]);

  return (
    hasAny(text, [
      "our views",
      "why ",
      "lessons",
      "blueprint",
      "framework",
      "state of",
      "how frontier",
      "recommendations",
      "opportunity",
      "principles",
      "perspective",
      "vision",
      "future of"
    ]) && !hardDevelopment
  );
}

export function isVendorAnnouncement(story: NormalizedStory): boolean {
  if (!isVendorAuthoredTechnologyStory(story) || isVendorThoughtLeadership(story)) {
    return false;
  }

  return hasAny(storyText(story), [
    "launch",
    "launches",
    "launched",
    "introducing",
    "announcing",
    "partner",
    "partnership",
    "available",
    "release",
    "released"
  ]);
}

export function technologyDevelopmentPreferenceScore(story: NormalizedStory): number {
  if (story.beat !== "ai_tech") {
    return 0;
  }

  const text = storyText(story);

  if (isReportedTechnologyStory(story) && hasAny(text, [
    "said",
    "reports",
    "reported",
    "according",
    "expands",
    "expansion",
    "raises",
    "files",
    "eyes",
    "backs",
    "banks on",
    "wraps up",
    "discloses"
  ])) {
    return 7;
  }

  if (
    isOfficialTechnologyStory(story) ||
    (!isVendorAuthoredTechnologyStory(story) && hasAny(text, [
      "regulation",
      "regulatory",
      "rules",
      "law",
      "legislation",
      "npc",
      "dict",
      "data privacy",
      "defa"
    ]))
  ) {
    return 6;
  }

  if (isVendorThoughtLeadership(story)) {
    return -3;
  }

  if (isVendorAnnouncement(story)) {
    return 1;
  }

  if (isVendorAuthoredTechnologyStory(story)) {
    return hasAny(text, [
      "data center",
      "datacenter",
      "cloud region",
      "5g",
      "broadband",
      "fiber",
      "submarine cable",
      "subsea cable",
      "network expansion",
      "infrastructure",
      "deployment",
      "deployed",
      "rollout",
      "implemented",
      "enterprise",
      "customer",
      "customers",
      "workflow",
      "cloud migration",
      "market share",
      "shipments",
      "adoption",
      "consumer behavior",
      "demand",
      "spending"
    ])
      ? 1
      : -1;
  }

  if (hasAny(text, [
    "data center",
    "datacenter",
    "cloud region",
    "5g",
    "broadband",
    "fiber",
    "submarine cable",
    "subsea cable",
    "network expansion",
    "infrastructure"
  ])) {
    return 5;
  }

  if (hasAny(text, [
    "deployment",
    "deployed",
    "rollout",
    "implemented",
    "enterprise",
    "customer",
    "customers",
    "workflow",
    "cloud migration"
  ])) {
    return 4;
  }

  if (hasAny(text, [
    "market share",
    "shipments",
    "adoption",
    "consumer behavior",
    "demand",
    "spending"
  ])) {
    return 3;
  }

  return 0;
}
