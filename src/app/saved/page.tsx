import type { Metadata } from "next";
import { AppHeader } from "@/features/two-worlds/components/AppHeader";
import { SavedProgress } from "@/features/two-worlds/components/SavedProgress";

export const metadata: Metadata = { title: "Uložený průběh" };

export default function SavedPage() {
  return (
    <>
      <AppHeader />
      <main id="main" tabIndex={-1} className="ds-container pt-12 pb-24 sm:pt-16">
        <h1 className="font-display text-h1 leading-tight font-extrabold tracking-display">
          Uložený průběh
        </h1>
        <p className="mt-4 mb-14 max-w-160 leading-body text-ink-2">
          Průběh je uložený jen v tomto prohlížeči. Nikam se neodesílá, neobsahuje jméno ani e-mail
          a jiné zařízení ho nevidí.
        </p>
        <SavedProgress />
      </main>
    </>
  );
}
