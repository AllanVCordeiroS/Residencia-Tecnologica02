import { CalendarDays } from "lucide-react";
import { formatarDataBR, formatarDataExtensa } from "@/lib/dashboard";
import type { DashboardData } from "@/types";
import TodayDate from "./TodayDate";

export default function WelcomeBanner({ data }: { data: DashboardData }) {
  const { usuario, empresa, unidades, dataReferencia, demonstrativo } = data;
  const ativas = unidades.filter((u) => u.ativa).length;
  const todasAtivas = ativas === unidades.length;

  return (
    <section
      aria-labelledby="boas-vindas"
      className="relative overflow-hidden rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-800 px-6 py-7 text-white shadow-lg shadow-navy-950/10 sm:px-8 sm:py-9"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[12px] font-medium text-blue-200">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <TodayDate />
          </p>
          <h1 id="boas-vindas" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Olá, {usuario.primeiroNome}!
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-200 sm:text-base">
            Aqui está um resumo operacional da sua empresa com base nos dados de{" "}
            <strong className="font-semibold text-white">{formatarDataExtensa(dataReferencia)}</strong>.{" "}
            {todasAtivas
              ? `As ${unidades.length} unidades da ${empresa.nome} estão ativas.`
              : `${ativas} de ${unidades.length} unidades da ${empresa.nome} estão ativas.`}
          </p>
          {demonstrativo && (
            <p className="mt-3 inline-block rounded-md bg-amber-400/15 px-2.5 py-1 text-[12px] font-medium text-amber-200">
              Dados demonstrativos — referência {formatarDataBR(dataReferencia)}
            </p>
          )}
        </div>

        <div className="w-full max-w-sm shrink-0 rounded-xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur lg:w-[22rem]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-[12px] font-bold text-amber-300 ring-1 ring-white/15">
              AD
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
                {empresa.nome}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {empresa.status === "Ativa" ? "Ativo" : "Inativo"}
                </span>
              </p>
              <p className="mt-1 text-[12px] italic leading-snug text-slate-300">“{empresa.slogan}”</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
