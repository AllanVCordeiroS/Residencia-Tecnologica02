export type PeriodoId = "hoje" | "7dias" | "30dias";

export type UnidadeId =
  | "recife"
  | "paulista"
  | "jaboatao"
  | "caruaru"
  | "salvador";

export type FiltroUnidade = UnidadeId | "todas";

export interface Unidade {
  id: UnidadeId;
  nome: string;
  /** Classe do Tailwind usada na barra de progresso da unidade. */
  barra: string;
}

/** Rotinas de uma unidade em um dia, já somadas por status. */
export interface RotinasDoDia {
  data: string; // AAAA-MM-DD
  unidadeId: UnidadeId;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
  atrasadas: number;
}

export type Prioridade = "alta" | "media" | "baixa";

export type StatusOcorrencia =
  | "aberta"
  | "em_analise"
  | "em_andamento"
  | "resolvida";

export interface Ocorrencia {
  id: string;
  descricao: string;
  unidadeId: UnidadeId;
  responsavel: string;
  status: StatusOcorrencia;
  prioridade: Prioridade;
  criadaEm: string; // AAAA-MM-DD
  prazo: string; // AAAA-MM-DD
  /** Só existe quando a ocorrência já foi resolvida. */
  resolvidaEm?: string;
}

export type TipoTarefa = "rotina" | "tarefa" | "manutencao";

export type StatusTarefa =
  | "atrasada"
  | "em_andamento"
  | "pendente"
  | "a_fazer"
  | "concluida";

/** Item individual de trabalho: uma rotina, uma tarefa ou uma manutenção. */
export interface Tarefa {
  id: string;
  tipo: TipoTarefa;
  descricao: string;
  unidadeId: UnidadeId;
  responsavel: string;
  prazo: string; // AAAA-MM-DD
  status: StatusTarefa;
  prioridade: Prioridade;
}

/** Licença ou alvará com data de vencimento. */
export interface Renovacao {
  id: string;
  descricao: string;
  unidadeId: UnidadeId;
  vencimento: string; // AAAA-MM-DD
}

export interface DadosOperacionais {
  /** "Hoje" do painel, em AAAA-MM-DD. */
  dataReferencia: string;
  unidades: Unidade[];
  rotinasPorDia: RotinasDoDia[];
  ocorrencias: Ocorrencia[];
  tarefas: Tarefa[];
  renovacoes: Renovacao[];
}