/** The B2 icon set (design/b2/icons): 24 px grid, square caps, always shown next to a word. */
const ICONS = {
  email: { d: "M3 5.5h18v13H3z M3 6l9 7 9-7" },
  attachment: {
    d: "M16 8.5l-6.4 6.4a1.9 1.9 0 0 0 2.7 2.7l6.5-6.5a3.7 3.7 0 0 0-5.3-5.3L6.8 12.5a5.5 5.5 0 0 0 7.8 7.8L20 15",
  },
  order: { d: "M6 3h8.5L19 7.5V21H6z M14 3v5h5 M9 12.5h7 M9 16.5h7" },
  colleague: { d: "M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z M5 20.5c.9-4 3.7-6 7-6s6.1 2 7 6" },
  phone: {
    d: "M7 3.5h3l1.5 4-2.2 1.4a11 11 0 0 0 5.8 5.8l1.4-2.2 4 1.5v3a2 2 0 0 1-2 2C10.6 19 5 13.4 5 5.5a2 2 0 0 1 2-2z",
  },
  contactCard: {
    d: "M3 5.5h18v13H3z M8.5 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z M5.5 16c.6-1.5 1.7-2.3 3-2.3s2.4.8 3 2.3 M14 10h4.5 M14 13.5h4.5",
  },
  clock: { d: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z M12 7v5.5l3.5 2" },
  origin: { d: "M6 3v18 M6 9h7v6h5 M6 15h4" },
  lock: { d: "M6 10.5h12v10H6z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" },
  arrow: { d: "M4 12h15 M13 6l6 6-6 6", width: 2.2 },
  close: { d: "M5 5l14 14 M19 5L5 19", width: 2 },
} satisfies Record<string, { d: string; width?: number }>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className = "size-5" }: IconProps) {
  const icon: { d: string; width?: number } = ICONS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={icon.width ?? 1.6}
      strokeLinecap="square"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={icon.d} />
    </svg>
  );
}
