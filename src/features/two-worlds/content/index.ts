import type { CaseContent, CaseId } from "../engine/types";
import { EVENING_CASE } from "./evening";
import { HANDOVER_CASE } from "./handover";

/** Bump when facts, ids or responses change; saved progress from another version is not replayed. */
export const CONTENT_VERSION = "2026-10-25.1";

export const CASES: Record<CaseId, CaseContent> = {
  evening: EVENING_CASE,
  handover: HANDOVER_CASE,
};
