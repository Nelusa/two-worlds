"use client";

import { useId } from "react";
import type { ReactNode } from "react";

/*
 * Form controls drawn by the app. Every one keeps a real input stretched invisibly over the
 * whole control, so pointer, keyboard, screen readers and form semantics stay native.
 */

const HIDDEN_INPUT = "absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none opacity-0";

interface ChoiceCardProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  /** Plain rows separated by hairlines instead of boxed options. */
  plain?: boolean;
}

/** One of several mutually exclusive options; the round mark says "pick one". */
export function ChoiceCard({
  name,
  checked,
  onChange,
  title,
  description,
  plain = false,
}: ChoiceCardProps) {
  return (
    <label className={`ds-choice group relative ${plain ? "ds-choice--plain" : ""}`}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className={HIDDEN_INPUT}
      />
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-5.5 place-items-center rounded-full border-2 border-ink bg-sheet"
      >
        <span className="size-2.5 scale-0 rounded-full bg-ink group-has-checked:scale-100" />
      </span>
      <span className="ds-choice__title">{title}</span>
      {description && <span className="ds-choice__desc">{description}</span>}
    </label>
  );
}

interface CheckOptionProps {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  description?: string;
  plain?: boolean;
}

/** Multiple-choice row: a square box, never a round one, so it reads as "pick any". */
export function CheckOption({
  checked,
  onChange,
  children,
  description,
  plain = true,
}: CheckOptionProps) {
  return (
    <label className={`ds-choice group relative ${plain ? "ds-choice--plain" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className={HIDDEN_INPUT} />
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-5.5 place-items-center border-2 border-ink bg-sheet text-sheet group-has-checked:bg-ink"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path d="M3 8.5l3.2 3L13 4.5" />
        </svg>
      </span>
      <span className="ds-choice__title">{children}</span>
      {description && <span className="ds-choice__desc">{description}</span>}
    </label>
  );
}

interface SegmentedProps<T extends string> {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-small font-bold">{legend}</legend>
      <div className="flex border-2 border-ink">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative flex min-h-11 flex-1 cursor-pointer items-center justify-center px-3 text-center text-small whitespace-nowrap not-first:border-l-2 not-first:border-ink hover:bg-tab has-checked:bg-ink has-checked:font-bold has-checked:text-sheet has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink"
          >
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={HIDDEN_INPUT}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
