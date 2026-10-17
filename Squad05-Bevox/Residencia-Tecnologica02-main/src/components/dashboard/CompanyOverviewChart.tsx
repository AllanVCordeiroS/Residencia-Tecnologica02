"use client";

import { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardTitle } from "@/components/ui/Card";
import { montarSerie, variacaoPercentual } from "@/lib/dashboard";
import type { DashboardData, SerieKey } from "@/types";

const SERIES: {
  key: SerieKey;
  nome: string;
  legenda: string;
  cor: string;
}[] = [
  {
    key: "documentos",
    nome: "Documentos",
    legenda: "Documentos",
    cor: "#2563eb",
  },
  {
    key: "tarefas",
    nome: "Tarefas",
    legenda: "Tarefas",
    cor: "#10b981",
  },
  {
    key: "licencas",
    nome: "Licenças",
    legenda: "Licenças",
    cor: "#f59e0b",
  },
  {
    key: "unidades",
    nome: "Unidades",
    legenda: "Unidades",
    cor: "#8b5cf6",
  },
];

export default function CompanyOverviewChart({
  data,
}: {
  data: DashboardData;
}) {
  const uid = useId().replace(/:/g, "");

  // Período fixo: últimos 12 meses.
  const serie = useMemo(() => montarSerie(data, "1a"), [data]);

  const maximo = Math.max(
    ...serie.flatMap((p) => SERIES.map((s) => p[s.key])),
  );

  const topo = Math.max(25, Math.ceil(maximo / 25) * 25);
  const ultimo = serie[serie.length - 1];
  const primeiro = serie[0];

  return (
    <Card
      aria-labelledby="visao-geral"
      className="w-[920px] min-w-[920px] max-w-none p-6"
    >
      {/* Cabeçalho */}
      <div className="border-b border-line pb-4">
        <CardTitle
          id="visao-geral"
          titulo="Visão Geral da Empresa"
          subtitulo="Evolução dos principais indicadores operacionais — últimos 12 meses"
        />
      </div>

      {/* Gráfico com dimensões fixas */}
      <div
        className="mt-4 w-[840px]"
        role="img"
        aria-label="Gráfico anual de documentos, tarefas, licenças e unidades."
      >
        <ComposedChart
          width={840}
          height={300}
          data={serie}
          margin={{ top: 12, right: 16, left: -12, bottom: 0 }}
        >
          <defs>
            {SERIES.map((s) => (
              <linearGradient
                key={s.key}
                id={`${uid}-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.cor} stopOpacity={0.14} />
                <stop offset="100%" stopColor={s.cor} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 4"
            vertical={false}
          />

          <XAxis
            dataKey="rotulo"
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            interval={0}
          />

          <YAxis
            domain={[0, topo]}
            tickCount={6}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            width={44}
          />

          <Tooltip
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e4e8f1",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(15,23,42,.08)",
            }}
          />

          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.nome}
              stroke={s.cor}
              strokeWidth={2.5}
              fill={`url(#${uid}-${s.key})`}
              dot={{
                r: 4,
                fill: "#fff",
                stroke: s.cor,
                strokeWidth: 2,
              }}
              activeDot={{ r: 5.5 }}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </div>

      {/* Tabela acessível para leitores de tela */}
      <div className="sr-only">
        <table>
          <caption>Valores do gráfico anual</caption>
          <thead>
            <tr>
              <th>Período</th>
              {SERIES.map((s) => (
                <th key={s.key}>{s.nome}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {serie.map((p) => (
              <tr key={p.rotulo}>
                <td>{p.rotulo}</td>
                {SERIES.map((s) => (
                  <td key={s.key}>{p[s.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda e variação anual */}
      <ul className="mt-4 grid w-[840px] grid-cols-4 gap-4 border-t border-line pt-4">
        {SERIES.map((s) => {
          const v = variacaoPercentual(primeiro[s.key], ultimo[s.key]);

          return (
            <li key={s.key} className="flex items-start gap-2.5">
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: s.cor }}
                aria-hidden="true"
              />

              <span className="leading-tight">
                <span className="text-[14px] font-bold text-slate-900">
                  {ultimo[s.key]}
                </span>

                {v !== null && (
                  <span
                    className={`ml-1.5 text-[11px] font-semibold ${
                      v >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {v >= 0 ? "+" : ""}
                    {v}%
                  </span>
                )}

                <span className="block text-[12px] text-slate-500">
                  {s.legenda}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] text-slate-400">
        Variação em relação ao início do período anual • dados demonstrativos.
      </p>
    </Card>
  );
}
