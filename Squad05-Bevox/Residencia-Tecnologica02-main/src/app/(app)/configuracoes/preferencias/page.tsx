"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, ArrowLeft, Save } from "lucide-react";

export default function PreferenciasConfigPage(): React.ReactElement {
  const router = useRouter();

  const [idioma, setIdioma] = useState("pt-BR");
  const [fusoHorario, setFusoHorario] = useState("America/Recife");
  const [formatoData, setFormatoData] = useState("DD/MM/AAAA");
  const [itensPorPagina, setItensPorPagina] = useState("20");
  const [compacto, setCompacto] = useState(false);
  const [salvoMsg, setSalvoMsg] = useState<string | null>(null);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvoMsg("Preferências aplicadas com sucesso.");
    setTimeout(() => setSalvoMsg(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Preferências</h1>
            <p className="text-slate-500 text-[13px]">Idioma, fuso horário, formato de data e exibição de tabelas.</p>
          </div>
        </div>

        {salvoMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
            {salvoMsg}
          </div>
        )}

        <form onSubmit={handleSalvar} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Idioma do Sistema</label>
              <select
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Fuso Horário</label>
              <select
                value={fusoHorario}
                onChange={(e) => setFusoHorario(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              >
                <option value="America/Recife">GMT-3 — América / Recife</option>
                <option value="America/Sao_Paulo">GMT-3 — América / São Paulo</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Formato de Data</label>
              <select
                value={formatoData}
                onChange={(e) => setFormatoData(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              >
                <option value="DD/MM/AAAA">DD/MM/AAAA</option>
                <option value="AAAA-MM-DD">AAAA-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Registros por Página</label>
              <select
                value={itensPorPagina}
                onChange={(e) => setItensPorPagina(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              >
                <option value="10">10 registros</option>
                <option value="20">20 registros</option>
                <option value="50">50 registros</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={compacto}
              onChange={(e) => setCompacto(e.target.checked)}
              className="rounded border-slate-300"
            />
            Usar espaçamento compacto nas listagens
          </label>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft size={16} /> Voltar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-lg shadow-sm cursor-pointer"
            >
              <Save size={16} /> Salvar Preferências
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}