import Link from "next/link";
import { AppHeader } from "@/features/two-worlds/components/AppHeader";
import { StageHeader } from "@/features/two-worlds/components/StageHeader";

export default function NotFound() {
  return (
    <>
      <AppHeader />
      <StageHeader
        kicker="Stránka nenalezena"
        title="Tahle stopa nikam nevede"
        lead={<p>Stránka na této adrese neexistuje. Případ najdeš na úvodní stránce.</p>}
      />
      <main id="main" tabIndex={-1} className="ds-container py-12">
        <Link href="/" className="ds-btn">
          Zpět na úvod
        </Link>
      </main>
    </>
  );
}
