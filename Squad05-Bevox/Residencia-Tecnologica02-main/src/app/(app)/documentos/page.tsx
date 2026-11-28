"use client";

import Link from "next/link";
import {
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
import { useDocumentsQuery } from "@/hooks/queries/useDocumentsQuery";
import { documentDueDateIso } from "@/services/documents";

const NEW_DOCUMENT_ROUTE = "/documentos/new";
const IMPORT_DOCUMENTS_ROUTE = "/documentos/import";

const CARD =
  "rounded-[12px] border border-[rgba(226,232,240,0.9)] bg-white dark:bg-surface-raised drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.04)]";


interface Metric {
  label: string;
  description: string;
  icon: LucideIcon;
  iconStyle: string;
}

const METRICS: Metric[] = [
  {
    label: "Total registrado",
    description: "Documentos cadastrados",
    icon: FileText,
    iconStyle: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300",
  },
  {
    label: "Pendentes",
    description: "Aguardando análise",
    icon: Clock,
    iconStyle: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300",
  },
  {
    label: "Próximos do vencimento",
    description: "Nos próximos 30 dias",
    icon: CalendarX,
    iconStyle: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300",
  },
  {
    label: "Aprovados",
    description: "Documentos aprovados",
    icon: CircleCheck,
    iconStyle: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300",
  },
];

function MetricCards() {
  const { data: documents = [], isPending } = useDocumentsQuery();
  const now = new Date();
  const today = now.toLocaleDateString("sv-SE");
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toLocaleDateString("sv-SE");
  const counts = [documents.length, documents.filter((doc) => doc.status === "Pendente" || doc.status === "Em análise").length, documents.filter((doc) => { const date = documentDueDateIso(doc.dueDate); return date && date >= today && date <= end; }).length, documents.filter((doc) => doc.status === "Aprovado").length];
  return (
    <section aria-label="Indicadores de documentos">
      <ul className="grid grid-cols-4 gap-[16px] max-[1024px]:grid-cols-2 max-[768px]:grid-cols-1">
        {METRICS.map(({ label, description, icon: Icon, iconStyle }, index) => (
          <li key={label} className={`flex min-w-px items-start justify-between p-[21px] ${CARD}`}>
            <div className="flex flex-col gap-[4px] pt-[5.5px]">
              <p className="text-[12px] font-medium leading-[16px] text-foreground-muted">{label}</p>
              <p className="pt-[2.5px] text-[24px] font-extrabold leading-[32px] text-foreground">{isPending ? "…" : counts[index]}</p>
              <p className="text-[11px] leading-[16.5px] text-foreground-muted">{description}</p>
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
          <h1 className="pt-[2px] text-[24px] font-extrabold leading-[32px] tracking-[-0.6px] text-foreground max-[768px]:text-[20px] max-[768px]:leading-[28px]">
            Gestão de Documentos
          </h1>
          <p className="text-[12px] leading-[16px] text-foreground-muted">
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
            className="flex items-center gap-[8px] rounded-[8px] border border-line bg-white dark:bg-surface-raised px-[17px] py-[9px] text-[12px] font-semibold leading-[16px] text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
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
