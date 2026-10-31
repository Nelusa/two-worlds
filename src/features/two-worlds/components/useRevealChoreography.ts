"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";

/*
 * Port of design/b2/reveal/reveal.js. The final state is plain CSS; the animation only adds a
 * starting point (src/styles/reveal.css). Without JavaScript or with reduced motion nothing is
 * hidden. Each [data-reveal-section] plays once when it scrolls into view; the first one at once.
 */

const REDUCED = "(prefers-reduced-motion: reduce)";

export type RevealType = "slide" | "fade" | "print" | "grow";

/** Marks an element for the choreography, delayed in ms from the start of its section. */
export const reveal = (type: RevealType, delay = 0) => ({
  "data-reveal": type,
  style: { "--ds-delay": `${delay}ms` } as CSSProperties,
});

const play = (section: Element) => {
  section.classList.remove("is-playing");
  // Force a reflow so the animation starts again when replayed.
  void (section as HTMLElement).offsetWidth;
  section.classList.add("is-playing");
};

const isVisible = (element: Element) => {
  const { top, bottom } = element.getBoundingClientRect();
  return bottom > 0 && top < window.innerHeight;
};

/**
 * Arms the sections under `root` and plays them as they appear. `sectionCount` re-runs the
 * wiring when the reveal adds a section. Returns whether motion is on and a replay function.
 */
export function useRevealChoreography(root: RefObject<HTMLElement | null>, sectionCount: number) {
  const [animated, setAnimated] = useState(false);
  const played = useRef(new WeakSet<Element>());
  const started = useRef(false);

  // Layout effect: armed before the first paint, so nothing flashes in its final state first.
  useLayoutEffect(() => {
    const element = root.current;
    const motion = window.matchMedia(REDUCED);
    if (!element || motion.matches) return;

    element.classList.add("ds-reveal-armed");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflects a media query read on mount
    setAnimated(true);

    const fresh = [...element.querySelectorAll("[data-reveal-section]")].filter(
      (section) => !played.current.has(section),
    );
    const start = (section: Element) => {
      played.current.add(section);
      play(section);
    };
    // A tall section on a phone never shows a quarter of itself, so any visible part starts it.
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          observer.unobserve(target);
          start(target);
        }),
      { rootMargin: "0px 0px -15% 0px" },
    );
    fresh.forEach((section, index) => {
      if (index === 0 && !started.current) {
        started.current = true;
        start(section);
      } else {
        observer.observe(section);
      }
    });

    const stop = () => {
      if (!motion.matches) return;
      element.classList.add("ds-reveal-still");
      element.classList.remove("ds-reveal-armed");
      setAnimated(false);
    };
    motion.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", stop);
    };
  }, [root, sectionCount]);

  const replay = () => {
    const element = root.current;
    if (!element || window.matchMedia(REDUCED).matches) return;
    element.querySelectorAll("[data-reveal-section]").forEach((section, index) => {
      if (index === 0 || isVisible(section)) play(section);
    });
  };

  return { animated, replay };
}
