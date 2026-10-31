import type { CaseContent, Claim, Decision, Observation, SourceId, WorldId } from "./types";

export type IndependentCheck = "confirmed" | "denied" | "unreachable" | "not_checked";

/** What the observations support, independent of the hidden world. */
export interface EvidenceSummary {
  independentCheck: IndependentCheck;
  /** Identity confirmed over an independent channel without asking about the change itself. */
  identityOnly: boolean;
  /** Distinct sources that repeat or confirm the request but all trace back to it. */
  requestOriginSources: SourceId[];
  previousTargetSeen: boolean;
  independentChannelFound: boolean;
}

const claimsOf = (observations: readonly Observation[]): Claim[] =>
  observations.flatMap(({ response }) => response.claims);

const sourceRoot = (content: CaseContent, sourceId: SourceId) =>
  content.sources.find(({ id }) => id === sourceId)?.root;

export const summarizeEvidence = (
  content: CaseContent,
  observations: readonly Observation[],
): EvidenceSummary => {
  const claims = claimsOf(observations);
  const isIndependent = (channel: string) => content.channels[channel]?.root === "prior_record";

  const confirmed = claims.some(
    (claim) => claim.type === "requested_change_confirmed" && isIndependent(claim.channel),
  );
  const denied = claims.some(
    (claim) => claim.type === "requested_change_denied" && isIndependent(claim.channel),
  );
  const unreachable = claims.some(
    (claim) => claim.type === "contact_unreachable" && isIndependent(claim.channel),
  );
  const identity = claims.some(
    (claim) => claim.type === "identity_confirmed" && isIndependent(claim.channel),
  );

  const independentCheck: IndependentCheck = confirmed
    ? "confirmed"
    : denied
      ? "denied"
      : unreachable
        ? "unreachable"
        : "not_checked";

  const requestOriginSources = [
    ...new Set(
      observations
        .filter(
          ({ sourceId, response }) =>
            response.claims.some(
              (claim) =>
                claim.type === "request_details" ||
                claim.type === "repeats_request" ||
                (claim.type === "requested_change_confirmed" && !isIndependent(claim.channel)),
            ) && sourceRoot(content, sourceId) === "incoming_request",
        )
        .map(({ sourceId }) => sourceId),
    ),
  ];

  return {
    independentCheck,
    identityOnly: identity && independentCheck === "not_checked",
    requestOriginSources,
    previousTargetSeen: claims.some(({ type }) => type === "previous_target"),
    independentChannelFound: claims.some(
      (claim) => claim.type === "channel_identified" && isIndependent(claim.channel),
    ),
  };
};

export type Grounding =
  | "supported_approval"
  | "supported_rejection"
  | "reasonable_wait"
  | "wait_without_check"
  | "wait_despite_answer"
  | "unsupported_approval"
  | "unsupported_rejection"
  | "against_evidence";

/** How well a decision follows from the evidence. Depends on observations only, never on the world. */
export const assessGrounding = (evidence: EvidenceSummary, decision: Decision): Grounding => {
  const { independentCheck } = evidence;
  if (decision === "wait") {
    if (independentCheck === "unreachable") return "reasonable_wait";
    if (independentCheck === "not_checked") return "wait_without_check";
    return "wait_despite_answer";
  }
  if (decision === "approve") {
    if (independentCheck === "confirmed") return "supported_approval";
    if (independentCheck === "denied") return "against_evidence";
    return "unsupported_approval";
  }
  if (independentCheck === "denied") return "supported_rejection";
  if (independentCheck === "confirmed") return "against_evidence";
  return "unsupported_rejection";
};

export const evidenceLabel = (evidence: EvidenceSummary): string => {
  switch (evidence.independentCheck) {
    case "confirmed":
      return "Změna potvrzená přes původní kontakt";
    case "denied":
      return "Změna vyvrácená přes původní kontakt";
    case "unreachable":
      return "Původní kontakt se nepodařilo zastihnout";
    case "not_checked":
      return "Chybí nezávislé potvrzení změny";
  }
};

export const GROUNDING_TEXT: Record<Grounding, { label: string; explanation: string }> = {
  supported_approval: {
    label: "Podložené odsouhlasení",
    explanation:
      "Konkrétní změnu potvrdila odpověď přes kontakt, který nepřišel se zprávou. Odsouhlasení z ní vychází.",
  },
  supported_rejection: {
    label: "Podložené odmítnutí",
    explanation:
      "Konkrétní změnu vyvrátila odpověď přes kontakt, který nepřišel se zprávou. Odmítnutí z ní vychází.",
  },
  reasonable_wait: {
    label: "Přiměřené odložení",
    explanation:
      "Nezávislou cestu jsi zkusil/a, ale odpověď zatím chybí. Bez rozhodujícího podkladu je odklad rozumný. Úkol tím ještě není vyřízený.",
  },
  wait_without_check: {
    label: "Odloženo bez ověření",
    explanation:
      "Odklad je bezpečný a nic nepokazí. Nezávislé ověření ale zatím nezaznělo, takže úkol čeká, dokud ho někdo neudělá.",
  },
  wait_despite_answer: {
    label: "Odloženo, i když odpověď existuje",
    explanation:
      "Odpověď přes původní kontakt už byla k dispozici. Odklad nic nepokazil, jen úkol zůstává nevyřízený.",
  },
  unsupported_approval: {
    label: "Odsouhlasení bez nezávislého potvrzení",
    explanation:
      "Žádná odpověď mimo samotnou zprávu změnu nepotvrdila. I kdyby výsledek dopadl dobře, rozhodlo štěstí, ne podklad.",
  },
  unsupported_rejection: {
    label: "Odmítnutí bez nezávislého vyvrácení",
    explanation:
      "Odmítnutí chrání před neoprávněnou změnou, ale chybí podklad, že jde o podvod. Oprávněný požadavek by tím zůstal nevyřízený.",
  },
  against_evidence: {
    label: "Rozhodnuto jinak, než řekla odpověď",
    explanation: "Odpověď přes původní kontakt říkala opak toho, co bylo rozhodnuto.",
  },
};

export type OutcomeKind =
  | "request_fulfilled"
  | "unauthorized_change"
  | "legitimate_unresolved"
  | "fraud_blocked"
  | "paused";

export const outcomeKind = (world: WorldId, decision: Decision): OutcomeKind => {
  if (decision === "wait") return "paused";
  if (decision === "approve")
    return world === "legitimate" ? "request_fulfilled" : "unauthorized_change";
  return world === "legitimate" ? "legitimate_unresolved" : "fraud_blocked";
};

export const describeOutcome = (content: CaseContent, world: WorldId, decision: Decision) =>
  content.worlds[world].outcomes[decision];
