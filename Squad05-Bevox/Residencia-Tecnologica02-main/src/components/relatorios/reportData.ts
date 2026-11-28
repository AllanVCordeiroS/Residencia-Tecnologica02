import type { Task } from "@/types/task";
import type { LegalDocument } from "@/types/document";
import type { License } from "@/types/license";
import type { Occurrence } from "@/types/occurrence";
import type { OperationalUnit } from "@/types/unit";
import type { FinanceEntry } from "@/types/finance";

export const reportCategories = ["Operacional", "Financeiro", "Documentos", "Tarefas"] as const;
export type ReportCategory = typeof reportCategories[number];
export type ReportRecord = {
  id: string; title: string; unit: string; category: ReportCategory;
  date: string | null; dateBasis: string; status: string; complete: boolean; attention: boolean;
  amount?: number; expenseCategory?: string; financeType?: "Receita" | "Despesa"; source?: string;
};
export type DateRange = { start: string; end: string };
export const normalizeUnit = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[–—-]/g, " ").replace(/\bunidade\b/g, "").replace(/\s+/g, " ").trim();
export const isoDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const date = /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value.split("/").reverse().join("-") : value.slice(0, 10);
  const parsed = new Date(date + "T00:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : null;
};
export const localIso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function periodRange(period: string, now: Date): DateRange | null {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  if (period === "Todo o período") return null;
  if (period === "Este ano") start.setMonth(0, 1);
  else if (period === "Últimos 30 dias" || period === "Últimos 90 dias") start.setDate(start.getDate() - (period === "Últimos 30 dias" ? 29 : 89));
  else if (period === "Mês anterior") { start.setMonth(start.getMonth() - 1, 1); end.setDate(0); }
  else start.setDate(1);
  return { start: localIso(start), end: localIso(end) };
}

export function comparisonRange(range: DateRange | null, comparison: string): DateRange | null {
  if (!range || comparison === "Sem comparação") return null;
  const start = new Date(range.start + "T00:00:00Z");
  const end = new Date(range.end + "T00:00:00Z");
  if (comparison === "Mesmo período do ano passado") {
    const shiftYear = (date: Date) => {
      const month = date.getUTCMonth();
      date.setUTCFullYear(date.getUTCFullYear() - 1);
      if (date.getUTCMonth() !== month) date.setUTCDate(0);
      return date.toISOString().slice(0, 10);
    };
    return { start: shiftYear(start), end: shiftYear(end) };
  }
  const length = end.getTime() - start.getTime() + 86400000;
  return { start: new Date(start.getTime() - length).toISOString().slice(0, 10), end: new Date(start.getTime() - 86400000).toISOString().slice(0, 10) };
}

export function buildReportRecords(tasks: Task[], documents: LegalDocument[], licenses: License[], occurrences: Occurrence[], units: OperationalUnit[], today: string, finance: FinanceEntry[] = []): ReportRecord[] {
  const unitName = (value: string, id?: string) => units.find(unit => unit.id === id || normalizeUnit(unit.nome) === normalizeUnit(value))?.nome ?? value;
  return [
    ...tasks.map(task => ({ id: `task-${task.id}`, title: task.title, unit: unitName(task.unit), category: "Tarefas" as const, date: isoDate(task.dueDate), dateBasis: "Prazo", status: task.status, complete: task.status === "Concluída", attention: task.status !== "Concluída" && !!isoDate(task.dueDate) && task.dueDate < today })),
    ...documents.map(doc => ({ id: `doc-${doc.id}`, title: doc.title, unit: unitName(doc.unit), category: "Documentos" as const, date: isoDate(doc.dueDate), dateBasis: "Vencimento", status: doc.status, complete: doc.status === "Aprovado", attention: doc.status !== "Aprovado" })),
    ...licenses.map(license => {
      const date = isoDate(license.dataVencimento);
      const started = !license.dataEmissao || license.dataEmissao <= today;
      const days = date ? (Date.parse(date + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400000 : null;
      const status = !started ? "Ainda não vigente" : days === null ? "Vigência não informada" : days < 0 ? "Vencida" : days <= 60 ? "A vencer" : "Regular";
      return { id: license.id, title: `${license.tipoLicenca} · ${license.numeroDocumento}`, unit: unitName(license.unidadeNome, license.unidade), category: "Documentos" as const, date, dateBasis: "Vencimento da licença", status, complete: status === "Regular" || status === "A vencer", attention: status !== "Regular" };
    }),
    ...occurrences.map(item => ({ id: item.id, title: `${item.protocol} · ${item.title}`, unit: unitName(item.unitName, item.unitId), category: "Operacional" as const, date: isoDate(item.eventDate), dateBasis: "Data do evento", status: item.status, complete: item.status === "Resolvida", attention: item.status !== "Resolvida" })),
    ...finance.map(entry => ({ id: `finance-${entry.id}`, title: `${entry.tipo} · ${entry.descricao}`, unit: unitName(entry.unidadeNome, entry.unidade), category: "Financeiro" as const, date: isoDate(entry.dataLancamento), dateBasis: "Data de lançamento", status: entry.status, complete: entry.status === "Realizado", attention: entry.status === "Pendente" && entry.dataVencimento < today, amount: entry.valor, expenseCategory: entry.categoria, financeType: entry.tipo, source: entry.demonstrativo ? "Demonstrativo" : "Cadastro local em memória" })),
  ];
}

export function filterReportRecords(records: ReportRecord[], range: DateRange | null, unit: string, category: string, search = "") {
  const term = normalizeUnit(search);
  return records.filter(record => (!range || (!!record.date && record.date >= range.start && record.date <= range.end)) && (unit === "Todas as unidades" || normalizeUnit(record.unit) === normalizeUnit(unit)) && (category === "Todas as categorias" || record.category === category) && (!term || normalizeUnit(`${record.title} ${record.unit} ${record.status} ${record.category}`).includes(term)));
}

export function completionRate(records: ReportRecord[]): number | null {
  return records.length ? Math.round(records.filter(record => record.complete).length / records.length * 1000) / 10 : null;
}

export function unitPerformance(records: ReportRecord[]) {
  return [...new Set(records.map(record => record.unit))].sort().map(name => {
    const rows = records.filter(record => record.unit === name);
    return { name, tasks: completionRate(rows.filter(record => record.category === "Tarefas")), docs: completionRate(rows.filter(record => record.category === "Documentos")), occurrences: rows.filter(record => record.category === "Operacional" && !record.complete).length };
  });
}

// Cohorts by stored reference date, never a reconstruction of past status.
export function monthlyCohorts(records: ReportRecord[]) {
  const months = [...new Set(records.flatMap(record => record.date ? [record.date.slice(0, 7)] : []))].sort();
  return months.map(month => {
    const rows = records.filter(record => record.date?.startsWith(month));
    return { month, tasks: completionRate(rows.filter(row => row.category === "Tarefas")), docs: completionRate(rows.filter(row => row.category === "Documentos")), issues: completionRate(rows.filter(row => row.category === "Operacional")) };
  });
}

export const evolutionIndicators = [
  { id: "tasks", label: "Tarefas concluídas", category: "Tarefas", currency: false },
  { id: "docs", label: "Documentos regulares", category: "Documentos", currency: false },
  { id: "issues", label: "Ocorrências resolvidas", category: "Operacional", currency: false },
  { id: "expenses", label: "Despesas registradas", category: "Financeiro", currency: true },
  { id: "revenue", label: "Receitas registradas", category: "Financeiro", currency: true },
] as const;
export type EvolutionIndicator = typeof evolutionIndicators[number];

// Align calendar months relative to each interval's start. Missing observations stay null.
export function indicatorEvolution(current: ReportRecord[], previous: ReportRecord[], indicator: EvolutionIndicator, range: DateRange | null, previousRange: DateRange | null) {
  const relevant = (records: ReportRecord[]) => records.filter(row => row.date && row.category === indicator.category && (!indicator.currency || row.financeType === (indicator.id === "expenses" ? "Despesa" : "Receita")));
  const monthIndex = (date: string) => Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;
  const summarize = (records: ReportRecord[], interval: DateRange | null) => {
    const groups = new Map<number, { month: string; value: number | null; count: number }>();
    const selected = relevant(records);
    for (const month of [...new Set(selected.map(row => row.date!.slice(0, 7)))].sort()) {
      const rows = selected.filter(row => row.date!.startsWith(month));
      const value = indicator.currency ? rows.reduce((sum, row) => sum + Math.round((row.amount ?? 0) * 100), 0) / 100 : completionRate(rows);
      groups.set(interval ? monthIndex(month) - monthIndex(interval.start) : monthIndex(month), { month, value, count: rows.length });
    }
    return groups;
  };
  const currentMonths = summarize(current, range);
  const previousMonths = summarize(previousRange ? previous : [], previousRange);
  return [...new Set([...currentMonths.keys(), ...previousMonths.keys()])].sort((a, b) => a - b).map(key => ({
    label: range ? `Mês ${key + 1}` : currentMonths.get(key)!.month,
    currentMonth: currentMonths.get(key)?.month ?? null,
    previousMonth: previousMonths.get(key)?.month ?? null,
    current: currentMonths.get(key)?.value ?? null,
    previous: previousMonths.get(key)?.value ?? null,
    currentCount: currentMonths.get(key)?.count ?? 0,
    previousCount: previousMonths.get(key)?.count ?? 0,
  }));
}

