import type { ReactNode } from "react";
import type { Body, Field, MessageVariant } from "../engine/types";
import { typography } from "../utils/typography";
import { Icon } from "./Icon";

const PHONE = /(\d{3} \d{3} \d{3})/;

/** Phone numbers are set in the mono face, the rest of the value as running text. */
function FieldValue({ value }: { value: string }) {
  return value.split(PHONE).map((part, index) =>
    PHONE.test(part) ? (
      <b key={index} className="font-mono font-medium">
        {part}
      </b>
    ) : (
      typography(part)
    ),
  );
}

/** Label and value rows of a form; the first rule is the thick one unless the sheet already has it. */
export function FieldRows({ fields, thin = false }: { fields: Field[]; thin?: boolean }) {
  return (
    <dl className={`ds-fields ${thin ? "border-t" : ""}`}>
      {fields.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <FieldValue value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A document or a saved contact card opened on the sheet. */
export function RecordView({
  heading,
  fields,
  contact = false,
}: {
  heading: string;
  fields: Field[];
  contact?: boolean;
}) {
  return (
    <div className="border-section">
      <p className="flex items-center gap-3 py-4 font-display text-h4 leading-head font-bold">
        {contact && <Icon name="contactCard" />}
        {typography(heading)}
      </p>
      <FieldRows fields={fields} thin />
    </div>
  );
}

function Quote({ quote, speaker }: { quote: string; speaker: string }) {
  return (
    <figure>
      <blockquote className="font-bold">„{typography(quote)}“</blockquote>
      <figcaption className="text-small text-ink-3">{speaker}</figcaption>
    </figure>
  );
}

/** Compact rendering used in the comparison and the summaries. */
export function BodyView({ body }: { body: Body }) {
  switch (body.type) {
    case "document":
    case "contact_card":
      return <p className="font-bold">{typography(body.heading)}</p>;
    case "reply":
      return <Quote quote={body.quote} speaker={body.speaker} />;
    case "status":
      return <p className="font-bold">{typography(body.text)}</p>;
  }
}

interface MessageViewProps {
  message: MessageVariant;
  storyTime: string;
  /** Heading element for the subject; the workspace makes it the sheet title. */
  subject: (text: string) => ReactNode;
  attachment?: ReactNode;
}

/** The incoming e-mail: sender rows, subject, body and the attachment line. */
export function MessageView({ message, storyTime, subject, attachment }: MessageViewProps) {
  return (
    <>
      <dl className="grid grid-label gap-x-3 gap-y-1 border-section pt-4">
        <dt className="text-ink-3">Od</dt>
        <dd className="min-w-0 break-words">
          <b>{message.from}</b> &lt;{message.address}&gt;
        </dd>
        <dt className="text-ink-3">Přijato</dt>
        <dd>{storyTime}</dd>
      </dl>
      <div className="mt-4 border-t border-ink pt-6">
        {subject(typography(message.subject))}
        <div className="space-y-4 text-body-lg leading-body">
          {message.paragraphs.map((paragraph) => (
            <p key={paragraph}>{typography(paragraph)}</p>
          ))}
          <p>{typography(message.signature)}</p>
        </div>
      </div>
      {message.attachmentName && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-5">
          <p className="flex items-center gap-3">
            <Icon name="attachment" />
            <span>
              <span className="block font-mono text-micro text-ink-3">příloha</span>
              <b>{message.attachmentName}</b>
            </span>
          </p>
          {attachment}
        </div>
      )}
    </>
  );
}
