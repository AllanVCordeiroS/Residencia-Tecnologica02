import Link from "next/link";
import { Building2, Calendar, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import BotaoFiltro from "@/components/operacoes/BotaoFiltro";
import ExecucaoRotinas from "@/components/operacoes/ExecucaoRotinas";
import IndicadoresOperacionais from "@/components/operacoes/IndicadoresOperacionais";

export const metadata = { title: "BEVOX | Central de Operações" };

export default function CentralOperacoesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
            Central de Operações
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe rotinas, ocorrências e desempenho operacional das
            unidades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BotaoFiltro icon={Calendar}>Hoje, 17 de abril de 2026</BotaoFiltro>
          <BotaoFiltro icon={Building2}>Todas as unidades</BotaoFiltro>
          <Link
            href="/operacional/ocorrencias/nova"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar ocorrência
          </Link>
        </div>
      </header>

      <IndicadoresOperacionais />

      {/* Marcadores provisórios: entram nas etapas 3 a 5 */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ExecucaoRotinas />
        <Card className="p-6 text-sm text-slate-400">
          Alertas e pendências (etapa 3)
        </Card>
        <Card className="p-6 text-sm text-slate-400">
          Tarefas e ocorrências recentes (etapa 4)
        </Card>
        <Card className="p-6 text-sm text-slate-400">
          Resumo por unidade (etapa 5)
        </Card>
      </div>
    </div>
  );
}