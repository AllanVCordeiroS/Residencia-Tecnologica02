"use client";

import { useRef, useState } from "react";
import { AlertTriangle, BarChart3, Building2, Check, Download, FileSpreadsheet, FileText, RefreshCw, Wallet, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFinanceQuery } from "@/components/financeiro/useFinanceQuery";
import { money, sumFinance, variation } from "@/components/financeiro/financeMath";
import { Cell, Pie, PieChart } from "recharts";
import { useTasksQuery } from "@/hooks/queries/useTasksQuery";
import { useDocumentsQuery } from "@/hooks/queries/useDocumentsQuery";
import { useLicensesQuery } from "@/hooks/queries/useLicensesQuery";
import { useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { useOccurrencesQuery } from "@/hooks/queries/useOccurrencesQuery";
import IndicatorEvolution from "./IndicatorEvolution";
import ReportExportModal from "./ReportExportModal";
import { buildReportRecords, comparisonRange, completionRate, filterReportRecords, localIso, normalizeUnit, periodRange, reportCategories, unitPerformance, type ReportCategory, type ReportRecord } from "./reportData";

const panel = "min-w-0 rounded-2xl border border-slate-100 dark:border-line bg-white dark:bg-surface-raised p-4 shadow-sm";
const muted = "text-xs text-slate-500 dark:text-foreground-muted";
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-line px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-50";
const rate = (value: number | null) => value === null ? "Sem registros" : `${value.toLocaleString("pt-BR")}%`;
const chartTooltip = { backgroundColor: "var(--surface-raised)", color: "var(--foreground)", border: "1px solid var(--line)" };
const basis = "Situação atual dos registros, agrupada por prazo de tarefa, vencimento documental e data do evento e lançamento financeiro. Não há histórico de alterações de status. Registros sem data entram apenas em Todo o período. Documentos incluem licenças e alvarás. Finanças incluem lançamentos demonstrativos e cadastros locais em memória, sem comprovação financeira.";

export default function ReportsDashboard() {
  const tasks = useTasksQuery();
  const documents = useDocumentsQuery();
  const licenses = useLicensesQuery();
  const units = useUnitsQuery();
  const occurrences = useOccurrencesQuery();
  const finance = useFinanceQuery();
  const queries = [tasks, documents, licenses, units, occurrences, finance];
  const loading = queries.some(query => query.isPending);
  const failed = queries.some(query => query.isError);
  const fetching = queries.some(query => query.isFetching);
  const [now, setNow] = useState(() => new Date());
  const [period, setPeriod] = useState("Este mês");
  const [unit, setUnit] = useState("Todas as unidades");
  const [category, setCategory] = useState("Todas as categorias");
  const [comparison, setComparison] = useState("Período anterior");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState<ReportCategory>("Operacional");
  const [notice, setNotice] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [detail, setDetail] = useState<ReportRecord | null>(null);
  const [page, setPage] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const today = localIso(now);
  const records = buildReportRecords(tasks.data ?? [], documents.data ?? [], licenses.data ?? [], occurrences.data ?? [], units.data ?? [], today, finance.data ?? []);
  const range = periodRange(period, now);
  const previousRange = comparisonRange(range, comparison);
  const filtered = filterReportRecords(records, range, unit, category, search);
  const previous = previousRange ? filterReportRecords(records, previousRange, unit, category, search) : [];
  const financeRows = (finance.data ?? []).filter(entry => filtered.some(record => record.id === `finance-${entry.id}`));
  const expenses = financeRows.filter(entry => entry.tipo === "Despesa");
  const previousExpenses = (finance.data ?? []).filter(entry => entry.tipo === "Despesa" && previous.some(record => record.id === `finance-${entry.id}`));
  const totalExpenses = sumFinance(expenses);
  const colors = ["#2864f0", "#06b6d4", "#f59e0b", "#a855f7", "#10b981"];
  const costs = [...new Set(expenses.map(entry => entry.categoria))].sort().map((name, index) => {
    const total = sumFinance(expenses.filter(entry => entry.categoria === name));
    return { name, value: totalExpenses ? Math.round(total / totalExpenses * 1000) / 10 : 0, amount: money(total), total, color: colors[index % colors.length] };
  });
  const performance = unitPerformance(filtered);
  const availableUnits = [...new Set([...(units.data ?? []).map(item => item.nome), ...records.map(item => item.unit)])].sort();
  const selectedArea = category === "Todas as categorias" ? area : category as ReportCategory;
  const areaRows = filtered.filter(item => item.category === selectedArea);
  const previousArea = previous.filter(item => item.category === selectedArea);
  const taskRows = filtered.filter(item => item.category === "Tarefas");
  const docRows = filtered.filter(item => item.category === "Documentos");
  const activeUnits = (units.data ?? []).filter(item => item.ativa !== false && (unit === "Todas as unidades" || normalizeUnit(item.nome) === normalizeUnit(unit)));
  const comparisonText = (rows: ReportRecord[], older: ReportRecord[]) => {
    if (!previousRange) return "Comparação desativada";
    const currentRate = completionRate(rows), olderRate = completionRate(older);
    if (currentRate === null || olderRate === null) return "Sem base comparável";
    const difference = currentRate - olderRate;
    return `${difference > 0 ? "+" : ""}${difference.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} p.p. vs. ${previousRange.start} a ${previousRange.end}`;
  };
  const metrics = [
    { label: "Unidades operacionais", value: String(activeUnits.length), category: "Operacional", sub: "Cadastro atual de unidades ativas; sem histórico por período", icon: Building2 },
    { label: "Conclusão de tarefas", value: rate(completionRate(taskRows)), category: "Tarefas", sub: comparisonText(taskRows, previous.filter(item => item.category === "Tarefas")), icon: Check },
    { label: "Documentos regularizados", value: rate(completionRate(docRows)), category: "Documentos", sub: comparisonText(docRows, previous.filter(item => item.category === "Documentos")), icon: FileText },
    { label: "Despesas do período", value: expenses.length ? money(totalExpenses) : "Sem registros", category: "Financeiro", sub: `Despesas registradas (pendentes e realizadas). ${previousRange && previousExpenses.length ? variation(totalExpenses, sumFinance(previousExpenses)) : "Sem base comparável"}`, icon: Wallet },
  ].filter(item => category === "Todas as categorias" || item.category === category);
  const attention = filtered.filter(item => item.attention);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const safePage = Math.min(page, pageCount - 1);
  const reset = (setter: (value: string) => void, value: string) => { setter(value); setPage(0); };
  async function refresh() {
    setNotice("");
    const results = await Promise.all(queries.map(query => query.refetch()));
    setNow(new Date());
    setNotice(results.some(result => result.isError) ? "Não foi possível atualizar todas as fontes. Tente novamente." : "Relatórios atualizados com os registros disponíveis.");
  }
  function showDetail(record: ReportRecord) { setDetail(record); dialog.current?.showModal(); }
  const empty = <p className={`py-8 text-center ${muted}`}>Nenhum registro para os filtros selecionados.</p>;

  return <div className="min-w-0 space-y-5 text-slate-800 dark:text-foreground">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold tracking-tight">Relatórios e Indicadores</h1><p className={muted}>Acompanhe o desempenho operacional, financeiro e administrativo de todas as unidades.</p></div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <button className={button} disabled={loading || failed || !filtered.length} onClick={() => setExportOpen(true)}><Download size={15} />Exportar relatório</button>
        <button className={button} disabled={fetching} onClick={refresh}><RefreshCw size={14} className={fetching ? "animate-spin" : ""} />{fetching ? "Atualizando…" : "Atualizar dados"}</button>
      </div>
    </div>
    {notice && <div role="status" className={`${panel} flex items-center justify-between gap-3 text-xs`}>{notice}<button onClick={() => setNotice("")}>Fechar</button></div>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Período", value: period, options: ["Este mês", "Mês anterior", "Últimos 30 dias", "Últimos 90 dias", "Este ano", "Todo o período"], setter: setPeriod },
        { label: "Unidade", value: unit, options: ["Todas as unidades", ...availableUnits], setter: setUnit },
        { label: "Categoria", value: category, options: ["Todas as categorias", ...reportCategories], setter: setCategory },
        { label: "Comparação", value: comparison, options: ["Período anterior", "Mesmo período do ano passado", "Sem comparação"], setter: setComparison },
      ].map(filter => <label key={filter.label} className={muted}>{filter.label}<select className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-line bg-white dark:bg-surface-raised px-3 text-xs text-slate-800 dark:text-foreground focus:ring-2 focus:ring-blue-500" value={filter.value} onChange={event => reset(filter.setter, event.target.value)}>{filter.options.map(option => <option key={option}>{option}</option>)}</select></label>)}
    </div>
    <label className={`block ${muted}`}>Pesquisar nos relatórios<input type="search" value={search} onChange={event => reset(setSearch, event.target.value)} placeholder="Título, unidade, categoria ou situação" className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-line bg-white dark:bg-surface-raised px-3 text-sm text-slate-800 dark:text-foreground focus:ring-2 focus:ring-blue-500" /></label>
    <p className={muted}>{basis} {range && `Período: ${range.start} a ${range.end}.`} {period === "Todo o período" && comparison !== "Sem comparação" && "Comparação indisponível sem intervalo delimitado."}</p>
    {loading ? <div role="status" className={panel}>Carregando fontes dos relatórios…</div> : failed ? <div role="alert" className={panel}><p>Não foi possível carregar todas as fontes dos relatórios.</p><button className={`${button} mt-3`} onClick={refresh}>Tentar novamente</button></div> : <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(metric => <div key={metric.label} className={panel}><div className="flex items-start gap-3"><span className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-600 dark:text-blue-300"><metric.icon size={20} /></span><div className="min-w-0"><p className={muted}>{metric.label}</p><p className="my-1 break-words text-2xl font-bold">{metric.value}</p><p className={muted}>{metric.sub}</p></div></div></div>)}</div>
      {!filtered.length && <div role="status" className={panel}>{empty}</div>}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <IndicatorEvolution records={filtered} previous={previous} range={range} previousRange={previousRange} category={category} />
        <section className={`${panel} xl:col-span-3`}><h2 className="flex items-center gap-2 text-sm font-bold"><Wallet size={16} />Despesas por categoria</h2><p className={`mt-1 ${muted}`}>Despesas registradas, incluindo pendentes. Fontes demonstrativas e locais.</p>{costs.length ? <><div className="mt-3 h-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={costs} dataKey="total" nameKey="name" innerRadius="55%" outerRadius="85%">{costs.map(cost => <Cell key={cost.name} fill={cost.color} />)}</Pie><Tooltip contentStyle={chartTooltip} formatter={value => money(Number(value))} /></PieChart></ResponsiveContainer></div><p className="text-center text-sm font-bold">{money(totalExpenses)}</p><ul className="mt-3 space-y-2 text-xs">{costs.map(cost => <li key={cost.name} className="flex justify-between gap-2"><span>{cost.name}</span><span>{cost.value}% · {cost.amount}</span></li>)}</ul></> : empty}</section>
        <section className={`${panel} xl:col-span-4`}><h2 className="flex items-center gap-2 text-sm font-bold"><BarChart3 size={16} />Desempenho por unidade</h2><p className={`mt-1 ${muted}`}>Tarefas concluídas (azul) e documentos regulares (verde), quando há registros.</p>{performance.some(item => item.tasks !== null || item.docs !== null) ? <div className="mt-3 h-56 min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={performance} margin={{ top: 8, right: 8, left: -20, bottom: 20 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--chart-axis)" }} /><YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{ fontSize: 10, fill: "var(--chart-axis)" }} /><Tooltip contentStyle={chartTooltip} formatter={value => `${value}%`} />{(category === "Todas as categorias" || category === "Tarefas") && <Bar dataKey="tasks" name="Tarefas" fill="#2864f0" radius={[3, 3, 0, 0]} />}{(category === "Todas as categorias" || category === "Documentos") && <Bar dataKey="docs" name="Documentos" fill="#10b981" radius={[3, 3, 0, 0]} />}</BarChart></ResponsiveContainer></div> : empty}</section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className={`${panel} xl:col-span-4`}><h2 className="text-sm font-bold">Indicadores por área</h2><div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-surface-muted p-1">{reportCategories.map(item => <button key={item} aria-pressed={selectedArea === item} onClick={() => { setArea(item); if (category !== "Todas as categorias") setCategory(item); setPage(0); }} className={`rounded-lg px-2 py-2 text-xs ${selectedArea === item ? "bg-blue-600 text-white" : muted}`}>{item}</button>)}</div>{selectedArea === "Financeiro" ? <dl className="mt-4 space-y-3 text-xs">{[["Despesas registradas", money(totalExpenses)], ["Despesas pagas", money(sumFinance(expenses.filter(entry => entry.status === "Realizado")))], ["Despesas pendentes", money(sumFinance(expenses.filter(entry => entry.status === "Pendente")))], ["Receitas registradas", money(sumFinance(financeRows.filter(entry => entry.tipo === "Receita")))]].map(([label, value]) => <div key={label} className="flex justify-between gap-2"><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <dl className="mt-3 space-y-3 text-xs">{[["Registros", String(areaRows.length)], ["Regularizados / concluídos", rate(completionRate(areaRows))], ["Pendentes de atenção", String(areaRows.filter(row => row.attention).length)], ["Comparação", comparisonText(areaRows, previousArea)]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-slate-100 dark:border-line py-2"><dt>{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl>}</section>
        <section className={`${panel} xl:col-span-5`}><h2 className="flex items-center gap-2 text-sm font-bold"><FileSpreadsheet size={16} />Comparativo entre unidades</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[440px] text-left text-xs"><caption className={`mb-2 text-left ${muted}`}>Percentuais sem registros são exibidos como ausentes.</caption><thead><tr>{["Unidade", "Tarefas", "Docs.", "Ocorrências abertas"].map(label => <th key={label} scope="col" className="px-2 py-2">{label}</th>)}</tr></thead><tbody>{performance.map(item => <tr key={item.name} className="border-t border-slate-100 dark:border-line"><td className="px-2 py-3">{item.name}</td><td className="px-2 py-3">{rate(item.tasks)}</td><td className="px-2 py-3">{rate(item.docs)}</td><td className="px-2 py-3">{item.occurrences}</td></tr>)}</tbody></table>{!performance.length && empty}</div></section>
        <section className={`${panel} xl:col-span-3`}><h2 className="flex items-center gap-2 text-sm font-bold"><AlertTriangle size={16} />Pontos de atenção</h2><p className={`my-3 ${muted}`}>{attention.length} registro(s) no recorte atual exigem acompanhamento.</p><div className="max-h-72 space-y-2 overflow-y-auto">{attention.slice(0, 10).map(record => <button key={record.id} className="w-full rounded-xl border border-slate-100 dark:border-line bg-slate-50 dark:bg-surface-muted p-3 text-left text-xs hover:underline" onClick={() => showDetail(record)}><b>{record.title}</b><span className={`mt-1 block ${muted}`}>{record.unit} · {record.status}</span></button>)}</div></section>
      </div>
      <section className={panel}><h2 className="text-sm font-bold">Relatórios disponíveis · registros detalhados</h2><p className={`mt-1 ${muted}`}>A pesquisa e os filtros também se aplicam aos detalhes e às exportações.</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr>{["Registro", "Unidade", "Categoria", "Data de referência", "Situação", "Ação"].map(label => <th key={label} scope="col" className="px-2 py-2">{label}</th>)}</tr></thead><tbody>{filtered.slice(safePage * 10, safePage * 10 + 10).map(record => <tr key={record.id} className="border-t border-slate-100 dark:border-line"><td className="max-w-60 px-2 py-3">{record.title}</td><td className="px-2 py-3">{record.unit}</td><td className="px-2 py-3">{record.category}</td><td className="px-2 py-3">{record.date ?? "Não informada"}<small className="block">{record.dateBasis}</small></td><td className="px-2 py-3">{record.status}</td><td className="px-2 py-3"><button className="text-blue-600 dark:text-blue-300 hover:underline" aria-label={`Ver detalhes de ${record.title}`} onClick={() => showDetail(record)}>Ver detalhes</button></td></tr>)}</tbody></table>{!filtered.length && empty}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs"><p>{filtered.length} registro(s) · Página {safePage + 1} de {pageCount}</p><div className="flex gap-2"><button className={button} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Anterior</button><button className={button} disabled={safePage + 1 >= pageCount} onClick={() => setPage(safePage + 1)}>Próxima</button></div></div></section>
    </>}
    <dialog ref={dialog} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); dialog.current?.close(); } }} aria-labelledby="report-detail-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 dark:border-line bg-white dark:bg-surface-raised p-5 text-slate-800 dark:text-foreground backdrop:bg-slate-950/60" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}><div className="flex justify-between gap-3"><h2 id="report-detail-title" className="text-lg font-bold">Detalhes do registro</h2><button aria-label="Fechar detalhes" onClick={() => dialog.current?.close()}><X size={20} /></button></div>{detail && <dl className="mt-4 space-y-3 break-words text-sm">{[["Registro", detail.title], ["Unidade", detail.unit], ["Categoria", detail.category], [detail.dateBasis, detail.date ?? "Não informada"], ["Situação atual", detail.status], ...(detail.amount !== undefined ? [["Valor", money(detail.amount)], ["Categoria financeira", detail.expenseCategory ?? ""], ["Origem", detail.source ?? ""]] : [])].map(([label, value]) => <div key={label}><dt className={muted}>{label}</dt><dd>{value}</dd></div>)}</dl>}</dialog>
    {exportOpen && <ReportExportModal isOpen onClose={() => setExportOpen(false)} onFeedback={setNotice} filters={{ period: `${period}${range ? ` (${range.start} a ${range.end})` : ""}`, unit, category, comparison: `${comparison}${previousRange ? ` (${previousRange.start} a ${previousRange.end})` : " (sem base de comparação)"}`, search, basis }} metrics={metrics.map(({ label, value, category, sub }) => ({ label, value, category, note: sub }))} units={performance} costs={costs} records={filtered} />}
  </div>;
}



