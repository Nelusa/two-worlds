import { describe, expect, it } from "vitest";
import { typography } from "./typography";

const NBSP = " ";
const WJ = "⁠";

describe("typography", () => {
  it("keeps amounts, accounts and prepositions together", () => {
    expect(typography("Pošli 8 400 Kč na Účet B v příloze.")).toBe(
      `Pošli 8${NBSP}400${NBSP}Kč na Účet${NBSP}B v${NBSP}příloze.`,
    );
  });

  it("does not break codes and e-mail after the hyphen", () => {
    expect(typography("JAVOR-014 a e-mail")).toBe(`JAVOR-${WJ}014 a${NBSP}e-${WJ}mail`);
  });
});
