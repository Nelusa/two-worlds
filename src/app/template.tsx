import type { ReactNode } from "react";

/**
 * Re-mounted on every navigation, unlike the layout. The page content under the header fades
 * in, so moving between pages is a transition rather than a cut; the header itself stays still.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
