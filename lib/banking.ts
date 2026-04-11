import type {
  BankingDirection,
  BankingDriver,
  BankingEntityType,
  BankingFunction,
  BankingScope,
  BankingSignals,
  NormalizedStory
} from "./types.js";

type BankingClassification = {
  hardExcluded: boolean;
  exclusionReason?: string;
  passesGate: boolean;
  functions: BankingFunction[];
  directions: BankingDirection[];
  scope: BankingScope;
  drivers: BankingDriver[];
  entityTypes: BankingEntityType[];
  isPhilippines: boolean;
  isRegional: boolean;
  isStateBankSignal: boolean;
  isDigitalOnly: boolean;
  isShallowEarnings: boolean;
  weakSourcing: boolean;
  score: BankingSignals["score_dimensions"];
  movementScore: number;
  totalScore: number;
};

export const BANKING_SOURCE_TIERS: Record<string, number> = {
  "BusinessWorld Banking": 1,
  "BusinessMirror Business": 1,
  "Inquirer Business": 1,
  "Philstar Business": 1,
  "Manila Bulletin Business": 1,
  "Reuters Asia Banking": 2,
  "Nikkei Asia Business": 2,
  "The Business Times Banking": 2,
  "Jakarta Post Business": 2,
  "VNExpress Business": 2,
  "Bangko Sentral ng Pilipinas": 3,
  "Department of Finance": 3,
  "Development Bank of the Philippines": 3,
  "Asian Development Bank": 3,
  "Fitch Ratings Banks": 4,
  "Moody's Banking": 4,
  "S&P Global Banking": 4
};

const BANKING_ANCHORS = [
  "bank",
  "banks",
  "banking",
  "lender",
  "lenders",
  "loan",
  "loans",
  "credit",
  "deposit",
  "deposits",
  "casa",
  "time deposit",
  "deposit rate",
  "liquidity",
  "reserves",
  "funding",
  "cost of funds",
  "margin pressure",
  "capital",
  "bsp",
  "central bank",
  "npl",
  "non-performing loan",
  "nonperforming loan"
];

const FUNCTION_KEYWORDS: Record<BankingFunction, string[]> = {
  lending: [
    "loan",
    "loans",
    "lending",
    "credit",
    "borrowers",
    "consumer loans",
    "corporate loans",
    "sme lending",
    "loan growth",
    "credit growth",
    "reserve requirement"
  ],
  deposits: [
    "deposit",
    "deposits",
    "deposit base",
    "customer deposits",
    "depositors",
    "casa",
    "casa ratio",
    "current account savings account",
    "savings",
    "time deposit",
    "time deposits",
    "term deposit",
    "term deposits",
    "deposit mix",
    "deposit rate",
    "deposit rates",
    "deposit growth",
    "deposit decline",
    "deposit inflow",
    "deposit inflows",
    "deposit outflow",
    "deposit outflows",
    "fund flow",
    "fund flows",
    "fund migration",
    "deposit migration",
    "low-cost deposits",
    "high-yield deposits"
  ],
  liquidity: [
    "liquidity",
    "system liquidity",
    "liquidity conditions",
    "liquidity tightening",
    "liquidity easing",
    "liquidity buffer",
    "liquidity buffers",
    "liquid assets",
    "high quality liquid assets",
    "hqlas",
    "cash buffer",
    "cash buffers",
    "reserve",
    "reserves",
    "bank reserves",
    "excess reserves",
    "reserve buffer",
    "reserve buffers",
    "statutory reserves",
    "rrr",
    "reserve requirement",
    "liquidity coverage",
    "liquidity coverage ratio",
    "lcr"
  ],
  funding: [
    "funding",
    "funding mix",
    "funding pressure",
    "funding pressures",
    "bond issue",
    "bond issuance",
    "notes",
    "debt issuance",
    "capital raise",
    "capital raising",
    "wholesale funding",
    "wholesale borrowings",
    "interbank borrowing",
    "certificate of deposit",
    "certificates of deposit",
    "funding cost",
    "funding costs",
    "cost of funds",
    "cost of funding",
    "margin",
    "margins",
    "margin pressure",
    "margin compression",
    "net interest margin",
    "nim",
    "nim pressure"
  ],
  risk: [
    "risk",
    "npl",
    "non-performing",
    "nonperforming",
    "provision",
    "provisions",
    "provisioning",
    "restructuring",
    "credit loss",
    "stress",
    "exposure",
    "real estate exposure",
    "default"
  ],
  regulation: [
    "bsp",
    "central bank",
    "regulation",
    "regulatory",
    "supervision",
    "capital adequacy",
    "capital requirement",
    "compliance",
    "monetary board",
    "dof"
  ],
  digital_shift: [
    "digital bank",
    "digital banking",
    "fintech",
    "e-wallet",
    "wallet",
    "app",
    "online banking",
    "payments",
    "platform"
  ]
};

const DIRECTION_KEYWORDS: Record<BankingDirection, string[]> = {
  rising: ["rise", "rises", "rising", "increase", "increases", "growth", "grow", "grew", "higher", "expand", "expansion", "inflow", "inflows"],
  falling: ["fall", "falls", "falling", "decline", "declines", "drop", "drops", "lower", "slowdown", "weaker", "outflow", "outflows", "runoff"],
  tightening: ["tighten", "tightening", "stricter", "curb", "cap", "limit", "slow lending", "conservative", "liquidity tightening"],
  loosening: ["loosen", "loosening", "easing", "cut reserve", "lower requirements", "stimulus", "expand credit", "liquidity easing"],
  shifting: ["shift", "shifting", "migration", "reroute", "rerouted", "move to", "reallocate", "rotation", "deposit mix", "fund flows", "fund migration"],
  preserving: ["preserve", "preserving", "buffer", "buffers", "cautious", "defensive", "liquidity buffer", "cash buffer", "reserve buffer", "conserve"],
  repricing: ["reprice", "repricing", "margin pressure", "margin compression", "funding cost", "funding costs", "cost of funds", "higher yield", "deposit rate", "deposit rates", "rate reset", "spread"]
};

const PHILIPPINE_TERMS = [
  "philippines",
  "philippine",
  "manila",
  "bsp",
  "bangko sentral",
  "dof",
  "dbp",
  "landbank",
  "bdo",
  "bpi",
  "metrobank",
  "security bank",
  "unionbank",
  "rcbc",
  "eastwest",
  "chinabank",
  "pnb",
  "peso",
  "php"
];

const REGIONAL_TERMS = [
  "southeast asia",
  "asean",
  "asia",
  "singapore",
  "indonesia",
  "vietnam",
  "thailand",
  "malaysia",
  "regional",
  "emerging asia"
];

const REGIONAL_CONTEXT_TERMS = [
  "spillover",
  "comparison",
  "comparative",
  "similar",
  "regional",
  "asean",
  "across southeast asia",
  "emerging asia",
  "banking system",
  "credit cycle",
  "deposit",
  "deposits",
  "funding",
  "liquidity",
  "system liquidity",
  "liquidity conditions",
  "risk"
];

const HARD_EXCLUSION_PATTERNS = [
  /\b(award|awards|recognized as|named best|wins best)\b/i,
  /\b(branch opening|opens branch|new branch|branch network expansion)\b/i,
  /\b(appoints|appointed|appointment|new ceo|new president|new chairman)\b/i,
  /\b(promo|promotion|cashback|credit card promo|best bank account|best savings account)\b/i,
  /\b(how to|tips|guide|advice|where to save|best credit cards?)\b/i,
  /\b(stock pick|buy rating|sell rating|target price|share price|dividend play|trading idea)\b/i,
  /\b(sponsored|press release|media release)\b/i
];

const PR_PATTERN_GROUPS: Record<string, RegExp[]> = {
  awards: [
    /\b(award|awards|awarded|winner|wins|won|recognized|recognised|recognition)\b/i,
    /\b(named|cited|ranked)\s+(best|top|leading|outstanding|most trusted)\b/i,
    /\b(best bank|best digital bank|bank of the year|employer of choice)\b/i
  ],
  partnerships: [
    /\b(partner|partners|partnered|partnership|collaboration|collaborates|alliance)\b/i,
    /\b(memorandum of agreement|memorandum of understanding|moa|mou|tie-up|ties up)\b/i,
    /\b(inks|signs|signed|seal|sealed)\s+(deal|agreement|partnership|moa|mou)\b/i
  ],
  product_launches: [
    /\b(launch|launches|launched|rolls out|rolled out|unveils|unveiled|introduces|introduced)\b/i,
    /\b(new|latest)\s+(app|feature|platform|service|product|card|account|loan product|deposit product)\b/i,
    /\b(app launch|product launch|digital feature|mobile app|online platform)\b/i
  ],
  branch_openings: [
    /\b(branch opening|opens branch|opened branch|new branch|inaugurates branch)\b/i,
    /\b(expands|expanded|expanding)\s+(branch|branch network|physical network)\b/i,
    /\b(new|first)\s+(branch|banking center|banking centre|office)\b/i
  ],
  executive_announcements: [
    /\b(appoints|appointed|appointment|names|named|elects|elected)\b/i,
    /\b(new|incoming|retiring)\s+(ceo|president|chairman|chairperson|director|chief|head)\b/i,
    /\b(management change|leadership change|board change|joins as|steps down|resigns)\b/i
  ]
};

const PR_BALANCE_SHEET_OR_BEHAVIOR_TERMS = [
  "deposit growth",
  "deposit decline",
  "deposit inflow",
  "deposit inflows",
  "deposit outflow",
  "deposit outflows",
  "deposit migration",
  "deposit mix",
  "casa ratio",
  "time deposits",
  "fund flows",
  "fund migration",
  "loan growth",
  "credit growth",
  "lending slowdown",
  "slow lending",
  "tighten lending",
  "tightening",
  "loosening",
  "risk appetite",
  "credit appetite",
  "repricing",
  "funding cost",
  "funding costs",
  "cost of funds",
  "cost of funding",
  "margin pressure",
  "margin compression",
  "net interest margin",
  "nim pressure",
  "liquidity conditions",
  "system liquidity",
  "liquidity tightening",
  "liquidity easing",
  "liquidity buffer",
  "liquidity buffers",
  "reserve buffer",
  "bank reserves",
  "excess reserves",
  "npl",
  "non-performing",
  "nonperforming",
  "provision",
  "provisions",
  "provisioning",
  "credit loss",
  "borrower capacity",
  "capacity to pay",
  "restructuring",
  "stress indicators"
];

const EARNINGS_TERMS = ["profit", "profits", "earnings", "income", "net income", "quarterly results"];
const EARNINGS_MECHANISM_TERMS = [
  "loan",
  "loans",
  "deposit",
  "deposits",
  "deposit mix",
  "deposit growth",
  "deposit rates",
  "provision",
  "provisions",
  "npl",
  "margin",
  "net interest margin",
  "funding cost",
  "funding costs",
  "cost of funds",
  "margin pressure",
  "risk",
  "credit cost",
  "lending",
  "liquidity",
  "liquidity buffers",
  "reserves"
];

const WEAK_SOURCING_TERMS = ["experts say", "analysts say", "could", "may", "might", "opinion", "commentary"];

const BANKING_BEHAVIOR_TERMS = [
  "banks",
  "banking",
  "lender",
  "lenders",
  "loan",
  "loans",
  "lending",
  "borrower",
  "borrowers",
  "deposit",
  "deposits",
  "deposit growth",
  "deposit decline",
  "deposit mix",
  "deposit rate",
  "deposit rates",
  "casa",
  "time deposits",
  "fund flows",
  "fund migration",
  "liquidity",
  "system liquidity",
  "liquidity conditions",
  "liquidity buffer",
  "liquidity buffers",
  "reserves",
  "reserve buffer",
  "funding",
  "funding cost",
  "funding costs",
  "cost of funds",
  "wholesale funding",
  "wholesale borrowings",
  "margin pressure",
  "margin compression",
  "net interest margin",
  "npl",
  "non-performing",
  "provision",
  "provisioning",
  "risk appetite",
  "credit appetite",
  "credit growth",
  "loan growth",
  "capital adequacy",
  "reserve requirement",
  "nim pressure"
];

const POLICY_BANKING_BEHAVIOR_TERMS = [
  "monetary policy",
  "policy tightening",
  "policy easing",
  "rate cut",
  "rate hike",
  "interest rate",
  "inflation broadens",
  "reserve requirement",
  "capital requirement",
  "bank regulation",
  "banking regulation",
    "loan terms",
    "lending rules",
    "salary loan",
    "liquidity",
    "liquidity conditions",
    "system liquidity",
    "bank reserves"
  ];

export function normalizeBankingText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(text: string, keyword: string): boolean {
  const haystack = normalizeBankingText(text);
  const needle = normalizeBankingText(keyword);

  if (!haystack || !needle) {
    return false;
  }

  if (needle.includes(" ")) {
    return haystack.includes(needle);
  }

  return new RegExp(`(^|\\s)${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(haystack);
}

function countHits(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => count + (hasKeyword(text, keyword) ? 1 : 0), 0);
}

function matchingPrPatternGroups(text: string): string[] {
  return Object.entries(PR_PATTERN_GROUPS)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(text)))
    .map(([group]) => group);
}

function matchingKeys<T extends string>(text: string, rules: Record<T, string[]>): T[] {
  return (Object.keys(rules) as T[]).filter((key) => countHits(text, rules[key]) > 0);
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function detectScope(text: string): BankingScope {
  if (
    countHits(text, ["banking system", "banks", "sector", "industry", "systemwide", "financial system"]) > 0 ||
    countHits(text, ["bsp", "central bank", "reserve requirement", "capital requirement"]) > 0
  ) {
    return "system";
  }

  if (countHits(text, ["several banks", "lenders", "big banks", "banking group", "banks"]) > 0) {
    return "multi_bank";
  }

  return "single_bank";
}

function detectDrivers(text: string, source: string): BankingDriver[] {
  const drivers: BankingDriver[] = [];

  if (countHits(text, ["bsp", "central bank", "dof", "regulation", "policy", "reserve requirement"]) > 0) {
    drivers.push("policy");
  }

  if (countHits(text, ["rates", "market", "yield", "funding cost", "deposit competition", "inflation"]) > 0) {
    drivers.push("market");
  }

  if (countHits(text, ["bank", "banks", "lender", "landbank", "dbp", "bdo", "bpi", "metrobank"]) > 0) {
    drivers.push("institution");
  }

  if (countHits(text, REGIONAL_TERMS) > 0 || (BANKING_SOURCE_TIERS[source] ?? 0) === 2) {
    drivers.push("regional");
  }

  return drivers.length > 0 ? [...new Set(drivers)] : ["institution"];
}

function detectEntityTypes(text: string): BankingEntityType[] {
  const entityTypes: BankingEntityType[] = [];

  if (countHits(text, ["landbank", "dbp", "development bank of the philippines", "state bank", "state-owned bank"]) > 0) {
    entityTypes.push("state_bank");
  }

  if (countHits(text, ["bsp", "bangko sentral", "central bank", "dof", "regulator"]) > 0) {
    entityTypes.push("regulator");
  }

  if (countHits(text, ["adb", "asian development bank", "world bank", "imf"]) > 0) {
    entityTypes.push("multilateral");
  }

  if (countHits(text, ["bdo", "bpi", "metrobank", "security bank", "unionbank", "rcbc", "eastwest", "chinabank", "pnb", "private bank"]) > 0) {
    entityTypes.push("private_bank");
  }

  return entityTypes.length > 0 ? [...new Set(entityTypes)] : ["private_bank"];
}

function hasDigitalMechanism(text: string): boolean {
  return countHits(text, [
    "deposit",
    "deposits",
    "deposit growth",
    "deposit rates",
    "deposit migration",
    "lending",
    "loan",
    "loans",
    "fund migration",
    "fund flows",
    "cost structure",
    "funding cost",
    "cost of funds",
    "margin pressure",
    "customer acquisition cost",
    "fee income",
    "competitive pressure"
  ]) > 0;
}

function scoreSystemImpact(functions: BankingFunction[], scope: BankingScope, drivers: BankingDriver[], entityTypes: BankingEntityType[]): number {
  let score = scope === "system" ? 4 : scope === "multi_bank" ? 3 : 2;

  if (functions.some((fn) => ["liquidity", "deposits", "funding", "lending", "risk"].includes(fn))) {
    score += 1;
  }

  if (drivers.includes("policy") || entityTypes.includes("regulator") || entityTypes.includes("multilateral")) {
    score += 1;
  }

  if (entityTypes.includes("state_bank") && scope === "single_bank") {
    score -= 1;
  }

  return clamp(score, 5);
}

function scoreBehaviorSignal(directions: BankingDirection[], functions: BankingFunction[]): number {
  if (directions.length >= 2) {
    return 5;
  }

  if (directions.length === 1 && functions.length >= 2) {
    return 4;
  }

  if (directions.length === 1) {
    return 3;
  }

  return functions.length >= 2 ? 2 : 1;
}

function scoreSignalStrength(text: string): number {
  let score = 1;

  if (/\b\d+(\.\d+)?\s?(%|percent|basis points|bps|billion|million|trillion)\b/i.test(text)) {
    score += 2;
  }

  if (
    countHits(text, [
      "data",
      "reported",
      "disclosed",
      "said",
      "filing",
      "loan growth",
      "deposit growth",
      "deposit decline",
      "deposit mix",
      "funding cost",
      "cost of funds",
      "liquidity conditions",
      "system liquidity",
      "npl ratio"
    ]) > 0
  ) {
    score += 1;
  }

  if (countHits(text, ["approved", "raised", "cut", "reduced", "increased", "tightened", "eased"]) > 0) {
    score += 1;
  }

  return clamp(score, 5);
}

function scoreCrossConfirmation(source: string, scope: BankingScope, drivers: BankingDriver[]): number {
  const tier = BANKING_SOURCE_TIERS[source] ?? 2;

  if (scope === "system" && (tier === 1 || tier === 3)) {
    return 3;
  }

  if (drivers.includes("regional") && tier === 2) {
    return 2;
  }

  if (tier <= 3) {
    return 1;
  }

  return 1;
}

function scoreEditorialValue(functions: BankingFunction[], directions: BankingDirection[], isPhilippines: boolean, isRegional: boolean): number {
  if (isPhilippines && functions.length > 0 && directions.length > 0) {
    return 2;
  }

  if (isRegional && functions.some((fn) => ["liquidity", "risk", "funding", "regulation"].includes(fn))) {
    return 2;
  }

  return functions.length > 0 ? 1 : 0;
}

export function classifyBankingStory(story: NormalizedStory): BankingClassification {
  const text = `${story.title} ${story.summary ?? ""}`;
  const normalized = normalizeBankingText(text);
  const functions = matchingKeys(text, FUNCTION_KEYWORDS);
  const directions = matchingKeys(text, DIRECTION_KEYWORDS);
  const isPhilippines = countHits(text, PHILIPPINE_TERMS) > 0;
  const isRegional = countHits(text, REGIONAL_TERMS) > 0;
  const hasAnchor = countHits(text, BANKING_ANCHORS) > 0;
  const isDigitalOnly = functions.includes("digital_shift") && functions.length === 1;
  const isShallowEarnings =
    countHits(text, EARNINGS_TERMS) > 0 && countHits(text, EARNINGS_MECHANISM_TERMS) === 0;
  const weakSourcing = countHits(text, WEAK_SOURCING_TERMS) > 0 && !/\b\d+(\.\d+)?\b/.test(normalized);
  const hasBankingBehaviorMechanism =
    countHits(text, BANKING_BEHAVIOR_TERMS) > 0 ||
    (
      functions.includes("regulation") &&
      directions.length > 0 &&
      countHits(text, POLICY_BANKING_BEHAVIOR_TERMS) > 0
    );
  const prPatternGroups = matchingPrPatternGroups(text);
  const hasPrPattern = prPatternGroups.length > 0;
  const hasConcretePrBalanceSheetOrBehaviorSignal =
    countHits(text, PR_BALANCE_SHEET_OR_BEHAVIOR_TERMS) > 0 ||
    (
      directions.length > 0 &&
      functions.some((fn) => ["deposits", "lending", "liquidity", "funding", "risk"].includes(fn))
    ) ||
    (
      functions.includes("regulation") &&
      directions.length > 0 &&
      countHits(text, POLICY_BANKING_BEHAVIOR_TERMS) > 0
    );
  const isPrWithoutBankingSignal =
    hasPrPattern && !hasConcretePrBalanceSheetOrBehaviorSignal;
  const scope = detectScope(text);
  const drivers = detectDrivers(text, story.source);
  const entityTypes = detectEntityTypes(text);
  const isStateBankSignal = entityTypes.includes("state_bank");
  const regionalHasContext =
    !isRegional ||
    isPhilippines ||
    countHits(text, REGIONAL_CONTEXT_TERMS) > 0 ||
    functions.some((fn) => ["liquidity", "funding", "risk", "regulation"].includes(fn));
  const hardExcluded =
    HARD_EXCLUSION_PATTERNS.some((pattern) => pattern.test(text)) ||
    isPrWithoutBankingSignal ||
    isShallowEarnings ||
    (isDigitalOnly && !hasDigitalMechanism(text)) ||
    !hasBankingBehaviorMechanism ||
    (!isPhilippines && isRegional && !regionalHasContext);
  const exclusionReason = HARD_EXCLUSION_PATTERNS.some((pattern) => pattern.test(text))
    ? "Matched banking beat hard exclusion"
    : isPrWithoutBankingSignal
      ? `PR-pattern story lacked balance-sheet or behavior signal: ${prPatternGroups.join(", ")}`
    : isShallowEarnings
      ? "Earnings item lacked lending, deposit, provisioning, margin, funding, or risk mechanism"
      : isDigitalOnly && !hasDigitalMechanism(text)
        ? "Digital banking item lacked deposit, lending, cost, or competitive banking-system mechanism"
        : !hasBankingBehaviorMechanism
          ? "Item lacked a concrete deposits, lending, liquidity, funding, risk, or bank-behavior mechanism"
        : !isPhilippines && isRegional && !regionalHasContext
          ? "Regional item lacked Philippine banking context, comparison, or system signal"
          : undefined;
  const passesGate =
    !hardExcluded &&
    hasAnchor &&
    functions.length > 0 &&
    (isPhilippines || (isRegional && regionalHasContext)) &&
    (!isDigitalOnly || hasDigitalMechanism(text));
  const systemImpact = scoreSystemImpact(functions, scope, drivers, entityTypes);
  const behaviorSignal = scoreBehaviorSignal(directions, functions);
  const signalStrength = scoreSignalStrength(text);
  const crossConfirmation = scoreCrossConfirmation(story.source, scope, drivers);
  const editorialValue = scoreEditorialValue(functions, directions, isPhilippines, isRegional);
  let penalties = 0;

  if (HARD_EXCLUSION_PATTERNS.some((pattern) => pattern.test(text))) {
    penalties -= 5;
  }

  if (isShallowEarnings) {
    penalties -= 3;
  }

  if (weakSourcing) {
    penalties -= 1;
  }

  const movementScore = systemImpact + behaviorSignal;
  const score = {
    system_impact: systemImpact,
    behavior_signal: behaviorSignal,
    signal_strength: signalStrength,
    cross_confirmation: crossConfirmation,
    editorial_value: editorialValue,
    penalties
  };
  const totalScore =
    score.system_impact +
    score.behavior_signal +
    score.signal_strength +
    score.cross_confirmation +
    score.editorial_value +
    score.penalties;

  return {
    hardExcluded,
    exclusionReason,
    passesGate,
    functions,
    directions,
    scope,
    drivers,
    entityTypes,
    isPhilippines,
    isRegional,
    isStateBankSignal,
    isDigitalOnly,
    isShallowEarnings,
    weakSourcing,
    score,
    movementScore,
    totalScore
  };
}

export function buildBankingSignals(story: NormalizedStory): BankingSignals {
  const classification = classifyBankingStory(story);

  return {
    function: classification.functions,
    direction: classification.directions,
    scope: classification.scope,
    driver: classification.drivers,
    entity_type: classification.entityTypes,
    movement_score: classification.movementScore,
    score_dimensions: classification.score
  };
}

export function bankingTagsForStory(story: NormalizedStory): string[] {
  const classification = classifyBankingStory(story);
  const tags = [
    ...classification.functions.map((fn) => `banking_${fn}`),
    ...classification.directions.map((direction) => `banking_${direction}`),
    `banking_${classification.scope}`,
    ...classification.drivers.map((driver) => `banking_driver_${driver}`),
    ...classification.entityTypes.map((entityType) => `banking_${entityType}`)
  ];

  return tags.length > 0 ? [...new Set(tags)] : ["general_ph_sea_banking"];
}

export function bankingThemeLabel(story: NormalizedStory): string {
  const signals = story.banking_signals ?? buildBankingSignals(story);
  const directions = signals.direction;
  const functions = signals.function;
  const text = normalizeBankingText(`${story.title} ${story.summary ?? ""}`);

  if (
    directions.includes("tightening") &&
    (functions.includes("lending") || functions.includes("regulation"))
  ) {
    return "Credit tightening is emerging";
  }

  if (directions.includes("loosening") && functions.includes("lending")) {
    return "Credit appetite is loosening";
  }

  if (directions.includes("preserving") && functions.includes("liquidity")) {
    return "Liquidity is being preserved over growth";
  }

  if (
    functions.includes("liquidity") &&
    (directions.includes("tightening") || directions.includes("falling"))
  ) {
    return "System liquidity is tightening";
  }

  if (
    functions.includes("liquidity") &&
    (directions.includes("loosening") || directions.includes("rising"))
  ) {
    return "System liquidity is easing";
  }

  if (
    directions.includes("shifting") &&
    functions.includes("deposits")
  ) {
    return "Deposits are shifting toward yield";
  }

  if (
    functions.includes("deposits") &&
    (directions.includes("rising") || directions.includes("falling"))
  ) {
    return directions.includes("falling")
      ? "Deposit growth is weakening"
      : "Deposits are still growing";
  }

  if (directions.includes("repricing") && functions.includes("funding")) {
    return "Funding costs are pressing margins";
  }

  if (directions.includes("repricing") && functions.includes("deposits")) {
    return "Deposit costs are being repriced";
  }

  if (directions.includes("repricing") && functions.includes("risk")) {
    return "Risk is being quietly repriced";
  }

  if (
    functions.includes("risk") ||
    text.includes("bad loans") ||
    text.includes("borrowers capacity") ||
    text.includes("capacity to pay")
  ) {
    return "Risk is starting to surface";
  }

  if (functions.includes("regulation") && directions.includes("tightening")) {
    return "Credit tightening is emerging";
  }

  if (functions.includes("digital_shift") && functions.includes("deposits")) {
    return "Digital competition is pulling at deposits";
  }

  if (functions.includes("funding") && directions.includes("rising")) {
    return "Funding costs are pressing margins";
  }

  if (functions.includes("lending") && directions.includes("rising")) {
    return text.includes("capacity to pay") || text.includes("borrower")
      ? "Growth is showing early strain"
      : "Loan growth is still carrying the system";
  }

  if (functions.includes("deposits")) {
    return "Deposit behavior needs confirmation";
  }

  if (functions.includes("funding")) {
    return "Funding pressure needs confirmation";
  }

  if (functions.includes("liquidity")) {
    return "Liquidity conditions need confirmation";
  }

  if (functions.includes("regulation") || functions.includes("lending")) {
    return "Credit discipline is under review";
  }

  return "Banking watch signals need confirmation";
}

export function bankingClusterKey(story: NormalizedStory): string {
  const signals = story.banking_signals ?? buildBankingSignals(story);
  const family = bankingMovementFamily(story);

  return `${family}:${signals.scope}`;
}

export function bankingMovementFamily(story: NormalizedStory): string {
  const signals = story.banking_signals ?? buildBankingSignals(story);
  const functions = signals.function;
  const directions = signals.direction;
  const text = normalizeBankingText(`${story.title} ${story.summary ?? ""}`);

  if (
    directions.includes("tightening") &&
    (functions.includes("lending") || functions.includes("regulation"))
  ) {
    return "credit_tightening";
  }

  if (
    functions.includes("risk") ||
    text.includes("bad loans") ||
    text.includes("npl") ||
    text.includes("capacity to pay") ||
    text.includes("borrower stress")
  ) {
    return "risk_surface";
  }

  if (functions.includes("liquidity") && directions.includes("preserving")) {
    return "liquidity_preservation";
  }

  if (functions.includes("liquidity") && (directions.includes("tightening") || directions.includes("falling"))) {
    return "liquidity_tightening";
  }

  if (functions.includes("liquidity") && (directions.includes("loosening") || directions.includes("rising"))) {
    return "liquidity_easing";
  }

  if (functions.includes("deposits") && directions.includes("shifting")) {
    return "deposit_shift";
  }

  if (functions.includes("deposits") && directions.includes("falling")) {
    return "deposit_weakening";
  }

  if (functions.includes("deposits") && directions.includes("rising")) {
    return "deposit_growth";
  }

  if (functions.includes("funding") || directions.includes("repricing")) {
    return "risk_repricing";
  }

  if (functions.includes("lending") && directions.includes("rising")) {
    return "growth_strain";
  }

  if (functions.includes("regulation") || functions.includes("lending")) {
    return "credit_discipline_watch";
  }

  return "banking_watch";
}

export function bankingClusterClassification(stories: NormalizedStory[]): "primary" | "secondary" | "watch" {
  const topMovement = Math.max(...stories.map((story) => story.movement_score ?? story.banking_signals?.movement_score ?? 0), 0);
  const topPriority = Math.max(...stories.map((story) => story.priority_score ?? 0), 0);

  if (topMovement >= 10 || topPriority >= 72) {
    return "primary";
  }

  if (topMovement >= 7 || topPriority >= 48) {
    return "secondary";
  }

  return "watch";
}
