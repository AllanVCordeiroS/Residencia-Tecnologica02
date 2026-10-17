import { Building2, ClipboardCheck, FileText, ShieldCheck, type LucideIcon } from "lucide-react";
import type { MetricaCard } from "@/lib/dashboard";
import { Card } from "@/components/ui/Card";

const ESTILO: Record<MetricaCard["id"], { icone: LucideIcon; tile: string; barra: string }> = {
  unidades: { icone: Building2, tile: "bg-blue-50 text-blue-600", barra: "bg-blue-600" },
  documentos: { icone: FileText, tile: "bg-sky-50 text-sky-600", barra: "bg-sky-500" },
  tarefas: { icone: ClipboardCheck, tile: "bg-indigo-50 text-indigo-600", barra: "bg-indigo-600" },
  licencas: { icone: ShieldCheck, tile: "bg-emerald-50 text-emerald-600", barra: "bg-emerald-500" },
};

const TOM: Record<NonNullable<MetricaCard["badge"]>["tom"], string> = {
  positivo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  aviso: "border-amber-200 bg-amber-50 text-amber-700",
  critico: "border-red-200 bg-red-50 text-red-600",
  neutro: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function MetricCard({ metrica }: { metrica: MetricaCard }) {
  const { icone: Icone, tile, barra } = ESTILO[metrica.id];
  const titleId = `metrica-${metrica.id}`;
  return (
    <Card as="article" aria-labelledby={titleId} className="p-5">
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tile}`}>
          <Icone className="h-6 w-6" aria-hidden="true" />
        </span>
        {metrica.badge && (
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TOM[metrica.badge.tom]}`}>
            {metrica.badge.texto}
          </span>
        )}
      </div>
      <h3 id={titleId} className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
        {metrica.titulo}
      </h3>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight text-slate-900">{metrica.valor}</span>
        <span className="text-[13px] text-slate-400">{metrica.complemento}</span>
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={metrica.progresso}
        aria-label={metrica.progressoDescricao}
        title={metrica.progressoDescricao}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div className={`h-full rounded-full ${barra}`} style={{ width: `${metrica.progresso}%` }} />
      </div>
    </Card>
  );
}
