import type { ActionId, CaseContent, PanelId } from "../engine/types";
import { Icon } from "./Icon";
import { PANEL_ICON, panelNumber, panelStatus } from "./presentation";

interface SourceListProps {
  content: CaseContent;
  done: readonly ActionId[];
  selected: PanelId;
  onSelect: (panelId: PanelId) => void;
}

/**
 * Tabs of the case file. Each tab is a plain button (one tab stop each, no arrow keys); the open
 * one joins the sheet. Below 900 px they form a 3 × 2 grid above the sheet.
 */
export function SourceList({ content, done, selected, onSelect }: SourceListProps) {
  return (
    <nav aria-labelledby="sources-heading" className="min-w-0">
      <h2
        id="sources-heading"
        className="mb-3 font-display text-h4 leading-head font-bold tracking-display"
      >
        Podklady a kontakty
      </h2>
      <ol className="ds-tabs">
        {content.panels.map((panel) => {
          const status = panelStatus(panel, done);
          const statusId = `tab-status-${panel.id}`;
          return (
            <li key={panel.id}>
              <button
                type="button"
                className="ds-tab"
                aria-current={panel.id === selected ? "true" : undefined}
                aria-disabled={status.tone === "locked" ? "true" : undefined}
                aria-describedby={statusId}
                data-done={status.tone === "done" ? "true" : undefined}
                onClick={() => onSelect(panel.id)}
              >
                <Icon name={PANEL_ICON[panel.id]} />
                <span className="ds-tab__label">{panel.title}</span>
                <span className="ds-tab__num max-md:-order-1" aria-hidden="true">
                  {panelNumber(content, panel.id)}
                </span>
                <span id={statusId} className="ds-tab__status">
                  {status.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
