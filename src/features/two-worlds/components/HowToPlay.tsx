"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { TEXT_BUTTON } from "./styles";
import { typography } from "../utils/typography";

/*
 * Explains the controls, never the lesson: nothing here says which source to trust, so the
 * player's first attempt stays their own.
 */
const STEPS = [
  {
    title: "Prozkoumej podklady",
    text: "V seznamu podkladů otevřeš zprávu, dokumenty a kontakty a položíš otázky. Každý získaný podklad se zapíše do historie úkonů a do mapy původu.",
  },
  {
    title: "Rozhodni se",
    text: "Tlačítkem „Rozhodnout o požadavku“ můžeš kdykoli požadavek odsouhlasit, odmítnout, nebo počkat. Ověření není podmínkou, potvrzené rozhodnutí ale pokus uzamkne.",
  },
  {
    title: "Uvidíš obě reality",
    text: "Pak se ukáže, co by tytéž kroky ukázaly ve druhé připravené realitě a kde se získané informace rozešly. Nic není skutečné, nic se neodesílá.",
  },
];

export function HowToPlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={TEXT_BUTTON}>
        Jak na to
      </button>
      <Dialog
        open={open}
        kicker="nápověda"
        title="Jak na to"
        onClose={() => setOpen(false)}
        footer={
          <button type="button" className="ds-btn" onClick={() => setOpen(false)}>
            Rozumím
          </button>
        }
      >
        <ol className="border-section">
          {STEPS.map(({ title, text }, index) => (
            <li key={title} className="flex gap-6 border-b border-ink py-5 sm:gap-10">
              <span
                aria-hidden="true"
                className="w-8 shrink-0 font-display text-h2 leading-tight font-extrabold"
              >
                {index + 1}
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="mt-1 leading-body text-ink-2">{typography(text)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 flex gap-2 text-small">
          <span className="font-mono text-meta">pozn.</span>
          Je to simulace. Nic se neodesílá, nevolá ani neplatí.
        </p>
      </Dialog>
    </>
  );
}
