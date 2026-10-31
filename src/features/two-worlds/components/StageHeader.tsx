import type { ReactNode } from "react";
import { StageHeading } from "./StageHeading";

interface StageHeaderProps {
  /** Short running head above the title, e.g. "případ 1 · procvičování". */
  kicker: string;
  title: string;
  lead?: ReactNode;
  /** Right-hand block, e.g. the story clock; on phones it moves next to the running head. */
  aside?: ReactNode;
  children?: ReactNode;
}

/** Opening of every stage, set like the cover of a case file. */
export function StageHeader({ kicker, title, lead, aside, children }: StageHeaderProps) {
  return (
    <header className="ds-container grid grid-fill-auto items-start gap-x-6 pt-6 sm:pt-12">
      <p className="col-start-1 row-start-1 self-center font-mono text-meta sm:self-start">
        {kicker.toLowerCase()}
      </p>
      {aside && <div className="col-start-2 row-start-1 sm:row-span-4 sm:self-end">{aside}</div>}
      <StageHeading className="col-start-1 col-end-3 mt-2 max-w-160 font-display text-h1 leading-tight font-extrabold tracking-display text-balance sm:col-end-2 sm:mt-3">
        {title}
      </StageHeading>
      {lead && (
        <div className="col-start-1 col-end-3 mt-4 max-w-160 leading-body text-ink-2 sm:col-end-2 sm:text-body-lg">
          {lead}
        </div>
      )}
      {children && (
        <div className="col-start-1 col-end-3 mt-5 space-y-4 sm:col-end-2">{children}</div>
      )}
    </header>
  );
}

export function StoryClock({ time, note }: { time: string; note: string }) {
  return (
    <div className="flex items-center gap-2 sm:block sm:text-right">
      <p className="font-display text-clock leading-tight font-extrabold tracking-hero tabular-nums">
        <span className="sr-only">Čas příběhu: </span>
        {time}
      </p>
      <p className="max-w-24 font-mono text-micro leading-head sm:mt-2 sm:max-w-none sm:text-meta">
        {note.toLowerCase()}
      </p>
    </div>
  );
}
