"use client";

import { useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { FocusContext } from "./focusContext";

interface StageHeadingProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}

/**
 * Main heading of a stage. After a phase change it receives focus, so keyboard and screen
 * reader users land at the start of the new content instead of wherever the old button was.
 */
export function StageHeading({ children, className, as: Tag = "h1" }: StageHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const stageVersion = useContext(FocusContext);

  useEffect(() => {
    if (stageVersion > 0) ref.current?.focus();
  }, [stageVersion]);

  return (
    <Tag ref={ref} tabIndex={-1} className={className}>
      {children}
    </Tag>
  );
}
