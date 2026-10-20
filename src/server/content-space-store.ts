import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const CONTENT_SPACE_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-content-space.json");
const CONTENT_SPACE_UPSTASH_KEY = "kage-dashboard:content-space";

type ContentSpaceState = {
  body: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeContentSpaceState(payload: Partial<ContentSpaceState> | null | undefined): ContentSpaceState {
  return {
    body: typeof payload?.body === "string" ? payload.body : "",
    updatedAt: typeof payload?.updatedAt === "string" ? payload.updatedAt : nowIso(),
  };
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

async function readFromUpstash() {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/get/${encodeURIComponent(CONTENT_SPACE_UPSTASH_KEY)}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Content space read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  let storedValue: unknown = payload.result;
  for (let attempt = 0; attempt < 2 && typeof storedValue === "string"; attempt += 1) {
    try {
      storedValue = JSON.parse(storedValue);
    } catch {
      break;
    }
  }

  return normalizeContentSpaceState(storedValue as Partial<ContentSpaceState> | null);
}

async function writeToUpstash(state: ContentSpaceState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(CONTENT_SPACE_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Content space write failed with status ${response.status}.`);
  }

  return true;
}

async function readContentSpaceState() {
  const hostedState = await readFromUpstash();
  if (hostedState) {
    return hostedState;
  }

  if (isProductionRuntime()) {
    if (!getUpstashConfig()) {
      throw new Error("Hosted Content space storage is not configured.");
    }
    return normalizeContentSpaceState(null);
  }

  try {
    const raw = await readFile(CONTENT_SPACE_FILE_PATH, "utf8");
    return normalizeContentSpaceState(JSON.parse(raw) as Partial<ContentSpaceState>);
  } catch {
    return normalizeContentSpaceState(null);
  }
}

export async function getContentSpace() {
  return readContentSpaceState();
}

export async function saveContentSpace(body: string) {
  const state = normalizeContentSpaceState({ body, updatedAt: nowIso() });
  if (await writeToUpstash(state)) {
    return state;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted Content space storage write failed.");
  }

  await mkdir(dirname(CONTENT_SPACE_FILE_PATH), { recursive: true });
  await writeFile(CONTENT_SPACE_FILE_PATH, JSON.stringify(state, null, 2), "utf8");
  return state;
}
