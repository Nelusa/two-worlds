import { expect, test, type Page } from "@playwright/test";
import {
  collectErrors,
  decide,
  expectNoHorizontalScroll,
  openAttachment,
  openSource,
  revealAll,
  SCREENSHOT_DIR,
  startDemo,
} from "./helpers";

/** Presses Tab until the focused element's accessible text matches, then returns. */
const tabTo = async (page: Page, pattern: RegExp, limit = 80) => {
  const reached = async () =>
    page.evaluate((source) => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return false;
      const label =
        element instanceof HTMLInputElement ? (element.labels?.[0]?.innerText ?? "") : "";
      const text = `${element.getAttribute("aria-label") ?? ""} ${element.innerText} ${label}`;
      return new RegExp(source).test(text);
    }, pattern.source);
  const step = async (left: number): Promise<void> => {
    if (await reached()) return;
    if (left === 0) {
      const focused = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 200));
      throw new Error(`Focus never reached ${pattern}; ended on ${focused}`);
    }
    await page.keyboard.press("Tab");
    return step(left - 1);
  };
  await step(limit);
};

test("the whole first case works with the keyboard only", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/demo?world=fraudulent&variant=v1");
  await tabTo(page, /Spustit ukázku/);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 1, name: "Večer, který se má uskutečnit" }),
  ).toBeVisible();

  await tabTo(page, /Uložený kontakt Kláry/);
  await page.keyboard.press("Enter");
  // Opening a tab moves focus to the sheet title.
  await expect(
    page.getByRole("heading", { level: 2, name: "Uložený kontakt Kláry" }),
  ).toBeFocused();
  await tabTo(page, /zeptat se: platí pro JAVOR/);
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Ne, účet jsme neměnili/).first()).toBeVisible();

  await page.keyboard.press("Shift+Tab");
  await tabTo(page, /^ ?Rozhodnout o požadavku/);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Tvoje rozhodnutí" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Tvoje rozhodnutí" })).toBeFocused();
  // Nothing is preselected; confirm stays reachable but unavailable, with the reason in words.
  await expect(dialog.getByRole("radio", { checked: true })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Potvrdit rozhodnutí" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );

  // Escape closes without deciding and returns focus to the trigger.
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Rozhodnout o požadavku" })).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await tabTo(page, /Odsouhlasit nové údaje/);
  await page.keyboard.press("ArrowDown");
  await expect(dialog.getByRole("radio", { name: /Odmítnout změnu/ })).toBeChecked();
  await tabTo(page, /Potvrdit rozhodnutí/);
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { level: 1, name: "Dvě reality" })).toBeFocused();
  await tabTo(page, /Pokračovat v odhalení/);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await tabTo(page, /Pokračovat v odhalení/);
  await page.keyboard.press("Enter");
  await expect(page.getByText("Podložené odmítnutí")).toBeVisible();
  await tabTo(page, /Sestavit vlastní postup/);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Můj postup" })).toBeFocused();
  expect(errors).toEqual([]);
});

test("locked tab, live transcript and focus ring follow the B2 rules", async ({ page }) => {
  await startDemo(page, "world=legitimate");
  const locked = page
    .getByRole("navigation", { name: "Podklady a kontakty" })
    .getByRole("button", { name: /Kontakt z přílohy/ });
  await expect(locked).toHaveAttribute("aria-disabled", "true");
  await expect(locked).toHaveAccessibleDescription("Nejprve potřebuješ podklad");

  await openSource(page, "Uložený kontakt Kláry");
  await expect(page.locator("#questions-heading ~ [aria-live='polite']")).toHaveCount(1);

  await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as Element);
    return [style.outlineWidth, style.outlineOffset];
  });
  expect(ring).toEqual(["3px", "3px"]);
});

test("reduced motion shows the reveal in its final state at once", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await startDemo(page, "world=legitimate");
  await openAttachment(page);
  await decide(page, "Odmítnout změnu");
  await revealAll(page);
  await expect(page.locator(".ds-reveal-armed")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Přehrát odhalení znovu" })).toHaveCount(0);
  const hidden = await page
    .locator("[data-reveal]")
    .evaluateAll(
      (elements) => elements.filter((element) => getComputedStyle(element).opacity !== "1").length,
    );
  expect(hidden).toBe(0);
  await context.close();
});

test("with motion both realities and both answers start at the same moment", async ({ page }) => {
  await startDemo(page, "world=fraudulent&variant=v1");
  await openSource(page, "Uložený kontakt Kláry");
  await page.getByRole("button", { name: /zeptat se: platí pro JAVOR/ }).click();
  await decide(page, "Odmítnout změnu");
  await expect(page.getByRole("heading", { level: 1, name: "Dvě reality" })).toBeFocused();
  await expect(page.locator(".ds-reveal-armed")).toHaveCount(1);
  const delays = (selector: string) =>
    page
      .locator(selector)
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).style.getPropertyValue("--ds-delay")),
      );
  const realities = await delays("[data-reveal-section] > div > div > article[data-reveal]");
  expect(realities).toHaveLength(2);
  expect(new Set(realities).size).toBe(1);
});

test.describe("phone viewport 390 × 844", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });

  test("principle and saved progress pages fit without horizontal scrolling", async ({ page }) => {
    for (const path of ["/about", "/saved"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalScroll(page);
    }
  });

  test("workspace, reveal and final card fit without horizontal scrolling", async ({ page }) => {
    // The longest journeys; the default 30 s is tight on a busy machine.
    test.setTimeout(90_000);
    const errors = collectErrors(page);
    await page.goto("/");
    await expectNoHorizontalScroll(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/10-intro-mobile.png`,
      fullPage: true,
      animations: "disabled",
    });

    await startDemo(page, "world=fraudulent&variant=v2&transferContact=unreachable");
    await openAttachment(page);
    await openSource(page, "Adam, kolega");
    await page.getByRole("button", { name: /Zeptat se Adama/ }).click();
    await openSource(page, "Uložený kontakt Kláry");
    await page.getByRole("button", { name: /zeptat se: platí pro JAVOR/ }).click();
    await expectNoHorizontalScroll(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/11-workspace-mobile.png`,
      fullPage: true,
      animations: "disabled",
    });

    await decide(page, "Odmítnout změnu");
    await revealAll(page);
    await expectNoHorizontalScroll(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/12-reveal-mobile.png`,
      fullPage: true,
      animations: "disabled",
    });

    await page.getByRole("button", { name: "Sestavit vlastní postup" }).click();
    await page.getByRole("button", { name: "Vložit ukázkový postup" }).click();
    await page
      .getByRole("checkbox", { name: /Vyzkoušet s nedostupným původním kontaktem/ })
      .check();
    await page.getByRole("button", { name: "Přehrát v obou realitách" }).click();
    await expect(
      page.getByText(/Ukázkový postup: výsledek ukazuje připravený postup/),
    ).toBeVisible();
    await expect(
      page.getByText("Žádná odpověď se mezi realitami nelišila.", { exact: false }),
    ).toBeVisible();
    const shared = page.getByRole("group", { name: "Rozhodnutí pro obě reality" });
    await shared.getByRole("radio", { name: "Zatím počkat" }).check();
    await shared.getByRole("button", { name: "Potvrdit" }).click();
    await expectNoHorizontalScroll(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/13-procedure-mobile.png`,
      fullPage: true,
      animations: "disabled",
    });

    // Transfer case with the original contact unreachable.
    await page.getByRole("button", { name: "Pokračovat na nový případ" }).click();
    await openSource(page, "Původní potvrzení dopravy");
    await openSource(page, "Dispečink z původního potvrzení");
    await page.getByRole("button", { name: /platí pro PREDANI/ }).click();
    await expect(page.getByText(/Na dispečink se zatím nepodařilo dovolat/).first()).toBeVisible();
    await decide(page, "Zatím počkat");
    await revealAll(page);
    await expect(page.getByText("Přiměřené odložení")).toBeVisible();
    await page.getByRole("button", { name: "Zobrazit závěrečnou kartu" }).click();
    await expectNoHorizontalScroll(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/14-final-card-mobile.png`,
      fullPage: true,
      animations: "disabled",
    });
    expect(errors).toEqual([]);
  });
});
