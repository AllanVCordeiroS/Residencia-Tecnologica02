"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, ArrowLeft, Save } from "lucide-react";
import {
  obterConfiguracaoFinanceiraAction,
  salvarConfiguracaoFinanceiraAction,
} from "@/app/actions/financeiro";

export default function FinanceiroConfigPage(): React.ReactElement {
  const router = useRouter();

  const [moedaPadrao, setMoedaPadrao] = useState("BRL");
  const [diasAvisoVencimento, setDiasAvisoVencimento] = useState(7);
  const [bloquearAposVencimento, setBloquearAposVencimento] = useState(false);
  const [multaPercentual, setMultaPercentual] = useState(2);
  const [jurosMensalPercentual, setJurosMensalPercentual] = useState(1);
  const [observacoesPadrao, setObservacoesPadrao] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    let ativo = true;
    obterConfiguracaoFinanceiraAction().then((res) => {
      if (!ativo || !res.ok || !res.data) return;
      setMoedaPadrao(res.data.moedaPadrao);
      setDiasAvisoVencimento(res.data.diasAvisoVencimento);
      setBloquearAposVencimento(res.data.bloquearAposVencimento);
      setMultaPercentual(res.data.multaPercentual);
      setJurosMensalPercentual(res.data.jurosMensalPercentual);
      setObservacoesPadrao(res.data.observacoesPadrao ?? "");
    });
    return () => {
      ativo = false;
    };
  }, []);

  const handleSalvar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);
    setSalvando(true);

    const res = await salvarConfiguracaoFinanceiraAction({
      moedaPadrao,
      diasAvisoVencimento,
      bloquearAposVencimento,
      multaPercentual,
      jurosMensalPercentual,
      observacoesPadrao,
    });

    setSalvando(false);

    if (res.ok) {
      setFeedback({ tipo: "ok", texto: "Parâmetros financeiros salvos com sucesso." });
    } else {
      setFeedback({ tipo: "erro", texto: res.error });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parâmetros Financeiros</h1>
              <p className="text-slate-500 text-[13px]">Moeda padrão, regras de vencimento e cobrança do BEVOX.</p>
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-[13px] font-medium ${
              feedback.tipo === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.texto}
          </div>
        )}

        <form onSubmit={handleSalvar} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Moeda Padrão</label>
              <select
                value={moedaPadrao}
                onChange={(e) => setMoedaPadrao(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              >
                <option value="BRL">BRL — Real Brasileiro</option>
                <option value="USD">USD — Dólar Americano</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Dias de Aviso Antes do Vencimento</label>
              <input
                type="number"
                min={0}
                max={90}
                value={diasAvisoVencimento}
                onChange={(e) => setDiasAvisoVencimento(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={bloquearAposVencimento}
                  onChange={(e) => setBloquearAposVencimento(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Sinalizar pendência crítica após vencimento
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Multa por Atraso (%)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={multaPercentual}
                onChange={(e) => setMultaPercentual(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Juros Mensal (% a.m.)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={jurosMensalPercentual}
                onChange={(e) => setJurosMensalPercentual(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Observações Padrão em Lançamentos</label>
            <textarea
              rows={3}
              value={observacoesPadrao}
              onChange={(e) => setObservacoesPadrao(e.target.value)}
              placeholder="Instruções ou notas padrão para cobranças e lançamentos..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700"
            />
          </div>

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
              disabled={salvando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-[13px] rounded-lg shadow-sm cursor-pointer"
            >
              <Save size={16} /> {salvando ? "Salvando..." : "Salvar Parâmetros"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}