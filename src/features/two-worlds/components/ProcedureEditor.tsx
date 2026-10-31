"use client";

import { useId, useState } from "react";
import { CASES } from "../content";
import {
  assessGrounding,
  describeOutcome,
  GROUNDING_TEXT,
  summarizeEvidence,
} from "../engine/assessment";
import type { ProcedureTrial } from "../engine/game";
import { branchObservations, procedureGaps, runProcedure } from "../engine/replay";
import { getAction } from "../engine/scenario";
import type { ActionId, CaseId, ContactAvailability, Decision, WorldId } from "../engine/types";
import { typography } from "../utils/typography";
import { ComparisonGrid } from "./ComparisonGrid";
import { CheckOption, ChoiceCard } from "./Controls";
import { Icon } from "./Icon";
import { bodyHeadline } from "./presentation";
import { StageHeader } from "./StageHeader";
import { TEXT_BUTTON } from "./styles";
import { WORLD_PLATE, WorldBadge, WORLDS } from "./WorldBadge";

interface ProcedureEditorProps {
  caseId: CaseId;
  steps: ActionId[];
  savedContact: ContactAvailability;
  usedSample: boolean;
  trial: ProcedureTrial | null;
  onStepsChange: (steps: ActionId[]) => void;
  onUseSample: () => void;
  onContactChange: (savedContact: ContactAvailability) => void;
  onRun: () => void;
  onEdit: () => void;
  onDecide: (worlds: WorldId[], decision: Decision) => void;
  onContinue: () => void;
}

const move = (steps: ActionId[], index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= steps.length) return steps;
  const next = [...steps];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const STEP_BUTTON =
  "min-h-11 px-2 text-small font-bold underline decoration-2 underline-offset-4 hover:decoration-4 aria-disabled:cursor-not-allowed aria-disabled:text-ink-3 aria-disabled:no-underline";

function DecisionPicker({
  caseId,
  legend,
  onConfirm,
}: {
  caseId: CaseId;
  legend: string;
  onConfirm: (decision: Decision) => void;
}) {
  const [choice, setChoice] = useState<Decision | null>(null);
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-2 font-bold">{legend}</legend>
      {CASES[caseId].decisionOptions.map((option) => (
        <ChoiceCard
          key={option.decision}
          name={name}
          checked={choice === option.decision}
          onChange={() => setChoice(option.decision)}
          title={option.label}
          plain
        />
      ))}
      <button
        type="button"
        aria-disabled={choice ? undefined : "true"}
        className="ds-btn mt-4"
        onClick={() => choice && onConfirm(choice)}
      >
        Potvrdit
      </button>
    </fieldset>
  );
}

function BranchOutcome({
  caseId,
  world,
  decision,
  grounding,
}: {
  caseId: CaseId;
  world: WorldId;
  decision: Decision;
  grounding: string;
}) {
  const content = CASES[caseId];
  const outcome = describeOutcome(content, world, decision);
  const label = content.decisionOptions.find((option) => option.decision === decision)?.label;
  return (
    <div className="space-y-1.5">
      <p className="text-small text-ink-2">Rozhodnutí: {label}</p>
      <p className="font-display text-h3 leading-head font-extrabold tracking-display">
        {outcome.status}
      </p>
      <p className="text-small leading-body">{typography(outcome.consequence)}</p>
      <p className="pt-2 text-small font-bold">{grounding}</p>
    </div>
  );
}

export function ProcedureEditor({
  caseId,
  steps,
  savedContact,
  usedSample,
  trial,
  onStepsChange,
  onUseSample,
  onContactChange,
  onRun,
  onEdit,
  onDecide,
  onContinue,
}: ProcedureEditorProps) {
  const content = CASES[caseId];
  const gaps = procedureGaps(content, steps);
  const replay = runProcedure(content, steps, savedContact);
  const split = replay.divergenceIndex;

  const runBlocked = steps.length === 0 || gaps.length > 0;
  const candidates = content.actions.filter(({ procedureStep }) => procedureStep);

  return (
    <div>
      <StageHeader
        kicker={`${content.kicker} · Můj postup`}
        title="Můj postup"
        lead={
          <p>
            Vyber úkony, které uděláš, než o změně rozhodneš, a seřaď je. Postup se pak přehraje v
            obou realitách najednou a potom ho vyzkoušíš na druhém případu.
          </p>
        }
      />
      <div className="ds-container pt-10 pb-24">
        {!trial && (
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-14">
            <fieldset className="border-2 border-ink px-5 pt-2 pb-6 sm:px-8 lg:col-span-2">
              <legend className="-ml-2 px-2 font-display text-h3 leading-head font-extrabold tracking-display">
                Úkony
              </legend>
              <p className="mt-2 mb-3 text-small text-ink-2">
                Můžeš vybrat více úkonů. Pořadí je podle toho, jak je přidáváš, a v postupu ho můžeš
                změnit.
              </p>
              <div className="border-b border-rule">
                {candidates.map((action) => (
                  <CheckOption
                    key={action.id}
                    checked={steps.includes(action.id)}
                    onChange={() =>
                      onStepsChange(
                        steps.includes(action.id)
                          ? steps.filter((id) => id !== action.id)
                          : [...steps, action.id],
                      )
                    }
                  >
                    {typography(action.shortLabel)}
                  </CheckOption>
                ))}
              </div>
              <div className="mt-6 space-y-3 text-small">
                <p className="font-bold">Ukázkový postup</p>
                <p className="text-ink-2">
                  Vyplní dva kroky za tebe. Výsledek se označí jako ukázka, ne jako tvůj samostatný
                  výkon.
                </p>
                <button
                  type="button"
                  className="ds-btn ds-btn--secondary ds-btn--sm"
                  onClick={onUseSample}
                >
                  Vložit ukázkový postup
                </button>
              </div>
            </fieldset>

            <section aria-labelledby="my-steps-heading" className="ds-section self-start">
              <h2
                id="my-steps-heading"
                className="ds-section__title mt-2 flex items-baseline justify-between gap-3"
              >
                Kroky postupu
                {usedSample && <span className="font-mono text-meta font-normal">ukázka</span>}
              </h2>
              {steps.length === 0 ? (
                <p className="mt-4 border-y border-ink py-6 text-small text-ink-2">
                  Zatím prázdný. Vyber úkony v seznamu.
                </p>
              ) : (
                <ol className="mt-4">
                  {steps.map((actionId, index) => {
                    const action = getAction(content, actionId);
                    const gap = gaps.find((item) => item.actionId === actionId);
                    return (
                      <li key={actionId} className="border-b border-ink py-3">
                        <div className="flex gap-4">
                          <span
                            aria-hidden="true"
                            className="w-5 shrink-0 font-display text-h4 font-extrabold"
                          >
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1 font-bold">
                            {typography(action.shortLabel)}
                          </span>
                        </div>
                        <div className="ml-7 flex flex-wrap">
                          <button
                            type="button"
                            aria-label={`výš: ${action.shortLabel}`}
                            aria-disabled={index === 0 ? "true" : undefined}
                            className={`-ml-2 ${STEP_BUTTON}`}
                            onClick={() => index > 0 && onStepsChange(move(steps, index, -1))}
                          >
                            výš
                          </button>
                          <button
                            type="button"
                            aria-label={`níž: ${action.shortLabel}`}
                            aria-disabled={index === steps.length - 1 ? "true" : undefined}
                            className={STEP_BUTTON}
                            onClick={() =>
                              index < steps.length - 1 && onStepsChange(move(steps, index, 1))
                            }
                          >
                            níž
                          </button>
                          <button
                            type="button"
                            aria-label={`odebrat: ${action.shortLabel}`}
                            className={STEP_BUTTON}
                            onClick={() => onStepsChange(steps.filter((id) => id !== actionId))}
                          >
                            odebrat
                          </button>
                        </div>
                        {gap && (
                          <div className="mt-2 ml-7 border-l-4 border-ink pl-3 text-small">
                            <p>{action.requiresHint}</p>
                            <button
                              type="button"
                              className={TEXT_BUTTON}
                              onClick={() =>
                                onStepsChange([
                                  ...steps.slice(0, index).filter((id) => id !== gap.requires),
                                  gap.requires,
                                  ...steps.slice(index).filter((id) => id !== gap.requires),
                                ])
                              }
                            >
                              Vložit krok před
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
              <div className="mt-4">
                <CheckOption
                  checked={savedContact === "unreachable"}
                  onChange={() =>
                    onContactChange(savedContact === "unreachable" ? "available" : "unreachable")
                  }
                  description="Původní kontakt v obou realitách nebere telefon. Jak se pak rozhodneš?"
                >
                  Vyzkoušet s nedostupným původním kontaktem
                </CheckOption>
              </div>
              <button
                type="button"
                className="ds-btn mt-4 w-full"
                aria-disabled={runBlocked ? "true" : undefined}
                aria-describedby={runBlocked ? "run-hint" : undefined}
                onClick={() => !runBlocked && onRun()}
              >
                Přehrát v obou realitách
              </button>
              {runBlocked && (
                <p id="run-hint" className="mt-3 text-small text-ink-2">
                  {steps.length === 0
                    ? "Vyber aspoň jeden úkon."
                    : "Nejdřív doplň krok, který úkon potřebuje."}
                </p>
              )}
            </section>
          </div>
        )}

        {trial && (
          <div className="space-y-16">
            {usedSample && (
              <p className="border-l-4 border-ink py-1 pl-4 text-small font-bold">
                Ukázkový postup: výsledek ukazuje připravený postup, ne tvůj samostatný výkon.
              </p>
            )}
            <section aria-labelledby="trial-heading">
              <h2
                id="trial-heading"
                className="mb-6 border-section pt-6 font-display text-h3 leading-head font-extrabold tracking-display"
              >
                Postup v obou realitách
                {savedContact === "unreachable" && ", původní kontakt nedostupný"}
              </h2>
              <ComparisonGrid content={content} replay={replay} playedWorld={null} />
            </section>
            <section aria-labelledby="branch-decisions">
              <h2
                id="branch-decisions"
                className="border-section pt-6 font-display text-h3 leading-head font-extrabold tracking-display"
              >
                Rozhodnutí
              </h2>
              <p className="mt-3 mb-8 max-w-160 leading-body text-ink-2">
                {split === null
                  ? "Žádná odpověď se mezi realitami nelišila. Se stejnými podklady se rozhoduješ jednou a stejně pro obě."
                  : `Od úkonu ${split + 1} se získané informace rozcházejí. Každá větev proto dostane vlastní rozhodnutí podle toho, co v ní zaznělo.`}
              </p>
              {split === null && !trial.decisions.legitimate ? (
                <div className="max-w-lg">
                  <DecisionPicker
                    caseId={caseId}
                    legend="Rozhodnutí pro obě reality"
                    onConfirm={(decision) => onDecide(WORLDS, decision)}
                  />
                </div>
              ) : (
                <div className="grid gap-12 sm:grid-compare sm:gap-14">
                  {WORLDS.map((world) => {
                    const decision = trial.decisions[world];
                    const observations = branchObservations(replay, world);
                    const lastAnswer = split === null ? null : replay.rows[split][world];
                    return (
                      <div key={world} className={`space-y-4 pt-4 ${WORLD_PLATE[world].rule}`}>
                        <WorldBadge world={world} />
                        {lastAnswer && (
                          <p className="font-display text-h4 leading-head font-bold">
                            {typography(bodyHeadline(lastAnswer.response.body))}
                          </p>
                        )}
                        {decision ? (
                          <BranchOutcome
                            caseId={caseId}
                            world={world}
                            decision={decision}
                            grounding={
                              GROUNDING_TEXT[
                                assessGrounding(summarizeEvidence(content, observations), decision)
                              ].label
                            }
                          />
                        ) : (
                          <DecisionPicker
                            caseId={caseId}
                            legend="Rozhodnutí v této větvi"
                            onConfirm={(choice) => onDecide([world], choice)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            <div className="flex flex-col gap-3 border-t border-ink pt-8 sm:flex-row sm:items-center sm:gap-6">
              {trial.recordId && (
                <button type="button" className="ds-btn" onClick={onContinue}>
                  Pokračovat na nový případ
                  <Icon name="arrow" />
                </button>
              )}
              <button type="button" className={TEXT_BUTTON} onClick={onEdit}>
                Upravit postup a zkusit znovu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
