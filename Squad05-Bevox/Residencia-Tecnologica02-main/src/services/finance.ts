import { financeEntrySchema } from "@/schemas/finance";
import type { FinanceEntry, FinanceEntryFormValues } from "@/types/finance";
import { getOperationalUnits } from "@/services/units";

// Preserva contas e exemplos recentes das telas legadas, sem inventar movimento
// para justificar os antigos totais estáticos. Memória apenas nesta sessão.
const seed: [string, string, string, number, string, string, string, string, "Receita" | "Despesa", "Pendente" | "Realizado"][] = [
  ["1", "Ambev Brasil", "Compra de Chopp & Bebidas NF-e #90214", 24800, "uo1", "Matriz - Recife", "Estoque e Mercadorias", "2026-10-24", "Despesa", "Pendente"],
  ["2", "Copergás PE", "Gás Industrial & Caldeiras", 3420, "uo3", "CDD Jaboatão", "Infraestrutura", "2026-10-21", "Despesa", "Pendente"],
  ["3", "Transportadora Rapidão Cometa", "Frete e Distribuição Regional Lote 14", 6150, "uo4", "Filial Olinda", "Logística", "2026-10-28", "Despesa", "Pendente"],
  ["4", "Distribuidora Petrobras", "Combustível · Abastecimento Frota de Caminhões", 8900, "uo2", "Paulista", "Logística", "2026-11-02", "Despesa", "Pendente"],
  ["5", "Enel Distribuição Energia", "Fatura de Energia Elétrica Matriz", 5730, "uo5", "Cabo", "Infraestrutura", "2026-11-05", "Despesa", "Pendente"],
  ["6", "Cliente X", "Venda de bebidas - Cliente X", 12500, "uo1", "Matriz - Recife", "Vendas", "2026-10-26", "Receita", "Realizado"],
  ["7", "Fornecedor de bebidas", "Fornecedor de bebidas", 8500, "uo2", "Paulista", "Estoque e Mercadorias", "2026-10-25", "Despesa", "Realizado"],
];
let entries: FinanceEntry[] = seed.map(([id, contraparte, descricao, valor, unidade, unidadeNome, categoria, date, tipo, status]) => ({
  id, contraparte, descricao, valor, unidade, unidadeNome, categoria,
  dataLancamento: date, dataVencimento: date, tipo, status,
  formaPagamento: "Não informado", subcategoria: "", observacao: "", demonstrativo: true,
}));

/** Snapshot isolado; sem banco, API ou persistência após recarregar. */
export async function getFinanceEntries(): Promise<FinanceEntry[]> {
  return structuredClone(entries);
}

export async function saveFinanceEntry(input: FinanceEntryFormValues & { arquivo?: File }): Promise<FinanceEntry> {
  const values = financeEntrySchema.parse(input);
  if (input.arquivo && (input.arquivo.size > 10 * 1024 * 1024 || !/\.(pdf|jpe?g|png)$/i.test(input.arquivo.name))) throw new Error("Anexo inválido: use PDF, JPG ou PNG de até 10 MB.");
  const units = await getOperationalUnits();
  const unit = units.find((item) => item.id === values.unidade && item.ativa !== false);
  if (!unit) throw new Error("Selecione uma unidade ativa existente.");
  const entry: FinanceEntry = { ...values, arquivo: input.arquivo, id: globalThis.crypto.randomUUID(), unidadeNome: unit.nome, demonstrativo: false };
  entries = [entry, ...entries];
  return structuredClone(entry);
}
