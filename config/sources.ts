import type { SourceDefinition } from "../lib/types.js";

export const sources: SourceDefinition[] = [
  {
    name: "Bangko Sentral ng Pilipinas AI/Tech",
    beat: "ai_tech",
    type: "rss",
    url: "https://www.bsp.gov.ph/_layouts/15/listfeed.aspx?List=9b0a2117-49d8-4e96-80ba-8651a0e3e17a&View=8c968884-887d-4d63-8c00-ba05ea3c2d93",
    maxItems: 15,
    daysBack: 60
  },
  {
    name: "BusinessWorld AI/Tech",
    beat: "ai_tech",
    type: "rss",
    url: "https://www.bworldonline.com/feed/",
    maxItems: 35,
    daysBack: 45
  },
  {
    name: "Inquirer Tech",
    beat: "ai_tech",
    type: "rss",
    url: "https://technology.inquirer.net/feed",
    maxItems: 30,
    daysBack: 45
  },
  {
    name: "Inquirer Business AI/Tech",
    beat: "ai_tech",
    type: "rss",
    url: "https://business.inquirer.net/feed",
    maxItems: 30,
    daysBack: 45
  },
  {
    name: "Philippine Star Business AI/Tech",
    beat: "ai_tech",
    type: "rss",
    url: "https://www.philstar.com/rss/business",
    maxItems: 25,
    daysBack: 45
  },
  {
    name: "Malaya Business AI/Tech",
    beat: "ai_tech",
    type: "rss",
    url: "https://malaya.com.ph/feed/",
    maxItems: 25,
    daysBack: 45
  },
  {
    name: "e27 SEA Tech",
    beat: "ai_tech",
    type: "rss",
    url: "https://e27.co/feed/",
    maxItems: 25,
    daysBack: 45
  },
  {
    name: "OpenAI Blog",
    beat: "ai_tech",
    type: "rss",
    url: "https://openai.com/news/rss.xml",
    maxItems: 20,
    daysBack: 30
  },
  {
    name: "Google AI Blog",
    beat: "ai_tech",
    type: "rss",
    url: "https://blog.google/technology/ai/rss/",
    maxItems: 20,
    daysBack: 30
  },
  {
    name: "Microsoft Blog AI",
    beat: "ai_tech",
    type: "rss",
    url: "https://blogs.microsoft.com/feed/",
    maxItems: 20,
    daysBack: 30
  },
  {
    name: "TechCrunch AI",
    beat: "ai_tech",
    type: "rss",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    maxItems: 20,
    daysBack: 30
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
  {
    name: "Bangko Sentral ng Pilipinas Property",
    beat: "property_real_estate",
    type: "rss",
    url: "https://www.bsp.gov.ph/_layouts/15/listfeed.aspx?List=9b0a2117-49d8-4e96-80ba-8651a0e3e17a&View=8c968884-887d-4d63-8c00-ba05ea3c2d93",
    maxItems: 30,
    daysBack: 120
  },
  {
    name: "BSP Property Media Releases SharePoint",
    beat: "property_real_estate",
    type: "sharepoint",
    url: "https://www.bsp.gov.ph/_api/web/lists/getByTitle('Media%20Releases%20and%20Advisories')/items?%24top=40&%24orderby=PDate%20desc&%24select=ID,Title,PDate,Tag,Status,OData__ModerationStatus",
    maxItems: 40,
    daysBack: 45,
    sharepoint: {
      titleField: "Title",
      dateField: "PDate",
      linkTemplate: "https://www.bsp.gov.ph/SitePages/MediaAndResearch/MediaDisp.aspx?ItemId={ID}&MType=Media%20Releases",
      summaryFields: ["Tag"],
      contentField: "Content",
      detailUrlTemplate: "https://www.bsp.gov.ph/_api/web/lists/getByTitle('Media%20Releases%20and%20Advisories')/items({ID})"
    }
  },
  {
    name: "BSP Property Issuances SharePoint",
    beat: "property_real_estate",
    type: "sharepoint",
    url: "https://www.bsp.gov.ph/_api/web/lists/getByTitle('Issuances')/items?%24top=40&%24orderby=DateIssued%20desc&%24select=ID,Title,DateIssued,CircularNumber,IssuanceType,OData__ModerationStatus",
    maxItems: 40,
    daysBack: 120,
    sharepoint: {
      titleField: "Title",
      dateField: "DateIssued",
      linkTemplate: "https://www.bsp.gov.ph/SitePages/Regulations/RegulationDisp.aspx?ItemId={ID}",
      summaryFields: ["CircularNumber", "IssuanceType"],
      contentField: "Content",
      detailUrlTemplate: "https://www.bsp.gov.ph/_api/web/lists/getByTitle('Issuances')/items({ID})"
    }
  },
  {
    name: "Santos Knight Frank Market Reports",
    beat: "property_real_estate",
    type: "html",
    url: "https://santosknightfrank.com/market-reports/",
    maxItems: 5,
    daysBack: 365,
    selectors: {
      item: ".list-reports .yearly-report a[href*='/market-report/']",
      link: ":self",
      detail: {
        title: ".latest-report article h3",
        link: ".latest-report aside .download a",
        date: "meta[property='article:modified_time']",
        summary: ".latest-report article"
      }
    }
  },
  {
    name: "Inquirer Business Property HTML Fallback",
    beat: "property_real_estate",
    type: "html",
    url: "https://business.inquirer.net/",
    maxItems: 30,
    daysBack: 7,
    selectors: {
      item: ".news-child, .tp-box",
      title: "h2 a",
      link: "h2 a",
      date: ".nc-postdate",
      summary: "p"
    }
  },
  {
    name: "Manila Bulletin Business Property JSON Fallback",
    beat: "property_real_estate",
    type: "json",
    url: "https://mb.com.ph/api/pb/fetch-articles-paginated?limit=30&hide_widget_in_pagination=1&path_url=/category/business&section_id=27",
    maxItems: 30,
    daysBack: 7,
    json: {
      items: "data",
      title: "title",
      link: "link",
      date: "publish_time",
      summary: "summary"
    }
  },
  {
    name: "Department of Finance Property",
    beat: "property_real_estate",
    type: "rss",
    url: "https://www.dof.gov.ph/feed/",
    maxItems: 20,
    daysBack: 90
  },
  {
    name: "BusinessWorld Property",
    beat: "property_real_estate",
    type: "rss",
    url: "https://www.bworldonline.com/feed/",
    maxItems: 35,
    daysBack: 60
  },
  {
    name: "BusinessMirror Property",
    beat: "property_real_estate",
    type: "rss",
    url: "https://businessmirror.com.ph/business/feed/",
    maxItems: 35,
    daysBack: 60,
    preferNativeRssFetch: true
  },
  {
    name: "Inquirer Business Property",
    beat: "property_real_estate",
    type: "rss",
    url: "https://business.inquirer.net/feed",
    maxItems: 35,
    daysBack: 60
  },
  {
   name: "Philippine Star Property",
   beat: "property_real_estate",
   type: "rss",
   url: "https://www.philstar.com/rss/business",
   maxItems: 30,
   daysBack: 60
},
{
  name: "Malaya Business Property",
  beat: "property_real_estate",
  type: "rss",
  url: "https://malaya.com.ph/feed/",
  maxItems: 30,
  daysBack: 60
},
{
  name: "Manila Bulletin Business Property",
  beat: "property_real_estate",
  type: "rss",
  url: "https://mb.com.ph/rss/business",
  maxItems: 35,
  daysBack: 60
},
{
  name: "BusinessWorld Energy",
  beat: "ph_sea_energy",
  type: "rss",
  url: "https://www.bworldonline.com/feed/",
  maxItems: 35,
  daysBack: 45
}
];
