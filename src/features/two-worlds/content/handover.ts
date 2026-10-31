import type { CaseContent, Response } from "../engine/types";

const ORIGINAL_CONTACT_UNREACHABLE: Response = {
  key: "original_contact_unreachable",
  body: {
    type: "status",
    question: "Volání na dispečink z původního potvrzení",
    text: "Na dispečink se zatím nepodařilo dovolat. Linka je obsazená.",
  },
  claims: [{ type: "contact_unreachable", channel: "original_contact" }],
};

export const HANDOVER_CASE: CaseContent = {
  id: "handover",
  title: "Poslední změna před předáním",
  kicker: "Případ 2",
  storyTime: "Dnes 18:05",
  clockNote: "Vyzvednutí zítra v 9:00",
  context:
    "Dopravce Lipka má zítra v 9:00 vyzvednout zapůjčené ozvučení na Místě A. Než odejdeš domů, přijde zpráva.",
  changeLabel: "vyzvednutí PREDANI-026 na Místě B",
  variants: [
    {
      id: "v1",
      from: "Dispečink Lipka",
      address: "dispecink@lipka.example",
      subject: "PREDANI-026: změna místa vyzvednutí",
      paragraphs: [
        "Dobrý den, k předání PREDANI-026: kvůli uzavírce se vyzvednutí přesouvá na Místo B, čas zůstává 9:00. Vybavení tam prosím nechte připravené u vchodu.",
        "Pro dotazy volejte řidiče na čísle 000 222 333 (simulované).",
      ],
      signature: "Děkujeme, dispečink Lipka",
    },
  ],
  panels: [
    {
      id: "message",
      title: "Nová zpráva",
      originLabel: "Příchozí e-mail, Dnes 18:05",
      kind: "message",
      questions: [],
    },
    {
      id: "new_contact",
      title: "Řidič, číslo ze zprávy",
      originLabel: "Kontakt uvedený v nové zprávě",
      kind: "contact",
      questions: ["call_new_contact"],
    },
    {
      id: "forwarded_confirmation",
      title: "Přeposlané potvrzení od Jany",
      originLabel: "Jana z výboru přeposlala zprávu",
      kind: "document",
      openAction: "open_forwarded_confirmation",
      questions: [],
    },
    {
      id: "original_contact",
      title: "Dispečink z původního potvrzení",
      originLabel: "Kontakt uvedený v původním potvrzení dopravy",
      kind: "contact",
      questions: ["original_contact_change", "original_contact_identity"],
      requires: "open_original_confirmation",
      requiresHint: "Číslo dispečinku je v původním potvrzení dopravy. Nejprve ho otevři.",
    },
    {
      id: "original_confirmation",
      title: "Původní potvrzení dopravy",
      originLabel: "Přišlo při objednání dopravy, minulý týden",
      kind: "document",
      openAction: "open_original_confirmation",
      questions: [],
    },
  ],
  actions: [
    {
      id: "call_new_contact",
      panelId: "new_contact",
      label: "Zavolat řidiči na číslo ze zprávy a zeptat se, jestli platí Místo B",
      shortLabel: "Zavolat na číslo ze zprávy",
      sourceId: "new_contact_reply",
      channel: "new_contact",
      procedureStep: true,
      response: {
        key: "new_contact_confirms",
        body: {
          type: "reply",
          speaker: "Hlas na čísle ze zprávy",
          question: "Platí pro PREDANI-026 vyzvednutí na Místě B?",
          quote: "Jo, platí Místo B v devět. Předání PREDANI-026, vybavení nechte u vchodu.",
        },
        claims: [{ type: "requested_change_confirmed", channel: "new_contact" }],
      },
    },
    {
      id: "open_forwarded_confirmation",
      panelId: "forwarded_confirmation",
      label: "Otevřít přeposlanou zprávu od Jany",
      shortLabel: "Otevřít přeposlanou zprávu",
      sourceId: "forwarded_confirmation",
      procedureStep: true,
      response: {
        key: "forwarded_same_message",
        body: {
          type: "document",
          heading: "Fwd: PREDANI-026: změna místa vyzvednutí",
          fields: [
            { label: "Přeposlala", value: "Jana z výboru" },
            { label: "Původní odesílatel", value: "dispecink@lipka.example" },
            { label: "Předání", value: "PREDANI-026" },
            { label: "Místo", value: "Místo B" },
            { label: "Jana píše", value: "Přišlo mi to taky, takže zítra Místo B?" },
          ],
        },
        claims: [{ type: "repeats_request", sourceId: "forwarded_confirmation" }],
      },
    },
    {
      id: "original_contact_change",
      panelId: "original_contact",
      label: "Zavolat na dispečink a zeptat se: platí pro PREDANI-026 vyzvednutí na Místě B?",
      shortLabel: "Přes původní kontakt ověřit místo a číslo předání",
      sourceId: "original_contact_reply",
      requires: "open_original_confirmation",
      requiresHint: "Číslo dispečinku je v původním potvrzení dopravy. Nejprve ho otevři.",
      channel: "original_contact",
      procedureStep: true,
      response: {
        legitimate: {
          key: "original_contact_change_confirmed",
          body: {
            type: "reply",
            speaker: "Dispečink Lipka (původní kontakt)",
            question: "Platí pro PREDANI-026 vyzvednutí na Místě B?",
            quote: "Ano, PREDANI-026 vyzvedneme zítra v 9:00 na Místě B. Změnu jsme posílali my.",
          },
          claims: [{ type: "requested_change_confirmed", channel: "original_contact" }],
        },
        fraudulent: {
          key: "original_contact_change_denied",
          body: {
            type: "reply",
            speaker: "Dispečink Lipka (původní kontakt)",
            question: "Platí pro PREDANI-026 vyzvednutí na Místě B?",
            quote:
              "Ne, nic jsme neměnili. PREDANI-026 vyzvedneme na Místě A, jak bylo domluveno. Na Místě B nikomu nic nepředávejte.",
          },
          claims: [{ type: "requested_change_denied", channel: "original_contact" }],
        },
      },
      unreachableResponse: ORIGINAL_CONTACT_UNREACHABLE,
    },
    {
      id: "original_contact_identity",
      panelId: "original_contact",
      label: "Zavolat na dispečink a ověřit, s kým mluvím",
      shortLabel: "Přes původní kontakt ověřit totožnost",
      sourceId: "original_contact_reply",
      requires: "open_original_confirmation",
      requiresHint: "Číslo dispečinku je v původním potvrzení dopravy. Nejprve ho otevři.",
      channel: "original_contact",
      procedureStep: true,
      response: {
        key: "original_contact_identity",
        body: {
          type: "reply",
          speaker: "Dispečink Lipka (původní kontakt)",
          question: "Volám na dispečink dopravce Lipka?",
          quote: "Ano, dispečink Lipka, u telefonu Tomáš.",
        },
        claims: [{ type: "identity_confirmed", channel: "original_contact" }],
      },
      unreachableResponse: ORIGINAL_CONTACT_UNREACHABLE,
    },
    {
      id: "open_original_confirmation",
      panelId: "original_confirmation",
      label: "Otevřít původní potvrzení dopravy",
      shortLabel: "Otevřít původní potvrzení dopravy",
      sourceId: "original_confirmation",
      procedureStep: true,
      response: {
        key: "original_confirmation_contents",
        body: {
          type: "document",
          heading: "Potvrzení dopravy PREDANI-026",
          fields: [
            { label: "Dopravce", value: "Lipka" },
            { label: "Vyzvednutí", value: "Zítra 9:00" },
            { label: "Místo", value: "Místo A" },
            { label: "Dispečink", value: "Tel. 000 444 555 (simulovaný)" },
          ],
        },
        claims: [
          { type: "previous_target", sourceId: "original_confirmation", value: "Místo A" },
          { type: "channel_identified", channel: "original_contact" },
        ],
      },
    },
  ],
  sources: [
    {
      id: "handover_message",
      title: "Nová zpráva od dispecink@lipka.example",
      root: "incoming_request",
      mapPosition: { column: 0, row: 0 },
    },
    {
      id: "forwarded_confirmation",
      title: "Přeposlaná zpráva od Jany",
      root: "incoming_request",
      derivedFrom: "handover_message",
      relation: "Jana přeposlala tutéž zprávu",
      mapPosition: { column: 1, row: 0 },
    },
    {
      id: "new_contact_reply",
      title: "Odpověď na čísle ze zprávy",
      root: "incoming_request",
      derivedFrom: "handover_message",
      relation: "Číslo převzaté z nové zprávy",
      mapPosition: { column: 1, row: 1 },
    },
    {
      id: "original_confirmation",
      title: "Původní potvrzení dopravy",
      root: "prior_record",
      mapPosition: { column: 0, row: 2 },
    },
    {
      id: "original_contact_reply",
      title: "Hovor přes původní kontakt",
      root: "prior_record",
      derivedFrom: "original_confirmation",
      relation: "Číslo z původního potvrzení",
      mapPosition: { column: 1, row: 2 },
    },
  ],
  channels: {
    new_contact: { root: "incoming_request", label: "číslo z nové zprávy" },
    original_contact: { root: "prior_record", label: "kontakt z původního potvrzení" },
  },
  decisionOptions: [
    {
      decision: "reject",
      label: "Trvat na Místě A",
      description: "Změnu místa nepřijmeš, vybavení zůstane na Místě A.",
    },
    {
      decision: "wait",
      label: "Zatím počkat",
      description: "Předání odložíš, dokud nebudeš mít potřebný podklad.",
    },
    {
      decision: "approve",
      label: "Přijmout Místo B",
      description: "V simulaci necháš vybavení připravené na Místě B.",
    },
  ],
  worlds: {
    legitimate: {
      name: "Dopravce místo opravdu změnil",
      sender: "Dispečink dopravce Lipka",
      truth: "Kvůli uzavírce dopravce přesunul vyzvednutí. Pro PREDANI-026 platí Místo B.",
      outcomes: {
        approve: {
          status: "Požadavek vyřízen",
          consequence: "Vybavení čekalo na Místě B a dopravce ho v 9:00 převzal.",
        },
        reject: {
          status: "Změna odmítnuta",
          consequence:
            "Vybavení zůstalo na Místě A, dopravce ale přijel na Místo B. Předání se nepovedlo.",
        },
        wait: {
          status: "Čeká na ověření",
          consequence: "Vybavení zatím zůstává u tebe. Předání se domluví, až bude změna ověřená.",
        },
      },
    },
    fraudulent: {
      name: "Někdo se snaží převzít vybavení",
      sender: "Cizí člověk, který zneužil schránku dispečinku",
      truth:
        "Zprávu poslal někdo přes zneužitou schránku dispečinku. Dopravce přijede na Místo A. Na Místě B by vybavení převzal cizí člověk.",
      outcomes: {
        approve: {
          status: "Provedena neoprávněná změna",
          consequence:
            "Vybavení zůstalo na Místě B a odvezl ho cizí člověk. Dopravce přijel na Místo A zbytečně.",
        },
        reject: {
          status: "Změna odmítnuta",
          consequence: "Vybavení zůstalo na Místě A a dopravce ho převzal podle původní domluvy.",
        },
        wait: {
          status: "Čeká na ověření",
          consequence: "Vybavení zatím zůstává u tebe. Předání se domluví, až bude změna ověřená.",
        },
      },
    },
  },
  modelAssumption:
    "Simulace předpokládá, že kontakt z původního potvrzení dopravy útočník neovládá. Skutečná komunikace se dá zneužít i jinými způsoby, které tento výukový model nepokrývá.",
};
