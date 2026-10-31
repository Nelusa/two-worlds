import { CASES } from "../content";
import { describeOutcome } from "../engine/assessment";
import type { DecisionRecord } from "../engine/game";
import { observeAll } from "../engine/scenario";
import { typography } from "../utils/typography";
import { GroundingCard } from "./GroundingCard";
import { Icon } from "./Icon";
import { StageHeader } from "./StageHeader";
import { TEXT_BUTTON } from "./styles";
import { WORLD_PLATE, WorldBadge } from "./WorldBadge";

interface PracticeResultProps {
  record: DecisionRecord;
  onProcedure: () => void;
  onBack: () => void;
}

export function PracticeResult({ record, onProcedure, onBack }: PracticeResultProps) {
  const content = CASES[record.caseId];
  const { world } = record.setup;
  const outcome = describeOutcome(content, world, record.decision);
  const decisionLabel =
    content.decisionOptions.find(({ decision }) => decision === record.decision)?.label ?? "";

  return (
    <div>
      <StageHeader
        kicker={`${content.kicker} · Procvičování`}
        title="Výsledek větve"
        lead={<p>Procvičování se ukládá zvlášť. První pokus zůstává, jak byl.</p>}
      />
      <div className="ds-container grid gap-12 pt-12 pb-24 lg:grid-cols-2 lg:gap-14">
        <div className={`pt-4 ${WORLD_PLATE[world].rule}`}>
          <WorldBadge world={world} />
          <p className="mt-2 font-display text-h3 leading-head font-bold tracking-display">
            {content.worlds[world].name}
          </p>
          <p className="mt-6 text-small text-ink-2">Rozhodnutí: {decisionLabel}</p>
          <p className="mt-1 font-display text-h4 leading-head font-extrabold">{outcome.status}</p>
          <p className="mt-2 max-w-120 leading-body">{typography(outcome.consequence)}</p>
        </div>
        <div className="border-section pt-4">
          <GroundingCard
            content={content}
            observations={observeAll(content, record.actions, record.setup)}
            decision={record.decision}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-ink pt-8 sm:flex-row sm:items-center sm:gap-6 lg:col-span-2">
          <button type="button" className="ds-btn" onClick={onProcedure}>
            Sestavit vlastní postup
            <Icon name="arrow" />
          </button>
          <button type="button" className={TEXT_BUTTON} onClick={onBack}>
            Zpět na dvě reality
          </button>
        </div>
      </div>
    </div>
  );
}
