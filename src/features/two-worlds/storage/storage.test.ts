import { describe, expect, it } from "vitest";
import { createRun, gameReducer, initialGameState, type GameState } from "../engine/game";
import { CONTENT_VERSION } from "../content";
import {
  buildExport,
  clearAppData,
  loadState,
  saveState,
  SCHEMA_VERSION,
  STORAGE_KEYS,
} from "./storage";

class MemoryStorage {
  private items = new Map<string, string>();
  get length() {
    return this.items.size;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
}

const midCase = (playMode: "normal" | "demo" = "normal"): GameState =>
  gameReducer(
    initialGameState(
      playMode,
      createRun({
        id: "a1",
        caseId: "evening",
        mode: playMode === "demo" ? "demo" : "first_attempt",
        step: "first_attempt",
        seed: 3,
        setup: { world: "legitimate", variantId: "v1", savedContact: "available" },
        now: 0,
      }),
    ),
    { type: "perform", actionId: "open_attachment" },
  );

describe("12. restore and invalid saved versions", () => {
  it("restores a case in progress", () => {
    const storage = new MemoryStorage();
    saveState(storage, midCase(), 1);
    expect(loadState(storage, "normal")).toEqual({ status: "ok", state: midCase() });
  });

  it("restores a finished attempt on the reveal screen", () => {
    const storage = new MemoryStorage();
    const finished = gameReducer(midCase(), {
      type: "decide",
      decision: "wait",
      reliedOn: [],
      now: 5,
    });
    saveState(storage, finished, 6);
    const result = loadState(storage, "normal");
    expect(result.status === "ok" && result.state.stage.kind).toBe("reveal");
  });

  it("reports unreadable JSON as corrupt", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.normal, "{nope");
    expect(loadState(storage, "normal").status).toBe("corrupt");
  });

  it("reports another schema or content version as unsupported", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      STORAGE_KEYS.normal,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, contentVersion: CONTENT_VERSION }),
    );
    expect(loadState(storage, "normal").status).toBe("unsupported");
    storage.setItem(
      STORAGE_KEYS.normal,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, contentVersion: "old", state: midCase() }),
    );
    expect(loadState(storage, "normal").status).toBe("unsupported");
  });

  it("rejects unknown action ids instead of replaying them", () => {
    const storage = new MemoryStorage();
    const state = midCase();
    const tampered = {
      ...state,
      stage: state.stage.kind === "case" && {
        ...state.stage,
        run: { ...state.stage.run, actions: ["wire_money"] },
      },
    };
    storage.setItem(
      STORAGE_KEYS.normal,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        contentVersion: CONTENT_VERSION,
        state: tampered,
      }),
    );
    expect(loadState(storage, "normal").status).toBe("corrupt");
  });

  it("keeps demo separate from normal history", () => {
    const storage = new MemoryStorage();
    saveState(storage, midCase("demo"), 1);
    expect(loadState(storage, "normal").status).toBe("empty");
    expect(loadState(storage, "demo").status).toBe("ok");
    storage.setItem(STORAGE_KEYS.normal, storage.getItem(STORAGE_KEYS.demo) ?? "");
    expect(loadState(storage, "normal").status).toBe("corrupt");
  });

  it("deletes only the app's own keys", () => {
    const storage = new MemoryStorage();
    storage.setItem("other-app", "keep");
    saveState(storage, midCase(), 1);
    saveState(storage, midCase("demo"), 1);
    expect(clearAppData(storage).sort()).toEqual([STORAGE_KEYS.demo, STORAGE_KEYS.normal]);
    expect(storage.getItem("other-app")).toBe("keep");
    expect(storage.length).toBe(1);
  });

  it("exports versioned JSON with demo records in their own section", () => {
    const storage = new MemoryStorage();
    const decided = gameReducer(midCase(), {
      type: "decide",
      decision: "wait",
      reliedOn: [],
      now: 500,
    });
    saveState(storage, decided, 1);
    const exported = buildExport(storage, 0);
    expect(exported.schemaVersion).toBe(SCHEMA_VERSION);
    expect(exported.contentVersion).toBe(CONTENT_VERSION);
    expect(exported.records).toHaveLength(1);
    expect(exported.records[0]).toMatchObject({ mode: "first_attempt", elapsedMs: 500 });
    expect(exported.demoRecords).toEqual([]);
  });
});
