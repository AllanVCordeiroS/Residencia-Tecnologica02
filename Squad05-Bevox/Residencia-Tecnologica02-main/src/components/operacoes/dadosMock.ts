// Dados de exemplo, iguais aos da imagem de referência.
// TODO (grupo): trocar pela API quando existir.
export const RESUMO = {
  previstas: 48,
  concluidas: 35,
  emAndamento: 7,
  pendentes: 0,
  atrasadas: 6,
  ocorrenciasAbertas: 7,
};

export const PERCENTUAL_CONCLUIDAS = Math.round(
  (RESUMO.concluidas / RESUMO.previstas) * 100,
);

// A cor é um valor hexadecimal porque o gráfico é desenhado em SVG,
// que não entende as classes do Tailwind.
export const STATUS_ROTINAS = [
  { chave: "concluidas", nome: "Concluídas", valor: RESUMO.concluidas, cor: "#10b981" },
  { chave: "emAndamento", nome: "Em andamento", valor: RESUMO.emAndamento, cor: "#3b82f6" },
  { chave: "pendentes", nome: "Pendentes", valor: RESUMO.pendentes, cor: "#94a3b8" },
  { chave: "atrasadas", nome: "Atrasadas", valor: RESUMO.atrasadas, cor: "#ef4444" },
];

export const ROTINAS_POR_UNIDADE = [
  { unidade: "Matriz — Recife", feitas: 9, total: 10, barra: "bg-emerald-500" },
  { unidade: "Unidade Paulista", feitas: 7, total: 10, barra: "bg-blue-500" },
  { unidade: "Unidade Jaboatão", feitas: 6, total: 10, barra: "bg-amber-500" },
  { unidade: "Unidade Caruaru", feitas: 5, total: 10, barra: "bg-violet-500" },
  { unidade: "Unidade Salvador", feitas: 3, total: 10, barra: "bg-slate-500" },
];