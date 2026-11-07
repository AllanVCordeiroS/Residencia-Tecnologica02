"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Calendar, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  calcularPainel,
  opcoesPeriodo,
  opcoesUnidade,
} from "@/lib/painelOperacional";
import type {
  DadosOperacionais,
  FiltroUnidade,
  PeriodoId,
} from "@/types/operacional";
import ExecucaoRotinas from "./ExecucaoRotinas";
import IndicadoresOperacionais from "./IndicadoresOperacionais";
import SelectFiltro from "./SelectFiltro";

export default function PainelOperacional({
  dados,
}: {
  dados: DadosOperacionais;
}) {
  const [periodo, setPeriodo] = useState<PeriodoId>("hoje");
  const [unidade, setUnidade] = useState<FiltroUnidade>("todas");

  // Recalcula tudo sempre que um filtro (ou os dados) mudar.
  const painel = useMemo(
    () => calcularPainel(dados, { periodo, unidade }),
    [dados, periodo, unidade],
  );

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
          <SelectFiltro
            icon={Calendar}
            rotuloAcessivel="Período"
            valor={periodo}
            opcoes={opcoesPeriodo(dados.dataReferencia)}
            onChange={setPeriodo}
          />
          <SelectFiltro
            icon={Building2}
            rotuloAcessivel="Unidade"
            valor={unidade}
            opcoes={opcoesUnidade(dados.unidades)}
            onChange={setUnidade}
          />
          <Link
            href="/operacional/ocorrencias/nova"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar ocorrência
          </Link>
        </div>
      </header>

      <IndicadoresOperacionais painel={painel} />

      {/* Marcadores provisórios: entram nas etapas 4 a 6 */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ExecucaoRotinas
          painel={painel}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
        />
        <Card className="p-6 text-sm text-slate-400">
          Alertas e pendências (etapa 4)
        </Card>
        <Card className="p-6 text-sm text-slate-400">
          Tarefas e ocorrências recentes (etapa 5)
        </Card>
        <Card className="p-6 text-sm text-slate-400">
          Resumo por unidade (etapa 6)
        </Card>
      </div>
    </div>
  );
}