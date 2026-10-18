'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown, ArrowDownUp, ArrowUp, Award, Calendar, CalendarClock,
  CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  CircleAlert, Clock3, Download, FileText, FileX, Files, Leaf,
  MoreVertical, Plus, RotateCw, Search, ShieldCheck, Truck, X,
  Archive
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type LicenseRecord = {
  name: string; number: string; kind: 'Alvará' | 'Licença';
  kindTone: 'blue' | 'green' | 'purple'; unit: string; unitKind: string;
  issuer: string; owner: string; due: string; dueMeta: string;
  dueTone: 'warning' | 'danger' | 'success' | 'muted';
  status: 'A vencer' | 'Vencida' | 'Regular'; icon: LucideIcon; iconTone: string;
};

const licenses: LicenseRecord[] = [
  { name: 'Alvará de\nFuncionamento', number: 'Nº 2025-43112', kind: 'Alvará', kindTone: 'blue', unit: 'Unidade Paulista', unitKind: 'Filial', issuer: 'Prefeitura\nMunicipal', owner: 'Ana Souza', due: '20/10/2026', dueMeta: 'Em 4 dias', dueTone: 'warning', status: 'A vencer', icon: FileText, iconTone: 'blue' },
  { name: 'Licença\nAmbiental', number: 'Nº 000781/2026', kind: 'Licença', kindTone: 'green', unit: 'Unidade Jaboatão', unitKind: 'Filial', issuer: 'CETESB', owner: 'Pedro Lima', due: '12/10/2026', dueMeta: 'Vencida há 4\ndias', dueTone: 'danger', status: 'Vencida', icon: Leaf, iconTone: 'green' },
  { name: 'Licença\nSanitária', number: 'Nº 4532/2025', kind: 'Licença', kindTone: 'purple', unit: 'Matriz – Recife', unitKind: 'Matriz', issuer: 'Vigilância\nSanitária', owner: 'Carlos Eduardo', due: '15/03/2027', dueMeta: '149 dias', dueTone: 'success', status: 'Regular', icon: ShieldCheck, iconTone: 'purple' },
  { name: 'Certificado de\nBombeiros', number: 'Nº 7781/2025', kind: 'Alvará', kindTone: 'blue', unit: 'Unidade Caruaru', unitKind: 'Filial', issuer: 'Corpo de\nBombeiros', owner: 'Larissa Almeida', due: '05/11/2026', dueMeta: 'Em 20 dias', dueTone: 'warning', status: 'A vencer', icon: Award, iconTone: 'blue' },
  { name: 'Licença de\nTransporte', number: 'Nº 556/2024', kind: 'Licença', kindTone: 'purple', unit: 'Unidade Jaboatão', unitKind: 'Filial', issuer: 'ANTT', owner: 'Mariana Costa', due: '–', dueMeta: 'Sem vencimento', dueTone: 'muted', status: 'Regular', icon: Truck, iconTone: 'indigo' },
  { name: 'Alvará de\nFuncionamento', number: 'Nº 2025-7761', kind: 'Alvará', kindTone: 'blue', unit: 'Unidade Salvador', unitKind: 'Filial', issuer: 'Prefeitura\nMunicipal', owner: 'Felipe Rocha', due: '28/09/2026', dueMeta: 'Vencida há 18\ndias', dueTone: 'danger', status: 'Vencida', icon: FileX, iconTone: 'red' },
];

function PageHeading({ onOpenExport }: { onOpenExport: () => void }) {
  return (
    <>
      <div className="page-breadcrumbs">
        <span>BEVOX</span><span>/</span><span>Gestão Corporativa</span><span>/</span><span className="page-current">Licenças e Alvarás</span>
      </div>
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

function StatusPill({ status }: { status: LicenseRecord['status'] }) {
  const tone = status === 'Regular' ? 'regular' : status === 'Vencida' ? 'expired' : 'due-soon';
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{status}</span>;
}

function LicenseTable() {
  return (
    <section className="table-card">
      <div className="filters-panel">
        <div className="filter-controls">
          <div className="search-field"><Search size={16} /><span>Buscar por licença, alvará, unidade, órgão emissor</span></div>
          <div className="select-control">Unidade <ChevronDown size={14} /></div>
          <div className="select-control type-select">Tipo de licença <ChevronDown size={14} /></div>
          <div className="select-control status-select">Status <ChevronDown size={14} /></div>
          <div className="select-control date-select">Vencimento <Calendar size={14} /></div>
        </div>
        <div className="clear-filters"><RotateCw size={14} /><span>Limpar filtros</span></div>
      </div>
      <div className="table-scroll">
        <table className="license-table">
          <colgroup>
            <col className="col-check" /><col className="col-license" /><col className="col-type" />
            <col className="col-unit" /><col className="col-issuer" /><col className="col-owner" />
            <col className="col-due" /><col className="col-status" /><col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th><span className="checkbox-display" /></th>
              <th>Licença / Alvará <ArrowDownUp size={11} /></th>
              <th>Tipo <ArrowDownUp size={11} /></th>
              <th>Unidade <ArrowDownUp size={11} /></th>
              <th>Órgão<br />Emissor <ArrowDownUp size={10} /></th>
              <th>Responsável <ArrowDownUp size={11} /></th>
              <th>Vencimento <ArrowDownUp size={11} /></th>
              <th>Status <ArrowDownUp size={11} /></th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((record) => {
              const DocIcon = record.icon;
              return (
                <tr key={record.number}>
                  <td><span className="checkbox-display" /></td>
                  <td>
                    <div className="license-name-cell">
                      <span className={`document-icon doc-${record.iconTone}`}><DocIcon size={16} strokeWidth={1.9} /></span>
                      <div className="license-name-copy">
                        <strong>{record.name.split('\n').map((part, i) => <span key={part + i}>{part}{i === 0 && record.name.includes('\n') ? <br /> : null}</span>)}</strong>
                        <small>{record.number}</small>
                      </div>
                    </div>
                  </td>
                  <td><span className={`type-pill type-${record.kindTone}`}>{record.kind}</span></td>
                  <td><div className="two-line-cell"><span>{record.unit}</span><small>{record.unitKind}</small></div></td>
                  <td><span className="multiline-text">{record.issuer.split('\n').map((part, i) => <span key={part + i}>{part}{i === 0 && record.issuer.includes('\n') ? <br /> : null}</span>)}</span></td>
                  <td className="owner-cell">{record.owner}</td>
                  <td>
                    <div className={`due-cell due-${record.dueTone}`}>
                      <strong>{record.due}</strong>
                      <span className="due-meta">
                        {record.dueTone === 'warning' ? <Clock3 size={12} /> : record.dueTone === 'danger' ? <CalendarClock size={12} /> : record.dueTone === 'success' ? <CalendarDays size={12} /> : null}
                        <span>{record.dueMeta.split('\n').map((part, i) => <span key={part + i}>{part}{i === 0 && record.dueMeta.includes('\n') ? <br /> : null}</span>)}</span>
                      </span>
                    </div>
                  </td>
                  <td><StatusPill status={record.status} /></td>
                  <td><button className="row-more" type="button"><MoreVertical size={17} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Mostrando <strong>1 – 6</strong> de <strong>124</strong> licenças e alvarás</span>
        <div className="pagination">
          <button className="page-arrow disabled" type="button"><ChevronLeft size={16} /></button>
          <button className="page-number selected" type="button">1</button>
          <button className="page-number" type="button">2</button>
          <button className="page-number" type="button">3</button>
          <span className="page-ellipsis">...</span>
          <button className="page-number" type="button">16</button>
          <button className="page-arrow" type="button"><ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}

function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [format, setFormat] = useState('pdf');
  const [period, setPeriod] = useState('ano_fiscal');

  if (!isOpen) return null;

  return (
    // Z-Index forçado para 99999 e fundo preto com opacidade nativa do Tailwind
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-[14px] shadow-2xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto flex flex-col font-sans">
        
        {/* Header Escuro */}
        <div className="bg-[#0b1736] px-6 py-5 rounded-t-[14px] flex justify-between items-start border-b border-[#14224f]">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#14224f] flex items-center justify-center text-blue-400 shrink-0 border border-[#1e3270]">
              <Download size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-tight">Exportar Relatório de Licenças e Alvarás</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#342813] text-[#f3c544] border border-[#52411e]">
                  <ShieldCheck size={10} className="inline mr-1" /> Adega Distribution
                </span>
              </div>
              <p className="text-[13px] text-slate-400 mt-1">
                Configure o escopo de dados, formatos executivos e filtros para auditoria e fiscalização da Adega Distribution.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Corpo da Modal */}
        <div className="p-6 flex flex-col gap-8 text-slate-800">
          
          <section>
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">1</span>
                <h3 className="text-[14px] font-bold text-slate-900">Seleção de Formato e Tipo de Dossiê</h3>
              </div>
              <span className="text-[12px] text-slate-400">Selecione o padrão de emissão</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="relative cursor-pointer">
                <input type="radio" value="pdf" checked={format === 'pdf'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 peer-checked:border-blue-600 peer-checked:bg-blue-50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <h4 className="font-bold text-[14px] text-slate-900 mb-2">Relatório Executivo PDF</h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold mb-3">Com Brasão & Gráficos</span>
                  <p className="text-[12px] text-slate-500 leading-snug">Indicado para diretoria, bancos e auditorias externas. Inclui sumário gráfico de conformidade.</p>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input type="radio" value="xlsx" checked={format === 'xlsx'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <Files size={20} />
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <h4 className="font-bold text-[14px] text-slate-900 mb-2">Planilha Consolidada XLSX / CSV</h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold mb-3">Dados Tabulares Brutos</span>
                  <p className="text-[12px] text-slate-500 leading-snug">Base detalhada com todas as colunas, datas, condicionantes, órgãos emissores e protocolos.</p>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input type="radio" value="zip" checked={format === 'zip'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-purple-300 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center">
                      <Archive size={20} />
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-purple-500 peer-checked:bg-purple-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <h4 className="font-bold text-[14px] text-slate-900 mb-2">Pacote Completo Dossiê ZIP</h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold mb-3">Certificados Autenticados</span>
                  <p className="text-[12px] text-slate-500 leading-snug">Relatório consolidado + cópias digitalizadas das certidões e comprovantes autenticados ICP-Brasil.</p>
                </div>
              </label>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">2</span>
              <h3 className="text-[14px] font-bold text-slate-900">Escopo e Filtros do Relatório</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[13px] font-bold text-slate-800">Unidades e Centros de Distribuição</h4>
                  <label className="flex items-center gap-2 text-[12px] text-blue-600 font-bold cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> Todas as 6 unidades
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Matriz Recife', 'CDD Paulista', 'CDD Jaboatão', 'CDD Olinda', 'CDD Cabo', 'CDD Caruaru'].map(unit => (
                    <label key={unit} className="flex items-center gap-2 text-[13px] text-slate-700 border border-slate-100 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> {unit}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[13px] font-bold text-slate-800">Status Regulatório</h4>
                  <span className="text-[12px] text-slate-400">Filtrar situações</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-[13px] text-slate-700 border border-slate-100 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> 
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Regulares
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-slate-700 border border-slate-100 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> 
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> &lt; 30 dias (Vencendo)
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-slate-700 border border-slate-100 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> 
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Vencidas / Críticas
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-slate-700 border border-slate-100 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> 
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Em Análise
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <h4 className="text-[13px] font-bold text-slate-800">Período de Vigência / Vencimento Considerado</h4>
                <div className="flex gap-2">
                  {['Mês atual', 'Próximos 90 dias', 'Ano Fiscal 2026', 'Personalizado'].map(btn => (
                    <button 
                      key={btn}
                      type="button"
                      onClick={() => setPeriod(btn)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${period === btn ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Data Início</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="text" defaultValue="01/01/2026" className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Data Término</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="text" defaultValue="31/12/2026" className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div className="bg-slate-50 px-6 py-4 rounded-b-[14px] border-t border-slate-200 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2 text-[12px] text-emerald-600 font-bold">
            <CheckCircle2 size={16} /> 97 licenças selecionadas nos filtros configurados
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="button" className="px-5 py-2.5 bg-blue-700 text-white text-[13px] font-bold rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm">
              <Download size={16} /> Gerar e Baixar Relatório ({format.toUpperCase()}) <span className="opacity-70 font-normal border-l border-blue-500 pl-2 ml-1">- 2.4 MB</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente Principal da Página
export default function ListagemLicencasPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="main-content relative">
      
      {/* CABEÇALHO INTEGRADO (Evita problemas de passagem de estado) */}
      <div className="page-breadcrumbs">
        <span>BEVOX</span><span>/</span><span>Gestão Corporativa</span><span>/</span><span className="page-current">Licenças e Alvarás</span>
      </div>
      <div className="page-heading-row">
        <div className="page-title-block">
          <h1>Licenças e Alvarás</h1>
          <p>Acompanhe a validade, renovações e regularização das licenças e alvarás da sua empresa.</p>
        </div>
        <div className="page-actions">
          <Link href="/licencas/cadastrar" className="primary-button"><Plus size={16} />Cadastrar licença</Link>
          <button 
            className="secondary-button" 
            type="button" 
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download size={16} />Exportar relatório
          </button>
        </div>
      </div>
      
      <div className="metrics-grid">
        <MetricCard value="86" label="Licenças regulares" growth="+6% este mês" variant="green" icon={CheckCircle2} trend="up" />
        <MetricCard value="5" label="Próximos do vencimento" growth="+2% este mês" variant="amber" icon={Clock3} trend="up" />
        <MetricCard value="2" label="Licenças vencidas" growth="+1% este mês" variant="red" icon={CalendarClock} trend="up" />
        <MetricCard value="4" label={<>Pendentes de<br />regularização</>} growth="+3% este mês" variant="blue" icon={FileText} trend="down" />
      </div>
      
      <div className="content-grid">
        <LicenseTable />
        <aside className="right-column">
          <section className="side-card attention-card">
            <div className="side-card-heading"><span className="attention-heading-icon"><CircleAlert size={16} /></span><h2>Atenção</h2></div>
            <div className="attention-list">
              {[
                { title: 'Licenças vencidas', subtitle: 'Renovação necessária', count: '2', tone: 'red' },
                { title: 'Vencem em até 30 dias', subtitle: 'Acompanhe os prazos', count: '5', tone: 'amber' },
                { title: 'Pendentes de regularização', subtitle: 'Aguardam documento ou\nanálise', count: '4', tone: 'blue' },
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
                { label: 'Alvarás', count: 12, icon: FileText, tone: 'blue' },
                { label: 'Licenças Ambientais', count: 8, icon: Leaf, tone: 'green' },
                { label: 'Licenças Sanitárias', count: 6, icon: ShieldCheck, tone: 'purple' },
                { label: 'Certificados', count: 5, icon: Award, tone: 'purple' },
                { label: 'Licenças de Transporte', count: 4, icon: Truck, tone: 'cyan' },
                { label: 'Outros', count: 3, icon: Files, tone: 'red' },
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

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
}