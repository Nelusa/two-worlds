export type WorldId = "legitimate" | "fraudulent";

export type CaseId = "evening" | "handover";

export type ContactAvailability = "available" | "unreachable";

export type Mode = "first_attempt" | "practice" | "transfer" | "demo";

export type Decision = "approve" | "reject" | "wait";

export type EveningActionId =
  | "open_attachment"
  | "open_original_order"
  | "ask_colleague"
  | "call_attachment_contact"
  | "open_saved_contact"
  | "saved_contact_identity"
  | "saved_contact_change";

export type HandoverActionId =
  | "open_original_confirmation"
  | "open_forwarded_confirmation"
  | "call_new_contact"
  | "original_contact_identity"
  | "original_contact_change";

export type ActionId = EveningActionId | HandoverActionId;

export type SourceId =
  | "email"
  | "attachment"
  | "colleague_reply"
  | "attachment_contact_reply"
  | "original_order"
  | "saved_contact_card"
  | "saved_contact_reply"
  | "handover_message"
  | "original_confirmation"
  | "forwarded_confirmation"
  | "new_contact_reply"
  | "original_contact_reply";

export type ChannelId = "attachment_contact" | "saved_contact" | "new_contact" | "original_contact";

/** Where a piece of information ultimately comes from. */
export type Root = "incoming_request" | "prior_record";

/**
 * Concrete statements an observation supports. Identity and the requested change are
 * separate claim types on purpose: confirming who answers never confirms what they approve.
 */
export type Claim =
  | { type: "request_details"; sourceId: SourceId }
  | { type: "repeats_request"; sourceId: SourceId }
  | { type: "previous_target"; sourceId: SourceId; value: string }
  | { type: "channel_identified"; channel: ChannelId }
  | { type: "identity_confirmed"; channel: ChannelId }
  | { type: "requested_change_confirmed"; channel: ChannelId }
  | { type: "requested_change_denied"; channel: ChannelId }
  | { type: "contact_unreachable"; channel: ChannelId };

export interface Field {
  label: string;
  value: string;
}

export type Body =
  | { type: "document"; heading: string; fields: Field[] }
  | { type: "reply"; speaker: string; question: string; quote: string }
  | { type: "contact_card"; heading: string; fields: Field[] }
  | { type: "status"; question: string; text: string };

export interface Response {
  /** Equality basis for replay: two responses differ exactly when their keys differ. */
  key: string;
  body: Body;
  claims: Claim[];
}

export type ResponseByWorld = Record<WorldId, Response>;

export interface ActionDef {
  id: ActionId;
  panelId: PanelId;
  label: string;
  /** Short neutral description used in history and in the procedure editor. */
  shortLabel: string;
  sourceId: SourceId;
  requires?: ActionId;
  requiresHint?: string;
  /** Answers from the saved contact depend on its availability. */
  channel?: ChannelId;
  response: Response | ResponseByWorld;
  unreachableResponse?: Response;
  /** Offered in the procedure editor ("Můj postup"). */
  procedureStep: boolean;
}

export type PanelId =
  | "email"
  | "attachment"
  | "original_order"
  | "colleague"
  | "attachment_contact"
  | "saved_contact"
  | "message"
  | "original_confirmation"
  | "forwarded_confirmation"
  | "new_contact"
  | "original_contact";

export type PanelKind = "message" | "document" | "person" | "contact";

export interface PanelDef {
  id: PanelId;
  title: string;
  originLabel: string;
  kind: PanelKind;
  /** The action that opens this panel's content; absent for the always-open message. */
  openAction?: ActionId;
  /** Question actions offered inside the panel. */
  questions: ActionId[];
  /** Panel content needs this action first (e.g. a phone number printed in an attachment). */
  requires?: ActionId;
  requiresHint?: string;
}

export interface SourceDef {
  id: SourceId;
  title: string;
  root: Root;
  derivedFrom?: SourceId;
  /** Neutral edge label shown in the provenance map. */
  relation?: string;
  /** Grid cell in the provenance map: column = step away from the origin, row = lane. */
  mapPosition: { column: number; row: number };
}

export interface MessageVariant {
  id: string;
  from: string;
  address: string;
  subject: string;
  paragraphs: string[];
  signature: string;
  attachmentName?: string;
}

export interface DecisionOption {
  decision: Decision;
  label: string;
  description: string;
}

export interface WorldStory {
  name: string;
  sender: string;
  truth: string;
  outcomes: Record<Decision, { status: string; consequence: string }>;
}

export interface CaseContent {
  id: CaseId;
  title: string;
  kicker: string;
  storyTime: string;
  /** Short line under the story clock in the case header. */
  clockNote: string;
  context: string;
  variants: MessageVariant[];
  /** Opens the attachment of the incoming message, if it has one. */
  attachmentAction?: ActionId;
  panels: PanelDef[];
  actions: ActionDef[];
  sources: SourceDef[];
  channels: Record<string, { root: Root; label: string }>;
  decisionOptions: DecisionOption[];
  worlds: Record<WorldId, WorldStory>;
  modelAssumption: string;
  changeLabel: string;
}

export interface Setup {
  world: WorldId;
  variantId: string;
  savedContact: ContactAvailability;
}

export interface Observation {
  actionId: ActionId;
  sourceId: SourceId;
  response: Response;
}
