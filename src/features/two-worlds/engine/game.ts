import { CASES } from "../content";
import { performAction } from "./scenario";
import { inheritedActions, replayAttempt } from "./replay";
import type {
  ActionId,
  CaseId,
  ContactAvailability,
  Decision,
  Mode,
  Setup,
  SourceId,
  WorldId,
} from "./types";

export const MAX_RECORDS = 20;

/** Which part of the journey a record belongs to. In demo mode every record has mode "demo". */
export type RecordStep = "first_attempt" | "branch" | "procedure" | "transfer";

/** Steps played in the workspace; a procedure trial is recorded without a run. */
export type RunStep = Exclude<RecordStep, "procedure">;

export interface Run {
  id: string;
  caseId: CaseId;
  mode: Mode;
  step: RunStep;
  seed: number;
  setup: Setup;
  actions: ActionId[];
  /** Leading actions inherited from the first attempt; shown but not the player's new choices. */
  lockedCount: number;
  parentId?: string;
  startedAt: number;
}

export interface DecisionRecord extends Run {
  kind: "decision";
  decision: Decision;
  reliedOn: SourceId[];
  decidedAt: number;
}

export interface ProcedureRecord {
  kind: "procedure";
  id: string;
  caseId: CaseId;
  mode: Mode;
  step: "procedure";
  parentId: string;
  variantId: string;
  savedContact: ContactAvailability;
  steps: ActionId[];
  usedSample: boolean;
  branches: { world: WorldId; decision: Decision }[];
  createdAt: number;
}

export type AttemptRecord = DecisionRecord | ProcedureRecord;

export interface ProcedureTrial {
  decisions: Partial<Record<WorldId, Decision>>;
  recordId: string | null;
}

export type Stage =
  | { kind: "case"; run: Run }
  | { kind: "reveal"; recordId: string; revealed: 1 | 2 | 3 }
  | { kind: "practice_result"; recordId: string }
  | {
      kind: "procedure";
      baseRecordId: string;
      steps: ActionId[];
      savedContact: ContactAvailability;
      usedSample: boolean;
      trial: ProcedureTrial | null;
    }
  | { kind: "summary" };

export type PlayMode = "normal" | "demo";

export interface GameState {
  playMode: PlayMode;
  stage: Stage;
  firstAttemptId: string | null;
  transferId: string | null;
  records: AttemptRecord[];
  /** Demo only: the prepared setup of the transfer case. */
  demoTransfer?: Setup;
}

export type GameAction =
  | { type: "perform"; actionId: ActionId }
  | { type: "decide"; decision: Decision; reliedOn: SourceId[]; now: number }
  | { type: "reveal_more" }
  | { type: "reveal_all" }
  | { type: "start_branch"; world: WorldId; id: string; now: number }
  | { type: "open_procedure" }
  | { type: "set_steps"; steps: ActionId[] }
  | { type: "use_sample" }
  | { type: "set_procedure_contact"; savedContact: ContactAvailability }
  | { type: "run_procedure" }
  | { type: "edit_procedure" }
  | { type: "decide_branch"; worlds: WorldId[]; decision: Decision; id: string; now: number }
  | { type: "start_transfer"; run: Run }
  | { type: "show_summary" }
  | { type: "new_journey"; run: Run }
  | { type: "back_to_reveal" };

export const SAMPLE_PROCEDURE: Record<CaseId, ActionId[]> = {
  evening: ["open_saved_contact", "saved_contact_change"],
  handover: ["open_original_confirmation", "original_contact_change"],
};

export const createRun = (params: {
  id: string;
  caseId: CaseId;
  mode: Mode;
  step: RunStep;
  seed: number;
  setup: Setup;
  now: number;
  actions?: ActionId[];
  parentId?: string;
}): Run => ({
  id: params.id,
  caseId: params.caseId,
  mode: params.mode,
  step: params.step,
  seed: params.seed,
  setup: params.setup,
  actions: params.actions ?? [],
  lockedCount: params.actions?.length ?? 0,
  parentId: params.parentId,
  startedAt: params.now,
});

export const initialGameState = (
  playMode: PlayMode,
  run: Run,
  demoTransfer?: Setup,
): GameState => ({
  playMode,
  stage: { kind: "case", run },
  firstAttemptId: null,
  transferId: null,
  records: [],
  ...(demoTransfer && { demoTransfer }),
});

export const findRecord = (state: GameState, id: string | null) =>
  state.records.find((record) => record.id === id) ?? null;

export const findDecisionRecord = (state: GameState, id: string | null) => {
  const record = findRecord(state, id);
  return record?.kind === "decision" ? record : null;
};

/**
 * Appends without touching existing records. Old history is trimmed to MAX_RECORDS, but the
 * records the current journey refers to are always kept.
 */
export const appendRecord = (state: GameState, record: AttemptRecord): AttemptRecord[] => {
  const keep = new Set([state.firstAttemptId, state.transferId, record.id]);
  const all = [...state.records, record];
  const removable = all.filter(({ id }) => !keep.has(id));
  const overflow = Math.max(0, all.length - MAX_RECORDS);
  const dropped = new Set(removable.slice(0, overflow).map(({ id }) => id));
  return all.filter(({ id }) => !dropped.has(id));
};

const modeFor = (playMode: PlayMode, mode: Mode): Mode => (playMode === "demo" ? "demo" : mode);

const decide = (state: GameState, action: Extract<GameAction, { type: "decide" }>): GameState => {
  if (state.stage.kind !== "case") return state;
  const { run } = state.stage;
  const record: DecisionRecord = {
    ...run,
    kind: "decision",
    decision: action.decision,
    reliedOn: action.reliedOn,
    decidedAt: action.now,
  };
  const next = {
    ...state,
    firstAttemptId: run.step === "first_attempt" ? record.id : state.firstAttemptId,
    transferId: run.step === "transfer" ? record.id : state.transferId,
  };
  return {
    ...next,
    records: appendRecord(next, record),
    stage:
      run.step === "branch"
        ? { kind: "practice_result", recordId: record.id }
        : { kind: "reveal", recordId: record.id, revealed: 1 },
  };
};

const startBranch = (
  state: GameState,
  action: Extract<GameAction, { type: "start_branch" }>,
): GameState => {
  const first = findDecisionRecord(state, state.firstAttemptId);
  if (!first) return state;
  const content = CASES[first.caseId];
  const replay = replayAttempt(content, first.actions, first.setup.world, first.setup.savedContact);
  if (replay.divergenceIndex === null) return state;
  const run = createRun({
    id: action.id,
    caseId: first.caseId,
    mode: modeFor(state.playMode, "practice"),
    step: "branch",
    seed: first.seed,
    setup: { ...first.setup, world: action.world },
    now: action.now,
    actions: inheritedActions(replay, first.actions),
    parentId: first.id,
  });
  return { ...state, stage: { kind: "case", run } };
};

const decideBranch = (
  state: GameState,
  action: Extract<GameAction, { type: "decide_branch" }>,
): GameState => {
  const { stage } = state;
  if (stage.kind !== "procedure" || !stage.trial || stage.trial.recordId) return state;
  const decisions = action.worlds.reduce(
    (acc, world) => ({ ...acc, [world]: acc[world] ?? action.decision }),
    stage.trial.decisions,
  );
  const first = findDecisionRecord(state, stage.baseRecordId);
  const { legitimate, fraudulent } = decisions;
  if (!legitimate || !fraudulent || !first) {
    return { ...state, stage: { ...stage, trial: { decisions, recordId: null } } };
  }
  const record: ProcedureRecord = {
    kind: "procedure",
    id: action.id,
    caseId: first.caseId,
    mode: modeFor(state.playMode, "practice"),
    step: "procedure",
    parentId: first.id,
    variantId: first.setup.variantId,
    savedContact: stage.savedContact,
    steps: stage.steps,
    usedSample: stage.usedSample,
    branches: [
      { world: "legitimate", decision: legitimate },
      { world: "fraudulent", decision: fraudulent },
    ],
    createdAt: action.now,
  };
  return {
    ...state,
    records: appendRecord(state, record),
    stage: { ...stage, trial: { decisions, recordId: record.id } },
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  const { stage } = state;
  switch (action.type) {
    case "perform": {
      if (stage.kind !== "case") return state;
      const content = CASES[stage.run.caseId];
      const actions = performAction(content, stage.run.actions, action.actionId);
      if (actions.length === stage.run.actions.length) return state;
      return { ...state, stage: { kind: "case", run: { ...stage.run, actions } } };
    }
    case "decide":
      return decide(state, action);
    case "reveal_more":
      if (stage.kind !== "reveal" || stage.revealed === 3) return state;
      return { ...state, stage: { ...stage, revealed: stage.revealed === 1 ? 2 : 3 } };
    case "reveal_all":
      if (stage.kind !== "reveal") return state;
      return { ...state, stage: { ...stage, revealed: 3 } };
    case "start_branch":
      return startBranch(state, action);
    case "open_procedure":
      if (!state.firstAttemptId) return state;
      return {
        ...state,
        stage: {
          kind: "procedure",
          baseRecordId: state.firstAttemptId,
          steps: [],
          savedContact: "available",
          usedSample: false,
          trial: null,
        },
      };
    case "set_steps":
      if (stage.kind !== "procedure" || stage.trial) return state;
      return { ...state, stage: { ...stage, steps: action.steps } };
    case "use_sample": {
      if (stage.kind !== "procedure" || stage.trial) return state;
      const first = findDecisionRecord(state, stage.baseRecordId);
      if (!first) return state;
      return {
        ...state,
        stage: { ...stage, steps: SAMPLE_PROCEDURE[first.caseId], usedSample: true },
      };
    }
    case "set_procedure_contact":
      if (stage.kind !== "procedure" || stage.trial) return state;
      return { ...state, stage: { ...stage, savedContact: action.savedContact } };
    case "run_procedure":
      if (stage.kind !== "procedure" || stage.trial || stage.steps.length === 0) return state;
      return { ...state, stage: { ...stage, trial: { decisions: {}, recordId: null } } };
    case "edit_procedure":
      if (stage.kind !== "procedure") return state;
      return { ...state, stage: { ...stage, trial: null } };
    case "decide_branch":
      return decideBranch(state, action);
    case "start_transfer":
      if (stage.kind === "case") return state;
      return { ...state, transferId: null, stage: { kind: "case", run: action.run } };
    case "show_summary":
      return { ...state, stage: { kind: "summary" } };
    case "new_journey":
      return {
        ...state,
        firstAttemptId: null,
        transferId: null,
        stage: { kind: "case", run: action.run },
      };
    case "back_to_reveal":
      if (!state.firstAttemptId) return state;
      return { ...state, stage: { kind: "reveal", recordId: state.firstAttemptId, revealed: 3 } };
  }
};
