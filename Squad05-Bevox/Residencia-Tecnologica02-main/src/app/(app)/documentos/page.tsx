import Link from "next/link";
import {
  ArrowUp,
  CalendarX,
  CircleCheck,
  Clock,
  FileText,
  Plus,
  Upload,
  type LucideIcon,
} from "lucide-react";
import DocumentCharts from "@/components/documentos/DocumentCharts";
import DocumentsTable from "@/components/documentos/DocumentsTable";
import { totalDocuments } from "@/data/mockDocuments";

const NEW_DOCUMENT_ROUTE = "/documents/new";
const IMPORT_DOCUMENTS_ROUTE = "/documents/import";

const CARD =
  "rounded-[12px] border border-[rgba(226,232,240,0.9)] bg-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.04)]";

const BREADCRUMB = ["BEVOX", "Gestão Corporativa", "Documentos"];
const BREADCRUMB_STYLE = "text-[11px] font-semibold leading-[14px] tracking-[0.22px]";

interface Metric {
  label: string;
  value: string;
  description: string;
  trend: string;
  trendColor: string;
  icon: LucideIcon;
  iconStyle: string;
}

const METRICS: Metric[] = [
  {
    label: "Total registrado",
    value: String(totalDocuments),
    description: "Documentos cadastrados",
    trend: "+ 5% este mês",
    trendColor: "text-[#059669]",
    icon: FileText,
    iconStyle: "bg-[#eff6ff] text-[#2563eb]",
  },
  {
    label: "Pendentes",
    value: "12",
    description: "Aguardando análise",
    trend: "+ 3% este mês",
    trendColor: "text-[#f43f5e]",
    icon: Clock,
    iconStyle: "bg-[#fffbeb] text-[#f59e0b]",
  },
  {
    label: "Próximos do vencimento",
    value: "5",
    description: "Nos próximos 30 dias",
    trend: "+ 2% este mês",
    trendColor: "text-[#f43f5e]",
    icon: CalendarX,
    iconStyle: "bg-[#fff1f2] text-[#f43f5e]",
  },
  {
    label: "Aprovados",
    value: "98",
    description: "Documentos aprovados",
    trend: "+ 6% este mês",
    trendColor: "text-[#059669]",
    icon: CircleCheck,
    iconStyle: "bg-[#ecfdf5] text-[#10b981]",
  },
];

function MetricCards() {
  return (
    <section aria-label="Indicadores de documentos">
      <ul className="grid grid-cols-4 gap-[16px] max-[1024px]:grid-cols-2 max-[768px]:grid-cols-1">
        {METRICS.map(({ label, value, description, trend, trendColor, icon: Icon, iconStyle }) => (
          <li key={label} className={`flex min-w-px items-start justify-between p-[21px] ${CARD}`}>
            <div className="flex flex-col gap-[4px] pt-[5.5px]">
              <p className="text-[12px] font-medium leading-[16px] text-[#64748b]">{label}</p>
              <p className="pt-[2.5px] text-[24px] font-extrabold leading-[32px] text-[#0f172a]">{value}</p>
              <p className="text-[11px] leading-[16.5px] text-[#64748b]">{description}</p>
              <p className={`flex items-center gap-[4px] pt-[3.5px] text-[11px] font-semibold leading-[16.5px] ${trendColor}`}>
                <ArrowUp aria-hidden="true" className="size-[11px]" strokeWidth={2} />
                {trend}
              </p>
            </div>
            <div className={`flex size-[40px] shrink-0 items-center justify-center rounded-[12px] ${iconStyle}`}>
              <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-[24px] px-[32px] pb-[24px] pt-[11px] font-['Inter',sans-serif] max-[1024px]:px-[24px] max-[768px]:px-[16px]">
      <header className="flex items-center justify-between gap-[16px] max-[768px]:flex-col max-[768px]:items-start">
        <div className="flex flex-col gap-[2px]">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-[8px]">
              {BREADCRUMB.map((item, index) => {
                const current = index === BREADCRUMB.length - 1;

                return (
                  <li key={item} className="flex items-center gap-[8px]">
                    {index > 0 && (
                      <span aria-hidden="true" className={`${BREADCRUMB_STYLE} text-[#c3c6d7]`}>
                        /
                      </span>
                    )}
                    <span
                      aria-current={current ? "page" : undefined}
                      className={`${BREADCRUMB_STYLE} ${current ? "text-[#004ac6]" : "text-[#434655]"}`}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
          <h1 className="pt-[2px] text-[24px] font-extrabold leading-[32px] tracking-[-0.6px] text-[#0f172a] max-[768px]:text-[20px] max-[768px]:leading-[28px]">
            Gestão de Documentos
          </h1>
          <p className="text-[12px] leading-[16px] text-[#64748b]">
            Centralize, organize e acompanhe os documentos da Adega Distribution.
          </p>
        </div>

        <div className="flex items-center gap-[12px] max-[768px]:flex-wrap">
          <Link
            href={NEW_DOCUMENT_ROUTE}
            className="flex items-center gap-[8px] rounded-[8px] bg-[#0b132b] px-[16px] py-[8px] text-[12px] font-semibold leading-[16px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
          >
            <Plus aria-hidden="true" className="size-[12px]" strokeWidth={2} />
            Novo documento
          </Link>
          <Link
            href={IMPORT_DOCUMENTS_ROUTE}
            className="flex items-center gap-[8px] rounded-[8px] border border-[#cbd5e1] bg-white px-[17px] py-[9px] text-[12px] font-semibold leading-[16px] text-[#334155] drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
          >
            <Upload aria-hidden="true" className="size-[11px]" strokeWidth={2} />
            Importar em lote
          </Link>
        </div>
      </header>

      <MetricCards />
      <DocumentCharts />
      <DocumentsTable />
    </div>
  );
}