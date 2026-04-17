import axios from "axios";
import * as cheerio from "cheerio";

import type { RawStoryResult, SourceDefinition } from "../types.js";

function cleanText(value?: string): string | undefined {
  const cleaned = value
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || undefined;
}

function fillTemplate(
  template: string,
  values: Record<string, string | undefined>
): string {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key: string) =>
    encodeURIComponent(values[key] ?? "")
  );
}

function parseDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function parseItems(xml: string): Array<Record<string, string | undefined>> {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: Array<Record<string, string | undefined>> = [];

  $("entry").each((_, element) => {
    const item = $(element);
    const values: Record<string, string | undefined> = {};

    item.find("m\\:properties, properties").children().each((__, child) => {
      const name = child.tagName.replace(/^d:/, "");
      values[name] = cleanText($(child).text());
    });

    items.push(values);
  });

  return items;
}

async function fetchDetailContent(
  story: RawStoryResult,
  source: SourceDefinition,
  item: Record<string, string | undefined>
): Promise<RawStoryResult> {
  const config = source.sharepoint;

  if (!config?.detailUrlTemplate || !config.contentField) {
    return story;
  }

  try {
    const detailUrl = fillTemplate(config.detailUrlTemplate, item);
    const { data } = await axios.get<string>(detailUrl, {
      timeout: 15_000,
      headers: {
        "Accept": "application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "User-Agent": "BeatRadarScraper/1.0"
      }
    });
    const detailItems = parseItems(data);
    const detail = detailItems[0];
    const content = cleanText(detail?.[config.contentField]);

    return {
      ...story,
      summary: content ?? story.summary
    };
  } catch {
    return story;
  }
}

export async function fetchSharePointStories(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  const config = source.sharepoint;

  if (!config) {
    return [];
  }

  const { data } = await axios.get<string>(source.url, {
    timeout: 15_000,
    headers: {
      "Accept": "application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "User-Agent": "BeatRadarScraper/1.0"
    }
  });

  const items = parseItems(data).slice(0, source.maxItems);
  const stories = items.map((item) => {
    const summary = config.summaryFields
      ?.map((fieldName) => fieldName === config.contentField
        ? item[fieldName]
        : `${fieldName}: ${item[fieldName] ?? ""}`)
      .filter(Boolean)
      .join(" ");

    return {
      source: source.name,
      title: item[config.titleField],
      url: fillTemplate(config.linkTemplate, item),
      publishedAt: parseDate(item[config.dateField]),
      summary: cleanText(summary)
    };
  });

  return Promise.all(
    stories.map((story, index) => fetchDetailContent(story, source, items[index]))
  );
}
