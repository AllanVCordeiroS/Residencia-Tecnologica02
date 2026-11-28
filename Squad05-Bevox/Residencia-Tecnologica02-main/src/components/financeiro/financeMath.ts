import type { FinanceEntry, FinancePeriod, FinanceRange } from "@/types/finance";

export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dateLabel = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("pt-BR");
export function parseFinanceAmount(raw: string): number {
  const value = raw.trim();
  if (/^(?:\d{1,3}(?:\.\d{3})+|\d+),\d{1,2}$/.test(value)) return Number(value.replaceAll(".", "").replace(",", "."));
  if (/^\d{1,3}(?:\.\d{3})+$/.test(value)) return Number(value.replaceAll(".", ""));
  if (/^\d+(?:\.\d{1,2})?$/.test(value)) return Number(value);
  return NaN;
}
export const dateISO = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
export function periodRange(period: FinancePeriod, now = new Date()): FinanceRange {
  const year = now.getFullYear(), month = now.getMonth();
  const shift = period === "previous" ? -1 : 0;
  const months = period === "6months" ? 6 : period === "3months" ? 3 : 1;
  return {
    start: dateISO(new Date(year, period === "year" ? 0 : month + shift - months + 1, 1)),
    end: dateISO(new Date(year, month + shift + 1, 0)),
  };
}
export function previousRange(range: FinanceRange): FinanceRange {
  const start = new Date(range.start + "T12:00:00"), end = new Date(range.end + "T12:00:00");
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
  return { start: dateISO(new Date(start.getFullYear(), start.getMonth() - months, 1)), end: dateISO(new Date(start.getFullYear(), start.getMonth(), 0)) };
}
export function filterFinance(entries: FinanceEntry[], range: FinanceRange, unit = "") {
  return entries.filter((e) => (!unit || e.unidade === unit) && e.dataLancamento >= range.start && e.dataLancamento <= range.end);
}
export const sumFinance = (entries: FinanceEntry[]) => entries.reduce((sum, entry) => sum + Math.round(entry.valor * 100), 0) / 100;
export function variation(current: number, previous: number) {
  return previous === 0 ? "Sem base no período anterior" : ((current - previous) / previous * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1, signDisplay: "always" }) + "% ante período anterior";
}
export function entryStatus(entry: FinanceEntry, today: string) {
  if (entry.status === "Realizado") return entry.tipo === "Receita" ? "Recebido" : "Pago";
  if (entry.dataVencimento < today) return "Em atraso";
  const limit = new Date(today + "T12:00:00"); limit.setDate(limit.getDate() + 7);
  if (entry.dataVencimento <= dateISO(limit)) return "A vencer";
  return entry.tipo === "Receita" ? "A receber" : "Em dia";
}
export function monthlyFinance(entries: FinanceEntry[], range: FinanceRange) {
  const cursor = new Date(range.start + "T12:00:00"), end = new Date(range.end + "T12:00:00");
  const rows = [];
  while (cursor <= end) {
    const prefix = dateISO(cursor).slice(0, 7);
    const month = entries.filter((e) => e.dataLancamento.startsWith(prefix));
    rows.push({ date: prefix, label: cursor.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), Receitas: sumFinance(month.filter((e) => e.tipo === "Receita")), Despesas: sumFinance(month.filter((e) => e.tipo === "Despesa")) });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return rows;
}
export function forecastFinance(entries: FinanceEntry[], today: string) {
  return Array.from({ length: 30 }, (_, index) => {
    const day = new Date(today + "T12:00:00"); day.setDate(day.getDate() + index);
    const date = dateISO(day);
    const due = entries.filter((e) => e.status === "Pendente" && e.dataVencimento === date);
    return { date, label: dateLabel(date), Entradas: sumFinance(due.filter((e) => e.tipo === "Receita")), Saídas: sumFinance(due.filter((e) => e.tipo === "Despesa")) };
  });
}
export function financeCSV(entries: FinanceEntry[]) {
  // Mesmo padrão de Blob/BOM/separador das licenças, com proteção de fórmulas.
  const cell = (value: string | number) => {
    let text = String(value);
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const rows = [["Tipo", "Descrição", "Contraparte", "Unidade", "Categoria", "Valor BRL", "Lançamento", "Vencimento", "Status", "Forma", "Origem", "Observação"],
    ...entries.map((e) => [e.tipo, e.descricao, e.contraparte, e.unidadeNome, e.categoria, e.valor.toFixed(2).replace(".", ","), e.dataLancamento, e.dataVencimento, e.status, e.formaPagamento, e.demonstrativo ? "Demonstrativo" : "Cadastro local em memória", e.observacao])];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}
