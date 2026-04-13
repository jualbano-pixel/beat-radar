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
    },
    {
        name: "BusinessWorld Banking",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.bworldonline.com/feed/",
        maxItems: 35,
        daysBack: 45
    },
    {
        name: "BusinessMirror Business",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://businessmirror.com.ph/business/feed/",
        maxItems: 35,
        daysBack: 45,
        preferNativeRssFetch: true
    },
    {
        name: "Inquirer Business",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://business.inquirer.net/feed",
        maxItems: 35,
        daysBack: 45
    },
    {
        name: "Philstar Business",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.philstar.com/rss/business",
        maxItems: 30,
        daysBack: 45
    },
    {
        name: "Manila Bulletin Business",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://mb.com.ph/rss/business",
        maxItems: 30,
        daysBack: 45
    },
    {
        name: "Nikkei Asia Business",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://asia.nikkei.com/rss/feed/nar",
        maxItems: 30,
        daysBack: 45,
        useFetchedAtWhenMissingDate: true
    },
    {
        name: "The Business Times Banking",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.businesstimes.com.sg/rss/banking-finance",
        maxItems: 25,
        daysBack: 45
    },
    {
        name: "Jakarta Post Business",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.thejakartapost.com/rss/business.xml",
        maxItems: 25,
        daysBack: 45
    },
    {
        name: "VNExpress Business",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://e.vnexpress.net/rss/business.rss",
        maxItems: 25,
        daysBack: 45
    },
    {
        name: "Bangko Sentral ng Pilipinas",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.bsp.gov.ph/_layouts/15/listfeed.aspx?List=9b0a2117-49d8-4e96-80ba-8651a0e3e17a&View=8c968884-887d-4d63-8c00-ba05ea3c2d93",
        maxItems: 20,
        daysBack: 60
    },
    {
        name: "Department of Finance",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.dof.gov.ph/feed/",
        maxItems: 20,
        daysBack: 60
    },
    {
        name: "Development Bank of the Philippines",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.dbp.ph/feed/",
        maxItems: 15,
        daysBack: 60
    },
    {
        name: "Asian Development Bank",
        beat: "ph_sea_banking",
        type: "rss",
        url: "https://www.adb.org/rss/news",
        maxItems: 20,
        daysBack: 60,
        preferNativeRssFetch: true
    },
    {
        name: "BusinessWorld Energy",
        beat: "ph_sea_energy",
        type: "rss",
        url: "https://www.bworldonline.com/feed/",
        maxItems: 35,
        daysBack: 45
    },
    {
        name: "Inquirer Business Energy",
        beat: "ph_sea_energy",
        type: "rss",
        url: "https://business.inquirer.net/feed",
        maxItems: 35,
        daysBack: 45
    },
    {
        name: "BusinessMirror Energy",
        beat: "ph_sea_energy",
        type: "rss",
        url: "https://businessmirror.com.ph/business/feed/",
        maxItems: 35,
        daysBack: 45,
        preferNativeRssFetch: true
    },
    {
        name: "Philippine Star Business Energy",
        beat: "ph_sea_energy",
        type: "rss",
        url: "https://www.philstar.com/rss/business",
        maxItems: 30,
        daysBack: 45
    },
    {
        name: "Malaya Business",
        beat: "ph_sea_energy",
        type: "rss",
        url: "https://malaya.com.ph/feed/",
        maxItems: 30,
        daysBack: 45
    },
];
