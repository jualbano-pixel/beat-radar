"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHtmlStories = fetchHtmlStories;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const USER_AGENT = "Mozilla/5.0 (compatible; BeatRadarScraper/1.0; +https://example.com/bot)";
function resolveUrl(baseUrl, value) {
    if (!value) {
        return undefined;
    }
    try {
        return new URL(value, baseUrl).toString();
    }
    catch {
        return undefined;
    }
}
function cleanText(value) {
    const cleaned = value?.replace(/\s+/g, " ").trim();
    return cleaned || undefined;
}
function selected(item, selector) {
    if (!selector) {
        return cheerio.load("")("");
    }
    return selector === ":self" ? item : item.find(selector).first();
}
function selectedText(item, selector) {
    const selection = selected(item, selector);
    return cleanText(selection.attr("content") ?? selection.text());
}
function selectedUrl(item, baseUrl, selector) {
    return resolveUrl(baseUrl, selected(item, selector).attr("href")?.trim());
}
function selectedDate(item, selector) {
    const selection = selected(item, selector);
    return cleanText(selection.attr("datetime") ?? selection.attr("content") ?? selection.text());
}
async function fetchDetailStory(story, source) {
    const detailSelectors = source.selectors?.detail;
    if (!detailSelectors || !story.url) {
        return story;
    }
    try {
        const { data } = await axios_1.default.get(story.url, {
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
    }
    catch {
        return story;
    }
}
async function fetchHtmlStories(source) {
    const { data } = await axios_1.default.get(source.url, {
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
