"use client";

import { Pie, PieChart, Tooltip } from "recharts";
import { PERCENTUAL_CONCLUIDAS, STATUS_ROTINAS } from "./dadosMock";

const TAMANHO = 176;

export default function GraficoRotinas() {
  // Fatias com valor zero (ex.: "Pendentes") não aparecem no desenho.
  const dados = STATUS_ROTINAS.filter((item) => item.valor > 0).map((item) => ({
    name: item.nome,
    value: item.valor,
    fill: item.cor,
  }));

  return (
    <div
      className="relative shrink-0"
      style={{ width: TAMANHO, height: TAMANHO }}
      role="img"
      aria-label={`${PERCENTUAL_CONCLUIDAS}% das rotinas concluídas`}
    >
      <PieChart width={TAMANHO} height={TAMANHO}>
        <Pie
          data={dados}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={84}
          paddingAngle={2}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive={false}
        />
        <Tooltip />
      </PieChart>

      {/* Texto no centro; pointer-events-none deixa o mouse passar para o gráfico */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-extrabold leading-none tracking-tight text-slate-900">
          {PERCENTUAL_CONCLUIDAS}%
        </span>
        <span className="mt-1 text-[11px] text-slate-500">concluídas</span>
      </div>
    </div>
  );
}