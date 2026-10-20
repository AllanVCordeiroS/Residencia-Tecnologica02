import { FileText, Shield, type LucideIcon } from "lucide-react";

const CARD =
  "rounded-[12px] border border-[rgba(226,232,240,0.9)] bg-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.04)]";

interface CategoryBar {
  name: string;
  count: number;
  share: string;
  width: string;
  color: string;
  icon: LucideIcon;
}

const CATEGORIES: CategoryBar[] = [
  { name: "Licenças e Alvarás", count: 28, share: "22,6%", width: "w-[22.6%]", color: "bg-[#1e3a8a]", icon: FileText },
  { name: "Contratos", count: 24, share: "19,4%", width: "w-[19.4%]", color: "bg-[#0284c7]", icon: FileText },
  { name: "Fiscais e Tributários", count: 20, share: "16,1%", width: "w-[16.1%]", color: "bg-[#10b981]", icon: FileText },
  { name: "Societários e Cadastrais", count: 18, share: "14,5%", width: "w-[14.5%]", color: "bg-[#f59e0b]", icon: FileText },
  { name: "Trabalhistas e Segurança", count: 16, share: "12,9%", width: "w-[12.9%]", color: "bg-[#8b5cf6]", icon: Shield },
  { name: "Operacionais", count: 10, share: "8,1%", width: "w-[8.1%]", color: "bg-[#38bdf8]", icon: FileText },
  { name: "Financeiros", count: 8, share: "6,5%", width: "w-[6.5%]", color: "bg-[#64748b]", icon: FileText },
];

type StatusId = "approved" | "review" | "pending" | "overdue";

interface StatusSlice {
  id: StatusId;
  label: string;
  count: number;
  share: string;
  dot: string;
  stroke: string;
}

const STATUS_SLICES: StatusSlice[] = [
  { id: "approved", label: "Aprovado", count: 98, share: "79,0%", dot: "bg-[#10b981]", stroke: "stroke-[#10b981]" },
  { id: "review", label: "Em análise", count: 8, share: "6,5%", dot: "bg-[#f59e0b]", stroke: "stroke-[#f59e0b]" },
  { id: "pending", label: "Pendente", count: 12, share: "9,7%", dot: "bg-[#3b82f6]", stroke: "stroke-[#3b82f6]" },
  { id: "overdue", label: "Vencido", count: 6, share: "4,8%", dot: "bg-[#f43f5e]", stroke: "stroke-[#f43f5e]" },
];

// Ordem em que os arcos são desenhados no anel, no sentido horário a partir do topo
const ARC_ORDER: StatusId[] = ["approved", "pending", "review", "overdue"];

const TOTAL = STATUS_SLICES.reduce((sum, slice) => sum + slice.count, 0);
const RADIUS = 61.6;
const STROKE_WIDTH = 30;
const CENTER = 88;

const arcs = ARC_ORDER.reduce<{ id: StatusId; count: number; stroke: string; start: number }[]>(
  (list, id) => {
    const slice = STATUS_SLICES.find((item) => item.id === id);
    if (!slice) return list;
    const start = list.reduce((sum, arc) => sum + arc.count, 0);
    return [...list, { id, count: slice.count, stroke: slice.stroke, start }];
  },
  []
);

const chartDescription = STATUS_SLICES.map((slice) => `${slice.label}: ${slice.count}`).join(", ");

function CategoriesCard() {
  return (
    <section aria-labelledby="categories-title" className={`flex min-w-px flex-1 flex-col p-[25px] ${CARD}`}>
      <h2 id="categories-title" className="text-[14px] font-bold leading-[20px] text-[#0f172a]">
        Documentos por categoria
      </h2>
      <p className="text-[11px] leading-[16.5px] text-[#94a3b8]">Distribuição dos documentos por tipo.</p>

      <ul className="flex flex-col gap-[14px] pt-[18px]">
        {CATEGORIES.map(({ name, count, share, width, color, icon: Icon }) => (
          <li key={name} className="flex items-center">
            <div className="flex w-[176px] shrink-0 items-center gap-[8px] overflow-clip max-[768px]:w-[148px]">
              <Icon aria-hidden="true" className="size-[12px] shrink-0 text-[#94a3b8]" strokeWidth={1.75} />
              <span className="whitespace-nowrap text-[12px] leading-[16px] text-[#475569]">{name}</span>
            </div>
            <div className="min-w-px flex-1 px-[12px]">
              <div aria-hidden="true" className="h-[8px] overflow-clip rounded-full bg-[#f1f5f9]">
                <div className={`h-full rounded-full ${width} ${color}`} />
              </div>
            </div>
            <span className="w-[32px] shrink-0 text-right text-[11px] font-bold leading-[16px] text-[#1e293b]">
              {count}
            </span>
            <span className="w-[48px] shrink-0 text-right text-[10px] leading-[16px] text-[#94a3b8]">
              {share}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusCard() {
  return (
    <section
      aria-labelledby="status-title"
      className={`flex min-w-px flex-1 flex-col px-[25px] pb-[41px] pt-[25px] ${CARD}`}
    >
      <h2 id="status-title" className="text-[14px] font-bold leading-[20px] text-[#0f172a]">
        Situação dos documentos
      </h2>
      <p className="text-[11px] leading-[16.5px] text-[#94a3b8]">Visão geral do status dos documentos.</p>

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
                pathLength={TOTAL}
                strokeDasharray={`${arc.count} ${TOTAL - arc.count}`}
                strokeDashoffset={-arc.start}
                className={arc.stroke}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[20px] font-extrabold leading-[25px] text-[#1e293b]">{TOTAL}</p>
            <p className="text-[10px] font-medium leading-[15px] text-[#94a3b8]">documentos</p>
          </div>
        </div>

        <ul className="flex min-w-[170px] flex-col gap-[14px]">
          {STATUS_SLICES.map((slice) => (
            <li key={slice.id} className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <span aria-hidden="true" className={`size-[10px] rounded-full ${slice.dot}`} />
                <span className="whitespace-nowrap text-[12px] font-medium leading-[16px] text-[#475569]">
                  {slice.label}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-[11px] font-bold leading-[16px] text-[#1e293b]">{slice.count}</span>
                <span className="w-[48px] pl-[12px] text-right text-[11px] leading-[16px] text-[#94a3b8]">
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
  return (
    <div className="flex gap-[24px] max-[1024px]:flex-col">
      <CategoriesCard />
      <StatusCard />
    </div>
  );
}