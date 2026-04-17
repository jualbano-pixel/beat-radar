import axios from "axios";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

import type { RawStoryResult, SourceDefinition } from "../types.js";

const USER_AGENT =
  "Mozilla/5.0 (compatible; BeatRadarScraper/1.0; +https://example.com/bot)";

function resolveUrl(baseUrl: string, value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function cleanText(value?: string): string | undefined {
  const cleaned = value?.replace(/\s+/g, " ").trim();

  return cleaned || undefined;
}

function selected(
  item: cheerio.Cheerio<AnyNode>,
  selector?: string
): cheerio.Cheerio<AnyNode> {
  if (!selector) {
    return cheerio.load("")("");
  }

  return selector === ":self" ? item : item.find(selector).first();
}

function selectedText(
  item: cheerio.Cheerio<AnyNode>,
  selector?: string
): string | undefined {
  const selection = selected(item, selector);

  return cleanText(selection.attr("content") ?? selection.text());
}

function selectedUrl(
  item: cheerio.Cheerio<AnyNode>,
  baseUrl: string,
  selector?: string
): string | undefined {
  return resolveUrl(baseUrl, selected(item, selector).attr("href")?.trim());
}

function selectedDate(
  item: cheerio.Cheerio<AnyNode>,
  selector?: string
): string | undefined {
  const selection = selected(item, selector);

  return cleanText(
    selection.attr("datetime") ?? selection.attr("content") ?? selection.text()
  );
}

async function fetchDetailStory(
  story: RawStoryResult,
  source: SourceDefinition
): Promise<RawStoryResult> {
  const detailSelectors = source.selectors?.detail;

  if (!detailSelectors || !story.url) {
    return story;
  }

  try {
    const { data } = await axios.get<string>(story.url, {
      timeout: 15_000,
      headers: {
        "User-Agent": USER_AGENT
      }
    });

    const $ = cheerio.load(data);
    const document = $.root();
    const title = selectedText(document, detailSelectors.title);
    const link = selectedUrl(document, story.url, detailSelectors.link);
    const date = selectedDate(document, detailSelectors.date);
    const summary = selectedText(document, detailSelectors.summary);

    return {
      ...story,
      title: title ?? story.title,
      url: link ?? story.url,
      publishedAt: date ? new Date(date).toISOString() : story.publishedAt,
      summary: summary ?? story.summary
    };
  } catch {
    return story;
  }
}

export async function fetchHtmlStories(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  const { data } = await axios.get<string>(source.url, {
    timeout: 15_000,
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  const $ = cheerio.load(data);
  const selectors = source.selectors;

  if (!selectors?.item) {
    return [];
  }

  const stories = $(selectors.item)
    .map((_, element) => {
      const item = $(element);

      const title = selectedText(item, selectors.title);
      const link = selectedUrl(item, source.url, selectors.link);
      const date = selectedDate(item, selectors.date);
      const summary = selectedText(item, selectors.summary);

      return {
        source: source.name,
        title,
        url: link,
        publishedAt: date ? new Date(date).toISOString() : undefined,
        summary
      };
    })
    .get()
    .slice(0, source.maxItems);

  if (!selectors.detail) {
    return stories;
  }

  return Promise.all(stories.map((story) => fetchDetailStory(story, source)));
}
