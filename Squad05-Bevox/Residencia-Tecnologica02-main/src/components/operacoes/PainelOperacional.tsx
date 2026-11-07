"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Calendar, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { calcularAlertas } from "@/lib/alertasOperacional";
import {
  calcularPainel,
  opcoesPeriodo,
  opcoesUnidade,
} from "@/lib/painelOperacional";
import type { AbaTabela, FiltroTabela } from "@/lib/tabelasOperacional";
import type {
  DadosOperacionais,
  FiltroUnidade,
  PeriodoId,
} from "@/types/operacional";
import AlertasPendencias from "./AlertasPendencias";
import ExecucaoRotinas from "./ExecucaoRotinas";
import IndicadoresOperacionais from "./IndicadoresOperacionais";
import SelectFiltro from "./SelectFiltro";
import TabelaRecentes from "./TabelaRecentes";

const ID_TABELA = "tarefas-ocorrencias";

export default function PainelOperacional({
  dados,
}: {
  dados: DadosOperacionais;
}) {
  const [periodo, setPeriodo] = useState<PeriodoId>("hoje");
  const [unidade, setUnidade] = useState<FiltroUnidade>("todas");
  const [aba, setAba] = useState<AbaTabela>("tarefas");
  const [filtroTabela, setFiltroTabela] = useState<FiltroTabela>("todos");

  // Recalcula tudo sempre que um filtro (ou os dados) mudar.
  const painel = useMemo(
    () => calcularPainel(dados, { periodo, unidade }),
    [dados, periodo, unidade],
  );
  const alertas = useMemo(
    () => calcularAlertas(dados, unidade),
    [dados, unidade],
  );

  // Alertas e botões "Ver todas" abrem a tabela já filtrada e rolam até ela.
  function abrirTabela(novaAba: AbaTabela, filtro: FiltroTabela) {
    setAba(novaAba);
    setFiltroTabela(filtro);
    document
      .getElementById(ID_TABELA)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Trocar de aba manualmente limpa o filtro.
  function trocarAba(novaAba: AbaTabela) {
    setAba(novaAba);
    setFiltroTabela("todos");
  }

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

      <IndicadoresOperacionais
        painel={painel}
        onVerAtrasadas={() => abrirTabela("tarefas", "atrasadas")}
      />

      {/* O marcador do resumo por unidade entra na etapa 6 */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ExecucaoRotinas
          painel={painel}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
        />
        <AlertasPendencias alertas={alertas} onAbrirTabela={abrirTabela} />

        <div id={ID_TABELA} className="min-w-0 scroll-mt-24">
          <TabelaRecentes
            dados={dados}
            unidade={unidade}
            aba={aba}
            onAbaChange={trocarAba}
            filtro={filtroTabela}
            onLimparFiltro={() => setFiltroTabela("todos")}
          />
        </div>
        <Card className="p-6 text-sm text-slate-400">
          Resumo por unidade (etapa 6)
        </Card>
      </div>
    </div>
  );
}