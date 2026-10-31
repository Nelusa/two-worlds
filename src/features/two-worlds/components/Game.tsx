"use client";

import { useEffect, useReducer, useState } from "react";
import {
  createRun,
  findDecisionRecord,
  gameReducer,
  initialGameState,
  type DecisionRecord,
  type GameAction,
  type GameState,
  type PlayMode,
  type Stage,
} from "../engine/game";
import { randomSeed, setupFromSeed } from "../engine/rng";
import { clearMode, loadState, saveState, STORAGE_KEYS, type LoadResult } from "../storage/storage";
import { AppHeader } from "./AppHeader";
import { downloadText } from "./download";
import { FinalCard } from "./FinalCard";
import { FocusContext } from "./focusContext";
import { PracticeResult } from "./PracticeResult";
import { ProcedureEditor } from "./ProcedureEditor";
import { Reveal } from "./Reveal";
import { Workspace } from "./Workspace";

type Root =
  | { status: "loading" }
  | { status: "blocked"; result: Extract<LoadResult, { status: "unsupported" | "corrupt" }> }
  | { status: "ready"; game: GameState; stageVersion: number };

type RootAction =
  | { type: "load"; result: LoadResult; fresh: GameState }
  | { type: "replace"; game: GameState }
  | { type: "game"; action: GameAction };

const stageIdentity = (stage: Stage) => {
  switch (stage.kind) {
    case "case":
      return `case:${stage.run.id}`;
    case "reveal":
    case "practice_result":
      return `${stage.kind}:${stage.recordId}`;
    case "procedure":
      return `procedure:${stage.trial ? "trial" : "edit"}`;
    case "summary":
      return "summary";
  }
};

const rootReducer = (root: Root, action: RootAction): Root => {
  switch (action.type) {
    case "load":
      // React StrictMode runs the loading effect twice in development; keep the first result.
      if (root.status !== "loading") return root;
      if (action.result.status === "ok") {
        return { status: "ready", game: action.result.state, stageVersion: 0 };
      }
      if (action.result.status === "empty") {
        return { status: "ready", game: action.fresh, stageVersion: 0 };
      }
      return { status: "blocked", result: action.result };
    case "replace":
      return {
        status: "ready",
        game: action.game,
        stageVersion: root.status === "ready" ? root.stageVersion + 1 : 0,
      };
    case "game": {
      if (root.status !== "ready") return root;
      const game = gameReducer(root.game, action.action);
      const changed = stageIdentity(game.stage) !== stageIdentity(root.game.stage);
      return { ...root, game, stageVersion: root.stageVersion + (changed ? 1 : 0) };
    }
  }
};

const newId = () => crypto.randomUUID();

const freshEvening = () => {
  const seed = randomSeed();
  return createRun({
    id: newId(),
    caseId: "evening",
    mode: "first_attempt",
    step: "first_attempt",
    seed,
    setup: setupFromSeed("evening", seed),
    now: Date.now(),
  });
};

const ANNOUNCEMENT: Record<Stage["kind"], string> = {
  case: "Případ je otevřený.",
  reveal: "Rozhodnutí je uložené. Zobrazují se dvě reality.",
  practice_result: "Výsledek procvičování.",
  procedure: "Úprava postupu.",
  summary: "Závěrečná karta.",
};

interface GameProps {
  playMode: PlayMode;
  /** Demo only: a state prepared by the demo setup screen. */
  initialState?: GameState;
  onExitDemo?: () => void;
}

export function Game({ playMode, initialState, onExitDemo }: GameProps) {
  const [root, dispatchRoot] = useReducer(rootReducer, initialState, (prepared): Root =>
    prepared ? { status: "ready", game: prepared, stageVersion: 0 } : { status: "loading" },
  );
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (initialState) return;
    dispatchRoot({
      type: "load",
      result: loadState(window.localStorage, playMode),
      fresh: initialGameState(playMode, freshEvening()),
    });
  }, [initialState, playMode]);

  useEffect(() => {
    if (root.status !== "ready") return;
    // Mirrors the result of writing to an external system (localStorage) into the UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!saveState(window.localStorage, root.game, Date.now()));
  }, [root]);

  /** Updates within the current screen. */
  const update = (action: GameAction) => dispatchRoot({ type: "game", action });

  /** Moves to another screen and starts it from the top. */
  const advance = (action: GameAction) => {
    update(action);
    window.scrollTo({ top: 0 });
  };

  const startOver = () => {
    if (playMode === "demo" && onExitDemo) {
      onExitDemo();
      return;
    }
    clearMode(window.localStorage, playMode);
    dispatchRoot({ type: "replace", game: initialGameState(playMode, freshEvening()) });
  };

  // The logo may show the plates only once this run's decision is confirmed.
  const header = (revealed = false) => <AppHeader demo={playMode === "demo"} revealed={revealed} />;

  if (root.status === "loading") {
    return (
      <>
        {header()}
        <main id="main" tabIndex={-1} aria-busy="true">
          <div className="ds-container pt-14">
            <p className="font-mono text-meta text-ink-3">Otevírám případ…</p>
          </div>
        </main>
      </>
    );
  }

  if (root.status === "blocked") {
    return (
      <>
        {header()}
        <main id="main" tabIndex={-1} className="ds-container space-y-5 py-16 *:max-w-160">
          <h1 className="font-display text-h1 leading-tight font-extrabold tracking-display">
            Uložený průběh nejde načíst
          </h1>
          <p className="leading-body">{root.result.detail}</p>
          <p className="leading-body text-ink-2">
            Můžeš si původní data stáhnout a začít nový případ. Začátkem se uložený průběh smaže.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="ds-btn" onClick={startOver}>
              Začít nový případ
            </button>
            <button
              type="button"
              className="ds-btn ds-btn--secondary"
              onClick={() =>
                downloadText(
                  "dva-svety-nenactena-data.json",
                  window.localStorage.getItem(STORAGE_KEYS[playMode]) ?? "",
                  "application/json",
                )
              }
            >
              Stáhnout původní data
            </button>
          </div>
        </main>
      </>
    );
  }

  const { game, stageVersion } = root;
  const { stage } = game;
  const firstAttempt = findDecisionRecord(game, game.firstAttemptId);
  const transfer = findDecisionRecord(game, game.transferId);

  const startTransfer = () => {
    const seed = randomSeed();
    advance({
      type: "start_transfer",
      run: createRun({
        id: newId(),
        caseId: "handover",
        mode: playMode === "demo" ? "demo" : "transfer",
        step: "transfer",
        seed,
        setup: game.demoTransfer ?? setupFromSeed("handover", seed),
        now: Date.now(),
      }),
    });
  };

  const renderStage = () => {
    switch (stage.kind) {
      case "case":
        return (
          <Workspace
            key={stage.run.id}
            run={stage.run}
            onPerform={(actionId) => update({ type: "perform", actionId })}
            onDecide={(decision, reliedOn) =>
              advance({ type: "decide", decision, reliedOn, now: Date.now() })
            }
            onBackToReveal={() => advance({ type: "back_to_reveal" })}
          />
        );
      case "reveal": {
        const record = findDecisionRecord(game, stage.recordId);
        if (!record) return null;
        const isTransfer = record.step === "transfer";
        return (
          <Reveal
            key={record.id}
            record={record}
            revealed={stage.revealed}
            canBranch={!isTransfer}
            onRevealMore={() => update({ type: "reveal_more" })}
            onRevealAll={() => update({ type: "reveal_all" })}
            onBranch={(world) =>
              advance({ type: "start_branch", world, id: newId(), now: Date.now() })
            }
            onNext={() =>
              advance(isTransfer ? { type: "show_summary" } : { type: "open_procedure" })
            }
            nextLabel={isTransfer ? "Zobrazit závěrečnou kartu" : "Sestavit vlastní postup"}
            nextHint={
              isTransfer
                ? undefined
                : "Sestavíš si, jak budeš podobný požadavek ověřovat příště. Postup se přehraje v obou realitách a pak ho vyzkoušíš na druhém případu."
            }
          />
        );
      }
      case "practice_result": {
        const record = findDecisionRecord(game, stage.recordId);
        if (!record) return null;
        return (
          <PracticeResult
            record={record}
            onProcedure={() => advance({ type: "open_procedure" })}
            onBack={() => advance({ type: "back_to_reveal" })}
          />
        );
      }
      case "procedure": {
        const base = findDecisionRecord(game, stage.baseRecordId);
        if (!base) return null;
        return (
          <ProcedureEditor
            caseId={base.caseId}
            steps={stage.steps}
            savedContact={stage.savedContact}
            usedSample={stage.usedSample}
            trial={stage.trial}
            onStepsChange={(steps) => update({ type: "set_steps", steps })}
            onUseSample={() => update({ type: "use_sample" })}
            onContactChange={(savedContact) =>
              update({ type: "set_procedure_contact", savedContact })
            }
            onRun={() => advance({ type: "run_procedure" })}
            onEdit={() => advance({ type: "edit_procedure" })}
            onDecide={(worlds, decision) =>
              update({ type: "decide_branch", worlds, decision, id: newId(), now: Date.now() })
            }
            onContinue={startTransfer}
          />
        );
      }
      case "summary": {
        const records = [firstAttempt, transfer].filter(
          (record): record is DecisionRecord => record !== null,
        );
        const practiceCount = game.records.filter(
          (record) => record.parentId === game.firstAttemptId && record.id !== game.firstAttemptId,
        ).length;
        return (
          <FinalCard
            records={records}
            practiceCount={practiceCount}
            onNewAttempt={() =>
              playMode === "demo"
                ? startOver()
                : advance({ type: "new_journey", run: freshEvening() })
            }
          />
        );
      }
    }
  };

  return (
    <>
      {header(stage.kind !== "case" || stage.run.step === "branch")}
      {playMode === "demo" && (
        <p className="border-b-2 border-ink bg-tab px-4 py-2 text-center text-small">
          Ukázkový režim s připravenými podmínkami. Výsledky se neukládají do běžné historie.
        </p>
      )}
      {saveFailed && (
        <p
          role="alert"
          className="border-b-2 border-ink bg-sheet px-4 py-2 text-center text-small font-bold"
        >
          Průběh se nepodařilo uložit, úložiště prohlížeče není dostupné. Hrát jde dál, po zavření
          stránky se ale ztratí.
        </p>
      )}
      <FocusContext.Provider value={stageVersion}>
        <main id="main" tabIndex={-1}>
          {/* Each new phase fades in once; updates within a phase do not replay it. */}
          <div key={stageVersion} className={stageVersion > 0 ? "animate-enter" : undefined}>
            {renderStage()}
          </div>
        </main>
      </FocusContext.Provider>
      <p role="status" className="sr-only">
        {stageVersion > 0 ? ANNOUNCEMENT[stage.kind] : ""}
      </p>
    </>
  );
}
