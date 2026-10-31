"use client";

import { useState } from "react";
import { getAction } from "../engine/scenario";
import type { CaseContent, Observation, WorldId } from "../engine/types";
import { typography } from "../utils/typography";
import { bodyHeadline } from "./presentation";
import { WORLD_PLATE } from "./WorldBadge";

interface ActionHistoryProps {
  content: CaseContent;
  observations: Observation[];
  lockedCount: number;
  /** Subject of the message variant this run received. */
  subject: string;
  /** In a practice branch: inherited steps are marked as shared or as only in this reality. */
  branchWorld?: WorldId | null;
}

/** The case file record of what the player did, oldest first. It is not announced. */
export function ActionHistory({
  content,
  observations,
  lockedCount,
  subject,
  branchWorld = null,
}: ActionHistoryProps) {
  // Rows restored from storage stay still; a row added by the player is printed in.
  const [rowsOnMount] = useState(observations.length);
  return (
    <section aria-labelledby="history-heading">
      <div className="flex items-baseline justify-between gap-4 border-b-4 border-ink pb-3">
        <h2
          id="history-heading"
          className="font-display text-h3 leading-head font-extrabold tracking-display"
        >
          Historie úkonů
        </h2>
        <p className="font-mono text-meta text-ink-3">záznam spisu</p>
      </div>
      <ol className="ds-log">
        <li>
          <span className="ds-log__when">{content.storyTime.toLowerCase()}</span>
          <span className="ds-log__what">Přišla nová zpráva</span>
          <span className="ds-log__detail">{typography(subject)}</span>
        </li>
        {observations.map((observation, index) => (
          <li
            key={observation.actionId}
            className={index >= rowsOnMount ? "animate-print" : undefined}
          >
            <span className="ds-log__when">úkon {index + 1}</span>
            <span className="ds-log__what">
              {typography(getAction(content, observation.actionId).shortLabel)}
            </span>
            <span className="ds-log__detail">
              {typography(bodyHeadline(observation.response.body))}
              {branchWorld && index < lockedCount && (
                <span className="mt-1 block">
                  {index < lockedCount - 1 ? (
                    <span className="ds-same">Stejně v obou realitách</span>
                  ) : (
                    <span
                      className={`ds-reality ds-reality--${WORLD_PLATE[branchWorld].number} text-small`}
                    >
                      jen v realitě {WORLD_PLATE[branchWorld].number}
                    </span>
                  )}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
