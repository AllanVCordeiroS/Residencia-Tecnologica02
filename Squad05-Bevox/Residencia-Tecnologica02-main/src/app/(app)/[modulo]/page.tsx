
import { notFound } from "next/navigation";
import { modulosPendentes } from "@/config/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(modulosPendentes).map((modulo) => ({ modulo }));
}

export default async function ModuloPendentePage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  const info = modulosPendentes[modulo];

  if (!info) notFound();

  return null;
}
