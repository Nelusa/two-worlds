import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Dva světy", template: "%s · Dva světy" },
  description:
    "Krátký interaktivní detektivní příběh o ověřování požadavků dodavatelů. Stejná zpráva, dvě reality.",
};

export const viewport: Viewport = {
  themeColor: "#f3f0e8",
  width: "device-width",
  initialScale: 1,
  // Lets the docked decision bar sit above the home indicator via env(safe-area-inset-bottom).
  viewportFit: "cover",
};

const FONTS = [
  "bricolage-grotesque-latin-opsz-normal",
  "bricolage-grotesque-latin-ext-opsz-normal",
  "atkinson-hyperlegible-next-latin-400-normal",
  "atkinson-hyperlegible-next-latin-ext-400-normal",
  "atkinson-hyperlegible-next-latin-700-normal",
  "atkinson-hyperlegible-next-latin-ext-700-normal",
  "atkinson-hyperlegible-mono-latin-400-normal",
  "atkinson-hyperlegible-mono-latin-ext-400-normal",
];

export default function RootLayout({ children }: { children: ReactNode }) {
  // Czech text needs both subsets on the first screen, so the faces used above the fold load before paint.
  FONTS.forEach((name) =>
    preload(`/fonts/${name}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "" }),
  );
  return (
    <html lang="cs">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
