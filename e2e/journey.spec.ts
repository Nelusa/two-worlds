import { expect, test } from "@playwright/test";
import {
  collectErrors,
  decide,
  historyItems,
  openAttachment,
  openSource,
  revealAll,
  SCREENSHOT_DIR,
  startDemo,
} from "./helpers";

test("fraudulent world: full journey from intro to the final card", async ({ page }) => {
  // The longest journeys; the default 30 s is tight on a busy machine.
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  const fontHosts: string[] = [];
  page.on("request", (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) fontHosts.push(request.url());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Dva světy" })).toBeVisible();
  await expect(page.getByText("Když všechno působí důvěryhodně, co si ověříš?")).toBeVisible();
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/01-intro-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });

  await startDemo(page, "world=fraudulent&variant=v1&contact=available&transferWorld=legitimate");

  // Three confirmations that all come from the incoming request.
  await openAttachment(page);
  await expect(page.getByText(/Platební údaje k\sobjednávce JAVOR-.?014/).first()).toBeVisible();
  await openSource(page, "Adam, kolega");
  await page.getByRole("button", { name: /Zeptat se Adama/ }).click();
  await openSource(page, "Kontakt z přílohy");
  await page.getByRole("button", { name: /Zavolat na číslo z přílohy/ }).click();
  await expect(page.getByText(/Ano, údaje z\spřílohy platí/).first()).toBeVisible();

  // The independent path: saved card, identity, then the specific change.
  await openSource(page, "Uložený kontakt Kláry");
  await page.getByRole("button", { name: /ověřit, že mluvím s Klárou/ }).click();
  await page.getByRole("button", { name: /zeptat se: platí pro JAVOR/ }).click();
  await expect(page.getByText(/Ne, účet jsme neměnili/).first()).toBeVisible();

  const provenance = page.getByRole("region", { name: "Mapa původu" });
  await expect(provenance.getByText("4 podklady, jeden původ")).toBeVisible();
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/02-workspace-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });

  await decide(page, "Odmítnout změnu");
  await expect(page.getByRole("heading", { level: 1, name: "Dvě reality" })).toBeFocused();
  await page.getByRole("button", { name: "Pokračovat v odhalení" }).click();
  await expect(
    page.getByRole("heading", { name: "2. Tvoje úkony v obou realitách" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Pokračovat v odhalení" }).click();

  await expect(page.getByText("Tady se získané informace rozcházejí").first()).toBeVisible();
  await expect(page.getByText("Podložené odmítnutí")).toBeVisible();
  await expect(page.getByText(/vycházejí ze stejné zprávy/)).toBeVisible();
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/03-reveal-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });

  // Continue the other branch as practice: only actions up to the divergence are inherited.
  await page.getByRole("button", { name: "Pokračovat v této větvi" }).click();
  await expect(page.getByText(/Pokračuješ v realitě „Klára účet opravdu změnila“/)).toBeVisible();
  const history = page.getByRole("region", { name: "Historie úkonů" });
  await expect(history.getByText("Stejně v obou realitách")).toHaveCount(5);
  await expect(history.getByText("jen v realitě 1")).toHaveCount(1);
  await openSource(page, "Uložený kontakt Kláry");
  await expect(page.getByText("Jiná odpověď než v tvém pokusu")).toBeVisible();
  await expect(
    page.getByText(/Ano, k\sJAVOR-.?014 platí záloha 8\s400\sKč a\snový Účet\sB/).first(),
  ).toBeVisible();
  await decide(page, "Odsouhlasit nové údaje");
  await expect(page.getByRole("heading", { name: "Výsledek větve" })).toBeVisible();
  await expect(page.getByText("Podložené odsouhlasení")).toBeVisible();
  await page.getByRole("button", { name: "Sestavit vlastní postup" }).click();

  // Procedure: own steps with button ordering, prerequisite warning, both realities.
  await expect(page.getByRole("heading", { level: 1, name: "Můj postup" })).toBeVisible();
  await page.getByRole("checkbox", { name: /Přes uložený kontakt ověřit konkrétní změnu/ }).check();
  await expect(
    page.getByText("Číslo je na uložené kontaktní kartě. Nejprve ji otevři."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Přehrát v obou realitách" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.getByRole("checkbox", { name: /Otevřít uloženou kontaktní kartu/ }).check();
  await page.getByRole("button", { name: /výš: Otevřít uloženou kontaktní kartu/ }).click();
  await page.getByRole("button", { name: "Přehrát v obou realitách" }).click();
  await expect(
    page.getByText("Od úkonu 2 se získané informace rozcházejí", { exact: false }),
  ).toBeVisible();
  const branchPickers = page.getByRole("group", { name: "Rozhodnutí v této větvi" });
  await expect(branchPickers).toHaveCount(2);
  await branchPickers.nth(0).getByRole("radio", { name: "Odsouhlasit nové údaje" }).check();
  await branchPickers.nth(0).getByRole("button", { name: "Potvrdit" }).click();
  await page
    .getByRole("group", { name: "Rozhodnutí v této větvi" })
    .getByRole("radio", { name: "Odmítnout změnu" })
    .check();
  await page
    .getByRole("group", { name: "Rozhodnutí v této větvi" })
    .getByRole("button", { name: "Potvrdit" })
    .click();
  await expect(page.getByText("Ukázkový postup:")).toHaveCount(0);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/04-procedure-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Pokračovat na nový případ" }).click();

  // Transfer case: different context, no prefilled procedure.
  await expect(
    page.getByRole("heading", { level: 1, name: "Poslední změna před předáním" }),
  ).toBeVisible();
  await expect(historyItems(page)).toHaveCount(1);
  await openSource(page, "Původní potvrzení dopravy");
  await openSource(page, "Dispečink z původního potvrzení");
  await page
    .getByRole("button", { name: /platí pro PREDANI-.?026 vyzvednutí na Místě\sB/ })
    .click();
  await expect(page.getByText(/Ano, PREDANI-.?026 vyzvedneme zítra/).first()).toBeVisible();
  await decide(page, "Přijmout Místo B");
  await revealAll(page);
  await expect(page.getByText("Požadavek vyřízen")).toBeVisible();
  await page.getByRole("button", { name: "Zobrazit závěrečnou kartu" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Můj ověřovací postup" })).toBeVisible();
  await expect(page.getByText("Odkud získám kontakt")).toBeVisible();
  await expect(page.getByText("Co udělám, když odpověď nemám")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Stáhnout jako text" }).click();
  expect((await download).suggestedFilename()).toBe("dva-svety-postup.txt");
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/05-final-card-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });

  // Fonts are bundled with the app; nothing goes to a font CDN.
  expect(fontHosts).toEqual([]);

  // Demo never writes into normal history.
  expect(await page.evaluate(() => localStorage.getItem("two-worlds.progress"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("two-worlds.demo"))).not.toBeNull();
  expect(errors).toEqual([]);
});

test("legitimate world: lucky unverified approval is not called a good procedure", async ({
  page,
}) => {
  const errors = collectErrors(page);
  await startDemo(page, "world=legitimate&variant=v2&contact=available");
  await expect(
    page.getByText(/Ahoj, k\sobjednávce JAVOR-.?014 potřebuju ještě dnes/),
  ).toBeVisible();
  await openAttachment(page);
  await decide(page, "Odsouhlasit nové údaje");
  await revealAll(page);
  await expect(
    page.getByText("Stejné podklady, tedy stejné rozhodnutí v obou realitách"),
  ).toBeVisible();
  await expect(page.getByText("Požadavek vyřízen")).toBeVisible();
  await expect(page.getByText("Provedena neoprávněná změna")).toBeVisible();
  await expect(page.getByText("Odsouhlasení bez nezávislého potvrzení")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pokračovat v této větvi" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("unreachable saved contact: waiting is reasonable and nothing reveals the world", async ({
  page,
}) => {
  const errors = collectErrors(page);
  await startDemo(page, "world=fraudulent&variant=v1&contact=unreachable");
  await openSource(page, "Uložený kontakt Kláry");
  await page.getByRole("button", { name: /zeptat se: platí pro JAVOR/ }).click();
  await expect(page.getByText(/Kontakt se zatím nepodařilo zastihnout/).first()).toBeVisible();
  await decide(page, "Zatím počkat");
  await revealAll(page);
  await expect(page.getByText("Přiměřené odložení")).toBeVisible();
  await expect(page.getByText("Původní kontakt se nepodařilo zastihnout")).toBeVisible();
  await expect(page.getByText("Tady se získané informace rozcházejí")).toHaveCount(0);
  await expect(page.getByText(/nedostupný v obou realitách/)).toBeVisible();
  expect(errors).toEqual([]);
});
