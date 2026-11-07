import {
  CircleAlert,
  CircleCheck,
  CircleEllipsis,
  Loader,
  type LucideIcon,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import GraficoRotinas from "./GraficoRotinas";
import { ROTINAS_POR_UNIDADE, STATUS_ROTINAS } from "./dadosMock";
import SeletorPeriodo from "./SeletorPeriodo";

const ESTILOS: Record<string, { icon: LucideIcon; caixa: string }> = {
  concluidas: { icon: CircleCheck, caixa: "bg-emerald-50 text-emerald-600" },
  emAndamento: { icon: Loader, caixa: "bg-blue-50 text-blue-600" },
  pendentes: { icon: CircleEllipsis, caixa: "bg-slate-100 text-slate-500" },
  atrasadas: { icon: CircleAlert, caixa: "bg-red-50 text-red-500" },
};

export default function ExecucaoRotinas() {
  return (
    <Card aria-labelledby="execucao-titulo" className="p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <CardTitle
          id="execucao-titulo"
          titulo="Execução das rotinas operacionais"
          subtitulo="Progresso das atividades previstas para hoje."
        />
        <SeletorPeriodo />
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-6">
        {/* Gráfico e estatísticas */}
        <div className="flex flex-wrap items-center gap-6">
          <GraficoRotinas />

          <ul className="w-44 space-y-2">
            {STATUS_ROTINAS.map((item) => {
              const { icon: Icone, caixa } = ESTILOS[item.chave];
              return (
                <li
                  key={item.chave}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-slate-50 px-2.5 py-2"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${caixa}`}
                  >
                    <Icone className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[11px] text-slate-500">
                      {item.nome}
                    </span>
                    <span className="block text-[14px] font-bold text-slate-900">
                      {item.valor}
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
            {ROTINAS_POR_UNIDADE.map((item) => {
              const percentual = Math.round((item.feitas / item.total) * 100);
              return (
                <li key={item.unidade}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-slate-700">
                      {item.unidade}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {item.feitas}/{item.total}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Rotinas concluídas em ${item.unidade}`}
                    aria-valuemin={0}
                    aria-valuemax={item.total}
                    aria-valuenow={item.feitas}
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
                  >
                    <div
                      className={`h-full rounded-full ${item.barra}`}
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