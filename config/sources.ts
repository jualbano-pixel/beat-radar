import type { SourceDefinition } from "../lib/types.js";

export const sources: SourceDefinition[] = [
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
    name: "BusinessMirror Motoring",
    beat: "philippine_motoring",
    type: "rss",
    url: "https://businessmirror.com.ph/life/motoring/feed/",
    maxItems: 25,
    daysBack: 60
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
  },
  {
    name: "BusinessWorld Online",
    beat: "philippine_motoring",
    type: "rss",
    url: "https://www.bworldonline.com/feed/",
    maxItems: 30,
    daysBack: 30
  },
  {
    name: "Land Transportation Office",
    beat: "philippine_motoring",
    type: "rss",
    url: "https://lto.gov.ph/news/feed/",
    maxItems: 20,
    daysBack: 60
  },
  {
    name: "Land Transportation Franchising and Regulatory Board",
    beat: "philippine_motoring",
    type: "rss",
    url: "https://ltfrb.gov.ph/feed/",
    maxItems: 20,
    daysBack: 60
  }
];
