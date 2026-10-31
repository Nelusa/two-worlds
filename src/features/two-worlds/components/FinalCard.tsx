"use client";

import { useState } from "react";
import type { DecisionRecord } from "../engine/game";
import { describeRecord, FINAL_PRINCIPLES, finalCardText } from "../engine/summary";
import { downloadText } from "./download";
import { typography } from "../utils/typography";
import { LogoMark } from "./Logo";
import { StageHeader } from "./StageHeader";
import { WorldBadge } from "./WorldBadge";

interface FinalCardProps {
  records: DecisionRecord[];
  practiceCount: number;
  onNewAttempt: () => void;
}

export function FinalCard({ records, practiceCount, onNewAttempt }: FinalCardProps) {
  const [copyState, setCopyState] = useState<string | null>(null);
  const text = finalCardText(records);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("Text karty je zkopírovaný.");
    } catch {
      setCopyState("Kopírování prohlížeč nepovolil. Použij stažení textu.");
    }
  };

  return (
    <div>
      <StageHeader
        kicker="Závěrečná karta"
        title="Můj ověřovací postup"
        lead={
          <p>Tři otázky, které si položíš, až příště přijde změna platebních údajů nebo místa.</p>
        }
      />
      <div className="ds-container pt-14 pb-24">
        <div className="max-w-4xl">
          <article className="ds-sheet">
            <span className="ds-crop max-sm:hidden" aria-hidden="true" />
            <div className="ds-sheet__meta">
              <span className="flex items-center gap-2">
                <LogoMark revealed className="h-4 w-5.5" />
                Dva světy
              </span>
              <span>stejná zpráva, dvě reality</span>
            </div>
            <ol className="mt-6 border-section">
              {FINAL_PRINCIPLES.map(({ title, text: body }, index) => (
                <li key={title} className="flex gap-5 border-b border-ink py-6 sm:gap-8">
                  <span
                    aria-hidden="true"
                    className="w-8 shrink-0 font-display text-h2 leading-tight font-extrabold"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-display text-h4 leading-head font-extrabold tracking-display sm:text-h3">
                      {title}
                    </p>
                    <p className="mt-2 max-w-140 leading-body text-ink-2">{typography(body)}</p>
                  </div>
                </li>
              ))}
            </ol>
            {records.length > 0 && (
              <section aria-labelledby="my-results" className="pt-8">
                <h2 id="my-results" className="mb-4 font-mono text-meta">
                  moje rozhodnutí v simulaci
                </h2>
                <ul className="grid gap-8 sm:grid-cols-2">
                  {records.map((record) => {
                    const { caseTitle, decisionLabel, outcome, grounding } = describeRecord(record);
                    return (
                      <li key={record.id} className="space-y-1 text-small">
                        <p className="font-display text-h4 leading-head font-bold">{caseTitle}</p>
                        <WorldBadge world={record.setup.world} />
                        <p className="font-bold">{decisionLabel}</p>
                        <p>
                          {outcome.status} · {grounding.label}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                {practiceCount > 0 && (
                  <p className="mt-6 text-small text-ink-2">
                    Procvičování ({practiceCount}×) se ukládá zvlášť a v přehledu není.
                  </p>
                )}
              </section>
            )}
          </article>

          <p className="mt-8 flex gap-3 text-small">
            <span className="font-mono text-meta">pozn.</span>
            Karta shrnuje cvičení v simulaci. Neosvědčuje člověka ani firemní proces.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="ds-btn ds-btn--secondary" onClick={copy}>
              Zkopírovat text
            </button>
            <button
              type="button"
              className="ds-btn ds-btn--secondary"
              onClick={() => downloadText("dva-svety-postup.txt", text)}
            >
              Stáhnout jako text
            </button>
            <button type="button" className="ds-btn sm:ml-auto" onClick={onNewAttempt}>
              Nový pokus
            </button>
          </div>
          <p role="status" className="mt-3 min-h-6 font-bold">
            {copyState}
          </p>
        </div>
      </div>
    </div>
  );
}
