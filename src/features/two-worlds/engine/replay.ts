import { observe } from "./scenario";
import type { ActionId, CaseContent, ContactAvailability, Observation, WorldId } from "./types";

export interface ReplayRow {
  actionId: ActionId;
  legitimate: Observation | null;
  fraudulent: Observation | null;
  same: boolean;
  divergent: boolean;
}

export interface Replay {
  rows: ReplayRow[];
  /** Index of the first action whose answer differs between the worlds, or null. */
  divergenceIndex: number | null;
}

export const otherWorld = (world: WorldId): WorldId =>
  world === "legitimate" ? "fraudulent" : "legitimate";

/**
 * Replays the player's real actions in both worlds. The world the attempt was played in keeps
 * every action. The other world is processed only up to the first answer that would differ:
 * after it the player would have known something else, so nothing later is attributed to them.
 */
export const replayAttempt = (
  content: CaseContent,
  actions: readonly ActionId[],
  playedWorld: WorldId,
  savedContact: ContactAvailability,
): Replay => {
  const firstDifferent = actions.findIndex(
    (actionId) =>
      observe(content, actionId, { world: "legitimate", savedContact }).response.key !==
      observe(content, actionId, { world: "fraudulent", savedContact }).response.key,
  );
  const divergenceIndex = firstDifferent === -1 ? null : firstDifferent;

  const rows = actions.map((actionId, index): ReplayRow => {
    const beyondDivergence = divergenceIndex !== null && index > divergenceIndex;
    const inWorld = (world: WorldId) =>
      world === playedWorld || !beyondDivergence
        ? observe(content, actionId, { world, savedContact })
        : null;
    const legitimate = inWorld("legitimate");
    const fraudulent = inWorld("fraudulent");
    return {
      actionId,
      legitimate,
      fraudulent,
      same:
        legitimate !== null &&
        fraudulent !== null &&
        legitimate.response.key === fraudulent.response.key,
      divergent: index === divergenceIndex,
    };
  });

  return { rows, divergenceIndex };
};

/** Actions the other world inherits from the first attempt: everything up to the divergence. */
export const inheritedActions = (replay: Replay, actions: readonly ActionId[]): ActionId[] =>
  replay.divergenceIndex === null ? [...actions] : actions.slice(0, replay.divergenceIndex + 1);

/**
 * A procedure is decided in advance, so every step runs in both worlds. The divergence is only
 * marked; each branch then gets its own decision.
 */
export const runProcedure = (
  content: CaseContent,
  steps: readonly ActionId[],
  savedContact: ContactAvailability,
): Replay => {
  const rows = steps.map((actionId): ReplayRow => {
    const legitimate = observe(content, actionId, { world: "legitimate", savedContact });
    const fraudulent = observe(content, actionId, { world: "fraudulent", savedContact });
    return {
      actionId,
      legitimate,
      fraudulent,
      same: legitimate.response.key === fraudulent.response.key,
      divergent: false,
    };
  });
  const firstDifferent = rows.findIndex(({ same }) => !same);
  const divergenceIndex = firstDifferent === -1 ? null : firstDifferent;
  return {
    rows: rows.map((row, index) => ({ ...row, divergent: index === divergenceIndex })),
    divergenceIndex,
  };
};

/** Steps whose prerequisite is not placed earlier in the procedure. */
export const procedureGaps = (content: CaseContent, steps: readonly ActionId[]) =>
  steps.flatMap((actionId, index) => {
    const action = content.actions.find(({ id }) => id === actionId);
    const requires = action?.requires;
    return requires && !steps.slice(0, index).includes(requires) ? [{ actionId, requires }] : [];
  });

export const branchObservations = (replay: Replay, world: WorldId): Observation[] =>
  replay.rows.flatMap((row) => {
    const observation = row[world];
    return observation ? [observation] : [];
  });
