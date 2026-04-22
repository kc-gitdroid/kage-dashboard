import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

type BrandId = "aai" | "masteryatelier" | "mo-studio" | "personal" | "biro";
type Status =
  | "draft"
  | "planned"
  | "active"
  | "in-progress"
  | "scheduled"
  | "completed"
  | "archived";
type AccentTone = "blue" | "yellow" | "orange" | "lime" | "purple" | "cyan";

type SyncMetadata = {
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lastSyncedAt?: string | null;
  syncStatus?: "synced" | "pending" | "syncing" | "failed" | "conflict";
  deviceUpdatedAt?: string;
};

type Brand = SyncMetadata & {
  id: BrandId;
  name: string;
  shortName: string;
  color: string;
  description: string;
};

type BrandSpace = Brand & {
  tone: AccentTone;
  summary: string;
  focus: string;
  cadence: string;
  nextAction: string;
  status: Status;
  horizon: string;
  blueprint: string[];
  guidelines: string[];
  world: string[];
  tasks: string[];
  contentPlan: string[];
  notes: string[];
  calendar: string[];
  modules: string[];
};

type ContentItem = SyncMetadata & {
  id: string;
  title: string;
  brandId: BrandId;
  format: "feed" | "story" | "reel" | "carousel" | "article";
  pillar: string;
  captionStatus: "none" | "draft" | "ready";
  assetStatus: "needed" | "in-progress" | "ready";
  scheduleDate?: string;
  status: Status;
  linkedProjectId?: string;
};

type DashboardState = {
  brands: Brand[];
  brandSpaces: BrandSpace[];
  documents: unknown[];
  tasks: unknown[];
  notes: unknown[];
  calendarItems: unknown[];
  projects: unknown[];
  contentItems: unknown[];
  promptItems: unknown[];
};

type SyncConflict = {
  entity: string;
  recordId: string;
  incomingUpdatedAt: string;
  canonicalUpdatedAt: string;
  resolution: string;
  detectedAt: string;
};

type PersistedCanonicalState = {
  state: DashboardState;
  conflictLog: SyncConflict[];
  updatedAt: string;
};

type PersistedContentState = {
  contentItems: ContentItem[];
  updatedAt: string;
};

const SYNC_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-sync.json");
const CONTENT_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-content-items.json");
const SYNC_UPSTASH_KEY = "kage-dashboard:sync-state";
const CONTENT_UPSTASH_KEY = "kage-dashboard:content-items";
const RESTORE_DEVICE_ID = "restore-brand-data-script";
const RESTORED_AT = "2026-04-10T00:00:00.000Z";

const brandsSource: Omit<Brand, keyof SyncMetadata>[] = [
  {
    id: "aai",
    name: "An Autonomous Individual",
    shortName: "AAI",
    color: "#1D4DFF",
    description: "Intentional contemporary clothing brand.",
  },
  {
    id: "masteryatelier",
    name: "Masteryatelier",
    shortName: "Masteryatelier",
    color: "#F38B2A",
    description: "Craft-led footwear and product expression.",
  },
  {
    id: "mo-studio",
    name: "Massiveoutfit / MO Studio",
    shortName: "MO Studio",
    color: "#8A63D2",
    description: "Creative studio and client work.",
  },
  {
    id: "personal",
    name: "Personal",
    shortName: "Personal",
    color: "#B7FF00",
    description: "Kage personal brand and self-management.",
  },
  {
    id: "biro",
    name: "biro",
    shortName: "biro",
    color: "#8CE6FF",
    description: "Writing and idea workspace for exploratory thinking.",
  },
];

const brandSpacesSource: Omit<BrandSpace, keyof SyncMetadata>[] = [
  {
    ...brandsSource[0],
    tone: "blue",
    summary: "Clarity, restraint, and self-direction translated into a living brand system.",
    focus: "Uniform / Craft & Detail / Urban Stillness",
    cadence: "Editorial stills, quiet movement clips, perspective-led captions",
    nextAction: "Finalize the monthly uniform series and align web copy to the decision filter.",
    status: "active",
    horizon: "Next review: Apr 18",
    blueprint: [
      "Purpose: Encourage greater clarity, intention, and self-direction.",
      "Audience: Thoughtful individuals drawn to quiet confidence over trend-chasing.",
      "Promise: A calmer, more intentional expression of self.",
    ],
    guidelines: [
      "Visual identity stays restrained, tactile, and editorial.",
      "Voice is understated, human, and emotionally intelligent.",
      "Layouts favor calm structure, whitespace, and disciplined rhythm.",
    ],
    world: [
      "World essence: Quiet confidence in motion.",
      "Core territories: Daily rituals, city solitude, inner clarity.",
      "Campaign spaces: Uniform in Motion, The Quiet City, Material Presence.",
    ],
    tasks: [
      "Approve final still selects for the April uniform drop.",
      "Refine caption ladder to keep the voice closer to lived identity.",
      "Review product detail sequencing before the next content publish.",
    ],
    contentPlan: [
      "Week 1: uniform detail studies and quiet movement clips.",
      "Week 2: editorial stills with perspective-led captions.",
      "Week 3: material presence story with product utility focus.",
    ],
    notes: [
      "Keep campaign language precise and emotionally grounded.",
      "Avoid over-styling the visual world; let texture and posture carry the mood.",
      "The site should support calm navigation over novelty.",
    ],
    calendar: [
      "Apr 11 / Editorial caption pass",
      "Apr 18 / Campaign review",
      "Apr 22 / Product sequencing checkpoint",
    ],
    modules: ["Overview", "Strategy", "Content", "Projects", "Prompts", "Notes", "Tasks"],
  },
  {
    ...brandsSource[1],
    tone: "orange",
    summary: "A structured knowledge space for curriculum, systems thinking, and personal growth.",
    focus: "Programs / Methods / Insight systems",
    cadence: "Workshop notes, curriculum maps, long-form essays",
    nextAction: "Shape the next learning sprint and pin reusable teaching assets.",
    status: "in-progress",
    horizon: "Draft milestone: Apr 16",
    blueprint: [
      "Clarify the point of view, learner promise, and transformation.",
      "Define the offer stack from workshops to evergreen resources.",
      "Keep each initiative tied to a coherent method and learning outcome.",
    ],
    guidelines: [
      "Use precise instructional language with a calm, credible tone.",
      "Design should feel rigorous, spacious, and intellectually clean.",
      "Templates should support lessons, frameworks, and annotated notes.",
    ],
    world: [
      "Narrative world centers on practice, reflection, and capability building.",
      "Content should alternate between deep dives, operating models, and examples.",
      "Campaigns should frame mastery as a lived discipline, not a hype promise.",
    ],
    tasks: [
      "Finish workshop module architecture for the core program.",
      "Clarify how essays, lessons, and frameworks connect in the library.",
      "Prepare the next sprint review with open teaching questions.",
    ],
    contentPlan: [
      "Publish one framework note each week.",
      "Rotate between curriculum maps, teaching essays, and workshop excerpts.",
      "Use stories for short observations and lesson fragments.",
    ],
    notes: [
      "The tone should stay calm, instructional, and non-performative.",
      "Examples should be concrete enough to teach, not just inspire.",
      "The learning offer needs stronger progression cues.",
    ],
    calendar: [
      "Apr 10 / Curriculum mapping",
      "Apr 15 / Lesson framing sync",
      "Apr 16 / Workshop draft review",
    ],
    modules: ["Overview", "Strategy", "Content", "Projects", "Prompts", "Notes", "Tasks"],
  },
  {
    ...brandsSource[2],
    tone: "purple",
    summary: "The production and delivery layer for client work, systems, and execution cadence.",
    focus: "Pipeline / Delivery / Assets",
    cadence: "Project reviews, client touchpoints, production planning",
    nextAction: "Review current project status and consolidate delivery checkpoints.",
    status: "active",
    horizon: "Checkpoint: Apr 12",
    blueprint: [
      "Keep the studio promise clear across strategy, production, and delivery.",
      "Use process visibility as a trust-building mechanism.",
      "Make quality control and timeline health easy to scan.",
    ],
    guidelines: [
      "Communication should be concise, direct, and service-oriented.",
      "Panel layouts should surface timelines, handoffs, and ownership clearly.",
      "Accent color is used to highlight risks, transitions, and open decisions.",
    ],
    world: [
      "The world is disciplined, technical, and quietly premium.",
      "Stories should show craft, process intelligence, and confident execution.",
      "Campaign moments can emerge from case studies and behind-the-scenes structure.",
    ],
    tasks: [
      "Update the delivery map with current blockers and owner changes.",
      "Prepare the next client checkpoint with handoff status.",
      "Consolidate asset folders before the next review cycle.",
    ],
    contentPlan: [
      "Document one case-study fragment per active engagement.",
      "Keep internal updates short, operational, and timestamped.",
      "Translate process wins into future portfolio material.",
    ],
    notes: [
      "Project views should foreground timeline health and decision ownership.",
      "Status language needs to stay precise and calm.",
      "Case-study capture should happen during delivery, not after.",
    ],
    calendar: [
      "Apr 08 / Project checkpoint",
      "Apr 12 / Client delivery review",
      "Apr 14 / Timeline revision pass",
    ],
    modules: ["Overview", "Strategy", "Content", "Projects", "Prompts", "Notes", "Tasks"],
  },
  {
    ...brandsSource[3],
    tone: "lime",
    summary: "A private command layer for goals, notes, reading, and reflective planning.",
    focus: "Rhythm / Health / Reflection",
    cadence: "Weekly reviews, note capture, reading and idea synthesis",
    nextAction: "Prepare the next weekly reset and roll active notes into the calendar.",
    status: "active",
    horizon: "Reset: Apr 12",
    blueprint: [
      "Treat personal systems as clarity infrastructure, not productivity theater.",
      "Keep goals, habits, and notes visible without overcrowding the interface.",
      "Use the dashboard to reduce friction between planning and daily action.",
    ],
    guidelines: [
      "Writing can be warmer here, but should stay clear and grounded.",
      "Layouts should favor quick scanning and low-friction updates.",
      "Use highlight color for energy, wellbeing, and review states.",
    ],
    world: [
      "Content world is quieter and more reflective than the public brands.",
      "Recurring themes: routine, perspective, learning, and recovery.",
      "Campaign-style pushes are replaced with gentle seasonal resets and review cycles.",
    ],
    tasks: [
      "Complete weekly reset and review open commitments.",
      "Sort reading notes into themes for later writing.",
      "Block uninterrupted time for reflection and planning.",
    ],
    contentPlan: [
      "Short weekly reflection notes.",
      "Reading captures organized by theme and future use.",
      "Monthly reset page for goals, energy, and direction.",
    ],
    notes: [
      "The personal layer should reduce friction, not increase tracking noise.",
      "Energy and reflection matter as much as output.",
      "Keep quick capture close to weekly review rhythms.",
    ],
    calendar: [
      "Apr 09 / Reading notes sort",
      "Apr 12 / Weekly reset",
      "Apr 14 / Planning block",
    ],
    modules: ["Overview", "Strategy", "Content", "Projects", "Prompts", "Notes", "Tasks"],
  },
  {
    ...brandsSource[4],
    tone: "cyan",
    summary: "A quieter workspace for writing, prompts, and early-stage idea development.",
    focus: "Writing / Concepts / Experiments",
    cadence: "Prompt drafts, short notes, concept mapping, and story seeds",
    nextAction: "Shape the first set of prompt-led writing structures and connect them to working notes.",
    status: "draft",
    horizon: "Seed review: Apr 20",
    blueprint: [
      "Use biro as a space for generating and refining writing directions.",
      "Keep it lighter than a formal brand system, but structured enough to build momentum.",
      "Treat prompts and notes as development tools, not clutter.",
    ],
    guidelines: [
      "Tone should stay curious, restrained, and intelligent.",
      "Writing structures should encourage clarity, not verbosity.",
      "Use the workspace to sort seeds into stronger directions over time.",
    ],
    world: [
      "The world is minimal, idea-first, and exploratory.",
      "Themes can emerge from writing prompts, narrative fragments, and observations.",
      "The workspace should support unfinished thinking without feeling chaotic.",
    ],
    tasks: [
      "Group current writing seeds into 3 stronger directions.",
      "Refine the first prompt set for recurring idea generation.",
    ],
    contentPlan: [
      "Short prompt-led writing fragments.",
      "Recurring concept prompts worth revisiting.",
      "Early structure tests for longer-form pieces.",
    ],
    notes: [
      "Keep the space open enough for experiments, but not vague.",
      "Prompts should feed notes, and notes should sharpen prompts.",
    ],
    calendar: [
      "Apr 15 / Prompt review",
      "Apr 20 / Direction check-in",
    ],
    modules: ["Overview", "Strategy", "Content", "Projects", "Prompts", "Notes", "Tasks"],
  },
];

const contentItemsSource: Omit<ContentItem, keyof SyncMetadata>[] = [
  {
    id: "content-001",
    title: "AAI Uniform Reel 01",
    brandId: "aai",
    format: "reel",
    pillar: "Uniform",
    captionStatus: "draft",
    assetStatus: "ready",
    scheduleDate: "2026-04-12T10:00:00",
    status: "scheduled",
    linkedProjectId: "proj-aai-april",
  },
  {
    id: "content-002",
    title: "Masteryatelier Detail Carousel",
    brandId: "masteryatelier",
    format: "carousel",
    pillar: "Craft & Detail",
    captionStatus: "none",
    assetStatus: "in-progress",
    status: "planned",
  },
  {
    id: "content-003",
    title: "MO Studio Delivery Story Set",
    brandId: "mo-studio",
    format: "story",
    pillar: "Process Visibility",
    captionStatus: "ready",
    assetStatus: "ready",
    scheduleDate: "2026-04-12T18:00:00",
    status: "scheduled",
    linkedProjectId: "proj-mo-client",
  },
  {
    id: "content-004",
    title: "Personal Weekly Reset Reflection",
    brandId: "personal",
    format: "article",
    pillar: "Reflection",
    captionStatus: "ready",
    assetStatus: "needed",
    scheduleDate: "2026-04-13T09:00:00",
    status: "in-progress",
    linkedProjectId: "proj-personal-reset",
  },
];

function nowIso() {
  return new Date().toISOString();
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function ensureDashboardStateShape(state: Partial<DashboardState> | null | undefined): DashboardState {
  return {
    brands: state?.brands ?? [],
    brandSpaces: state?.brandSpaces ?? [],
    documents: state?.documents ?? [],
    tasks: state?.tasks ?? [],
    notes: state?.notes ?? [],
    calendarItems: state?.calendarItems ?? [],
    projects: state?.projects ?? [],
    contentItems: state?.contentItems ?? [],
    promptItems: state?.promptItems ?? [],
  };
}

function ensureCanonicalStateShape(
  payload: Partial<PersistedCanonicalState> | null | undefined,
): PersistedCanonicalState {
  return {
    state: ensureDashboardStateShape(payload?.state),
    conflictLog: Array.isArray(payload?.conflictLog) ? payload.conflictLog : [],
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function sortContentItems(items: ContentItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.scheduleDate ? new Date(a.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.scheduleDate ? new Date(b.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
}

function ensureContentStateShape(payload: Partial<PersistedContentState> | null | undefined): PersistedContentState {
  return {
    contentItems: sortContentItems(payload?.contentItems ?? []),
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function withSeedMetadata<T extends { id: string }>(items: T[]): (T & SyncMetadata)[] {
  return items.map((item) => ({
    ...item,
    createdAt: RESTORED_AT,
    updatedAt: RESTORED_AT,
    deletedAt: null,
    lastSyncedAt: RESTORED_AT,
    syncStatus: "synced",
    deviceUpdatedAt: RESTORE_DEVICE_ID,
  }));
}

function parseJsonValue<T>(raw: string | null | undefined): T | null {
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as unknown;
  if (typeof parsed === "string") {
    return JSON.parse(parsed) as T;
  }

  return parsed as T;
}

async function ensureParentFile(filePath: string) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readSyncState(): Promise<PersistedCanonicalState> {
  const config = getUpstashConfig();

  if (config) {
    const response = await fetch(`${config.url}/get/${encodeURIComponent(SYNC_UPSTASH_KEY)}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Sync store read failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as { result?: string | null };
    return ensureCanonicalStateShape(parseJsonValue<PersistedCanonicalState>(payload.result));
  }

  try {
    const raw = await readFile(SYNC_FILE_PATH, "utf8");
    return ensureCanonicalStateShape(JSON.parse(raw) as Partial<PersistedCanonicalState>);
  } catch {
    return ensureCanonicalStateShape({
      state: ensureDashboardStateShape(null),
      conflictLog: [],
      updatedAt: nowIso(),
    });
  }
}

async function writeSyncState(state: PersistedCanonicalState) {
  const normalized = ensureCanonicalStateShape(state);
  const config = getUpstashConfig();

  if (config) {
    const response = await fetch(`${config.url}/set/${encodeURIComponent(SYNC_UPSTASH_KEY)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalized),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Sync store write failed with status ${response.status}.`);
    }

    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted sync storage is not configured.");
  }

  await ensureParentFile(SYNC_FILE_PATH);
  await writeFile(SYNC_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

async function readContentState(): Promise<PersistedContentState> {
  const config = getUpstashConfig();

  if (config) {
    const response = await fetch(`${config.url}/get/${encodeURIComponent(CONTENT_UPSTASH_KEY)}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Content store read failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as { result?: string | null };
    return ensureContentStateShape(parseJsonValue<PersistedContentState>(payload.result));
  }

  try {
    const raw = await readFile(CONTENT_FILE_PATH, "utf8");
    return ensureContentStateShape(JSON.parse(raw) as Partial<PersistedContentState>);
  } catch {
    return ensureContentStateShape({ contentItems: [], updatedAt: nowIso() });
  }
}

async function writeContentState(state: PersistedContentState) {
  const normalized = ensureContentStateShape(state);
  const config = getUpstashConfig();

  if (config) {
    const response = await fetch(`${config.url}/set/${encodeURIComponent(CONTENT_UPSTASH_KEY)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalized),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Content store write failed with status ${response.status}.`);
    }

    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted content storage is not configured.");
  }

  await ensureParentFile(CONTENT_FILE_PATH);
  await writeFile(CONTENT_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

function parseArgs(args: string[]) {
  return {
    includeContent: args.includes("--include-content"),
  };
}

async function main() {
  const { includeContent } = parseArgs(process.argv.slice(2));
  const syncState = await readSyncState();
  const currentBrands = syncState.state.brands;
  const currentBrandSpaces = syncState.state.brandSpaces;

  const nextBrands = [...currentBrands];
  const nextBrandSpaces = [...currentBrandSpaces];

  const seededBrands = withSeedMetadata(brandsSource);
  const seededBrandSpaces = withSeedMetadata(brandSpacesSource);

  for (const brand of seededBrands) {
    if (!nextBrands.some((item) => item.id === brand.id)) {
      nextBrands.push(brand);
    }
  }

  for (const brandSpace of seededBrandSpaces) {
    if (!nextBrandSpaces.some((item) => item.id === brandSpace.id)) {
      nextBrandSpaces.push(brandSpace);
    }
  }

  const syncUpdatedAt = nowIso();
  await writeSyncState({
    ...syncState,
    state: {
      ...syncState.state,
      brands: nextBrands,
      brandSpaces: nextBrandSpaces,
    },
    updatedAt: syncUpdatedAt,
  });

  let contentImported = 0;
  let contentSkipped = 0;

  if (includeContent) {
    const contentState = await readContentState();
    const nextContentItems = [...contentState.contentItems];
    const seededContentItems = withSeedMetadata(contentItemsSource);

    for (const contentItem of seededContentItems) {
      if (nextContentItems.some((item) => item.id === contentItem.id)) {
        contentSkipped += 1;
        continue;
      }

      nextContentItems.push(contentItem);
      contentImported += 1;
    }

    await writeContentState({
      contentItems: nextContentItems,
      updatedAt: contentImported > 0 ? nowIso() : contentState.updatedAt,
    });
  }

  console.log("Brand data restore completed.");
  console.log(`Brands before: ${currentBrands.length}`);
  console.log(`Brands after: ${nextBrands.length}`);
  console.log(`BrandSpaces before: ${currentBrandSpaces.length}`);
  console.log(`BrandSpaces after: ${nextBrandSpaces.length}`);
  console.log(`Content imported: ${contentImported}`);
  console.log(`Content skipped: ${contentSkipped}`);
  console.log(`Content import enabled: ${includeContent ? "yes" : "no"}`);
}

main().catch((error) => {
  console.error("[restore-brand-data] failed", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
