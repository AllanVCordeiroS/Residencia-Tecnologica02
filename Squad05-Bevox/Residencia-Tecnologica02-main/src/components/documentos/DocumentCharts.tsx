"use client";

import { useDocumentsQuery } from "@/hooks/queries/useDocumentsQuery";
import type { LegalDocument } from "@/types/document";
import { FileText, Shield, type LucideIcon } from "lucide-react";

const CARD =
  "rounded-[12px] border border-line bg-surface-raised drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.04)]";

interface CategoryBar {
  name: string;
  color: string;
  icon: LucideIcon;
}

const CATEGORIES: CategoryBar[] = [
  { name: "Licenças e Alvarás", color: "bg-[#1e3a8a]", icon: FileText },
  { name: "Contratos", color: "bg-[#0284c7]", icon: FileText },
  { name: "Fiscais e Tributários", color: "bg-[#10b981]", icon: FileText },
  { name: "Societários e Cadastrais", color: "bg-[#f59e0b]", icon: FileText },
  { name: "Trabalhistas e Segurança", color: "bg-[#8b5cf6]", icon: Shield },
  { name: "Operacionais", color: "bg-[#38bdf8]", icon: FileText },
  { name: "Financeiros", color: "bg-[#64748b]", icon: FileText },
];

type StatusId = "approved" | "review" | "pending" | "overdue" | "attention";

interface StatusSlice {
  id: StatusId;
  label: string;
  dot: string;
  stroke: string;
}

const STATUS_SLICES: StatusSlice[] = [
  { id: "attention", label: "Atenção", dot: "bg-amber-500", stroke: "stroke-amber-500" },
  { id: "approved", label: "Aprovado", dot: "bg-[#10b981]", stroke: "stroke-[#10b981]" },
  { id: "review", label: "Em análise", dot: "bg-[#f59e0b]", stroke: "stroke-[#f59e0b]" },
  { id: "pending", label: "Pendente", dot: "bg-[#3b82f6]", stroke: "stroke-[#3b82f6]" },
  { id: "overdue", label: "Vencido", dot: "bg-[#f43f5e]", stroke: "stroke-[#f43f5e]" },
];

// Ordem em que os arcos são desenhados no anel, no sentido horário a partir do topo
const ARC_ORDER: StatusId[] = ["approved", "pending", "review", "overdue", "attention"];

const RADIUS = 61.6;
const STROKE_WIDTH = 30;
const CENTER = 88;

function CategoriesCard({ documents }: { documents: LegalDocument[] }) {
  const categories = Array.from(new Set([...CATEGORIES.map((item) => item.name), ...documents.map((doc) => doc.category)])).map((name) => {
    const style = CATEGORIES.find((item) => item.name === name) ?? CATEGORIES[0];
    const count = documents.filter((doc) => doc.category === name).length;
    const percent = documents.length ? count / documents.length * 100 : 0;
    return { ...style, name, count, share: percent.toFixed(1) + "%", width: percent + "%" };
  });
  return (
    <section aria-labelledby="categories-title" className={`flex min-w-px flex-1 flex-col p-[25px] ${CARD}`}>
      <h2 id="categories-title" className="text-[14px] font-bold leading-[20px] text-foreground">
        Documentos por categoria
      </h2>
      <p className="text-[11px] leading-[16.5px] text-foreground-muted">Distribuição dos documentos por tipo.</p>

      <ul className="flex flex-col gap-[14px] pt-[18px]">
        {categories.map(({ name, count, share, width, color, icon: Icon }) => (
          <li key={name} className="flex items-center">
            <div className="flex w-[176px] shrink-0 items-center gap-[8px] max-[768px]:w-[125px]">
              <Icon aria-hidden="true" className="size-[12px] shrink-0 text-foreground-muted" strokeWidth={1.75} />
              <span className="text-[12px] leading-[16px] text-foreground-muted">{name}</span>
            </div>
            <div className="min-w-px flex-1 px-[12px]">
              <div aria-hidden="true" className="h-[8px] overflow-clip rounded-full bg-surface-muted">
                <div style={{ width }} className={`h-full rounded-full ${color}`} />
              </div>
            </div>
            <span className="w-[32px] shrink-0 text-right text-[11px] font-bold leading-[16px] text-foreground">
              {count}
            </span>
            <span className="w-[48px] shrink-0 text-right text-[10px] leading-[16px] text-foreground-muted">
              {share}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusCard({ documents }: { documents: LegalDocument[] }) {
  const TOTAL = documents.length;
  const slices = STATUS_SLICES.map((slice) => {
    const count = documents.filter((doc) => doc.status === slice.label).length;
    return { ...slice, count, share: (TOTAL ? count / TOTAL * 100 : 0).toFixed(1) + "%" };
  });
  const arcs = ARC_ORDER.reduce<{ id: StatusId; count: number; stroke: string; start: number }[]>((list, id) => {
    const slice = slices.find((item) => item.id === id)!;
    return [...list, { id, count: slice.count, stroke: slice.stroke, start: list.reduce((sum, arc) => sum + arc.count, 0) }];
  }, []);
  const chartDescription = slices.map((slice) => slice.label + ": " + slice.count).join(", ");
  return (
    <section
      aria-labelledby="status-title"
      className={`flex min-w-px flex-1 flex-col px-[25px] pb-[41px] pt-[25px] ${CARD}`}
    >
      <h2 id="status-title" className="text-[14px] font-bold leading-[20px] text-foreground">
        Situação dos documentos
      </h2>
      <p className="text-[11px] leading-[16.5px] text-foreground-muted">Visão geral do status dos documentos.</p>

      <div className="flex flex-wrap items-center justify-center gap-x-[100px] gap-y-[24px] pt-[22px] max-[1024px]:gap-x-[48px]">
        <div className="relative flex size-[176px] shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 176 176"
            role="img"
            aria-label={`Gráfico de rosca com ${TOTAL} documentos. ${chartDescription}`}
            className="size-[176px] -rotate-90"
          >
            {arcs.map((arc) => (
              <circle
                key={arc.id}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE_WIDTH}
                pathLength={TOTAL || 1}
                strokeDasharray={`${arc.count} ${TOTAL - arc.count}`}
                strokeDashoffset={-arc.start}
                className={arc.stroke}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[20px] font-extrabold leading-[25px] text-foreground">{TOTAL}</p>
            <p className="text-[10px] font-medium leading-[15px] text-foreground-muted">documentos</p>
          </div>
        </div>

        <ul className="flex min-w-[170px] flex-col gap-[14px]">
          {slices.map((slice) => (
            <li key={slice.id} className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <span aria-hidden="true" className={`size-[10px] rounded-full ${slice.dot}`} />
                <span className="whitespace-nowrap text-[12px] font-medium leading-[16px] text-foreground-muted">
                  {slice.label}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-[11px] font-bold leading-[16px] text-foreground">{slice.count}</span>
                <span className="w-[48px] pl-[12px] text-right text-[11px] leading-[16px] text-foreground-muted">
                  {slice.share}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function DocumentCharts() {
  const { data: documents = [] } = useDocumentsQuery();
  return (
    <div className="flex gap-[24px] max-[1024px]:flex-col">
      <CategoriesCard documents={documents} />
      <StatusCard documents={documents} />
    </div>
  );
}
