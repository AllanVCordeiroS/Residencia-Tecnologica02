import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CircleCheck,
  Clock,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { ROTAS } from "@/config/navigation";
import { formatarRelativo } from "@/lib/dashboard";
import type { Alerta, AlertaTipo } from "@/types";

const ESTILO: Record<AlertaTipo, { Icone: LucideIcon; tile: string }> = {
  licenca: { Icone: TriangleAlert, tile: "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-300" },
  documento_pendente: { Icone: Clock, tile: "bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-300" },
  tarefa: { Icone: Info, tile: "bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-300" },
  aprovado: { Icone: CircleCheck, tile: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-300" },
  reuniao: { Icone: CalendarCheck, tile: "bg-violet-50 dark:bg-violet-950/40 text-violet-500 dark:text-violet-300" },
};

export default function AlertsNotifications({ alertas, dataReferencia }: { alertas: Alerta[]; dataReferencia: string }) {
  return (
    <Card aria-labelledby="alertas" className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-300">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </span>
          <CardTitle id="alertas" titulo="Alertas e Notificações" subtitulo="Avisos automatizados de conformidade." />
        </div>
        <Link href={ROTAS.notificacoes} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-300 focus-visible:outline-2 focus-visible:outline-blue-600">
          Ver todas <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {alertas.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-slate-500 dark:text-foreground-muted">Nenhum alerta no momento.</p>
      ) : (
        <ul className="mt-1">
          {alertas.map((a) => {
            const { Icone, tile } = ESTILO[a.tipo];
            return (
              <li key={a.id} className="flex items-start gap-3 border-b border-line py-3.5 last:border-0">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tile}`}>
                  <Icone className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-foreground">{a.titulo}</p>
                    <time dateTime={a.ocorridoEm} className="shrink-0 text-[11px] text-slate-400 dark:text-foreground-muted">
                      {formatarRelativo(a.ocorridoEm, dataReferencia)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-foreground-muted">{a.descricao}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
