import {
  assessGrounding,
  evidenceLabel,
  GROUNDING_TEXT,
  summarizeEvidence,
} from "../engine/assessment";
import type { CaseContent, Decision, Observation } from "../engine/types";
import { typography } from "../utils/typography";

interface GroundingCardProps {
  content: CaseContent;
  observations: Observation[];
  decision: Decision;
  title?: string;
}

/** How the decision follows from the evidence. Identical evidence gives an identical verdict in both worlds. */
export function GroundingCard({
  content,
  observations,
  decision,
  title = "Podloženost rozhodnutí",
}: GroundingCardProps) {
  const evidence = summarizeEvidence(content, observations);
  const grounding = GROUNDING_TEXT[assessGrounding(evidence, decision)];
  const repeated = content.sources.filter(({ id }) => evidence.requestOriginSources.includes(id));

  return (
    <div>
      <p className="font-mono text-meta text-ink-3">{title.toLowerCase()}</p>
      <p className="mt-3 font-display text-h1 leading-tight font-extrabold tracking-display">
        {grounding.label}
      </p>
      <p className="mt-4 font-bold">{evidenceLabel(evidence)}</p>
      <p className="mt-2 max-w-140 leading-body">{typography(grounding.explanation)}</p>
      {evidence.identityOnly && (
        <p className="mt-3 max-w-140 leading-body text-ink-2">
          Přes původní kontakt zaznělo, kdo je u telefonu. Na konkrétní změnu se ale nikdo nezeptal,
          a totožnost sama změnu neopravňuje.
        </p>
      )}
      {repeated.length > 1 && (
        <p className="mt-3 max-w-140 leading-body text-ink-2">
          {repeated.length} podklady ({repeated.map(({ title: name }) => name).join(", ")})
          vycházejí ze stejné zprávy. Působí jako několik potvrzení, ale jde o jeden zdroj.
        </p>
      )}
    </div>
  );
}
