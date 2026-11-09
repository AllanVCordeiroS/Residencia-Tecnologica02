"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive, BarChart3, CalendarClock, CalendarDays, Check, ChevronDown, CircleAlert,
  Download, FileChartColumn, FileSpreadsheet, FileText, LockKeyhole, Mail, X,
} from "lucide-react";
import {
  downloadScheduleConfig, exportReportFile,
  type ReportExportCost, type ReportExportFormat, type ReportExportMetric,
  type ReportExportTemplate, type ReportExportUnit, type ReportFilters,
} from "./reportExportUtils";

export type { ReportExportCost, ReportExportMetric, ReportExportUnit } from "./reportExportUtils";

type TemplateId = "executive" | "compliance" | "productivity";
type FormatId = ReportExportFormat;
type DeliveryMode = "immediate" | "scheduled";
type FrequencyId = "first-business-day" | "weekly-monday" | "monthly-last-business-day";

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedback: (message: string) => void;
  filters: ReportFilters;
  metrics: ReportExportMetric[];
  units: ReportExportUnit[];
  costs: ReportExportCost[];
}

const templates: (ReportExportTemplate & { id: TemplateId; pages: number; icon: typeof FileChartColumn; iconClass: string; tag: string })[] = [
  {
    id: "executive",
    title: "Dossiê Executivo C-Level",
    eyebrow: "Conselho & Diretoria Geral",
    description: "Resumo consolidado com indicadores gerenciais, SLA operacional e regularidade documental das unidades.",
    pages: 16,
    icon: FileChartColumn,
    iconClass: "border-blue-200 bg-blue-50 text-blue-700",
    tag: "Completo",
  },
  {
    id: "compliance",
    title: "Relatório Forense de Conformidade",
    eyebrow: "Auditoria Jurídica & Fiscal",
    description: "Ênfase em licenças, documentos pendentes, ocorrências operacionais e pontos que exigem acompanhamento.",
    pages: 9,
    icon: LockKeyhole,
    iconClass: "border-amber-200 bg-amber-50 text-amber-700",
    tag: "Risco legal",
  },
  {
    id: "productivity",
    title: "Balanço Multipolar de Produtividade",
    eyebrow: "Operações & Supply Chain",
    description: "Comparativo de produtividade, rotinas concluídas e indicadores entre as unidades de distribuição.",
    pages: 12,
    icon: BarChart3,
    iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    tag: "Operações",
  },
];

const formats: {
  id: FormatId;
  title: string;
  description: string;
  icon: typeof FileText;
  iconClass: string;
  size: string;
}[] = [
  {
    id: "pdf",
    title: "PDF Diagramado A4",
    description: "Relatório preparado para impressão ou salvamento em PDF pelo navegador.",
    icon: FileText,
    iconClass: "border-blue-200 bg-blue-50 text-blue-700",
    size: "2,4 MB",
  },
  {
    id: "xlsx",
    title: "Planilha XLSX Gerencial",
    description: "Planilha Excel com abas de resumo, unidades e despesas.",
    icon: FileSpreadsheet,
    iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    size: "148 KB",
  },
  {
    id: "zip",
    title: "Pacote ZIP Autenticado",
    description: "Arquivos de dados e manifesto de integridade com hashes SHA-256.",
    icon: Archive,
    iconClass: "border-amber-200 bg-amber-50 text-amber-700",
    size: "Variável",
  },
];

const configuredRecipients = [
  { email: "ricardo.silveira@adegadist.com.br", label: "Diretoria" },
  { email: "conselho.fiscal@adegadist.com.br", label: "Conselho Fiscal" },
];

const frequencyOptions: { id: FrequencyId; label: string; description: string }[] = [
  { id: "first-business-day", label: "Todo 1º dia útil do mês", description: "Às 08h00 BRT" },
  { id: "weekly-monday", label: "Toda segunda-feira", description: "Às 08h00 BRT" },
  { id: "monthly-last-business-day", label: "Último dia útil do mês", description: "Às 17h00 BRT" },
];

function localDateTimeValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function defaultScheduleDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(8, 0, 0, 0);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  return localDateTimeValue(date);
}

export default function ReportExportModal({
  isOpen,
  onClose,
  onFeedback,
  filters,
  metrics,
  units,
  costs,
}: ReportExportModalProps) {
  const [template, setTemplate] = useState<TemplateId>("executive");
  const [format, setFormat] = useState<FormatId>("pdf");
  const [delivery, setDelivery] = useState<DeliveryMode>("immediate");
  const [frequency, setFrequency] = useState<FrequencyId>("first-business-day");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleDate);
  const [recipients, setRecipients] = useState<string[]>(configuredRecipients.map((recipient) => recipient.email));
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedTemplate = templates.find((item) => item.id === template) ?? templates[0];
  const selectedFormat = formats.find((item) => item.id === format) ?? formats[0];
  const selectedFrequency = frequencyOptions.find((item) => item.id === frequency) ?? frequencyOptions[0];
  const minimumDateTime = useMemo(() => localDateTimeValue(new Date()), []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isGenerating) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isGenerating, onClose]);

  if (!isOpen) return null;

  const toggleRecipient = (email: string) => {
    setRecipients((current) => current.includes(email) ? current.filter((item) => item !== email) : [...current, email]);
  };

  const handleGenerate = async () => {
    setError("");
    if (delivery === "scheduled") {
      const targetDate = new Date(scheduledAt);
      if (!scheduledAt || Number.isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
        setError("Informe uma data e hora futuras para a configuração de entrega.");
        return;
      }
      if (recipients.length === 0) {
        setError("Selecione ao menos um destinatário corporativo.");
        return;
      }
      try {
        downloadScheduleConfig({
          template: selectedTemplate.title,
          format: selectedFormat.title,
          filters,
          frequency: selectedFrequency.label,
          preferredTime: selectedFrequency.description,
          scheduledAt,
          recipients,
        });
        onFeedback("Configuração de entrega baixada. O protótipo não agenda nem envia e-mails automaticamente.");
        onClose();
      } catch (generationError) {
        setError(generationError instanceof Error ? generationError.message : "Não foi possível salvar a configuração.");
      }
      return;
    }

    setIsGenerating(true);
    try {
      const message = await exportReportFile({
        format,
        template: selectedTemplate,
        formatTitle: selectedFormat.title,
        filters,
        metrics,
        units,
        costs,
      });
      onFeedback(message);
      onClose();
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Ocorreu um erro inesperado durante a exportação.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-2 backdrop-blur-sm sm:p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-export-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isGenerating) onClose();
      }}
    >
      <section className="my-auto flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[18px]">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-700 bg-[#0d1a34] px-4 py-4 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/20 text-blue-200"><FileChartColumn size={20} /></span>
            <div className="min-w-0">
              <h2 id="report-export-title" className="text-sm font-bold tracking-tight sm:text-base">Central de Compilação &amp; Exportação de Dossiês</h2>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300 sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Adega Distribution <span className="text-slate-500">•</span> Matriz &amp; Filiais <span className="text-slate-500">(8 CDDs conectados)</span></p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isGenerating} aria-label="Fechar modal de exportação" className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"><X size={19} /></button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#fbfcff] px-4 py-5 sm:space-y-5 sm:px-6 sm:py-6">
          <section aria-labelledby="template-heading">
            <div className="mb-2.5">
              <h3 id="template-heading" className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Selecione o modelo de compilação</h3>
              <p className="text-[10px] text-slate-400">Estruturas modulares pré-certificadas pela governança BEVOX.</p>
            </div>
            <div role="group" aria-labelledby="template-heading" className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              {templates.map((item) => {
                const Icon = item.icon;
                const selected = template === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTemplate(item.id)}
                    className={`relative flex min-h-[150px] flex-col rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-[166px] sm:p-3.5 ${selected ? "border-blue-500 bg-white ring-1 ring-blue-500" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <span className="flex w-full items-start gap-2.5">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${item.iconClass}`}><Icon size={15} /></span>
                      <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold leading-snug text-slate-800">{item.title}</span><span className="mt-1 block text-[9px] leading-snug text-slate-400">{item.eyebrow}</span></span>
                    </span>
                    <span className="mt-2.5 block text-[10px] leading-[1.5] text-slate-500">{item.description}</span>
                    <span className="mt-auto flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[9px]">
                      <span className={`rounded px-1.5 py-1 font-medium ${selected ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{item.pages} páginas • {item.tag}</span>
                      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-blue-600" : "border-slate-300"}`}>{selected && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="format-heading">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <h3 id="format-heading" className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Formato de exportação &amp; renderização</h3>
              <span className="text-[9px] text-slate-400">Layout A4 • impressão conforme configurações do navegador</span>
            </div>
            <div role="group" aria-labelledby="format-heading" className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              {formats.map((item) => {
                const Icon = item.icon;
                const selected = format === item.id;
                return (
                  <button key={item.id} type="button" aria-pressed={selected} onClick={() => setFormat(item.id)} className={`relative flex min-h-[84px] items-start gap-2.5 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:p-3.5 ${selected ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.iconClass}`}><Icon size={16} /></span>
                    <span className="min-w-0 flex-1"><span className="block pr-3 text-[10px] font-bold leading-snug text-slate-800">{item.title}</span><span className="mt-1 block text-[9px] leading-snug text-slate-500">{item.description}</span></span>
                    <span className={`absolute right-3 top-3 h-2 w-2 rounded-full ${selected ? "bg-blue-600" : "bg-slate-300"}`} />
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="delivery-heading" className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div><h3 id="delivery-heading" className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Canal de distribuição &amp; entrega</h3><p className="text-[10px] text-slate-400">Escolha entre preparar o arquivo agora ou salvar as preferências de entrega.</p></div>
              <div role="group" aria-label="Modalidade de entrega" className="flex rounded-lg bg-slate-100 p-1 text-[10px]">
                <button type="button" aria-pressed={delivery === "immediate"} onClick={() => { setDelivery("immediate"); setError(""); }} className={`rounded-md px-2.5 py-1.5 font-semibold transition sm:px-3 ${delivery === "immediate" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Download imediato</button>
                <button type="button" aria-pressed={delivery === "scheduled"} onClick={() => { setDelivery("scheduled"); setError(""); }} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-semibold transition sm:px-3 ${delivery === "scheduled" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><CalendarClock size={12} /> Agendar entrega</button>
              </div>
            </div>

            {delivery === "scheduled" && (
              <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 sm:grid-cols-2">
                <label className="text-[10px] font-semibold text-slate-600">Frequência de disparo
                  <span className="relative mt-1.5 block"><select value={frequency} onChange={(event) => setFrequency(event.target.value as FrequencyId)} className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[10px] font-medium outline-none focus:border-blue-500">{frequencyOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-3 text-slate-400" /></span>
                </label>
                <label className="text-[10px] font-semibold text-slate-600">Primeira data de disparo
                  <span className="relative mt-1.5 block"><CalendarDays size={13} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input type="datetime-local" min={minimumDateTime} value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-2 text-[10px] font-medium outline-none focus:border-blue-500" /></span>
                </label>
                <p className="text-[9px] text-slate-500 sm:col-span-2">Horário preferencial: {selectedFrequency.description}. A data será registrada na configuração baixada, mas não executará envios automáticos.</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
              <div>
                <p className="mb-2 text-[10px] font-semibold text-slate-600">{delivery === "scheduled" ? "Frequência e data de disparo" : "Resumo da entrega"}</p>
                <div className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[9px] text-slate-600"><CalendarDays size={13} className="shrink-0 text-blue-600" /><span>{delivery === "scheduled" ? `${selectedFrequency.label} • ${scheduledAt ? new Date(scheduledAt).toLocaleString("pt-BR") : "Selecione a data"}` : "Arquivo preparado localmente para download imediato"}</span></div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold text-slate-600">Destinatários corporativos pré-configurados</p>
                <div className="flex flex-wrap gap-1.5">
                  {configuredRecipients.map((recipient) => {
                    const checked = recipients.includes(recipient.email);
                    return <label key={recipient.email} className={`inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[9px] transition ${checked ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"} focus-within:ring-2 focus-within:ring-blue-500`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleRecipient(recipient.email)} aria-label={`Incluir ${recipient.email}`} className="sr-only" />
                      {checked ? <Check size={11} /> : <Mail size={11} />}
                      <span className="break-all">{recipient.email}</span>
                    </label>;
                  })}
                </div>
              </div>
            </div>

            {delivery === "scheduled" && <p className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[9px] leading-relaxed text-amber-900"><CircleAlert size={14} className="mt-0.5 shrink-0" /> O projeto não possui serviço de agendamento ou envio de e-mails. Esta ação baixará um arquivo JSON de configuração; nenhum e-mail será enviado e nenhum agendamento ficará ativo.</p>}
          </section>

          {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] text-red-700"><CircleAlert size={15} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2 text-[10px] text-slate-500"><FileText size={13} className="shrink-0 text-slate-400" /><span>Estimativa: <strong className="font-semibold text-slate-700">{selectedTemplate.pages} páginas</strong> • {selectedFormat.size}</span></p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button type="button" onClick={onClose} disabled={isGenerating} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
            <button type="button" onClick={handleGenerate} disabled={isGenerating} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70">
              {delivery === "scheduled" ? <CalendarClock size={14} /> : <Download size={14} />}
              {isGenerating ? "Preparando dossiê…" : delivery === "scheduled" ? "Baixar configuração de entrega" : format === "pdf" ? "Gerar dossiê (PDF)" : format === "xlsx" ? "Gerar e baixar planilha" : "Gerar e baixar pacote ZIP"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
