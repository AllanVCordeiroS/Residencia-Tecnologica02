import * as z from "zod";

export const serieKeySchema = z.enum([
  "documentos",
  "tarefas",
  "licencas",
  "unidades",
]);
export const periodoSchema = z.enum(["30d", "6m", "1a"]);

export const pontoSerieSchema = z.object({
  documentos: z.number(),
  tarefas: z.number(),
  licencas: z.number(),
  unidades: z.number(),
  rotulo: z.string(),
});

export const dashboardUsuarioSchema = z.object({
  nome: z.string(),
  primeiroNome: z.string(),
  iniciais: z.string(),
  perfil: z.string(),
});

export const empresaSchema = z.object({
  nome: z.string(),
  status: z.enum(["Ativa", "Inativa"]),
  sede: z.string(),
  slogan: z.string(),
});

export const unidadeSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.enum(["matriz", "filial"]),
  ativa: z.boolean(),
  documentos: z.number(),
});

export const resumoOperacionalSchema = z.object({
  documentosPendentes: z.number(),
  tarefasEmAndamento: z.number(),
  tarefasAtrasadas: z.number(),
  licencasVigentes: z.number(),
  licencasVencendo: z.number(),
});

export const historicoSeriesSchema = z.object({
  semanal: z.array(pontoSerieSchema),
  mensal: z.array(pontoSerieSchema),
});

export const statusTarefaSchema = z.enum([
  "atrasada",
  "andamento",
  "pendente",
  "agendada",
  "concluida",
]);
export const tarefaIconeSchema = z.enum([
  "licenca",
  "documento",
  "alvara",
  "vistoria",
  "cadastro",
]);

export const tarefaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  unidade: z.string(),
  categoria: z.string(),
  status: statusTarefaSchema,
  prazo: z.string(),
  icone: tarefaIconeSchema,
});

export const alertaTipoSchema = z.enum([
  "licenca",
  "documento_pendente",
  "tarefa",
  "aprovado",
  "reuniao",
]);

export const alertaSchema = z.object({
  id: z.string(),
  tipo: alertaTipoSchema,
  titulo: z.string(),
  descricao: z.string(),
  ocorridoEm: z.string(),
});

export const dashboardDataSchema = z.object({
  demonstrativo: z.boolean(),
  dataReferencia: z.string(),
  usuario: dashboardUsuarioSchema,
  empresa: empresaSchema,
  unidades: z.array(unidadeSchema),
  resumo: resumoOperacionalSchema,
  historico: historicoSeriesSchema,
  tarefasRecentes: z.array(tarefaSchema),
  alertas: z.array(alertaSchema),
  ultimaSincronizacao: z.string().nullable(),
});

export const situacaoUnidadeSchema = z.enum(["Regular", "Atenção", "Crítica"]);
export const unidadeOperacionalSchema = z.object({
  id: z.string(),
  nome: z.string(),
  subtipo: z.string(),
  cnpj: z.string(),
  cidade: z.string(),
  tipo: z.enum(["Matriz", "Filial"]),
  responsavel: z.string(),
  funcionarios: z.number(),
  documentosPendentes: z.number(),
  tarefasAtrasadas: z.number(),
  licencasVencendo: z.number(),
  situacao: situacaoUnidadeSchema,
});

export const historicoUnidadesStatusSchema = z.object({
  mes: z.string(),
  ativas: z.number(),
  pendencias: z.number(),
  inativas: z.number(),
  novas: z.number(),
});

export type SerieKey = z.infer<typeof serieKeySchema>;
export type Periodo = z.infer<typeof periodoSchema>;
export type PontoSerie = z.infer<typeof pontoSerieSchema>;
export type Usuario = z.infer<typeof dashboardUsuarioSchema>;
export type Empresa = z.infer<typeof empresaSchema>;
export type Unidade = z.infer<typeof unidadeSchema>;
export type ResumoOperacional = z.infer<typeof resumoOperacionalSchema>;
export type HistoricoSeries = z.infer<typeof historicoSeriesSchema>;
export type StatusTarefa = z.infer<typeof statusTarefaSchema>;
export type TarefaIcone = z.infer<typeof tarefaIconeSchema>;
export type Tarefa = z.infer<typeof tarefaSchema>;
export type AlertaTipo = z.infer<typeof alertaTipoSchema>;
export type Alerta = z.infer<typeof alertaSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
export type SituacaoUnidade = z.infer<typeof situacaoUnidadeSchema>;
export type UnidadeOperacional = z.infer<typeof unidadeOperacionalSchema>;
export type HistoricoUnidadesStatus = z.infer<
  typeof historicoUnidadesStatusSchema
>;
