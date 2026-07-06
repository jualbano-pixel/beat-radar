"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderWeeklyEditorialPacketMarkdown = renderWeeklyEditorialPacketMarkdown;
exports.buildWeeklyEditorialPacket = buildWeeklyEditorialPacket;
const technology_source_priority_js_1 = require("./technology-source-priority.js");
const THEME_RULES = {
    models: ["ai_models", "model_or_platform_change", "foundational_research"],
    infra: ["ai_infra", "infrastructure_move"],
    partnerships: ["strategic_partnership"],
    policy: ["policy_regulation", "policy_shift"],
    safety: ["ai_safety", "safety_or_governance"],
    enterprise: ["enterprise_ai", "enterprise_scale_signal"],
    "finance_m_and_a": ["strategic_finance"]
};
const CONTEXT_KEYWORDS = {
    impact: [
        "openai",
        "anthropic",
        "google",
        "microsoft",
        "meta",
        "amazon",
        "nvidia",
        "model",
        "models",
        "gpt",
        "api",
        "platform",
        "chatgpt",
        "codex",
        "sora"
    ],
    strategic: [
        "partnership",
        "partner",
        "policy",
        "regulation",
        "court",
        "antitrust",
        "safety",
        "governance",
        "licensing",
        "copyright",
        "investment",
        "acquire",
        "acquisition"
    ],
    breadth: [
        "enterprise",
        "developer",
        "developers",
        "users",
        "customer",
        "business",
        "platform",
        "integration",
        "pricing",
        "compliance",
        "cloud",
        "compute"
    ]
};
function normalizeText(value) {
    return value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function sanitizeText(value) {
    return value
        .replace(/&#8216;|&#8217;/g, "'")
        .replace(/&#8220;|&#8221;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function countKeywordHits(text, keywords) {
    const normalized = normalizeText(text);
    return keywords.reduce((count, keyword) => {
        return normalized.includes(normalizeText(keyword)) ? count + 1 : count;
    }, 0);
}
function getWeekOf(stories, fallbackDate) {
    const latestDate = stories.length > 0
        ? stories
            .map((story) => new Date(story.publishedAt).getTime())
            .reduce((latest, current) => Math.max(latest, current), 0)
        : new Date(fallbackDate).getTime();
    const weekStart = new Date(latestDate);
    const utcDay = weekStart.getUTCDay();
    const diffToMonday = (utcDay + 6) % 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - diffToMonday);
    weekStart.setUTCHours(0, 0, 0, 0);
    return weekStart.toISOString().slice(0, 10);
}
function formatDate(date) {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().slice(0, 10);
}
function splitIntoSentences(summary) {
    const cleanSummary = sanitizeText(summary);
    if (!cleanSummary) {
        return [];
    }
    return cleanSummary
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 20)
        .slice(0, 5);
}
function joinSentences(sentences, fallback) {
    const clean = [...new Set(sentences.map((sentence) => sanitizeText(sentence)).filter(Boolean))];
    if (clean.length === 0) {
        return fallback;
    }
    return clean.join(" ");
}
function buildWhatHappened(story) {
    const summarySentences = splitIntoSentences(story.summary);
    if (summarySentences.length >= 2) {
        return joinSentences(summarySentences.slice(0, 4), sanitizeText(story.summary));
    }
    const sentences = [];
    const title = sanitizeText(story.title);
    const summary = sanitizeText(story.summary);
    if (summary) {
        sentences.push(summary);
    }
    else {
        sentences.push(`${title} was one of the strongest Technology / Digital Economy developments in this run.`);
    }
    if (story.tags.includes("ai_models")) {
        sentences.push("The development centers on an AI model, platform capability, or product release rather than a generic market update.");
    }
    if (story.tags.includes("ai_infrastructure")) {
        sentences.push("It includes a concrete infrastructure, compute, or deployment angle tied to how AI systems are built or run.");
    }
    if (story.tags.includes("applied_ai")) {
        sentences.push("The development also points to a practical deployment or usage context instead of staying purely theoretical.");
    }
    return joinSentences(sentences.slice(0, 4), `${title}. ${summary}`.trim());
}
function buildWhyThisMatters(story) {
    const title = sanitizeText(story.title);
    const summary = sanitizeText(story.summary);
    const reasons = new Set(story.priority_reasons);
    const sentences = [];
    if (reasons.has("strategic_finance")) {
        sentences.push("This changes the competitive picture because it expands the capital base behind future model development, compute build-out, or acquisitions.");
    }
    if (reasons.has("infrastructure_move")) {
        sentences.push("It matters operationally because infrastructure shifts change what can be deployed, how fast systems can run, and what those deployments cost.");
    }
    if (reasons.has("model_or_platform_change")) {
        sentences.push("For developers and product teams, this can change what tools are available, what workflows are feasible, and where new application building moves next.");
    }
    if (reasons.has("strategic_partnership")) {
        sentences.push("The partnership angle matters because it can reshape distribution, integration paths, and which vendors become embedded in enterprise or government stacks.");
    }
    if (reasons.has("policy_shift")) {
        sentences.push("This has policy consequences because it can change compliance expectations, procurement decisions, or the terms under which AI systems are deployed.");
    }
    if (reasons.has("safety_or_governance")) {
        sentences.push("The safety angle matters because it affects how companies evaluate risk, set product guardrails, or justify broader adoption.");
    }
    if (reasons.has("enterprise_scale_signal")) {
        sentences.push("The enterprise angle gives this longer shelf life because it points to adoption in production environments rather than limited experimentation.");
    }
    if (reasons.has("broad_ecosystem_impact")) {
        sentences.push("The effects are likely to spread beyond one company because this touches multiple layers of the AI stack, from builders and buyers to platform operators.");
    }
    else if (reasons.has("multi_group_impact")) {
        sentences.push("This has broader editorial value because it affects more than one important constituency, such as developers, enterprise teams, or platform partners.");
    }
    if (sentences.length === 0) {
        if (summary) {
            sentences.push(`The practical consequence of ${title.toLowerCase()} is that it changes how AI products are built, deployed, or adopted.`);
        }
        else {
            sentences.push("This matters because it signals a concrete change in the AI market rather than a one-off announcement.");
        }
    }
    return joinSentences(sentences.slice(0, 4), summary || title);
}
function scoreContextDrop(story, latestDroppedDate) {
    const text = `${story.title ?? ""} ${story.details ?? ""}`;
    const contextReasons = [];
    let score = 0;
    if (countKeywordHits(text, CONTEXT_KEYWORDS.impact) >= 2) {
        score += 3;
        contextReasons.push("editorial_impact");
    }
    else if (countKeywordHits(text, CONTEXT_KEYWORDS.impact) >= 1) {
        score += 1.5;
        contextReasons.push("relevant_ai_signal");
    }
    if (countKeywordHits(text, CONTEXT_KEYWORDS.strategic) > 0) {
        score += 2.5;
        contextReasons.push("strategic_context");
    }
    const breadthHits = countKeywordHits(text, CONTEXT_KEYWORDS.breadth);
    if (breadthHits >= 2) {
        score += 2;
        contextReasons.push("broad_downstream_impact");
    }
    else if (breadthHits === 1) {
        score += 1;
        contextReasons.push("practical_context");
    }
    const storyTime = story.date ? new Date(story.date).getTime() : 0;
    const daysOld = Math.max(0, Math.floor((latestDroppedDate - storyTime) / 86_400_000));
    if (daysOld <= 30) {
        score += 1;
        contextReasons.push("recent_within_context_pool");
    }
    else if (daysOld <= 90) {
        score += 0.5;
    }
    return {
        title: sanitizeText(story.title ?? ""),
        source: story.source,
        date: story.date ?? "",
        original_url: story.url,
        reason_dropped: "dropped_time_mode",
        context_score: Number(score.toFixed(2)),
        context_reasons: contextReasons,
        note: contextReasons.includes("strategic_context")
            ? "Useful background item with longer-tail strategic context."
            : "Useful background context from outside the current monitoring window."
    };
}
function buildThemeClusters(topStories, secondarySignals) {
    const combined = [...topStories, ...secondarySignals];
    const clusters = [];
    for (const [theme, markers] of Object.entries(THEME_RULES)) {
        const matchingStories = combined.filter((story) => [...story.tags, ...story.priority_reasons].some((marker) => markers.includes(marker)));
        if (matchingStories.length === 0) {
            continue;
        }
        clusters.push({
            theme,
            story_count: matchingStories.length,
            stories: matchingStories.slice(0, 6).map((story) => story.title)
        });
    }
    return clusters.sort((left, right) => right.story_count - left.story_count);
}
function buildStoryMap(stories) {
    return new Map(stories.map((story) => [story.title, story]));
}
function enrichTopStory(story, storyMap) {
    const sourceStory = storyMap.get(story.title);
    const { why_it_matters: _unusedWhyItMatters, ...baseStory } = story;
    return {
        ...baseStory,
        title: sanitizeText(baseStory.title),
        summary: sanitizeText(baseStory.summary),
        original_url: sourceStory?.url ?? baseStory.original_url,
        what_happened: buildWhatHappened(baseStory),
        why_this_matters: buildWhyThisMatters(baseStory)
    };
}
function enrichSecondaryStory(story, storyMap) {
    const sourceStory = storyMap.get(story.title);
    return {
        ...story,
        title: sanitizeText(story.title),
        summary: sanitizeText(story.summary),
        original_url: sourceStory?.url ?? story.original_url
    };
}
function renderLink(url) {
    return url ? `[Original link](${url})` : "Original link unavailable";
}
function averagePriority(stories) {
    if (stories.length === 0) {
        return 0;
    }
    return (stories.reduce((sum, story) => sum + (story.priority_score ?? 0), 0) / stories.length);
}
function buildStoryMapById(stories) {
    return new Map(stories.map((story) => [story.id, story]));
}
function topValues(values, limit) {
    const counts = new Map();
    for (const value of values.filter(Boolean)) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()]
        .sort((left, right) => {
        if (right[1] !== left[1]) {
            return right[1] - left[1];
        }
        return left[0].localeCompare(right[0]);
    })
        .slice(0, limit)
        .map(([value]) => value);
}
function reasonLineForReasonCode(reasonCode) {
    switch (reasonCode) {
        case "execution_consequence":
            return "Execution problems are no longer abstract; they are showing up in operating decisions.";
        case "policy_regulatory_move":
            return "Policy movement is starting to shape operating choices before the rules are fully settled.";
        case "developing_pattern":
            return "More than one company is running into the same constraint, which makes this more than a one-off.";
        case "market_signal":
            return "Positioning is getting ahead of hard proof on demand, pricing power, or returns.";
        case "industry_repositioning":
            return "Competitive positioning is moving faster than the market has settled on durable winners.";
        case "meaningful_shift":
            return "This reads like a real directional change, not another routine weekly increment.";
        case "local_business_relevance":
            return "The downstream business effects are concrete enough to matter outside specialist circles.";
        case "ongoing_story_advance":
            return "An ongoing story has moved far enough to change the editorial calculation.";
        case "counterpoint":
            return "This cuts against the dominant storyline and is worth keeping in view.";
        case "watchlist_signal":
            return "This is still early, but it is the kind of signal that matters if it repeats.";
        default:
            return null;
    }
}
function inferPatternAndTension(reasonCodes, angles) {
    const joined = angles.join(" | ").toLowerCase();
    const joinedReasons = reasonCodes.join(" | ").toLowerCase();
    if (joined.includes("infrastructure lag") ||
        joined.includes("execution gap") ||
        joinedReasons.includes("execution_consequence")) {
        return {
            pattern: "Infrastructure is scaling faster than coordination.",
            tension: "Tension: ambition vs capacity"
        };
    }
    if (joined.includes("policy pressure") ||
        joined.includes("regulation moving") ||
        joinedReasons.includes("policy_regulatory_move")) {
        return {
            pattern: "Policy is moving faster than operating clarity.",
            tension: "Tension: policy vs execution"
        };
    }
    if (joined.includes("demand still unproven") ||
        joined.includes("adoption pressure") ||
        joinedReasons.includes("market_signal")) {
        return {
            pattern: "Enterprise positioning is getting pushed ahead of proven demand.",
            tension: "Tension: adoption vs proof"
        };
    }
    if (joined.includes("supply risk")) {
        return {
            pattern: "Supply constraints are starting to show through the growth narrative.",
            tension: "Tension: growth narrative vs operating strain"
        };
    }
    if (joined.includes("competitive position") ||
        joinedReasons.includes("industry_repositioning")) {
        return {
            pattern: "Competitive repositioning is accelerating before market roles are settled.",
            tension: "Tension: competition vs readiness"
        };
    }
    if (joined.includes("developer workflow")) {
        return {
            pattern: "Platform change is showing up first in developer workflow and tooling.",
            tension: "Tension: platform expansion vs developer readiness"
        };
    }
    return {
        pattern: "Platform expansion is outrunning stable operating models.",
        tension: "Tension: momentum vs operating reality"
    };
}
function inferPatternAndTensionForLabel(label, reasonCodes, angles) {
    const normalizedLabel = normalizeText(label);
    if (normalizedLabel.includes("pricing pressure")) {
        return {
            pattern: "Vehicle and fuel costs are pressing harder against household purchasing power.",
            tension: "Tension: affordability vs aspiration"
        };
    }
    if (normalizedLabel.includes("ownership cost")) {
        return {
            pattern: "The real cost of owning and using a vehicle is becoming harder to hide behind sticker prices.",
            tension: "Tension: cost vs usage"
        };
    }
    if (normalizedLabel.includes("ev transition")) {
        return {
            pattern: "EV and hybrid launches are moving faster than the everyday infrastructure around them.",
            tension: "Tension: adoption vs infrastructure"
        };
    }
    if (normalizedLabel.includes("infrastructure constraint")) {
        return {
            pattern: "Mobility demand is running into road, charging, and transport capacity limits.",
            tension: "Tension: usage vs capacity"
        };
    }
    if (normalizedLabel.includes("regulation and enforcement")) {
        return {
            pattern: "Rules are starting to bite where motoring culture and road discipline have been loose.",
            tension: "Tension: policy vs enforcement"
        };
    }
    if (normalizedLabel.includes("supply and availability")) {
        return {
            pattern: "Availability is becoming part of the market story, not just background logistics.",
            tension: "Tension: supply vs demand"
        };
    }
    if (normalizedLabel.includes("consumer demand shift")) {
        return {
            pattern: "Brands are testing what Filipino buyers will still stretch for under tighter cost pressure.",
            tension: "Tension: aspiration vs affordability"
        };
    }
    if (normalizedLabel.includes("motoring market signal")) {
        return {
            pattern: "The market is starting to show what buyers can still afford, and what they will not.",
            tension: "Tension: cost vs demand"
        };
    }
    if (normalizedLabel.includes("price growth slowdown")) {
        return {
            pattern: "Home-price growth is losing speed rather than confirming a clean demand rebound.",
            tension: "Tension: price resilience vs buyer capacity"
        };
    }
    if (normalizedLabel.includes("office market stress")) {
        return {
            pattern: "Office demand is still being tested by vacancy, rent, and tenant-cost pressure.",
            tension: "Tension: supply overhang vs usable demand"
        };
    }
    if (normalizedLabel.includes("residential permit weakness")) {
        return {
            pattern: "Residential construction signals are softening where demand is not strong enough to support faster building.",
            tension: "Tension: build pipeline vs real demand"
        };
    }
    if (normalizedLabel.includes("housing finance support")) {
        return {
            pattern: "Policy support is moving through housing finance, but it has not erased affordability pressure.",
            tension: "Tension: credit support vs household capacity"
        };
    }
    if (normalizedLabel.includes("property stress")) {
        return {
            pattern: "Stress signals are showing up in vacancy, oversupply, or weaker absorption rather than in launch volume.",
            tension: "Tension: inventory vs demand"
        };
    }
    if (normalizedLabel.includes("affordability pressure")) {
        return {
            pattern: "The market is being shaped by who can still buy, rent, or absorb higher housing costs.",
            tension: "Tension: prices vs purchasing power"
        };
    }
    if (normalizedLabel.includes("supply pipeline shift")) {
        return {
            pattern: "Supply is becoming more uneven as construction, inventory, and geography matter more than headline expansion.",
            tension: "Tension: development pipeline vs market balance"
        };
    }
    if (normalizedLabel.includes("office supply positioning")) {
        return {
            pattern: "Developers are still adding office space, but new supply only matters if leasing and utilization can absorb it.",
            tension: "Tension: expansion pipeline vs tenant demand"
        };
    }
    if (normalizedLabel.includes("property credit conditions")) {
        return {
            pattern: "REIT scale and index ambitions are being used to support capital-market positioning more than to prove end-user demand.",
            tension: "Tension: capital-market ambition vs operating demand"
        };
    }
    if (normalizedLabel.includes("credit tightening")) {
        return {
            pattern: "Credit rules and lending behavior are moving toward stricter discipline.",
            tension: "Tension: loan growth vs borrower quality"
        };
    }
    if (normalizedLabel.includes("borrower risk")) {
        return {
            pattern: "Borrower stress is becoming more visible beneath still-active lending.",
            tension: "Tension: growth vs asset quality"
        };
    }
    if (normalizedLabel.includes("liquidity preservation")) {
        return {
            pattern: "Banks are prioritizing buffers and optionality over aggressive balance-sheet expansion.",
            tension: "Tension: liquidity vs growth"
        };
    }
    if (normalizedLabel.includes("deposit funding shift")) {
        return {
            pattern: "Deposit movement is making funding cost and liquidity management harder to ignore.",
            tension: "Tension: funding stability vs margin pressure"
        };
    }
    if (normalizedLabel.includes("fuel price easing")) {
        return {
            pattern: "Fuel prices are easing at the pump, but cost relief remains exposed to external swings.",
            tension: "Tension: short-term relief vs oil exposure"
        };
    }
    if (normalizedLabel.includes("energy price pressure")) {
        return {
            pattern: "Energy costs are still feeding into household and business pressure.",
            tension: "Tension: cost recovery vs affordability"
        };
    }
    if (normalizedLabel.includes("supply reliability risk")) {
        return {
            pattern: "Supply and reserve signals are keeping reliability risk close to the surface.",
            tension: "Tension: demand needs vs available supply"
        };
    }
    if (normalizedLabel.includes("grid capacity risk")) {
        return {
            pattern: "Grid and project execution are shaping how much capacity the system can actually use.",
            tension: "Tension: infrastructure ambition vs delivery"
        };
    }
    if (normalizedLabel.includes("policy cost shift")) {
        return {
            pattern: "Policy decisions are shifting how energy costs move through utilities, businesses, and households.",
            tension: "Tension: cost recovery vs public burden"
        };
    }
    if (normalizedLabel.includes("external energy shock")) {
        return {
            pattern: "External fuel shocks are passing through to local prices, supply planning, and operating costs.",
            tension: "Tension: global exposure vs local resilience"
        };
    }
    if (normalizedLabel.includes("demand pressure")) {
        return {
            pattern: "Demand is making supply, price, and reliability constraints harder to absorb.",
            tension: "Tension: consumption needs vs system capacity"
        };
    }
    if (normalizedLabel.includes("model capability race")) {
        return {
            pattern: "Model capability is advancing, but usefulness depends on access, reliability, and workflow fit.",
            tension: "Tension: capability vs adoption"
        };
    }
    if (normalizedLabel.includes("compute capacity strain")) {
        return {
            pattern: "Compute demand is turning infrastructure into a strategic constraint.",
            tension: "Tension: scaling ambition vs capacity"
        };
    }
    if (normalizedLabel.includes("enterprise adoption")) {
        return {
            pattern: "Enterprise positioning is getting pushed ahead of proven demand.",
            tension: "Tension: adoption vs proof"
        };
    }
    if (normalizedLabel.includes("industry repositioning")) {
        return {
            pattern: "Competitive repositioning is accelerating before market roles are settled.",
            tension: "Tension: competition vs readiness"
        };
    }
    if (normalizedLabel.includes("models and platform") ||
        normalizedLabel.includes("platform update")) {
        return {
            pattern: "Platform expansion is outrunning stable operating models.",
            tension: "Tension: momentum vs operating reality"
        };
    }
    if (normalizedLabel.includes("policy and governance")) {
        return {
            pattern: "Policy is moving faster than operating clarity.",
            tension: "Tension: policy vs execution"
        };
    }
    if (normalizedLabel.includes("ai safety governance")) {
        return {
            pattern: "Safety commitments are turning into product and governance constraints.",
            tension: "Tension: capability vs safeguards"
        };
    }
    if (normalizedLabel.includes("supply chain")) {
        return {
            pattern: "Supply constraints are starting to show through the growth narrative.",
            tension: "Tension: growth narrative vs operating strain"
        };
    }
    if (normalizedLabel.includes("capital caution")) {
        return {
            pattern: "Pricing and investment claims are running ahead of stable proof of demand.",
            tension: "Tension: investment vs demand"
        };
    }
    if (normalizedLabel.includes("connectivity buildout")) {
        return {
            pattern: "Connectivity expansion is changing access, coverage, and the geography of digital services.",
            tension: "Tension: network ambition vs useful access"
        };
    }
    if (normalizedLabel.includes("cybersecurity")) {
        return {
            pattern: "Cyber risk is moving from a technical concern into an operating and trust problem.",
            tension: "Tension: digital dependence vs resilience"
        };
    }
    if (normalizedLabel.includes("data centers") || normalizedLabel.includes("cloud capacity")) {
        return {
            pattern: "Digital infrastructure demand is turning capacity, power, and location into strategic constraints.",
            tension: "Tension: digital growth vs infrastructure readiness"
        };
    }
    if (normalizedLabel.includes("consumer technology")) {
        return {
            pattern: "Consumer technology signals matter where they reveal adoption, market share, or ecosystem direction.",
            tension: "Tension: product novelty vs behavior change"
        };
    }
    if (normalizedLabel.includes("critical infrastructure cyber risk")) {
        return {
            pattern: "Critical infrastructure risk is becoming harder to separate from day-to-day operations.",
            tension: "Tension: digital dependence vs system resilience"
        };
    }
    if (normalizedLabel.includes("ai policy signaling")) {
        return {
            pattern: "Policy positioning is becoming part of platform strategy rather than a side conversation.",
            tension: "Tension: influence vs operating clarity"
        };
    }
    if (normalizedLabel.includes("public infrastructure strain")) {
        return {
            pattern: "Public systems are showing how thin operating capacity can get under stress.",
            tension: "Tension: system dependence vs institutional capacity"
        };
    }
    if (normalizedLabel.includes("infrastructure execution")) {
        return {
            pattern: "Infrastructure is scaling faster than coordination.",
            tension: "Tension: ambition vs capacity"
        };
    }
    return inferPatternAndTension(reasonCodes, angles);
}
function buildEditorialWhyLine(reasonCodes, angles, reasonKept) {
    const joinedAngles = angles.join(" | ").toLowerCase();
    const joinedReasons = reasonCodes.join(" | ").toLowerCase();
    if (joinedAngles.includes("infrastructure lag") ||
        joinedAngles.includes("execution gap") ||
        joinedReasons.includes("execution_consequence")) {
        return "Multiple players are adding capability faster than they can secure capacity, coordination, or deployment discipline.";
    }
    if (joinedAngles.includes("policy pressure") ||
        joinedAngles.includes("regulation moving") ||
        joinedReasons.includes("policy_regulatory_move")) {
        return "Regulatory and governance pressure is starting to shape rollout decisions before operating rules are fully settled.";
    }
    if (joinedAngles.includes("enterprise adoption") ||
        joinedAngles.includes("demand still unproven") ||
        joinedReasons.includes("market_signal")) {
        return "Vendors are pushing enterprise positioning before usage patterns, ROI, and buyer confidence have fully stabilized.";
    }
    if (joinedAngles.includes("competitive position") ||
        joinedReasons.includes("industry_repositioning")) {
        return "Companies are repositioning quickly around control of distribution, developer workflow, and enterprise share.";
    }
    if (joinedAngles.includes("model competition") ||
        joinedAngles.includes("developer workflow changing")) {
        return "Product and platform moves are starting to matter less as launches and more as battles over who controls the workflow.";
    }
    const reasonLine = reasonLineForReasonCode(reasonCodes[0]);
    if (reasonLine) {
        return reasonLine;
    }
    if (angles.length > 0) {
        if (angles[0].includes("infrastructure")) {
            return "Multiple players are adding capability faster than they can stabilize the operating layer.";
        }
        if (angles[0].includes("policy")) {
            return "The policy story is now shaping operating decisions rather than sitting off to the side.";
        }
        if (angles[0].includes("adoption") || angles[0].includes("demand")) {
            return "Vendors are pushing enterprise positioning before usage patterns and returns are fully settled.";
        }
        if (angles[0].includes("competitive")) {
            return "Competitive moves are arriving faster than the market has agreed on durable winners.";
        }
        if (angles[0].includes("supply")) {
            return "Capacity pressure is starting to surface in stories that were previously framed as growth stories.";
        }
    }
    if (reasonKept.some((reason) => reason.toLowerCase().includes("pattern now appearing"))) {
        return "More than one item now points in the same direction, which makes this worth treating as a live editorial thread.";
    }
    if (reasonKept.some((reason) => reason.toLowerCase().includes("policy move"))) {
        return "Policy movement is carrying visible downstream business consequences.";
    }
    return "Taken together, these items carry more editorial weight than any single story would on its own.";
}
function buildEditorialWhyLineForLabel(label, reasonCodes, angles, reasonKept) {
    const normalizedLabel = normalizeText(label);
    if (normalizedLabel.includes("pricing pressure")) {
        return "Price cuts, fuel swings, and SRP signals are turning affordability into the central motoring story.";
    }
    if (normalizedLabel.includes("ownership cost")) {
        return "The useful signal is not just what vehicles cost to buy, but what they cost to keep, fuel, register, and use.";
    }
    if (normalizedLabel.includes("ev transition")) {
        return "EV and hybrid momentum matters only if charging access, pricing, and everyday use can catch up.";
    }
    if (normalizedLabel.includes("infrastructure constraint")) {
        return "Road, charging, and mobility capacity are shaping what the market can actually absorb.";
    }
    if (normalizedLabel.includes("regulation and enforcement")) {
        return "Policy only changes driver and operator behavior when enforcement becomes visible and consistent.";
    }
    if (normalizedLabel.includes("supply and availability")) {
        return "Availability and inventory are becoming practical constraints on what buyers can choose and what dealers can push.";
    }
    if (normalizedLabel.includes("consumer demand shift")) {
        return "These stories show where manufacturers think Filipino buyers will compromise, stretch, or walk away.";
    }
    if (normalizedLabel.includes("motoring market signal")) {
        return "Early signal of where buyer interest, product strategy, and affordability may be moving next.";
    }
    if (normalizedLabel.includes("enterprise adoption")) {
        return "Enterprise rollout is getting pushed into the market before demand, ROI, and operating confidence have fully settled.";
    }
    if (normalizedLabel.includes("price growth slowdown")) {
        return "Slower property-price growth changes the read on demand, affordability, and pricing power.";
    }
    if (normalizedLabel.includes("office market stress")) {
        return "Office stress matters because vacancy, rents, and leasing behavior reveal real utilization, not promotional demand.";
    }
    if (normalizedLabel.includes("residential permit weakness")) {
        return "Permit weakness gives an early read on whether developers and buyers are pulling back from the residential pipeline.";
    }
    if (normalizedLabel.includes("housing finance support")) {
        return "Housing finance support matters only if it improves access enough to offset affordability pressure.";
    }
    if (normalizedLabel.includes("property stress")) {
        return "Vacancy, oversupply, and weak absorption are harder property signals than launch activity.";
    }
    if (normalizedLabel.includes("affordability pressure")) {
        return "Affordability pressure determines who can still buy or rent, and where demand starts to break.";
    }
    if (normalizedLabel.includes("supply pipeline shift")) {
        return "Pipeline shifts matter because new supply can worsen imbalance if demand is not keeping up.";
    }
    if (normalizedLabel.includes("office supply positioning")) {
        return "New office supply is a market signal only if leasing, occupancy, and tenant demand can validate the developer expansion story.";
    }
    if (normalizedLabel.includes("property credit conditions")) {
        return "REIT and index-positioning stories matter as capital-market signals, but they do not by themselves confirm healthier property utilization.";
    }
    if (normalizedLabel.includes("credit tightening")) {
        return "Credit discipline changes how much risk banks are willing to carry and which borrowers can still access loans.";
    }
    if (normalizedLabel.includes("borrower risk")) {
        return "Borrower stress matters because loan growth is less useful if asset quality is weakening underneath it.";
    }
    if (normalizedLabel.includes("liquidity preservation")) {
        return "Liquidity management shapes whether banks stretch for growth or protect balance-sheet buffers.";
    }
    if (normalizedLabel.includes("deposit funding shift")) {
        return "Deposit movement can change funding costs, margins, and competitive pressure across banks.";
    }
    if (normalizedLabel.includes("fuel price easing")) {
        return "Pump-price relief matters because it quickly changes household transport costs and business operating pressure.";
    }
    if (normalizedLabel.includes("energy price pressure")) {
        return "Energy-price pressure feeds through to households, operators, and policy decisions.";
    }
    if (normalizedLabel.includes("supply reliability risk")) {
        return "Reliability risk matters when supply tightness can turn into outages, reserves pressure, or higher prices.";
    }
    if (normalizedLabel.includes("grid capacity risk")) {
        return "Grid and project execution determine whether new capacity can actually reach users.";
    }
    if (normalizedLabel.includes("policy cost shift")) {
        return "Policy decisions matter because they decide whether energy pressure lands on utilities, businesses, or consumers.";
    }
    if (normalizedLabel.includes("external energy shock")) {
        return "External shocks matter when they pass through to local prices, supply planning, or reliability risk.";
    }
    if (normalizedLabel.includes("demand pressure")) {
        return "Demand pressure can turn ordinary supply tightness into a price or reliability problem.";
    }
    if (normalizedLabel.includes("model capability race")) {
        return "Capability improvements matter when they change what users, developers, or enterprises can actually do.";
    }
    if (normalizedLabel.includes("compute capacity strain")) {
        return "Compute capacity is becoming one of the practical limits on AI scaling.";
    }
    if (normalizedLabel.includes("industry repositioning")) {
        return "These moves matter because they point to who is trying to lock up workflow, distribution, or strategic ground before the market settles.";
    }
    if (normalizedLabel.includes("models and platform") ||
        normalizedLabel.includes("platform update")) {
        return "Launches are increasingly carrying platform consequences, not just product novelty, because they shape where developers and users spend time.";
    }
    if (normalizedLabel.includes("policy and governance")) {
        return "Governance pressure is becoming operational, with real consequences for rollout, compliance, and product posture.";
    }
    if (normalizedLabel.includes("ai safety governance")) {
        return "Safety work is becoming part of product posture and governance discipline rather than a separate reputational add-on.";
    }
    if (normalizedLabel.includes("supply chain")) {
        return "The growth story is now colliding with harder constraints in components, shipping, and delivery timelines.";
    }
    if (normalizedLabel.includes("capital caution")) {
        return "Funding and pricing claims are worth tracking because they reveal where AI demand still looks less settled than the narrative suggests.";
    }
    if (normalizedLabel.includes("connectivity buildout")) {
        return "Connectivity buildout matters when it changes who can participate in digital services, where firms can operate, and what public services can reach.";
    }
    if (normalizedLabel.includes("cybersecurity")) {
        return "Cybersecurity matters because incidents and resilience rules can change operating risk, trust, compliance, and public-service continuity.";
    }
    if (normalizedLabel.includes("data centers") || normalizedLabel.includes("cloud capacity")) {
        return "Data-center and cloud capacity matter because they set practical limits on deployment, cost, resilience, and energy demand.";
    }
    if (normalizedLabel.includes("consumer technology")) {
        return "Consumer technology is editorially useful when it shows behavior, adoption, or market share moving rather than just another device launch.";
    }
    if (normalizedLabel.includes("critical infrastructure cyber risk")) {
        return "Cyber and infrastructure risk is starting to look like an operating problem, not just a security sidebar.";
    }
    if (normalizedLabel.includes("ai policy signaling")) {
        return "Policy signaling matters when companies start trying to shape the operating environment, not just react to it.";
    }
    if (normalizedLabel.includes("public infrastructure strain")) {
        return "These stories matter because they show how fragile operating systems can become before policymakers or operators catch up.";
    }
    return buildEditorialWhyLine(reasonCodes, angles, reasonKept);
}
function pickSupportingStories(stories, limit) {
    return [...stories]
        .sort((left, right) => {
        const developmentDelta = (0, technology_source_priority_js_1.technologyDevelopmentPreferenceScore)(right) -
            (0, technology_source_priority_js_1.technologyDevelopmentPreferenceScore)(left);
        if (developmentDelta !== 0) {
            return developmentDelta;
        }
        const priorityDelta = (right.priority_score ?? 0) - (left.priority_score ?? 0);
        if (priorityDelta !== 0) {
            return priorityDelta;
        }
        return right.date.localeCompare(left.date);
    })
        .slice(0, limit);
}
function labelLooksLikeRawTitle(label) {
    const normalized = sanitizeText(label);
    return (/^(introducing|announcing|openai|meta|google|microsoft|nvidia)\b/i.test(normalized) ||
        normalized.split(" ").length >= 5);
}
function deriveEditorialLabel(fallbackLabel, reasonCodes, angles, stories) {
    const text = normalizeText(`${fallbackLabel} ${stories.map((story) => `${story.title} ${story.summary ?? ""}`).join(" ")}`);
    if (stories.some((story) => story.beat === "philippine_motoring")) {
        if (text.includes("price") ||
            text.includes("pricing") ||
            text.includes("srp") ||
            text.includes("fuel") ||
            angles.some((angle) => angle.includes("pricing") || angle.includes("cost"))) {
            return "pricing pressure";
        }
        if (text.includes("ev") ||
            text.includes("hybrid") ||
            text.includes("charging") ||
            text.includes("electrified") ||
            angles.some((angle) => angle.includes("EV transition"))) {
            return "EV transition gap";
        }
        if (text.includes("lto") ||
            text.includes("dotr") ||
            text.includes("regulation") ||
            text.includes("enforcement") ||
            reasonCodes.includes("policy_regulatory_move")) {
            return "regulation and enforcement";
        }
        if (text.includes("road") ||
            text.includes("toll") ||
            text.includes("traffic") ||
            text.includes("infrastructure")) {
            return "infrastructure constraint";
        }
        if (text.includes("supply") || text.includes("inventory") || text.includes("availability")) {
            return "supply and availability";
        }
        if (text.includes("segment") ||
            text.includes("demand") ||
            text.includes("buyers") ||
            text.includes("market")) {
            return "consumer demand shift";
        }
    }
    if (text.includes("acquire") ||
        text.includes("acquisition") ||
        text.includes("merger")) {
        return "industry repositioning";
    }
    if (text.includes("gpu") ||
        text.includes("compute") ||
        text.includes("inference") ||
        text.includes("capacity") ||
        angles.some((angle) => angle.includes("infrastructure") || angle.includes("execution"))) {
        return "infrastructure execution gap";
    }
    if (text.includes("enterprise") ||
        text.includes("adoption") ||
        text.includes("pricing") ||
        text.includes("workflow") ||
        angles.some((angle) => angle.includes("adoption") || angle.includes("demand"))) {
        return "enterprise adoption";
    }
    if (text.includes("model") ||
        text.includes("api") ||
        text.includes("chatgpt") ||
        text.includes("gemini") ||
        text.includes("launch") ||
        text.includes("release")) {
        return "models and platform releases";
    }
    if (text.includes("latest ai news") ||
        text.includes("live updates") ||
        text.includes("monthly roundup")) {
        return "platform update cadence";
    }
    if (text.includes("wearable") ||
        text.includes("ipod shuffle") ||
        text.includes("consumer ai device")) {
        return "consumer AI device experimentation";
    }
    if (text.includes("google vids") ||
        text.includes("share videos at no cost") ||
        text.includes("bundling")) {
        return "platform bundling pressure";
    }
    if (text.includes("economic proposals") ||
        text.includes("economic proposal") ||
        text.includes("dc thinks")) {
        return "AI policy signaling";
    }
    if (text.includes("media") ||
        text.includes("journalism") ||
        text.includes("politics") ||
        text.includes("democracy now")) {
        return "media and platform politics";
    }
    if (text.includes("child safety") ||
        text.includes("safety blueprint") ||
        text.includes("governance") ||
        angles.some((angle) => angle.includes("safety"))) {
        return "AI safety governance";
    }
    if (text.includes("hacker") ||
        text.includes("hackers") ||
        text.includes("critical infrastructure") ||
        text.includes("energy and water")) {
        return "critical infrastructure cyber risk";
    }
    if (text.includes("emergency system") ||
        text.includes("hanging by a thread") ||
        text.includes("public services")) {
        return "public infrastructure strain";
    }
    if (text.includes("gtc") ||
        text.includes("physical ai") ||
        text.includes("omniverse")) {
        return "physical AI and industrial push";
    }
    if (text.includes("policy") ||
        text.includes("regulation") ||
        text.includes("court") ||
        text.includes("compliance") ||
        reasonCodes.includes("policy_regulatory_move")) {
        return "policy and governance pressure";
    }
    if (text.includes("supply") ||
        text.includes("shortage") ||
        text.includes("shipping")) {
        return "supply chain strain";
    }
    if (text.includes("investment") ||
        text.includes("valuation") ||
        text.includes("pricing pressure")) {
        return "capital caution";
    }
    return sanitizeText(fallbackLabel);
}
function fallbackEditorialLabel(story) {
    const text = normalizeText(`${story.title} ${story.summary ?? ""} ${story.tags.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`);
    if (story.beat === "philippine_motoring") {
        if (text.includes("price") || text.includes("pricing") || text.includes("srp") || text.includes("fuel")) {
            return "pricing pressure";
        }
        if (text.includes("ev") || text.includes("hybrid") || text.includes("charging") || text.includes("battery")) {
            return "EV transition gap";
        }
        if (text.includes("lto") || text.includes("dotr") || text.includes("regulation") || text.includes("enforcement")) {
            return "regulation and enforcement";
        }
        if (text.includes("road") || text.includes("toll") || text.includes("traffic") || text.includes("infrastructure")) {
            return "infrastructure constraint";
        }
        if (text.includes("supply") || text.includes("inventory") || text.includes("availability")) {
            return "supply and availability";
        }
        if (text.includes("segment") || text.includes("demand") || text.includes("buyers") || text.includes("market")) {
            return "consumer demand shift";
        }
        return "motoring market signal";
    }
    if (text.includes("media") || text.includes("journalism") || text.includes("politics")) {
        return "media and platform politics";
    }
    if (text.includes("device") || text.includes("wearable") || text.includes("consumer")) {
        return "consumer AI device experimentation";
    }
    if (text.includes("video") || text.includes("workspace") || text.includes("bundling")) {
        return "platform bundling pressure";
    }
    if (text.includes("safety")) {
        return "AI safety governance";
    }
    if (text.includes("supply") || text.includes("shipping") || text.includes("infrastructure")) {
        return "supply chain strain";
    }
    return "emerging AI signal";
}
function isWeakReason(reason) {
    if (!reason) {
        return true;
    }
    const normalized = reason.toLowerCase();
    return (normalized.includes("confirms a pattern") ||
        normalized.includes("passed_") ||
        normalized.includes("within_source_cap") ||
        normalized.includes("the pattern is") ||
        normalized.includes("a repeat pattern"));
}
function themeSanityScore(story, label, reasonCodes, angles) {
    const text = normalizeText(`${story.title} ${story.summary ?? ""} ${story.tags.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`);
    const labelText = normalizeText(label);
    const labelTokens = labelText.split(/\s+/).filter((token) => token.length > 3);
    const consumerMismatch = [
        "vacuum",
        "coupon",
        "promo",
        "discount",
        "deal",
        "headphones",
        "laptop",
        "watch",
        "pizza oven"
    ].some((term) => text.includes(term));
    if (consumerMismatch) {
        return -10;
    }
    if (story.beat === "philippine_motoring" && !hasDirectMotoringHook(story)) {
        return -10;
    }
    let score = 0;
    if (story.theme_label && normalizeText(story.theme_label) === labelText) {
        score += 5;
    }
    if (labelTokens.some((token) => text.includes(token))) {
        score += 2;
    }
    if (reasonCodes.some((code) => code && story.reason_code === code) ||
        angles.some((angle) => story.angle_signals?.includes(angle))) {
        score += 2;
    }
    if (!isWeakReason(story.reason_kept[0])) {
        score += 1;
    }
    return score;
}
function hasDirectMotoringHook(story) {
    const factualText = normalizeText(`${story.title} ${story.summary ?? ""} ${story.tags.join(" ")}`);
    const nonMotoringBusinessTerms = [
        "gaming",
        "casino",
        "pagcor",
        "real estate",
        "bank",
        "banks",
        "insurance",
        "food price",
        "rice price",
        "stock",
        "psei"
    ];
    const directTerms = [
        "motor",
        "motoring",
        "vehicle",
        "vehicles",
        "car",
        "cars",
        "auto",
        "automotive",
        "motorcycle",
        "motorcycles",
        "rider",
        "driver",
        "drivers",
        "road",
        "traffic",
        "toll",
        "lto",
        "ltfrb",
        "dotr",
        "mmda",
        "license",
        "registration",
        "franchise",
        "puv",
        "puvs",
        "jeepney",
        "bus",
        "taxi",
        "grab",
        "move it",
        "fleet",
        "fleets",
        "operator",
        "operators",
        "transport",
        "mobility",
        "commuter",
        "commuters",
        "fare",
        "fares",
        "airport",
        "airline",
        "airlines",
        "dealership",
        "dealer",
        "after sales",
        "service center",
        "warranty",
        "charging",
        "charger",
        "electric vehicle",
        "hybrid",
        "phev",
        "suv",
        "pickup",
        "mpv"
    ];
    const fuelRetailTerms = ["gasoline", "diesel", "pump price", "fuel discount", "fuel savings"];
    const fuelRetailBrands = ["shell", "seaoil", "caltex", "petron"];
    if (directTerms.some((term) => factualText.includes(term))) {
        return true;
    }
    if (fuelRetailTerms.some((term) => factualText.includes(term)) &&
        !nonMotoringBusinessTerms.some((term) => factualText.includes(term))) {
        return true;
    }
    return fuelRetailBrands.some((term) => factualText.includes(term));
}
function motoringFactualText(story) {
    return normalizeText(`${story.title} ${story.summary ?? ""} ${story.tags.join(" ")}`);
}
function hasMotoringEvInfrastructureHook(story) {
    const text = motoringFactualText(story);
    const hasEvContext = text.includes("electric vehicle") ||
        text.includes("ev owner") ||
        text.includes("ev owners") ||
        text.includes("hybrid") ||
        text.includes("phev") ||
        text.includes("electrified") ||
        /\bev\b/.test(text) ||
        /\bevs\b/.test(text);
    const hasEvInfrastructure = text.includes("charging") ||
        text.includes("charger") ||
        text.includes("charge station") ||
        text.includes("owner support") ||
        text.includes("tech talk") ||
        text.includes("service center");
    return hasEvContext && hasEvInfrastructure;
}
function hasMotoringRoadInfrastructureHook(story) {
    const text = motoringFactualText(story);
    return textIncludesAny(text, [
        "traffic",
        "congestion",
        "jam",
        "jams",
        "road",
        "roads",
        "street",
        "streets",
        "toll",
        "road hazard",
        "public health",
        "travel time",
        "vehicle wear",
        "airport",
        "busway",
        "edsa",
        "c5"
    ]);
}
function motoringInfrastructureProfile(stories) {
    const uniqueStories = uniqueStoriesForDisplay(stories).filter(hasDirectMotoringHook);
    const roadCount = uniqueStories.filter(hasMotoringRoadInfrastructureHook).length;
    const evInfrastructureCount = uniqueStories.filter(hasMotoringEvInfrastructureHook).length;
    return {
        roadCount,
        evInfrastructureCount,
        roadDominant: roadCount > 0 && roadCount >= evInfrastructureCount,
        evInfrastructureDominant: evInfrastructureCount > 0 && evInfrastructureCount > roadCount
    };
}
function sectionUnique(items, limit) {
    const seen = new Set();
    const unique = [];
    for (const item of items) {
        if (seen.has(item.label)) {
            continue;
        }
        seen.add(item.label);
        unique.push(item);
        if (unique.length >= limit) {
            break;
        }
    }
    return unique;
}
function supportingReasonCandidates(story) {
    const primary = story.reason_kept[0] ?? "";
    const text = normalizeText(`${story.title} ${story.summary ?? ""} ${story.tags.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`);
    const normalizedPrimary = primary.toLowerCase();
    const candidates = [];
    if (story.beat === "philippine_motoring") {
        const factualText = motoringFactualText(story);
        const hasElectrifiedText = /\bev\b/.test(factualText) ||
            /\bevs\b/.test(factualText) ||
            factualText.includes("hybrid") ||
            factualText.includes("phev") ||
            factualText.includes("electrified") ||
            factualText.includes("electric vehicle");
        if (factualText.includes("honda ph reaches 12 million motorcycle") ||
            factualText.includes("12 million motorcycle") ||
            factualText.includes("12 million motorcycles")) {
            candidates.push("Anchors the demand read in basic motorcycle mobility at national scale.");
            candidates.push("Shows that practical two-wheel mobility is still carrying real market volume.");
        }
        if (factualText.includes("audi") ||
            factualText.includes("q9") ||
            factualText.includes("bmw") ||
            factualText.includes("7 series") ||
            factualText.includes("premium") ||
            factualText.includes("luxury")) {
            candidates.push("Shows the premium-aspiration side of the market split.");
            candidates.push("Tests how far high-end demand sits from the basic-mobility story.");
        }
        if (factualText.includes("viral crash") ||
            factualText.includes("arrested") ||
            factualText.includes("issued sco") ||
            factualText.includes("show cause order")) {
            candidates.push("Turns a road incident into a visible enforcement consequence.");
            candidates.push("Shows enforcement moving from complaint to actual sanction.");
        }
        if (text.includes("lto") ||
            text.includes("dotr") ||
            text.includes("enforcement") ||
            text.includes("registration") ||
            text.includes("regulation")) {
            candidates.push("Shows where road rules are starting to meet actual driver behavior.");
            candidates.push("Makes enforcement part of the motoring cost and discipline story.");
        }
        if (hasMotoringRoadInfrastructureHook(story)) {
            candidates.push("Keeps the read tied to daily travel time, road conditions, and vehicle use.");
            candidates.push("Shows how congestion or road hazards affect motorists beyond the purchase decision.");
        }
        if (factualText.includes("diesel") ||
            factualText.includes("gasoline") ||
            factualText.includes("fuel") ||
            factualText.includes("rollback") ||
            factualText.includes("shell") ||
            factualText.includes("seaoil") ||
            factualText.includes("caltex") ||
            factualText.includes("petron")) {
            if (!hasElectrifiedText) {
                candidates.push("Makes fuel-price pressure part of the buyer and operator story.");
                candidates.push("Shows how pump-price swings can quickly change household and fleet costs.");
            }
        }
        if (text.includes("price") ||
            text.includes("pricing") ||
            text.includes("srp") ||
            text.includes("priced") ||
            text.includes("starting price")) {
            candidates.push("Makes the affordability test visible, not just the launch claim.");
            candidates.push("Shows how brands are using price to keep buyers in the market.");
        }
        if (hasElectrifiedText) {
            candidates.push("Shows how electrified models are being pushed into a still-cost-sensitive market.");
            candidates.push("Keeps the EV transition tied to price, range, and everyday usability.");
        }
        if (hasMotoringEvInfrastructureHook(story)) {
            candidates.push("Makes the charging and infrastructure gap harder to avoid.");
            candidates.push("Shows where EV ambition still depends on practical access.");
        }
        if (factualText.includes("owner support") || factualText.includes("tech talk")) {
            candidates.push("Moves the EV read from model arrival to owner support and practical use.");
            candidates.push("Shows brands having to support EV owners after the purchase decision.");
        }
        if (text.includes("suv") ||
            text.includes("pickup") ||
            text.includes("mpv") ||
            text.includes("motorcycle") ||
            text.includes("segment")) {
            candidates.push("Shows which vehicle segments brands think Filipino buyers will still stretch for.");
            candidates.push("Turns a product story into a read on buyer appetite.");
        }
        if (text.includes("dti") ||
            text.includes("fiscal") ||
            text.includes("tax") ||
            text.includes("incentive") ||
            text.includes("carmaker")) {
            candidates.push("Connects policy support to what carmakers may actually bring to market.");
            candidates.push("Shows how government incentives could shape buyer choice and supply.");
        }
        if (text.includes("taxi") ||
            text.includes("fleet") ||
            text.includes("grab") ||
            text.includes("operators") ||
            factualText.includes("terminal fees") ||
            factualText.includes("puv")) {
            candidates.push("Shows how operating costs are changing the fleet and mobility equation.");
            candidates.push("Makes commercial usage a test case for broader adoption.");
        }
        if (factualText.includes("dealership") ||
            factualText.includes("dealer") ||
            factualText.includes("warranty") ||
            factualText.includes("service center") ||
            factualText.includes("after sales")) {
            candidates.push("Makes after-sales support part of the ownership-cost story.");
            candidates.push("Shows brands competing on the service layer after the vehicle is sold.");
        }
        if (text.includes("demand") || text.includes("buyers") || text.includes("market")) {
            candidates.push("Makes buyer demand easier to read through pricing and product choices.");
            candidates.push("Shows where market behavior is moving beyond launch-day noise.");
        }
        if (text.includes("launch") ||
            text.includes("launched") ||
            text.includes("unveils") ||
            text.includes("introduces") ||
            text.includes("makina")) {
            candidates.push("Early signal of where product demand may be shifting.");
            candidates.push("Shows what brands think cost-conscious buyers may still consider.");
        }
        if (candidates.length === 0) {
            candidates.push("Adds a concrete read on buyer behavior in the Philippine motoring market.");
            candidates.push("Useful signal on what cost-conscious buyers and operators may do next.");
        }
        return candidates;
    }
    if (story.beat === "property_real_estate") {
        if (text.includes("housing credit") ||
            text.includes("housing loan") ||
            text.includes("home financing") ||
            text.includes("mortgage") ||
            text.includes("pag-ibig") ||
            text.includes("rental housing")) {
            candidates.push("Shows how policy or credit support is trying to reach housing demand.");
            candidates.push("Adds financing context to the affordability story.");
        }
        if (text.includes("property price index") ||
            text.includes("residential real estate price index") ||
            text.includes("slowest increase") ||
            text.includes("price slowdown")) {
            candidates.push("Shows how pricing power is changing against buyer capacity.");
            candidates.push("Makes affordability and demand pressure visible through price movement.");
        }
        if (text.includes("vacancy") ||
            text.includes("office demand") ||
            (text.includes("office") && (text.includes("leasing") || text.includes("rent"))) ||
            text.includes("tenant demand")) {
            candidates.push("Shows real property utilization through vacancy, rents, or leasing demand.");
            candidates.push("Keeps the office read tied to occupancy and tenant behavior.");
        }
        if (text.includes("regional office expansion") ||
            text.includes("office expansion") ||
            text.includes("gross leasable space") ||
            text.includes("new buildings") ||
            text.includes("office portfolio")) {
            candidates.push(`Shows developer-side office supply positioning that still needs ${propertyUtilizationProof(story.id)}.`);
            candidates.push("Adds supply pipeline context without proving a demand recovery.");
        }
        if (text.includes("construction permits") ||
            text.includes("building permits") ||
            text.includes("weak residential demand") ||
            text.includes("residential construction")) {
            candidates.push("Shows whether the residential build pipeline is losing momentum.");
            candidates.push("Connects construction activity to actual demand rather than expansion claims.");
        }
        if (story.property_filter?.stress_signal) {
            candidates.push("Keeps stress, vacancy, oversupply, or weak absorption at the center of the property read.");
        }
        if (candidates.length === 0) {
            candidates.push("Adds a concrete read on Philippine property demand, supply, financing, or stress.");
        }
        return [...new Set(candidates)];
    }
    if (story.beat === "ph_sea_banking") {
        if (text.includes("bad loans") || text.includes("npl") || text.includes("risk") || text.includes("defaults")) {
            candidates.push("Shows where borrower stress is starting to matter for asset quality.");
        }
        if (text.includes("credit") || text.includes("lending") || text.includes("loan")) {
            candidates.push("Connects bank behavior to actual credit conditions.");
        }
        if (text.includes("liquidity") || text.includes("deposit") || text.includes("funding")) {
            candidates.push("Makes funding and liquidity pressure visible beyond headline earnings.");
        }
        if (text.includes("bsp") || text.includes("policy") || text.includes("regulation")) {
            candidates.push("Shows how policy can change lending behavior or risk appetite.");
        }
        if (candidates.length === 0) {
            candidates.push("Adds a concrete read on credit, liquidity, risk, or policy behavior.");
        }
        return [...new Set(candidates)];
    }
    if (story.beat === "ph_sea_energy") {
        if (text.includes("pump price") || text.includes("rollback") || text.includes("diesel") || text.includes("gasoline")) {
            candidates.push("Shows how fuel-price movement is feeding into household and operating costs.");
        }
        if (text.includes("grid") || text.includes("transmission") || text.includes("power plant") || text.includes("capacity")) {
            candidates.push("Makes the capacity and delivery constraint concrete.");
        }
        if (text.includes("supply") || text.includes("reserve") || text.includes("outage")) {
            candidates.push("Shows where supply conditions could become a reliability problem.");
        }
        if (text.includes("erc") || text.includes("doe") || text.includes("policy") || text.includes("tariff")) {
            candidates.push("Shows how policy decisions can shift who absorbs energy costs.");
        }
        if (candidates.length === 0) {
            candidates.push("Adds a concrete read on price, supply, reliability, or policy pressure.");
        }
        return [...new Set(candidates)];
    }
    const genericPrimary = normalizedPrimary.includes("high-impact policy move with likely downstream business effects") ||
        normalizedPrimary.includes("marks a real change in direction with likely downstream effects") ||
        normalizedPrimary.includes("reveals something concrete about demand, spending, or market confidence");
    if (!isWeakReason(primary) && !genericPrimary) {
        candidates.push(primary);
    }
    if (story.angle_signals?.some((angle) => angle.includes("cost pressure"))) {
        candidates.push("Makes the cost of scaling visible.");
        candidates.push("Shows where the economics start to tighten.");
    }
    if (story.angle_signals?.some((angle) => angle.includes("supply"))) {
        candidates.push("Shows where supply strain is starting to hit the story.");
        candidates.push("Makes the supply-side constraint harder to ignore.");
    }
    if (story.angle_signals?.some((angle) => angle.includes("competitive")) ||
        text.includes("acquire") ||
        text.includes("partnership")) {
        candidates.push("Shows who is trying to lock up position before the market settles.");
        candidates.push("Makes the strategic land grab more visible.");
    }
    if (story.angle_signals?.some((angle) => angle.includes("developer workflow")) ||
        text.includes("developer") ||
        text.includes("api")) {
        candidates.push("Shows where platform control is shifting into developer workflow.");
        candidates.push("Shows how the fight is moving into the tooling layer.");
    }
    if (story.angle_signals?.some((angle) => angle.includes("safety"))) {
        candidates.push("Shows how safety posture is becoming part of product strategy.");
        candidates.push("Makes the governance pitch part of the product story.");
    }
    if (story.reason_code === "execution_consequence") {
        candidates.push("Shows where strategy is running into real operating limits.");
        candidates.push("Makes the execution constraint concrete.");
    }
    if (story.reason_code === "policy_regulatory_move") {
        candidates.push("Shows where policy pressure is starting to change operating choices.");
        candidates.push("Shows how regulation is starting to shape the playbook.");
    }
    if (story.reason_code === "market_signal") {
        candidates.push("Makes the demand and pricing question harder to ignore.");
        candidates.push("Shows where the market signal is firmer than the narrative.");
    }
    if (story.reason_code === "industry_repositioning") {
        candidates.push("Clarifies the competitive move behind the headline.");
        candidates.push("Shows how the positioning play is taking shape.");
    }
    if (story.reason_code === "meaningful_shift") {
        candidates.push("Marks a genuine change in direction, not another routine release.");
        candidates.push("Shows that this is more than another incremental update.");
    }
    if (text.includes("pricing") || text.includes("teams") || text.includes("cost")) {
        candidates.push("Shows how vendors are adjusting price and packaging to pull users deeper in.");
        candidates.push("Makes the monetization push easier to see.");
    }
    if (text.includes("security") || text.includes("trust") || text.includes("safe")) {
        candidates.push("Shows how trust and safety claims are being used to support adoption.");
        candidates.push("Shows how vendors are turning safety into an adoption lever.");
    }
    if (text.includes("energy") || text.includes("grid")) {
        candidates.push("Shows the energy burden that comes with scaling AI systems.");
        candidates.push("Makes the power cost of expansion visible.");
    }
    if (story.angle_signals?.some((angle) => angle.includes("infrastructure"))) {
        candidates.push("Makes the infrastructure strain visible.");
        candidates.push("Shows where the build-out starts to drag on execution.");
    }
    if (story.angle_signals?.some((angle) => angle.includes("adoption")) ||
        text.includes("enterprise")) {
        candidates.push("Shows how vendors are trying to lock in enterprise trust before demand settles.");
        candidates.push("Shows how the enterprise pitch is arriving ahead of proof.");
    }
    if (story.angle_signals?.some((angle) => angle.includes("policy"))) {
        candidates.push("Makes the compliance pressure more concrete.");
        candidates.push("Shows the operating cost of policy pressure.");
    }
    if (text.includes("model") || text.includes("launch") || text.includes("release")) {
        candidates.push("Shows what the platform push looks like in practice.");
        candidates.push("Makes the launch strategy more concrete.");
    }
    candidates.push("Gives the theme a concrete operating example.");
    return [...new Set(candidates)];
}
function supportingReason(story, usedReasons) {
    const candidates = supportingReasonCandidates(story);
    if (!usedReasons) {
        return candidates[0];
    }
    for (const candidate of candidates) {
        const key = candidate.toLowerCase();
        if (usedReasons.has(key)) {
            continue;
        }
        usedReasons.add(key);
        return candidate;
    }
    const fallback = candidates[0];
    usedReasons.add(fallback.toLowerCase());
    return fallback;
}
function looksLikeRawThemeLabel(label) {
    if (!label) {
        return true;
    }
    const clean = sanitizeText(label);
    return labelLooksLikeRawTitle(clean) || /latest .* announced/i.test(clean);
}
function storyPresentationLabel(story) {
    const beatSpecificLabel = beatSpecificStoryLabel(story);
    if (beatSpecificLabel) {
        return beatSpecificLabel;
    }
    if (!looksLikeRawThemeLabel(story.theme_label)) {
        return sanitizeText(story.theme_label ?? story.title);
    }
    const derived = deriveEditorialLabel(story.theme_label ?? story.title, story.reason_code ? [story.reason_code] : [], story.angle_signals ?? [], [story]);
    if (looksLikeRawThemeLabel(derived)) {
        return fallbackEditorialLabel(story);
    }
    return derived;
}
function beatSpecificStoryLabel(story) {
    const text = normalizeText([
        story.title,
        story.summary ?? "",
        story.tags.join(" "),
        story.angle_signals?.join(" ") ?? "",
        story.property_filter?.materiality_signals.join(" ") ?? "",
        story.ai_tech_filter?.materiality_signals.join(" ") ?? "",
        story.energy_filter?.materiality_signals.join(" ") ?? ""
    ].join(" "));
    if (story.beat === "property_real_estate") {
        if (text.includes("property price index") ||
            text.includes("residential real estate price index") ||
            text.includes("slowest increase") ||
            text.includes("price slowdown") ||
            text.includes("prices soften")) {
            return "price growth slowdown";
        }
        if (text.includes("regional office expansion") ||
            text.includes("office expansion") ||
            text.includes("gross leasable space") ||
            text.includes("new buildings") ||
            text.includes("office portfolio")) {
            return "office supply positioning";
        }
        if (text.includes("office") &&
            (text.includes("vacancy") ||
                text.includes("leasing") ||
                text.includes("rent") ||
                text.includes("tenant demand") ||
                text.includes("office demand"))) {
            return "office market stress";
        }
        if (text.includes("construction permits") ||
            text.includes("building permits") ||
            text.includes("weak residential demand") ||
            text.includes("permit decline")) {
            return "residential permit weakness";
        }
        if (text.includes("housing credit") ||
            text.includes("housing loan") ||
            text.includes("home financing") ||
            text.includes("mortgage") ||
            text.includes("pag-ibig") ||
            text.includes("rental housing") ||
            text.includes("capital requirement")) {
            return "housing finance support";
        }
        switch (story.property_filter?.primary_axis) {
            case "stress_signals":
                return "property stress";
            case "demand_affordability":
                return "affordability pressure";
            case "supply_development":
                return "supply pipeline shift";
            case "capital_flows":
                return "property credit conditions";
            case "policy_regulation":
                return "housing policy pressure";
            case "usage_patterns":
                return "usage and occupancy shift";
            default:
                return "property market pressure";
        }
    }
    if (story.beat === "ph_sea_banking") {
        const signals = story.banking_signals;
        if (signals?.function.includes("risk") || text.includes("bad loans") || text.includes("npl")) {
            return "borrower risk";
        }
        if (signals?.direction.includes("tightening") || text.includes("credit tightening")) {
            return "credit tightening";
        }
        if (signals?.function.includes("liquidity")) {
            return "liquidity preservation";
        }
        if (signals?.function.includes("deposits") || signals?.function.includes("funding")) {
            return "deposit funding shift";
        }
        if (signals?.function.includes("regulation") || signals?.driver.includes("policy")) {
            return "banking policy pressure";
        }
        if (signals?.function.includes("lending")) {
            return "lending conditions";
        }
    }
    if (story.beat === "ph_sea_energy") {
        switch (story.energy_filter?.primary_category) {
            case "price":
                return text.includes("rollback") ? "fuel price easing" : "energy price pressure";
            case "supply":
                return "supply reliability risk";
            case "policy":
                return "policy cost shift";
            case "infrastructure":
                return "grid capacity risk";
            case "demand":
                return "demand pressure";
            case "external_forces":
                return "external energy shock";
            default:
                break;
        }
    }
    if (story.beat === "ai_tech") {
        switch (story.ai_tech_filter?.primary_axis) {
            case "ai_automation":
                return "AI and automation adoption";
            case "enterprise_technology":
                return "enterprise technology adoption";
            case "telecom_connectivity":
                return "connectivity buildout";
            case "cybersecurity":
                return "cybersecurity and resilience";
            case "digital_policy_regulation":
                return "digital policy pressure";
            case "data_centers_infrastructure":
                return "data center and cloud capacity";
            case "startups_vc":
                return "technology investment";
            case "consumer_technology":
                return "consumer technology shift";
            default:
                break;
        }
    }
    return null;
}
function buildStoryBriefItem(label, stories) {
    const uniqueStories = uniqueStoriesForDisplay(stories);
    const reasonCodes = topValues(uniqueStories.map((story) => story.reason_code ?? ""), 3);
    const angles = topValues(uniqueStories.flatMap((story) => story.angle_signals ?? []), 3);
    const reasonKept = uniqueStories.flatMap((story) => story.reason_kept ?? []);
    const patternAndTension = inferPatternAndTensionForLabel(label, reasonCodes, angles);
    const bankingFreshPattern = uniqueStories.some((story) => story.beat === "ph_sea_banking")
        ? bankingFreshPatternAndTension(label, uniqueStories)
        : null;
    const bankingFreshWhy = uniqueStories.some((story) => story.beat === "ph_sea_banking")
        ? bankingFreshWhyLine(label, uniqueStories)
        : null;
    const motoringFreshPattern = uniqueStories.some((story) => story.beat === "philippine_motoring")
        ? motoringFreshPatternAndTension(label, uniqueStories)
        : null;
    const motoringFreshWhy = uniqueStories.some((story) => story.beat === "philippine_motoring")
        ? motoringFreshWhyLine(label, uniqueStories)
        : null;
    const propertyFreshPattern = uniqueStories.some((story) => story.beat === "property_real_estate")
        ? propertyFreshPatternAndTension(label, uniqueStories)
        : null;
    const propertyFreshWhy = uniqueStories.some((story) => story.beat === "property_real_estate")
        ? propertyFreshWhyLine(label, uniqueStories)
        : null;
    const topPriority = Math.max(...uniqueStories.map((story) => story.priority_score ?? 0), 0);
    const propertyScoreBoost = uniqueStories.some((story) => story.property_filter?.stress_signal) ? 8 : 0;
    const normalizedLabel = normalizeText(label);
    const technologySystemBoost = uniqueStories.some((story) => story.beat === "ai_tech") &&
        (normalizedLabel.includes("connectivity") ||
            normalizedLabel.includes("cybersecurity") ||
            normalizedLabel.includes("digital policy") ||
            normalizedLabel.includes("data center") ||
            normalizedLabel.includes("cloud capacity") ||
            normalizedLabel.includes("consumer technology"))
        ? 8
        : 0;
    const vendorHeavyAiPenalty = uniqueStories.some((story) => story.beat === "ai_tech") &&
        (normalizedLabel.includes("ai and automation") || normalizedLabel.includes("enterprise technology")) &&
        uniqueStories.filter(technology_source_priority_js_1.isVendorAuthoredTechnologyStory).length > uniqueStories.length / 2
        ? 8
        : 0;
    const reportedDevelopmentBoost = uniqueStories.some((story) => (0, technology_source_priority_js_1.technologyDevelopmentPreferenceScore)(story) >= 6)
        ? 6
        : uniqueStories.some((story) => (0, technology_source_priority_js_1.technologyDevelopmentPreferenceScore)(story) >= 3)
            ? 3
            : 0;
    const hardSignalBoost = uniqueStories.some((story) => story.property_filter?.editorial_bucket === "core_signal" ||
        story.ai_tech_filter?.editorial_bucket === "core_signal" ||
        story.energy_filter?.importance_tier === "high" ||
        story.editorial_bucket === "urgent_important")
        ? 5
        : 0;
    const interpretationPenalty = uniqueStories.length > 0 &&
        uniqueStories.every((story) => story.property_filter?.editorial_bucket === "interpretation")
        ? 3
        : 0;
    const supportingStories = uniqueStories.some((story) => story.beat === "philippine_motoring")
        ? pickSupportingStories(uniqueStories.filter(hasDirectMotoringHook), 4)
        : pickSupportingStories(uniqueStories, 4);
    return {
        label,
        score: topPriority +
            averagePriority(uniqueStories) +
            Math.min(uniqueStories.length, 4) +
            propertyScoreBoost +
            technologySystemBoost +
            reportedDevelopmentBoost +
            hardSignalBoost -
            interpretationPenalty -
            vendorHeavyAiPenalty,
        whyItMatters: bankingFreshWhy ?? motoringFreshWhy ?? propertyFreshWhy ?? buildEditorialWhyLineForLabel(label, reasonCodes, angles, reasonKept),
        pattern: bankingFreshPattern?.pattern ?? motoringFreshPattern?.pattern ?? propertyFreshPattern?.pattern ?? patternAndTension.pattern,
        tension: bankingFreshPattern?.tension ?? motoringFreshPattern?.tension ?? propertyFreshPattern?.tension ?? patternAndTension.tension,
        supportingStories
    };
}
function uniqueStoriesForDisplay(stories) {
    const seen = new Set();
    const unique = [];
    for (const story of stories) {
        const key = story.url || story.id || normalizeText(story.title);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        unique.push(story);
    }
    return unique;
}
function buildStoryBriefItems(stories) {
    const grouped = new Map();
    for (const story of stories) {
        const label = storyPresentationLabel(story);
        const current = grouped.get(label) ?? [];
        current.push(story);
        grouped.set(label, current);
    }
    return [...grouped.entries()]
        .map(([label, group]) => buildStoryBriefItem(label, group))
        .sort((left, right) => right.score - left.score);
}
function buildThemeBriefItem(themeCluster, storyMap) {
    const stories = themeCluster.story_ids
        .map((storyId) => storyMap.get(storyId))
        .filter((story) => Boolean(story));
    const supportingStories = themeCluster.top_story_refs.length > 0
        ? themeCluster.top_story_refs
            .map((storyId) => storyMap.get(storyId))
            .filter((story) => Boolean(story))
            .slice(0, 4)
        : pickSupportingStories(stories, 4);
    const dominantReasonCodes = themeCluster.dominant_reason_codes.length > 0
        ? themeCluster.dominant_reason_codes
        : topValues(stories.map((story) => story.reason_code ?? ""), 3);
    const dominantAngles = themeCluster.dominant_angle_signals.length > 0
        ? themeCluster.dominant_angle_signals
        : topValues(stories.flatMap((story) => story.angle_signals ?? []), 3);
    const label = looksLikeRawThemeLabel(themeCluster.theme_label)
        ? deriveEditorialLabel(themeCluster.theme_label, dominantReasonCodes, dominantAngles, stories)
        : sanitizeText(themeCluster.theme_label);
    const reasonKept = stories.flatMap((story) => story.reason_kept ?? []);
    const topPriority = Math.max(...stories.map((story) => story.priority_score ?? 0), 0);
    const score = topPriority + averagePriority(stories) + Math.min(themeCluster.story_count, 6);
    const filteredSupportingStories = supportingStories.filter((story) => themeSanityScore(story, label, dominantReasonCodes, dominantAngles) >= 1);
    const hasMotoringStories = stories.some((story) => story.beat === "philippine_motoring");
    const finalSupportingStories = filteredSupportingStories.length > 0
        ? filteredSupportingStories
        : hasMotoringStories
            ? pickSupportingStories(stories.filter(hasDirectMotoringHook), 2)
            : supportingStories.slice(0, 2);
    const patternAndTension = inferPatternAndTensionForLabel(label, dominantReasonCodes, dominantAngles);
    const bankingFreshPattern = stories.some((story) => story.beat === "ph_sea_banking")
        ? bankingFreshPatternAndTension(label, stories)
        : null;
    const bankingFreshWhy = stories.some((story) => story.beat === "ph_sea_banking")
        ? bankingFreshWhyLine(label, stories)
        : null;
    const motoringFreshPattern = stories.some((story) => story.beat === "philippine_motoring")
        ? motoringFreshPatternAndTension(label, stories)
        : null;
    const motoringFreshWhy = stories.some((story) => story.beat === "philippine_motoring")
        ? motoringFreshWhyLine(label, stories)
        : null;
    const propertyFreshPattern = stories.some((story) => story.beat === "property_real_estate")
        ? propertyFreshPatternAndTension(label, stories)
        : null;
    const propertyFreshWhy = stories.some((story) => story.beat === "property_real_estate")
        ? propertyFreshWhyLine(label, stories)
        : null;
    return {
        label,
        score,
        whyItMatters: bankingFreshWhy ?? motoringFreshWhy ?? propertyFreshWhy ?? buildEditorialWhyLineForLabel(label, dominantReasonCodes, dominantAngles, reasonKept),
        pattern: bankingFreshPattern?.pattern ?? motoringFreshPattern?.pattern ?? propertyFreshPattern?.pattern ?? patternAndTension.pattern,
        tension: bankingFreshPattern?.tension ?? motoringFreshPattern?.tension ?? propertyFreshPattern?.tension ?? patternAndTension.tension,
        supportingStories: finalSupportingStories
    };
}
function buildEventBriefItem(eventCluster, storyMap) {
    const stories = eventCluster.story_ids
        .map((storyId) => storyMap.get(storyId))
        .filter((story) => Boolean(story));
    const reasonCodes = topValues(stories.map((story) => story.reason_code ?? ""), 3);
    const angles = topValues(stories.flatMap((story) => story.angle_signals ?? []), 3);
    const reasonKept = stories.flatMap((story) => story.reason_kept ?? []);
    const label = labelLooksLikeRawTitle(eventCluster.event_label)
        ? deriveEditorialLabel(eventCluster.event_label, reasonCodes, angles, stories)
        : sanitizeText(eventCluster.event_label);
    const score = eventCluster.priority_score +
        averagePriority(stories) +
        Math.min(eventCluster.story_count, 4);
    const patternAndTension = inferPatternAndTensionForLabel(label, reasonCodes, angles);
    const bankingFreshPattern = stories.some((story) => story.beat === "ph_sea_banking")
        ? bankingFreshPatternAndTension(label, stories)
        : null;
    const bankingFreshWhy = stories.some((story) => story.beat === "ph_sea_banking")
        ? bankingFreshWhyLine(label, stories)
        : null;
    const motoringFreshPattern = stories.some((story) => story.beat === "philippine_motoring")
        ? motoringFreshPatternAndTension(label, stories)
        : null;
    const motoringFreshWhy = stories.some((story) => story.beat === "philippine_motoring")
        ? motoringFreshWhyLine(label, stories)
        : null;
    const propertyFreshPattern = stories.some((story) => story.beat === "property_real_estate")
        ? propertyFreshPatternAndTension(label, stories)
        : null;
    const propertyFreshWhy = stories.some((story) => story.beat === "property_real_estate")
        ? propertyFreshWhyLine(label, stories)
        : null;
    const supportingStories = pickSupportingStories(stories, 3).filter((story) => themeSanityScore(story, label, reasonCodes, angles) >= 1);
    return {
        label,
        score,
        whyItMatters: bankingFreshWhy ?? motoringFreshWhy ?? propertyFreshWhy ?? buildEditorialWhyLineForLabel(label, reasonCodes, angles, reasonKept),
        pattern: bankingFreshPattern?.pattern ?? motoringFreshPattern?.pattern ?? propertyFreshPattern?.pattern ?? patternAndTension.pattern,
        tension: bankingFreshPattern?.tension ?? motoringFreshPattern?.tension ?? propertyFreshPattern?.tension ?? patternAndTension.tension,
        supportingStories: supportingStories.length > 0 ? supportingStories : stories.slice(0, 1)
    };
}
function buildWatchlistItems(stories, usedStoryIds, blockedLabels) {
    const seenLabels = new Set();
    return stories
        .filter((story) => !usedStoryIds.has(story.id))
        .filter((story) => (story.priority_score ?? 0) >= 24)
        .filter((story) => story.editorial_bucket !== "urgent_important")
        .sort((left, right) => (right.priority_score ?? 0) - (left.priority_score ?? 0))
        .filter((story) => {
        const label = storyPresentationLabel(story);
        if (seenLabels.has(label) || blockedLabels.has(label)) {
            return false;
        }
        if (themeSanityScore(story, label, story.reason_code ? [story.reason_code] : [], story.angle_signals ?? []) < 1) {
            return false;
        }
        seenLabels.add(label);
        return true;
    })
        .slice(0, 5)
        .map((story) => {
        const angles = story.angle_signals ?? [];
        const reasonCodes = story.reason_code ? [story.reason_code] : [];
        const label = storyPresentationLabel(story);
        const patternAndTension = inferPatternAndTensionForLabel(label, reasonCodes, angles);
        const bankingFreshPattern = story.beat === "ph_sea_banking"
            ? bankingFreshPatternAndTension(label, [story])
            : null;
        const bankingFreshWhy = story.beat === "ph_sea_banking"
            ? bankingFreshWhyLine(label, [story])
            : null;
        const motoringFreshPattern = story.beat === "philippine_motoring"
            ? motoringFreshPatternAndTension(label, [story])
            : null;
        const motoringFreshWhy = story.beat === "philippine_motoring"
            ? motoringFreshWhyLine(label, [story])
            : null;
        const propertyFreshPattern = story.beat === "property_real_estate"
            ? propertyFreshPatternAndTension(label, [story])
            : null;
        const propertyFreshWhy = story.beat === "property_real_estate"
            ? propertyFreshWhyLine(label, [story])
            : null;
        return {
            label,
            score: story.priority_score ?? 0,
            whyItMatters: bankingFreshWhy ?? motoringFreshWhy ?? propertyFreshWhy ?? buildEditorialWhyLineForLabel(label, reasonCodes, angles, story.reason_kept),
            pattern: bankingFreshPattern?.pattern ?? motoringFreshPattern?.pattern ?? propertyFreshPattern?.pattern ?? patternAndTension.pattern,
            tension: bankingFreshPattern?.tension ?? motoringFreshPattern?.tension ?? propertyFreshPattern?.tension ?? patternAndTension.tension,
            supportingStories: [story]
        };
    });
}
function renderSupportingStory(lines, story, usedReasons) {
    lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${story.source} | ${supportingReason(story, usedReasons)}`);
}
function renderBriefSection(lines, title, items, introLabel) {
    if (items.length === 0) {
        return;
    }
    lines.push(`## ${title}`);
    lines.push("");
    for (const item of items) {
        const usedReasons = new Set();
        lines.push(`### ${item.label}`);
        lines.push(`- ${introLabel}: ${item.whyItMatters}`);
        lines.push(`- Pattern: ${item.pattern}`);
        lines.push(`- ${item.tension}`);
        lines.push(`- Supporting stories:`);
        for (const story of item.supportingStories) {
            renderSupportingStory(lines, story, usedReasons);
        }
        lines.push("");
    }
}
function renderWatchlistSection(lines, items) {
    if (items.length === 0) {
        return;
    }
    lines.push("## Watchlist");
    lines.push("");
    for (const item of items) {
        const singleStory = item.supportingStories.length === 1;
        if (singleStory) {
            const story = item.supportingStories[0];
            lines.push(`### Signal: ${item.label}`);
            lines.push(`- Why to watch: ${item.whyItMatters}`);
            lines.push(`- ${sanitizeText(story.title)} — ${story.source}`);
            lines.push(`- ${supportingReason(story)}`);
            lines.push("");
            continue;
        }
        const usedReasons = new Set();
        lines.push(`### ${item.label}`);
        lines.push(`- Why to watch: ${item.whyItMatters}`);
        lines.push(`- Pattern: ${item.pattern}`);
        lines.push(`- ${item.tension}`);
        lines.push(`- Supporting stories:`);
        for (const story of item.supportingStories) {
            renderSupportingStory(lines, story, usedReasons);
        }
        lines.push("");
    }
}
function aiTechStoryRef(story) {
    return {
        id: story.id,
        title: sanitizeText(story.title),
        source: story.source,
        url: story.url,
        primary_axis: story.ai_tech_filter?.primary_axis,
        editorial_bucket: story.ai_tech_filter?.editorial_bucket,
        geography: story.ai_tech_filter?.geography,
        importance_tier: story.ai_tech_filter?.importance_tier
    };
}
function buildAiTechEditorialOutput(stories) {
    if (!stories.every((story) => story.beat === "ai_tech")) {
        return undefined;
    }
    const sortedStories = [...stories].sort((left, right) => {
        const tierRank = (tier) => tier === "high" ? 2 : tier === "medium" ? 1 : 0;
        const tierDelta = tierRank(right.ai_tech_filter?.importance_tier) - tierRank(left.ai_tech_filter?.importance_tier);
        if (tierDelta !== 0) {
            return tierDelta;
        }
        return right.publishedAt.localeCompare(left.publishedAt);
    });
    return {
        core_signals: sortedStories
            .filter((story) => story.ai_tech_filter?.editorial_bucket === "core_signal")
            .map(aiTechStoryRef),
        interpretation_layer: sortedStories
            .filter((story) => story.ai_tech_filter?.editorial_bucket === "interpretation")
            .map(aiTechStoryRef),
        capability_watch: sortedStories
            .filter((story) => story.ai_tech_filter?.editorial_bucket === "capability_watch")
            .map(aiTechStoryRef)
    };
}
function propertyStoryRef(story) {
    return {
        id: story.id,
        title: sanitizeText(story.title),
        source: story.source,
        url: story.url,
        primary_axis: story.property_filter?.primary_axis,
        editorial_bucket: story.property_filter?.editorial_bucket,
        geography: story.property_filter?.geography,
        importance_tier: story.property_filter?.importance_tier,
        stress_signal: story.property_filter?.stress_signal
    };
}
const PROPERTY_PROMOTIONAL_TERMS = [
    "resilient",
    "resilience",
    "opportunity",
    "opportunities",
    "premium",
    "confidence",
    "growth corridor",
    "luxury",
    "world class",
    "world-class",
    "optimistic",
    "upbeat"
];
const PROPERTY_OPERATING_TERMS = [
    "vacancy",
    "occupancy",
    "rent",
    "rents",
    "rental",
    "leasing",
    "lease",
    "absorption",
    "inventory",
    "tenant demand",
    "tenant behavior",
    "take up",
    "take-up",
    "office stock",
    "new supply",
    "financing",
    "mortgage",
    "property price index",
    "residential real estate price index"
];
const PROPERTY_STRESS_TERMS = [
    "vacancy",
    "overhang",
    "oversupply",
    "weak absorption",
    "tempered demand",
    "tenant caution",
    "cost pressure",
    "affordability pressure",
    "soften",
    "slower",
    "decline"
];
const PROPERTY_EXTERNAL_PRESSURE_TERMS = [
    "middle east",
    "geopolitical",
    "rates",
    "interest rate",
    "inflation",
    "financing cost",
    "construction cost",
    "tenant caution",
    "economic headwinds",
    "volatility"
];
const PROPERTY_UTILIZATION_PROOF_VARIANTS = [
    "leasing follow-through",
    "occupancy validation",
    "tenant uptake",
    "absorption evidence",
    "actual space take-up",
    "leasing conversion",
    "tenant commitment signals"
];
const PROPERTY_OPERATING_DEMAND_VARIANTS = [
    "tenant-side demand picture",
    "real occupancy read",
    "underlying leasing demand",
    "practical utilization picture",
    "space absorption reality"
];
const PROPERTY_RECOVERY_CONFIRMATION_VARIANTS = [
    "demand-side validation",
    "hard leasing evidence",
    "occupancy improvement",
    "absorption improvement",
    "pricing stabilization",
    "sustained tenant return"
];
const PROPERTY_HOLDING_PATTERN_VARIANTS = [
    "stabilizing without proving a turn",
    "pausing rather than recovering",
    "showing resilience without a clean rebound",
    "avoiding further deterioration without confirming recovery",
    "remaining in a holding pattern"
];
function propertyPhraseVariant(variants, seed) {
    const normalized = normalizeText(seed);
    let hash = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
    }
    return variants[hash % variants.length];
}
function propertyUtilizationProof(seed) {
    return propertyPhraseVariant(PROPERTY_UTILIZATION_PROOF_VARIANTS, seed);
}
function propertyOperatingDemand(seed) {
    return propertyPhraseVariant(PROPERTY_OPERATING_DEMAND_VARIANTS, seed);
}
function propertyRecoveryConfirmation(seed) {
    return propertyPhraseVariant(PROPERTY_RECOVERY_CONFIRMATION_VARIANTS, seed);
}
function propertyHoldingPattern(seed) {
    return propertyPhraseVariant(PROPERTY_HOLDING_PATTERN_VARIANTS, seed);
}
function propertyInterpretationContext(stories) {
    const uniqueStories = uniqueStoriesForDisplay(stories);
    const sorted = [...uniqueStories].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
    const latestStory = sorted[0];
    const latestTime = latestStory
        ? new Date(latestStory.publishedAt || latestStory.date).getTime()
        : 0;
    const text = normalizeText(uniqueStories.map((story) => `${story.title} ${story.summary ?? ""} ${story.source} ${story.tags.join(" ")} ${story.reason_kept.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`).join(" "));
    const hasFreshHardSignal = uniqueStories.some((story) => {
        const storyTime = new Date(story.publishedAt || story.date).getTime();
        const daysOld = latestTime > 0 && !Number.isNaN(storyTime)
            ? Math.floor((latestTime - storyTime) / 86_400_000)
            : 999;
        const storyText = normalizeText(`${story.title} ${story.summary ?? ""}`);
        return daysOld <= 14 && textIncludesAny(storyText, PROPERTY_OPERATING_TERMS);
    });
    const hardRecoveryPatterns = [
        "vacancy rates easing",
        "vacancy rate easing",
        "vacancy declined",
        "vacancy fell",
        "occupancy improved",
        "occupancy rose",
        "leasing activity increased",
        "leasing activity rose",
        "take up increased",
        "take-up increased",
        "absorption improved",
        "rents stabilized",
        "rent stabilization",
        "inventory reduction",
        "absence of new office supply"
    ];
    const hardRecoveryConfirmations = hardRecoveryPatterns.filter((pattern) => text.includes(normalizeText(pattern))).length;
    const hasFreshRecoveryConfirmation = uniqueStories.some((story) => {
        const storyTime = new Date(story.publishedAt || story.date).getTime();
        const daysOld = latestTime > 0 && !Number.isNaN(storyTime)
            ? Math.floor((latestTime - storyTime) / 86_400_000)
            : 999;
        const storyText = normalizeText(`${story.title} ${story.summary ?? ""}`);
        return daysOld <= 14 && hardRecoveryPatterns.some((pattern) => storyText.includes(normalizeText(pattern)));
    });
    const hasPromotionalFraming = textIncludesAny(text, PROPERTY_PROMOTIONAL_TERMS);
    const hasVolatilityLanguage = textIncludesAny(text, ["volatility", "volatile", "headwinds", "crisis"]);
    const hasStressTerms = textIncludesAny(text, PROPERTY_STRESS_TERMS);
    const hasRecoveryLanguage = textIncludesAny(text, [
        "recovery",
        "recovering",
        "rebound",
        "turnaround",
        "resilient",
        "resilience",
        "improved",
        "easing"
    ]);
    return {
        text,
        latestStory,
        hasOffice: text.includes("office"),
        hasPromotionalFraming,
        hasOperatingTerms: textIncludesAny(text, PROPERTY_OPERATING_TERMS),
        hasStressTerms,
        hasConsultancyFraming: textIncludesAny(text, [
            "colliers",
            "santos knight frank",
            "cbre",
            "consultancy",
            "market report",
            "office report",
            "analyst"
        ]),
        hasExternalPressure: textIncludesAny(text, PROPERTY_EXTERNAL_PRESSURE_TERMS),
        hasRecoveryLanguage,
        hasVolatilityLanguage,
        hasFreshHardSignal,
        hasFreshRecoveryConfirmation,
        hasMostlyInterpretation: uniqueStories.length > 0 &&
            uniqueStories.filter((story) => story.property_filter?.editorial_bucket === "interpretation").length >=
                Math.ceil(uniqueStories.length / 2),
        hasFramingCollision: (hasPromotionalFraming && (hasVolatilityLanguage || hasStressTerms)) ||
            (text.includes("recovery") && (text.includes("weak absorption") || text.includes("tenant caution"))) ||
            (text.includes("confidence") && text.includes("tenant caution")) ||
            (text.includes("premium") && text.includes("affordability")),
        hardRecoveryConfirmations
    };
}
function propertyFreshWhyLine(label, stories) {
    const normalizedLabel = normalizeText(label);
    const context = propertyInterpretationContext(stories);
    const seed = `${label}:${stories.map((story) => story.id).join(":")}`;
    if (normalizedLabel.includes("office supply positioning")) {
        return `Developer expansion is the visible move, but the sharper property read is whether new gross leasable space can produce ${propertyUtilizationProof(`${seed}:why`)}.`;
    }
    if (normalizedLabel.includes("property credit conditions")) {
        return `REIT scale and possible index inclusion are capital-market positioning signals; they still need to be read separately from the ${propertyOperatingDemand(`${seed}:why`)}.`;
    }
    if (!context.hasOffice && !normalizedLabel.includes("property")) {
        return null;
    }
    if (normalizedLabel.includes("office market stress")) {
        if (context.hasPromotionalFraming && context.hasExternalPressure) {
            return `The resilience call matters because it arrives with external pressure still in the frame; that makes optimism something to test against ${propertyUtilizationProof(`${seed}:why`)}.`;
        }
        if (context.hasPromotionalFraming) {
            return `Office optimism is useful only where it is matched by ${propertyUtilizationProof(`${seed}:why`)}; vacancy, rents, and leasing behavior still carry the harder read.`;
        }
    }
    if (normalizedLabel.includes("supply pipeline shift")) {
        return `Supply additions matter because they can either validate demand or add to the overhang; the difference depends on ${propertyRecoveryConfirmation(seed)}.`;
    }
    if (context.hasFramingCollision) {
        return "The useful read is the gap between market framing and operating evidence: resilience and volatility are being used to describe the same property market.";
    }
    if (context.hasMostlyInterpretation && !context.hasFreshRecoveryConfirmation) {
        return `Standing reports and analyst calls can frame the market, but they do not move it without ${propertyRecoveryConfirmation(seed)}.`;
    }
    if (normalizedLabel.includes("property stress")) {
        return "Property stress matters here because promotional language can stay upbeat while vacancy, oversupply, and weak absorption keep doing the real diagnostic work.";
    }
    return null;
}
function propertyFreshPatternAndTension(label, stories) {
    const normalizedLabel = normalizeText(label);
    const context = propertyInterpretationContext(stories);
    const seed = `${label}:${stories.map((story) => story.id).join(":")}`;
    if (normalizedLabel.includes("office supply positioning")) {
        return {
            pattern: `The new office pipeline is being framed as expansion, but its demand read still has to come through ${propertyUtilizationProof(`${seed}:pattern`)}.`,
            tension: "Tension: developer expansion vs tenant absorption"
        };
    }
    if (normalizedLabel.includes("property credit conditions")) {
        return {
            pattern: `REIT growth is strengthening the capital-market story without settling the ${propertyOperatingDemand(`${seed}:pattern`)}.`,
            tension: "Tension: market-cap growth vs property utilization"
        };
    }
    if (normalizedLabel.includes("office market stress")) {
        if (context.hasPromotionalFraming && !context.hasFreshRecoveryConfirmation) {
            return {
                pattern: `The office market is ${propertyHoldingPattern(seed)}, which keeps the read closer to stabilization than recovery.`,
                tension: `Tension: resilience framing vs ${propertyUtilizationProof(`${seed}:tension`)}`
            };
        }
        if (context.hardRecoveryConfirmations < 2 && context.hasRecoveryLanguage) {
            return {
                pattern: `Recovery language is ahead of the ${propertyRecoveryConfirmation(seed)} visible in the cluster.`,
                tension: "Tension: recovery claim vs operating evidence"
            };
        }
    }
    if (context.hasFramingCollision) {
        return {
            pattern: "Consultancy framing is split between resilience and volatility while the operating read remains unresolved.",
            tension: "Tension: optimistic framing vs unresolved stress"
        };
    }
    if (context.hasMostlyInterpretation && !context.hasFreshHardSignal) {
        return {
            pattern: "The week is mostly framing and persistence, not a new market turn.",
            tension: "Tension: standing research vs fresh demand signal"
        };
    }
    return null;
}
function propertySummaryBullets(items, stories) {
    const context = propertyInterpretationContext(stories);
    const labels = items.map((item) => normalizeText(item.label));
    const seed = items.map((item) => item.label).join(":");
    const bullets = [];
    if (labels.some((label) => label.includes("office market stress"))) {
        if (context.hasPromotionalFraming && !context.hasFreshRecoveryConfirmation) {
            bullets.push(`The office market generated optimistic framing without enough ${propertyRecoveryConfirmation(seed)} to make it a recovery story.`);
        }
        else {
            bullets.push("The office read still turns on vacancy, rents, leasing, and tenant behavior.");
        }
    }
    if (context.hasFramingCollision) {
        bullets.push("Resilience and volatility are appearing in the same market frame, so the actual read sits between the two claims.");
    }
    if (context.hasConsultancyFraming && !context.hasFreshRecoveryConfirmation) {
        bullets.push(`No clear ${propertyRecoveryConfirmation(`${seed}:summary`)} broke through strongly enough to validate a turn.`);
    }
    if (bullets.length === 0 && context.hasMostlyInterpretation) {
        bullets.push("The story this week is persistence, not resolution.");
    }
    return [...new Set(bullets)];
}
function hasStoryText(story, keywords) {
    const text = `${story.title} ${story.summary ?? ""}`;
    return countKeywordHits(text, keywords) > 0;
}
function readHasAny(stories, keywords) {
    return stories.some((story) => hasStoryText(story, keywords));
}
function readHasTheme(themeClusters, keywords) {
    return themeClusters.some((theme) => countKeywordHits(`${theme.theme_label} ${theme.theme_summary ?? ""}`, keywords) > 0);
}
const BANKING_EVERGREEN_PHRASES = [
    "banks are prioritizing buffers and optionality",
    "deposit movement keeps funding cost",
    "borrower stress matters",
    "credit discipline changes",
    "liquidity management shapes",
    "risk is becoming harder to treat as background noise",
    "loan growth still matters"
];
function bankingFreshnessContext(stories) {
    const uniqueStories = uniqueStoriesForDisplay(stories);
    const sorted = [...uniqueStories].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
    const text = normalizeText(uniqueStories.map((story) => `${story.title} ${story.summary ?? ""}`).join(" "));
    const functions = new Set(uniqueStories.flatMap((story) => story.banking_signals?.function ?? []));
    const directions = new Set(uniqueStories.flatMap((story) => story.banking_signals?.direction ?? []));
    const drivers = new Set(uniqueStories.flatMap((story) => story.banking_signals?.driver ?? []));
    const latestStory = sorted[0];
    return {
        text,
        functions,
        directions,
        drivers,
        latestStory,
        latestTitle: latestStory ? sanitizeText(latestStory.title) : undefined,
        latestDate: latestStory ? formatDate(latestStory.publishedAt || latestStory.date) : undefined,
        hasRateMove: textIncludesAny(text, [
            "rate hike",
            "raises target rrp",
            "raises policy rate",
            "higher rates",
            "interest rate",
            "monetary board raises"
        ]) || directions.has("repricing"),
        hasExternalShock: textIncludesAny(text, [
            "war",
            "inflation spike",
            "external shock",
            "iran",
            "peso",
            "bop deficit",
            "remittance growth slowest"
        ]),
        hasPrivateBankStress: textIncludesAny(text, [
            "bdo",
            "bpi",
            "metrobank",
            "security bank",
            "expects loan growth",
            "asset quality hit"
        ]),
        hasRegionalRisk: textIncludesAny(text, [
            "asia pacific banks",
            "regional",
            "raise provisions",
            "credit risks"
        ]),
        hasDepositOrFunding: functions.has("deposits") ||
            functions.has("funding") ||
            textIncludesAny(text, ["deposit", "funding", "cost of funds", "funding support"]),
        hasRisk: functions.has("risk") ||
            textIncludesAny(text, ["bad loans", "npl", "credit risks", "provisions", "asset quality"]),
        hasGrowth: textIncludesAny(text, ["loan growth", "credit growth", "lending growth"]),
        hasPolicy: drivers.has("policy") ||
            functions.has("regulation") ||
            textIncludesAny(text, ["bsp", "monetary board", "policy", "regulator"]),
        hasTightening: directions.has("tightening") || textIncludesAny(text, ["higher rates", "tighter"]),
        hasPreserving: directions.has("preserving") || textIncludesAny(text, ["buffer", "buffers", "resilient"]),
        hasRepricing: directions.has("repricing") ||
            textIncludesAny(text, ["margin", "funding cost", "cost of funds", "deposit rate"])
    };
}
function bankingPressureDomain(context) {
    if (context.hasRisk && context.hasPrivateBankStress) {
        return "domestic credit stress";
    }
    if (context.hasRisk && context.hasRegionalRisk) {
        return "regional credit risk";
    }
    if (context.hasRisk) {
        return "domestic credit stress";
    }
    if (context.hasDepositOrFunding || context.hasRepricing) {
        return "funding cost";
    }
    if (context.hasPolicy || context.hasRateMove) {
        return "policy transmission";
    }
    return "bank behavior";
}
function bankingPressureDestination(context) {
    if (context.hasRisk && context.hasPrivateBankStress) {
        return "domestic credit quality";
    }
    if (context.hasRisk && context.hasRegionalRisk) {
        return "regional bank credit quality";
    }
    if (context.hasRisk) {
        return "domestic credit conditions";
    }
    if (context.hasDepositOrFunding || context.hasRepricing) {
        return "funding costs";
    }
    if (context.hasPolicy || context.hasRateMove) {
        return "bank operating choices";
    }
    return "bank behavior";
}
function freshenBankingLine(line, context) {
    const normalized = normalizeText(line);
    const isEvergreen = BANKING_EVERGREEN_PHRASES.some((phrase) => normalized.includes(normalizeText(phrase)));
    if (!isEvergreen) {
        return line;
    }
    if (context.hasRateMove && (context.hasDepositOrFunding || context.hasRisk)) {
        return `This week, the rate move changes the math on ${context.hasDepositOrFunding ? "funding costs" : "credit risk"}; the question now is where banks pass that pressure next.`;
    }
    if (context.hasExternalShock && context.hasRisk) {
        return "The external shock is no longer just macro background; it is moving into loan growth, provisions, and asset-quality expectations.";
    }
    if (context.hasDepositOrFunding) {
        return "What matters now is not deposit movement in the abstract, but whether it forces banks to pay up for funds or defend liquidity.";
    }
    if (context.hasRisk) {
        return "The risk signal matters now because it is showing up beside active lending, not after credit growth has already stopped.";
    }
    return line;
}
function bankingFreshWhyLine(label, stories) {
    const normalizedLabel = normalizeText(label);
    const context = bankingFreshnessContext(stories);
    if (context.hasRateMove && (context.hasDepositOrFunding || context.hasRisk || context.hasGrowth)) {
        return `This week, the rate move is the operating trigger; the question now is what it does to ${context.hasDepositOrFunding ? "funding costs" : context.hasRisk ? "asset quality" : "borrower appetite"}.`;
    }
    if (context.hasExternalShock && context.hasRisk) {
        return context.hasPrivateBankStress
            ? "When a major bank starts pricing war-driven inflation into loan growth and asset quality, the read moves from external shock to balance-sheet consequence."
            : "External pressure is migrating into credit risk, so the banking read is less about the shock itself than where provisions and borrower stress surface.";
    }
    if (normalizedLabel.includes("borrower risk")) {
        return "The useful shift is from lending momentum to repayment capacity: growth only holds its value if asset quality does not start absorbing the shock.";
    }
    if (normalizedLabel.includes("deposit funding shift")) {
        return "The funding question is moving from available liquidity to price: banks may still have funds, but the next read is what those funds cost.";
    }
    if (normalizedLabel.includes("liquidity preservation")) {
        return "Liquidity matters now because buffer language is starting to look like a response to pressure, not just routine prudence.";
    }
    if (normalizedLabel.includes("credit tightening") || normalizedLabel.includes("lending conditions")) {
        return "The read is shifting from whether banks can keep lending to which borrowers still clear the tighter math.";
    }
    if (normalizedLabel.includes("banking policy pressure")) {
        return "Policy is no longer just a signal from the center; the sharper question is how quickly it reaches credit appetite, deposit pricing, and risk controls.";
    }
    return null;
}
function bankingFreshPatternAndTension(label, stories) {
    const context = bankingFreshnessContext(stories);
    const normalizedLabel = normalizeText(label);
    const destination = bankingPressureDestination(context);
    if (context.hasExternalShock && context.hasRisk) {
        return {
            pattern: `Pressure is shifting from external shock to ${destination}.`,
            tension: "Tension: macro shock vs balance-sheet quality"
        };
    }
    if (context.hasRateMove && context.hasDepositOrFunding) {
        return {
            pattern: "The rate move is turning funding from a background condition into an operating cost question.",
            tension: "Tension: deposit defense vs margin protection"
        };
    }
    if (context.hasRateMove && context.hasGrowth) {
        return {
            pattern: "Loan growth is being tested against higher-rate borrower capacity.",
            tension: "Tension: growth target vs repayment capacity"
        };
    }
    if (normalizedLabel.includes("liquidity preservation")) {
        return {
            pattern: "Buffer-building is starting to read as pressure management rather than generic caution.",
            tension: "Tension: liquidity defense vs credit expansion"
        };
    }
    return null;
}
function bankingPhraseUse() {
    return {
        exact: new Set(),
        families: new Set(),
        openings: new Set()
    };
}
function bankingPhraseFamily(line) {
    const normalized = normalizeText(line);
    if (normalized.includes("policy is moving faster than operating clarity") ||
        normalized.includes("policy signal is clear") ||
        normalized.includes("policy is setting the direction") ||
        normalized.includes("policy signal now has to prove") ||
        normalized.includes("sharper question is how policy reaches") ||
        normalized.includes("rules and guidance matter")) {
        return "policy_operating_clarity";
    }
    if (normalized.includes("pressure is shifting") ||
        normalized.includes("pressure is migrating") ||
        normalized.includes("external pressure is starting") ||
        normalized.includes("external pressure is reaching") ||
        normalized.includes("stress is starting to show up") ||
        normalized.includes("what began as") ||
        normalized.includes("operating pressure is moving") ||
        normalized.includes("no longer only")) {
        return "pressure_migration";
    }
    if (normalized.includes("this week the rate move") ||
        normalized.includes("rate move landed") ||
        normalized.includes("rate move changes") ||
        normalized.includes("rate move is turning") ||
        normalized.includes("immediate issue is not the rate move") ||
        normalized.includes("after the rate move") ||
        normalized.includes("rate move s next test")) {
        return "rate_move_consequence";
    }
    if (normalized.includes("the read is shifting") ||
        normalized.includes("sharper read") ||
        normalized.includes("more useful signal") ||
        normalized.includes("useful signal is") ||
        normalized.includes("credit discipline is moving") ||
        normalized.includes("loan terms matter more") ||
        normalized.includes("question is no longer whether lending continues")) {
        return "credit_read_shift";
    }
    if (normalized.includes("buffer building") ||
        normalized.includes("buffer language") ||
        normalized.includes("pressure management")) {
        return "buffer_pressure";
    }
    return normalized.split(" ").slice(0, 7).join(" ");
}
function rememberBankingPhrase(line, used) {
    const clean = sanitizeText(line);
    const normalized = normalizeText(clean);
    const opening = normalized.split(" ").slice(0, 4).join(" ");
    if (!normalized) {
        return;
    }
    used.exact.add(normalized);
    used.families.add(bankingPhraseFamily(clean));
    if (opening) {
        used.openings.add(opening);
    }
}
function chooseBankingVariant(candidates, used) {
    const cleanCandidates = candidates.map(sanitizeText).filter(Boolean);
    for (const candidate of cleanCandidates) {
        const normalized = normalizeText(candidate);
        const family = bankingPhraseFamily(candidate);
        const opening = normalized.split(" ").slice(0, 4).join(" ");
        if (used.exact.has(normalized) ||
            used.families.has(family) ||
            (opening && used.openings.has(opening))) {
            continue;
        }
        rememberBankingPhrase(candidate, used);
        return candidate;
    }
    const fallback = cleanCandidates.find((candidate) => !used.exact.has(normalizeText(candidate)))
        ?? cleanCandidates[0]
        ?? "";
    rememberBankingPhrase(fallback, used);
    return fallback;
}
function bankingAlternateCandidates(line, label, stories, section) {
    const normalized = normalizeText(line);
    const normalizedLabel = normalizeText(label);
    const context = bankingFreshnessContext(stories);
    const destination = bankingPressureDestination(context);
    const source = context.hasExternalShock ? "the external shock" : "policy pressure";
    const sourceWithoutArticle = context.hasExternalShock ? "external shock" : "policy pressure";
    const costObject = context.hasDepositOrFunding
        ? "funding costs"
        : context.hasRisk
            ? "asset quality"
            : "borrower appetite";
    const costVerb = costObject.endsWith("s") ? "are" : "is";
    const costMatterLine = costObject === "funding costs"
        ? "Funding costs now matter because they affect bank appetite for risk and growth."
        : costObject === "asset quality"
            ? "Asset quality now matters because it affects bank appetite for risk and growth."
            : "Borrower appetite now matters because it affects how much credit demand survives higher rates.";
    if (bankingPhraseFamily(line) === "pressure_migration") {
        return section === "summary"
            ? [
                `The external shock is reaching ${destination}.`,
                `${destination.charAt(0).toUpperCase()}${destination.slice(1)} is now the transmission point.`,
                `This is showing up through ${destination}.`
            ]
            : [
                `External pressure is starting to show up in ${destination}.`,
                `What began as ${source} is now reaching ${destination}.`,
                `The operating pressure is moving toward ${destination}.`,
                `The risk is no longer only ${sourceWithoutArticle}; it is starting to reach ${destination}.`
            ];
    }
    if (bankingPhraseFamily(line) === "rate_move_consequence") {
        return section === "summary"
            ? [
                `${costObject.charAt(0).toUpperCase()}${costObject.slice(1)} ${costVerb} the rate move's next test.`,
                `The rate decision now has to be read through ${costObject}.`,
                `The week turns on where higher rates hit bank behavior.`
            ]
            : [
                `The immediate issue is not the rate move itself, but what it does to ${costObject}.`,
                `The rate move changes the math on ${costObject}.`,
                costMatterLine,
                `${costObject.charAt(0).toUpperCase()}${costObject.slice(1)} ${costVerb} becoming the operating question after the rate move.`
            ];
    }
    if (bankingPhraseFamily(line) === "credit_read_shift") {
        return section === "summary"
            ? [
                "Borrower quality is carrying more of the credit story.",
                "Loan terms are doing more work than volume.",
                "Repayment capacity is the live credit test."
            ]
            : [
                "The sharper read is which borrowers still pass the higher-rate test.",
                "The more useful signal is repayment capacity, not lending momentum alone.",
                "The risk is showing up less in headline growth than in who can still absorb tighter credit.",
                "The question is no longer whether lending continues, but which borrowers still clear the tighter math."
            ];
    }
    if (bankingPhraseFamily(line) === "policy_operating_clarity") {
        return section === "summary"
            ? [
                "Policy is clear enough to matter, but transmission is still unsettled.",
                "The policy signal now has to prove its path into bank behavior.",
                "Operating consequences matter more than the policy posture."
            ]
            : [
                "The policy signal is clear; the operating environment it lands in is not.",
                "Policy is setting the direction, but bank behavior will decide the consequence.",
                "The sharper question is how policy reaches credit appetite, deposit pricing, and risk controls.",
                "Rules and guidance matter here only if they change operating choices."
            ];
    }
    if (bankingPhraseFamily(line) === "buffer_pressure") {
        return section === "summary"
            ? [
                "Buffers now read as a pressure response.",
                "Liquidity defense is part of the operating story.",
                "Balance-sheet room is being protected before growth is stretched."
            ]
            : [
                "Buffer language is starting to look like a response to pressure, not just routine prudence.",
                "The liquidity signal is defensive: banks are protecting room to move before stretching again.",
                "Liquidity matters because balance-sheet room is becoming part of the risk response.",
                "The useful read is not caution itself, but what banks are trying to preserve."
            ];
    }
    if (normalized.includes("credit rules and lending behavior")) {
        return section === "summary"
            ? [
                "Credit discipline is moving closer to the operating center.",
                "Borrower quality is carrying more of the credit story.",
                "Loan terms are doing more work than volume."
            ]
            : [
                "Credit discipline is moving from background control to operating constraint.",
                "Loan terms matter more as borrower quality becomes harder to treat as stable.",
                "The useful signal is how much risk banks are still willing to carry."
            ];
    }
    if (normalizedLabel.includes("borrower risk")) {
        return [
            "Repayment capacity is doing more work than headline lending momentum.",
            "Asset quality is the live test underneath still-active lending.",
            "The risk sits in whether loan growth can keep outrunning stress."
        ];
    }
    return [line];
}
function diversifyBankingLine(line, label, stories, section, used) {
    return chooseBankingVariant(bankingAlternateCandidates(line, label, stories, section), used);
}
function diversifyBankingItem(item, section, used) {
    if (!item.supportingStories.some((story) => story.beat === "ph_sea_banking")) {
        return item;
    }
    return {
        ...item,
        whyItMatters: diversifyBankingLine(item.whyItMatters, item.label, item.supportingStories, section, used),
        pattern: diversifyBankingLine(item.pattern, item.label, item.supportingStories, section, used)
    };
}
const MOTORING_EVERGREEN_PHRASES = [
    "ownership cost remains the pressure point",
    "ev transition is still tied",
    "ev stories matter most",
    "enforcement and road-capacity signals keep",
    "price cuts, fuel swings, and srp signals",
    "ev and hybrid momentum matters only",
    "policy only changes driver and operator behavior",
    "early signal of where buyer interest",
    "the market is starting to show what buyers can still afford",
    "vehicle and fuel costs are pressing harder",
    "brands are testing what filipino buyers will still stretch for",
    "rules are starting to bite",
    "operating friction",
    "operating layer",
    "availability is becoming part of the market story",
    "which vehicle choices still make sense",
    "product push vs operating support"
];
function motoringFreshnessContext(stories) {
    const uniqueStories = uniqueStoriesForDisplay(stories);
    const sorted = [...uniqueStories].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
    const text = normalizeText(uniqueStories.map((story) => `${story.title} ${story.summary ?? ""} ${story.tags.join(" ")} ${story.reason_kept.join(" ")} ${story.angle_signals?.join(" ") ?? ""}`).join(" "));
    const latestStory = sorted[0];
    const hasFuelIncrease = textIncludesAny(text, [
        "fuel price hike",
        "fuel prices seen rising",
        "diesel gasoline prices seen rising",
        "pump prices rise",
        "price increase",
        "rising next week",
        "oil price hike"
    ]);
    const hasFuelRelief = textIncludesAny(text, [
        "rollback",
        "discounting gasoline",
        "discount",
        "pump price relief",
        "lower fuel",
        "price cut"
    ]);
    const hasCharging = textIncludesAny(text, ["charging", "charger", "charge point"]);
    const hasHondaMotorcycleMilestone = textIncludesAny(text, [
        "honda ph reaches 12 million motorcycle",
        "12 million motorcycle sales",
        "12 million motorcycles sold",
        "honda ph milestone"
    ]);
    const hasEv = textIncludesAny(text, [
        "electric vehicle",
        "electric vehicles",
        "hybrid",
        "phev",
        "battery",
        "e mobility"
    ]) || /\bev\b/.test(text) || /\bevs\b/.test(text);
    return {
        text,
        latestStory,
        latestTitle: latestStory ? sanitizeText(latestStory.title) : undefined,
        latestDate: latestStory ? formatDate(latestStory.publishedAt || latestStory.date) : undefined,
        hasFuelEconomics: hasFuelIncrease ||
            hasFuelRelief ||
            textIncludesAny(text, ["fuel", "gasoline", "diesel", "oil", "pump price", "fare", "toll"]),
        hasFuelIncrease,
        hasFuelRelief,
        hasOwnershipCost: textIncludesAny(text, [
            "ownership cost",
            "cost",
            "registration",
            "insurance",
            "maintenance",
            "repair",
            "fare",
            "toll",
            "fuel",
            "price"
        ]),
        hasFinancing: textIncludesAny(text, [
            "financing",
            "loan",
            "monthly",
            "installment",
            "downpayment",
            "affordability",
            "srp",
            "starting price"
        ]),
        hasRegulation: textIncludesAny(text, [
            "regulation",
            "policy",
            "lto",
            "ltfrb",
            "dotr",
            "dti",
            "tax",
            "incentive",
            "franchise"
        ]),
        hasEnforcement: textIncludesAny(text, [
            "enforcement",
            "violation",
            "license",
            "arrested",
            "show cause order",
            "sco",
            "coding",
            "discipline"
        ]),
        hasInfrastructure: textIncludesAny(text, [
            "infrastructure",
            "road",
            "toll",
            "traffic",
            "dealership",
            "capacity",
            "charging"
        ]),
        hasCharging,
        hasEv,
        hasFleetOrCommercial: textIncludesAny(text, [
            "fleet",
            "taxi",
            "operator",
            "operators",
            "public transport",
            "commercial",
            "fare",
            "delivery",
            "logistics"
        ]),
        hasAfterSalesOrDealer: textIncludesAny(text, [
            "dealership",
            "dealer",
            "after sales",
            "service center",
            "warranty",
            "road hazard",
            "owner support",
            "tech talk"
        ]),
        hasTrafficOrRoadCapacity: textIncludesAny(text, [
            "traffic",
            "road",
            "toll",
            "c5",
            "edsa",
            "coding",
            "mobility",
            "capacity"
        ]),
        hasDemand: textIncludesAny(text, [
            "sales",
            "demand",
            "buyers",
            "customer",
            "market",
            "sold",
            "milestone"
        ]),
        hasSupply: textIncludesAny(text, [
            "supply",
            "availability",
            "inventory",
            "import",
            "dealership",
            "released",
            "begun sales"
        ]),
        hasMotorcycle: textIncludesAny(text, ["motorcycle", "motorcycles", "rider", "two wheel"]),
        hasHondaMotorcycleMilestone,
        hasPremiumAspiration: textIncludesAny(text, [
            "audi",
            "q9",
            "bmw",
            "7 series",
            "armored",
            "luxury",
            "premium",
            "p50 m",
            "p50m"
        ]),
        hasVisibleEnforcementConsequence: textIncludesAny(text, [
            "viral crash",
            "arrested",
            "show cause order",
            "issued sco",
            "license",
            "pnp",
            "lto"
        ])
    };
}
function motoringPressureDestination(context) {
    if (context.hasFuelIncrease && context.hasFuelRelief) {
        return "the gap between pump promos and the next fuel increase";
    }
    if (context.hasHondaMotorcycleMilestone) {
        return "basic motorcycle mobility";
    }
    if (context.hasFuelEconomics && context.hasFinancing) {
        return "monthly affordability and operating cost";
    }
    if (context.hasFuelEconomics) {
        return "weekly fuel exposure";
    }
    if (context.hasEv && (context.hasCharging || context.hasInfrastructure)) {
        return "EV owner support and charging access";
    }
    if (context.hasRegulation || context.hasEnforcement) {
        return "driver and operator behavior";
    }
    if (context.hasTrafficOrRoadCapacity) {
        return "daily mobility friction";
    }
    if (context.hasFleetOrCommercial) {
        return "fleet fuel bills and terminal costs";
    }
    if (context.hasPremiumAspiration) {
        return "the split between basic mobility and premium aspiration";
    }
    return "concrete buyer behavior";
}
function freshenMotoringLine(line, context) {
    const normalized = normalizeText(line);
    const isEvergreen = MOTORING_EVERGREEN_PHRASES.some((phrase) => normalized.includes(normalizeText(phrase)));
    if (!isEvergreen) {
        return line;
    }
    if (context.hasFuelIncrease && context.hasFuelRelief) {
        return "The pricing signal is the fuel split: Shell discounts soften this week's bill while the next diesel and gasoline hike keeps motorists exposed.";
    }
    if (context.hasFuelEconomics) {
        return "What matters now is not just vehicle price, but the cost of continuing to use it as fuel and fare signals move.";
    }
    if (context.hasEv && (context.hasCharging || context.hasInfrastructure)) {
        return "The EV read is less about another electrified model arriving and more about owner support, charging access, and practical use.";
    }
    if (context.hasRegulation || context.hasEnforcement) {
        return context.hasVisibleEnforcementConsequence
            ? "The viral crash arrest makes enforcement visible: road behavior now has consequences beyond the incident itself."
            : "Rules matter this week because enforcement is turning policy into time, paperwork, and behavior costs for drivers and operators.";
    }
    return line;
}
function motoringFreshWhyLine(label, stories) {
    const normalizedLabel = normalizeText(label);
    const context = motoringFreshnessContext(stories);
    const destination = motoringPressureDestination(context);
    const infrastructureProfile = motoringInfrastructureProfile(stories);
    if (normalizedLabel.includes("pricing pressure")) {
        if (context.hasFuelIncrease && context.hasFuelRelief) {
            return "This week's pricing signal is the contrast: a Shell fuel discount gives temporary relief while the next diesel and gasoline hike keeps household and fleet budgets exposed.";
        }
        return `The affordability read is moving from sticker price to ${destination}, where buyers and operators feel changes fastest.`;
    }
    if (normalizedLabel.includes("ownership cost")) {
        return "The pressure is shifting from vehicle acquisition to long-term operating cost: fuel, fares, registration, maintenance, and compliance are harder to separate.";
    }
    if (normalizedLabel.includes("ev transition")) {
        return context.hasCharging
            ? "The EV question is becoming more concrete: owner education, charging access, and practical use now matter as much as the models arriving."
            : "The EV read is shifting from availability to whether cost-sensitive buyers can make the operating math work.";
    }
    if (normalizedLabel.includes("regulation and enforcement")) {
        return context.hasVisibleEnforcementConsequence
            ? "The viral crash arrest turns enforcement into a visible consequence, making road discipline part of the week's motoring read."
            : "Enforcement is where motoring policy becomes real: it changes the cost of bad behavior, delay, and compliance for drivers and operators.";
    }
    if (normalizedLabel.includes("infrastructure constraint")) {
        if (infrastructureProfile.evInfrastructureDominant) {
            return "Charging, warranty, and owner-support stories show that motoring infrastructure now includes what happens after the vehicle is sold.";
        }
        if (infrastructureProfile.roadDominant || context.hasTrafficOrRoadCapacity) {
            return "Traffic and road-condition stories keep the infrastructure read tied to daily travel time, health, and vehicle wear.";
        }
        return "Road, charging, and service access decide whether demand can translate into actual use.";
    }
    if (normalizedLabel.includes("consumer demand shift")) {
        if (context.hasHondaMotorcycleMilestone) {
            return "Honda's 12-million motorcycle milestone anchors the demand read in basic mobility, not just showroom activity.";
        }
        if (context.hasPremiumAspiration) {
            return "The demand read is split: basic mobility carries volume while premium SUV signals test aspiration at the top end.";
        }
        return context.hasMotorcycle
            ? "Motorcycle demand is doing more than marking volume; it shows how mobility choices adjust when affordability and daily use matter most."
            : "The demand signal is moving from launch interest to what buyers will still stretch for under tighter ownership math.";
    }
    if (normalizedLabel.includes("motoring market signal")) {
        if (context.hasFleetOrCommercial) {
            return "PITX terminal-fee relief and fuel promos make the market signal concrete: operators are getting help at the cost line, not just new products.";
        }
        if (context.hasAfterSalesOrDealer) {
            return "Dealer, warranty, and owner-support signals matter because they show where brands are trying to make ownership easier after purchase.";
        }
        return "The live read is what changed for motorists and operators, not just which product or promo appeared on the market.";
    }
    if (normalizedLabel.includes("supply and availability")) {
        if (context.hasEv) {
            return "Electrified supply matters here because new nameplates only count if they come with credible price, support, and charging conditions.";
        }
        if (context.hasAfterSalesOrDealer) {
            return "Dealer and service signals matter because availability is only useful if owners can maintain the vehicle after purchase.";
        }
    }
    return null;
}
function motoringFreshPatternAndTension(label, stories) {
    const context = motoringFreshnessContext(stories);
    const normalizedLabel = normalizeText(label);
    const destination = motoringPressureDestination(context);
    const infrastructureProfile = motoringInfrastructureProfile(stories);
    if (context.hasFuelIncrease && context.hasFuelRelief) {
        return {
            pattern: "Shell's fuel discount and the next pump-price hike are pulling the same cost story in opposite directions.",
            tension: "Tension: promo relief vs pump exposure"
        };
    }
    if (normalizedLabel.includes("ownership cost") || normalizedLabel.includes("pricing pressure")) {
        return {
            pattern: `Pressure is moving from vehicle acquisition to ${destination}.`,
            tension: "Tension: purchase intent vs cost of use"
        };
    }
    if (normalizedLabel.includes("ev transition")) {
        return {
            pattern: context.hasCharging
                ? "EV adoption is being tested through owner support, charging access, and daily usability."
                : "EV availability is ahead of the everyday cost math needed for broader adoption.",
            tension: "Tension: model arrival vs practical ownership"
        };
    }
    if (normalizedLabel.includes("regulation and enforcement")) {
        return {
            pattern: context.hasVisibleEnforcementConsequence
                ? "The viral crash arrest turns a road incident into a visible enforcement signal."
                : "Rules are moving from policy language into visible driver consequences.",
            tension: "Tension: road behavior vs enforcement consequence"
        };
    }
    if (normalizedLabel.includes("infrastructure constraint")) {
        return {
            pattern: infrastructureProfile.evInfrastructureDominant
                ? "Charging and owner-support gaps are becoming part of the adoption test."
                : "Traffic, road hazards, and transport infrastructure are defining the daily-use limits around the vehicle market.",
            tension: infrastructureProfile.evInfrastructureDominant
                ? "Tension: EV adoption vs owner support"
                : "Tension: vehicle use vs road conditions"
        };
    }
    if (normalizedLabel.includes("supply and availability")) {
        return {
            pattern: context.hasEv
                ? "Electrified nameplates are filling the pipeline, but practical ownership still has to catch up."
                : "Dealer and service availability are becoming part of the ownership-cost story.",
            tension: "Tension: model supply vs owner readiness"
        };
    }
    if (normalizedLabel.includes("consumer demand shift")) {
        return {
            pattern: context.hasHondaMotorcycleMilestone
                ? "Honda's 12-million motorcycle milestone keeps the demand story anchored in basic mobility."
                : context.hasPremiumAspiration
                    ? "The market is splitting between basic mobility scale and premium SUV aspiration."
                    : context.hasMotorcycle
                        ? "Two-wheel demand is carrying the clearest signal on practical mobility choices."
                        : "Buyer behavior is being tested against the cost of keeping vehicles in use.",
            tension: "Tension: mobility need vs affordability"
        };
    }
    if (normalizedLabel.includes("motoring market signal") && (context.hasInfrastructure || context.hasFleetOrCommercial || context.hasAfterSalesOrDealer)) {
        return {
            pattern: context.hasFleetOrCommercial
                ? "Terminal-fee relief, fuel promos, and fleet tools are putting operator costs at the center of the market read."
                : "Dealer, warranty, and owner-support moves are making after-purchase costs part of the market read.",
            tension: "Tension: purchase activity vs ownership burden"
        };
    }
    return null;
}
function motoringPhraseUse() {
    return {
        exact: new Set(),
        families: new Set(),
        openings: new Set()
    };
}
function motoringPhraseFamily(line) {
    const normalized = normalizeText(line);
    if (normalized.includes("fuel economics") ||
        normalized.includes("pump exposure") ||
        normalized.includes("fuel and fare") ||
        normalized.includes("weekly fuel") ||
        normalized.includes("shell s fuel discount") ||
        normalized.includes("fuel split") ||
        normalized.includes("pump price hike")) {
        return "fuel_operating_cost";
    }
    if (normalized.includes("pressure is moving from vehicle acquisition") ||
        normalized.includes("pressure is shifting from vehicle acquisition") ||
        normalized.includes("cost of continuing to use") ||
        normalized.includes("cost of keeping")) {
        return "acquisition_to_operating_cost";
    }
    if (normalized.includes("ev read is shifting") ||
        normalized.includes("ev adoption is moving") ||
        normalized.includes("ev adoption is being tested") ||
        normalized.includes("ev question is becoming") ||
        normalized.includes("charging access")) {
        return "ev_operating_reality";
    }
    if (normalized.includes("rules are moving") ||
        normalized.includes("rules matter this week") ||
        normalized.includes("enforcement is where") ||
        normalized.includes("driver consequences") ||
        normalized.includes("viral crash arrest")) {
        return "rule_rollout_consequence";
    }
    if (normalized.includes("buyer behavior") ||
        normalized.includes("demand signal") ||
        normalized.includes("mobility choices") ||
        normalized.includes("honda s 12 million motorcycle") ||
        normalized.includes("basic mobility")) {
        return "buyer_behavior_shift";
    }
    return normalized.split(" ").slice(0, 7).join(" ");
}
function rememberMotoringPhrase(line, used) {
    const clean = sanitizeText(line);
    const normalized = normalizeText(clean);
    const opening = normalized.split(" ").slice(0, 4).join(" ");
    if (!normalized) {
        return;
    }
    used.exact.add(normalized);
    used.families.add(motoringPhraseFamily(clean));
    if (opening) {
        used.openings.add(opening);
    }
}
function chooseMotoringVariant(candidates, used) {
    const cleanCandidates = candidates.map(sanitizeText).filter(Boolean);
    for (const candidate of cleanCandidates) {
        const normalized = normalizeText(candidate);
        const family = motoringPhraseFamily(candidate);
        const opening = normalized.split(" ").slice(0, 4).join(" ");
        if (used.exact.has(normalized) ||
            used.families.has(family) ||
            (opening && used.openings.has(opening))) {
            continue;
        }
        rememberMotoringPhrase(candidate, used);
        return candidate;
    }
    const fallback = cleanCandidates.find((candidate) => !used.exact.has(normalizeText(candidate)))
        ?? cleanCandidates[0]
        ?? "";
    rememberMotoringPhrase(fallback, used);
    return fallback;
}
function motoringAlternateCandidates(line, label, stories, section) {
    const normalized = normalizeText(line);
    const normalizedLabel = normalizeText(label);
    const context = motoringFreshnessContext(stories);
    const destination = motoringPressureDestination(context);
    if (motoringPhraseFamily(line) === "fuel_operating_cost") {
        if (!context.hasFuelRelief) {
            return section === "summary"
                ? [
                    "Fare and fuel exposure are carrying more of the weekly cost read.",
                    "The cost signal is showing up in travel and fleet budgets.",
                    "Transport costs are the week's concrete affordability test."
                ]
                : [
                    "Fare movement matters because it shows transport costs reaching actual users.",
                    "The useful signal is how transport costs change household and operator budgets.",
                    "Fuel and fare pressure matter when they change what daily mobility costs now."
                ];
        }
        return section === "summary"
            ? [
                "Shell's discount and the expected fuel hike define the cost signal.",
                "The pump-price read is split between temporary relief and renewed exposure.",
                "Fuel is the week's concrete affordability test for motorists and fleets."
            ]
            : [
                "Shell's P5/L gasoline and P3/L diesel discount matters because the next pump-price hike is already in view.",
                "The useful signal is the fuel contrast: temporary promo relief against a still-rising cost base.",
                "Fuel pressure matters because motorists and fleets feel it immediately in weekly use."
            ];
    }
    if (motoringPhraseFamily(line) === "acquisition_to_operating_cost") {
        return section === "summary"
            ? [
                "Fuel, fares, and compliance are now doing more work than sticker price.",
                "The sharper read is what motorists pay after purchase.",
                "The cost story is now about keeping vehicles usable."
            ]
            : [
                `The pressure is shifting from the purchase decision to ${destination}.`,
                "The cost of keeping a vehicle on the road is becoming harder to separate from fuel, financing, and regulation.",
                "What matters now is not just vehicle price, but the cost of continuing to use it."
            ];
    }
    if (motoringPhraseFamily(line) === "ev_operating_reality") {
        return section === "summary"
            ? [
                "EV stories are now being tested through owner support and charging access.",
                "Charging and owner education are carrying more of the EV story.",
                "The EV push now has to prove practical daily use."
            ]
            : [
                "The EV signal is shifting from model arrival to whether ownership is practical.",
                "Charging access and owner support are becoming the adoption test.",
                "Electrified models matter more when buyers can see charging, service, and owner support."
            ];
    }
    if (motoringPhraseFamily(line) === "rule_rollout_consequence") {
        return section === "summary"
            ? [
                "The viral crash arrest makes enforcement visible.",
                "Road discipline is showing up through actual consequences.",
                "LTO action turns the incident into a wider enforcement signal."
            ]
            : [
                "The policy read is moving from rule announcement to visible driver consequence.",
                "Enforcement matters because it changes the cost of delay, violations, and loose road behavior.",
                "The sharper signal is whether rules change daily driving and operator choices."
            ];
    }
    if (motoringPhraseFamily(line) === "buyer_behavior_shift") {
        return section === "summary"
            ? [
                "Honda's motorcycle milestone anchors the demand story in basic mobility.",
                "The market is split between motorcycle scale and premium aspiration.",
                "Basic mobility is carrying more of the demand read."
            ]
            : [
                "Honda's 12-million motorcycle milestone shows the practical end of the market still has scale.",
                "The demand signal is split between basic mobility and higher-end aspiration.",
                "Buyer behavior matters most where it shows what people rely on for daily mobility."
            ];
    }
    if (normalizedLabel.includes("pricing pressure") || normalized.includes("affordability")) {
        if (context.hasFuelRelief) {
            return [
                "Shell's fuel discount makes the affordability signal visible at the pump.",
                "Fuel promos matter because they reach motorists and operators immediately.",
                "The price read is concrete this week: pump discounts are doing some of the relief work."
            ];
        }
        return [
            `Affordability is being tested through ${destination}, not sticker price alone.`,
            "The cost signal now sits in continued usage as much as acquisition.",
            "Price matters because it is starting to connect with fuel, financing, and operating exposure."
        ];
    }
    return [line];
}
function diversifyMotoringLine(line, label, stories, section, used) {
    return chooseMotoringVariant(motoringAlternateCandidates(line, label, stories, section), used);
}
function diversifyMotoringItem(item, section, used) {
    if (!item.supportingStories.some((story) => story.beat === "philippine_motoring")) {
        return item;
    }
    return {
        ...item,
        whyItMatters: diversifyMotoringLine(item.whyItMatters, item.label, item.supportingStories, section, used),
        pattern: diversifyMotoringLine(item.pattern, item.label, item.supportingStories, section, used)
    };
}
function hasCoreBucket(stories) {
    return stories.some((story) => story.editorial_bucket === "urgent_important" ||
        story.property_filter?.editorial_bucket === "core_signal" ||
        story.ai_tech_filter?.editorial_bucket === "core_signal" ||
        story.energy_filter?.importance_tier === "high" ||
        story.cluster_classification === "primary");
}
function buildThinEditorialRead(beatName) {
    return [
        `${beatName} is thin this week; the safer read is narrow rather than sector-wide.`,
        "One or two signals can set the watchlist, but they are not enough to call a broader turn."
    ];
}
function buildPropertyEditorialRead(stories) {
    if (stories.length === 0) {
        return buildThinEditorialRead("Property");
    }
    const bullets = [];
    const context = propertyInterpretationContext(stories);
    const coreSignals = stories.filter((story) => story.property_filter?.editorial_bucket === "core_signal");
    const interpretations = stories.filter((story) => story.property_filter?.editorial_bucket === "interpretation");
    const hasPricePressure = readHasAny(stories, [
        "property price index",
        "residential real estate price index",
        "price slowdown",
        "prices slow",
        "prices soften",
        "price movement"
    ]);
    const hasOfficeStress = readHasAny(stories, [
        "vacancy",
        "office demand",
        "leasing",
        "rent",
        "rents",
        "stock",
        "tenant demand",
        "supply stress"
    ]);
    const hasConstructionSoftness = readHasAny(stories, [
        "construction permits",
        "building permits",
        "permit decline",
        "weak residential demand",
        "residential demand",
        "supply pullback"
    ]);
    const hasFinancingPolicy = readHasAny(stories, [
        "housing credit",
        "housing loan",
        "home financing",
        "mortgage",
        "rental housing",
        "capital charge",
        "capital requirement",
        "pag-ibig"
    ]);
    if (hasPricePressure && (hasOfficeStress || hasConstructionSoftness)) {
        bullets.push("Price growth is slowing while usage and build signals still look uneven, keeping the week focused on pressure rather than expansion.");
    }
    else if (hasPricePressure) {
        bullets.push("Price movement is the cleanest property signal this week, with softer growth doing more work than launch or expansion news.");
    }
    if (hasOfficeStress) {
        if (context.hasPromotionalFraming && context.hasOperatingTerms) {
            bullets.push(`Resilience is the visible office-market framing; the useful read is whether vacancy, rents, and ${propertyUtilizationProof("editorial-read-office")} support it underneath.`);
        }
        else {
            bullets.push("Office remains a visible stress channel, with vacancy, rents, and tenant demand carrying more weight than developer positioning.");
        }
    }
    if (context.hasFramingCollision && bullets.length < 4) {
        bullets.push("Resilience and volatility are sitting inside the same property narrative, which makes the tension more useful than either headline by itself.");
    }
    if (context.hasRecoveryLanguage &&
        context.hardRecoveryConfirmations < 2 &&
        bullets.length < 4) {
        bullets.push(`The lack of clear ${propertyRecoveryConfirmation("editorial-read-recovery")} keeps this in stabilization territory, not a clean recovery call.`);
    }
    if (hasConstructionSoftness) {
        bullets.push("Residential construction looks softer where permit and demand signals point to a less aggressive build pipeline.");
    }
    if (hasFinancingPolicy) {
        bullets.push("Housing finance and rental-housing policy are present, but support signals have not yet outweighed the pressure signs.");
    }
    if (interpretations.length > 0 && bullets.length < 3) {
        bullets.push(coreSignals.length > 0
            ? "The softer market reads add direction around the hard signals, but they do not by themselves prove a turn."
            : context.hasConsultancyFraming
                ? "The week is being carried by consultancy and research framing, so the read should stay cautious until harder demand, pricing, or occupancy evidence appears."
                : "Most of the week is interpretive, so the read should stay cautious until harder price, vacancy, inventory, lending, or policy evidence appears.");
    }
    if (bullets.length === 0) {
        bullets.push("Property is narrow this week; the useful read is selective pressure, not a complete sector call.", "Harder signals should still outrank broad outlook pieces until more price, vacancy, inventory, lending, or policy evidence appears.");
    }
    return bullets.slice(0, 4);
}
function buildAiTechEditorialRead(stories, themeClusters) {
    if (stories.length === 0) {
        return buildThinEditorialRead("Technology / Digital Economy");
    }
    const bullets = [];
    const hasInfrastructure = readHasAny(stories, [
        "data center",
        "datacenter",
        "cloud",
        "compute",
        "5g",
        "broadband",
        "fiber",
        "submarine cable",
        "subsea cable",
        "network expansion"
    ]) || readHasTheme(themeClusters, ["infrastructure", "connectivity", "data center", "cloud"]);
    const hasSecurity = readHasAny(stories, [
        "cybersecurity",
        "data breach",
        "ransomware",
        "cyberattack",
        "security incident",
        "data privacy"
    ]) || readHasTheme(themeClusters, ["cybersecurity", "resilience", "security"]);
    const hasPolicy = readHasAny(stories, [
        "regulation",
        "governance",
        "privacy",
        "data privacy",
        "policy",
        "rules",
        "dict",
        "npc",
        "digital economy"
    ]) || readHasTheme(themeClusters, ["policy", "regulation", "governance"]);
    const hasEnterprise = readHasAny(stories, [
        "enterprise",
        "erp",
        "crm",
        "cloud migration",
        "digital transformation",
        "workflow",
        "adoption",
        "deployment",
        "partnership",
        "customer",
        "regional",
        "philippines",
        "southeast asia"
    ]) || readHasTheme(themeClusters, ["enterprise", "adoption"]);
    const hasConsumerShift = readHasAny(stories, [
        "market share",
        "shipments",
        "consumer behavior",
        "smartphone",
        "laptop",
        "wearable",
        "mobile payments"
    ]) || readHasTheme(themeClusters, ["consumer", "market"]);
    if (hasInfrastructure) {
        bullets.push("Infrastructure and connectivity signals matter this week because they change who can access digital services and what businesses can run at scale.");
    }
    if (hasSecurity) {
        bullets.push("Cybersecurity is part of the operating story, with incidents, resilience, or data-protection pressure affecting trust and continuity.");
    }
    if (hasPolicy) {
        bullets.push("Digital policy is shaping the runway, with privacy, cyber, governance, or digital-economy rules changing what governments and firms can deploy.");
    }
    if (hasEnterprise) {
        bullets.push("Enterprise adoption signals are strongest where they show workflow, spending, or operating-model change rather than another vendor announcement.");
    }
    if (hasConsumerShift && bullets.length < 4) {
        bullets.push("Consumer technology belongs in the brief only where launches point to adoption, market-share movement, ecosystem change, or behavior shifts.");
    }
    if (bullets.length === 0) {
        bullets.push(stories.length <= 2
            ? "Technology / Digital Economy is narrow this week; the desk should treat the available signals as watchlist movement, not a broad cycle read."
            : "The week is fragmented, so the useful read is where adoption, infrastructure, security, regulation, and consumer behavior start to overlap.");
    }
    return bullets.slice(0, 4);
}
function buildMotoringEditorialRead(stories, themeClusters) {
    if (stories.length === 0) {
        return buildThinEditorialRead("Motoring");
    }
    const bullets = [];
    const freshness = motoringFreshnessContext(stories);
    const hasOwnershipCost = readHasAny(stories, [
        "fuel",
        "gasoline",
        "diesel",
        "pump price",
        "fare",
        "toll",
        "registration",
        "insurance",
        "cost",
        "price increase"
    ]) || readHasTheme(themeClusters, ["fuel", "cost", "price"]);
    const hasEvTransition = readHasAny(stories, [
        "ev",
        "electric vehicle",
        "charging",
        "battery",
        "hybrid",
        "e-mobility"
    ]) || readHasTheme(themeClusters, ["ev", "electric", "charging"]);
    const hasEnforcement = readHasAny(stories, [
        "enforcement",
        "lto",
        "ltfrb",
        "mmda",
        "violation",
        "coding",
        "traffic",
        "license",
        "franchise"
    ]) || readHasTheme(themeClusters, ["enforcement", "traffic", "regulation"]);
    const hasCapacity = readHasAny(stories, [
        "sales",
        "production",
        "supply",
        "import",
        "capacity",
        "dealership",
        "fleet",
        "public transport"
    ]) || readHasTheme(themeClusters, ["sales", "capacity", "supply"]);
    if (hasOwnershipCost) {
        bullets.push(freshness.hasFuelIncrease && freshness.hasFuelRelief
            ? "The pricing signal is the fuel split: Shell discounts soften this week's bill while the next diesel and gasoline hike keeps motorists exposed."
            : freshness.hasFuelRelief
                ? "Shell's P5/L gasoline and P3/L diesel discount makes affordability concrete this week, especially for motorists and operators who feel fuel costs immediately."
                : "The cost of keeping a vehicle on the road is becoming harder to separate from fuel, financing, and regulation.");
    }
    if (hasEvTransition && hasCapacity) {
        bullets.push(freshness.hasCharging
            ? "Changan owner support, charging stories, and new PHEV arrivals make the EV read about practical ownership, not just model launches."
            : "EV adoption is being tested at the ownership layer, where supply and cost have to translate into practical use.");
    }
    else if (hasEvTransition) {
        bullets.push("The EV signal is shifting from model arrival to whether the operating math works for cost-sensitive owners.");
    }
    if (hasEnforcement) {
        bullets.push(freshness.hasVisibleEnforcementConsequence
            ? "The viral crash arrest gives enforcement a visible consequence, turning road discipline from background complaint into this week's concrete signal."
            : "Rules matter this week because enforcement is turning policy into time, paperwork, and behavior costs for drivers and operators.");
    }
    if ((freshness.hasHondaMotorcycleMilestone || freshness.hasPremiumAspiration) && bullets.length < 4) {
        bullets.push(freshness.hasHondaMotorcycleMilestone && freshness.hasPremiumAspiration
            ? "Honda's 12-million motorcycle milestone and Audi's Q9 signal opposite ends of the market: basic mobility has scale while premium aspiration still gets tested."
            : freshness.hasHondaMotorcycleMilestone
                ? "Honda's 12-million motorcycle milestone anchors the week in basic mobility, where affordability and daily use matter more than launch noise."
                : "Premium SUV attention is testing aspiration at the top end while the rest of the beat is still ruled by cost and daily use.");
    }
    if ((freshness.hasFleetOrCommercial || freshness.hasTrafficOrRoadCapacity || freshness.hasAfterSalesOrDealer) && bullets.length < 4) {
        bullets.push(freshness.hasFleetOrCommercial
            ? "PITX fee relief and fleet fuel-savings stories put operator costs on the desk alongside consumer ownership costs."
            : "Dealer, warranty, and owner-support stories matter because they affect what ownership costs after the sale.");
    }
    if (freshness.hasDemand && bullets.length < 4) {
        bullets.push(freshness.hasMotorcycle
            ? "Two-wheel demand is carrying a practical mobility signal as buyers keep prioritizing usable, lower-cost transport."
            : "Demand now has to clear the operating-cost test, not just the launch or showroom test.");
    }
    if (bullets.length === 0) {
        bullets.push(stories.length <= 2
            ? "Motoring is thin this week; the useful read is limited to the few cost, policy, or capacity signals on the desk."
            : "The week is mixed, so the clearest read is the tension between demand, operating costs, and transport capacity.");
    }
    return bullets
        .map((bullet) => freshenMotoringLine(bullet, freshness))
        .filter((bullet, index, all) => all.indexOf(bullet) === index)
        .slice(0, 4);
}
function buildBankingEditorialRead(stories, themeClusters) {
    if (stories.length === 0) {
        return buildThinEditorialRead("Banking");
    }
    const labels = themeClusters.map((theme) => normalizeText(theme.theme_label));
    const hasCreditTightening = labels.some((label) => label.includes("credit tightening")) ||
        stories.some((story) => story.banking_signals?.direction.includes("tightening"));
    const hasRisk = labels.some((label) => label.includes("risk")) ||
        stories.some((story) => story.banking_signals?.function.includes("risk")) ||
        readHasAny(stories, ["bad loans", "non-performing", "npl", "borrower stress", "defaults"]);
    const hasLiquidity = labels.some((label) => label.includes("liquidity")) ||
        stories.some((story) => story.banking_signals?.function.includes("liquidity"));
    const hasDeposits = labels.some((label) => label.includes("deposit")) ||
        stories.some((story) => story.banking_signals?.function.includes("deposits"));
    const hasPolicy = stories.some((story) => story.banking_signals?.driver.includes("policy")) ||
        readHasAny(stories, ["bsp", "capital requirement", "reserve requirement", "policy", "regulator"]);
    const hasGrowth = labels.some((label) => label.includes("growth")) ||
        readHasAny(stories, ["loan growth", "credit growth", "lending growth"]);
    const freshness = bankingFreshnessContext(stories);
    const bullets = [];
    if (freshness.hasRateMove && (hasRisk || hasGrowth || hasDeposits)) {
        bullets.push(`This week, the rate move landed; the more useful question now is what it costs through ${hasDeposits ? "funding and deposit pricing" : hasRisk ? "asset quality" : "borrower appetite"}.`);
    }
    if (freshness.hasExternalShock && hasRisk) {
        bullets.push(freshness.hasPrivateBankStress
            ? "Pressure is migrating from external shock to domestic credit stress as banks start tying inflation risk to loan growth and asset quality."
            : "External pressure is moving into the banking read through provisions, borrower stress, and regional credit-risk language.");
    }
    if (hasCreditTightening && hasRisk && bullets.length < 3) {
        bullets.push("Credit discipline and borrower risk are moving together, which makes loan quality more important than headline growth.");
    }
    else if (hasCreditTightening) {
        bullets.push("Credit conditions are leaning tighter as banks or regulators put more weight on borrower capacity and lending discipline.");
    }
    else if (hasRisk) {
        bullets.push("Risk is becoming harder to treat as background noise, especially where bad-loan or borrower-capacity signals surface.");
    }
    if (hasLiquidity || hasDeposits) {
        bullets.push(hasDeposits
            ? "Deposit movement matters less as a static liquidity fact than as a test of whether banks have to pay up to defend funding."
            : "Liquidity signals now read as pressure management: banks are protecting room to move before stretching balance sheets again.");
    }
    if (hasPolicy && !hasCreditTightening) {
        bullets.push("Policy remains a live driver, but its market impact depends on whether it changes credit behavior rather than just compliance posture.");
    }
    if (hasGrowth && bullets.length < 3) {
        bullets.push("What matters is no longer loan growth by itself, but whether borrowers can still carry it under higher rates or riskier conditions.");
    }
    if (bullets.length === 0) {
        bullets.push("Banking is mostly watch-level this week; the desk should stay focused on credit behavior, funding pressure, and early risk.");
    }
    return bullets
        .map((bullet) => freshenBankingLine(bullet, freshness))
        .filter((bullet, index, all) => all.indexOf(bullet) === index)
        .slice(0, 4);
}
function buildEnergyEditorialReadFromStories(stories, themeClusters) {
    if (stories.length === 0) {
        return buildThinEditorialRead("Energy");
    }
    const bullets = [];
    const hasFuelPrice = stories.some((story) => story.energy_filter?.primary_category === "price") ||
        readHasAny(stories, ["pump price", "rollback", "fuel price", "diesel", "gasoline", "lpg", "oil"]);
    const hasSupply = stories.some((story) => story.energy_filter?.primary_category === "supply") ||
        readHasAny(stories, ["supply", "reserve", "generation", "shortage", "outage", "red alert", "yellow alert"]);
    const hasPolicy = stories.some((story) => story.energy_filter?.primary_category === "policy") ||
        readHasAny(stories, ["erc", "doe", "policy", "tariff", "subsidy", "tax"]);
    const hasInfrastructure = stories.some((story) => story.energy_filter?.primary_category === "infrastructure") ||
        readHasAny(stories, ["grid", "transmission", "substation", "power plant", "commissioning", "interconnection"]);
    const hasDemandPressure = stories.some((story) => story.energy_filter?.demand_pressure) ||
        readHasAny(stories, ["demand", "consumption", "peak demand", "load"]);
    if (hasFuelPrice && hasPolicy) {
        bullets.push("Fuel and policy signals are moving together, so the pressure is not just price direction but who absorbs the cost.");
    }
    else if (hasFuelPrice) {
        bullets.push("Fuel prices are the clearest near-term signal, with pump-price movement still shaping household and business costs.");
    }
    if (hasSupply || hasInfrastructure) {
        bullets.push(hasInfrastructure
            ? "Grid and project-execution signals keep capacity risk on the desk, even when price stories dominate the week."
            : "Supply conditions remain the constraint to watch where reserves, outages, or generation availability move.");
    }
    if (hasDemandPressure) {
        bullets.push("Demand pressure matters because it can turn ordinary supply tightness into a reliability or price problem.");
    }
    if (bullets.length === 0 && readHasTheme(themeClusters, ["external", "shock"])) {
        bullets.push("External shocks are still relevant only where they pass through to local prices, supply, or reliability.");
    }
    if (bullets.length === 0) {
        bullets.push(stories.length <= 2
            ? "Energy is narrow this week; the desk should avoid a broad system call until price, supply, or reliability signals firm up."
            : "The week is mixed, with the useful read sitting at the intersection of price, supply, policy, and execution risk.");
    }
    return bullets.slice(0, 4);
}
function buildGenericEditorialRead(stories, themeClusters) {
    if (stories.length === 0) {
        return buildThinEditorialRead("The beat");
    }
    const bullets = [];
    const primaryThemes = themeClusters
        .filter((theme) => theme.theme_type !== "watch")
        .sort((left, right) => right.story_count - left.story_count)
        .slice(0, 2);
    if (primaryThemes.length > 0) {
        const labels = primaryThemes.map((theme) => sanitizeText(theme.theme_label));
        bullets.push(labels.length === 1
            ? `${labels[0]} is carrying the week, but the read should stay tied to concrete movement rather than story count.`
            : `${labels[0]} and ${labels[1]} are carrying the week, with the sharper read in how those pressures interact.`);
    }
    if (hasCoreBucket(stories)) {
        bullets.push("The strongest items point to actual movement, while softer stories should stay in a supporting role.");
    }
    else {
        bullets.push("Most of the week is directional rather than decisive, so the desk should avoid calling a turn too early.");
    }
    return bullets.slice(0, 4);
}
function buildSharedEditorialRead(stories, beatName, themeClusters = []) {
    const beat = stories[0]?.beat;
    if (beat === "property_real_estate") {
        return buildPropertyEditorialRead(stories);
    }
    if (beat === "ai_tech") {
        return buildAiTechEditorialRead(stories, themeClusters);
    }
    if (beat === "philippine_motoring") {
        return buildMotoringEditorialRead(stories, themeClusters);
    }
    if (beat === "ph_sea_banking") {
        return buildBankingEditorialRead(stories, themeClusters);
    }
    if (beat === "ph_sea_energy") {
        return buildEnergyEditorialReadFromStories(stories, themeClusters);
    }
    return buildGenericEditorialRead(stories, themeClusters.length > 0 ? themeClusters : [])
        .map((line) => line.replace(/^The beat\b/, beatName));
}
function buildPropertyEditorialOutput(stories) {
    if (!stories.every((story) => story.beat === "property_real_estate")) {
        return undefined;
    }
    const sortedStories = [...stories].sort((left, right) => {
        const tierRank = (tier) => tier === "high" ? 2 : tier === "medium" ? 1 : 0;
        const stressDelta = Number(right.property_filter?.stress_signal ?? false) -
            Number(left.property_filter?.stress_signal ?? false);
        const tierDelta = tierRank(right.property_filter?.importance_tier) -
            tierRank(left.property_filter?.importance_tier);
        if (stressDelta !== 0) {
            return stressDelta;
        }
        if (tierDelta !== 0) {
            return tierDelta;
        }
        return right.publishedAt.localeCompare(left.publishedAt);
    });
    return {
        editorial_read: buildPropertyEditorialRead(sortedStories),
        core_signals: sortedStories
            .filter((story) => story.property_filter?.editorial_bucket === "core_signal")
            .map(propertyStoryRef),
        interpretation_layer: sortedStories
            .filter((story) => story.property_filter?.editorial_bucket === "interpretation")
            .map(propertyStoryRef),
        capability_watch: sortedStories
            .filter((story) => story.property_filter?.editorial_bucket === "capability_watch")
            .map(propertyStoryRef)
    };
}
function energyStoryRef(story) {
    return {
        id: story.id,
        title: sanitizeText(story.title),
        source: story.source,
        url: story.url,
        primary_category: story.energy_filter?.primary_category,
        importance_tier: story.energy_filter?.importance_tier,
        system_pressure: story.energy_filter?.system_pressure
    };
}
const ENERGY_WATCH_SYSTEM_TERMS = [
    "electricity",
    "power",
    "grid",
    "transmission",
    "distribution",
    "generation",
    "generator",
    "power plant",
    "substation",
    "interconnection",
    "reserve",
    "outage",
    "brownout",
    "red alert",
    "yellow alert",
    "wesm",
    "meralco",
    "erc",
    "doe",
    "ngcp",
    "fuel",
    "diesel",
    "gasoline",
    "kerosene",
    "lpg",
    "lng",
    "coal",
    "oil",
    "pump price",
    "generation charge",
    "electricity rate",
    "power rate",
    "rollback",
    "fuel tax",
    "cost recovery",
    "supply agreement",
    "hydro",
    "solar",
    "renewable",
    "commissioning",
    "rehabilitation",
    "epc"
];
const ENERGY_WATCH_MOVEMENT_TERMS = [
    "increase",
    "increases",
    "increased",
    "rise",
    "rises",
    "rising",
    "raise",
    "raises",
    "raised",
    "hike",
    "hikes",
    "cut",
    "cuts",
    "rollback",
    "easing",
    "suspend",
    "suspends",
    "waive",
    "waives",
    "recover",
    "recovery",
    "surge",
    "surges",
    "shortage",
    "disruption",
    "delay",
    "delays",
    "strained",
    "strain",
    "alert",
    "outage",
    "rehabilitation",
    "commissioning",
    "capacity",
    "contract",
    "agreement",
    "delivery",
    "imports",
    "supply"
];
const ENERGY_WATCH_WEAK_CONTEXT_TERMS = [
    "agricultural imports",
    "food imports",
    "farmers",
    "pork",
    "rice",
    "fishports",
    "flight",
    "flights",
    "airspace",
    "airport",
    "passenger",
    "tourism"
];
const ENERGY_WATCH_STRONG_SYSTEM_TERMS = [
    "electricity",
    "power",
    "grid",
    "transmission",
    "distribution",
    "generation",
    "power plant",
    "substation",
    "interconnection",
    "reserve",
    "outage",
    "brownout",
    "red alert",
    "yellow alert",
    "wesm",
    "meralco",
    "erc",
    "doe",
    "ngcp",
    "diesel",
    "gasoline",
    "kerosene",
    "lpg",
    "lng",
    "coal",
    "oil supply",
    "fuel supply",
    "fuel delivery",
    "pump price",
    "generation charge",
    "electricity rate",
    "power rate",
    "supply agreement",
    "hydro",
    "solar",
    "commissioning",
    "rehabilitation",
    "epc"
];
function textIncludesAny(text, terms) {
    return terms.some((term) => text.includes(term));
}
function hasEnergyWatchSystemConsequence(story) {
    const filter = story.energy_filter;
    if (!filter) {
        return false;
    }
    const text = normalizeText([
        story.title,
        story.summary ?? "",
        story.tags.join(" "),
        filter.materiality_signals.join(" ")
    ].join(" "));
    const hasSystemTerm = textIncludesAny(text, ENERGY_WATCH_SYSTEM_TERMS);
    const hasMovementTerm = textIncludesAny(text, ENERGY_WATCH_MOVEMENT_TERMS);
    const hasWeakContext = textIncludesAny(text, ENERGY_WATCH_WEAK_CONTEXT_TERMS);
    const hasStrongSystemTerm = textIncludesAny(text, ENERGY_WATCH_STRONG_SYSTEM_TERMS);
    if (!hasSystemTerm) {
        return false;
    }
    if (hasWeakContext && !hasStrongSystemTerm) {
        return false;
    }
    if (filter.system_pressure ||
        filter.demand_pressure ||
        filter.importance_tier === "high") {
        return true;
    }
    if (!hasMovementTerm) {
        return false;
    }
    if (filter.primary_category === "external_forces" &&
        !filter.inclusion_rule_ids.includes("external_pressure_impacts_local_system")) {
        return false;
    }
    return true;
}
function energyClusterOutput(cluster, storyMap) {
    return {
        cluster_id: cluster.cluster_id,
        label: sanitizeText(cluster.event_label),
        story_count: cluster.story_count,
        classification: cluster.cluster_classification,
        cluster_type: cluster.cluster_type,
        compression_line: cluster.compression_line
            ? sanitizeText(cluster.compression_line)
            : undefined,
        theme_id: cluster.primary_theme_id,
        theme_label: cluster.primary_theme_label,
        stories: cluster.story_ids
            .map((storyId) => storyMap.get(storyId))
            .filter((story) => Boolean(story))
            .map(energyStoryRef)
    };
}
function energyEditorialRead(themes, signals) {
    if (themes.length === 0) {
        return signals.length > 0
            ? "Energy has watch signals on the desk, but none is broad enough yet to carry a confident system read."
            : "Energy is quiet this week; the desk should wait for firmer price, supply, reliability, or policy movement.";
    }
    const labels = themes.map((theme) => normalizeText(theme.theme));
    const clauses = [];
    if (labels.some((label) => label.includes("fuel prices") && label.includes("easing"))) {
        clauses.push("fuel prices are easing through pump-price rollbacks");
    }
    if (labels.some((label) => label.includes("policy") && label.includes("burden"))) {
        clauses.push("policy is shifting who absorbs fuel-cost pressure");
    }
    if (labels.some((label) => label.includes("infrastructure") && label.includes("advancing"))) {
        clauses.push("project execution is moving forward");
    }
    if (labels.some((label) => label.includes("reliability") && label.includes("building"))) {
        clauses.push("reliability pressure is building");
    }
    if (labels.some((label) => label.includes("electricity costs"))) {
        clauses.push("electricity costs are moving through regulated recovery channels");
    }
    if (labels.some((label) => label.includes("external shocks"))) {
        clauses.push("external shocks are transmitting into local Energy conditions");
    }
    const movementRead = clauses.length > 0
        ? clauses.join("; ")
        : themes.map((theme) => theme.theme).join("; ");
    return `${movementRead.charAt(0).toUpperCase()}${movementRead.slice(1)}. The strongest read is system movement, not story volume: price, policy, and execution signals are carrying the beat this week.`;
}
function buildEnergyEditorialOutput(stories, eventClusters = [], themeClusters = []) {
    if (!stories.every((story) => story.beat === "ph_sea_energy")) {
        return undefined;
    }
    const storyMap = buildStoryMapById(stories);
    const clusterById = new Map(eventClusters.map((cluster) => [cluster.cluster_id, cluster]));
    const clusterBreakdown = eventClusters.map((cluster) => energyClusterOutput(cluster, storyMap));
    const themes = themeClusters
        .map((theme) => {
        const clusters = theme.cluster_ids
            .map((clusterId) => clusterById.get(clusterId))
            .filter((cluster) => Boolean(cluster))
            .map((cluster) => energyClusterOutput(cluster, storyMap));
        return {
            theme_id: theme.theme_id,
            theme: sanitizeText(theme.theme_label),
            explanation: sanitizeText(theme.theme_summary ?? ""),
            story_count: theme.story_count,
            clusters
        };
    })
        .filter((theme) => theme.clusters.length > 0);
    const themedClusterIds = new Set(themes.flatMap((theme) => theme.clusters.map((cluster) => cluster.cluster_id)));
    const signalClusters = eventClusters
        .filter((cluster) => !themedClusterIds.has(cluster.cluster_id))
        .map((cluster) => ({
        cluster_id: cluster.cluster_id,
        label: sanitizeText(cluster.event_label),
        explanation: cluster.compression_line ? sanitizeText(cluster.compression_line) : undefined,
        stories: energyClusterOutput(cluster, storyMap).stories
    }));
    const clusteredStoryIds = new Set(eventClusters.flatMap((cluster) => cluster.story_ids));
    const unclusteredSignals = stories
        .filter((story) => !clusteredStoryIds.has(story.id))
        .filter(hasEnergyWatchSystemConsequence)
        .map((story) => ({
        label: sanitizeText(story.energy_filter?.primary_category ?? "Unclustered Energy signal"),
        explanation: "Kept by the Energy filter but not strong enough to join a system-movement cluster.",
        stories: [energyStoryRef(story)]
    }));
    const signalsToWatch = [...signalClusters, ...unclusteredSignals];
    return {
        editorial_read: energyEditorialRead(themes, signalsToWatch),
        themes,
        cluster_breakdown: clusterBreakdown,
        signals_to_watch: signalsToWatch
    };
}
function bankingThemeRank(themeType) {
    if (themeType === "primary") {
        return 3;
    }
    if (themeType === "secondary") {
        return 2;
    }
    return 1;
}
function bankingClusterRank(cluster) {
    return bankingThemeRank(cluster.cluster_classification);
}
function bankingThemeRead(theme, stories) {
    const label = normalizeText(theme.theme_label);
    if (label.includes("credit tightening")) {
        return "Banks and regulators are giving more attention to loan terms, borrower capacity, and credit discipline than to simple volume growth.";
    }
    if (label.includes("risk")) {
        return "The useful signal is balance-sheet caution: bad loans, provisions, exposure, or stress are becoming harder to treat as background noise.";
    }
    if (label.includes("deposit")) {
        return "Deposit behavior matters here because fund movement can change liquidity, funding costs, and competitive pressure across banks.";
    }
    if (label.includes("liquidity")) {
        return "Liquidity is the core read: banks appear more focused on buffers and optionality than on stretching for growth.";
    }
    if (label.includes("funding")) {
        return "Funding pressure matters because higher cost of funds can squeeze margins and force banks to reprice risk.";
    }
    if (label.includes("growth")) {
        return "Credit is still moving, but the important question is whether borrowers can keep absorbing it under tighter conditions.";
    }
    if (label.includes("discipline")) {
        return "The signal is not yet a full cycle turn, but loan rules and credit terms are moving onto the desk's watchlist.";
    }
    return "The signal is worth watching, but it is not yet strong enough to carry a directional system read.";
}
function bankingWatchClusterHasSystemValue(cluster, clusterStories, visibleThemes) {
    const label = normalizeText(cluster.event_label);
    const promotedLabels = visibleThemes.map((theme) => normalizeText(theme.theme_label));
    const hasCreditTighteningTheme = promotedLabels.some((theme) => theme.includes("credit tightening"));
    if (hasCreditTighteningTheme &&
        cluster.story_count === 1 &&
        (label.includes("watchlist") || label.includes("credit rules"))) {
        return false;
    }
    if (cluster.story_count > 1) {
        return true;
    }
    return clusterStories.some((story) => {
        const signals = story.banking_signals;
        if (!signals) {
            return false;
        }
        const hasBalanceSheetSignal = signals.function.some((fn) => ["deposits", "liquidity", "funding", "risk"].includes(fn));
        return hasBalanceSheetSignal && (story.movement_score ?? 0) >= 5;
    });
}
function bankingWatchClusterLabel(cluster, clusterStories) {
    const label = normalizeText(cluster.event_label);
    const functions = new Set(clusterStories.flatMap((story) => story.banking_signals?.function ?? []));
    if (cluster.story_count === 1 &&
        (label.includes("on watch") ||
            label.includes("watchlist") ||
            label.includes("needs confirmation"))) {
        if (functions.has("liquidity")) {
            return "Liquidity signal";
        }
        if (functions.has("deposits")) {
            return "Deposit signal";
        }
        if (functions.has("funding")) {
            return "Funding signal";
        }
        if (functions.has("risk")) {
            return "Risk signal";
        }
        return "Banking signal";
    }
    return cluster.event_label;
}
function bankingWatchClusterRead(cluster, clusterStories) {
    const functions = new Set(clusterStories.flatMap((story) => story.banking_signals?.function ?? []));
    if (cluster.story_count === 1) {
        if (functions.has("liquidity")) {
            return "One liquidity and reserve signal is worth monitoring, but it needs confirmation before becoming a system read.";
        }
        if (functions.has("deposits")) {
            return "One deposit-linked data point adds funding color, but it needs confirmation before carrying a theme.";
        }
        if (functions.has("funding")) {
            return "One funding signal is useful color, but it is not broad enough yet to define bank behavior.";
        }
    }
    return cluster.compression_line ?? bankingClusterCompression(cluster, clusterStories);
}
function renderBankingStoryLine(lines, story) {
    lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${story.source}`);
}
function bankingClusterCompression(cluster, stories) {
    const label = normalizeText(cluster.event_label);
    const text = normalizeText(stories.map((story) => `${story.title} ${story.summary ?? ""}`).join(" "));
    const hasPolicy = stories.some((story) => story.banking_signals?.driver.includes("policy"));
    const hasLending = stories.some((story) => story.banking_signals?.function.includes("lending"));
    const hasRisk = stories.some((story) => story.banking_signals?.function.includes("risk"));
    const hasRegulation = stories.some((story) => story.banking_signals?.function.includes("regulation"));
    if (label.includes("credit tightening")) {
        if (hasPolicy && hasLending) {
            return "Regulatory and lending signals are pointing in the same direction: tighter credit discipline across the system.";
        }
        return "The cluster points to stricter credit conditions, with banks or regulators becoming less willing to let lending run on autopilot.";
    }
    if (label.includes("risk") || hasRisk || text.includes("bad loans") || text.includes("capacity to pay")) {
        return "Bad-loan and borrower-capacity signals suggest risk is beginning to surface beneath still-active lending.";
    }
    if (label.includes("liquidity")) {
        if (label.includes("easing")) {
            return "The cluster points to easier liquidity conditions, but it still needs confirmation from more bank-behavior signals.";
        }
        return "The grouped stories point to banks preserving buffers rather than stretching balance sheets for growth.";
    }
    if (label.includes("deposit")) {
        return "The grouped stories point to deposit movement that could change funding cost, liquidity, or competitive behavior.";
    }
    if (label.includes("growth")) {
        return "The cluster keeps loan growth in view, but the useful read is whether that growth is becoming harder for borrowers to carry.";
    }
    if (label.includes("discipline") || hasRegulation) {
        return "Loan rules and regulatory signals are putting credit discipline back on the banking desk's watchlist.";
    }
    return "The stories belong together as early banking-system signals, but the direction still needs confirmation.";
}
function renderEditorialRead(lines, packet) {
    lines.push("## Editorial Read");
    lines.push("");
    if (packet.editorial_read.length === 0) {
        lines.push("- There is not enough signal this week for a confident desk read.");
        lines.push("");
        return;
    }
    for (const bullet of packet.editorial_read.slice(0, 4)) {
        lines.push(`- ${sanitizeText(bullet)}`);
    }
    lines.push("");
}
function renderBankingMarkdown(packet, stories, eventClusters, themeClusters) {
    const lines = [];
    const storyMap = buildStoryMapById(stories);
    const clusteredStoryIds = new Set(eventClusters
        .flatMap((cluster) => cluster.story_ids));
    const standaloneStories = stories
        .filter((story) => !clusteredStoryIds.has(story.id))
        .filter((story) => story.editorial_bucket !== "context_watch")
        .filter((story) => story.cluster_classification === "watch")
        .sort((left, right) => (right.priority_score ?? 0) - (left.priority_score ?? 0))
        .slice(0, 8);
    const standaloneStoryIds = new Set(standaloneStories.map((story) => story.id));
    const contextWatch = stories
        .filter((story) => (story.movement_score ?? 0) >= 5)
        .filter((story) => !clusteredStoryIds.has(story.id))
        .filter((story) => !standaloneStoryIds.has(story.id))
        .filter((story) => story.cluster_classification === "watch" || story.editorial_bucket === "context_watch")
        .sort((left, right) => (right.movement_score ?? 0) - (left.movement_score ?? 0))
        .slice(0, 8);
    const visibleThemes = [...themeClusters]
        .sort((left, right) => {
        const rankDelta = bankingThemeRank(right.theme_type) - bankingThemeRank(left.theme_type);
        if (rankDelta !== 0) {
            return rankDelta;
        }
        return right.story_count - left.story_count;
    })
        .filter((theme) => theme.theme_type !== "watch" || theme.story_count >= 2)
        .slice(0, 4);
    const clusterById = new Map(eventClusters.map((cluster) => [cluster.cluster_id, cluster]));
    const coreClusters = visibleThemes.flatMap((theme) => theme.cluster_ids
        .map((clusterId) => clusterById.get(clusterId))
        .filter((cluster) => Boolean(cluster)));
    const coreClusterIds = new Set(coreClusters.map((cluster) => cluster.cluster_id));
    const watchClusters = eventClusters
        .filter((cluster) => !coreClusterIds.has(cluster.cluster_id))
        .filter((cluster) => {
        const clusterStories = cluster.story_ids
            .map((storyId) => storyMap.get(storyId))
            .filter((story) => Boolean(story));
        return bankingWatchClusterHasSystemValue(cluster, clusterStories, visibleThemes);
    })
        .sort((left, right) => {
        const rankDelta = bankingClusterRank(right) - bankingClusterRank(left);
        if (rankDelta !== 0) {
            return rankDelta;
        }
        return right.priority_score - left.priority_score;
    });
    lines.push(`# ${packet.beat_name}`);
    lines.push("");
    lines.push(`Week of ${packet.week_of}`);
    lines.push("");
    renderEditorialRead(lines, packet);
    lines.push("## Themes");
    lines.push("");
    for (const theme of visibleThemes) {
        const themeStories = theme.top_story_refs
            .map((storyId) => storyMap.get(storyId))
            .filter((story) => Boolean(story));
        lines.push(`### ${sanitizeText(theme.theme_label)}`);
        lines.push(bankingThemeRead(theme, themeStories));
        lines.push("");
        for (const story of themeStories.slice(0, 3)) {
            renderBankingStoryLine(lines, story);
        }
        lines.push("");
    }
    lines.push("## Cluster breakdown");
    lines.push("");
    for (const cluster of coreClusters) {
        const clusterStories = cluster.story_ids
            .map((storyId) => storyMap.get(storyId))
            .filter((story) => Boolean(story));
        lines.push(`### ${sanitizeText(cluster.event_label)}`);
        lines.push(bankingClusterCompression(cluster, clusterStories));
        lines.push("");
        for (const story of clusterStories.slice(0, 4)) {
            renderBankingStoryLine(lines, story);
        }
        lines.push("");
    }
    lines.push("## Signals to watch");
    lines.push("");
    if (watchClusters.length === 0) {
        lines.push("- No weaker banking-system signal added enough value outside the main movements.");
    }
    else {
        for (const cluster of watchClusters.slice(0, 6)) {
            const clusterStories = cluster.story_ids
                .map((storyId) => storyMap.get(storyId))
                .filter((story) => Boolean(story));
            const leadStory = clusterStories[0];
            if (!leadStory) {
                continue;
            }
            lines.push(`- **${sanitizeText(bankingWatchClusterLabel(cluster, clusterStories))}:** ${sanitizeText(bankingWatchClusterRead(cluster, clusterStories))} [${sanitizeText(leadStory.title)}](${leadStory.url}) | ${leadStory.source}`);
        }
    }
    lines.push("");
    lines.push("## Standalone signals");
    lines.push("");
    if (standaloneStories.length === 0) {
        lines.push("- No standalone banking-system signal cleared the watch threshold outside the active clusters.");
    }
    else {
        for (const story of standaloneStories) {
            renderBankingStoryLine(lines, story);
        }
    }
    lines.push("");
    lines.push("## Context watch");
    lines.push("");
    if (contextWatch.length === 0) {
        lines.push("- No additional weak banking-system signals cleared the watch threshold.");
    }
    else {
        for (const story of contextWatch) {
            renderBankingStoryLine(lines, story);
        }
    }
    lines.push("");
    return lines.join("\n");
}
function renderEnergyStoryRef(lines, story) {
    const metadata = [
        story.source,
        story.primary_category ? `category: ${story.primary_category}` : "",
        story.importance_tier ? `tier: ${story.importance_tier}` : "",
        story.system_pressure ? "system_pressure" : ""
    ].filter(Boolean).join(" | ");
    lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${metadata}`);
}
function renderEnergyMarkdown(packet) {
    const output = packet.energy_output;
    const lines = [];
    lines.push(`# ${packet.beat_name}`);
    lines.push("");
    lines.push(`Week of ${packet.week_of}`);
    lines.push("");
    if (!output) {
        renderEditorialRead(lines, packet);
        return lines.join("\n");
    }
    renderEditorialRead(lines, packet);
    lines.push("## Themes");
    lines.push("");
    if (output.themes.length === 0) {
        lines.push("- No cluster cleared the Energy theme threshold.");
        lines.push("");
    }
    else {
        for (const theme of output.themes) {
            lines.push(`### ${sanitizeText(theme.theme)}`);
            lines.push(sanitizeText(theme.explanation));
            lines.push("");
            for (const cluster of theme.clusters) {
                lines.push(`- Supporting cluster: ${sanitizeText(cluster.label)} (${cluster.cluster_id})`);
            }
            lines.push("");
        }
    }
    lines.push("## Cluster breakdown");
    lines.push("");
    if (output.cluster_breakdown.length === 0) {
        lines.push("- No Energy movement clusters were formed.");
        lines.push("");
    }
    else {
        for (const cluster of output.cluster_breakdown) {
            lines.push(`### ${sanitizeText(cluster.label)} (${cluster.cluster_id})`);
            if (cluster.theme_label) {
                lines.push(`Theme: ${sanitizeText(cluster.theme_label)}`);
            }
            else {
                lines.push("Theme: none");
            }
            if (cluster.compression_line) {
                lines.push(sanitizeText(cluster.compression_line));
            }
            lines.push("");
            for (const story of cluster.stories) {
                renderEnergyStoryRef(lines, story);
            }
            lines.push("");
        }
    }
    lines.push("## Signals to watch");
    lines.push("");
    if (output.signals_to_watch.length === 0) {
        lines.push("- No unthemed Energy clusters or unclustered signals remain.");
    }
    else {
        for (const signal of output.signals_to_watch) {
            const label = signal.cluster_id
                ? `${sanitizeText(signal.label)} (${signal.cluster_id})`
                : sanitizeText(signal.label);
            lines.push(`### ${label}`);
            if (signal.explanation) {
                lines.push(sanitizeText(signal.explanation));
                lines.push("");
            }
            for (const story of signal.stories) {
                renderEnergyStoryRef(lines, story);
            }
            lines.push("");
        }
    }
    return lines.join("\n");
}
function renderAiTechStoryRef(lines, story) {
    const metadata = [
        story.source,
        story.primary_axis ? `axis: ${story.primary_axis}` : "",
        story.geography ? `geo: ${story.geography}` : "",
        story.importance_tier ? `tier: ${story.importance_tier}` : ""
    ].filter(Boolean).join(" | ");
    lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${metadata}`);
}
function renderAiTechBucket(lines, title, stories, emptyText) {
    lines.push(`## ${title}`);
    lines.push("");
    if (stories.length === 0) {
        lines.push(`- ${emptyText}`);
        lines.push("");
        return;
    }
    for (const story of stories) {
        renderAiTechStoryRef(lines, story);
    }
    lines.push("");
}
function renderAiTechMarkdown(packet) {
    const output = packet.ai_tech_output;
    const lines = [];
    lines.push(`# ${packet.beat_name}`);
    lines.push("");
    lines.push(`Week of ${packet.week_of}`);
    lines.push("");
    renderEditorialRead(lines, packet);
    if (!output) {
        lines.push("## Core Signals");
        lines.push("");
        lines.push("- No Technology / Digital Economy editorial bucket output was generated for this run.");
        lines.push("");
        return lines.join("\n");
    }
    renderAiTechBucket(lines, "Core Signals", output.core_signals, "No hard technology or digital-economy movement is strong enough for Core Signals.");
    renderAiTechBucket(lines, "Interpretation Layer", output.interpretation_layer, "No grounded interpretation cleared the quality gate.");
    renderAiTechBucket(lines, "Technology Watch", output.capability_watch, "No downstream technology enabler, product shift, or market signal is material enough this week.");
    return lines.join("\n");
}
function renderPropertyStoryRef(lines, story) {
    const details = [
        story.primary_axis,
        story.importance_tier,
        story.geography,
        story.stress_signal ? "stress signal" : undefined
    ].filter(Boolean);
    lines.push(`- [${story.title}](${story.url})`);
    lines.push(`  - Source: ${story.source}${details.length > 0 ? ` | ${details.join(" | ")}` : ""}`);
}
function renderPropertyBucket(lines, title, stories, emptyText) {
    lines.push(`## ${title}`);
    lines.push("");
    if (stories.length === 0) {
        lines.push(`- ${emptyText}`);
        lines.push("");
        return;
    }
    for (const story of stories) {
        renderPropertyStoryRef(lines, story);
    }
    lines.push("");
}
function renderPropertyMarkdown(packet) {
    const output = packet.property_output;
    const lines = [];
    lines.push(`# ${packet.beat_name}`);
    lines.push("");
    lines.push(`Week of ${packet.week_of}`);
    lines.push("");
    renderEditorialRead(lines, packet);
    if (!output) {
        lines.push("## Core Signals");
        lines.push("");
        lines.push("- No Property / Real Estate editorial bucket output was generated for this run.");
        lines.push("");
        return lines.join("\n");
    }
    renderPropertyBucket(lines, "Core Signals", output.core_signals, "No hard property-market movement is strong enough for Core Signals.");
    renderPropertyBucket(lines, "Interpretation Layer", output.interpretation_layer, "No grounded pressure reading is strong enough this week.");
    renderPropertyBucket(lines, "Capability Watch", output.capability_watch, "No material financing, REIT, tool, or developer-strategy context stands out this week.");
    return lines.join("\n");
}
function buildPatternBullets(primaryItems, structuralItems, watchlistItems) {
    return [...new Set([...primaryItems, ...structuralItems, ...watchlistItems].map((item) => item.pattern))].slice(0, 5);
}
function renderWeeklyEditorialPacketMarkdown(packet, stories, eventClusters, themeClusters) {
    const lines = [];
    const storyMap = buildStoryMapById(stories);
    const themeItems = themeClusters
        .map((themeCluster) => buildThemeBriefItem(themeCluster, storyMap))
        .sort((left, right) => right.score - left.score);
    const coveredThemeIds = new Set(themeClusters.slice(0, themeItems.length).map((theme) => theme.theme_id));
    const eventItems = eventClusters
        .filter((cluster) => !cluster.primary_theme_id || !coveredThemeIds.has(cluster.primary_theme_id))
        .map((cluster) => buildEventBriefItem(cluster, storyMap))
        .sort((left, right) => right.score - left.score);
    const storyItems = buildStoryBriefItems(stories);
    const storyFirstBeats = new Set([
        "ai_tech",
        "ph_sea_banking",
        "ph_sea_energy",
        "property_real_estate"
    ]);
    const useStorySignalsFirst = stories.some((story) => storyFirstBeats.has(story.beat));
    const primarySignalItems = useStorySignalsFirst ? storyItems : themeItems;
    const secondarySignalItems = useStorySignalsFirst ? themeItems : storyItems;
    const whatMattersMost = sectionUnique(primarySignalItems, 4);
    if (!useStorySignalsFirst && whatMattersMost.length < 5) {
        const seenLabels = new Set(whatMattersMost.map((item) => item.label));
        for (const item of eventItems) {
            if (seenLabels.has(item.label)) {
                continue;
            }
            whatMattersMost.push(item);
            seenLabels.add(item.label);
            if (whatMattersMost.length >= 5) {
                break;
            }
        }
    }
    if (!useStorySignalsFirst && whatMattersMost.length < 5) {
        const seenLabels = new Set(whatMattersMost.map((item) => item.label));
        for (const item of secondarySignalItems) {
            if (seenLabels.has(item.label)) {
                continue;
            }
            whatMattersMost.push(item);
            seenLabels.add(item.label);
            if (whatMattersMost.length >= 5) {
                break;
            }
        }
    }
    const usedStoryIds = new Set(whatMattersMost.flatMap((item) => item.supportingStories.map((story) => story.id)));
    const blockedLabels = new Set(whatMattersMost.map((item) => item.label));
    const structuralShifts = sectionUnique(primarySignalItems
        .slice(4, 10)
        .filter((item) => !blockedLabels.has(item.label))
        .filter((item) => item.supportingStories.some((story) => !usedStoryIds.has(story.id))), 4);
    if (!useStorySignalsFirst && structuralShifts.length < 3) {
        for (const item of eventItems) {
            if (blockedLabels.has(item.label)) {
                continue;
            }
            if (!item.supportingStories.some((story) => !usedStoryIds.has(story.id))) {
                continue;
            }
            structuralShifts.push(item);
            blockedLabels.add(item.label);
            for (const story of item.supportingStories) {
                usedStoryIds.add(story.id);
            }
            if (structuralShifts.length >= 3) {
                break;
            }
        }
    }
    if (!useStorySignalsFirst && structuralShifts.length < 3) {
        for (const item of secondarySignalItems) {
            if (blockedLabels.has(item.label)) {
                continue;
            }
            if (!item.supportingStories.some((story) => !usedStoryIds.has(story.id))) {
                continue;
            }
            structuralShifts.push(item);
            blockedLabels.add(item.label);
            for (const story of item.supportingStories) {
                usedStoryIds.add(story.id);
            }
            if (structuralShifts.length >= 3) {
                break;
            }
        }
    }
    for (const item of structuralShifts) {
        blockedLabels.add(item.label);
        for (const story of item.supportingStories) {
            usedStoryIds.add(story.id);
        }
    }
    const watchlist = buildWatchlistItems(stories, usedStoryIds, blockedLabels).slice(0, 5);
    const isBankingPacket = stories.some((story) => story.beat === "ph_sea_banking");
    const isMotoringPacket = stories.some((story) => story.beat === "philippine_motoring");
    const isPropertyPacket = stories.some((story) => story.beat === "property_real_estate");
    const bankingUsedPhrases = bankingPhraseUse();
    const motoringUsedPhrases = motoringPhraseUse();
    if (isBankingPacket) {
        for (const bullet of packet.editorial_read) {
            rememberBankingPhrase(bullet, bankingUsedPhrases);
        }
    }
    if (isMotoringPacket) {
        for (const bullet of packet.editorial_read) {
            rememberMotoringPhrase(bullet, motoringUsedPhrases);
        }
    }
    const finalWhatMattersMost = isBankingPacket
        ? whatMattersMost.map((item) => diversifyBankingItem(item, "theme", bankingUsedPhrases))
        : isMotoringPacket
            ? whatMattersMost.map((item) => diversifyMotoringItem(item, "theme", motoringUsedPhrases))
            : whatMattersMost;
    const finalStructuralShifts = isBankingPacket
        ? structuralShifts.map((item) => diversifyBankingItem(item, "structural", bankingUsedPhrases))
        : isMotoringPacket
            ? structuralShifts.map((item) => diversifyMotoringItem(item, "structural", motoringUsedPhrases))
            : structuralShifts;
    const finalWatchlist = isBankingPacket
        ? watchlist.map((item) => diversifyBankingItem(item, "structural", bankingUsedPhrases))
        : isMotoringPacket
            ? watchlist.map((item) => diversifyMotoringItem(item, "structural", motoringUsedPhrases))
            : watchlist;
    const patternBullets = buildPatternBullets(finalWhatMattersMost, finalStructuralShifts, finalWatchlist);
    const finalPatternBullets = isPropertyPacket
        ? propertySummaryBullets([...finalWhatMattersMost, ...finalStructuralShifts, ...finalWatchlist], stories)
        : patternBullets.map((bullet) => isBankingPacket
            ? diversifyBankingLine(bullet, "banking summary", stories, "summary", bankingUsedPhrases)
            : isMotoringPacket
                ? diversifyMotoringLine(bullet, "motoring summary", stories, "summary", motoringUsedPhrases)
                : bullet);
    lines.push(`# Weekly Editorial Packet — ${packet.beat_name}`);
    lines.push("");
    lines.push(`Week of ${packet.week_of}`);
    lines.push("");
    renderEditorialRead(lines, packet);
    renderBriefSection(lines, "What matters most", finalWhatMattersMost, "Why it matters");
    renderBriefSection(lines, "Structural shifts", finalStructuralShifts, "Editorial note");
    renderWatchlistSection(lines, finalWatchlist);
    lines.push("## What seems to be happening");
    lines.push("");
    for (const bullet of finalPatternBullets) {
        lines.push(`- ${bullet}`);
    }
    lines.push("");
    return lines.join("\n");
}
function buildWeeklyEditorialPacket(stories, droppedStories, topStoriesSelection, timeMode, fetchedAt, beatName = "Technology / Digital Economy", eventClusters = [], storyThemeClusters = []) {
    const storyMap = buildStoryMap(stories);
    const enrichedTopStories = topStoriesSelection.top_stories.map((story) => enrichTopStory(story, storyMap));
    const enrichedSecondarySignals = topStoriesSelection.secondary_signals.map((story) => enrichSecondaryStory(story, storyMap));
    const droppedTimeModeStories = droppedStories.filter((story) => story.reason === "dropped_time_mode" && story.title && story.date);
    const latestDroppedDate = droppedTimeModeStories.length > 0
        ? droppedTimeModeStories
            .map((story) => new Date(story.date ?? fetchedAt).getTime())
            .reduce((latest, current) => Math.max(latest, current), 0)
        : new Date(fetchedAt).getTime();
    const contextWatch = droppedTimeModeStories
        .map((story) => scoreContextDrop(story, latestDroppedDate))
        .filter((story) => story.context_score > 0)
        .sort((left, right) => {
        if (right.context_score !== left.context_score) {
            return right.context_score - left.context_score;
        }
        return right.date.localeCompare(left.date);
    })
        .slice(0, 15);
    const themeClusters = buildThemeClusters(enrichedTopStories, enrichedSecondarySignals);
    const energyOutput = buildEnergyEditorialOutput(stories, eventClusters, storyThemeClusters);
    const aiTechOutput = buildAiTechEditorialOutput(stories);
    const propertyOutput = buildPropertyEditorialOutput(stories);
    const editorialRead = buildSharedEditorialRead(stories, beatName, storyThemeClusters);
    const bucketedOutput = energyOutput || propertyOutput;
    return {
        week_of: getWeekOf(stories, fetchedAt),
        time_mode: timeMode,
        beat_name: beatName,
        editorial_read: editorialRead,
        top_stories: bucketedOutput ? [] : enrichedTopStories,
        secondary_signals: bucketedOutput ? [] : enrichedSecondarySignals,
        context_watch: bucketedOutput ? [] : contextWatch,
        theme_clusters: bucketedOutput ? [] : themeClusters,
        energy_output: energyOutput,
        ai_tech_output: aiTechOutput,
        property_output: propertyOutput,
        notes: {
            top_story_count: bucketedOutput ? 0 : enrichedTopStories.length,
            secondary_count: bucketedOutput ? 0 : enrichedSecondarySignals.length,
            context_count: bucketedOutput ? 0 : contextWatch.length
        }
    };
}
