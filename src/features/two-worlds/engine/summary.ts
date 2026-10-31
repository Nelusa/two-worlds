import { CASES } from "../content";
import { assessGrounding, describeOutcome, GROUNDING_TEXT, summarizeEvidence } from "./assessment";
import type { DecisionRecord } from "./game";
import { observeAll } from "./scenario";

export const FINAL_PRINCIPLES = [
  {
    title: "Odkud získám kontakt",
    text: "Z vlastního dřívějšího záznamu: uložené kontaktní karty, původní objednávky nebo potvrzení. Ne ze zprávy, která změnu požaduje, ani z její přílohy.",
  },
  {
    title: "Co konkrétně ověřím",
    text: "Samotnou změnu: číslo objednávky nebo předání, částku a nový účet či místo. Že to zvedne správný člověk, nestačí.",
  },
  {
    title: "Co udělám, když odpověď nemám",
    text: "Počkám a dám vědět, že vyřízení čeká na ověření. Změnu neprovedu jen podle zprávy a bez podkladu ji ani neprohlásím za podvod.",
  },
] as const;

export const describeRecord = (record: DecisionRecord) => {
  const content = CASES[record.caseId];
  const observations = observeAll(content, record.actions, record.setup);
  const evidence = summarizeEvidence(content, observations);
  const grounding = assessGrounding(evidence, record.decision);
  const option = content.decisionOptions.find(({ decision }) => decision === record.decision);
  return {
    caseTitle: content.title,
    decisionLabel: option?.label ?? record.decision,
    worldName: content.worlds[record.setup.world].name,
    outcome: describeOutcome(content, record.setup.world, record.decision),
    grounding: GROUNDING_TEXT[grounding],
    evidence,
  };
};

export const finalCardText = (records: DecisionRecord[]): string => {
  const principles = FINAL_PRINCIPLES.map(({ title, text }) => `${title}\n${text}`).join("\n\n");
  const results = records
    .map((record) => {
      const { caseTitle, decisionLabel, worldName, outcome, grounding } = describeRecord(record);
      return `${caseTitle}: ${decisionLabel}. Realita: ${worldName}. ${outcome.status}. ${grounding.label}.`;
    })
    .join("\n");
  return [
    "Dva světy: můj ověřovací postup",
    "",
    principles,
    "",
    results ? `Moje rozhodnutí v simulaci\n${results}` : "",
    "",
    "Karta shrnuje cvičení v simulaci. Neosvědčuje člověka ani firemní proces.",
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n")
    .trim();
};
