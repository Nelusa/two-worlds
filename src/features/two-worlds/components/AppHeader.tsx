"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "./Logo";

interface AppHeaderProps {
  demo?: boolean;
  /** True once the current run's decision is confirmed; only then may the logo show the plates. */
  revealed?: boolean;
}

const NAV = [
  { href: "/about", label: "Princip a omezení" },
  { href: "/saved", label: "Uložený průběh" },
];

const NAV_LINK =
  "font-bold no-underline hover:underline hover:decoration-2 aria-[current=page]:underline aria-[current=page]:decoration-2";

export function AppHeader({ demo = false, revealed = false }: AppHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = (extra: string) =>
    NAV.map(({ href, label }) => (
      <li key={href}>
        <Link
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={`${NAV_LINK} ${extra}`}
          onClick={() => setMenuOpen(false)}
        >
          {label}
        </Link>
      </li>
    ));

  return (
    <header>
      <a
        href="#main"
        className="ds-btn ds-btn--sm sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Přeskočit na obsah
      </a>
      <div className="ds-container flex min-h-20 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="flex items-center gap-3 no-underline"
          >
            <LogoMark revealed={revealed} />
            <span className="font-display text-h4 font-extrabold tracking-display">Dva světy</span>
            <span className="sr-only">: úvod</span>
          </Link>
          <span className="pt-1 font-mono text-meta text-ink-3">
            {demo ? "ukázkový režim" : "simulace"}
          </span>
        </div>
        <nav aria-label="Hlavní">
          <ul className="hidden items-center gap-7 text-small sm:flex">{links("")}</ul>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            className="min-h-11 font-bold underline decoration-2 underline-offset-4 sm:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
        </nav>
      </div>
      <div aria-hidden="true" className="h-1 bg-ink sm:mx-6" />
      {menuOpen && (
        <ul
          id="main-menu"
          className="ds-container animate-enter border-b-2 border-ink py-2 sm:hidden"
        >
          {links("flex min-h-11 items-center")}
        </ul>
      )}
    </header>
  );
}
