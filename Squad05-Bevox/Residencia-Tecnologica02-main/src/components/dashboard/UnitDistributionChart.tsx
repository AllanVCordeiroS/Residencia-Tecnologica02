"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardTitle } from "@/components/ui/Card";
import { montarDistribuicao, somar } from "@/lib/dashboard";
import type { DashboardData } from "@/types";

export default function UnitDistributionChart({ data }: { data: DashboardData }) {
  const fatias = montarDistribuicao(data.unidades);
  const total = somar(fatias.map((f) => f.valor));
  const comRegistro = fatias.filter((f) => f.valor > 0);

  return (
    <Card aria-labelledby="dist-unidade" className="p-5 sm:p-6">
      <div className="border-b border-line pb-4">
        <CardTitle id="dist-unidade" titulo="Distribuição por Unidade" subtitulo="Volume de documentos por filial." />
      </div>

      {total === 0 ? (
        <p className="py-16 text-center text-[13px] text-slate-500">
          Nenhum documento registrado nas unidades ainda.
        </p>
      ) : (
        <>
          <div
            className="relative mx-auto mt-5 h-48 w-48"
            role="img"
            aria-label={`Gráfico de rosca: ${total} documentos distribuídos entre as unidades.`}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={comRegistro}
                  dataKey="valor"
                  nameKey="nome"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={0}
                  startAngle={90}
                  endAngle={-270}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {comRegistro.map((f) => (
                    <Cell key={f.nome} fill={f.cor} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e8f1", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">{total}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Documentos</span>
            </div>
          </div>

          <ul className="mt-5">
            {fatias.map((f) => (
              <li key={f.nome} className="flex items-center justify-between gap-3 border-b border-line py-2 text-[13px] last:border-0">
                <span className={`flex min-w-0 items-center gap-2.5 ${f.valor === 0 ? "text-slate-400" : "text-slate-700"}`}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: f.cor }} aria-hidden="true" />
                  <span className="truncate">{f.nome}</span>
                </span>
                <span className="font-semibold tabular-nums text-slate-900">{f.valor}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
