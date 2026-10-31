import type { Metadata } from "next";
import { Game } from "@/features/two-worlds/components/Game";

export const metadata: Metadata = { title: "Případ" };

export default function PlayPage() {
  return <Game playMode="normal" />;
}
