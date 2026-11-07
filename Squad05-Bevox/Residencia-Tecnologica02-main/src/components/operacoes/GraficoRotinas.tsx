"use client";

import { Pie, PieChart, Tooltip } from "recharts";

const TAMANHO = 176;

export type Fatia = { nome: string; valor: number; cor: string };

type GraficoRotinasProps = {
  fatias: Fatia[];
  percentual: number;
};

export default function GraficoRotinas({
  fatias,
  percentual,
}: GraficoRotinasProps) {
  // Fatias com valor zero não aparecem no desenho.
  const comValor = fatias.filter((fatia) => fatia.valor > 0);
  const temDados = comValor.length > 0;

  // Sem nenhuma rotina no período, desenha só um anel cinza.
  const dados = temDados
    ? comValor.map((fatia) => ({
        name: fatia.nome,
        value: fatia.valor,
        fill: fatia.cor,
      }))
    : [{ name: "Sem rotinas", value: 1, fill: "#e2e8f0" }];

  return (
    <div
      className="relative shrink-0"
      style={{ width: TAMANHO, height: TAMANHO }}
      role="img"
      aria-label={`${percentual}% das rotinas concluídas`}
    >
      <PieChart width={TAMANHO} height={TAMANHO}>
        <Pie
          data={dados}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={84}
          paddingAngle={temDados ? 2 : 0}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive={false}
        />
        {temDados && <Tooltip />}
      </PieChart>

      {/* Texto no centro; pointer-events-none deixa o mouse passar para o gráfico */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-extrabold leading-none tracking-tight text-slate-900">
          {percentual}%
        </span>
        <span className="mt-1 text-[11px] text-slate-500">concluídas</span>
      </div>
    </div>
  );
}