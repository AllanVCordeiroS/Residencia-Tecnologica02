"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  EllipsisVertical,
  Eye,
  Search,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { categoryNames, mockDocuments, totalDocuments } from "@/data/mockDocuments";
import type { DocumentStatus, DueLevel, LegalDocument } from "@/types/document";

const ALL = "all";

const CARD =
  "rounded-[12px] border border-[rgba(226,232,240,0.9)] bg-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.04)]";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]/30";
const CHECKBOX = `size-[16px] shrink-0 cursor-pointer appearance-none rounded-[4px] border border-[#cbd5e1] bg-white checked:border-[#1d4ed8] checked:bg-[#1d4ed8] ${FOCUS}`;
const CELL = "px-[12px] py-[12.5px] align-middle";
const HEAD_CELL = "px-[12px] pb-[15px] pt-[14.5px] text-left align-middle text-[11px] font-bold leading-[16px] text-[#64748b]";

const STATUS_STYLES: Record<DocumentStatus, { badge: string; dot: string }> = {
  Atenção: { badge: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]", dot: "bg-[#f59e0b]" },
  Aprovado: { badge: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]", dot: "bg-[#10b981]" },
  Vencido: { badge: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]", dot: "bg-[#f43f5e]" },
  "Em análise": { badge: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]", dot: "bg-[#3b82f6]" },
  Pendente: { badge: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]", dot: "bg-[#f59e0b]" },
};

const CATEGORY_STYLES: Record<string, string> = {
  "Licenças e Alvarás": "border-[#f3e8ff] bg-[#faf5ff] text-[#7e22ce]",
  Contratos: "border-[#e0f2fe] bg-[#f0f9ff] text-[#0369a1]",
  Operacionais: "border-[#e0f2fe] bg-[#f0f9ff] text-[#0369a1]",
  "Fiscais e Tributários": "border-[#d1fae5] bg-[#ecfdf5] text-[#047857]",
  "Trabalhistas e Segurança": "border-[#ede9fe] bg-[#f5f3ff] text-[#6d28d9]",
  Financeiros: "border-[#e2e8f0] bg-[#f1f5f9] text-[#334155]",
};
const DEFAULT_CATEGORY_STYLE = "border-[#e2e8f0] bg-[#f1f5f9] text-[#334155]";

const FILE_TONES = {
  rose: "border-[#fecdd3] bg-[#fff1f2] text-[#f43f5e]",
  green: "border-[#a7f3d0] bg-[#ecfdf5] text-[#059669]",
  teal: "border-[#99f6e4] bg-[#f0fdfa] text-[#0d9488]",
  slate: "border-[#e2e8f0] bg-[#f1f5f9] text-[#475569]",
  sky: "border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]",
} as const;

const CATEGORY_FILE_TONE: Record<string, keyof typeof FILE_TONES> = {
  "Licenças e Alvarás": "rose",
  Contratos: "green",
  "Fiscais e Tributários": "slate",
  "Trabalhistas e Segurança": "rose",
  Financeiros: "sky",
  Operacionais: "slate",
};

function fileTone(doc: LegalDocument) {
  if (doc.fileType === "XLSX") return FILE_TONES.teal;
  return FILE_TONES[CATEGORY_FILE_TONE[doc.category] ?? "slate"];
}

const DUE_STYLES: Record<DueLevel, { color: string; icon: LucideIcon }> = {
  critical: { color: "text-[#e11d48]", icon: CircleAlert },
  warning: { color: "text-[#d97706]", icon: Clock },
};

const COLUMNS = [
  "w-[76px]",
  "w-[301.58px]",
  "w-[184.41px]",
  "w-[140.63px]",
  "w-[124.2px]",
  "w-[133.75px]",
  "w-[120.75px]",
  "w-[132.69px]",
];

const HEADERS: { label: string; sortIcon: LucideIcon }[] = [
  { label: "Documento", sortIcon: ArrowUp },
  { label: "Categoria", sortIcon: ArrowUp },
  { label: "Unidade", sortIcon: ArrowUpDown },
  { label: "Responsável", sortIcon: ArrowUpDown },
  { label: "Vencimento", sortIcon: ArrowUpDown },
  { label: "Status", sortIcon: ArrowUpDown },
];

interface FilterOption {
  value: string;
  label: string;
}

const UNIT_OPTIONS: FilterOption[] = [
  { value: ALL, label: "Todas as unidades" },
  ...Array.from(new Set(mockDocuments.map((doc) => doc.unit))).map((unit) => ({ value: unit, label: unit })),
];

const CATEGORY_OPTIONS: FilterOption[] = [
  { value: ALL, label: "Todas as categorias" },
  ...categoryNames.map((name) => ({ value: name, label: name })),
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: ALL, label: "Todos os status" },
  ...(Object.keys(STATUS_STYLES) as DocumentStatus[]).map((status) => ({ value: status, label: status })),
];

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="relative shrink-0">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[30px] cursor-pointer appearance-none rounded-[8px] border border-[#e2e8f0] bg-white py-[7px] pl-[13px] pr-[33px] text-[12px] leading-[16px] text-[#475569] ${FOCUS}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-[9px] top-1/2 size-[18px] -translate-y-1/2 text-[#64748b]"
        strokeWidth={1.5}
      />
    </div>
  );
}

function DueCell({ doc }: { doc: LegalDocument }) {
  if (doc.dueDate && doc.dueLevel) {
    const { color, icon: Icon } = DUE_STYLES[doc.dueLevel];

    return (
      <div className="flex flex-col gap-[2px]">
        <p className="text-[12px] font-medium leading-[16px] text-[#1e293b]">{doc.dueDate}</p>
        <p className={`flex items-center gap-[4px] whitespace-nowrap text-[10px] font-semibold leading-[16px] ${color}`}>
          <Icon aria-hidden="true" className="size-[9px] shrink-0" strokeWidth={2.25} />
          {doc.dueText}
        </p>
      </div>
    );
  }

  if (doc.dueDate) {
    return (
      <div className="flex flex-col">
        <p className="text-[11px] leading-[16px] text-[#94a3b8]">{doc.dueDate}</p>
        <p className="whitespace-nowrap text-[10px] leading-[16px] text-[#94a3b8]">{doc.dueText}</p>
      </div>
    );
  }

  return <p className="whitespace-nowrap text-[11px] leading-[16px] text-[#94a3b8]">{doc.dueText}</p>;
}

interface DocumentRowProps {
  doc: LegalDocument;
  selected: boolean;
  onToggle: () => void;
}

function DocumentRow({ doc, selected, onToggle }: DocumentRowProps) {
  const status = STATUS_STYLES[doc.status];
  const actionButton = `flex items-center justify-center rounded-[4px] text-[#94a3b8] ${FOCUS}`;

  return (
    <tr className="border-t border-[#f1f5f9] first:border-t-0">
      <td className="py-[12.5px] pl-[46px] pr-[14px] align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Selecionar ${doc.title}`}
          className={CHECKBOX}
        />
      </td>

      <td className={CELL}>
        <div className="flex items-center gap-[12px]">
          <div
            aria-hidden="true"
            className={`flex size-[32px] shrink-0 items-center justify-center rounded-[4px] border p-px text-center text-[10px] font-bold leading-[16px] ${fileTone(doc)}`}
          >
            {doc.fileType}
          </div>
          <div>
            <p className="whitespace-nowrap text-[12px] font-bold leading-[16px] text-[#0f172a]">{doc.title}</p>
            <p className="whitespace-nowrap text-[10px] leading-[16px] text-[#94a3b8]">
              {doc.fileType} • {doc.fileSize}
            </p>
          </div>
        </div>
      </td>

      <td className="py-[12.5px] pl-[24px] pr-[12px] align-middle">
        <span
          className={`inline-flex whitespace-nowrap rounded-full border px-[11px] py-[3px] text-[10px] font-semibold leading-[16px] ${
            CATEGORY_STYLES[doc.category] ?? DEFAULT_CATEGORY_STYLE
          }`}
        >
          {doc.category}
        </span>
      </td>

      <td className={CELL}>
        <p className="text-[12px] font-medium leading-[16px] text-[#1e293b]">{doc.unit}</p>
        <p className="text-[10px] leading-[16px] text-[#94a3b8]">{doc.unitType}</p>
      </td>

      <td className={CELL}>
        <p className="whitespace-nowrap text-[12px] leading-[16px] text-[#475569]">{doc.responsible}</p>
      </td>

      <td className={CELL}>
        <DueCell doc={doc} />
      </td>

      <td className={CELL}>
        <span
          className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border px-[9px] py-[3px] text-[11px] font-medium leading-[16px] ${status.badge}`}
        >
          <span aria-hidden="true" className={`size-[6px] rounded-full ${status.dot}`} />
          {doc.status}
        </span>
      </td>

      <td className="py-[12.5px] pl-[16px] pr-[42px] align-middle">
        <div className="flex items-center justify-end gap-[8px]">
          <button type="button" aria-label={`Visualizar ${doc.title}`} className={`${actionButton} p-[4px]`}>
            <Eye aria-hidden="true" className="size-[14px]" strokeWidth={1.75} />
          </button>
          <button type="button" aria-label={`Baixar ${doc.title}`} className={`${actionButton} p-[4px]`}>
            <ArrowDown aria-hidden="true" className="size-[14px]" strokeWidth={1.75} />
          </button>
          <button type="button" aria-label={`Mais opções para ${doc.title}`} className={`${actionButton} p-[4px]`}>
            <EllipsisVertical aria-hidden="true" className="size-[14px]" strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Pagination({ range, total }: { range: string; total: number }) {
  const pageButton = `flex size-[28px] items-center justify-center rounded-[4px] border border-[#e2e8f0] text-[12px] leading-[16px] text-[#475569] ${FOCUS}`;

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between gap-[12px] border-t border-[#e2e8f0] pb-[16px] pl-[16px] pr-[16px] pt-[17px] max-[768px]:flex-col max-[768px]:items-start"
    >
      <p className="whitespace-nowrap text-[12px] leading-[16px] text-[#64748b]">
        Mostrando <span className="font-semibold text-[#1e293b]">{range}</span> de{" "}
        <span className="font-semibold text-[#1e293b]">{total}</span> documentos
      </p>

      <ul className="flex items-center gap-[4px]">
        <li>
          <button type="button" disabled aria-label="Página anterior" className={`${pageButton} opacity-50`}>
            <ChevronLeft aria-hidden="true" className="size-[12px]" />
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-current="page"
            aria-label="Página 1"
            className={`flex size-[28px] items-center justify-center rounded-[4px] bg-[#1d4ed8] text-[12px] font-bold leading-[16px] text-white ${FOCUS}`}
          >
            1
          </button>
        </li>
        {[2, 3, 4, 5].map((page) => (
          <li key={page}>
            <button type="button" aria-label={`Página ${page}`} className={pageButton}>
              {page}
            </button>
          </li>
        ))}
        <li aria-hidden="true" className="px-[4px]">
          <span className="text-[12px] leading-[16px] text-[#94a3b8]">...</span>
        </li>
        <li>
          <button type="button" aria-label="Página 16" className={pageButton}>
            16
          </button>
        </li>
        <li>
          <button type="button" aria-label="Próxima página" className={pageButton}>
            <ChevronRight aria-hidden="true" className="size-[12px]" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default function DocumentsTable() {
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const term = search.trim().toLowerCase();
  const isFiltering = term !== "" || unit !== ALL || category !== ALL || status !== ALL;

  const documents = useMemo(
    () =>
      mockDocuments.filter(
        (doc) =>
          (unit === ALL || doc.unit === unit) &&
          (category === ALL || doc.category === category) &&
          (status === ALL || doc.status === status) &&
          (term === "" ||
            [doc.title, doc.category, doc.unit, doc.responsible].some((field) =>
              field.toLowerCase().includes(term)
            ))
      ),
    [term, unit, category, status]
  );

  const allSelected = documents.length > 0 && documents.every((doc) => selected.has(doc.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(documents.map((doc) => doc.id)));
  }

  function toggleOne(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section aria-label="Lista de documentos" className={`overflow-clip pb-[24px] ${CARD}`}>
      <div className="flex flex-wrap items-center gap-x-[100.5px] gap-y-[12px] border-b border-[rgba(226,232,240,0.8)] px-[16px] pb-[17px] pt-[16px] max-[1024px]:gap-x-[12px]">
        <div className="relative min-w-[240px] max-w-[448px] flex-1 max-[768px]:max-w-none">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-[12px] top-1/2 size-[12px] -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar documentos"
            placeholder="Buscar por nome, categoria, CNPJ ou responsável..."
            className={`h-[30px] w-full rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] pl-[37px] pr-[13px] text-[12px] text-[#0f172a] placeholder:text-[#94a3b8] ${FOCUS}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          <FilterSelect label="Filtrar por unidade" value={unit} options={UNIT_OPTIONS} onChange={setUnit} />
          <FilterSelect label="Filtrar por categoria" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
          <FilterSelect label="Filtrar por status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
          <button
            type="button"
            className={`flex items-center gap-[6px] rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-[13px] py-[7px] text-[12px] font-medium leading-[16px] text-[#334155] ${FOCUS}`}
          >
            <SlidersHorizontal aria-hidden="true" className="size-[11px]" />
            Filtros
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1214px] table-fixed border-collapse">
          <caption className="sr-only">Documentos cadastrados</caption>
          <colgroup>
            {COLUMNS.map((width) => (
              <col key={width} className={width} />
            ))}
          </colgroup>
          <thead className="bg-[rgba(248,250,252,0.7)]">
            <tr className="border-b border-[#e2e8f0]">
              <th scope="col" className="py-[15px] pl-[46px] pr-[14px] text-left align-middle">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Selecionar todos os documentos"
                  className={CHECKBOX}
                />
              </th>
              {HEADERS.map(({ label, sortIcon: SortIcon }) => (
                <th key={label} scope="col" className={HEAD_CELL}>
                  <span className="flex items-center gap-[4px]">
                    {label}
                    <SortIcon aria-hidden="true" className="size-[9px] text-[#94a3b8]" strokeWidth={2} />
                  </span>
                </th>
              ))}
              <th
                scope="col"
                className="pb-[15px] pl-[16px] pr-[42px] pt-[14.5px] text-right align-middle text-[11px] font-bold leading-[16px] text-[#64748b]"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                selected={selected.has(doc.id)}
                onToggle={() => toggleOne(doc.id)}
              />
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={8} className="px-[12px] py-[24px] text-center text-[12px] leading-[16px] text-[#64748b]">
                  Nenhum documento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        range={documents.length === 0 ? "0" : `1 - ${documents.length}`}
        total={isFiltering ? documents.length : totalDocuments}
      />
    </section>
  );
}