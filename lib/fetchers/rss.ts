import Parser from "rss-parser";

import type { RawStoryResult, SourceDefinition } from "../types.js";

const parser = new Parser();

export async function fetchRssStories(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  const feed = await parser.parseURL(source.url);

  return (feed.items ?? []).map((item) => ({
    source: source.name,
    title: item.title?.trim(),
    url: item.link?.trim(),
    publishedAt: item.pubDate
      ? new Date(item.pubDate).toISOString()
      : undefined,
    summary: item.contentSnippet?.trim() ?? item.summary?.trim()
  }));
}
