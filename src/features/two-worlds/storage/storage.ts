import { CASES, CONTENT_VERSION } from "../content";
import type { AttemptRecord, GameState, PlayMode, Run, Stage } from "../engine/game";
import { isCaseAction } from "../engine/scenario";
import type { CaseId } from "../engine/types";

export const SCHEMA_VERSION = 1;

/** Every key the app writes starts with this prefix; "Smazat průběh" removes exactly these. */
export const KEY_PREFIX = "two-worlds.";

export const STORAGE_KEYS: Record<PlayMode, string> = {
  normal: `${KEY_PREFIX}progress`,
  demo: `${KEY_PREFIX}demo`,
};

interface Envelope {
  schemaVersion: number;
  contentVersion: string;
  savedAt: number;
  state: GameState;
}

export type LoadResult =
  | { status: "empty" }
  | { status: "ok"; state: GameState }
  | { status: "unsupported"; detail: string }
  | { status: "corrupt"; detail: string };

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCaseId = (value: unknown): value is CaseId => typeof value === "string" && value in CASES;

const oneOf =
  <T extends string>(...values: T[]) =>
  (value: unknown): value is T =>
    typeof value === "string" && (values as string[]).includes(value);

const isMode = oneOf("first_attempt", "practice", "transfer", "demo");
const isRunStep = oneOf("first_attempt", "branch", "transfer");
const isDecision = oneOf("approve", "reject", "wait");
const isWorld = oneOf("legitimate", "fraudulent");
const isAvailability = oneOf("available", "unreachable");

const hasValidActions = (caseId: CaseId, actions: unknown) =>
  Array.isArray(actions) &&
  actions.every((id) => typeof id === "string" && isCaseAction(CASES[caseId], id));

const isSetup = (value: unknown) =>
  isObject(value) &&
  isWorld(value.world) &&
  typeof value.variantId === "string" &&
  isAvailability(value.savedContact);

const isRun = (value: unknown): value is Run =>
  isObject(value) &&
  typeof value.id === "string" &&
  isCaseId(value.caseId) &&
  isMode(value.mode) &&
  isRunStep(value.step) &&
  typeof value.seed === "number" &&
  isSetup(value.setup) &&
  typeof value.lockedCount === "number" &&
  typeof value.startedAt === "number" &&
  hasValidActions(value.caseId, value.actions);

const isRecord = (value: unknown): value is AttemptRecord => {
  if (!isObject(value) || !isCaseId(value.caseId)) return false;
  if (value.kind === "decision") {
    return isRun(value) && isDecision(value.decision) && Array.isArray(value.reliedOn);
  }
  return (
    value.kind === "procedure" &&
    typeof value.id === "string" &&
    isMode(value.mode) &&
    hasValidActions(value.caseId, value.steps) &&
    Array.isArray(value.branches) &&
    value.branches.every(
      (branch) => isObject(branch) && isWorld(branch.world) && isDecision(branch.decision),
    )
  );
};

const isStage = (value: unknown, records: AttemptRecord[]): value is Stage => {
  if (!isObject(value)) return false;
  const known = (id: unknown) => records.some((record) => record.id === id);
  switch (value.kind) {
    case "case":
      return isRun(value.run);
    case "reveal":
      return (
        known(value.recordId) &&
        (value.revealed === 1 || value.revealed === 2 || value.revealed === 3)
      );
    case "practice_result":
      return known(value.recordId);
    case "procedure":
      return (
        known(value.baseRecordId) &&
        Array.isArray(value.steps) &&
        isAvailability(value.savedContact) &&
        typeof value.usedSample === "boolean" &&
        (value.trial === null || isObject(value.trial))
      );
    case "summary":
      return true;
    default:
      return false;
  }
};

const isGameState = (value: unknown, playMode: PlayMode): value is GameState => {
  if (!isObject(value) || value.playMode !== playMode || !Array.isArray(value.records)) {
    return false;
  }
  const records = value.records;
  const reference = (id: unknown) =>
    id === null || records.some((record) => isObject(record) && record.id === id);
  return (
    records.every(isRecord) &&
    reference(value.firstAttemptId) &&
    reference(value.transferId) &&
    isStage(value.stage, records)
  );
};

export const parseSaved = (raw: string | null, playMode: PlayMode): LoadResult => {
  if (raw === null) return { status: "empty" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "corrupt", detail: "Uložená data nejsou čitelný JSON." };
  }
  if (!isObject(parsed) || typeof parsed.schemaVersion !== "number") {
    return { status: "corrupt", detail: "Uložená data nemají očekávaný tvar." };
  }
  if (parsed.schemaVersion !== SCHEMA_VERSION) {
    return {
      status: "unsupported",
      detail: `Uložená data mají verzi ${parsed.schemaVersion}, aplikace umí verzi ${SCHEMA_VERSION}.`,
    };
  }
  if (parsed.contentVersion !== CONTENT_VERSION) {
    return {
      status: "unsupported",
      detail: "Uložený průběh patří k jiné verzi příběhu a nedá se korektně přehrát.",
    };
  }
  if (!isGameState(parsed.state, playMode)) {
    return { status: "corrupt", detail: "Uložený průběh je poškozený." };
  }
  return { status: "ok", state: parsed.state };
};

export const loadState = (storage: StorageLike, playMode: PlayMode): LoadResult => {
  try {
    return parseSaved(storage.getItem(STORAGE_KEYS[playMode]), playMode);
  } catch {
    return { status: "corrupt", detail: "Úložiště prohlížeče není dostupné." };
  }
};

export const saveState = (storage: StorageLike, state: GameState, now: number): boolean => {
  const envelope: Envelope = {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    savedAt: now,
    state,
  };
  try {
    storage.setItem(STORAGE_KEYS[state.playMode], JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
};

export const clearMode = (storage: StorageLike, playMode: PlayMode) => {
  try {
    storage.removeItem(STORAGE_KEYS[playMode]);
  } catch {
    // Storage blocked: nothing was saved, so there is nothing to remove.
  }
};

/** Removes only this app's keys, never the whole origin's storage. */
export const clearAppData = (storage: StorageLike): string[] => {
  try {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
      (key): key is string => key !== null && key.startsWith(KEY_PREFIX),
    );
    keys.forEach((key) => storage.removeItem(key));
    return keys;
  } catch {
    return [];
  }
};

const recordForExport = (record: AttemptRecord) =>
  record.kind === "decision"
    ? {
        ...record,
        elapsedMs: record.decidedAt - record.startedAt,
      }
    : record;

export const buildExport = (storage: StorageLike, now: number) => {
  const section = (playMode: PlayMode) => {
    const result = loadState(storage, playMode);
    return result.status === "ok" ? result.state.records.map(recordForExport) : [];
  };
  return {
    format: "two-worlds-progress",
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    exportedAt: new Date(now).toISOString(),
    notes: [
      "Záznamy neobsahují jméno ani jiný identifikátor člověka.",
      "elapsedMs je rozdíl mezi otevřením případu a potvrzením rozhodnutí. Zahrnuje pauzy i dobu, kdy byla stránka zavřená. Nejde o měření aktivního času.",
      "Záznamy s mode practice a demo nejsou samostatné výsledky. Samostatný výkon popisují jen first_attempt a transfer.",
    ],
    records: section("normal"),
    demoRecords: section("demo"),
  };
};
