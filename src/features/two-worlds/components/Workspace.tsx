"use client";

import { useState } from "react";
import { CASES } from "../content";
import type { Run } from "../engine/game";
import { buildProvenance } from "../engine/provenance";
import { getVariant, observeAll } from "../engine/scenario";
import type { ActionId, Decision, PanelId, SourceId } from "../engine/types";
import { ActionHistory } from "./ActionHistory";
import { DecisionDialog } from "./DecisionDialog";
import { HowToPlay } from "./HowToPlay";
import { PanelView } from "./PanelView";
import { bodyHeadline, panelOf, plural, splitStoryTime } from "./presentation";
import { ProvenanceMap } from "./ProvenanceMap";
import { SourceList } from "./SourceList";
import { StageHeader, StoryClock } from "./StageHeader";
import { TEXT_BUTTON } from "./styles";
import { WORLD_PLATE, WorldBadge } from "./WorldBadge";
import { typography } from "../utils/typography";

interface WorkspaceProps {
  run: Run;
  onPerform: (actionId: ActionId) => void;
  onDecide: (decision: Decision, reliedOn: SourceId[]) => void;
  /** Only in a practice branch: back to the reveal of the first attempt. */
  onBackToReveal?: () => void;
}

const STEP_LABEL: Record<Run["step"], string | null> = {
  first_attempt: null,
  branch: "Procvičování",
  transfer: "Nový případ",
};

const countLabel = (count: number) =>
  count === 0
    ? "Zatím žádný podklad"
    : plural(count, "získaný podklad", "získané podklady", "získaných podkladů");

export function Workspace({ run, onPerform, onDecide, onBackToReveal }: WorkspaceProps) {
  const content = CASES[run.caseId];
  const message = getVariant(content, run.setup.variantId);
  const observations = observeAll(content, run.actions, run.setup);
  const provenance = buildProvenance(content, observations);
  const [selected, setSelected] = useState<PanelId>(content.panels[0].id);
  const [latest, setLatest] = useState<ActionId | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [focusPanel, setFocusPanel] = useState(false);
  const latestObservation = observations.find(({ actionId }) => actionId === latest);
  // Answers are announced by the transcript itself; this region only reports opened documents.
  const latestBody = latestObservation?.response.body;
  const announcement =
    latestBody && (latestBody.type === "document" || latestBody.type === "contact_card")
      ? `Nový podklad: ${bodyHeadline(latestBody)}`
      : "";
  const { day, time } = splitStoryTime(content.storyTime);
  const stepLabel = STEP_LABEL[run.step];
  // In a branch the reality is already known: the inherited answer that differed is marked.
  const branchWorld = run.step === "branch" ? run.setup.world : null;
  const divergentAction = branchWorld ? (run.actions[run.lockedCount - 1] ?? null) : null;
  // The incoming message is always on the map; everything else was obtained by the player.
  const obtained = countLabel(provenance.nodes.length - 1);

  const perform = (actionId: ActionId) => {
    const panel = panelOf(content, actionId);
    if (panel) setSelected(panel.id);
    setLatest(actionId);
    onPerform(actionId);
  };

  const select = (panelId: PanelId) => {
    setSelected(panelId);
    setFocusPanel(true);
    const panel = content.panels.find(({ id }) => id === panelId);
    const blocked = panel?.requires && !run.actions.includes(panel.requires);
    if (panel?.openAction && !blocked && !run.actions.includes(panel.openAction)) {
      perform(panel.openAction);
    }
  };

  const panel = content.panels.find(({ id }) => id === selected) ?? content.panels[0];
  const decideButton = (extra: string) => (
    <button type="button" className={`ds-btn ${extra}`} onClick={() => setDeciding(true)}>
      Rozhodnout o požadavku
    </button>
  );

  return (
    <div>
      {branchWorld && (
        <div
          className={`border-b-4 ${WORLD_PLATE[branchWorld].wash} ${
            branchWorld === "legitimate" ? "border-plate-1" : "border-plate-2"
          }`}
        >
          <div className="ds-container flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div>
              <WorldBadge world={branchWorld} />
              <p className="mt-1 leading-body">
                Pokračuješ v realitě „{content.worlds[branchWorld].name}“ od místa, kde se získané
                informace rozešly.
              </p>
            </div>
            {onBackToReveal && (
              <button
                type="button"
                className={`shrink-0 self-start sm:self-center ${TEXT_BUTTON}`}
                onClick={onBackToReveal}
              >
                Zpět na odhalení
              </button>
            )}
          </div>
        </div>
      )}
      <StageHeader
        kicker={[content.kicker, stepLabel].filter(Boolean).join(" · ")}
        title={content.title}
        lead={<p>{typography(content.context)}</p>}
        aside={<StoryClock time={time} note={`${day} · ${content.clockNote}`} />}
      >
        <HowToPlay />
      </StageHeader>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="ds-container grid pt-10 pb-bar sm:pb-20 md:grid-workspace md:pt-12 lg:grid-workspace-wide">
        <div className="min-w-0 md:pt-15">
          <SourceList content={content} done={run.actions} selected={panel.id} onSelect={select} />
        </div>
        <PanelView
          key={panel.id}
          content={content}
          panel={panel}
          message={message}
          done={run.actions}
          observations={observations}
          focusOnMount={focusPanel}
          divergentAction={divergentAction}
          onPerform={perform}
        />
        <aside
          aria-label="Okraj spisu"
          className="mt-14 grid min-w-0 content-start gap-10 sm:grid-cols-2 sm:gap-x-10 md:col-span-2 lg:col-span-1 lg:mt-0 lg:block lg:space-y-12 lg:pt-11 lg:pl-14"
        >
          <section aria-labelledby="decision-heading" className="ds-section hidden sm:block">
            <h2 id="decision-heading" className="ds-section__title mt-2">
              {branchWorld ? "Rozhodnutí v této větvi" : "Rozhodnutí"}
            </h2>
            <p className="mt-4 mb-5 text-small leading-body text-ink-2">
              {obtained}. Rozhodnout můžeš kdykoli, ověření není podmínkou.
            </p>
            {decideButton("w-full sm:w-auto lg:w-full")}
          </section>
          <ProvenanceMap content={content} observations={observations} />
        </aside>
        <div className="col-span-full mt-16">
          <ActionHistory
            content={content}
            observations={observations}
            lockedCount={run.lockedCount}
            subject={message.subject}
            branchWorld={branchWorld}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-ink bg-paper sm:hidden">
        <div className="ds-container flex items-center justify-between gap-4 py-3">
          <p className="text-small">
            {plural(provenance.nodes.length - 1, "podklad", "podklady", "podkladů")}
          </p>
          {decideButton("")}
        </div>
      </div>

      <DecisionDialog
        open={deciding}
        content={content}
        sources={provenance.nodes}
        lockNote={
          run.step === "first_attempt"
            ? "Po potvrzení se první pokus uzamkne."
            : "Po potvrzení se tento průchod uloží."
        }
        onClose={() => setDeciding(false)}
        onConfirm={(decision, reliedOn) => {
          setDeciding(false);
          onDecide(decision, reliedOn);
        }}
      />
    </div>
  );
}
