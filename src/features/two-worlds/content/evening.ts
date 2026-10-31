import type { CaseContent, Response } from "../engine/types";

const SAVED_CONTACT_UNREACHABLE: Response = {
  key: "saved_contact_unreachable",
  body: {
    type: "status",
    question: "Volání na uložený kontakt Kláry",
    text: "Kontakt se zatím nepodařilo zastihnout. Telefon nikdo nebere.",
  },
  claims: [{ type: "contact_unreachable", channel: "saved_contact" }],
};

export const EVENING_CASE: CaseContent = {
  id: "evening",
  title: "Večer, který se má uskutečnit",
  kicker: "Případ 1",
  storyTime: "Dnes 16:42",
  clockNote: "Akce se koná zítra",
  context:
    "Zítra pořádáš komunitní večer. Ateliér Javor má ráno přivézt vybavení. Zbývá vyřešit zálohu a potvrdit dodání. Právě přišla nová zpráva.",
  changeLabel: "záloha 8 400 Kč k JAVOR-014 na Účet B",
  attachmentAction: "open_attachment",
  variants: [
    {
      id: "v1",
      from: "Klára",
      address: "klara@javor.example",
      subject: "Zítřejší dodání: změna platebních údajů",
      paragraphs: [
        "Ahoj, jen prosím o úhradu zálohy 8 400 Kč k objednávce JAVOR-014 ještě dnes. Změnili jsme účet, nové údaje posílám v příloze. Bez připsané platby už bohužel nemůžu zítřejší dodání potvrdit.",
      ],
      signature: "Díky, Klára",
      attachmentName: "nove-udaje-JAVOR-014.pdf",
    },
    {
      id: "v2",
      from: "Klára",
      address: "klara@javor.example",
      subject: "Zítřejší dodání: změna platebních údajů",
      paragraphs: [
        "Ahoj, k objednávce JAVOR-014 potřebuju ještě dnes zálohu 8 400 Kč. Máme nový účet, údaje najdeš v příloze. Dokud platba nedorazí, zítřejší dodání ti bohužel potvrdit nemůžu.",
      ],
      signature: "Díky, Klára",
      attachmentName: "nove-udaje-JAVOR-014.pdf",
    },
  ],
  panels: [
    {
      id: "email",
      title: "Nová zpráva",
      originLabel: "Příchozí e-mail, Dnes 16:42",
      kind: "message",
      questions: [],
    },
    {
      id: "attachment",
      title: "Nová příloha",
      originLabel: "Přiložena k nové zprávě",
      kind: "document",
      openAction: "open_attachment",
      questions: [],
    },
    {
      id: "original_order",
      title: "Původní objednávka",
      originLabel: "Uložena při objednání, před třemi týdny",
      kind: "document",
      openAction: "open_original_order",
      questions: [],
    },
    {
      id: "colleague",
      title: "Adam, kolega",
      originLabel: "Spolupořadatel akce",
      kind: "person",
      questions: ["ask_colleague"],
    },
    {
      id: "attachment_contact",
      title: "Kontakt z přílohy",
      originLabel: "Kontakt uvedený v nové příloze",
      kind: "contact",
      questions: ["call_attachment_contact"],
      requires: "open_attachment",
      requiresHint: "Číslo je uvedené v nové příloze. Nejprve ji otevři.",
    },
    {
      id: "saved_contact",
      title: "Uložený kontakt Kláry",
      originLabel: "Kontakt uložený při původní objednávce",
      kind: "contact",
      openAction: "open_saved_contact",
      questions: ["saved_contact_identity", "saved_contact_change"],
    },
  ],
  actions: [
    {
      id: "open_attachment",
      panelId: "attachment",
      label: "Otevřít novou přílohu",
      shortLabel: "Otevřít novou přílohu",
      sourceId: "attachment",
      procedureStep: true,
      response: {
        key: "attachment_contents",
        body: {
          type: "document",
          heading: "Platební údaje k objednávce JAVOR-014",
          fields: [
            { label: "Objednávka", value: "JAVOR-014" },
            { label: "Záloha", value: "8 400 Kč" },
            { label: "Účet pro platbu", value: "Účet B" },
            { label: "Splatnost", value: "Dnes" },
            { label: "Kontakt pro dotazy", value: "Tel. 000 111 222 (simulovaný)" },
          ],
        },
        claims: [{ type: "request_details", sourceId: "attachment" }],
      },
    },
    {
      id: "open_original_order",
      panelId: "original_order",
      label: "Otevřít původní objednávku",
      shortLabel: "Otevřít původní objednávku",
      sourceId: "original_order",
      procedureStep: true,
      response: {
        key: "original_order_contents",
        body: {
          type: "document",
          heading: "Objednávka JAVOR-014",
          fields: [
            { label: "Dodavatel", value: "Ateliér Javor" },
            { label: "Vybavení", value: "Stoly, lavice a světelné řetězy" },
            { label: "Dodání", value: "Zítra ráno" },
            { label: "Záloha", value: "8 400 Kč" },
            { label: "Účet pro platbu", value: "Účet A" },
          ],
        },
        claims: [{ type: "previous_target", sourceId: "original_order", value: "Účet A" }],
      },
    },
    {
      id: "ask_colleague",
      panelId: "colleague",
      label: "Zeptat se Adama, jestli o změně ví",
      shortLabel: "Zeptat se Adama",
      sourceId: "colleague_reply",
      procedureStep: true,
      response: {
        key: "colleague_same_email",
        body: {
          type: "reply",
          speaker: "Adam",
          question: "Víš o tom, že Javor mění účet?",
          quote: "Jo, taky mi přišel ten stejný e-mail. Nic dalšího jsem neověřoval.",
        },
        claims: [{ type: "repeats_request", sourceId: "colleague_reply" }],
      },
    },
    {
      id: "call_attachment_contact",
      panelId: "attachment_contact",
      label: "Zavolat na číslo z přílohy a zeptat se, jestli údaje platí",
      shortLabel: "Zavolat na číslo z přílohy",
      sourceId: "attachment_contact_reply",
      requires: "open_attachment",
      requiresHint: "Číslo je uvedené v nové příloze. Nejprve ji otevři.",
      channel: "attachment_contact",
      procedureStep: true,
      response: {
        key: "attachment_contact_confirms",
        body: {
          type: "reply",
          speaker: "Hlas na čísle z přílohy",
          question: "Platí údaje z přílohy k JAVOR-014?",
          quote: "Ano, údaje z přílohy platí. Pošli prosím 8 400 Kč na Účet B.",
        },
        claims: [{ type: "requested_change_confirmed", channel: "attachment_contact" }],
      },
    },
    {
      id: "open_saved_contact",
      panelId: "saved_contact",
      label: "Otevřít uloženou kontaktní kartu",
      shortLabel: "Otevřít uloženou kontaktní kartu",
      sourceId: "saved_contact_card",
      procedureStep: true,
      response: {
        key: "saved_contact_card",
        body: {
          type: "contact_card",
          heading: "Klára, Ateliér Javor",
          fields: [
            { label: "Telefon", value: "000 555 101 (simulovaný)" },
            { label: "Uloženo", value: "Při původní objednávce, před třemi týdny" },
            { label: "Poznámka", value: "Kontakt pro JAVOR-014" },
          ],
        },
        claims: [{ type: "channel_identified", channel: "saved_contact" }],
      },
    },
    {
      id: "saved_contact_identity",
      panelId: "saved_contact",
      label: "Zavolat a ověřit, že mluvím s Klárou",
      shortLabel: "Přes uložený kontakt ověřit totožnost",
      sourceId: "saved_contact_reply",
      requires: "open_saved_contact",
      requiresHint: "Číslo je na uložené kontaktní kartě. Nejprve ji otevři.",
      channel: "saved_contact",
      procedureStep: true,
      response: {
        key: "saved_contact_identity",
        body: {
          type: "reply",
          speaker: "Klára (uložený kontakt)",
          question: "Mluvím s Klárou z Ateliéru Javor?",
          quote: "Ano, u telefonu Klára z Ateliéru Javor.",
        },
        claims: [{ type: "identity_confirmed", channel: "saved_contact" }],
      },
      unreachableResponse: SAVED_CONTACT_UNREACHABLE,
    },
    {
      id: "saved_contact_change",
      panelId: "saved_contact",
      label: "Zavolat a zeptat se: platí pro JAVOR-014 záloha 8 400 Kč na Účet B?",
      shortLabel: "Přes uložený kontakt ověřit konkrétní změnu",
      sourceId: "saved_contact_reply",
      requires: "open_saved_contact",
      requiresHint: "Číslo je na uložené kontaktní kartě. Nejprve ji otevři.",
      channel: "saved_contact",
      procedureStep: true,
      response: {
        legitimate: {
          key: "saved_contact_change_confirmed",
          body: {
            type: "reply",
            speaker: "Klára (uložený kontakt)",
            question: "Platí pro JAVOR-014 záloha 8 400 Kč na Účet B?",
            quote: "Ano, k JAVOR-014 platí záloha 8 400 Kč a nový Účet B.",
          },
          claims: [{ type: "requested_change_confirmed", channel: "saved_contact" }],
        },
        fraudulent: {
          key: "saved_contact_change_denied",
          body: {
            type: "reply",
            speaker: "Klára (uložený kontakt)",
            question: "Platí pro JAVOR-014 záloha 8 400 Kč na Účet B?",
            quote:
              "Ne, účet jsme neměnili. Pro JAVOR-014 dál platí Účet A. Na Účet B nic neposílej.",
          },
          claims: [{ type: "requested_change_denied", channel: "saved_contact" }],
        },
      },
      unreachableResponse: SAVED_CONTACT_UNREACHABLE,
    },
  ],
  sources: [
    {
      id: "email",
      title: "Nová zpráva od klara@javor.example",
      root: "incoming_request",
      mapPosition: { column: 0, row: 0 },
    },
    {
      id: "attachment",
      title: "Nová příloha",
      root: "incoming_request",
      derivedFrom: "email",
      relation: "Přiložena k nové zprávě",
      mapPosition: { column: 1, row: 0 },
    },
    {
      id: "colleague_reply",
      title: "Odpověď Adama",
      root: "incoming_request",
      derivedFrom: "email",
      relation: "Adam četl tutéž zprávu",
      mapPosition: { column: 1, row: 1 },
    },
    {
      id: "attachment_contact_reply",
      title: "Odpověď na čísle z přílohy",
      root: "incoming_request",
      derivedFrom: "attachment",
      relation: "Číslo převzaté z přílohy",
      mapPosition: { column: 2, row: 0 },
    },
    {
      id: "original_order",
      title: "Původní objednávka",
      root: "prior_record",
      mapPosition: { column: 0, row: 2 },
    },
    {
      id: "saved_contact_card",
      title: "Uložená kontaktní karta",
      root: "prior_record",
      mapPosition: { column: 0, row: 3 },
    },
    {
      id: "saved_contact_reply",
      title: "Hovor přes uložený kontakt",
      root: "prior_record",
      derivedFrom: "saved_contact_card",
      relation: "Číslo z uložené karty",
      mapPosition: { column: 1, row: 3 },
    },
  ],
  channels: {
    attachment_contact: { root: "incoming_request", label: "číslo z nové přílohy" },
    saved_contact: { root: "prior_record", label: "uložený kontakt" },
  },
  decisionOptions: [
    {
      decision: "approve",
      label: "Odsouhlasit nové údaje",
      description: "V simulaci pošleš zálohu 8 400 Kč na Účet B.",
    },
    {
      decision: "reject",
      label: "Odmítnout změnu",
      description: "Nové platební údaje nepřijmeš.",
    },
    {
      decision: "wait",
      label: "Zatím počkat",
      description: "Vyřízení odložíš, dokud nebudeš mít potřebný podklad.",
    },
  ],
  worlds: {
    legitimate: {
      name: "Klára účet opravdu změnila",
      sender: "Klára z Ateliéru Javor",
      truth: "Ateliér Javor změnil banku. Pro JAVOR-014 je nově oprávněným cílem Účet B.",
      outcomes: {
        approve: {
          status: "Požadavek vyřízen",
          consequence: "Záloha dorazila na Účet B. Klára potvrdí zítřejší dodání.",
        },
        reject: {
          status: "Změna odmítnuta",
          consequence:
            "Oprávněný požadavek zůstal nevyřízený. Záloha nedorazila a dodání zatím není potvrzené.",
        },
        wait: {
          status: "Čeká na ověření",
          consequence: "Platba zatím neodešla a dodání čeká, dokud se změna neověří.",
        },
      },
    },
    fraudulent: {
      name: "Schránka dodavatele je zneužitá",
      sender: "Útočník, který ovládl schránku klara@javor.example",
      truth:
        "Změnu poslal útočník ze zneužité schránky. Oprávněným cílem zůstává Účet A. Účet B patří útočníkovi.",
      outcomes: {
        approve: {
          status: "Provedena neoprávněná změna",
          consequence:
            "V simulaci odešlo 8 400 Kč na Účet B útočníka. Ateliér Javor zálohu nedostal.",
        },
        reject: {
          status: "Změna odmítnuta",
          consequence: "Neoprávněná změna se neprovedla. Peníze neodešly na Účet B.",
        },
        wait: {
          status: "Čeká na ověření",
          consequence: "Platba zatím neodešla a dodání čeká, dokud se změna neověří.",
        },
      },
    },
  },
  modelAssumption:
    "Simulace předpokládá, že kontakt uložený při původní objednávce útočník neovládá. Skutečná komunikace se dá zneužít i jinými způsoby, které tento výukový model nepokrývá.",
};
