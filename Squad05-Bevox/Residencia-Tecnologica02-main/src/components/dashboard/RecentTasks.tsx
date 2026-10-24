import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  IdCard,
  ListChecks,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { ROTAS } from "@/config/navigation";
import { formatarDataBR } from "@/lib/dashboard";
import type { StatusTarefa, Tarefa, TarefaIcone } from "@/types";

const ICONES: Record<TarefaIcone, { Icone: LucideIcon; tile: string }> = {
  licenca: { Icone: Building2, tile: "bg-blue-50 text-blue-600" },
  documento: { Icone: FileText, tile: "bg-sky-50 text-sky-600" },
  alvara: { Icone: IdCard, tile: "bg-amber-50 text-amber-600" },
  vistoria: { Icone: ShieldCheck, tile: "bg-indigo-50 text-indigo-600" },
  cadastro: { Icone: UserCheck, tile: "bg-emerald-50 text-emerald-600" },
};

const STATUS: Record<StatusTarefa, { rotulo: string; classe: string }> = {
  atrasada: { rotulo: "Atrasada", classe: "border-red-200 bg-red-50 text-red-600" },
  andamento: { rotulo: "Em andamento", classe: "border-sky-200 bg-sky-50 text-sky-700" },
  pendente: { rotulo: "Pendente", classe: "border-amber-200 bg-amber-50 text-amber-700" },
  agendada: { rotulo: "Agendada", classe: "border-violet-200 bg-violet-50 text-violet-700" },
  concluida: { rotulo: "Concluída", classe: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

export default function RecentTasks({ tarefas }: { tarefas: Tarefa[] }) {
  return (
    <Card aria-labelledby="tarefas-recentes" className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ListChecks className="h-5 w-5" aria-hidden="true" />
          </span>
          <CardTitle id="tarefas-recentes" titulo="Tarefas Recentes" subtitulo="Fluxo operacional de documentos e renovações." />
        </div>
        <Link href={ROTAS.tarefas} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-blue-600">
          Ver todas <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {tarefas.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-slate-500">Nenhuma tarefa recente. Quando houver atividades, elas aparecem aqui.</p>
      ) : (
        <ul className="mt-1">
          {tarefas.map((t) => {
            const { Icone, tile } = ICONES[t.icone];
            const st = STATUS[t.status];
            return (
              <li key={t.id} className="border-b border-line last:border-0">
                <Link
                  href={ROTAS.tarefas}
                  className="-mx-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-2 py-3.5 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tile}`}>
                    <Icone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 basis-48">
                    <span className="block truncate text-[14px] font-bold text-slate-900">{t.titulo}</span>
                    <span className="block truncate text-[12px] text-slate-500">{t.unidade} • {t.categoria}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${st.classe}`}>{st.rotulo}</span>
                    <time dateTime={t.prazo} className="w-[4.75rem] text-right text-[12px] tabular-nums text-slate-400">
                      {formatarDataBR(t.prazo)}
                    </time>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
