import type {
  ActionDef,
  ActionId,
  CaseContent,
  ContactAvailability,
  MessageVariant,
  Observation,
  Response,
  ResponseByWorld,
  WorldId,
} from "./types";

export interface Condition {
  world: WorldId;
  savedContact: ContactAvailability;
}

const isByWorld = (response: Response | ResponseByWorld): response is ResponseByWorld =>
  "legitimate" in response;

export const getAction = (content: CaseContent, actionId: ActionId): ActionDef => {
  const action = content.actions.find(({ id }) => id === actionId);
  if (!action) throw new Error(`Unknown action ${actionId} in case ${content.id}`);
  return action;
};

export const isCaseAction = (content: CaseContent, actionId: string): actionId is ActionId =>
  content.actions.some(({ id }) => id === actionId);

export const getVariant = (content: CaseContent, variantId: string): MessageVariant => {
  const variant = content.variants.find(({ id }) => id === variantId);
  if (!variant) throw new Error(`Unknown variant ${variantId} in case ${content.id}`);
  return variant;
};

/** The only thing the player sees before any action. Built from the variant alone, never the world. */
export const initialMessage = (content: CaseContent, variantId: string): MessageVariant =>
  getVariant(content, variantId);

export const observe = (
  content: CaseContent,
  actionId: ActionId,
  condition: Condition,
): Observation => {
  const action = getAction(content, actionId);
  const response =
    action.unreachableResponse && condition.savedContact === "unreachable"
      ? action.unreachableResponse
      : isByWorld(action.response)
        ? action.response[condition.world]
        : action.response;
  return { actionId, sourceId: action.sourceId, response };
};

export const missingPrerequisite = (
  content: CaseContent,
  actionId: ActionId,
  done: readonly ActionId[],
): ActionDef | null => {
  const { requires } = getAction(content, actionId);
  return requires && !done.includes(requires) ? getAction(content, requires) : null;
};

/**
 * Appends an action to the log. Repeating an action (re-opening a document, asking the same
 * question twice) adds nothing: the same answer is not a new source.
 */
export const performAction = (
  content: CaseContent,
  done: readonly ActionId[],
  actionId: ActionId,
): ActionId[] => {
  if (done.includes(actionId)) return [...done];
  if (missingPrerequisite(content, actionId, done)) return [...done];
  return [...done, actionId];
};

export const observeAll = (
  content: CaseContent,
  actions: readonly ActionId[],
  condition: Condition,
): Observation[] => actions.map((actionId) => observe(content, actionId, condition));
