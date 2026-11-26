import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";
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

  return (
    <div className="min-h-[70vh] bg-slate-50/50 p-6 flex items-center justify-center font-sans">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Construction size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Em desenvolvimento
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{info.titulo}</h1>
          </div>
        </div>

        <p className="text-[13px] text-slate-600 leading-relaxed">{info.descricao}</p>
        <p className="text-[12px] text-slate-500">
          Este módulo ainda não possui interface dedicada nesta versão do BEVOX.
        </p>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft size={15} /> Voltar ao Dashboard
          </Link>

          <div className="flex items-center gap-2 text-[12px]">
            <Link
              href="/documentos"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Documentos
            </Link>
            <Link
              href="/licencas"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Licenças
            </Link>
            <Link
              href="/unidades"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Unidades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}