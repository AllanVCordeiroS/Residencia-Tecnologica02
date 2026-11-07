import type { PeriodoId } from "@/types/operacional";

const ABAS: { valor: PeriodoId; rotulo: string }[] = [
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "7dias", rotulo: "7 dias" },
  { valor: "30dias", rotulo: "30 dias" },
];

type SeletorPeriodoProps = {
  valor: PeriodoId;
  onChange: (valor: PeriodoId) => void;
};

export default function SeletorPeriodo({ valor, onChange }: SeletorPeriodoProps) {
  return (
    <div
      role="group"
      aria-label="Período"
      className="inline-flex rounded-lg bg-slate-100 p-1"
    >
      {ABAS.map((aba) => (
        <button
          key={aba.valor}
          type="button"
          aria-pressed={valor === aba.valor}
          onClick={() => onChange(aba.valor)}
          className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
            valor === aba.valor
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {aba.rotulo}
        </button>
      ))}
    </div>
  );
}