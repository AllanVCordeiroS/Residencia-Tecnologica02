//O CAMINHO PRA COLOCAR O LINK DAS OUTRAS PAGINAS JÁ TÁ AQUI NO CODIGO!!! TD EXPLICADO SÓ IR NO LINK Q JÁ TÁ COM UM EXEMPRO SÓ PRA N TÁ VAZIO!!!

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Settings, Info, Building2, ShieldCheck, Bell, 
  SlidersHorizontal, Landmark, Plug, BarChart2, 
  CheckCircle2, ExternalLink
} from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações</h1>
              <p className="text-slate-500 text-[13px]">Gerencie as preferências e os parâmetros do BEVOX.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sistema ativo
          </div>
        </div>

        {/* Banner Informativo */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 text-blue-800 text-[13px]">
          <Info size={18} className="text-blue-600" />
          <span>Mantenha suas configurações sempre atualizadas para uma melhor experiência no sistema.</span>
        </div>

        {/* Grelha de Configurações - TODOS AGORA SÃO LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Link href="/configuracoes/empresa" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px] mb-1">Empresa</h3>
                <p className="text-slate-500 text-[12px]">Dados cadastrais, identidade visual e...</p>
              </div>
            </div>
            <span className="text-blue-600 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
              Acessar <span className="text-[16px] leading-none">&rsaquo;</span>
            </span>
          </Link>

          <Link href="/configuracoes/seguranca" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px] mb-1">Segurança</h3>
                <p className="text-slate-500 text-[12px]">Políticas de acesso, autenticação e controle de...</p>
              </div>
            </div>
            <span className="text-blue-600 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
              Acessar <span className="text-[16px] leading-none">&rsaquo;</span>
            </span>
          </Link>

          <Link href="/configuracoes/notificacoes" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px] mb-1">Notificações</h3>
                <p className="text-slate-500 text-[12px]">Configure os alertas e defina quem receberá as...</p>
              </div>
            </div>
            <span className="text-blue-600 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
              Acessar <span className="text-[16px] leading-none">&rsaquo;</span>
            </span>
          </Link>

          <Link href="/configuracoes/preferencias" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px] mb-1">Preferências</h3>
                <p className="text-slate-500 text-[12px]">Idioma, formato de data, fuso horário e opções...</p>
              </div>
            </div>
            <span className="text-blue-600 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
              Acessar <span className="text-[16px] leading-none">&rsaquo;</span>
            </span>
          </Link>

          <Link href="/configuracoes/financeiro" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 shrink-0">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px] mb-1">Parâmetros Financeiros</h3>
                <p className="text-slate-500 text-[12px]">Moeda padrão, categorias e regras gerais...</p>
              </div>
            </div>
            <span className="text-blue-600 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
              Acessar <span className="text-[16px] leading-none">&rsaquo;</span>
            </span>
          </Link>

          <Link href="/configuracoes/integracoes" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                <Plug size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px] mb-1">Integrações</h3>
                <p className="text-slate-500 text-[12px]">Conecte serviços externos e gerencie...</p>
              </div>
            </div>
            <span className="text-blue-600 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
              Acessar <span className="text-[16px] leading-none">&rsaquo;</span>
            </span>
          </Link>

        </div>

        {/* Rodapé - Informações do Sistema */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-[14px]">Informações do Sistema</h3>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-12">
              <div>
                <p className="text-slate-500 text-[11px] mb-1">Versão do Sistema</p>
                <p className="font-bold text-slate-800 text-[13px]">v1.0.0</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px] mb-1">Última Atualização</p>
                <p className="font-bold text-slate-800 text-[13px]">24/10/2026 às 15:30</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px] mb-1">Ambiente</p>
                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[11px] font-bold mt-0.5">Produção</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={1.5} />
                <div>
                  <p className="font-bold text-slate-800 text-[13px] leading-tight">Tudo funcionando<br/>corretamente!</p>
                  <p className="text-slate-500 text-[11px]">O BEVOX está operando<br/>normalmente.</p>
                </div>
              </div>
              <button className="text-blue-600 text-[12px] font-bold flex items-center gap-1 hover:underline">
                Ver detalhes <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}