import type { Replay } from "../engine/replay";
import { getAction } from "../engine/scenario";
import type { Body, CaseContent, Observation, WorldId } from "../engine/types";
import { typography } from "../utils/typography";
import { reveal } from "./useRevealChoreography";
import { WORLD_PLATE, WorldBadge, WORLDS } from "./WorldBadge";

interface ComparisonGridProps {
  content: CaseContent;
  replay: Replay;
  /** The world the attempt was played in; null for a procedure that runs fully in both. */
  playedWorld: WorldId | null;
}

const PRINT_STEP = 200;

function Answer({ body, large = false }: { body: Body; large?: boolean }) {
  const text =
    body.type === "reply" ? `„${body.quote}“` : body.type === "status" ? body.text : body.heading;
  return (
    <>
      <p
        className={
          large
            ? "font-display text-h4 leading-head font-bold tracking-display sm:text-h3"
            : "font-bold"
        }
      >
        {typography(text)}
      </p>
      {body.type === "reply" && <p className="mt-1 text-small text-ink-3">{body.speaker}</p>}
    </>
  );
}

function Cell({
  world,
  observation,
  stopped,
  played,
}: {
  world: WorldId;
  observation: Observation | null;
  stopped: "first" | "later" | null;
  played: boolean;
}) {
  const plate = WORLD_PLATE[world];
  return (
    <div
      className={`border-t-2 px-5 pt-4 pb-6 ${
        world === "legitimate" ? "border-plate-1" : "border-plate-2"
      } ${observation ? plate.wash : ""}`}
    >
      <WorldBadge world={world} short suffix={played ? "tvůj pokus" : undefined} />
      {observation ? (
        <div className="mt-3">
          <Answer body={observation.response.body} large />
        </div>
      ) : (
        <p className="mt-3 text-small text-ink-2">
          {stopped === "first"
            ? "Přehrání se tady zastavilo. Po jiné odpovědi by další kroky byly nová rozhodnutí, ne ta tvoje."
            : "Nepřehráno"}
        </p>
      )}
    </div>
  );
}

/**
 * Row by row comparison along the seam. While the answers match, one row spans both realities;
 * at the first different answer the row splits and both cells print at the same moment.
 */
export function ComparisonGrid({ content, replay, playedWorld }: ComparisonGridProps) {
  const stoppedIndex = replay.divergenceIndex === null ? null : replay.divergenceIndex + 1;
  const splitAt = replay.divergenceIndex ?? replay.rows.length;
  const splitDelay = splitAt * PRINT_STEP + 100;

  return (
    <div>
      <div aria-hidden="true" className="hidden border-b-2 border-ink pb-3 sm:grid sm:grid-compare">
        {WORLDS.map((world) => (
          <WorldBadge key={world} world={world} short />
        ))}
      </div>
      <ol>
        {replay.rows.map((row, index) => {
          const action = getAction(content, row.actionId);
          const stopped =
            stoppedIndex === null || index < stoppedIndex
              ? null
              : index === stoppedIndex
                ? "first"
                : "later";
          const shared = row.same ? row.legitimate : null;
          const delay = index < splitAt ? index * PRINT_STEP : splitDelay + 300;
          const number = (
            <span
              aria-hidden="true"
              className="font-display text-h3 leading-tight font-extrabold sm:text-h2"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          );
          const label = (
            <p className="font-mono text-meta text-ink-3">
              <span className="sr-only">Úkon {index + 1}: </span>
              {typography(action.shortLabel.toLowerCase())}
            </p>
          );
          return (
            <li key={row.actionId}>
              {row.divergent && (
                <div {...reveal("fade", splitDelay)} className="relative py-6 text-center">
                  <span aria-hidden="true" className="ds-seam max-sm:hidden" />
                  <p className="ds-label-dark relative">Tady se získané informace rozcházejí</p>
                </div>
              )}
              {shared ? (
                <div
                  {...reveal("print", delay)}
                  className="grid grid-step gap-x-4 gap-y-3 border-b border-ink py-5 sm:grid-step-wide"
                >
                  {number}
                  <div>
                    {label}
                    <div className="mt-1">
                      <Answer body={shared.response.body} />
                    </div>
                  </div>
                  <p className="ds-same col-start-2 sm:col-start-3">Stejně v obou realitách</p>
                </div>
              ) : (
                <div className="border-b border-ink">
                  <div className="flex items-baseline gap-4 py-4">
                    {number}
                    {label}
                  </div>
                  <div {...reveal("print", delay)} className="grid sm:grid-compare">
                    {WORLDS.map((world) => (
                      <Cell
                        key={world}
                        world={world}
                        observation={row[world]}
                        stopped={world === playedWorld ? null : stopped}
                        played={world === playedWorld}
                      />
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
