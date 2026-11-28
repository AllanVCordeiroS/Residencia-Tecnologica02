'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown, ArrowUp, Award, Calendar, CalendarClock, CheckCircle2, ChevronRight,
  CircleAlert, Clock3, Download, FileText, Files, Leaf, Plus, ShieldCheck, Truck, X,
  Archive
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLicensesQuery } from '@/hooks/queries/useLicensesQuery';
import { daysUntilExpiration, getLicenseStatus, isLicenseRestricted } from '@/services/licenses';
import type { License, LicenseStatus } from '@/types/license';
import { localDate } from '@/schemas/license';
import LicenseTable from './LicenseTable';
import { licenseCsv } from './_lib/license-list';

type LicenseRecord = { source: License; name: string; number: string; unit: string; status: LicenseStatus };
function tableRecord(source: License): LicenseRecord {
  return { source, name: source.tipoLicenca, number: source.numeroDocumento, unit: source.unidadeNome, status: getLicenseStatus(source) };
}
function downloadCsv(records: License[]) {
  const url = URL.createObjectURL(new Blob([licenseCsv(records)], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'licencas.csv'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PageHeading({ onOpenExport }: { onOpenExport: () => void }) {
  return (
    <>
      <div className="page-heading-row">
        <div className="page-title-block">
          <h1>Licenças e Alvarás</h1>
          <p>Acompanhe a validade, renovações e regularização das licenças e alvarás da sua empresa.</p>
        </div>
        <div className="page-actions">
          <Link href="/licencas/cadastrar" className="primary-button"><Plus size={16} />Cadastrar licença</Link>
          <button className="secondary-button" type="button" onClick={onOpenExport}>
            <Download size={16} />Exportar relatório
          </button>
        </div>
      </div>
    </>
  );
}

function MetricCard({ value, label, growth, variant, icon: Icon, trend }: { value: string; label: React.ReactNode; growth: string; variant: 'green' | 'amber' | 'red' | 'blue'; icon: LucideIcon; trend: 'up' | 'down' }) {
  const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;
  return (
    <section className={`metric-card metric-${variant}`}>
      <div className="metric-icon"><Icon size={24} strokeWidth={2} /></div>
      <div className="metric-copy">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        <div className="metric-growth"><TrendIcon size={14} strokeWidth={2.3} /> <span>{growth}</span></div>
      </div>
    </section>
  );
}

function ExportModal({ isOpen, onClose, licenses }: { isOpen: boolean; onClose: () => void; licenses: LicenseRecord[] }) {
  const [format, setFormat] = useState('csv');
  const modal = useRef<HTMLDialogElement>(null);
  const modalTitleId = useId();
  const formatsName = useId();
  useEffect(() => {
    const dialog = modal.current;
    if (isOpen) dialog?.showModal();
    return () => dialog?.close();
  }, [isOpen]);
  const [period, setPeriod] = useState('Todos');
  const [selectedUnits, setSelectedUnits] = useState<string[] | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Regular', 'A vencer', 'Vencida', 'Ainda não vigente', 'Vigência não informada']);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const unitNames = [...new Set(licenses.map(item => item.unit))];
  const selected = licenses.filter(item => (!selectedUnits || selectedUnits.includes(item.unit)) && selectedStatuses.includes(item.status) && (!from || !!item.source.dataVencimento && item.source.dataVencimento >= from) && (!to || !!item.source.dataVencimento && item.source.dataVencimento <= to));
  function download() {
    if (format !== 'csv' || !selected.length || (from && to && from > to)) return;
    downloadCsv(selected.map(item => item.source));
    onClose();
  }
  function choosePeriod(value: string) {
    setPeriod(value);
    const now = new Date();
    const today = localDate(now);
    if (value === 'Todos' || value === 'Personalizado') { setFrom(''); setTo(''); }
    if (value === 'Mês atual') { setFrom(today.slice(0, 7) + '-01'); setTo(localDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))); }
    if (value === 'Próximos 90 dias') { setFrom(today); const end = new Date(now); end.setDate(end.getDate() + 90); setTo(localDate(end)); }
    if (value === 'Ano atual') { setFrom(now.getFullYear() + '-01-01'); setTo(now.getFullYear() + '-12-31'); }
  }

  if (!isOpen) return null;

  return (
    <dialog ref={modal} aria-labelledby={modalTitleId} onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100vw-2rem)] max-w-[850px] overflow-y-auto rounded-[14px] border border-line bg-surface-raised p-0 text-foreground shadow-2xl backdrop:bg-slate-900/70 backdrop:backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-raised rounded-[14px] shadow-2xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto flex flex-col font-sans">
        
        {/* Header Escuro */}
        <div className="bg-[#0b1736] px-6 py-5 rounded-t-[14px] flex justify-between items-start border-b border-[#14224f]">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#14224f] flex items-center justify-center text-blue-400 shrink-0 border border-[#1e3270]">
              <Download size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 id={modalTitleId} className="text-lg font-bold text-white tracking-tight">Exportar Relatório de Licenças e Alvarás</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#342813] text-[#f3c544] border border-[#52411e]">
                  <ShieldCheck size={10} className="inline mr-1" /> Adega Distribution
                </span>
              </div>
              <p className="text-[13px] text-slate-400 dark:text-foreground-muted mt-1">
                Configure o escopo de dados, formatos executivos e filtros para auditoria e fiscalização da Adega Distribution.
              </p>
            </div>
          </div>
          <button type="button" aria-label="Fechar exportação de licenças" onClick={onClose} className="text-slate-400 dark:text-foreground-muted hover:text-white transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Corpo da Modal */}
        <div className="p-6 flex flex-col gap-8 text-slate-800 dark:text-foreground">
          
          <section>
            <div className="flex flex-wrap justify-between items-end gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[11px] font-bold">1</span>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-foreground">Seleção de Formato e Tipo de Dossiê</h3>
              </div>
              <span className="text-[12px] text-slate-400 dark:text-foreground-muted">Selecione o padrão de emissão</span>
            </div>

            <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <legend className="sr-only">Formato de exportação</legend>
              <label className="relative cursor-pointer">
                <input name={formatsName} aria-label="Relatório Executivo PDF" type="radio" value="pdf" checked={format === 'pdf'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-5 rounded-xl border-2 border-slate-200 dark:border-line bg-white dark:bg-surface-raised hover:border-blue-300 dark:hover:border-blue-800 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-950/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div aria-hidden="true" className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${format === 'pdf' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-line'}`}>
                      {format === 'pdf' && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                  <h4 className="font-bold text-[14px] text-slate-900 dark:text-foreground mb-2">Relatório Executivo PDF</h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold mb-3">Integração PDF indisponível</span>
                  <p className="text-[12px] text-slate-500 dark:text-foreground-muted leading-snug">A geração de PDF não está disponível nesta demonstração. Utilize a exportação CSV.</p>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input name={formatsName} aria-label="Planilha Consolidada CSV" type="radio" value="csv" checked={format === 'csv'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-5 rounded-xl border-2 border-slate-200 dark:border-line bg-white dark:bg-surface-raised hover:border-emerald-300 dark:hover:border-emerald-800 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                      <Files size={20} />
                    </div>
                    <div aria-hidden="true" className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${format === 'csv' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-line'}`}>
                      {format === 'csv' && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                  <h4 className="font-bold text-[14px] text-slate-900 dark:text-foreground mb-2">Planilha Consolidada CSV</h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold mb-3">Dados Tabulares Brutos</span>
                  <p className="text-[12px] text-slate-500 dark:text-foreground-muted leading-snug">Base detalhada com todas as colunas, datas, condicionantes, órgãos emissores e protocolos.</p>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input name={formatsName} aria-label="Pacote Completo Dossiê ZIP" type="radio" value="zip" checked={format === 'zip'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-5 rounded-xl border-2 border-slate-200 dark:border-line bg-white dark:bg-surface-raised hover:border-purple-300 dark:hover:border-purple-800 peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500 peer-checked:border-purple-500 peer-checked:bg-purple-50 dark:peer-checked:bg-purple-950/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
                      <Archive size={20} />
                    </div>
                    <div aria-hidden="true" className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${format === 'zip' ? 'border-purple-500 bg-purple-500' : 'border-slate-300 dark:border-line'}`}>
                      {format === 'zip' && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                  <h4 className="font-bold text-[14px] text-slate-900 dark:text-foreground mb-2">Pacote Completo Dossiê ZIP</h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold mb-3">Integração ZIP indisponível</span>
                  <p className="text-[12px] text-slate-500 dark:text-foreground-muted leading-snug">O empacotamento de arquivos e a autenticação de certificados exigem uma integração externa.</p>
                </div>
              </label>
            </fieldset>
            {format !== 'csv' && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">O formato {format.toUpperCase()} selecionado ainda não está disponível. Selecione CSV para baixar os registros; nenhum arquivo foi gerado.</p>}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[11px] font-bold">2</span>
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-foreground">Escopo e Filtros do Relatório</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[13px] font-bold text-slate-800 dark:text-foreground">Unidades e Centros de Distribuição</h4>
                  <label className="flex items-center gap-2 text-[12px] text-blue-600 dark:text-blue-300 font-bold cursor-pointer">
                    <input type="checkbox" checked={selectedUnits === null} onChange={event => setSelectedUnits(event.target.checked ? null : [])} className="w-4 h-4 rounded border-slate-300 dark:border-line text-blue-600 dark:text-blue-300 focus:ring-blue-500" /> Todas as {unitNames.length} unidades
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {unitNames.map(unit => (
                    <label key={unit} className="flex items-center gap-2 text-[13px] text-slate-700 dark:text-foreground border border-slate-100 dark:border-line p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-muted cursor-pointer">
                      <input type="checkbox" checked={selectedUnits === null || selectedUnits.includes(unit)} onChange={event => setSelectedUnits(event.target.checked ? [...(selectedUnits ?? unitNames), unit] : (selectedUnits ?? unitNames).filter(value => value !== unit))} className="w-4 h-4 rounded border-slate-300 dark:border-line text-blue-600 dark:text-blue-300 focus:ring-blue-500" /> {unit}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[13px] font-bold text-slate-800 dark:text-foreground">Status Regulatório</h4>
                  <span className="text-[12px] text-slate-400 dark:text-foreground-muted">Filtrar situações</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Regular', 'A vencer', 'Vencida', 'Ainda não vigente', 'Vigência não informada'].map(value => <label key={value} className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={selectedStatuses.includes(value)} onChange={event => setSelectedStatuses(event.target.checked ? [...selectedStatuses, value] : selectedStatuses.filter(status => status !== value))} />{value}</label>)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-xl p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <h4 className="text-[13px] font-bold text-slate-800 dark:text-foreground">Período de Vigência / Vencimento Considerado</h4>
                <div className="flex flex-wrap gap-2">
                  {['Todos', 'Mês atual', 'Próximos 90 dias', 'Ano atual', 'Personalizado'].map(btn => (
                    <button 
                      key={btn}
                      type="button"
                      onClick={() => choosePeriod(btn)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${period === btn ? 'bg-blue-600 text-white' : 'bg-white dark:bg-surface-raised border border-slate-200 dark:border-line text-slate-600 dark:text-foreground-muted hover:bg-slate-50 dark:hover:bg-surface-muted'}`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-foreground-muted mb-1">Data Início</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-foreground-muted" />
                    <input aria-label="Início do período de exportação" type="date" value={from} onChange={event => { setFrom(event.target.value); setPeriod("Personalizado"); }} className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-foreground-muted mb-1">Data Término</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-foreground-muted" />
                    <input aria-label="Fim do período de exportação" type="date" value={to} onChange={event => { setTo(event.target.value); setPeriod("Personalizado"); }} className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div className="bg-slate-50 dark:bg-surface-muted px-6 py-4 rounded-b-[14px] border-t border-slate-200 dark:border-line flex flex-wrap gap-4 justify-between items-center mt-auto">
          <div className="flex items-center gap-2 text-[12px] text-emerald-600 dark:text-emerald-300 font-bold">
            <CheckCircle2 size={16} /> {selected.length} licenças selecionadas nos filtros configurados
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white dark:bg-surface-raised border border-slate-300 dark:border-line text-slate-700 dark:text-foreground text-[13px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-surface-muted transition-colors">
              Cancelar
            </button>
            <button type="button" onClick={download} disabled={format !== 'csv' || !selected.length || !!(from && to && from > to)} className="px-5 py-2.5 bg-blue-700 text-white text-[13px] font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm">
              <Download size={16} /> {format === 'csv' ? 'Baixar Relatório CSV' : 'Formato indisponível'}
            </button>
          </div>
        </div>

      </div>
    </dialog>
  );
}

// Componente Principal da Página
export default function ListagemLicencasPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const query = useLicensesQuery();
  const licenses = (query.data ?? []).map(tableRecord);
  const regular = licenses.filter(item => item.status === 'Regular').length;
  const soon = licenses.filter(item => item.status === 'A vencer').length;
  const expired = licenses.filter(item => item.status === 'Vencida').length;
  const blocked = licenses.filter(item => isLicenseRestricted(item.source)).length;

  return (
    <div className="main-content relative">
      
      <PageHeading onOpenExport={() => setIsExportModalOpen(true)} />
      {query.isFetching && !query.isPending && <p role="status" className="mb-2 text-xs">Atualizando licenças…</p>}
      <p className="mb-4 text-xs text-slate-500 dark:text-foreground-muted">Registros demonstrativos da sessão. Vigência calculada pela data atual.</p>
      {query.isPending && <p role="status">Carregando licenças…</p>}
      {query.isError && <p role="alert">Não foi possível carregar licenças. <button type="button" onClick={() => void query.refetch()}>Tentar novamente</button></p>}
      {!query.isPending && query.data && <><div className="metrics-grid">
        <MetricCard value={String(regular)} label="Licenças regulares" growth="Situação atual" variant="green" icon={CheckCircle2} trend="up" />
        <MetricCard value={String(soon)} label="Próximos do vencimento" growth="Situação atual" variant="amber" icon={Clock3} trend="up" />
        <MetricCard value={String(expired)} label="Licenças vencidas" growth="Situação atual" variant="red" icon={CalendarClock} trend="up" />
        <MetricCard value={String(blocked)} label="Bloqueios cautelares" growth="Situação atual" variant="blue" icon={FileText} trend="down" />
      </div>
      
      <div className="content-grid">
        <LicenseTable licenses={query.data ?? []} onExportSelected={downloadCsv} />
        <aside className="right-column">
          <section className="side-card attention-card">
            <div className="side-card-heading"><span className="attention-heading-icon"><CircleAlert size={16} /></span><h2>Atenção</h2></div>
            <div className="attention-list">
              {[
                { title: 'Licenças vencidas', subtitle: 'Renovação necessária', count: String(expired), tone: 'red' },
                { title: 'Vencem em até 30 dias', subtitle: 'Acompanhe os prazos', count: String(licenses.filter(item => item.source.dataVencimento && daysUntilExpiration(item.source.dataVencimento) >= 0 && daysUntilExpiration(item.source.dataVencimento) <= 30).length), tone: 'amber' },
                { title: 'Bloqueios cautelares', subtitle: 'Ativação da unidade impedida', count: String(blocked), tone: 'blue' },
              ].map(item => (
                <div className="attention-item" key={item.title}>
                  <div className="attention-copy"><strong>{item.title}</strong><span>{item.subtitle.split('\n').map((part, i) => <span key={part + i}>{part}{i === 0 && item.subtitle.includes('\n') ? <br /> : null}</span>)}</span></div>
                  <span className={`attention-count count-${item.tone}`}>{item.count}</span>
                  <ChevronRight className="attention-chevron" size={16} />
                </div>
              ))}
            </div>
          </section>
          
          <section className="side-card categories-card">
            <div className="side-card-heading categories-heading"><span className="categories-heading-icon"><Files size={15} /></span><h2> Categorias</h2></div>
            <div className="category-list">
              {[
                { label: 'Alvarás', count: licenses.filter(item => item.name.includes("Alvará")).length, icon: FileText, tone: 'blue' },
                { label: 'Licenças Ambientais', count: licenses.filter(item => item.name.includes("Ambiental")).length, icon: Leaf, tone: 'green' },
                { label: 'Licenças Sanitárias', count: licenses.filter(item => item.name.includes("Sanitária")).length, icon: ShieldCheck, tone: 'purple' },
                { label: 'Certificados', count: licenses.filter(item => item.name.includes("AVCB")).length, icon: Award, tone: 'purple' },
                { label: 'Licenças de Transporte', count: licenses.filter(item => item.name.includes("ANTT")).length, icon: Truck, tone: 'cyan' },
                { label: 'Outros', count: licenses.filter(item => item.name.includes("Outra")).length, icon: Files, tone: 'red' },
              ].map(({ label, count, icon: Icon, tone }) => (
                <div className="category-row" key={label}>
                  <Icon className={`category-icon category-${tone}`} size={15} strokeWidth={1.9} />
                  <span>{label}</span><strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="tip-card">
            <span className="tip-icon"><ShieldCheck size={17} /></span>
            <div className="tip-copy"><strong>Dica</strong><p>Mantenha as licenças sempre atualizadas para evitar multas e interrupções nas operações.</p></div>
          </section>
        </aside>
      </div>

      </>}
      <ExportModal licenses={licenses} isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
}
