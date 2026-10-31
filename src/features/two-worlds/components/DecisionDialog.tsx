"use client";

import { useState } from "react";
import type { ProvenanceNode } from "../engine/provenance";
import type { CaseContent, Decision, SourceId } from "../engine/types";
import { CheckOption, ChoiceCard } from "./Controls";
import { Dialog } from "./Dialog";

interface DecisionDialogProps {
  open: boolean;
  content: CaseContent;
  sources: ProvenanceNode[];
  lockNote: string;
  onClose: () => void;
  onConfirm: (decision: Decision, reliedOn: SourceId[]) => void;
}

/**
 * Three equal options in a fixed order, nothing preselected. Confirm stays reachable but
 * aria-disabled until something is picked, with the reason written next to it.
 */
export function DecisionDialog({
  open,
  content,
  sources,
  lockNote,
  onClose,
  onConfirm,
}: DecisionDialogProps) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reliedOn, setReliedOn] = useState<SourceId[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const unavailable = !decision || submitted;

  const toggleSource = (id: SourceId) =>
    setReliedOn((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const confirm = () => {
    if (!decision || submitted) return;
    setSubmitted(true);
    onConfirm(decision, reliedOn);
  };

  return (
    <Dialog
      open={open}
      kicker={`${content.kicker.toLowerCase()} · rozhodnutí`}
      title="Tvoje rozhodnutí"
      onClose={onClose}
      footer={
        <div>
          <p className="text-small leading-body">{lockNote}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="ds-btn"
              aria-disabled={unavailable ? "true" : undefined}
              aria-describedby={!decision ? "decision-hint" : undefined}
              onClick={confirm}
            >
              Potvrdit rozhodnutí
            </button>
            <button type="button" className="ds-btn ds-btn--secondary" onClick={onClose}>
              Zpět k podkladům
            </button>
          </div>
          {!decision && (
            <p id="decision-hint" className="mt-3 text-micro text-ink-2">
              Nejdřív vyber jednu možnost.
            </p>
          )}
        </div>
      }
    >
      <form
        className="space-y-8 border-t border-ink pt-5"
        onSubmit={(event) => {
          event.preventDefault();
          confirm();
        }}
      >
        <fieldset>
          <legend className="mb-3 font-bold">Jak s požadavkem naložíš?</legend>
          {content.decisionOptions.map((option) => (
            <ChoiceCard
              key={option.decision}
              name="decision"
              checked={decision === option.decision}
              onChange={() => setDecision(option.decision)}
              title={option.label}
              description={option.description}
            />
          ))}
        </fieldset>
        {sources.length > 0 && (
          <fieldset>
            <legend className="mb-2 font-bold">
              O které podklady se opíráš? <span className="font-normal text-ink-3">Nepovinné</span>
            </legend>
            <div className="border-b border-rule sm:grid sm:grid-cols-2 sm:gap-x-6">
              {sources.map((source) => (
                <CheckOption
                  key={source.id}
                  checked={reliedOn.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                >
                  {source.title}
                </CheckOption>
              ))}
            </div>
          </fieldset>
        )}
      </form>
    </Dialog>
  );
}
