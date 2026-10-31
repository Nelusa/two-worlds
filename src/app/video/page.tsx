import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/features/two-worlds/components/AppHeader";
import { Icon } from "@/features/two-worlds/components/Icon";

export const metadata: Metadata = {
  title: "Video průchodu",
  description: "Necelé tři minuty: jak se hraje Dva světy, od zprávy po odhalení obou realit.",
};

export default function VideoPage() {
  return (
    <>
      <AppHeader />
      <main id="main" tabIndex={-1} className="ds-container pt-12 pb-24 sm:pt-16">
        <h1 className="font-display text-h1 leading-tight font-extrabold tracking-display">
          Video průchodu
        </h1>
        <p className="mt-4 max-w-160 leading-body text-ink-2">
          Necelé tři minuty bez zvuku: zpráva, podklady, rozhodnutí, odhalení obou realit, vlastní
          postup a druhý případ. Klikání je předem připravené a realita je pro video pevně daná.
        </p>
        {/* The video has no sound track, so there is nothing to caption; every title is on screen. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          controls
          playsInline
          preload="metadata"
          poster="/video/dva-svety-pruchod.jpg"
          className="mt-10 aspect-video w-full border-2 border-ink bg-sheet"
        >
          <source src="/video/dva-svety-pruchod.mp4" type="video/mp4" />
          Prohlížeč video nepřehraje. Stáhnout ho můžeš{" "}
          <a href="/video/dva-svety-pruchod.mp4">jako soubor MP4</a>.
        </video>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/play" className="ds-btn">
            Zahrát si hru
            <Icon name="arrow" />
          </Link>
          <Link href="/" className="ds-btn ds-btn--secondary">
            Na úvod
          </Link>
        </div>
      </main>
    </>
  );
}
