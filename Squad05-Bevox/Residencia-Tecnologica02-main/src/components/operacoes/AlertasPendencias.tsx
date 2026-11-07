import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  Clock,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import type { AlertaPainel } from "@/lib/alertasOperacional";
import type { AbaTabela, FiltroTabela } from "@/lib/tabelasOperacional";

const ESTILOS: Record<
  AlertaPainel["chave"],
  { icon: LucideIcon; caixa: string }
> = {
  atrasadas: { icon: TriangleAlert, caixa: "bg-red-50 text-red-500" },
  ocorrencia: { icon: Clock, caixa: "bg-orange-50 text-orange-500" },
  renovacoes: { icon: CalendarClock, caixa: "bg-amber-50 text-amber-500" },
  manutencao: { icon: Wrench, caixa: "bg-blue-50 text-blue-600" },
};

const CLASSE_ITEM =
  "flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left transition hover:bg-slate-50";

function ConteudoAlerta({ alerta }: { alerta: AlertaPainel }) {
  const { icon: Icone, caixa } = ESTILOS[alerta.chave];
  return (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${caixa}`}
      >
        <Icone className="h-4 w-4" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[13px] font-semibold text-slate-900">
          {alerta.titulo}
        </span>
        <span className="mt-0.5 block text-[11px] text-slate-500">
          {alerta.detalhe}
        </span>
      </span>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-slate-300"
        aria-hidden="true"
      />
    </>
  );
}

type AlertasPendenciasProps = {
  alertas: AlertaPainel[];
  onAbrirTabela: (aba: AbaTabela, filtro: FiltroTabela) => void;
};

export default function AlertasPendencias({
  alertas,
  onAbrirTabela,
}: AlertasPendenciasProps) {
  const total = alertas.reduce((soma, alerta) => soma + alerta.quantidade, 0);

  return (
    <Card aria-labelledby="alertas-titulo" className="p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CardTitle id="alertas-titulo" titulo="Alertas e pendências" />
          {total > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
              {total}
            </span>
          )}
        </div>

        {/* A rota /notificacoes é do grupo (histórico completo de alertas). */}
        <Link
          href="/notificacoes"
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline"
        >
          Ver todas
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </header>

      {alertas.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-line px-4 py-8 text-center">
          <CircleCheck className="h-6 w-6 text-emerald-500" aria-hidden="true" />
          <p className="text-[13px] font-semibold text-slate-800">
            Nenhum alerta no momento
          </p>
          <p className="text-[11px] text-slate-500">
            Tudo em dia para a seleção atual.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {alertas.map((alerta) => {
            const destino = alerta.destino;
            return (
              <li key={alerta.chave}>
                {destino.tipo === "tabela" ? (
                  <button
                    type="button"
                    onClick={() => onAbrirTabela(destino.aba, destino.filtro)}
                    className={CLASSE_ITEM}
                  >
                    <ConteudoAlerta alerta={alerta} />
                  </button>
                ) : (
                  <Link href={destino.href} className={CLASSE_ITEM}>
                    <ConteudoAlerta alerta={alerta} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}