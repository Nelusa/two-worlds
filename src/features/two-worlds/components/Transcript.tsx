import type { ActionDef, Body } from "../engine/types";
import { typography } from "../utils/typography";

/** One question and its answer, set like a transcript: the role on the left, what was said on the right. */
export function TranscriptEntry({ body, differs = false }: { body: Body; differs?: boolean }) {
  if (body.type !== "reply" && body.type !== "status") return null;
  return (
    <div className="ds-transcript">
      <span className="ds-transcript__k">otázka</span>
      <p>{typography(body.question)}</p>
      <span className="ds-transcript__k">{body.type === "reply" ? "odpověď" : "výsledek"}</span>
      <div>
        {differs && <p className="mb-1 text-small font-bold">Jiná odpověď než v tvém pokusu</p>}
        {body.type === "reply" ? (
          <figure>
            <blockquote className="ds-transcript__answer">„{typography(body.quote)}“</blockquote>
            <figcaption className="ds-transcript__who">{body.speaker}</figcaption>
          </figure>
        ) : (
          <p className="ds-transcript__answer">{typography(body.text)}</p>
        )}
      </div>
    </div>
  );
}

interface QuestionButtonProps {
  action: ActionDef;
  missingHint: string | null;
  onAsk: () => void;
}

/**
 * A question the player can ask; the accessible name is the full question label. An unavailable
 * question stays focusable (aria-disabled) and says why next to it.
 */
export function QuestionButton({ action, missingHint, onAsk }: QuestionButtonProps) {
  const hintId = `${action.id}-hint`;
  return (
    <div>
      <button
        type="button"
        data-question
        aria-disabled={missingHint ? "true" : undefined}
        aria-describedby={missingHint ? hintId : undefined}
        onClick={missingHint ? undefined : onAsk}
        className="ds-btn ds-btn--secondary ds-btn--question w-full sm:w-auto"
      >
        {typography(action.label)}
      </button>
      {missingHint && (
        <p id={hintId} className="mt-2 text-small text-ink-3">
          {typography(missingHint)}
        </p>
      )}
    </div>
  );
}
