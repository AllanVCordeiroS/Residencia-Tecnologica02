"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/components/financeiro/financeMath";
import { evolutionIndicators, indicatorEvolution, type DateRange, type ReportRecord } from "./reportData";

export default function IndicatorEvolution({ records, previous, range, previousRange, category }: { records: ReportRecord[]; previous: ReportRecord[]; range: DateRange | null; previousRange: DateRange | null; category: string }) {
  const [selected, setSelected] = useState("tasks");
  const options = evolutionIndicators.filter(item => category === "Todas as categorias" || item.category === category);
  const indicator = options.find(item => item.id === selected) ?? options[0];
  const points = indicatorEvolution(records, previous, indicator, range, previousRange);
  const format = (value: number | null) => value === null ? "Sem registros" : indicator.currency ? money(value) : `${value.toLocaleString("pt-BR")}%`;
  const interval = (value: DateRange | null) => value ? `${value.start} a ${value.end}` : "Todo o período";
  return <section className="min-w-0 rounded-2xl border border-slate-100 dark:border-line bg-white dark:bg-surface-raised p-4 shadow-sm xl:col-span-5" aria-labelledby="evolution-title">
    <h2 id="evolution-title" className="flex items-center gap-2 text-sm font-bold"><Activity size={16} />Evolução dos indicadores</h2>
    <label className="mt-3 block text-xs text-slate-500 dark:text-foreground-muted">Indicador da evolução
      <select value={indicator.id} onChange={event => setSelected(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 dark:border-line bg-white dark:bg-surface-raised px-3 text-slate-800 dark:text-foreground focus:ring-2 focus:ring-blue-500">{options.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
    </label>
    <p className="mt-2 text-xs text-slate-500 dark:text-foreground-muted">Use os filtros de período, unidade, categoria, comparação e pesquisa acima. {indicator.currency ? "Soma por mês de lançamento em BRL, incluindo pendentes e dados demonstrativos/locais." : "Percentual na situação atual por mês de referência, sem histórico de alterações de status."} Meses sem registros permanecem sem valor.</p>
    <div className="mt-2 space-y-1 break-words text-xs"><p>Atual: {interval(range)}</p>{previousRange ? <p>Comparativo: {interval(previousRange)}. Meses alinhados pela posição no intervalo; limites parciais são preservados.</p> : <p>Sem comparação{!range ? ": selecione um período delimitado" : ""}.</p>}</div>
    {points.length ? <>
      <div className="mt-3 h-64 min-w-0" role="img" aria-label={`${indicator.label}. Valores e meses disponíveis na tabela abaixo.`}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 12, right: 12, left: 0, bottom: 4 }} accessibilityLayer>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
          <XAxis dataKey="label" minTickGap={18} tick={{ fontSize: 10, fill: "var(--chart-axis)" }} />
          <YAxis width={64} domain={indicator.currency ? [0, "auto"] : [0, 100]} tickFormatter={value => indicator.currency ? new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(Number(value)) : `${value}%`} tick={{ fontSize: 10, fill: "var(--chart-axis)" }} />
          <Tooltip contentStyle={{ backgroundColor: "var(--surface-raised)", color: "var(--foreground)", border: "1px solid var(--line)" }} formatter={value => format(Number(value))} labelFormatter={(_, payload) => { const point = payload[0]?.payload; return point ? `Atual: ${point.currentMonth ?? "sem registros"}${previousRange ? ` · Comparativo: ${point.previousMonth ?? "sem registros"}` : ""}` : ""; }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line dataKey="current" name="Atual" stroke="#2864f0" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} isAnimationActive={false} />
          {previousRange && <Line dataKey="previous" name="Comparativo" stroke="#d97706" strokeDasharray="5 4" dot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />}
        </LineChart></ResponsiveContainer>
      </div>
      <details className="mt-3 text-xs"><summary className="cursor-pointer py-2 font-semibold">Ver valores e períodos em tabela</summary><div className="max-h-64 overflow-auto"><table className="w-full text-left"><caption className="py-2 text-left">{indicator.label} · {indicator.currency ? "BRL" : "%"}. Quantidade de registros entre parênteses.</caption><thead><tr><th scope="col" className="p-2">Mês atual</th><th scope="col" className="p-2">Valor atual</th>{previousRange && <><th scope="col" className="p-2">Mês comparativo</th><th scope="col" className="p-2">Valor comparativo</th></>}</tr></thead><tbody>{points.map(point => <tr key={point.label} className="border-t border-slate-100 dark:border-line"><th scope="row" className="p-2">{point.currentMonth ?? "Sem registros"}</th><td className="p-2">{format(point.current)} ({point.currentCount})</td>{previousRange && <><td className="p-2">{point.previousMonth ?? "Sem registros"}</td><td className="p-2">{format(point.previous)} ({point.previousCount})</td></>}</tr>)}</tbody></table></div></details>
    </> : <p role="status" className="py-8 text-center text-xs text-slate-500 dark:text-foreground-muted">Nenhum registro datado deste indicador para os filtros selecionados.</p>}
  </section>;
}
