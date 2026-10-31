"use client";

import Link from "next/link";
import { useState } from "react";
import { CASES } from "../content";
import type { AttemptRecord, GameState, Run } from "../engine/game";
import { buildProvenance } from "../engine/provenance";
import { observeAll } from "../engine/scenario";
import type { CaseId } from "../engine/types";
import { describeRecord } from "../engine/summary";
import { buildExport, clearAppData, parseSaved, STORAGE_KEYS } from "../storage/storage";
import { downloadText } from "./download";
import { plural } from "./presentation";
import { useStoredItem } from "./useStoredItem";
import { WorldBadge } from "./WorldBadge";

const DATE = new Intl.DateTimeFormat("cs-CZ", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

interface Row {
  id: string;
  caseId: CaseId;
  name: string;
  /** Reality of the row; null while the decision is still open, so nothing is revealed early. */
  world: Run["setup"]["world"] | null;
  savedAt: number;
  work: string;
  decision: string;
  detail: string;
  current: boolean;
}

const RUN_NAME: Record<Run["step"], (run: Run) => string> = {
  first_attempt: () => "První pokus",
  branch: (run) => `Větev od úkonu ${run.lockedCount}`,
  transfer: () => "Nový případ",
};

const workLabel = (run: Run) => {
  const content = CASES[run.caseId];
  const sources =
    buildProvenance(content, observeAll(content, run.actions, run.setup)).nodes.length - 1;
  return `${plural(run.actions.length, "úkon", "úkony", "úkonů")} · ${plural(sources, "podklad", "podklady", "podkladů")}`;
};

const recordRow = (record: AttemptRecord, state: GameState): Row => {
  if (record.kind === "procedure") {
    const content = CASES[record.caseId];
    return {
      id: record.id,
      caseId: record.caseId,
      name: "Vlastní postup",
      world: null,
      savedAt: record.createdAt,
      work: plural(record.steps.length, "úkon", "úkony", "úkonů"),
      decision: record.branches.length > 0 ? "Rozhodnutí ve větvích" : "Zatím nerozhodnuto",
      detail: record.branches
        .map(
          ({ decision }) =>
            content.decisionOptions.find((option) => option.decision === decision)?.label,
        )
        .filter(Boolean)
        .join(", "),
      current: false,
    };
  }
  const { decisionLabel, grounding } = describeRecord(record);
  return {
    id: record.id,
    caseId: record.caseId,
    name: RUN_NAME[record.step](record),
    world: record.setup.world,
    savedAt: record.decidedAt,
    work: workLabel(record),
    decision: decisionLabel,
    detail: grounding.label.toLowerCase(),
    current: state.stage.kind !== "case" && record.id === state.records.at(-1)?.id,
  };
};

/** Every saved attempt plus the run in progress, grouped by case. */
const buildRows = (state: GameState): Row[] => {
  const rows = state.records.map((record) => recordRow(record, state));
  if (state.stage.kind === "case") {
    const { run } = state.stage;
    rows.push({
      id: run.id,
      caseId: run.caseId,
      name: RUN_NAME[run.step](run),
      // A branch is played after the reveal; any other open run must not show its reality.
      world: run.step === "branch" ? run.setup.world : null,
      savedAt: run.startedAt,
      work: workLabel(run),
      decision: "Zatím nerozhodnuto",
      detail: "rozpracováno",
      current: true,
    });
  }
  return rows;
};

export function SavedProgress() {
  const raw = useStoredItem(STORAGE_KEYS.normal);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const loaded = parseSaved(raw, "normal");
  const rows = loaded.status === "ok" ? buildRows(loaded.state) : [];
  const caseIds = [...new Set(rows.map(({ caseId }) => caseId))];

  const exportProgress = () => {
    const now = Date.now();
    const data = buildExport(window.localStorage, now);
    downloadText(
      `dva-svety-prubeh-${new Date(now).toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      "application/json",
    );
    setMessage(
      `Staženo: ${data.records.length} záznamů průběhu a ${data.demoRecords.length} z ukázky.`,
    );
  };

  const clear = () => {
    const removed = clearAppData(window.localStorage);
    setConfirming(false);
    setMessage(
      removed.length > 0
        ? "Průběh je smazaný. V tomto prohlížeči nezůstala žádná data aplikace."
        : "V tomto prohlížeči nebyla uložená žádná data aplikace.",
    );
  };

  return (
    <div className="space-y-16">
      {loaded.status === "unsupported" || loaded.status === "corrupt" ? (
        <p className="border-l-4 border-ink pl-4 leading-body">
          {loaded.detail} Data si můžeš stáhnout nebo smazat níže.
        </p>
      ) : rows.length === 0 ? (
        <div className="max-w-md border-2 border-dashed border-ink p-6">
          <p className="font-mono text-meta text-ink-3">uložený průběh · prázdný</p>
          <p className="mt-2 font-display text-h4 leading-head font-extrabold">Zatím tu nic není</p>
          <p className="mt-2 leading-body text-ink-2">
            Až případ rozehraješ, uloží se tady. Jen v tomto prohlížeči.
          </p>
          <Link href="/play" className="ds-btn mt-5">
            Otevřít případ
          </Link>
        </div>
      ) : (
        caseIds.map((caseId) => {
          const content = CASES[caseId];
          const caseRows = rows.filter((row) => row.caseId === caseId);
          return (
            <section key={caseId} aria-labelledby={`saved-${caseId}`}>
              <div className="flex items-baseline justify-between gap-4 border-b-4 border-ink pb-4">
                <h2
                  id={`saved-${caseId}`}
                  className="font-display text-h3 leading-head font-extrabold tracking-display"
                >
                  {content.kicker} · {content.title}
                </h2>
                <p className="shrink-0 font-mono text-meta">
                  {plural(caseRows.length, "záznam", "záznamy", "záznamů")}
                </p>
              </div>
              <table className="w-full text-left max-sm:block">
                <thead className="max-sm:sr-only">
                  <tr className="border-b border-ink font-mono text-meta">
                    <th scope="col" className="py-3 pr-4 font-normal">
                      záznam
                    </th>
                    <th scope="col" className="py-3 pr-4 font-normal">
                      uloženo
                    </th>
                    <th scope="col" className="py-3 pr-4 font-normal">
                      úkony a podklady
                    </th>
                    <th scope="col" className="py-3 pr-4 font-normal">
                      rozhodnutí
                    </th>
                    <th scope="col" className="py-3 font-normal">
                      <span className="sr-only">akce</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="max-sm:block">
                  {caseRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-ink align-top max-sm:grid max-sm:gap-1 max-sm:py-4"
                    >
                      <th scope="row" className="py-4 pr-4 text-left font-bold max-sm:py-0">
                        {row.name}
                        {row.world && (
                          <span className="mt-1 block">
                            <WorldBadge world={row.world} />
                          </span>
                        )}
                      </th>
                      <td className="py-4 pr-4 font-mono text-meta max-sm:py-0">
                        {DATE.format(row.savedAt)}
                      </td>
                      <td className="py-4 pr-4 max-sm:py-0 max-sm:text-small">{row.work}</td>
                      <td className="py-4 pr-4 max-sm:py-0">
                        <span className="block font-bold">{row.decision}</span>
                        <span className="text-small text-ink-2">{row.detail}</span>
                      </td>
                      <td className="py-3 text-right max-sm:pt-2">
                        {row.current && (
                          <Link href="/play" className="ds-btn max-sm:w-full">
                            Pokračovat
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })
      )}

      <div className="grid gap-12 md:grid-cols-2 md:gap-14">
        <section aria-labelledby="export-heading">
          <h2 id="export-heading" className="ds-section__title">
            Stáhnout průběh
          </h2>
          <p className="mt-3 leading-body text-ink-2">
            Verzovaný JSON se všemi pokusy. Ukázka je v samostatné části, nácvik je označený.
          </p>
          <button type="button" className="ds-btn ds-btn--secondary mt-5" onClick={exportProgress}>
            Stáhnout průběh (JSON)
          </button>
        </section>
        <section aria-labelledby="delete-heading">
          <h2 id="delete-heading" className="ds-section__title">
            Smazat průběh
          </h2>
          <p className="mt-3 leading-body text-ink-2">
            Smaže všechny záznamy z tohoto prohlížeče. Nedá se to vrátit.
          </p>
          {confirming ? (
            <div className="mt-5 border-2 border-ink bg-sheet p-6">
              <p className="font-display text-h4 leading-head font-extrabold">
                Opravdu smazat celý průběh?
              </p>
              <p className="mt-2 text-small">Případ pak začne znovu od nové zprávy.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="ds-btn" onClick={clear}>
                  Smazat záznamy
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn--secondary"
                  onClick={() => setConfirming(false)}
                >
                  Ponechat
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="ds-btn ds-btn--secondary mt-5"
              onClick={() => setConfirming(true)}
            >
              Smazat průběh z tohoto prohlížeče
            </button>
          )}
        </section>
      </div>
      <p role="status" className="min-h-6 font-bold">
        {message}
      </p>
    </div>
  );
}
