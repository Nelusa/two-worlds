import { describe, expect, it } from "vitest";
import {
  createRun,
  findDecisionRecord,
  gameReducer,
  initialGameState,
  MAX_RECORDS,
  type GameAction,
  type GameState,
  type Run,
} from "./game";
import type { ActionId, Setup } from "./types";

const fraudSetup: Setup = { world: "fraudulent", variantId: "v2", savedContact: "available" };

const firstRun = (setup: Setup = fraudSetup): Run =>
  createRun({
    id: "first",
    caseId: "evening",
    mode: "first_attempt",
    step: "first_attempt",
    seed: 7,
    setup,
    now: 1000,
  });

const play = (state: GameState, actions: GameAction[]) => actions.reduce(gameReducer, state);

const perform = (...ids: ActionId[]): GameAction[] =>
  ids.map((actionId) => ({ type: "perform", actionId }));

const decidedFirstAttempt = () =>
  play(initialGameState("normal", firstRun()), [
    ...perform("open_attachment", "open_saved_contact", "saved_contact_change", "ask_colleague"),
    { type: "decide", decision: "reject", reliedOn: ["saved_contact_reply"], now: 5000 },
  ]);

describe("10. practice and replay never change the first attempt", () => {
  it("keeps the first record identical through branch, procedure and transfer", () => {
    const afterFirst = decidedFirstAttempt();
    const snapshot = structuredClone(findDecisionRecord(afterFirst, afterFirst.firstAttemptId));
    expect(snapshot?.actions).toEqual([
      "open_attachment",
      "open_saved_contact",
      "saved_contact_change",
      "ask_colleague",
    ]);

    const afterBranch = play(afterFirst, [
      { type: "start_branch", world: "legitimate", id: "branch", now: 6000 },
    ]);
    expect(afterBranch.stage.kind).toBe("case");
    if (afterBranch.stage.kind === "case") {
      // Only actions up to the first differing answer are inherited; no decision is carried over.
      expect(afterBranch.stage.run.actions).toEqual([
        "open_attachment",
        "open_saved_contact",
        "saved_contact_change",
      ]);
      expect(afterBranch.stage.run.setup.world).toBe("legitimate");
      expect(afterBranch.stage.run.mode).toBe("practice");
    }

    const afterAll = play(afterBranch, [
      ...perform("open_original_order"),
      { type: "decide", decision: "approve", reliedOn: [], now: 7000 },
      { type: "open_procedure" },
      { type: "use_sample" },
      { type: "run_procedure" },
      {
        type: "decide_branch",
        worlds: ["legitimate"],
        decision: "approve",
        id: "procedure",
        now: 8000,
      },
      {
        type: "decide_branch",
        worlds: ["fraudulent"],
        decision: "reject",
        id: "procedure",
        now: 8000,
      },
      {
        type: "start_transfer",
        run: createRun({
          id: "transfer",
          caseId: "handover",
          mode: "transfer",
          step: "transfer",
          seed: 9,
          setup: { world: "legitimate", variantId: "v1", savedContact: "available" },
          now: 9000,
        }),
      },
    ]);

    expect(findDecisionRecord(afterAll, "first")).toEqual(snapshot);
    expect(afterAll.firstAttemptId).toBe("first");
    expect(afterAll.records.map(({ id, mode }) => [id, mode])).toEqual([
      ["first", "first_attempt"],
      ["branch", "practice"],
      ["procedure", "practice"],
    ]);
    const procedure = afterAll.records.find(({ id }) => id === "procedure");
    expect(procedure?.kind === "procedure" && procedure.usedSample).toBe(true);
  });

  it("does not offer a branch when no answer differs", () => {
    const state = play(initialGameState("normal", firstRun()), [
      ...perform("open_attachment"),
      { type: "decide", decision: "approve", reliedOn: [], now: 2000 },
      { type: "start_branch", world: "legitimate", id: "branch", now: 3000 },
    ]);
    expect(state.stage.kind).toBe("reveal");
  });
});

describe("11. double clicks", () => {
  it("records exactly one final decision", () => {
    const state = play(initialGameState("normal", firstRun()), [
      ...perform("open_attachment", "open_attachment"),
      { type: "decide", decision: "approve", reliedOn: [], now: 2000 },
      { type: "decide", decision: "reject", reliedOn: [], now: 2001 },
    ]);
    expect(state.records).toHaveLength(1);
    expect(findDecisionRecord(state, state.firstAttemptId)?.decision).toBe("approve");
    expect(findDecisionRecord(state, state.firstAttemptId)?.actions).toEqual(["open_attachment"]);
  });

  it("records a procedure trial once", () => {
    const state = play(decidedFirstAttempt(), [
      { type: "open_procedure" },
      { type: "set_steps", steps: ["open_attachment"] },
      { type: "run_procedure" },
      {
        type: "decide_branch",
        worlds: ["legitimate", "fraudulent"],
        decision: "wait",
        id: "p1",
        now: 1,
      },
      {
        type: "decide_branch",
        worlds: ["legitimate", "fraudulent"],
        decision: "approve",
        id: "p2",
        now: 2,
      },
    ]);
    expect(state.records.filter(({ kind }) => kind === "procedure")).toHaveLength(1);
  });
});

describe("history limit", () => {
  it("trims old records but keeps the current first attempt", () => {
    const many = Array.from({ length: MAX_RECORDS + 5 }, (_, index) => index).reduce(
      (state, index) =>
        play(state, [
          {
            type: "new_journey",
            run: { ...firstRun(), id: `r${index}` },
          },
          { type: "decide", decision: "wait", reliedOn: [], now: index },
        ]),
      initialGameState("normal", firstRun()),
    );
    expect(many.records).toHaveLength(MAX_RECORDS);
    expect(many.records.at(-1)?.id).toBe(`r${MAX_RECORDS + 4}`);
    expect(many.firstAttemptId).toBe(`r${MAX_RECORDS + 4}`);
  });
});

describe("demo mode", () => {
  it("marks every record as demo", () => {
    const state = play(initialGameState("demo", { ...firstRun(), mode: "demo" }), [
      ...perform("open_saved_contact", "saved_contact_change"),
      { type: "decide", decision: "reject", reliedOn: [], now: 1 },
      { type: "start_branch", world: "legitimate", id: "b", now: 2 },
      { type: "decide", decision: "approve", reliedOn: [], now: 3 },
    ]);
    expect(state.records.map(({ mode }) => mode)).toEqual(["demo", "demo"]);
  });
});
