import type { WorldId } from "../engine/types";

export const WORLDS: WorldId[] = ["legitimate", "fraudulent"];

export const WORLD_SHORT: Record<WorldId, string> = {
  legitimate: "Skutečná změna",
  fraudulent: "Zneužitá schránka",
};

/**
 * Plate classes of each reality. Allowed only after the decision: before it the page is
 * paper and ink only, so nothing can hint which reality is being played.
 */
export const WORLD_PLATE: Record<WorldId, { number: 1 | 2; rule: string; wash: string }> = {
  legitimate: { number: 1, rule: "ds-plate-rule--1", wash: "ds-wash--1" },
  fraudulent: { number: 2, rule: "ds-plate-rule--2", wash: "ds-wash--2" },
};

interface WorldBadgeProps {
  world: WorldId;
  /** Leave out "Realita 1 ·" where the column already says it. */
  short?: boolean;
  suffix?: string;
  className?: string;
}

/** Name of a reality in words with its plate mark; colour is never the only signal. */
export function WorldBadge({ world, short = false, suffix, className = "" }: WorldBadgeProps) {
  const { number } = WORLD_PLATE[world];
  return (
    <span className={`ds-reality ds-reality--${number} text-small ${className}`}>
      {short ? WORLD_SHORT[world] : `Realita ${number} · ${WORLD_SHORT[world]}`}
      {suffix && ` · ${suffix}`}
    </span>
  );
}
