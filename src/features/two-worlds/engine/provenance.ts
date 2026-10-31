import type { CaseContent, Observation, Root, SourceDef, SourceId } from "./types";

export type ProvenanceNode = SourceDef;

export interface Provenance {
  nodes: ProvenanceNode[];
  /** Sources grouped by where they ultimately come from. */
  groups: { root: Root; sourceIds: SourceId[] }[];
}

const originSourceId = (content: CaseContent): SourceId => {
  const origin = content.sources.find(
    ({ root, derivedFrom }) => root === "incoming_request" && !derivedFrom,
  );
  if (!origin) throw new Error(`Case ${content.id} has no incoming message source`);
  return origin.id;
};

/**
 * Only the incoming message and sources the player actually obtained. Several answers through
 * one channel share one node: two replies in one call are not two independent sources.
 * Each node's `derivedFrom` and `relation` carry the links of the map.
 */
export const buildProvenance = (
  content: CaseContent,
  observations: readonly Observation[],
): Provenance => {
  const shown = new Set<SourceId>([
    originSourceId(content),
    ...observations.map(({ sourceId }) => sourceId),
  ]);
  const nodes = content.sources.filter(({ id }) => shown.has(id));

  const roots: Root[] = ["incoming_request", "prior_record"];
  const groups = roots
    .map((root) => ({
      root,
      sourceIds: nodes.filter((node) => node.root === root).map(({ id }) => id),
    }))
    .filter(({ sourceIds }) => sourceIds.length > 0);

  return { nodes, groups };
};

export const ROOT_LABEL: Record<Root, string> = {
  incoming_request: "Vychází z nové zprávy",
  prior_record: "Vychází z dřívějších záznamů",
};
