import { expect, type Page } from "@playwright/test";

export const SCREENSHOT_DIR = "docs/screenshots";

/** Console errors and uncaught exceptions, including hydration mismatches. */
export const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

export const startDemo = async (page: Page, query: string) => {
  await page.goto(`/demo?${query}`);
  await page.getByRole("button", { name: "Spustit ukázku" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Večer, který se má uskutečnit" }),
  ).toBeVisible();
};

/** The attachment line of the incoming e-mail. */
export const openAttachment = (page: Page) =>
  page.getByRole("button", { name: "Otevřít přílohu" }).click();

export const sources = (page: Page) =>
  page.getByRole("navigation", { name: "Podklady a kontakty" });

export const openSource = async (page: Page, title: string) => {
  await sources(page)
    .getByRole("button", { name: new RegExp(title) })
    .click();
  await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
};

export const decide = async (page: Page, option: string) => {
  await page.getByRole("button", { name: "Rozhodnout o požadavku" }).click();
  const dialog = page.getByRole("dialog", { name: "Tvoje rozhodnutí" });
  await dialog.getByRole("radio", { name: new RegExp(option) }).check();
  await dialog.getByRole("button", { name: "Potvrdit rozhodnutí" }).click();
};

export const revealAll = async (page: Page) => {
  await expect(page.getByRole("heading", { level: 1, name: "Dvě reality" })).toBeVisible();
  await page.getByRole("button", { name: "Ukázat vše najednou" }).click();
  await expect(page.getByRole("heading", { name: "3. Rozhodnutí a důsledky" })).toBeVisible();
};

export const historyItems = (page: Page) =>
  page.getByRole("region", { name: "Historie úkonů" }).getByRole("listitem");

/** Plate colours (tokens --plate-1, --plate-2 and their washes) as computed RGB values. */
const PLATE_COLOURS = [
  "rgb(12, 85, 81)",
  "rgb(162, 82, 47)",
  "rgb(221, 234, 231)",
  "rgb(246, 230, 220)",
];

/** Elements whose computed colours use a plate; must be empty before the decision. */
export const plateUsage = (page: Page) =>
  page.evaluate((plates) => {
    const props = [
      "color",
      "backgroundColor",
      "borderTopColor",
      "borderLeftColor",
      "fill",
      "outlineColor",
    ] as const;
    return [...document.querySelectorAll("body *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return props.some((prop) => plates.includes(style[prop]));
      })
      .map((element) => element.outerHTML.slice(0, 120));
  }, PLATE_COLOURS);

export const expectNoHorizontalScroll = async (page: Page) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
};
