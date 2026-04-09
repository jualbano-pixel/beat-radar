"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRssStories = fetchRssStories;
const rss_parser_1 = __importDefault(require("rss-parser"));
const parser = new rss_parser_1.default();
async function fetchRssStories(source) {
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
