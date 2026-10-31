interface LogoMarkProps {
  /** After the decision the two plates take the reality colours; before it they stay grey and ink. */
  revealed?: boolean;
  className?: string;
}

/** Two overprinted plates: one message, two realities. */
export function LogoMark({ revealed = false, className = "h-5.5 w-7.5" }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 30 22" aria-hidden="true" focusable="false" className={className}>
      <rect
        x="1"
        y="1"
        width="18"
        height="20"
        className={`mix-blend-multiply ${revealed ? "fill-plate-1" : "fill-logo-ghost"}`}
      />
      <rect
        x="11"
        y="1"
        width="18"
        height="20"
        className={`mix-blend-multiply ${revealed ? "fill-plate-2" : "fill-ink"}`}
      />
    </svg>
  );
}
