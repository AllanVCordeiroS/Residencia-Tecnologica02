"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, X, FileText, FileSpreadsheet, Archive, CheckCircle2, 
  Scale, Calendar, CheckSquare
} from 'lucide-react';

interface FinancialAccount {
  id: string; description: string; subDescription: string; unit: string;
  category: string; amount: string; dueDate: string; status: 'A vencer' | 'Atrasada' | 'Em dia';
}

interface UnitPerformance {
  unit: string; revenue: string; expense: string; margin: string;
}

const accountsData: FinancialAccount[] = [
  { id: '1', description: 'Ambev Brasil', subDescription: 'Compra de Chopp & Bebidas NF-e #90214', unit: 'Matriz - Recife', category: 'Estoque e Mercadorias', amount: 'R$ 24.800,00', dueDate: 'Hoje (24/10/2026)', status: 'A vencer' },
  { id: '2', description: 'Copergás PE', subDescription: 'Gás Industrial & Caldeiras', unit: 'CDD Jaboatão', category: 'Infraestrutura', amount: 'R$ 3.420,00', dueDate: '21/10/2026', status: 'Atrasada' },
  { id: '3', description: 'Transportadora Rapidão Cometa', subDescription: 'Frete e Distribuição Regional Lote 14', unit: 'Filial Olinda', category: 'Logística', amount: 'R$ 6.150,00', dueDate: '28/10/2026', status: 'Em dia' },
  { id: '4', description: 'Distribuidora Petrobras', subDescription: 'Combustível · Abastecimento Frota de Caminhões', unit: 'Paulista', category: 'Logística', amount: 'R$ 8.900,00', dueDate: '02/11/2026', status: 'A vencer' },
  { id: '5', description: 'Enel Distribuição Energia', subDescription: 'Fatura de Energia Elétrica Matriz', unit: 'Cabo', category: 'Infraestrutura', amount: 'R$ 5.730,00', dueDate: '05/11/2026', status: 'Em dia' },
];

const unitPerformanceData: UnitPerformance[] = [
  { unit: 'Matriz - Recife', revenue: 'R$ 92.500', expense: 'R$ 61.200', margin: '33,8%' },
  { unit: 'Paulista', revenue: 'R$ 54.200', expense: 'R$ 38.700', margin: '28,6%' },
  { unit: 'Jaboatão', revenue: 'R$ 42.800', expense: 'R$ 32.400', margin: '24,2%' },
  { unit: 'Olinda', revenue: 'R$ 34.600', expense: 'R$ 24.800', margin: '22,3%' },
  { unit: 'Cabo', revenue: 'R$ 24.400', expense: 'R$ 17.200', margin: '18,4%' },
];

function ExportFinanceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [format, setFormat] = useState('pdf');
  const [regime, setRegime] = useState('competencia');
  const [period, setPeriod] = useState('ano_2026');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-raised rounded-[14px] shadow-2xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto flex flex-col font-sans">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-line flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-foreground tracking-tight">Exportar Relatório Financeiro</h2>
              <p className="text-[12px] text-slate-500 dark:text-foreground-muted">
                Adega Distribution • Matriz & Filiais • Configure o escopo, formato e granularidade contábil para controladoria e diretoria.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-foreground-muted hover:text-slate-700 dark:hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          {/* Seção 1: Formato */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[13px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 1. FORMATO DE SAÍDA & LAYOUT DO RELATÓRIO
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-foreground-muted">Escolha a apresentação final dos dados</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PDF */}
              <label className="relative cursor-pointer">
                <input type="radio" value="pdf" checked={format === 'pdf'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-4 rounded-xl border-2 border-slate-200 dark:border-line bg-white dark:bg-surface-raised hover:border-blue-300 dark:hover:border-blue-800 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-950/40 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={24} className={format === 'pdf' ? "text-blue-600 dark:text-blue-300" : "text-rose-500 dark:text-rose-300"} />
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-foreground leading-tight">Relatório Executivo PDF</h4>
                      <span className="text-[10px] text-blue-600 dark:text-blue-300 font-medium">Com DRE & Gráficos</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-foreground-muted mb-3 leading-relaxed">Inclui sumário executivo, DRE consolidado, aging de recebíveis, gráficos de tendências e fluxo de caixa diagramado.</p>
                  <div className="flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 font-bold border-t border-slate-100 dark:border-line pt-2 opacity-0 peer-checked:opacity-100">
                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-600 rounded-full"></span> Pronto para impressão / board</span>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              </label>

              {/* XLSX */}
              <label className="relative cursor-pointer">
                <input type="radio" value="xlsx" checked={format === 'xlsx'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-4 rounded-xl border-2 border-slate-200 dark:border-line bg-white dark:bg-surface-raised hover:border-emerald-300 dark:hover:border-emerald-800 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950/40 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <FileSpreadsheet size={24} className={format === 'xlsx' ? "text-emerald-600 dark:text-emerald-300" : "text-emerald-500 dark:text-emerald-300"} />
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-foreground leading-tight">Planilha Analítica</h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-medium">XLSX / CSV Dinâmico</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-foreground-muted mb-3 leading-relaxed">Base completa de lançamentos com plano de contas gerencial, centro de custo, alíquotas ST, CNPJ e fórmulas abertas.</p>
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-bold border-t border-slate-100 dark:border-line pt-2 opacity-0 peer-checked:opacity-100">
                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-600 rounded-full"></span> Auditoria e BI</span>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              </label>

              {/* ZIP */}
              <label className="relative cursor-pointer">
                <input type="radio" value="zip" checked={format === 'zip'} onChange={(e) => setFormat(e.target.value)} className="peer sr-only" />
                <div className="h-full p-4 rounded-xl border-2 border-slate-200 dark:border-line bg-white dark:bg-surface-raised hover:border-amber-300 dark:hover:border-amber-800 peer-checked:border-amber-600 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-950/40 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Archive size={24} className={format === 'zip' ? "text-amber-600 dark:text-amber-300" : "text-amber-500 dark:text-amber-300"} />
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-foreground leading-tight">Fechamento Contábil</h4>
                      <span className="text-[10px] text-amber-600 dark:text-amber-300 font-medium">Pacote ZIP Consolidado</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-foreground-muted mb-3 leading-relaxed">Balancete analítico, extrato de conciliação bancária OFX/PDF, notas de remessa e espelhos fiscais por unidade.</p>
                  <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 font-bold border-t border-slate-100 dark:border-line pt-2 opacity-0 peer-checked:opacity-100">
                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-amber-600 rounded-full"></span> Escrituração Externa</span>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* Seção 2: Unidades */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[13px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 2. ESCOPO E CENTROS DE DISTRIBUIÇÃO (CDDS)
              </h3>
              <button className="text-[11px] text-blue-600 dark:text-blue-300 font-bold hover:underline">Selecionar todas</button>
            </div>
            <div className="border border-slate-200 dark:border-line rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-surface-muted p-3 flex justify-between items-center border-b border-slate-200 dark:border-line">
                <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 dark:text-blue-300 focus:ring-blue-500" /> Todas as Unidades (6 selecionadas)
                </label>
                <span className="text-[11px] text-slate-500 dark:text-foreground-muted border border-slate-200 dark:border-line bg-white dark:bg-surface-raised px-2 py-1 rounded">Consolidado Adega Distribution PE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 bg-white dark:bg-surface-raised">
                {[
                  { n: 'Matriz — Recife (PE)', d: 'Hub Central & DRE Geral' },
                  { n: 'CDD Paulista', d: 'Operação Litoral Norte' },
                  { n: 'CDD Jaboatão', d: 'Armazenagem Pesada' },
                  { n: 'CDD Olinda', d: 'Rotas Expressas Bar/Rest' },
                  { n: 'CDD Cabo', d: 'Corredor Suape / Litoral Sul' },
                  { n: 'CDD Caruaru', d: 'Distribuição Agreste' }
                ].map(unit => (
                  <label key={unit.n} className="flex items-start gap-2 p-3 border-b border-r border-slate-100 dark:border-line hover:bg-slate-50 dark:hover:bg-surface-muted cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 rounded text-blue-600 dark:text-blue-300 focus:ring-blue-500" />
                    <div>
                      <div className="text-[12px] font-bold text-slate-800 dark:text-foreground">{unit.n}</div>
                      <div className="text-[10px] text-slate-500 dark:text-foreground-muted">{unit.d}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 3: Parâmetros */}
          <section>
            <h3 className="text-[13px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 3. TIPO DE VISÃO & PARÂMETROS FINANCEIROS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-foreground-muted mb-2">Critério Contábil</span>
                <div className="flex bg-slate-100 dark:bg-surface-muted p-1 rounded-lg">
                  <button onClick={() => setRegime('competencia')} className={`flex-1 flex justify-center items-center gap-2 py-2 text-[12px] font-bold rounded-md transition-all ${regime === 'competencia' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-foreground-muted hover:bg-slate-200 dark:hover:bg-surface-muted'}`}>
                    <Scale size={14} /> Regime de Competência
                  </button>
                  <button onClick={() => setRegime('caixa')} className={`flex-1 flex justify-center items-center gap-2 py-2 text-[12px] font-bold rounded-md transition-all ${regime === 'caixa' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-foreground-muted hover:bg-slate-200 dark:hover:bg-surface-muted'}`}>
                    <CheckSquare size={14} /> Regime de Caixa
                  </button>
                </div>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-foreground-muted mb-2">Período de Apuração</span>
                <div className="flex gap-2">
                  {['Mês Atual', 'Q3 2026', 'Ano 2026', 'Personal.'].map(btn => {
                    const val = btn.toLowerCase().replace(' ', '_');
                    return (
                      <button key={btn} onClick={() => setPeriod(val)} className={`flex-1 py-2 text-[12px] font-bold rounded-lg border transition-colors ${period === val ? 'border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-line text-slate-600 dark:text-foreground-muted hover:bg-slate-50 dark:hover:bg-surface-muted'}`}>
                        {btn === 'Personal.' ? <Calendar size={14} className="mx-auto" /> : btn}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <span className="block text-[11px] font-medium text-slate-500 dark:text-foreground-muted mb-2">Composição dos Lançamentos</span>
              <div className="flex flex-wrap gap-4">
                {['Receitas Operacionais', 'Despesas & CMV', 'Contas Pagar/Receber', 'Atrasos & Inadimplência'].map(item => (
                  <label key={item} className="flex items-center gap-2 text-[12px] font-medium text-slate-700 dark:text-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 dark:text-blue-300 focus:ring-blue-500" /> {item}
                  </label>
                ))}
              </div>
            </div>
          </section>

        </div>

        <div className="bg-slate-50 dark:bg-surface-muted px-6 py-4 rounded-b-[14px] border-t border-slate-200 dark:border-line flex justify-end gap-3 mt-auto">
          <button onClick={onClose} className="px-5 py-2.5 bg-white dark:bg-surface-raised border border-slate-300 dark:border-line text-slate-700 dark:text-foreground text-[13px] font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-surface-muted transition-colors">
            Cancelar
          </button>
          <button className="px-6 py-2.5 bg-blue-700 text-white text-[13px] font-bold rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} /> Gerar e Baixar Relatório Financeiro ({format.toUpperCase()})
          </button>
        </div>

      </div>
    </div>
  );
}

export default function GestaoFinanceiraPage(): React.ReactElement {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="p-6 bg-gray-50 dark:bg-surface-muted min-h-screen text-gray-800 dark:text-foreground font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-lg">📊</span>
              Gestão Financeira
            </h1>
            <p className="text-sm text-gray-500 dark:text-foreground-muted">
              Acompanhe receitas, despesas, fluxo de caixa e desempenho financeiro de todas as unidades.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* LIGAÇÃO PARA A NOVA PÁGINA DE LANÇAMENTO */}
            <Link href="/financeiro/novo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
              + Novo lançamento
            </Link>
            <button onClick={() => setIsExportOpen(true)} className="bg-white dark:bg-surface-raised border border-gray-300 dark:border-line hover:bg-gray-50 dark:hover:bg-surface-muted text-gray-700 dark:text-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer">
              Exportar relatório
            </button>
          </div>
        </div>

        {/* ... Restante do código original da página (Filtros, KPIs, Gráficos, Tabelas) permanece igual ... */}
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 bg-white dark:bg-surface-raised p-4 rounded-xl border border-gray-200 dark:border-line shadow-sm items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-foreground-muted uppercase tracking-wider">Período</span>
            <div className="bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-foreground font-medium">📅 Este mês</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-foreground-muted uppercase tracking-wider">Unidade</span>
            <div className="bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-foreground font-medium">🏢 Todas as unidades</div>
          </div>
        </div>

        {/* Cartões KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Receita total</span>
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">↑</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">R$ 248.500,00</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">+12,5% vs. mês anterior</div>
          </div>
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Despesas totais</span>
              <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-300 font-bold text-xs">↓</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">R$ 162.300,00</div>
            <div className="text-xs text-rose-600 dark:text-rose-300 font-medium">+8,3% vs. mês anterior</div>
          </div>
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Saldo de caixa</span>
              <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300 font-bold text-xs">▣</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">R$ 86.200,00</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">+18,7% vs. mês anterior</div>
          </div>
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Contas a pagar</span>
              <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-300 font-bold text-xs">⏱</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">R$ 24.800,00</div>
            <div className="text-xs text-rose-600 dark:text-rose-300 font-medium">-5,2% vs. mês anterior</div>
          </div>
        </div>

        {/* Seção Intermediária */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-foreground text-sm">Fluxo financeiro</h3>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mb-3">Comparativo de receitas e despesas nos últimos 6 meses.</p>
              <div className="flex items-center gap-4 text-xs mb-2">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-300 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Receitas</span>
                <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-300 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Despesas</span>
              </div>
            </div>
            <div className="relative h-40 w-full pt-2">
              <svg className="w-full h-full" viewBox="0 0 300 100">
                <line x1="0" y1="20" x2="300" y2="20" stroke="var(--chart-grid)" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="var(--chart-grid)" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="var(--chart-grid)" strokeWidth="1" />
                <path d="M 10 75 Q 60 65, 120 55 T 230 40 T 290 35" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M 10 55 Q 60 45, 120 35 T 230 20 T 290 10" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                <circle cx="290" cy="10" r="3.5" fill="#2563eb" />
                <circle cx="290" cy="35" r="3.5" fill="#f59e0b" />
              </svg>
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-foreground-muted mt-1">
                <span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-1">Distribuição de despesas</h3>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mb-2">Categorias que mais consomem recursos.</p>
            </div>
            <div className="flex items-center justify-center my-1 relative">
              <svg className="w-28 h-28" viewBox="0 0 36 36">
                <path className="text-blue-600 dark:text-blue-300" strokeDasharray="44, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4.5" stroke="currentColor" />
                <path className="text-cyan-400" strokeDasharray="19, 100" strokeDashoffset="-44" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4.5" stroke="currentColor" />
                <path className="text-indigo-600 dark:text-indigo-300" strokeDasharray="17, 100" strokeDashoffset="-63" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4.5" stroke="currentColor" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xs font-bold text-gray-900 dark:text-foreground">R$ 162.300</span>
                <span className="text-[8px] text-gray-400 dark:text-foreground-muted uppercase font-semibold">TOTAL</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span><span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1"></span>Estoque e mercadorias</span><span className="font-semibold">44%</span></div>
              <div className="flex justify-between"><span><span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-1"></span>Logística</span><span className="font-semibold">19%</span></div>
              <div className="flex justify-between"><span><span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-1"></span>Folha de pagamento</span><span className="font-semibold">17%</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-1">Desempenho por unidade</h3>
            <p className="text-xs text-gray-500 dark:text-foreground-muted mb-3">Receita x Despesa x Margem</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 dark:text-foreground-muted border-b border-gray-100 dark:border-line">
                    <th className="pb-2 font-medium">Unidade</th><th className="pb-2 font-medium">Receita</th><th className="pb-2 font-medium text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-line">
                  {unitPerformanceData.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 font-medium">{item.unit}</td><td>{item.revenue}</td><td className="text-right font-bold text-emerald-600 dark:text-emerald-300">{item.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Seção Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm lg:col-span-2">
            <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-4">Contas financeiras</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 dark:text-foreground-muted border-b border-gray-100 dark:border-line">
                    <th className="pb-2 font-medium">DESCRIÇÃO</th><th className="pb-2 font-medium">UNIDADE</th><th className="pb-2 font-medium">VALOR</th><th className="pb-2 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-line">
                  {accountsData.map((acc) => (
                    <tr key={acc.id}>
                      <td className="py-2.5">
                        <div className="font-medium text-gray-900 dark:text-foreground">{acc.description}</div>
                        <div className="text-[10px] text-gray-400 dark:text-foreground-muted">{acc.subDescription}</div>
                      </td>
                      <td className="py-2.5 text-gray-600 dark:text-foreground-muted">{acc.unit}</td>
                      <td className="py-2.5 font-semibold text-gray-900 dark:text-foreground">{acc.amount}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${acc.status === 'Atrasada' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300' : acc.status === 'A vencer' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300'}`}>{acc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-foreground text-sm">Resumo financeiro</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-line"><span className="text-gray-500 dark:text-foreground-muted">Contas a pagar (vencidas)</span><span className="font-bold text-gray-900 dark:text-foreground">R$ 8.400,00</span></div>
              <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-line"><span className="text-gray-500 dark:text-foreground-muted">Contas a pagar (até 7 dias)</span><span className="font-bold text-gray-900 dark:text-foreground">R$ 16.400,00</span></div>
              <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-line"><span className="text-gray-500 dark:text-foreground-muted">Contas a receber (vencidas)</span><span className="font-bold text-gray-900 dark:text-foreground">R$ 5.200,00</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-foreground-muted">Contas a receber (até 7 dias)</span><span className="font-bold text-gray-900 dark:text-foreground">R$ 12.800,00</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <ExportFinanceModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}