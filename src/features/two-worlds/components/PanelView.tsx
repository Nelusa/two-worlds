"use client";

import { useEffect, useRef, useState } from "react";
import { getAction, missingPrerequisite } from "../engine/scenario";
import type { ActionId, CaseContent, MessageVariant, Observation, PanelDef } from "../engine/types";
import { typography } from "../utils/typography";
import { MessageView, RecordView } from "./BodyView";
import { Icon } from "./Icon";
import { PANEL_KIND_LABEL, panelNumber } from "./presentation";
import { TEXT_BUTTON } from "./styles";
import { QuestionButton, TranscriptEntry } from "./Transcript";

interface PanelViewProps {
  content: CaseContent;
  panel: PanelDef;
  message: MessageVariant;
  done: readonly ActionId[];
  observations: Observation[];
  /** Move focus to the sheet title when the player opened this sheet from a tab. */
  focusOnMount: boolean;
  /** In a branch: the inherited answer that differs from the first attempt. */
  divergentAction?: ActionId | null;
  onPerform: (actionId: ActionId) => void;
}

function OpenedSource({ observation }: { observation: Observation }) {
  const { body } = observation.response;
  if (body.type === "contact_card" || body.type === "document") {
    return (
      <RecordView
        heading={body.heading}
        fields={body.fields}
        contact={body.type === "contact_card"}
      />
    );
  }
  return null;
}

/** The sheet on the desk: whatever source is open right now. */
export function PanelView({
  content,
  panel,
  message,
  done,
  observations,
  focusOnMount,
  divergentAction = null,
  onPerform,
}: PanelViewProps) {
  const { attachmentAction } = content;
  const sheet = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const gate = panel.requires && !done.includes(panel.requires) ? panel.requires : null;
  const opened = observations.find(({ actionId }) => actionId === panel.openAction);
  const answers = observations.filter(({ actionId }) => panel.questions.includes(actionId));
  const unasked = panel.questions.filter((actionId) => !done.includes(actionId));
  const answerCount = useRef(answers.length);
  // Answers already there when the sheet opened stay still; only a new one is printed in.
  const [answersOnOpen] = useState(answers.length);

  useEffect(() => {
    if (!focusOnMount) return;
    heading.current?.focus({ preventScroll: true });
    // On phones the tabs sit above the sheet; bring the opened sheet to the top instead of
    // leaving its answer below the tab grid.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.matchMedia("(max-width: 900px)").matches) {
      sheet.current?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    } else {
      heading.current?.scrollIntoView({ block: "nearest" });
    }
  }, [focusOnMount]);

  // After an answer arrives, continue with the next question, or with the sheet title if none is left.
  useEffect(() => {
    if (answers.length === answerCount.current) return;
    answerCount.current = answers.length;
    const next = sheet.current?.querySelector<HTMLElement>(
      "[data-question]:not([aria-disabled='true'])",
    );
    (next ?? heading.current)?.focus();
  }, [answers.length]);

  const title = (text: string) => (
    <h2 id="panel-heading" ref={heading} tabIndex={-1} className="ds-sheet__title">
      {text}
    </h2>
  );

  return (
    <article
      ref={sheet}
      aria-labelledby="panel-heading"
      className={`ds-sheet min-w-0 scroll-mt-4 self-start ${gate ? "border-dashed bg-tab" : ""} ${
        focusOnMount ? "sheet-swap" : ""
      }`}
    >
      <span className="ds-crop max-sm:hidden" aria-hidden="true" />
      <div className="ds-sheet__meta">
        <span className="flex items-center gap-2">
          {gate && <Icon name="lock" />}
          list {panelNumber(content, panel.id)} · {PANEL_KIND_LABEL[panel.kind]}
        </span>
        <span>{panel.originLabel}</span>
      </div>

      {panel.kind === "message" ? (
        <MessageView
          message={message}
          storyTime={content.storyTime}
          subject={title}
          attachment={
            attachmentAction && (
              <button
                type="button"
                className="ds-btn ds-btn--secondary"
                onClick={() => onPerform(attachmentAction)}
              >
                {done.includes(attachmentAction) ? "Zobrazit přílohu" : "Otevřít přílohu"}
              </button>
            )
          }
        />
      ) : (
        title(panel.title)
      )}

      {gate ? (
        <div className="space-y-5">
          <p className="text-body-lg leading-body text-ink-2">
            {typography(panel.requiresHint ?? "")}
          </p>
          <button
            type="button"
            className="ds-btn ds-btn--secondary"
            onClick={() => onPerform(gate)}
          >
            {getAction(content, gate).label}
          </button>
        </div>
      ) : (
        <>
          {opened && <OpenedSource observation={opened} />}

          {panel.questions.length > 0 && (
            <section aria-labelledby="questions-heading" className="mt-10">
              <h3
                id="questions-heading"
                className={
                  answers.length > 0
                    ? "mb-5 font-display text-h4 leading-head font-bold"
                    : "sr-only"
                }
              >
                {panel.kind === "person" ? "Rozhovor" : "Přepis hovoru"}
              </h3>
              <div aria-live="polite">
                {answers.length > 0 && (
                  <ol className="space-y-8">
                    {answers.map((answer, index) => (
                      <li
                        key={answer.actionId}
                        className={index >= answersOnOpen ? "animate-print" : undefined}
                      >
                        <TranscriptEntry
                          body={answer.response.body}
                          differs={answer.actionId === divergentAction}
                        />
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              {unasked.length > 0 ? (
                <div
                  className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5 ${
                    answers.length > 0 ? "mt-8 border-t border-ink pt-5" : ""
                  }`}
                >
                  <p className="font-mono text-meta text-ink-3">
                    {answers.length > 0
                      ? "další možná otázka"
                      : panel.kind === "person"
                        ? "zeptat se"
                        : "zavolat a zeptat se"}
                  </p>
                  {unasked.map((actionId) => {
                    const action = getAction(content, actionId);
                    const missing = missingPrerequisite(content, actionId, done);
                    return (
                      <QuestionButton
                        key={actionId}
                        action={action}
                        missingHint={missing ? (action.requiresHint ?? missing.label) : null}
                        onAsk={() => onPerform(actionId)}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="mt-8 border-t border-ink pt-5 text-small text-ink-3">
                  Další otázky nejsou k dispozici.
                </p>
              )}
            </section>
          )}
        </>
      )}
      <a href="#sources-heading" className={`mt-8 inline-flex md:hidden ${TEXT_BUTTON}`}>
        Zpět na podklady
      </a>
    </article>
  );
}
