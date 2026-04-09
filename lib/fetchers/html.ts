import axios from "axios";
import * as cheerio from "cheerio";

import type { RawStoryResult, SourceDefinition } from "../types.js";

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

export async function fetchHtmlStories(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  const { data } = await axios.get<string>(source.url, {
    timeout: 15_000,
    headers: {
      "User-Agent": "BeatRadarScraper/1.0"
    }
  });

  const $ = cheerio.load(data);
  const selectors = source.selectors;

  if (!selectors?.item) {
    return [];
  }

  return $(selectors.item)
    .map((_, element) => {
      const item = $(element);

      // TODO: Provide source-specific selectors when HTML sources are added.
      const title = selectors.title
        ? item.find(selectors.title).first().text().trim()
        : undefined;
      const link = selectors.link
        ? resolveUrl(
            source.url,
            item.find(selectors.link).first().attr("href")?.trim()
          )
        : undefined;
      const date = selectors.date
        ? item.find(selectors.date).first().attr("datetime")?.trim() ??
          item.find(selectors.date).first().text().trim()
        : undefined;
      const summary = selectors.summary
        ? item.find(selectors.summary).first().text().trim()
        : undefined;

      return {
        source: source.name,
        title: title || undefined,
        url: link,
        publishedAt: date ? new Date(date).toISOString() : undefined,
        summary: summary || undefined
      };
    })
    .get();
}
