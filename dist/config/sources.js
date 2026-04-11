"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sources = void 0;
exports.sources = [
    {
        name: "TechCrunch",
        beat: "ai_tech",
        type: "rss",
        url: "https://techcrunch.com/feed/",
        maxItems: 25,
        daysBack: 30
    },
    {
        name: "The Verge",
        beat: "ai_tech",
        type: "rss",
        url: "https://www.theverge.com/rss/index.xml",
        maxItems: 25,
        daysBack: 30
    },
    {
        name: "Wired",
        beat: "ai_tech",
        type: "rss",
        url: "https://www.wired.com/feed/rss",
        maxItems: 30,
        daysBack: 30
    },
    // NEW — primary sources
    {
        name: "OpenAI Blog",
        beat: "ai_tech",
        type: "rss",
        url: "https://openai.com/news/rss.xml",
        maxItems: 40,
        daysBack: 60
    },
    {
        name: "Google AI Blog",
        beat: "ai_tech",
        type: "rss",
        url: "https://blog.google/technology/ai/rss/",
        maxItems: 25,
        daysBack: 45
    },
    {
        name: "NVIDIA Blog",
        beat: "ai_tech",
        type: "rss",
        url: "https://feeds.feedburner.com/nvidiablog",
        maxItems: 20,
        daysBack: 45
    },
    {
        name: "TopGear Philippines",
        beat: "philippine_motoring",
        type: "rss",
        url: "https://www.topgear.com.ph/feed/rss1",
        maxItems: 25,
        daysBack: 45
    },
    {
        name: "CarGuide PH",
        beat: "philippine_motoring",
        type: "rss",
        url: "https://feeds.feedburner.com/Carguideph",
        maxItems: 25,
        daysBack: 45
    },
    {
        name: "Inquirer Business",
        beat: "philippine_motoring",
        type: "rss",
        url: "https://business.inquirer.net/feed",
        maxItems: 30,
        daysBack: 30
    },
    {
        name: "Philstar Business",
        beat: "philippine_motoring",
        type: "rss",
        url: "https://www.philstar.com/rss/business",
        maxItems: 25,
        daysBack: 30
    }
];
