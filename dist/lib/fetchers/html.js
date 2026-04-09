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
async function fetchHtmlStories(source) {
    const { data } = await axios_1.default.get(source.url, {
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
            ? resolveUrl(source.url, item.find(selectors.link).first().attr("href")?.trim())
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
