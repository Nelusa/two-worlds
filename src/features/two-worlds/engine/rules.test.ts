import { describe, expect, it } from "vitest";
import { CASES } from "../content";
import { assessGrounding, outcomeKind, summarizeEvidence } from "./assessment";
import { buildProvenance } from "./provenance";
import { inheritedActions, replayAttempt, runProcedure } from "./replay";
import { setupFromSeed } from "./rng";
import { initialMessage, observe, observeAll, performAction } from "./scenario";
import type {
  ActionId,
  CaseContent,
  ContactAvailability,
  Decision,
  EveningActionId,
  WorldId,
} from "./types";

const evening = CASES.evening;
const handover = CASES.handover;
const WORLDS: WorldId[] = ["legitimate", "fraudulent"];
const AVAILABILITY: ContactAvailability[] = ["available", "unreachable"];
const DECISIONS: Decision[] = ["approve", "reject", "wait"];

const keysIn = (content: CaseContent, world: WorldId, savedContact: ContactAvailability) =>
  content.actions.map(({ id }) => observe(content, id, { world, savedContact }).response.key);

const evidenceOf = (
  content: CaseContent,
  actions: ActionId[],
  world: WorldId,
  savedContact: ContactAvailability = "available",
) => summarizeEvidence(content, observeAll(content, actions, { world, savedContact }));

/** Every ordered subset is too many; all subsets in canonical order cover every evidence set. */
const subsets = <T>(items: readonly T[]): T[][] =>
  items.reduce<T[][]>((acc, item) => [...acc, ...acc.map((subset) => [...subset, item])], [[]]);

describe("1. initial public observation", () => {
  it("contains nothing from either world's hidden story", () => {
    [evening, handover].forEach((content) =>
      content.variants.forEach(({ id }) => {
        const message = JSON.stringify(initialMessage(content, id));
        WORLDS.forEach((world) => {
          const { name, sender, truth } = content.worlds[world];
          [name, sender, truth].forEach((hidden) => expect(message).not.toContain(hidden));
        });
        ["útoční", "zneužit", "Účet A", "Místo A"].forEach((hint) =>
          expect(message).not.toContain(hint),
        );
      }),
    );
  });

  it("gives every public answer the same text in both worlds before the specific check", () => {
    [evening, handover].forEach((content) =>
      content.actions
        .filter(({ id }) => !["saved_contact_change", "original_contact_change"].includes(id))
        .forEach(({ id }) =>
          expect(observe(content, id, { world: "legitimate", savedContact: "available" })).toEqual(
            observe(content, id, { world: "fraudulent", savedContact: "available" }),
          ),
        ),
    );
  });

  it("keeps every fact in both language variants", () => {
    evening.variants.forEach(({ paragraphs }) => {
      const text = paragraphs.join(" ");
      ["8 400 Kč", "JAVOR-014", "příloze", "dnes"].forEach((fact) => expect(text).toContain(fact));
    });
  });

  it("draws world and variant independently from the seed", () => {
    const setups = Array.from({ length: 4000 }, (_, seed) => setupFromSeed("evening", seed));
    WORLDS.forEach((world) =>
      ["v1", "v2"].forEach((variantId) => {
        const share =
          setups.filter((s) => s.world === world && s.variantId === variantId).length /
          setups.length;
        expect(share).toBeGreaterThan(0.2);
        expect(share).toBeLessThan(0.3);
      }),
    );
    expect(setups.every((s) => s.savedContact === "available")).toBe(true);
    expect(setupFromSeed("evening", 42)).toEqual(setupFromSeed("evening", 42));
  });

  it("makes transfer contact availability independent of the world", () => {
    const setups = Array.from({ length: 6000 }, (_, seed) => setupFromSeed("handover", seed));
    WORLDS.forEach((world) => {
      const inWorld = setups.filter((s) => s.world === world);
      const unreachable = inWorld.filter((s) => s.savedContact === "unreachable").length;
      expect(unreachable / inWorld.length).toBeGreaterThan(0.28);
      expect(unreachable / inWorld.length).toBeLessThan(0.39);
    });
  });
});

describe("2. sources from the incoming request", () => {
  const fromRequest: EveningActionId[] = [
    "open_attachment",
    "ask_colleague",
    "call_attachment_contact",
  ];

  it("give the same answers in both worlds", () => {
    fromRequest.forEach((actionId) =>
      expect(
        observe(evening, actionId, { world: "legitimate", savedContact: "available" }),
      ).toEqual(observe(evening, actionId, { world: "fraudulent", savedContact: "available" })),
    );
  });

  it("are three sources with one origin, not three independent confirmations", () => {
    WORLDS.forEach((world) => {
      const evidence = evidenceOf(evening, fromRequest, world);
      expect(evidence.requestOriginSources).toEqual([
        "attachment",
        "colleague_reply",
        "attachment_contact_reply",
      ]);
      expect(evidence.independentCheck).toBe("not_checked");
      expect(assessGrounding(evidence, "approve")).toBe("unsupported_approval");
    });
    const provenance = buildProvenance(
      evening,
      observeAll(evening, fromRequest, { world: "legitimate", savedContact: "available" }),
    );
    expect(provenance.groups).toEqual([
      {
        root: "incoming_request",
        sourceIds: ["email", "attachment", "colleague_reply", "attachment_contact_reply"],
      },
    ]);
  });

  it("apply the same rule to the transfer case", () => {
    const evidence = evidenceOf(
      handover,
      ["open_forwarded_confirmation", "call_new_contact"],
      "fraudulent",
    );
    expect(evidence.requestOriginSources).toHaveLength(2);
    expect(evidence.independentCheck).toBe("not_checked");
  });
});

describe("3. original order", () => {
  it("shows the previous target but decides nothing about the change", () => {
    WORLDS.forEach((world) => {
      const evidence = evidenceOf(evening, ["open_original_order"], world);
      expect(evidence.previousTargetSeen).toBe(true);
      expect(evidence.independentCheck).toBe("not_checked");
      expect(assessGrounding(evidence, "reject")).toBe("unsupported_rejection");
      expect(assessGrounding(evidence, "approve")).toBe("unsupported_approval");
    });
  });
});

describe("4. identity only", () => {
  it("does not verify the specific request", () => {
    WORLDS.forEach((world) => {
      const evidence = evidenceOf(evening, ["open_saved_contact", "saved_contact_identity"], world);
      expect(evidence.identityOnly).toBe(true);
      expect(evidence.independentCheck).toBe("not_checked");
      expect(assessGrounding(evidence, "approve")).toBe("unsupported_approval");
    });
  });

  it("opening the saved card alone confirms nothing", () => {
    const evidence = evidenceOf(evening, ["open_saved_contact"], "legitimate");
    expect(evidence.independentChannelFound).toBe(true);
    expect(evidence.independentCheck).toBe("not_checked");
  });
});

describe("5. specific check over the saved channel", () => {
  it.each(evening.variants.map(({ id }) => id))("answers correctly in both worlds (%s)", () => {
    const actions: ActionId[] = ["open_saved_contact", "saved_contact_change"];
    expect(evidenceOf(evening, actions, "legitimate").independentCheck).toBe("confirmed");
    expect(evidenceOf(evening, actions, "fraudulent").independentCheck).toBe("denied");
    expect(assessGrounding(evidenceOf(evening, actions, "legitimate"), "approve")).toBe(
      "supported_approval",
    );
    expect(assessGrounding(evidenceOf(evening, actions, "fraudulent"), "reject")).toBe(
      "supported_rejection",
    );
  });

  it("checks place and handover number in the transfer case", () => {
    const actions: ActionId[] = ["open_original_confirmation", "original_contact_change"];
    expect(evidenceOf(handover, actions, "legitimate").independentCheck).toBe("confirmed");
    expect(evidenceOf(handover, actions, "fraudulent").independentCheck).toBe("denied");
  });

  it("requires the saved card before calling it", () => {
    expect(performAction(evening, [], "saved_contact_change")).toEqual([]);
    expect(performAction(evening, [], "call_attachment_contact")).toEqual([]);
    expect(performAction(handover, [], "original_contact_change")).toEqual([]);
  });
});

describe("6. unreachable saved contact", () => {
  it.each([evening, handover])(
    "adds no confirmation and does not signal fraud ($id)",
    (content) => {
      expect(keysIn(content, "legitimate", "unreachable")).toEqual(
        keysIn(content, "fraudulent", "unreachable"),
      );
      const all = content.actions.map(({ id }) => id);
      WORLDS.forEach((world) => {
        const evidence = evidenceOf(content, all, world, "unreachable");
        expect(evidence.independentCheck).toBe("unreachable");
        expect(assessGrounding(evidence, "wait")).toBe("reasonable_wait");
        expect(assessGrounding(evidence, "reject")).toBe("unsupported_rejection");
      });
      const replay = replayAttempt(content, all, "fraudulent", "unreachable");
      expect(replay.divergenceIndex).toBeNull();
    },
  );

  it("is a separate condition: availability never changes which world is drawn", () => {
    AVAILABILITY.forEach((savedContact) =>
      WORLDS.forEach((world) =>
        expect(observe(evening, "open_attachment", { world, savedContact }).response.key).toBe(
          "attachment_contents",
        ),
      ),
    );
  });
});

describe("7. grounding depends on evidence, outcome on the world", () => {
  it("gives the same grounding for every identical evidence set in both worlds", () => {
    [evening, handover].forEach((content) =>
      AVAILABILITY.forEach((savedContact) =>
        subsets(content.actions.map(({ id }) => id)).forEach((actions) => {
          const legit = observeAll(content, actions, { world: "legitimate", savedContact });
          const fraud = observeAll(content, actions, { world: "fraudulent", savedContact });
          const sameEvidence = legit.every(
            (obs, index) => obs.response.key === fraud[index].response.key,
          );
          if (!sameEvidence) return;
          DECISIONS.forEach((decision) =>
            expect(assessGrounding(summarizeEvidence(content, legit), decision)).toBe(
              assessGrounding(summarizeEvidence(content, fraud), decision),
            ),
          );
        }),
      ),
    );
  });

  it("lets the consequences differ", () => {
    expect(outcomeKind("legitimate", "approve")).toBe("request_fulfilled");
    expect(outcomeKind("fraudulent", "approve")).toBe("unauthorized_change");
    expect(outcomeKind("legitimate", "reject")).toBe("legitimate_unresolved");
    expect(outcomeKind("fraudulent", "reject")).toBe("fraud_blocked");
    expect(outcomeKind("legitimate", "wait")).toBe(outcomeKind("fraudulent", "wait"));
  });
});

describe("8. lucky unverified approval", () => {
  it("fulfils the request but is not a well-grounded procedure", () => {
    const evidence = evidenceOf(
      evening,
      ["open_attachment", "call_attachment_contact"],
      "legitimate",
    );
    expect(outcomeKind("legitimate", "approve")).toBe("request_fulfilled");
    expect(assessGrounding(evidence, "approve")).toBe("unsupported_approval");
  });
});

describe("9. replay stops at the first different answer", () => {
  const actions: ActionId[] = [
    "open_attachment",
    "open_saved_contact",
    "saved_contact_change",
    "open_original_order",
  ];

  it.each(WORLDS)("keeps the played world whole and cuts the other one (%s)", (played) => {
    const replay = replayAttempt(evening, actions, played, "available");
    const other: WorldId = played === "legitimate" ? "fraudulent" : "legitimate";
    expect(replay.divergenceIndex).toBe(2);
    expect(replay.rows.map((row) => row[played] !== null)).toEqual([true, true, true, true]);
    expect(replay.rows.map((row) => row[other] !== null)).toEqual([true, true, true, false]);
    expect(replay.rows.map(({ same }) => same)).toEqual([true, true, false, false]);
    expect(inheritedActions(replay, actions)).toEqual(actions.slice(0, 3));
  });

  it("shows the same choice in both worlds when no answer differs", () => {
    const replay = replayAttempt(
      evening,
      ["open_attachment", "ask_colleague", "open_saved_contact", "saved_contact_identity"],
      "legitimate",
      "available",
    );
    expect(replay.divergenceIndex).toBeNull();
    expect(replay.rows.every((row) => row.legitimate && row.fraudulent && row.same)).toBe(true);
  });

  it("runs a procedure in both worlds and marks the split", () => {
    const replay = runProcedure(
      evening,
      ["open_saved_contact", "saved_contact_identity", "saved_contact_change"],
      "available",
    );
    expect(replay.divergenceIndex).toBe(2);
    expect(replay.rows.filter(({ divergent }) => divergent)).toHaveLength(1);
  });
});

describe("11. repeated viewing", () => {
  it("does not create new sources or new log entries", () => {
    const once = performAction(evening, [], "open_attachment");
    const twice = performAction(evening, once, "open_attachment");
    expect(twice).toEqual(["open_attachment"]);
    const withCall = [
      "open_saved_contact",
      "saved_contact_identity",
      "saved_contact_change",
    ].reduce<ActionId[]>((done, id) => performAction(evening, done, id as ActionId), []);
    const provenance = buildProvenance(
      evening,
      observeAll(evening, withCall, { world: "legitimate", savedContact: "available" }),
    );
    expect(provenance.nodes.filter(({ id }) => id === "saved_contact_reply")).toHaveLength(1);
  });

  it("does not count two answers in one call as two independent sources", () => {
    const evidence = evidenceOf(
      evening,
      ["open_saved_contact", "saved_contact_identity", "saved_contact_change"],
      "legitimate",
    );
    expect(evidence.independentCheck).toBe("confirmed");
    expect(evidence.requestOriginSources).toEqual([]);
  });
});
