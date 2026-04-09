import type { NormalizedStory, ReviewResult, StoryDrop } from "./types.js";

const CONSUMER_PRODUCT_PATTERNS = [
  /\bvideo doorbell\b/i,
  /\bheadphones?\b/i,
  /\bearbuds?\b/i,
  /\blaptop(s)?\b/i,
  /\btablet(s)?\b/i,
  /\bsmartwatch(es)?\b/i,
  /\bwatch bands?\b/i,
  /\bbluetooth speaker(s)?\b/i,
  /\bcamera(s)?\b/i,
  /\bphone case(s)?\b/i,
  /\baccessories\b/i,
  /\brobot lawn mower(s)?\b/i
];

const COMMERCE_TITLE_PATTERNS = [
  /\bdiscount(ed)?\b/i,
  /\b\d+\s*%\s*off\b/i,
  /\b\d+\s*percent\s*off\b/i,
  /\$\s?\d[\d,]*\s*off\b/i,
  /\bsave\s+\$?\d[\d,]*/i,
  /\bsaving\s+\$?\d[\d,]*/i,
  /\bon sale\b/i,
  /\bbuy now\b/i,
  /\bgift guide\b/i,
  /\bour favorite\b/i,
  /\bbest\s+.+\s+right now\b/i,
  /\bbest\s+(laptops?|headphones?|earbuds?|speakers?|doorbells?|phones?|tablets?)\b/i,
  /\btop\s+\d+\b/i,
  /\btop picks?\b/i,
  /\broundup\b/i,
  /\bpromo code(s)?\b/i,
  /\bcoupon(s)?\b/i
];

const COMMERCE_URL_PATTERNS = [
  /\/deal(s)?\b/i,
  /\/sale\b/i,
  /\/coupon(s)?\b/i,
  /\/promo\b/i,
  /\/shopping\b/i,
  /\/gift-guide\b/i
];

const EVENT_PROMO_TITLE_PATTERNS = [
  /\bregister\b/i,
  /\btickets?\b/i,
  /\bpasses?\b/i,
  /\bearly bird\b/i,
  /\blast chance\b/i,
  /\bdays? left\b/i,
  /\bjoin us\b/i,
  /\battend\b/i
];

const SUMMARY_COMMERCE_PATTERNS = [
  /\baffiliate\b/i,
  /\bshop\b/i,
  /\bprice\b/i,
  /\bdiscount\b/i,
  /\bcoupon\b/i,
  /\btested\b/i
];

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9\s/:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesAnyPattern(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function hasConsumerProductContext(value: string): boolean {
  return matchesAnyPattern(value, CONSUMER_PRODUCT_PATTERNS);
}

function buildDrop(
  story: NormalizedStory,
  reason: StoryDrop["reason"],
  details: string
): StoryDrop {
  return {
    source: story.source,
    title: story.title,
    url: story.url,
    date: story.publishedAt,
    reason,
    details
  };
}

export function matchesHardExclusion(
  story: NormalizedStory
): { excluded: boolean; reason?: StoryDrop["reason"] } {
  const title = normalizeText(story.title);
  const url = normalizeText(story.url);
  const summary = normalizeText(story.summary ?? "");
  const titleAndUrl = `${title} ${url}`.trim();
  const dealIntentMatch =
    /\bdeal(s)?\b/i.test(title) &&
    (hasConsumerProductContext(titleAndUrl) ||
      /\b(coupon|promo|sale|discount|price|off)\b/i.test(title));

  const commerceTitleMatch = matchesAnyPattern(title, COMMERCE_TITLE_PATTERNS);
  const commerceUrlMatch = matchesAnyPattern(url, COMMERCE_URL_PATTERNS);
  const affiliateListicleMatch =
    (/\bbest\b/i.test(title) || /\bguide\b/i.test(title) || /\bwe tested\b/i.test(title)) &&
    hasConsumerProductContext(titleAndUrl);
  const summaryCommerceMatch =
    hasConsumerProductContext(titleAndUrl) &&
    matchesAnyPattern(summary, SUMMARY_COMMERCE_PATTERNS);

  const eventPromoMatch =
    matchesAnyPattern(title, EVENT_PROMO_TITLE_PATTERNS) &&
    (/\b(save|register|registration|sale|discount)\b/i.test(title) ||
      /\bconference\b/i.test(title) ||
      /\bdisrupt\b/i.test(title) ||
      /\bpass(es)?\b/i.test(title) ||
      /\bticket(s)?\b/i.test(title));

  if (eventPromoMatch) {
    return {
      excluded: true,
      reason: "hard_excluded_event_promo"
    };
  }

  if (
    dealIntentMatch ||
    commerceTitleMatch ||
    commerceUrlMatch ||
    affiliateListicleMatch ||
    summaryCommerceMatch
  ) {
    return {
      excluded: true,
      reason: "hard_excluded_commerce"
    };
  }

  return { excluded: false };
}

export function applyHardExclusions(stories: NormalizedStory[]): ReviewResult {
  const kept: NormalizedStory[] = [];
  const dropped: StoryDrop[] = [];

  for (const story of stories) {
    const result = matchesHardExclusion(story);

    if (result.excluded && result.reason) {
      dropped.push(
        buildDrop(
          story,
          result.reason,
          result.reason === "hard_excluded_commerce"
            ? "Matched hard commerce, affiliate, or shopping exclusion patterns"
            : "Matched hard event or registration promotion patterns"
        )
      );
      continue;
    }

    kept.push(story);
  }

  return { kept, dropped };
}
