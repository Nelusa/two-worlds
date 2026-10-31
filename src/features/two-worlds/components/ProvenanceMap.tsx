import { buildProvenance, ROOT_LABEL, type ProvenanceNode } from "../engine/provenance";
import type { CaseContent, Observation, Root } from "../engine/types";
import { typography } from "../utils/typography";
import { sourceCount } from "./presentation";

interface ProvenanceMapProps {
  content: CaseContent;
  observations: Observation[];
  /** After the reveal the map may explain what the shared origin meant. */
  revealed?: boolean;
  headingLevel?: "h2" | "h3";
  /** Side by side lanes on wide screens (reveal); stacked in the workspace margin. */
  wide?: boolean;
}

const ROOTS: Root[] = ["incoming_request", "prior_record"];

const EMPTY_NOTE: Record<Root, string> = {
  incoming_request: "",
  prior_record: "Zatím nic.",
};

const REVEAL_NOTE: Record<Root, string> = {
  incoming_request:
    "Všechno v této větvi pochází z jedné zprávy. Kolik potvrzení tu je, nehraje roli: v obou realitách by řekla totéž.",
  prior_record:
    "Tato cesta vznikla před příchodem zprávy, takže ji zpráva nemohla podstrčit. Rozhoduje teprve odpověď na konkrétní otázku položenou přes ni.",
};

function NodeText({ node }: { node: ProvenanceNode }) {
  return (
    <>
      <span className="ds-origin__name">{typography(node.title)}</span>
      {node.relation && <span className="ds-origin__how">{typography(node.relation)}</span>}
    </>
  );
}

/**
 * Nested list of the sources the player obtained, grouped by origin. The same list is the
 * drawing and its text equivalent: every link is also written out as a relation.
 */
function Branches({ node, nodes }: { node: ProvenanceNode; nodes: ProvenanceNode[] }) {
  const children = nodes.filter(({ derivedFrom }) => derivedFrom === node.id);
  if (children.length === 0) return null;
  return (
    <ul className="ds-origin">
      {children.map((child) => (
        <li key={child.id}>
          <NodeText node={child} />
          <Branches node={child} nodes={nodes} />
        </li>
      ))}
    </ul>
  );
}

export function ProvenanceMap({
  content,
  observations,
  revealed = false,
  headingLevel = "h2",
  wide = false,
}: ProvenanceMapProps) {
  const { nodes, groups } = buildProvenance(content, observations);
  const Heading = headingLevel;

  return (
    <section aria-labelledby={`provenance-${content.id}`} className="ds-section">
      <Heading id={`provenance-${content.id}`} className="ds-section__title mt-2">
        Mapa původu
      </Heading>
      <p className="mt-2 text-micro text-ink-3">jen podklady, které máš</p>
      <div className={wide ? "mt-4 grid gap-x-14 md:grid-cols-2" : "mt-2"}>
        {ROOTS.map((root) => {
          const sourceIds = groups.find((group) => group.root === root)?.sourceIds ?? [];
          const laneNodes = nodes.filter(({ id }) => sourceIds.includes(id));
          const tops = laneNodes.filter(
            ({ derivedFrom }) => !derivedFrom || !sourceIds.includes(derivedFrom),
          );
          const shared = root === "incoming_request" && laneNodes.length > 1;
          return (
            <div
              key={root}
              className={`py-4 not-first:border-t not-first:border-ink ${
                wide ? "md:not-first:border-t-0" : ""
              }`}
            >
              <p className="text-small font-bold">{ROOT_LABEL[root]}</p>
              <p className="font-display text-h4 leading-head font-extrabold tracking-display">
                {sourceCount(laneNodes.length)}
                {shared && ", jeden původ"}
              </p>
              {tops.map((node) => (
                <div key={node.id} className="mt-3 text-small">
                  <NodeText node={node} />
                  <Branches node={node} nodes={laneNodes} />
                </div>
              ))}
              {laneNodes.length === 0 && EMPTY_NOTE[root] && (
                <p className="mt-2 text-small text-ink-3">{EMPTY_NOTE[root]}</p>
              )}
              {revealed && laneNodes.length > 0 && (
                <p className="mt-4 text-small leading-body text-ink-2">{REVEAL_NOTE[root]}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
