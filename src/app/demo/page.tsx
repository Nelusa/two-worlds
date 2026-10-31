import type { Metadata } from "next";
import { DemoSetup, type DemoParams } from "@/features/two-worlds/components/DemoSetup";

export const metadata: Metadata = { title: "Ukázkový režim" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params: DemoParams = {
    world: first(query.world),
    variant: first(query.variant),
    contact: first(query.contact),
    transferWorld: first(query.transferWorld),
    transferContact: first(query.transferContact),
  };
  return <DemoSetup params={params} />;
}
