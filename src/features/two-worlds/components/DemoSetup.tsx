"use client";

import { useMemo, useState } from "react";
import { CASES } from "../content";
import { createRun, initialGameState, type GameState } from "../engine/game";
import type { ContactAvailability, Setup, WorldId } from "../engine/types";
import { parseSaved, STORAGE_KEYS } from "../storage/storage";
import { AppHeader } from "./AppHeader";
import { Game } from "./Game";
import { Segmented } from "./Controls";
import { Icon } from "./Icon";
import { StageHeader } from "./StageHeader";
import { useStoredItem } from "./useStoredItem";

export interface DemoParams {
  world?: string;
  variant?: string;
  contact?: string;
  transferWorld?: string;
  transferContact?: string;
}

const asWorld = (value: string | undefined): WorldId =>
  value === "legitimate" ? "legitimate" : "fraudulent";
const asContact = (value: string | undefined): ContactAvailability =>
  value === "unreachable" ? "unreachable" : "available";

const WORLD_OPTIONS: { value: WorldId; label: string }[] = [
  { value: "fraudulent", label: "Zneužitá schránka" },
  { value: "legitimate", label: "Skutečná změna" },
];

const CONTACT_OPTIONS: { value: ContactAvailability; label: string }[] = [
  { value: "available", label: "Dostupný" },
  { value: "unreachable", label: "Nedostupný" },
];

export function DemoSetup({ params }: { params: DemoParams }) {
  const [evening, setEvening] = useState<Setup>({
    world: asWorld(params.world),
    variantId: params.variant === "v2" ? "v2" : "v1",
    savedContact: asContact(params.contact),
  });
  const [handover, setHandover] = useState<Setup>({
    world: asWorld(params.transferWorld ?? params.world),
    variantId: "v1",
    savedContact: asContact(params.transferContact),
  });
  const [playing, setPlaying] = useState<GameState | null>(null);
  const savedRaw = useStoredItem(STORAGE_KEYS.demo);
  const saved = useMemo(() => {
    const result = parseSaved(savedRaw, "demo");
    return result.status === "ok" ? result.state : null;
  }, [savedRaw]);

  if (playing) {
    return <Game playMode="demo" initialState={playing} onExitDemo={() => setPlaying(null)} />;
  }

  const start = () => {
    const run = createRun({
      id: crypto.randomUUID(),
      caseId: "evening",
      mode: "demo",
      step: "first_attempt",
      seed: 0,
      setup: evening,
      now: Date.now(),
    });
    setPlaying(initialGameState("demo", run, handover));
  };

  const resume = () => {
    if (saved) setPlaying(saved);
  };

  return (
    <>
      <AppHeader demo />
      <main id="main" tabIndex={-1}>
        <StageHeader
          kicker="Ukázkový režim"
          title="Připravená ukázka"
          lead={
            <p>
              Pro prezentaci a testy. Skrytou realitu tu volíš předem, takže výsledky nejsou
              samostatný výkon a ukládají se odděleně od běžné hry. V běžném režimu se realita
              losuje a tato nastavení nejsou vidět.
            </p>
          }
        />
        <div>
          <form
            className="ds-container pt-12 pb-24 *:max-w-5xl *:not-first:mt-12"
            onSubmit={(event) => {
              event.preventDefault();
              start();
            }}
          >
            <fieldset className="border-section pt-4">
              <legend className="float-left mb-6 w-full font-display text-h3 leading-head font-extrabold tracking-display">
                <span aria-hidden="true" className="mr-3 text-ink-3 tabular-nums">
                  1
                </span>
                {CASES.evening.title}
              </legend>
              <div className="clear-both grid gap-5 md:grid-cols-3">
                <Segmented
                  legend="Realita"
                  value={evening.world}
                  options={WORLD_OPTIONS}
                  onChange={(world) => setEvening({ ...evening, world })}
                />
                <Segmented
                  legend="Znění zprávy"
                  value={evening.variantId}
                  options={[
                    { value: "v1", label: "Varianta 1" },
                    { value: "v2", label: "Varianta 2" },
                  ]}
                  onChange={(variantId) => setEvening({ ...evening, variantId })}
                />
                <Segmented
                  legend="Uložený kontakt"
                  value={evening.savedContact}
                  options={CONTACT_OPTIONS}
                  onChange={(savedContact) => setEvening({ ...evening, savedContact })}
                />
              </div>
            </fieldset>
            <fieldset className="border-section pt-4">
              <legend className="float-left mb-6 w-full font-display text-h3 leading-head font-extrabold tracking-display">
                <span aria-hidden="true" className="mr-3 text-ink-3 tabular-nums">
                  2
                </span>
                {CASES.handover.title}
              </legend>
              <div className="clear-both grid gap-5 md:grid-cols-3">
                <Segmented
                  legend="Realita"
                  value={handover.world}
                  options={WORLD_OPTIONS}
                  onChange={(world) => setHandover({ ...handover, world })}
                />
                <Segmented
                  legend="Původní kontakt"
                  value={handover.savedContact}
                  options={CONTACT_OPTIONS}
                  onChange={(savedContact) => setHandover({ ...handover, savedContact })}
                />
              </div>
            </fieldset>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="ds-btn">
                Spustit ukázku
                <Icon name="arrow" />
              </button>
              {saved && (
                <button type="button" className="ds-btn ds-btn--secondary" onClick={resume}>
                  Pokračovat v rozehrané ukázce
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
