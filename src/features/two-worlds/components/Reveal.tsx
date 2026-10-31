"use client";

import { useEffect, useRef, useState } from "react";
import { CASES } from "../content";
import { describeOutcome } from "../engine/assessment";
import type { DecisionRecord } from "../engine/game";
import { branchObservations, replayAttempt } from "../engine/replay";
import { getAction, getVariant } from "../engine/scenario";
import type { WorldId } from "../engine/types";
import { typography } from "../utils/typography";
import { MessageView } from "./BodyView";
import { ComparisonGrid } from "./ComparisonGrid";
import { GroundingCard } from "./GroundingCard";
import { Icon } from "./Icon";
import { ProvenanceMap } from "./ProvenanceMap";
import { StageHeading } from "./StageHeading";
import { TEXT_BUTTON } from "./styles";
import { reveal, useRevealChoreography } from "./useRevealChoreography";
import { WORLD_PLATE, WorldBadge, WORLDS } from "./WorldBadge";

interface RevealProps {
  record: DecisionRecord;
  revealed: 1 | 2 | 3;
  canBranch: boolean;
  onRevealMore: () => void;
  onRevealAll: () => void;
  onBranch: (world: WorldId) => void;
  onNext: () => void;
  nextLabel: string;
  /** One sentence on what the next step is for. */
  nextHint?: string;
}

const STEPS = ["Stejná zpráva", "Tvoje úkony v obou realitách", "Rozhodnutí a důsledky"];
const STEP_SHORT = ["Stejná zpráva", "Tvoje úkony", "Důsledky"];

export function Reveal({
  record,
  revealed,
  canBranch,
  onRevealMore,
  onRevealAll,
  onBranch,
  onNext,
  nextLabel,
  nextHint,
}: RevealProps) {
  const content = CASES[record.caseId];
  const played = record.setup.world;
  const replay = replayAttempt(content, record.actions, played, record.setup.savedContact);
  const observations = branchObservations(replay, played);
  const decisionLabel =
    content.decisionOptions.find(({ decision }) => decision === record.decision)?.label ?? "";
  const [mapOpen, setMapOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const message = getVariant(content, record.setup.variantId);
  const playedOutcome = describeOutcome(content, played, record.decision);
  const split = replay.divergenceIndex;
  // The point of the case in one line, said about this attempt before any of the detail.
  const takeaway =
    record.actions.length === 0
      ? "Před rozhodnutím nepřibyl žádný podklad, takže obě reality vypadaly stejně."
      : split === null
        ? "Všechny tvoje úkony dopadly v obou realitách stejně, takže z nich nešlo poznat, která realita platí."
        : split === 0
          ? `Rozdíl ukázal hned první úkon: „${getAction(content, replay.rows[0].actionId).shortLabel}“.`
          : `Úkony 1 až ${split} dopadly v obou realitách stejně. Rozdíl ukázal až úkon ${split + 1}: „${getAction(content, replay.rows[split].actionId).shortLabel}“.`;
  const root = useRef<HTMLDivElement>(null);
  const headings = useRef<(HTMLHeadingElement | null)[]>([]);
  const previous = useRef(revealed);
  const { animated, replay: replayMotion } = useRevealChoreography(root, revealed);

  useEffect(() => {
    if (revealed > previous.current) headings.current[revealed - 1]?.focus();
    previous.current = revealed;
  }, [revealed]);

  const sectionHeading = (index: number) => (
    <h2
      id={`reveal-${index + 1}`}
      ref={(node) => {
        headings.current[index] = node;
      }}
      tabIndex={-1}
      className="flex items-baseline gap-4 border-section pt-6 font-display text-h3 leading-head font-extrabold tracking-display"
    >
      <span aria-hidden="true" className="text-ink-3 tabular-nums">
        {index + 1}
      </span>
      <span>
        <span className="sr-only">{index + 1}. </span>
        {STEPS[index]}
      </span>
    </h2>
  );

  return (
    <div ref={root}>
      <header className="ds-container grid gap-8 pt-10 sm:pt-14 lg:grid-cols-2">
        <div>
          <p className="font-mono text-meta">{content.kicker.toLowerCase()} · odhalení</p>
          <StageHeading className="ds-overprint mt-3">
            <span {...reveal("slide", 400)} className="ds-overprint__plate" aria-hidden="true">
              Dvě reality
            </span>
            <span {...reveal("slide", 400)} className="ds-overprint__text">
              Dvě reality
            </span>
          </StageHeading>
        </div>
        <div className="max-w-120 lg:justify-self-end">
          <ol aria-label="Průběh odhalení" className="flex flex-wrap gap-x-5 gap-y-1 text-small">
            {STEP_SHORT.map((step, index) => (
              <li key={step} aria-current={index + 1 === revealed ? "step" : undefined}>
                {index < revealed ? (
                  <a href={`#reveal-${index + 1}`} className="font-bold">
                    {index + 1} {step}
                  </a>
                ) : (
                  <span className="text-ink-3">
                    {index + 1} {step}
                  </span>
                )}
              </li>
            ))}
          </ol>
          {animated && (
            <button
              type="button"
              className="ds-btn ds-btn--secondary ds-btn--sm mt-5"
              onClick={replayMotion}
            >
              Přehrát odhalení znovu
            </button>
          )}
        </div>
      </header>

      <div className="ds-container space-y-20 pt-14 pb-24">
        {/* The result comes first: what was decided, what it did, and how well it was grounded. */}
        <section aria-labelledby="reveal-summary" className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className={`pt-4 ${WORLD_PLATE[played].rule}`}>
            <h2 id="reveal-summary" className="font-mono text-meta">
              tvůj výsledek
            </h2>
            <p className="mt-3 text-small text-ink-2">
              Tvoje rozhodnutí: <b className="text-ink">{decisionLabel}</b>
            </p>
            <p className="mt-3">
              <WorldBadge world={played} suffix="tady proběhl tvůj pokus" />
            </p>
            <p className="mt-1 font-display text-h3 leading-head font-extrabold tracking-display">
              {playedOutcome.status}
            </p>
            <p className="mt-2 max-w-140 leading-body">{typography(playedOutcome.consequence)}</p>
            <p className="mt-5 max-w-140 border-l-4 border-ink pl-4 leading-body">
              {typography(takeaway)}
            </p>
          </div>
          <div className="border-section pt-4">
            <GroundingCard
              content={content}
              observations={observations}
              decision={record.decision}
            />
          </div>
        </section>

        <section aria-labelledby="reveal-1" data-reveal-section>
          {sectionHeading(0)}
          <div className="relative mt-12">
            <span {...reveal("grow")} aria-hidden="true" className="ds-seam max-sm:hidden" />
            <div className="ds-press relative mx-auto max-w-lg">
              <div
                {...reveal("slide", 700)}
                className="ds-press__plate ds-press__plate--1"
                aria-hidden="true"
              />
              <div
                {...reveal("slide", 700)}
                className="ds-press__plate ds-press__plate--2"
                aria-hidden="true"
              />
              <article
                aria-label="Zpráva, stejná v obou realitách"
                className="ds-sheet mt-8 px-5 pt-5 pb-6 sm:px-6"
              >
                <p className="ds-sheet__tab">list 01 · e-mail</p>
                <p className="mb-4 text-center font-mono text-micro">
                  stejné v obou realitách, včetně adresy, přílohy a času
                </p>
                {messageOpen ? (
                  <div id="reveal-message" className="text-small">
                    <MessageView
                      message={message}
                      storyTime={content.storyTime}
                      subject={(text) => (
                        <p className="mb-3 font-display text-h4 leading-head font-bold">{text}</p>
                      )}
                    />
                  </div>
                ) : (
                  <div className="border-section pt-4 text-small">
                    <p>
                      <b>{message.from}</b> &lt;{message.address}&gt;
                    </p>
                    <p className="mt-2 font-display text-h4 leading-head font-bold">
                      {typography(message.subject)}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  aria-expanded={messageOpen}
                  aria-controls="reveal-message"
                  className={`mt-3 text-small ${TEXT_BUTTON}`}
                  onClick={() => setMessageOpen((open) => !open)}
                >
                  {messageOpen ? "Skrýt text zprávy" : "Zobrazit celou zprávu"}
                </button>
              </article>
            </div>
            <p className="relative mx-auto mt-10 flex max-w-lg gap-3 bg-paper text-small leading-body">
              <span className="font-mono text-meta">pozn.</span>
              <span>
                Text této zprávy navrhla AI podle několika faktů z objednávky. Podobně přesvědčivou
                zprávu si s AI může připravit i někdo, kdo se za odesílatele jen vydává.
              </span>
            </p>
            <div className="relative mt-14 grid gap-10 sm:grid-compare sm:gap-14">
              {WORLDS.map((world) => (
                <article
                  key={world}
                  {...reveal("fade", 1500)}
                  className={`relative pt-4 ${WORLD_PLATE[world].rule}`}
                >
                  {world === played && (
                    <div
                      {...reveal("fade", 1900)}
                      className="mb-3 sm:absolute sm:right-0 sm:bottom-full sm:mb-0"
                    >
                      <p className="ds-label-dark text-micro">Tady proběhl tvůj pokus</p>
                    </div>
                  )}
                  <WorldBadge world={world} />
                  <h3 className="mt-2 font-display text-h3 leading-head font-bold tracking-display">
                    {content.worlds[world].name}
                  </h3>
                  <dl className="mt-5 space-y-3 text-small">
                    <div>
                      <dt className="text-ink-3">Kdo zprávu ve skutečnosti poslal</dt>
                      <dd className="font-bold">{typography(content.worlds[world].sender)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Co platí</dt>
                      <dd className="leading-body">{typography(content.worlds[world].truth)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        {revealed >= 2 && (
          <section aria-labelledby="reveal-2" data-reveal-section>
            {sectionHeading(1)}
            <p className="mt-3 mb-8 max-w-140 leading-body text-ink-2">
              Tvoje úkony se přehrály i ve druhé realitě, ale jen do první odpovědi, která se
              lišila.
            </p>
            {record.actions.length === 0 ? (
              <p className="border-y border-ink py-5">
                Před rozhodnutím nepřibyl žádný další podklad. V obou realitách byla k dispozici jen
                stejná zpráva.
              </p>
            ) : (
              <ComparisonGrid
                content={content}
                replay={replay}
                playedWorld={played}
                collapseShared
              />
            )}
          </section>
        )}

        {revealed >= 3 && (
          <section aria-labelledby="reveal-3" data-reveal-section className="space-y-16">
            {sectionHeading(2)}
            {replay.divergenceIndex === null && (
              <p {...reveal("fade")} className="text-center">
                <span className="block text-small text-ink-3">
                  Získané informace obě reality nerozlišily. Takhle by tvoje volba dopadla v každé z
                  nich:
                </span>
                <span className="font-display text-h3 font-bold">{decisionLabel}</span>
              </p>
            )}
            <div {...reveal("fade")} className="grid gap-10 sm:grid-compare sm:gap-14">
              {WORLDS.map((world) => {
                const outcome = describeOutcome(content, world, record.decision);
                const showsOutcome = replay.divergenceIndex === null || world === played;
                return (
                  <div key={world} className={`pt-4 ${WORLD_PLATE[world].rule}`}>
                    <WorldBadge
                      world={world}
                      short
                      suffix={
                        world === played && replay.divergenceIndex !== null
                          ? "tvůj pokus"
                          : undefined
                      }
                    />
                    {showsOutcome ? (
                      <>
                        {replay.divergenceIndex !== null && (
                          <p className="mt-3 text-small text-ink-2">
                            Tvoje rozhodnutí: {decisionLabel}
                          </p>
                        )}
                        <p className="mt-2 font-display text-h3 leading-head font-extrabold tracking-display">
                          {outcome.status}
                        </p>
                        <p className="mt-2 max-w-120 text-small leading-body">
                          {typography(outcome.consequence)}
                        </p>
                        {canBranch && replay.divergenceIndex !== null && (
                          <button
                            type="button"
                            className={`mt-4 ${TEXT_BUTTON}`}
                            onClick={() => onBranch(world)}
                          >
                            Zkusit tuto větev znovu od rozdělení
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="mt-2 font-display text-h3 leading-head font-extrabold tracking-display">
                          Tady se získané informace rozcházejí
                        </p>
                        <p className="mt-2 max-w-120 text-small leading-body">
                          Tady bys dostal/a jinou odpověď, takže tvoje rozhodnutí se sem nepřenáší.
                        </p>
                        {canBranch && (
                          <button
                            type="button"
                            className="ds-btn mt-5"
                            onClick={() => onBranch(world)}
                          >
                            Pokračovat v této větvi
                            <Icon name="arrow" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-ink pt-6">
              <aside className="max-w-160 text-small leading-body text-ink-2">
                <p className="mb-2 font-mono text-meta text-ink">pozn. · předpoklad modelu</p>
                <p>{typography(content.modelAssumption)}</p>
                {record.setup.savedContact === "unreachable" && (
                  <p className="mt-2">
                    V tomto průchodu byl původní kontakt nedostupný v obou realitách. Nedostupnost
                    sama nic neprozrazuje.
                  </p>
                )}
              </aside>
            </div>

            <div className="border-t border-ink pt-6">
              {nextHint && <p className="mb-4 max-w-140 leading-body text-ink-2">{nextHint}</p>}
              <button type="button" className="ds-btn" onClick={onNext}>
                {nextLabel}
                <Icon name="arrow" />
              </button>
            </div>

            {/* The map explains the shared origin in detail; it stays available, not in the way. */}
            <div>
              <button
                type="button"
                aria-expanded={mapOpen}
                aria-controls="reveal-map"
                className={TEXT_BUTTON}
                onClick={() => setMapOpen((open) => !open)}
              >
                {mapOpen ? "Skrýt, odkud podklady pocházely" : "Ukázat, odkud podklady pocházely"}
              </button>
              {mapOpen && (
                <div id="reveal-map" className="mt-6 animate-enter">
                  <ProvenanceMap
                    content={content}
                    observations={observations}
                    revealed
                    headingLevel="h3"
                    wide
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {revealed < 3 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <button type="button" className="ds-btn" onClick={onRevealMore}>
              Pokračovat v odhalení
              <Icon name="arrow" />
            </button>
            <button type="button" className={TEXT_BUTTON} onClick={onRevealAll}>
              Ukázat vše najednou
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
