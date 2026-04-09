import type { NormalizedStory, ReviewResult, StoryDrop } from "./types.js";

const MAX_SUMMARY_LENGTH = 320;
const MIN_TITLE_LENGTH = 8;

function squeezeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateSummary(summary: string): string {
  if (summary.length <= MAX_SUMMARY_LENGTH) {
    return summary;
  }

  return `${summary.slice(0, MAX_SUMMARY_LENGTH - 3).trimEnd()}...`;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isGarbageText(value: string): boolean {
  const cleaned = squeezeWhitespace(value);

  if (cleaned.length < MIN_TITLE_LENGTH) {
    return true;
  }

  if (/^(advertisement|subscribe|sign up|continue reading)$/i.test(cleaned)) {
    return true;
  }

  if (/^[^a-z0-9]+$/i.test(cleaned)) {
    return true;
  }

  return false;
}

function cleanStory(story: NormalizedStory): NormalizedStory {
  const cleaned: NormalizedStory = {
    ...story,
    title: squeezeWhitespace(story.title),
    url: squeezeWhitespace(story.url),
    publishedAt: squeezeWhitespace(story.publishedAt),
    fetchedAt: squeezeWhitespace(story.fetchedAt)
  };

  if (story.summary) {
    const summary = truncateSummary(
      squeezeWhitespace(
        story.summary.replace(/Read the full story at The Verge\.?$/i, "")
      )
    );

    if (summary) {
      cleaned.summary = summary;
    } else {
      delete cleaned.summary;
    }
  }

  return cleaned;
}

export function reviewStories(stories: NormalizedStory[]): ReviewResult {
  const kept: NormalizedStory[] = [];
  const dropped: StoryDrop[] = [];

  for (const story of stories) {
    const cleaned = cleanStory(story);

    if (!cleaned.title) {
      dropped.push({
        source: story.source,
        url: story.url,
        date: story.publishedAt,
        reason: "garbage_title",
        details: "Title is empty after whitespace cleanup"
      });
      continue;
    }

    if (isGarbageText(cleaned.title)) {
      dropped.push({
        source: cleaned.source,
        title: cleaned.title,
        url: cleaned.url,
        date: cleaned.publishedAt,
        reason: "garbage_title",
        details: "Title looks like navigation, promo text, or noise"
      });
      continue;
    }

    if (!isValidHttpUrl(cleaned.url)) {
      dropped.push({
        source: cleaned.source,
        title: cleaned.title,
        url: cleaned.url,
        date: cleaned.publishedAt,
        reason: "invalid_url",
        details: "URL is not a valid HTTP(S) link"
      });
      continue;
    }

    if (Number.isNaN(Date.parse(cleaned.publishedAt))) {
      dropped.push({
        source: cleaned.source,
        title: cleaned.title,
        url: cleaned.url,
        date: cleaned.publishedAt,
        reason: "invalid_date",
        details: "Published date is not parseable"
      });
      continue;
    }

    if (cleaned.summary && isGarbageText(cleaned.summary)) {
      delete cleaned.summary;
    }

    kept.push(cleaned);
  }

  return { kept, dropped };
}
