import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatarDataCurta } from "@/lib/datasOperacional";
import {
  contarAbas,
  listarLinhas,
  ROTULO_FILTRO,
  type AbaTabela,
  type FiltroTabela,
  type TipoLinha,
  type TomStatus,
} from "@/lib/tabelasOperacional";
import type {
  DadosOperacionais,
  FiltroUnidade,
  Prioridade,
} from "@/types/operacional";

const LIMITE = 5;

const ABAS: { valor: AbaTabela; rotulo: string }[] = [
  { valor: "tarefas", rotulo: "Tarefas" },
  { valor: "ocorrencias", rotulo: "Ocorrências" },
];

const TIPO: Record<TipoLinha, { rotulo: string; classe: string }> = {
  rotina: { rotulo: "Rotina", classe: "bg-blue-50 text-blue-700" },
  tarefa: { rotulo: "Tarefa", classe: "bg-violet-50 text-violet-700" },
  manutencao: { rotulo: "Manutenção", classe: "bg-orange-50 text-orange-700" },
  ocorrencia: { rotulo: "Ocorrência", classe: "bg-red-50 text-red-700" },
};

const STATUS: Record<TomStatus, { pilula: string; ponto: string }> = {
  azul: { pilula: "bg-blue-50 text-blue-700", ponto: "bg-blue-600" },
  cinza: { pilula: "bg-slate-100 text-slate-600", ponto: "bg-slate-400" },
  indigo: { pilula: "bg-indigo-50 text-indigo-700", ponto: "bg-indigo-500" },
  vermelho: { pilula: "bg-red-50 text-red-700", ponto: "bg-red-500" },
  roxo: { pilula: "bg-purple-50 text-purple-700", ponto: "bg-purple-500" },
  verde: { pilula: "bg-emerald-50 text-emerald-700", ponto: "bg-emerald-500" },
};

const PRIORIDADE: Record<Prioridade, { rotulo: string; classe: string }> = {
  alta: { rotulo: "Alta", classe: "bg-red-50 text-red-700" },
  media: { rotulo: "Média", classe: "bg-amber-50 text-amber-700" },
  baixa: { rotulo: "Baixa", classe: "bg-emerald-50 text-emerald-700" },
};

function Prazo({ prazo, hoje }: { prazo: string; hoje: string }) {
  if (prazo === hoje) {
    return <span className="font-semibold text-red-600">Hoje</span>;
  }
  if (prazo < hoje) {
    return (
      <span className="font-semibold text-red-600" title="Prazo vencido">
        {formatarDataCurta(prazo)}
      </span>
    );
  }
  return <span className="text-slate-700">{formatarDataCurta(prazo)}</span>;
}

type TabelaRecentesProps = {
  dados: DadosOperacionais;
  unidade: FiltroUnidade;
  aba: AbaTabela;
  onAbaChange: (aba: AbaTabela) => void;
  filtro: FiltroTabela;
  onLimparFiltro: () => void;
};

export default function TabelaRecentes({
  dados,
  unidade,
  aba,
  onAbaChange,
  filtro,
  onLimparFiltro,
}: TabelaRecentesProps) {
  const [expandido, setExpandido] = useState(false);

  // Ao mudar aba, filtro ou unidade, volta a mostrar só as primeiras linhas
  // (ajuste de estado durante a renderização, no mesmo estilo do AppShell).
  const contexto = `${aba}|${filtro}|${unidade}`;
  const [contextoAnterior, setContextoAnterior] = useState(contexto);
  if (contexto !== contextoAnterior) {
    setContextoAnterior(contexto);
    setExpandido(false);
  }

  const linhas = useMemo(
    () => listarLinhas(dados, unidade, aba, filtro),
    [dados, unidade, aba, filtro],
  );
  const contagens = useMemo(() => contarAbas(dados, unidade), [dados, unidade]);

  const visiveis = expandido ? linhas : linhas.slice(0, LIMITE);

  return (
    <Card aria-labelledby="recentes-titulo" className="p-6">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <CardTitle id="recentes-titulo" titulo="Tarefas e ocorrências recentes" />

        <div role="tablist" aria-label="Tipo de item" className="flex gap-4">
          {ABAS.map((item) => {
            const ativa = aba === item.valor;
            return (
              <button
                key={item.valor}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => onAbaChange(item.valor)}
                className={`inline-flex items-center gap-1.5 border-b-2 pb-1 text-[13px] font-semibold transition ${
                  ativa
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.rotulo}
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {contagens[item.valor]}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {filtro !== "todos" && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 py-1 pl-3 pr-1.5 text-[12px] text-blue-800">
          <span>
            Filtrando: <strong>{ROTULO_FILTRO[filtro]}</strong>
          </span>
          <button
            type="button"
            onClick={onLimparFiltro}
            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Limpar filtro
          </button>
        </div>
      )}

      <div role="tabpanel" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[12px]">
          <thead>
            <tr className="border-b border-line text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th scope="col" className="pb-2 pr-3">Tipo</th>
              <th scope="col" className="pb-2 pr-3">Descrição</th>
              <th scope="col" className="pb-2 pr-3">Unidade</th>
              <th scope="col" className="pb-2 pr-3">Responsável</th>
              <th scope="col" className="pb-2 pr-3">Prazo</th>
              <th scope="col" className="pb-2 pr-3">Status</th>
              <th scope="col" className="pb-2">Prioridade</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((linha) => {
              const tipo = TIPO[linha.tipo];
              const status = STATUS[linha.status.tom];
              const prioridade = PRIORIDADE[linha.prioridade];
              return (
                <tr
                  key={linha.id}
                  className="border-b border-line/70 last:border-0"
                >
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${tipo.classe}`}
                    >
                      {tipo.rotulo}
                    </span>
                  </td>
                  <td className="max-w-[200px] py-3 pr-3 font-semibold text-slate-900">
                    {linha.descricao}
                  </td>
                  <td className="py-3 pr-3 text-slate-600">{linha.unidade}</td>
                  <td className="py-3 pr-3 text-slate-700">{linha.responsavel}</td>
                  <td className="py-3 pr-3">
                    <Prazo prazo={linha.prazo} hoje={dados.dataReferencia} />
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.pilula}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.ponto}`}
                        aria-hidden="true"
                      />
                      {linha.status.rotulo}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${prioridade.classe}`}
                    >
                      {prioridade.rotulo}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {linhas.length === 0 && (
          <p className="py-8 text-center text-[13px] text-slate-500">
            Nenhum item em aberto para a seleção atual.
          </p>
        )}
      </div>

      {linhas.length > LIMITE && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 text-[12px] text-slate-500">
          <span aria-live="polite">
            Mostrando {visiveis.length} de {linhas.length}
          </span>
          <button
            type="button"
            onClick={() => setExpandido((valor) => !valor)}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
          >
            {expandido ? "Mostrar menos" : `Ver todos (${linhas.length})`}
            {expandido ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </Card>
  );
}