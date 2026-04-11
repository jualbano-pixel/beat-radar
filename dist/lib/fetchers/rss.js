"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRssStories = fetchRssStories;
const node_zlib_1 = require("node:zlib");
const axios_1 = __importDefault(require("axios"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const parser = new rss_parser_1.default();
function decodeFeed(data, encoding) {
    let buffer = Buffer.from(data);
    const normalizedEncoding = encoding?.toLowerCase() ?? "";
    if (normalizedEncoding.includes("gzip") || (buffer[0] === 0x1f && buffer[1] === 0x8b)) {
        buffer = (0, node_zlib_1.gunzipSync)(buffer);
    }
    else if (normalizedEncoding.includes("deflate")) {
        buffer = (0, node_zlib_1.inflateSync)(buffer);
    }
    else if (normalizedEncoding.includes("br")) {
        buffer = (0, node_zlib_1.brotliDecompressSync)(buffer);
    }
    return buffer.toString("utf8").replace(/^\uFEFF/, "");
}
function itemDate(item) {
    const fields = item;
    return item.pubDate ?? fields.isoDate ?? fields.dcDate ?? fields["dc:date"];
}
function mapFeedItems(source, items = []) {
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
async function fetchRssStories(source) {
    if (source.preferNativeRssFetch) {
        const feed = await parser.parseURL(source.url);
        return mapFeedItems(source, feed.items);
    }
    try {
        const { data, headers } = await axios_1.default.get(source.url, {
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
    }
    catch {
        const feed = await parser.parseURL(source.url);
        return mapFeedItems(source, feed.items);
    }
}
