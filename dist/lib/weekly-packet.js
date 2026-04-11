"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderWeeklyEditorialPacketMarkdown = renderWeeklyEditorialPacketMarkdown;
exports.buildWeeklyEditorialPacket = buildWeeklyEditorialPacket;
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
        sentences.push(`${title} was one of the strongest AI tech developments in this run.`);
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
        if (text.includes("lto") ||
            text.includes("dotr") ||
            text.includes("enforcement") ||
            text.includes("registration") ||
            text.includes("regulation")) {
            candidates.push("Shows where road rules are starting to meet actual driver behavior.");
            candidates.push("Makes enforcement part of the motoring cost and discipline story.");
        }
        if (text.includes("diesel") ||
            text.includes("gasoline") ||
            text.includes("fuel") ||
            text.includes("oil") ||
            text.includes("rollback")) {
            candidates.push("Makes fuel-price pressure part of the buyer and operator story.");
            candidates.push("Shows how pump-price swings can quickly change household and fleet costs.");
        }
        if (text.includes("price") ||
            text.includes("pricing") ||
            text.includes("srp") ||
            text.includes("priced") ||
            text.includes("starting price")) {
            candidates.push("Makes the affordability test visible, not just the launch claim.");
            candidates.push("Shows how brands are using price to keep buyers in the market.");
        }
        if (/\bev\b/.test(text) ||
            /\bevs\b/.test(text) ||
            text.includes("hybrid") ||
            text.includes("phev") ||
            text.includes("electrified")) {
            candidates.push("Shows how electrified models are being pushed into a still-cost-sensitive market.");
            candidates.push("Keeps the EV transition tied to price, range, and everyday usability.");
        }
        if (text.includes("charging") || text.includes("charger") || text.includes("infrastructure")) {
            candidates.push("Makes the charging and infrastructure gap harder to avoid.");
            candidates.push("Shows where EV ambition still depends on practical access.");
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
            text.includes("operators")) {
            candidates.push("Shows how operating costs are changing the fleet and mobility equation.");
            candidates.push("Makes commercial usage a test case for broader adoption.");
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
    if (!looksLikeRawThemeLabel(story.theme_label)) {
        return sanitizeText(story.theme_label ?? story.title);
    }
    const derived = deriveEditorialLabel(story.theme_label ?? story.title, story.reason_code ? [story.reason_code] : [], story.angle_signals ?? [], [story]);
    if (looksLikeRawThemeLabel(derived)) {
        return fallbackEditorialLabel(story);
    }
    return derived;
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
    const finalSupportingStories = filteredSupportingStories.length > 0
        ? filteredSupportingStories
        : supportingStories.slice(0, 2);
    const patternAndTension = inferPatternAndTensionForLabel(label, dominantReasonCodes, dominantAngles);
    return {
        label,
        score,
        whyItMatters: buildEditorialWhyLineForLabel(label, dominantReasonCodes, dominantAngles, reasonKept),
        pattern: patternAndTension.pattern,
        tension: patternAndTension.tension,
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
    const supportingStories = pickSupportingStories(stories, 3).filter((story) => themeSanityScore(story, label, reasonCodes, angles) >= 1);
    return {
        label,
        score,
        whyItMatters: buildEditorialWhyLineForLabel(label, reasonCodes, angles, reasonKept),
        pattern: patternAndTension.pattern,
        tension: patternAndTension.tension,
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
        return {
            label,
            score: story.priority_score ?? 0,
            whyItMatters: buildEditorialWhyLineForLabel(label, reasonCodes, angles, story.reason_kept),
            pattern: patternAndTension.pattern,
            tension: patternAndTension.tension,
            supportingStories: [story]
        };
    });
}
function renderSupportingStory(lines, story, usedReasons) {
    lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${story.source} | ${supportingReason(story, usedReasons)}`);
}
function renderBriefSection(lines, title, items, introLabel) {
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
function bankingSystemRead(stories, themeClusters) {
    if (stories.length === 0) {
        return "No qualifying banking-system signal cleared the editorial gates in this run.";
    }
    const labels = themeClusters.map((theme) => normalizeText(theme.theme_label));
    const hasCreditTightening = labels.some((label) => label.includes("credit tightening"));
    const hasRisk = labels.some((label) => label.includes("risk"));
    const hasLiquidity = labels.some((label) => label.includes("liquidity"));
    const hasDepositShift = labels.some((label) => label.includes("deposit"));
    const hasGrowthStrain = labels.some((label) => label.includes("growth"));
    if (hasCreditTightening && hasRisk) {
        return "Credit conditions are starting to tighten, with regulators reinforcing lending discipline while early signs of borrower stress begin to surface.";
    }
    if (hasCreditTightening) {
        return "Credit conditions are starting to tighten as policy and lending signals point toward stricter discipline across the banking system.";
    }
    if (hasRisk && hasGrowthStrain) {
        return "Loan activity is still present, but borrower-capacity and bad-loan signals suggest growth is beginning to carry more visible risk.";
    }
    if (hasLiquidity) {
        return "Banks appear to be preserving liquidity, with caution taking priority over balance-sheet expansion.";
    }
    if (hasDepositShift) {
        return "Deposit behavior is starting to shift, raising the importance of funding cost and liquidity management.";
    }
    return "The run produced only watch-level banking signals, so the desk read should stay cautious until stronger system behavior appears.";
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
    lines.push("## Editorial read");
    lines.push("");
    lines.push(bankingSystemRead(stories, themeClusters));
    lines.push("");
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
function buildPatternBullets(primaryItems, structuralItems, watchlistItems) {
    return [...new Set([...primaryItems, ...structuralItems, ...watchlistItems].map((item) => item.pattern))].slice(0, 5);
}
function renderWeeklyEditorialPacketMarkdown(packet, stories, eventClusters, themeClusters) {
    if (stories.every((story) => story.beat === "ph_sea_banking")) {
        return renderBankingMarkdown(packet, stories, eventClusters, themeClusters);
    }
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
    const whatMattersMost = sectionUnique(themeItems, 4);
    if (whatMattersMost.length < 5) {
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
    const usedStoryIds = new Set(whatMattersMost.flatMap((item) => item.supportingStories.map((story) => story.id)));
    const blockedLabels = new Set(whatMattersMost.map((item) => item.label));
    const structuralShifts = sectionUnique(themeItems
        .slice(4, 10)
        .filter((item) => !blockedLabels.has(item.label))
        .filter((item) => item.supportingStories.some((story) => !usedStoryIds.has(story.id))), 4);
    if (structuralShifts.length < 3) {
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
    for (const item of structuralShifts) {
        blockedLabels.add(item.label);
        for (const story of item.supportingStories) {
            usedStoryIds.add(story.id);
        }
    }
    const watchlist = buildWatchlistItems(stories, usedStoryIds, blockedLabels).slice(0, 5);
    const patternBullets = buildPatternBullets(whatMattersMost, structuralShifts, watchlist);
    lines.push(`# Weekly Editorial Packet — ${packet.beat_name}`);
    lines.push("");
    lines.push(`Week of ${packet.week_of}`);
    lines.push("");
    renderBriefSection(lines, "What matters most", whatMattersMost, "Why it matters");
    renderBriefSection(lines, "Structural shifts", structuralShifts, "Editorial note");
    renderWatchlistSection(lines, watchlist);
    lines.push("## What seems to be happening");
    lines.push("");
    for (const bullet of patternBullets) {
        lines.push(`- ${bullet}`);
    }
    lines.push("");
    return lines.join("\n");
}
function buildWeeklyEditorialPacket(stories, droppedStories, topStoriesSelection, timeMode, fetchedAt, beatName = "AI / Tech") {
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
    return {
        week_of: getWeekOf(stories, fetchedAt),
        time_mode: timeMode,
        beat_name: beatName,
        top_stories: enrichedTopStories,
        secondary_signals: enrichedSecondarySignals,
        context_watch: contextWatch,
        theme_clusters: themeClusters,
        notes: {
            top_story_count: enrichedTopStories.length,
            secondary_count: enrichedSecondarySignals.length,
            context_count: contextWatch.length
        }
    };
}
