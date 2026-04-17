import axios from "axios";

import type { RawStoryResult, SourceDefinition } from "../types.js";

function cleanText(value?: string): string | undefined {
  const cleaned = value?.replace(/\s+/g, " ").trim();

  return cleaned || undefined;
}

function getPath(value: unknown, path?: string): unknown {
  if (!path) {
    return undefined;
  }

  return path.split(".").reduce<unknown>((current, part) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    if (Array.isArray(current) && /^\d+$/.test(part)) {
      return current[Number(part)];
    }

    if (typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, value);
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return cleanText(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asIsoDate(value: unknown): string | undefined {
  const raw = asString(value);

  if (!raw) {
    return undefined;
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function fetchJsonStories(
  source: SourceDefinition
): Promise<RawStoryResult[]> {
  if (!source.json) {
    return [];
  }

  const { data } = await axios.get<unknown>(source.url, {
    timeout: 15_000,
    headers: {
      "Accept": "application/json, text/plain;q=0.9, */*;q=0.8",
      "User-Agent": "BeatRadarScraper/1.0"
    }
  });

  return asArray(getPath(data, source.json.items))
    .slice(0, source.maxItems)
    .map((item) => ({
      source: source.name,
      title: asString(getPath(item, source.json?.title)),
      url: asString(getPath(item, source.json?.link)),
      publishedAt: asIsoDate(getPath(item, source.json?.date)),
      summary: asString(getPath(item, source.json?.summary))
    }));
}
