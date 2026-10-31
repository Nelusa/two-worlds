import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  collectErrors,
  decide,
  historyItems,
  openAttachment,
  openSource,
  plateUsage,
  sources,
} from "./helpers";

/** Words that would give the hidden world away before the decision. */
const LEAKS = [
  "útočník",
  "zneužit",
  "Skutečná změna",
  "Zneužitá schránka",
  "legitimate",
  "fraudulent",
  "podvodn",
  "pravý účet",
];

test("normal mode hides the world and shows no demo controls before the decision", async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Otevřít případ" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Večer, který se má uskutečnit" }),
  ).toBeVisible();
  await expect(page.getByText("Ukázkový režim")).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);

  await openAttachment(page);
  await openSource(page, "Původní objednávka");
  await openSource(page, "Adam, kolega");
  await page.getByRole("button", { name: /Zeptat se Adama/ }).click();
  await openSource(page, "Kontakt z přílohy");
  await page.getByRole("button", { name: /Zavolat na číslo z přílohy/ }).click();
  await openSource(page, "Uložený kontakt Kláry");
  await page.getByRole("button", { name: /ověřit, že mluvím s Klárou/ }).click();
  await page.getByRole("button", { name: "Rozhodnout o požadavku" }).click();

  const html = await page.evaluate(() => document.body.outerHTML);
  expect(LEAKS.filter((word) => html.includes(word))).toEqual([]);
  // Before the decision the page is paper and ink only: no plate colour anywhere.
  expect(await plateUsage(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test("progress survives a refresh mid-case and after the decision", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/play");
  await openAttachment(page);
  await openSource(page, "Původní objednávka");
  // Opening the same document again adds nothing.
  await sources(page)
    .getByRole("button", { name: /Nová příloha/ })
    .click();
  await expect(historyItems(page)).toHaveCount(3);
  // One count everywhere: the message, the attachment and the order are three sources.
  const decision = page.getByRole("region", { name: "Rozhodnutí" });
  await expect(decision).toContainText("3 podklady k dispozici");

  await page.reload();
  await expect(historyItems(page)).toHaveCount(3);
  await expect(decision).toContainText("3 podklady k dispozici");
  await expect(sources(page).getByRole("button", { name: /Původní objednávka/ })).toContainText(
    "Otevřeno",
  );

  await decide(page, "Zatím počkat");
  await expect(page.getByRole("heading", { level: 1, name: "Dvě reality" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Dvě reality" })).toBeVisible();

  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("two-worlds.progress") ?? "{}"),
  );
  expect(saved.schemaVersion).toBe(1);
  expect(saved.state.records).toHaveLength(1);
  expect(saved.state.records[0]).toMatchObject({
    mode: "first_attempt",
    caseId: "evening",
    decision: "wait",
    actions: ["open_attachment", "open_original_order"],
  });
  expect(typeof saved.state.records[0].seed).toBe("number");
  expect(["v1", "v2"]).toContain(saved.state.records[0].setup.variantId);
  expect(errors).toEqual([]);
});

test("corrupted saved data offers a clean restart", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("two-worlds.progress", "{broken");
    localStorage.setItem("someone-else", "keep");
  });
  await page.goto("/play");
  await expect(page.getByRole("heading", { name: "Uložený průběh nejde načíst" })).toBeVisible();
  await page.getByRole("button", { name: "Začít nový případ" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Večer, který se má uskutečnit" }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("someone-else"))).toBe("keep");
});

test("unsupported schema version is reported, not replayed", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("two-worlds.progress", JSON.stringify({ schemaVersion: 99, state: {} })),
  );
  await page.goto("/play");
  await expect(page.getByText("Uložená data mají verzi 99, aplikace umí verzi 1.")).toBeVisible();
});

test("export downloads versioned JSON and delete removes only the app's keys", async ({ page }) => {
  await page.goto("/play");
  await openAttachment(page);
  await decide(page, "Odmítnout změnu");
  await expect(page.getByRole("heading", { level: 1, name: "Dvě reality" })).toBeVisible();
  await page.evaluate(() => localStorage.setItem("someone-else", "keep"));

  await page.getByRole("link", { name: "Uložený průběh" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Uložený průběh" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: /První pokus/ })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Stáhnout průběh (JSON)" }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path()) ?? "", "utf8"));
  expect(exported).toMatchObject({ format: "two-worlds-progress", schemaVersion: 1 });
  expect(exported.records).toHaveLength(1);
  expect(exported.records[0].mode).toBe("first_attempt");
  // No personal data: the export holds no e-mail address at all.
  expect(JSON.stringify(exported)).not.toMatch(/@/);

  await page.getByRole("button", { name: "Smazat průběh z tohoto prohlížeče" }).click();
  await page.getByRole("button", { name: "Smazat záznamy" }).click();
  await expect(page.getByText("Průběh je smazaný.", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("two-worlds.progress"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("someone-else"))).toBe("keep");
  await page.getByRole("link", { name: "Otevřít případ" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Večer, který se má uskutečnit" }),
  ).toBeVisible();
});

test("the workspace DOM is identical in both worlds until the specific check", async ({
  browser,
}) => {
  const snapshot = async (world: string) => {
    const page = await browser.newPage();
    await page.goto(`/demo?world=${world}&variant=v1`);
    await page.getByRole("button", { name: "Spustit ukázku" }).click();
    await openAttachment(page);
    await openSource(page, "Adam, kolega");
    await page.getByRole("button", { name: /Zeptat se Adama/ }).click();
    await openSource(page, "Kontakt z přílohy");
    await page.getByRole("button", { name: /Zavolat na číslo z přílohy/ }).click();
    await openSource(page, "Uložený kontakt Kláry");
    await page.getByRole("button", { name: /ověřit, že mluvím s Klárou/ }).click();
    await page.getByRole("button", { name: "Rozhodnout o požadavku" }).click();
    const html = await page.locator("main").evaluate((main) => main.outerHTML);
    await page.close();
    return html;
  };
  expect(await snapshot("legitimate")).toBe(await snapshot("fraudulent"));
});

test("unknown addresses get the app's own not-found page", async ({ page }) => {
  const response = await page.goto("/neexistujici-stopa");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Tahle stopa nikam nevede" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Zpět na úvod" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Dva světy" })).toBeVisible();
});

test("the case header offers a short guide that closes back to its button", async ({ page }) => {
  await page.goto("/play");
  const trigger = page.getByRole("button", { name: "Jak na to" });
  await trigger.click();
  const guide = page.getByRole("dialog", { name: "Jak na to" });
  await expect(guide).toBeVisible();
  await expect(guide.getByRole("listitem")).toHaveCount(3);
  await page.screenshot({ path: "docs/screenshots/06-guide-desktop.png", animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(guide).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await guide.getByRole("button", { name: "Rozumím" }).click();
  await expect(guide).toBeHidden();
  // The guide explains the controls only; the case itself has not moved on.
  await expect(
    page.getByRole("region", { name: "Historie úkonů" }).getByRole("listitem"),
  ).toHaveCount(1);
});
