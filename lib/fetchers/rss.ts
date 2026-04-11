import { brotliDecompressSync, gunzipSync, inflateSync } from "node:zlib";

import axios from "axios";
import Parser from "rss-parser";

import type { RawStoryResult, SourceDefinition } from "../types.js";

const parser = new Parser();

function decodeFeed(data: ArrayBuffer, encoding?: string): string {
  let buffer = Buffer.from(data);
  const normalizedEncoding = encoding?.toLowerCase() ?? "";

  if (normalizedEncoding.includes("gzip") || (buffer[0] === 0x1f && buffer[1] === 0x8b)) {
    buffer = gunzipSync(buffer);
  } else if (normalizedEncoding.includes("deflate")) {
    buffer = inflateSync(buffer);
  } else if (normalizedEncoding.includes("br")) {
    buffer = brotliDecompressSync(buffer);
  }

  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

function itemDate(item: Parser.Item): string | undefined {
  const fields = item as Parser.Item & {
    isoDate?: string;
    dcDate?: string;
    "dc:date"?: string;
  };

  return item.pubDate ?? fields.isoDate ?? fields.dcDate ?? fields["dc:date"];
}

function mapFeedItems(
  source: SourceDefinition,
  items: Parser.Item[] = []
): RawStoryResult[] {
  return items.map((item) => {
    const date = itemDate(item);

    return {
      source: source.name,
      title: item.title?.trim(),
      url: item.link?.trim(),
      publishedAt: date ? new Date(date).toISOString() : undefined,
      summary: item.contentSnippet?.trim() ?? item.summary?.trim()
    };
  });
}

export async function fetchRssStories(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  if (source.preferNativeRssFetch) {
    const feed = await parser.parseURL(source.url);

    return mapFeedItems(source, feed.items);
  }

  try {
    const { data, headers } = await axios.get<ArrayBuffer>(source.url, {
      responseType: "arraybuffer",
      timeout: 15_000,
      decompress: false,
      headers: {
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "Mozilla/5.0 (compatible; BeatRadarScraper/1.0; +https://example.com/bot)"
      }
    });
    const feed = await parser.parseString(decodeFeed(data, headers["content-encoding"]));

    return mapFeedItems(source, feed.items);
  } catch {
    const feed = await parser.parseURL(source.url);

    return mapFeedItems(source, feed.items);
  }
}
