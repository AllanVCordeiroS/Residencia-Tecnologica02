import type {
  Alerta,
  Empresa,
  HistoricoSeries,
  ResumoOperacional,
  Tarefa,
  Unidade,
  Usuario,
} from "@/types";

/** Apenas Dados Demonstrativos.Dados do Figma por enquanto. */

export const DATA_REFERENCIA_DEMO = "2026-04-17";

export const usuarioDemo: Usuario = {
  nome: "Ricardo Silveira",
  primeiroNome: "Ricardo",
  iniciais: "RS",
  perfil: "Administrador Geral",
};

export const empresaDemo: Empresa = {
  nome: "Adega Distribution",
  status: "Ativa",
  sede: "Matriz",
  slogan:
    "Conectando negócios, fortalecendo parcerias e distribuindo grandes momentos.",
};

export const unidadesDemo: Unidade[] = [
  { id: "u1", nome: "Matriz (Recife)", tipo: "matriz", ativa: true, documentos: 32 },
  { id: "u2", nome: "Unidade Paulista", tipo: "filial", ativa: true, documentos: 18 },
  { id: "u3", nome: "Unidade Jaboatão", tipo: "filial", ativa: true, documentos: 16 },
  { id: "u4", nome: "Unidade Olinda", tipo: "filial", ativa: true, documentos: 14 },
  { id: "u5", nome: "Unidade Cabo", tipo: "filial", ativa: true, documentos: 12 },
  { id: "u6", nome: "Unidade Igarassu", tipo: "filial", ativa: true, documentos: 10 },
  { id: "u7", nome: "Unidade Camaragibe", tipo: "filial", ativa: true, documentos: 10 },
  { id: "u8", nome: "Unidade Abreu e Lima", tipo: "filial", ativa: true, documentos: 12 },
];

export const resumoDemo: ResumoOperacional = {
  documentosPendentes: 12,
  tarefasEmAndamento: 36,
  tarefasAtrasadas: 8,
  licencasVigentes: 18,
  licencasVencendo: 3,
};

/** Histórico anterior ao ponto atual. */
export const historicoDemo: HistoricoSeries = {
  semanal: [
    { rotulo: "20/03", documentos: 108, tarefas: 31, licencas: 17, unidades: 6 },
    { rotulo: "27/03", documentos: 111, tarefas: 32, licencas: 17, unidades: 6 },
    { rotulo: "03/04", documentos: 115, tarefas: 34, licencas: 17, unidades: 6 },
    { rotulo: "10/04", documentos: 119, tarefas: 35, licencas: 18, unidades: 8 },
  ],
  mensal: [
    { rotulo: "Mai/2025", documentos: 40, tarefas: 22, licencas: 11, unidades: 4 },
    { rotulo: "Jun/2025", documentos: 46, tarefas: 24, licencas: 11, unidades: 4 },
    { rotulo: "Jul/2025", documentos: 53, tarefas: 21, licencas: 12, unidades: 4 },
    { rotulo: "Ago/2025", documentos: 60, tarefas: 25, licencas: 12, unidades: 5 },
    { rotulo: "Set/2025", documentos: 66, tarefas: 27, licencas: 13, unidades: 5 },
    { rotulo: "Out/2025", documentos: 73, tarefas: 26, licencas: 13, unidades: 5 },
    { rotulo: "Nov/2025", documentos: 82, tarefas: 29, licencas: 14, unidades: 5 },
    { rotulo: "Dez/2025", documentos: 90, tarefas: 28, licencas: 15, unidades: 6 },
    { rotulo: "Jan/2026", documentos: 97, tarefas: 31, licencas: 15, unidades: 6 },
    { rotulo: "Fev/2026", documentos: 104, tarefas: 30, licencas: 16, unidades: 6 },
    { rotulo: "Mar/2026", documentos: 112, tarefas: 33, licencas: 17, unidades: 6 },
  ],
};

export const tarefasRecentesDemo: Tarefa[] = [
  { id: "t1", titulo: "Renovar licença ambiental", unidade: "Unidade Matriz", categoria: "Meio Ambiente", status: "atrasada", prazo: "2026-04-16", icone: "licenca" },
  { id: "t2", titulo: "Enviar relatório mensal", unidade: "Matriz", categoria: "Financeiro", status: "andamento", prazo: "2026-04-18", icone: "documento" },
  { id: "t3", titulo: "Regularizar alvará de funcionamento", unidade: "Unidade Paulista", categoria: "Documentos", status: "pendente", prazo: "2026-04-22", icone: "alvara" },
  { id: "t4", titulo: "Vistoria dos bombeiros", unidade: "Unidade Jaboatão", categoria: "Licenças", status: "agendada", prazo: "2026-04-25", icone: "vistoria" },
  { id: "t5", titulo: "Atualizar dados cadastrais", unidade: "RH", categoria: "Funcionários", status: "concluida", prazo: "2026-04-15", icone: "cadastro" },
];

export const alertasDemo: Alerta[] = [
  { id: "a1", tipo: "licenca", titulo: "Licença ambiental vencendo", descricao: "Unidade Paulista • Vence em 5 dias.", ocorridoEm: "2026-04-17T09:30:00-03:00" },
  { id: "a2", tipo: "documento_pendente", titulo: "Documento pendente", descricao: "Alvará de funcionamento • Unidade Olinda.", ocorridoEm: "2026-04-17T08:15:00-03:00" },
  { id: "a3", tipo: "tarefa", titulo: "Nova tarefa atribuída", descricao: "Você foi atribuído à tarefa \"Relatório mensal\".", ocorridoEm: "2026-04-16T16:42:00-03:00" },
  { id: "a4", tipo: "aprovado", titulo: "Documento aprovado", descricao: "Certificado sanitário • Unidade Matriz.", ocorridoEm: "2026-04-16T11:20:00-03:00" },
  { id: "a5", tipo: "reuniao", titulo: "Reunião agendada", descricao: "Alinhamento de indicadores • 18/04 às 10:00.", ocorridoEm: "2026-04-16T10:12:00-03:00" },
];

import type { HistoricoUnidadesStatus, UnidadeOperacional } from "@/types";

export const unidadesOperacionaisDemo: UnidadeOperacional[] = [
  { id: "uo1", nome: "Matriz – Recife", subtipo: "Unidade principal", cnpj: "00.000.000/0001-00", cidade: "Recife/PE", tipo: "Matriz", responsavel: "Carlos Eduardo", funcionarios: 42, documentosPendentes: 2, tarefasAtrasadas: 0, licencasVencendo: 0, situacao: "Regular" },
  { id: "uo2", nome: "Unidade Paulista", subtipo: "Filial", cnpj: "00.000.000/0002-00", cidade: "Paulista/PE", tipo: "Filial", responsavel: "Ana Souza", funcionarios: 18, documentosPendentes: 0, tarefasAtrasadas: 1, licencasVencendo: 1, situacao: "Atenção" },
  { id: "uo3", nome: "Unidade Jaboatão", subtipo: "Filial", cnpj: "00.000.000/0003-00", cidade: "Jaboatão/PE", tipo: "Filial", responsavel: "Pedro Lima", funcionarios: 16, documentosPendentes: 2, tarefasAtrasadas: 2, licencasVencendo: 0, situacao: "Crítica" },
  { id: "uo4", nome: "Unidade Olinda", subtipo: "Filial", cnpj: "00.000.000/0004-00", cidade: "Olinda/PE", tipo: "Filial", responsavel: "Mariana Costa", funcionarios: 12, documentosPendentes: 0, tarefasAtrasadas: 0, licencasVencendo: 1, situacao: "Regular" },
  { id: "uo5", nome: "Unidade Cabo", subtipo: "Filial", cnpj: "00.000.000/0005-00", cidade: "Cabo de Santo Agostinho/PE", tipo: "Filial", responsavel: "Ricardo Alves", funcionarios: 9, documentosPendentes: 1, tarefasAtrasadas: 0, licencasVencendo: 0, situacao: "Atenção" },
  { id: "uo6", nome: "Unidade Vitória", subtipo: "Filial", cnpj: "00.000.000/0006-00", cidade: "Vitória de Santo Antão/PE", tipo: "Filial", responsavel: "Juliana Martins", funcionarios: 8, documentosPendentes: 0, tarefasAtrasadas: 1, licencasVencendo: 0, situacao: "Regular" },
  { id: "uo7", nome: "Unidade Caruaru", subtipo: "Filial", cnpj: "00.000.000/0007-00", cidade: "Caruaru/PE", tipo: "Filial", responsavel: "Felipe Rocha", funcionarios: 10, documentosPendentes: 1, tarefasAtrasadas: 0, licencasVencendo: 0, situacao: "Atenção" },
  { id: "uo8", nome: "Unidade Garanhuns", subtipo: "Filial", cnpj: "00.000.000/0008-00", cidade: "Garanhuns/PE", tipo: "Filial", responsavel: "Larissa Almeida", funcionarios: 7, documentosPendentes: 0, tarefasAtrasadas: 0, licencasVencendo: 0, situacao: "Regular" },
];

export const historicoUnidadesDemo: HistoricoUnidadesStatus[] = [
  { mes: "Nov/2025", ativas: 7, pendencias: 3.8, inativas: 0.6, novas: 0.2 },
  { mes: "Dez/2025", ativas: 7.3, pendencias: 4.1, inativas: 0.9, novas: 0.2 },
  { mes: "Jan/2026", ativas: 7.9, pendencias: 4.5, inativas: 1.5, novas: 0.5 },
  { mes: "Fev/2026", ativas: 7.3, pendencias: 4.3, inativas: 1.2, novas: 0.4 },
  { mes: "Mar/2026", ativas: 7.9, pendencias: 5.3, inativas: 1.7, novas: 0.7 },
  { mes: "Abr/2026", ativas: 8.2, pendencias: 5.8, inativas: 2.0, novas: 0.9 },
];
