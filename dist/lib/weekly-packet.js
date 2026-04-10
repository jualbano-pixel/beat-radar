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
    if (text.includes("economic proposals") ||
        text.includes("economic proposal") ||
        text.includes("dc thinks")) {
        return "AI policy signaling";
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
function supportingReason(story) {
    const primary = story.reason_kept[0] ?? "";
    if (!isWeakReason(primary)) {
        return primary;
    }
    if (story.reason_code === "execution_consequence") {
        return "Makes the operating bottleneck concrete.";
    }
    if (story.reason_code === "policy_regulatory_move") {
        return "Adds a real policy or compliance consequence.";
    }
    if (story.reason_code === "market_signal") {
        return "Puts demand, pricing, or positioning pressure into plain view.";
    }
    if (story.reason_code === "industry_repositioning") {
        return "Clarifies a concrete competitive move.";
    }
    if (story.reason_code === "meaningful_shift") {
        return "Marks a directional change instead of another incremental update.";
    }
    if (story.angle_signals?.some((angle) => angle.includes("infrastructure"))) {
        return "Makes the infrastructure strain visible.";
    }
    if (story.angle_signals?.some((angle) => angle.includes("adoption"))) {
        return "Makes the enterprise push concrete.";
    }
    if (story.angle_signals?.some((angle) => angle.includes("policy"))) {
        return "Shows where policy pressure is starting to bite.";
    }
    return "Adds a concrete supporting signal inside this theme.";
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
    return deriveEditorialLabel(story.theme_label ?? story.title, story.reason_code ? [story.reason_code] : [], story.angle_signals ?? [], [story]);
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
function renderSupportingStory(lines, story) {
    lines.push(`- [${sanitizeText(story.title)}](${story.url}) | ${story.source} | ${supportingReason(story)}`);
}
function renderBriefSection(lines, title, items, introLabel) {
    lines.push(`## ${title}`);
    lines.push("");
    for (const item of items) {
        lines.push(`### ${item.label}`);
        lines.push(`- ${introLabel}: ${item.whyItMatters}`);
        lines.push(`- Pattern: ${item.pattern}`);
        lines.push(`- ${item.tension}`);
        lines.push(`- Supporting stories:`);
        for (const story of item.supportingStories) {
            renderSupportingStory(lines, story);
        }
        lines.push("");
    }
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
    lines.push("# Weekly Editorial Packet");
    lines.push("");
    lines.push(`Week of ${packet.week_of}`);
    lines.push("");
    renderBriefSection(lines, "What matters most", whatMattersMost, "Why it matters");
    renderBriefSection(lines, "Structural shifts", structuralShifts, "Editorial note");
    renderBriefSection(lines, "Watchlist", watchlist, "Why to watch");
    lines.push("## What seems to be happening");
    lines.push("");
    for (const bullet of patternBullets) {
        lines.push(`- ${bullet}`);
    }
    lines.push("");
    return lines.join("\n");
}
function buildWeeklyEditorialPacket(stories, droppedStories, topStoriesSelection, timeMode, fetchedAt) {
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
