/** Tipos compartilhados do BEVOX (Dashboard Geral). */

export type SerieKey = "documentos" | "tarefas" | "licencas" | "unidades";
export type Periodo = "30d" | "6m" | "1a";

export interface PontoSerie extends Record<SerieKey, number> {
  rotulo: string;
}

export interface Usuario {
  nome: string;
  primeiroNome: string;
  iniciais: string;
  perfil: string;
}

export interface Empresa {
  nome: string;
  status: "Ativa" | "Inativa";
  sede: string;
  slogan: string;
}

export interface Unidade {
  id: string;
  nome: string;
  tipo: "matriz" | "filial";
  ativa: boolean;
  documentos: number;
}

export interface ResumoOperacional {
  documentosPendentes: number;
  tarefasEmAndamento: number;
  tarefasAtrasadas: number;
  licencasVigentes: number;
  licencasVencendo: number;
}

export interface HistoricoSeries {
  /** Pontos anteriores ao momento atual (o ponto atual é calculado). */
  semanal: PontoSerie[];
  mensal: PontoSerie[];
}

export type StatusTarefa =
  | "atrasada"
  | "andamento"
  | "pendente"
  | "agendada"
  | "concluida";
export type TarefaIcone =
  | "licenca"
  | "documento"
  | "alvara"
  | "vistoria"
  | "cadastro";

export interface Tarefa {
  id: string;
  titulo: string;
  unidade: string;
  categoria: string;
  status: StatusTarefa;
  /** Data ISO (AAAA-MM-DD). */
  prazo: string;
  icone: TarefaIcone;
}

export type AlertaTipo =
  | "licenca"
  | "documento_pendente"
  | "tarefa"
  | "aprovado"
  | "reuniao";

export interface Alerta {
  id: string;
  tipo: AlertaTipo;
  titulo: string;
  descricao: string;
  /** Data e hora ISO com fuso. */
  ocorridoEm: string;
}

export interface DashboardData {
  /** Indica que os dados são demonstrativos (sem backend). */
  demonstrativo: boolean;
  /** Data de referência dos dados (AAAA-MM-DD). */
  dataReferencia: string;
  usuario: Usuario;
  empresa: Empresa;
  unidades: Unidade[];
  resumo: ResumoOperacional;
  historico: HistoricoSeries;
  tarefasRecentes: Tarefa[];
  alertas: Alerta[];
  ultimaSincronizacao: string | null;
}

/** Dados demonstrativos da tela Gestão de Unidades. */
export type SituacaoUnidade = "Regular" | "Atenção" | "Crítica";
export interface UnidadeOperacional {
  id: string; nome: string; subtipo: string; cnpj: string; cidade: string;
  tipo: "Matriz" | "Filial"; responsavel: string; funcionarios: number;
  documentosPendentes: number; tarefasAtrasadas: number; licencasVencendo: number;
  situacao: SituacaoUnidade;
}
export interface HistoricoUnidadesStatus {
  mes: string; ativas: number; pendencias: number; inativas: number; novas: number;
}
