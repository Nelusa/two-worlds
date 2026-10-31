import type { CaseId, Setup } from "./types";

/** Small deterministic PRNG (mulberry32); the same seed always yields the same sequence. */
export const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomSeed = (): number => {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value;
};

const VARIANTS: Record<CaseId, string[]> = {
  evening: ["v1", "v2"],
  handover: ["v1"],
};

/**
 * Hidden setup of one paired attempt. Every value comes from the seed alone, each from its own
 * draw, so the world never depends on the text variant, contact availability or past results.
 * The main case keeps the saved contact reachable; the transfer case is unreachable in a third
 * of attempts, independently of the world.
 */
export const setupFromSeed = (caseId: CaseId, seed: number): Setup => {
  const next = createRng(seed);
  const world = next() < 0.5 ? "legitimate" : "fraudulent";
  const variants = VARIANTS[caseId];
  const variantId = variants[Math.floor(next() * variants.length)];
  const unreachable = next() < 1 / 3;
  return {
    world,
    variantId,
    savedContact: caseId === "handover" && unreachable ? "unreachable" : "available",
  };
};
