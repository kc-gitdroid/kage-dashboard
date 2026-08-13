import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const CURRENTLY_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-currently.json");
const CURRENTLY_UPSTASH_KEY = "kage-dashboard:currently";

type CurrentlyState = {
  body: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeCurrentlyState(payload: Partial<CurrentlyState> | null | undefined): CurrentlyState {
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

  const response = await fetch(`${config.url}/get/${encodeURIComponent(CURRENTLY_UPSTASH_KEY)}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Currently store read failed with status ${response.status}.`);
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

  return normalizeCurrentlyState(storedValue as Partial<CurrentlyState> | null);
}

async function writeToUpstash(state: CurrentlyState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(CURRENTLY_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Currently store write failed with status ${response.status}.`);
  }

  return true;
}

async function readCurrentlyState() {
  const hostedState = await readFromUpstash();
  if (hostedState) {
    return hostedState;
  }

  if (isProductionRuntime()) {
    if (!getUpstashConfig()) {
      throw new Error("Hosted Currently storage is not configured.");
    }
    return normalizeCurrentlyState(null);
  }

  try {
    const raw = await readFile(CURRENTLY_FILE_PATH, "utf8");
    return normalizeCurrentlyState(JSON.parse(raw) as Partial<CurrentlyState>);
  } catch {
    return normalizeCurrentlyState(null);
  }
}

export async function getCurrently() {
  return readCurrentlyState();
}

export async function saveCurrently(body: string) {
  const state = normalizeCurrentlyState({ body, updatedAt: nowIso() });
  if (await writeToUpstash(state)) {
    return state;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted Currently storage write failed.");
  }

  await mkdir(dirname(CURRENTLY_FILE_PATH), { recursive: true });
  await writeFile(CURRENTLY_FILE_PATH, JSON.stringify(state, null, 2), "utf8");
  return state;
}
