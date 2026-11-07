import { somarDias } from "@/lib/datasOperacional";
import type {
  DadosOperacionais,
  Ocorrencia,
  Renovacao,
  RotinasDoDia,
  Tarefa,
  Unidade,
} from "@/types/operacional";

// Dados FICTÍCIOS, só para a tela funcionar até a integração com o banco.
export const DATA_REFERENCIA = "2026-04-17";

export const UNIDADES: Unidade[] = [
  { id: "recife", nome: "Matriz — Recife", barra: "bg-emerald-500" },
  { id: "paulista", nome: "Unidade Paulista", barra: "bg-blue-500" },
  { id: "jaboatao", nome: "Unidade Jaboatão", barra: "bg-amber-500" },
  { id: "caruaru", nome: "Unidade Caruaru", barra: "bg-violet-500" },
  { id: "salvador", nome: "Unidade Salvador", barra: "bg-slate-500" },
];

// "Hoje" fecha com os totais do desenho: 48 previstas, 35 concluídas,
// 7 em andamento, 0 pendentes e 6 atrasadas.
const ROTINAS_HOJE: RotinasDoDia[] = [
  { data: DATA_REFERENCIA, unidadeId: "recife", concluidas: 9, emAndamento: 1, pendentes: 0, atrasadas: 0 },
  { data: DATA_REFERENCIA, unidadeId: "paulista", concluidas: 8, emAndamento: 1, pendentes: 0, atrasadas: 1 },
  { data: DATA_REFERENCIA, unidadeId: "jaboatao", concluidas: 7, emAndamento: 1, pendentes: 0, atrasadas: 2 },
  { data: DATA_REFERENCIA, unidadeId: "caruaru", concluidas: 6, emAndamento: 2, pendentes: 0, atrasadas: 1 },
  { data: DATA_REFERENCIA, unidadeId: "salvador", concluidas: 5, emAndamento: 2, pendentes: 0, atrasadas: 2 },
];

// Histórico dos 59 dias anteriores, gerado sempre igual (números "aleatórios"
// com semente fixa), para os filtros de 7 e 30 dias terem o que somar.
function gerarHistorico(): RotinasDoDia[] {
  let semente = 17;
  const proximo = () => {
    semente = (semente * 48271) % 2147483647;
    return semente / 2147483647;
  };

  const linhas: RotinasDoDia[] = [];
  for (let atras = 1; atras <= 59; atras++) {
    for (const unidade of UNIDADES) {
      const previstas = 8 + Math.floor(proximo() * 3);
      const atrasadas = Math.floor(proximo() * 3);
      const emAndamento = Math.floor(proximo() * 3);
      const pendentes = Math.floor(proximo() * 2);
      const concluidas = Math.max(
        previstas - atrasadas - emAndamento - pendentes,
        0,
      );
      linhas.push({
        data: somarDias(DATA_REFERENCIA, -atras),
        unidadeId: unidade.id,
        concluidas,
        emAndamento,
        pendentes,
        atrasadas,
      });
    }
  }
  return linhas;
}

// 7 ocorrências abertas em "hoje" (1 por Recife, 2 por Paulista, 1 por
// Jaboatão, 1 por Caruaru e 2 por Salvador) e 3 já resolvidas.
const OCORRENCIAS: Ocorrencia[] = [
  { id: "oc-001", descricao: "Divergência no recebimento de mercadorias", unidadeId: "recife", responsavel: "Carlos Eduardo", status: "em_analise", prioridade: "alta", criadaEm: "2026-04-16", prazo: "2026-04-17" },
  { id: "oc-002", descricao: "Avaria no caminhão", unidadeId: "salvador", responsavel: "Felipe Rocha", status: "aberta", prioridade: "alta", criadaEm: "2026-04-17", prazo: "2026-04-19" },
  { id: "oc-003", descricao: "Falta de EPI na doca de carga", unidadeId: "paulista", responsavel: "Ana Souza", status: "em_andamento", prioridade: "media", criadaEm: "2026-04-12", prazo: "2026-04-20" },
  { id: "oc-004", descricao: "Temperatura acima do limite na câmara fria", unidadeId: "paulista", responsavel: "Ana Souza", status: "em_analise", prioridade: "alta", criadaEm: "2026-04-14", prazo: "2026-04-18" },
  { id: "oc-005", descricao: "Etiquetas ilegíveis em lote de cerveja", unidadeId: "jaboatao", responsavel: "Pedro Lima", status: "em_andamento", prioridade: "media", criadaEm: "2026-04-10", prazo: "2026-04-21" },
  { id: "oc-006", descricao: "Extravio de vasilhames retornáveis", unidadeId: "caruaru", responsavel: "Larissa Almeida", status: "em_analise", prioridade: "media", criadaEm: "2026-04-08", prazo: "2026-04-22" },
  { id: "oc-007", descricao: "Atraso na entrega a cliente de grande porte", unidadeId: "salvador", responsavel: "Felipe Rocha", status: "em_andamento", prioridade: "baixa", criadaEm: "2026-04-05", prazo: "2026-04-25" },
  { id: "oc-008", descricao: "Quebra de paletes no recebimento", unidadeId: "recife", responsavel: "Carlos Eduardo", status: "resolvida", prioridade: "media", criadaEm: "2026-03-28", prazo: "2026-04-03", resolvidaEm: "2026-04-02" },
  { id: "oc-009", descricao: "Divergência de nota fiscal", unidadeId: "jaboatao", responsavel: "Pedro Lima", status: "resolvida", prioridade: "baixa", criadaEm: "2026-04-01", prazo: "2026-04-10", resolvidaEm: "2026-04-09" },
  { id: "oc-010", descricao: "Falha na balança da expedição", unidadeId: "caruaru", responsavel: "Larissa Almeida", status: "resolvida", prioridade: "media", criadaEm: "2026-03-15", prazo: "2026-04-06", resolvidaEm: "2026-04-05" },
];

// Itens individuais. As 6 rotinas atrasadas e as 7 em andamento fecham com os
// totais de ROTINAS_HOJE (por unidade). Há também 3 tarefas/manutenções
// abertas e 2 manutenções concluídas.
const TAREFAS: Tarefa[] = [
  { id: "tf-001", tipo: "rotina", descricao: "Contagem de paletes", unidadeId: "paulista", responsavel: "Ana Souza", prazo: "2026-04-16", status: "atrasada", prioridade: "alta" },
  { id: "tf-002", tipo: "rotina", descricao: "Inspeção de extintores", unidadeId: "jaboatao", responsavel: "Pedro Lima", prazo: "2026-04-15", status: "atrasada", prioridade: "media" },
  { id: "tf-003", tipo: "rotina", descricao: "Limpeza da câmara fria", unidadeId: "jaboatao", responsavel: "Pedro Lima", prazo: "2026-04-16", status: "atrasada", prioridade: "alta" },
  { id: "tf-004", tipo: "rotina", descricao: "Checklist de veículos", unidadeId: "caruaru", responsavel: "Larissa Almeida", prazo: "2026-04-16", status: "atrasada", prioridade: "media" },
  { id: "tf-005", tipo: "rotina", descricao: "Conferência de vasilhames", unidadeId: "salvador", responsavel: "Felipe Rocha", prazo: "2026-04-15", status: "atrasada", prioridade: "alta" },
  { id: "tf-006", tipo: "rotina", descricao: "Inventário rotativo", unidadeId: "salvador", responsavel: "Felipe Rocha", prazo: "2026-04-16", status: "atrasada", prioridade: "media" },
  { id: "tf-007", tipo: "rotina", descricao: "Conferência de estoque", unidadeId: "paulista", responsavel: "Ana Souza", prazo: "2026-04-17", status: "em_andamento", prioridade: "alta" },
  { id: "tf-008", tipo: "rotina", descricao: "Recebimento de mercadorias", unidadeId: "recife", responsavel: "Carlos Eduardo", prazo: "2026-04-17", status: "em_andamento", prioridade: "media" },
  { id: "tf-009", tipo: "rotina", descricao: "Separação de pedidos", unidadeId: "jaboatao", responsavel: "Pedro Lima", prazo: "2026-04-17", status: "em_andamento", prioridade: "media" },
  { id: "tf-010", tipo: "rotina", descricao: "Roteirização das entregas", unidadeId: "caruaru", responsavel: "Larissa Almeida", prazo: "2026-04-17", status: "em_andamento", prioridade: "media" },
  { id: "tf-011", tipo: "rotina", descricao: "Carregamento de caminhões", unidadeId: "caruaru", responsavel: "Larissa Almeida", prazo: "2026-04-17", status: "em_andamento", prioridade: "alta" },
  { id: "tf-012", tipo: "rotina", descricao: "Conferência de notas fiscais", unidadeId: "salvador", responsavel: "Felipe Rocha", prazo: "2026-04-17", status: "em_andamento", prioridade: "media" },
  { id: "tf-013", tipo: "rotina", descricao: "Expedição da tarde", unidadeId: "salvador", responsavel: "Felipe Rocha", prazo: "2026-04-17", status: "em_andamento", prioridade: "baixa" },
  { id: "tf-014", tipo: "tarefa", descricao: "Relatório operacional mensal", unidadeId: "caruaru", responsavel: "Larissa Almeida", prazo: "2026-04-20", status: "a_fazer", prioridade: "media" },
  { id: "tf-015", tipo: "tarefa", descricao: "Inspeção de equipamentos", unidadeId: "jaboatao", responsavel: "Pedro Lima", prazo: "2026-04-18", status: "pendente", prioridade: "media" },
  { id: "tf-016", tipo: "manutencao", descricao: "Revisão do compressor da câmara fria", unidadeId: "jaboatao", responsavel: "Equipe de manutenção", prazo: "2026-04-24", status: "pendente", prioridade: "alta" },
  { id: "tf-017", tipo: "manutencao", descricao: "Troca de correias da esteira de expedição", unidadeId: "recife", responsavel: "Equipe de manutenção", prazo: "2026-04-12", status: "concluida", prioridade: "media" },
  { id: "tf-018", tipo: "manutencao", descricao: "Calibração das balanças", unidadeId: "caruaru", responsavel: "Equipe de manutenção", prazo: "2026-04-14", status: "concluida", prioridade: "media" },
];

// 3 vencem nos próximos 30 dias (até 17/05); uma vence depois e uma já venceu.
const RENOVACOES: Renovacao[] = [
  { id: "rn-001", descricao: "Alvará sanitário", unidadeId: "recife", vencimento: "2026-04-28" },
  { id: "rn-002", descricao: "Licença ambiental", unidadeId: "paulista", vencimento: "2026-05-06" },
  { id: "rn-003", descricao: "Certificado do Corpo de Bombeiros", unidadeId: "caruaru", vencimento: "2026-05-12" },
  { id: "rn-004", descricao: "Licença de funcionamento", unidadeId: "salvador", vencimento: "2026-07-20" },
  { id: "rn-005", descricao: "Alvará municipal", unidadeId: "jaboatao", vencimento: "2026-04-10" },
];

export const DADOS_MOCK: DadosOperacionais = {
  dataReferencia: DATA_REFERENCIA,
  unidades: UNIDADES,
  rotinasPorDia: [...ROTINAS_HOJE, ...gerarHistorico()],
  ocorrencias: OCORRENCIAS,
  tarefas: TAREFAS,
  renovacoes: RENOVACOES,
};