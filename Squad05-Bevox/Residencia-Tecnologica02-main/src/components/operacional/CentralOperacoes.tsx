"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Eye,
  MoreVertical,
  Plus,
  RotateCcw,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/Card";
import { useOccurrencesQuery } from "@/hooks/queries/useOccurrencesQuery";
import { useTasksQuery } from "@/hooks/queries/useTasksQuery";
import { useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { DATA_REFERENCIA_DEMO } from "@/data/mockData";
import type { Task } from "@/types/task";
import type { Occurrence, OccurrenceSeverity } from "@/types/occurrence";

type RecentTab = "Tarefas" | "Ocorrências";
type Period = "Hoje" | "7 dias" | "30 dias";

const routineBase = [
  { unitId: "uo1", name: "Matriz – Recife", planned: 10, completed: 9, inProgress: 1, overdue: 0 },
  { unitId: "uo2", name: "Unidade Paulista", planned: 9, completed: 7, inProgress: 1, overdue: 1 },
  { unitId: "uo3", name: "Unidade Jaboatão", planned: 8, completed: 6, inProgress: 1, overdue: 1 },
  { unitId: "uo4", name: "Unidade Olinda", planned: 7, completed: 5, inProgress: 1, overdue: 1 },
  { unitId: "uo5", name: "Unidade Cabo", planned: 14, completed: 8, inProgress: 3, overdue: 3 },
];

const periodMultiplier: Record<Period, number> = { Hoje: 1, "7 dias": 6, "30 dias": 26 };
const chartColors = ["#10b981", "#3b82f6", "#dbe3ef", "#f43f5e"];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[–—-]/g, " ").replace(/\bunidade\b/g, "").replace(/\s+/g, " ").trim();
}

function taskBelongsToUnit(task: Task, unitName: string) {
  const taskName = normalize(task.unit);
  const selectedName = normalize(unitName);
  return taskName.includes(selectedName) || selectedName.includes(taskName);
}


function shortDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function SeverityBadge({ value }: { value: OccurrenceSeverity }) {
  const styles: Record<OccurrenceSeverity, string> = {
    Crítica: "bg-red-600 text-white",
    Alta: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    Média: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    Baixa: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[value]}`}>{value}</span>;
}

function OccurrenceStatusBadge({ value }: { value: Occurrence["status"] }) {
  const styles: Record<Occurrence["status"], string> = {
    "Em Análise": "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    "Aguardando Glosa": "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    Resolvida: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    "Em Oficina": "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    Apuração: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${styles[value]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{value}</span>;
}

function TaskStatusBadge({ task }: { task: Task }) {
  const status = task.status === "A fazer" ? "Pendente" : task.status;
  const styles: Record<string, string> = {
    "Pendente": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    "Em andamento": "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    "Em revisão": "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    "Concluída": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${styles[status] ?? styles.Pendente}`}>{status}</span>;
}

function OccurrenceDetails({ occurrence, onClose }: { occurrence: Occurrence; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="occurrence-details-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white p-5 shadow-2xl dark:bg-surface-raised sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{occurrence.protocol}</span><OccurrenceStatusBadge value={occurrence.status} /></div>
            <h2 id="occurrence-details-title" className="text-lg font-bold text-slate-900 dark:text-foreground">{occurrence.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar detalhes" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-muted"><X size={18} /></button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Detail label="Tipo" value={occurrence.kind} />
          <Detail label="Categoria" value={occurrence.category} />
          <Detail label="Unidade afetada" value={occurrence.unitName} />
          <Detail label="Responsável / condutor" value={occurrence.driver || occurrence.owner} />
          <Detail label="Data e hora" value={`${shortDate(occurrence.eventDate)} às ${occurrence.eventTime}`} />
          <Detail label="Prazo de resolução" value={shortDate(occurrence.resolutionDeadline)} />
          <Detail label="Gravidade" value={<SeverityBadge value={occurrence.severity} />} />
          <Detail label="Prioridade" value={<SeverityBadge value={occurrence.priority} />} />
          <div className="sm:col-span-2"><Detail label="Descrição" value={occurrence.description} /></div>
          {occurrence.observations && <div className="sm:col-span-2"><Detail label="Observações adicionais" value={occurrence.observations} /></div>}
        </div>
        <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:bg-surface-muted dark:text-foreground-muted">Registro demonstrativo. Anexos e imagens são mantidos apenas durante a sessão da aplicação.</p>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-foreground-muted">{label}</p><div className="mt-1 text-xs font-medium text-slate-800 dark:text-foreground">{value}</div></div>;
}

function CreatedNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  if (searchParams.get("ocorrencia") !== "registrada") return null;

  return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"><span className="flex items-center gap-2"><CheckCircle2 size={16} />Ocorrência registrada nesta sessão demonstrativa. Os indicadores foram atualizados.</span><button aria-label="Fechar confirmação" onClick={() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("ocorrencia");
      router.replace(`/operacional${params.size ? `?${params}` : ""}`, { scroll: false });
    }}><X size={15} /></button></div>
  );
}

export default function CentralOperacoes() {
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedDate, setSelectedDate] = useState(DATA_REFERENCIA_DEMO);
  const [period, setPeriod] = useState<Period>("Hoje");
  const [activeTab, setActiveTab] = useState<RecentTab>("Tarefas");
  const [showAllOccurrences, setShowAllOccurrences] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);


  const { data: units = [], isPending: unitsPending } = useUnitsQuery();
  const { data: tasks = [], isPending: tasksPending, isError: tasksError } = useTasksQuery();
  const { data: occurrences = [], isPending: occurrencesPending, isError: occurrencesError } = useOccurrencesQuery();



  const selectedUnits = useMemo(
    () => (selectedUnit === "all" ? units : units.filter((unit) => unit.id === selectedUnit)),
    [selectedUnit, units],
  );
  const multiplier = periodMultiplier[period];
  const unitRoutineRows = useMemo(() => {
    const rows = routineBase
      .filter((item) => selectedUnit === "all" || item.unitId === selectedUnit)
      .map((item) => ({
        ...item,
        planned: item.planned * multiplier,
        completed: item.completed * multiplier,
        inProgress: item.inProgress * multiplier,
        overdue: item.overdue * multiplier,
      }));
    return rows;
  }, [multiplier, selectedUnit]);
  const routineTotals = useMemo(() => unitRoutineRows.reduce(
    (totals, item) => ({
      planned: totals.planned + item.planned,
      completed: totals.completed + item.completed,
      inProgress: totals.inProgress + item.inProgress,
      overdue: totals.overdue + item.overdue,
    }),
    { planned: 0, completed: 0, inProgress: 0, overdue: 0 },
  ), [unitRoutineRows]);
  const completionRate = routineTotals.planned > 0 ? Math.round((routineTotals.completed / routineTotals.planned) * 100) : 0;

  const visibleOccurrences = useMemo(() => {
    const filtered = occurrences
      .filter((item) => selectedUnit === "all" || item.unitId === selectedUnit)
      .filter((item) => !selectedDate || item.eventDate <= selectedDate)
      .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    return filtered;
  }, [occurrences, selectedDate, selectedUnit]);
  const openOccurrences = visibleOccurrences.filter((item) => item.status !== "Resolvida");
  const visibleTasks = useMemo(() => tasks
    .filter((task) => selectedUnit === "all" || selectedUnits.some((unit) => taskBelongsToUnit(task, unit.nome)))
    .slice(0, 5), [selectedUnit, selectedUnits, tasks]);
  const summaryRows = selectedUnits.map((unit) => {
    const routines = unitRoutineRows.find((item) => item.unitId === unit.id);
    const occurrenceCount = visibleOccurrences.filter((item) => item.unitId === unit.id).length;
    return { unit, routines, occurrenceCount };
  });
  const chartData = [
    { name: "Concluídas", value: routineTotals.completed },
    { name: "Em andamento", value: routineTotals.inProgress },
    { name: "Pendentes", value: Math.max(0, routineTotals.planned - routineTotals.completed - routineTotals.inProgress - routineTotals.overdue) },
    { name: "Atrasadas", value: routineTotals.overdue },
  ].filter((entry) => entry.value > 0);
  const licensesDue = selectedUnits.reduce((sum, unit) => sum + unit.licencasVencendo, 0);
  const maintenanceAlertCount = tasks.filter((task) => task.category === "Manutenção" && task.status !== "Concluída" && (selectedUnit === "all" || selectedUnits.some((unit) => taskBelongsToUnit(task, unit.nome)))).length;
  const displayedOccurrences = showAllOccurrences ? visibleOccurrences : visibleOccurrences.slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-[26px]">Central de Operações</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-foreground-muted sm:text-sm">Acompanhe rotinas e ocorrências e o desempenho operacional das unidades.</p>
          <p className="mt-1 text-[10px] text-slate-400 dark:text-foreground-muted">Painel com dados demonstrativos para avaliação do protótipo.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs text-slate-600 shadow-sm dark:bg-surface-raised dark:text-foreground">
            <CalendarDays size={15} className="text-blue-600" />
            <span className="sr-only">Data de referência</span>
            <input aria-label="Data de referência" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="min-w-0 bg-transparent outline-none" />
          </label>
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs text-slate-600 shadow-sm dark:bg-surface-raised dark:text-foreground dark:hover:bg-surface-muted focus-within:ring-2 focus-within:ring-blue-500/40 sm:min-w-48">
            <span className="sr-only">Filtrar unidade</span><Truck size={15} className="shrink-0 text-blue-600" />
            <select aria-label="Filtrar unidade" value={selectedUnit} onChange={(event) => setSelectedUnit(event.target.value)} className="w-full bg-transparent outline-none dark:[color-scheme:dark] dark:[&>option]:bg-surface-raised dark:[&>option]:text-foreground disabled:cursor-not-allowed disabled:opacity-60">
              <option value="all">Todas as unidades</option>
              {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.nome}</option>)}
            </select>
          </label>
          <Link href="/operacional/registrar-ocorrencia" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={16} />Registrar ocorrência</Link>
        </div>
      </div>

      <Suspense fallback={null}><CreatedNotice /></Suspense>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard icon={<ClipboardCheck size={22} />} tone="blue" title="Rotinas previstas" value={routineTotals.planned} detail="No período selecionado" delta="+12% este mês" direction="up" />
        <MetricCard icon={<CheckCircle2 size={22} />} tone="green" title="Concluídas" value={routineTotals.completed} detail={`${completionRate}% das rotinas previstas`} delta="+8% este mês" direction="up" />
        <MetricCard icon={<AlertTriangle size={22} />} tone="red" title="Ocorrências abertas" value={openOccurrences.length} detail="Precisam de acompanhamento" delta="Acompanhar pendências" direction="down" />
        <MetricCard icon={<Clock3 size={22} />} tone="amber" title="Rotinas atrasadas" value={routineTotals.overdue} detail="Fora do prazo planejado" delta="Ver tarefas" direction="down" href="/tarefas" />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,0.9fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <CardTitle id="execution-title" titulo="Execução das rotinas operacionais" subtitulo="Progresso das atividades previstas para o período selecionado." />
              <div role="group" aria-label="Período das rotinas" className="flex shrink-0 rounded-lg bg-slate-100 p-1 dark:bg-surface-muted">
                {(["Hoje", "7 dias", "30 dias"] as Period[]).map((option) => <button type="button" key={option} onClick={() => setPeriod(option)} aria-pressed={period === option} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${period === option ? "bg-blue-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-foreground-muted dark:hover:text-foreground"}`}>{option}</button>)}
              </div>
            </div>
            <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(260px,0.95fr)_minmax(0,1.05fr)]">
              <div className="flex min-w-0 flex-col items-center justify-center gap-4 sm:flex-row">
                <div className="relative h-48 w-full max-w-[210px]">
                  {routineTotals.planned > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">{chartData.map((entry) => <Cell key={entry.name} fill={chartColors[["Concluídas", "Em andamento", "Pendentes", "Atrasadas"].indexOf(entry.name)]} />)}</Pie><Tooltip formatter={(value) => [`${value} rotinas`, "Quantidade"]} /></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-xs text-slate-400">Sem rotinas no filtro</div>}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">{completionRate}%</strong><span className="text-[11px] text-slate-400 dark:text-foreground-muted">concluídas</span></div>
                </div>
                <div className="grid w-full max-w-[190px] grid-cols-2 gap-2 sm:grid-cols-1">
                  <LegendMetric label="Concluídas" value={routineTotals.completed} tone="green" icon={<Check size={13} />} />
                  <LegendMetric label="Em andamento" value={routineTotals.inProgress} tone="blue" icon={<Clock3 size={13} />} />
                  <LegendMetric label="Pendentes" value={Math.max(0, routineTotals.planned - routineTotals.completed - routineTotals.inProgress - routineTotals.overdue)} tone="gray" icon={<MoreVertical size={13} />} />
                  <LegendMetric label="Atrasadas" value={routineTotals.overdue} tone="red" icon={<AlertCircle size={13} />} />
                </div>
              </div>
              <div className="min-w-0 border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <h3 className="mb-4 text-xs font-bold text-slate-500 dark:text-foreground-muted">ROTINAS POR UNIDADE</h3>
                <div className="space-y-4">
                  {unitRoutineRows.map((item) => {
                    const percentage = item.planned ? Math.round((item.completed / item.planned) * 100) : 0;
                    return <div key={item.unitId}>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]"><span className="truncate font-semibold text-slate-700 dark:text-foreground">{item.name}</span><span className="shrink-0 font-semibold text-slate-500 dark:text-foreground-muted">{item.completed}/{item.planned}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-surface-muted"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }} /></div>
                    </div>;
                  })}
                  {unitRoutineRows.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Nenhuma rotina disponível para esta unidade.</p>}
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 dark:text-foreground-muted">Valores de referência demonstrativos. O seletor multiplica a amostra para ilustrar períodos maiores.</p>
          </Card>

          <Card className="min-w-0 overflow-hidden">
            <div id="recent-operations" className="flex flex-col justify-between gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:px-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-foreground">Tarefas e ocorrências recentes</h2>
              <div className="flex items-center gap-4 text-xs">
                {(["Tarefas", "Ocorrências"] as RecentTab[]).map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); setShowAllOccurrences(false); }} aria-pressed={activeTab === tab} className={`border-b-2 pb-1 font-semibold transition ${activeTab === tab ? "border-blue-600 text-blue-700 dark:text-blue-300" : "border-transparent text-slate-400 hover:text-slate-700 dark:text-foreground-muted dark:hover:text-foreground"}`}>{tab}</button>)}
                <Link href={activeTab === "Tarefas" ? "/tarefas" : "#recent-operations"} onClick={() => { if (activeTab === "Ocorrências") setShowAllOccurrences(true); }} className="hidden items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-300 sm:inline-flex">Ver todas <ArrowRight size={12} /></Link>
              </div>
            </div>
            {activeTab === "Tarefas" ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[740px] text-left text-[11px]">
                  <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-400 dark:bg-surface-muted dark:text-foreground-muted"><tr>{["Tipo", "Descrição", "Unidade", "Responsável", "Prazo", "Status", "Prioridade"].map((label) => <th key={label} className="px-3 py-3 font-semibold first:pl-5">{label}</th>)}</tr></thead>
                  <tbody>
                    {tasksPending ? <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Carregando tarefas...</td></tr> : tasksError ? <tr><td colSpan={7} className="px-5 py-8 text-center text-rose-500">Não foi possível carregar as tarefas.</td></tr> : visibleTasks.map((task) => <tr key={task.id} className="border-t border-line transition hover:bg-slate-50/70 dark:hover:bg-surface-muted/60"><td className="px-3 py-3.5 pl-5"><span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Tarefa</span></td><td className="max-w-52 px-3 py-3.5 font-semibold text-slate-800 dark:text-foreground">{task.title}</td><td className="px-3 py-3.5 text-slate-500 dark:text-foreground-muted">{task.unit}</td><td className="px-3 py-3.5 text-slate-600 dark:text-foreground-muted">{task.owner}</td><td className="whitespace-nowrap px-3 py-3.5 text-slate-500 dark:text-foreground-muted">{task.due}</td><td className="px-3 py-3.5"><TaskStatusBadge task={task} /></td><td className="px-3 py-3.5"><span className={`text-[10px] font-semibold ${task.priority === "Urgente" || task.priority === "Alta" ? "text-rose-600" : "text-amber-600"}`}>{task.priority}</span></td></tr>)}
                    {!tasksPending && !tasksError && visibleTasks.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-xs text-slate-400">Nenhuma tarefa encontrada para esta unidade.</td></tr>}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-[11px]">
                  <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-400 dark:bg-surface-muted dark:text-foreground-muted"><tr>{["Tipo / Protocolo", "Descrição da ocorrência", "Unidade afetada", "Responsável / condutor", "Data / registro", "Status", "Gravidade", "Ações"].map((label) => <th key={label} className="px-3 py-3 font-semibold first:pl-5">{label}</th>)}</tr></thead>
                  <tbody>
                    {occurrencesPending ? <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">Carregando ocorrências...</td></tr> : occurrencesError ? <tr><td colSpan={8} className="px-5 py-8 text-center text-rose-500">Não foi possível carregar as ocorrências.</td></tr> : displayedOccurrences.map((occurrence) => <tr key={occurrence.id} className="border-t border-line transition hover:bg-slate-50/70 dark:hover:bg-surface-muted/60"><td className="px-3 py-3.5 pl-5"><div className="font-semibold text-slate-700 dark:text-foreground">{occurrence.kind}</div><div className="mt-1 text-[9px] text-slate-400">#{occurrence.protocol}</div></td><td className="max-w-56 px-3 py-3.5 font-semibold text-slate-800 dark:text-foreground">{occurrence.title}</td><td className="px-3 py-3.5 text-slate-500 dark:text-foreground-muted">{occurrence.unitName}</td><td className="px-3 py-3.5 text-slate-500 dark:text-foreground-muted">{occurrence.driver || occurrence.owner}</td><td className="whitespace-nowrap px-3 py-3.5 text-slate-500 dark:text-foreground-muted">{occurrence.eventDate === selectedDate ? `Hoje, ${occurrence.eventTime}` : `${shortDate(occurrence.eventDate)}, ${occurrence.eventTime}`}</td><td className="px-3 py-3.5"><OccurrenceStatusBadge value={occurrence.status} /></td><td className="px-3 py-3.5"><SeverityBadge value={occurrence.severity} /></td><td className="px-3 py-3.5"><button type="button" aria-label={`Visualizar ocorrência ${occurrence.protocol}`} onClick={() => setSelectedOccurrence(occurrence)} className="rounded-md p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"><Eye size={15} /></button></td></tr>)}
                    {!occurrencesPending && !occurrencesError && displayedOccurrences.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-xs text-slate-400">Nenhuma ocorrência encontrada para os filtros selecionados.</td></tr>}
                  </tbody>
                </table>
                {visibleOccurrences.length > 5 && <div className="border-t border-line px-5 py-3 text-right"><button type="button" onClick={() => setShowAllOccurrences(!showAllOccurrences)} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-300">{showAllOccurrences ? "Mostrar menos" : `Mostrar todas (${visibleOccurrences.length})`}</button></div>}
              </div>
            )}
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <Card className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-900 dark:text-foreground">Alertas e pendências</h2><span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">{routineTotals.overdue + openOccurrences.length + licensesDue + maintenanceAlertCount}</span></div>
            <div className="space-y-2.5">
              <AlertLink href="/tarefas" icon={<AlertTriangle size={16} />} tone="red" title={`${routineTotals.overdue} rotinas atrasadas`} description="Necessitam de ação imediata" />
              <button type="button" onClick={() => { setActiveTab("Ocorrências"); setShowAllOccurrences(true); document.getElementById("recent-operations")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition hover:bg-slate-50 dark:hover:bg-surface-muted"><AlertIcon tone="red"><CircleAlert size={15} /></AlertIcon><span className="min-w-0 flex-1"><strong className="block text-[11px] font-semibold text-slate-800 dark:text-foreground">{openOccurrences.length} ocorrências em aberto</strong><span className="mt-0.5 block text-[10px] text-slate-400">Aguardando providências</span></span><ChevronRight size={16} className="text-slate-400" /></button>
              <AlertLink href="/licencas" icon={<Clock3 size={16} />} tone="amber" title={`${licensesDue} renovações próximas do vencimento`} description="Nos próximos 30 dias" />
              <AlertLink href="/tarefas" icon={<Wrench size={16} />} tone="blue" title={`${maintenanceAlertCount} manutenção pendente`} description="Equipamentos e frota das unidades" />
            </div>
          </Card>

          <Card className="min-w-0 overflow-hidden p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-foreground">Resumo por unidade</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[270px] text-left text-[10px]">
                <thead className="border-y border-line text-[9px] uppercase text-slate-400 dark:text-foreground-muted"><tr><th className="py-2.5 pr-2 font-semibold">Unidade</th><th className="px-2 py-2.5 font-semibold">Rotinas</th><th className="px-2 py-2.5 font-semibold">Ocorrências</th></tr></thead>
                <tbody>{unitsPending ? <tr><td colSpan={3} className="py-5 text-center text-slate-400">Carregando...</td></tr> : summaryRows.map(({ unit, routines, occurrenceCount }) => <tr key={unit.id} className="border-b border-line last:border-0"><td className="max-w-28 truncate py-3 pr-2 font-semibold text-slate-700 dark:text-foreground" title={unit.nome}>{unit.nome}</td><td className="whitespace-nowrap px-2 py-3 text-slate-600 dark:text-foreground-muted"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />{routines ? `${routines.completed}/${routines.planned}` : "—"}</td><td className="px-2 py-3 text-slate-600 dark:text-foreground-muted"><span className={`mr-1 inline-block h-2 w-2 rounded-full ${occurrenceCount ? "bg-rose-500" : "bg-slate-300"}`} />{occurrenceCount}</td></tr>)}</tbody>
              </table>
            </div>
            {selectedUnit !== "all" && <button type="button" onClick={() => setSelectedUnit("all")} className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-300"><RotateCcw size={11} />Limpar filtro de unidade</button>}
          </Card>
        </aside>
      </div>

      {selectedOccurrence && <OccurrenceDetails occurrence={selectedOccurrence} onClose={() => setSelectedOccurrence(null)} />}
    </div>
  );
}

function MetricCard({ icon, tone, title, value, detail, delta, direction, href }: {
  icon: ReactNode;
  tone: "blue" | "green" | "red" | "amber";
  title: string;
  value: number;
  detail: string;
  delta: string;
  direction: "up" | "down";
  href?: string;
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
    red: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  };
  const growth = direction === "up" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300";
  return <Card className="flex min-h-[124px] items-start gap-3 p-4 sm:items-center sm:p-5"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>{icon}</span><div className="min-w-0 flex-1"><p className="text-[11px] font-medium text-slate-500 dark:text-foreground-muted">{title}</p><p className="mt-0.5 text-3xl font-bold leading-9 tracking-tight text-slate-900 dark:text-foreground">{value.toLocaleString("pt-BR")}</p><p className="mt-0.5 text-[10px] text-slate-400 dark:text-foreground-muted">{detail}</p><div className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${growth}`}>{direction === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{href ? <Link href={href} className="hover:underline">{delta}</Link> : delta}</div></div></Card>;
}

function LegendMetric({ label, value, tone, icon }: { label: string; value: number; tone: "green" | "blue" | "gray" | "red"; icon: ReactNode }) {
  const styles = { green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300", blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300", gray: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300", red: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300" };
  return <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2 dark:border-line dark:bg-surface-muted"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${styles[tone]}`}>{icon}</span><span className="min-w-0 flex-1 truncate text-[10px] text-slate-500 dark:text-foreground-muted">{label}</span><strong className="text-xs text-slate-800 dark:text-foreground">{value}</strong></div>;
}

function AlertIcon({ tone, children }: { tone: "red" | "amber" | "blue"; children: ReactNode }) {
  const styles = { red: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300", amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300", blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" };
  return <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles[tone]}`}>{children}</span>;
}

function AlertLink({ href, icon, tone, title, description }: { href: string; icon: ReactNode; tone: "red" | "amber" | "blue"; title: string; description: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:bg-slate-50 dark:hover:bg-surface-muted"><AlertIcon tone={tone}>{icon}</AlertIcon><span className="min-w-0 flex-1"><strong className="block text-[11px] font-semibold text-slate-800 dark:text-foreground">{title}</strong><span className="mt-0.5 block text-[10px] text-slate-400">{description}</span></span><ChevronRight size={16} className="shrink-0 text-slate-400" /></Link>;
}
