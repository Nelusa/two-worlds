import type { ActionId, Body, CaseContent, PanelDef, PanelId, PanelKind } from "../engine/types";
import type { IconName } from "./Icon";

export const PANEL_ICON: Record<PanelId, IconName> = {
  email: "email",
  message: "email",
  attachment: "attachment",
  forwarded_confirmation: "attachment",
  original_order: "order",
  original_confirmation: "order",
  colleague: "colleague",
  attachment_contact: "phone",
  new_contact: "phone",
  saved_contact: "contactCard",
  original_contact: "contactCard",
};

/** Sheet number in the case file, e.g. "06". */
export const panelNumber = (content: CaseContent, panelId: PanelId) =>
  String(content.panels.findIndex(({ id }) => id === panelId) + 1).padStart(2, "0");

/** Czech plural: 1 podklad, 2 až 4 podklady, 5 a více podkladů. */
export const plural = (count: number, one: string, few: string, many: string) =>
  `${count} ${count === 1 ? one : count >= 2 && count <= 4 ? few : many}`;

export const PANEL_KIND_LABEL: Record<PanelKind, string> = {
  message: "e-mail",
  document: "dokument",
  person: "kolega",
  contact: "telefon",
};

export type PanelTone = "done" | "new" | "locked";

/** Neutral progress of a panel in the case file. Never a verdict about the content. */
export const panelStatus = (
  panel: PanelDef,
  done: readonly ActionId[],
): { label: string; tone: PanelTone } => {
  if (panel.kind === "message") return { label: "Přečteno", tone: "done" };
  if (panel.requires && !done.includes(panel.requires)) {
    return { label: "Nejprve potřebuješ podklad", tone: "locked" };
  }
  if (panel.openAction && !done.includes(panel.openAction)) {
    return { label: "Neotevřeno", tone: "new" };
  }
  const asked = panel.questions.filter((id) => done.includes(id)).length;
  if (panel.questions.length === 0) return { label: "Otevřeno", tone: "done" };
  if (asked === 0) {
    return { label: panel.openAction ? "Otevřeno, bez hovoru" : "Zatím bez dotazu", tone: "new" };
  }
  return { label: asked === 1 ? "1 odpověď" : `${asked} odpovědi`, tone: "done" };
};

export const panelOf = (content: CaseContent, actionId: ActionId) =>
  content.panels.find(
    (panel) => panel.openAction === actionId || panel.questions.includes(actionId),
  );

/** One-line text of an answer, for announcements and summaries. */
export const bodyHeadline = (body: Body): string => {
  switch (body.type) {
    case "reply":
      return `„${body.quote}“`;
    case "status":
      return body.text;
    case "document":
    case "contact_card":
      return body.heading;
  }
};

/** "Dnes 16:42" → day and clock parts for the case header. */
export const splitStoryTime = (storyTime: string) => {
  const parts = storyTime.split(" ");
  return { day: parts.slice(0, -1).join(" "), time: parts.at(-1) ?? storyTime };
};

export const initialOf = (name: string) => name.trim().charAt(0).toUpperCase();
