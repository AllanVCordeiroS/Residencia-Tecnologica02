import {
  CircleAlert,
  CircleCheck,
  CircleEllipsis,
  Loader,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import type { ResumoPainel } from "@/lib/painelOperacional";
import type { PeriodoId } from "@/types/operacional";
import GraficoRotinas from "./GraficoRotinas";
import SeletorPeriodo from "./SeletorPeriodo";

// A cor é hexadecimal porque o gráfico é desenhado em SVG.
const STATUS = [
  { chave: "concluidas", nome: "Concluídas", cor: "#10b981", icon: CircleCheck, caixa: "bg-emerald-50 text-emerald-600" },
  { chave: "emAndamento", nome: "Em andamento", cor: "#3b82f6", icon: Loader, caixa: "bg-blue-50 text-blue-600" },
  { chave: "pendentes", nome: "Pendentes", cor: "#94a3b8", icon: CircleEllipsis, caixa: "bg-slate-100 text-slate-500" },
  { chave: "atrasadas", nome: "Atrasadas", cor: "#ef4444", icon: CircleAlert, caixa: "bg-red-50 text-red-500" },
] as const;

type ExecucaoRotinasProps = {
  painel: ResumoPainel;
  periodo: PeriodoId;
  onPeriodoChange: (periodo: PeriodoId) => void;
};

export default function ExecucaoRotinas({
  painel,
  periodo,
  onPeriodoChange,
}: ExecucaoRotinasProps) {
  const fatias = STATUS.map((status) => ({
    nome: status.nome,
    valor: painel.totais[status.chave],
    cor: status.cor,
  }));

  return (
    <Card aria-labelledby="execucao-titulo" className="p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <CardTitle
          id="execucao-titulo"
          titulo="Execução das rotinas operacionais"
          subtitulo={
            periodo === "hoje"
              ? "Progresso das atividades previstas para hoje."
              : "Progresso das atividades previstas no período."
          }
        />
        <SeletorPeriodo valor={periodo} onChange={onPeriodoChange} />
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-6">
        {/* Gráfico e estatísticas */}
        <div className="flex flex-wrap items-center gap-6">
          <GraficoRotinas fatias={fatias} percentual={painel.percentualConcluidas} />

          <ul className="w-44 space-y-2">
            {STATUS.map((status) => {
              const Icone = status.icon;
              return (
                <li
                  key={status.chave}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-slate-50 px-2.5 py-2"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${status.caixa}`}
                  >
                    <Icone className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[11px] text-slate-500">
                      {status.nome}
                    </span>
                    <span className="block text-[14px] font-bold text-slate-900">
                      {painel.totais[status.chave]}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Linha vertical separadora (só em telas médias para cima) */}
        <div className="hidden w-px self-stretch bg-line md:block" aria-hidden="true" />

        {/* Rotinas por unidade */}
        <section
          aria-labelledby="rotinas-unidade-titulo"
          className="min-w-[240px] flex-1"
        >
          <h3
            id="rotinas-unidade-titulo"
            className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            Rotinas por unidade
          </h3>

          <ul className="mt-4 space-y-3.5">
            {painel.porUnidade.map((linha) => {
              const percentual =
                linha.total === 0
                  ? 0
                  : Math.round((linha.feitas / linha.total) * 100);
              return (
                <li key={linha.unidade.id}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-slate-700">
                      {linha.unidade.nome}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {linha.feitas}/{linha.total}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Rotinas concluídas em ${linha.unidade.nome}`}
                    aria-valuemin={0}
                    aria-valuemax={linha.total}
                    aria-valuenow={linha.feitas}
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
                  >
                    <div
                      className={`h-full rounded-full ${linha.unidade.barra}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Card>
  );
}