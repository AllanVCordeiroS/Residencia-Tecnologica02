"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plug, ArrowLeft, CheckCircle2 } from "lucide-react";

interface IntegracaoItem {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  conectado: boolean;
}

const INICIAIS: IntegracaoItem[] = [
  {
    id: "nfe",
    nome: "Emissor NF-e / Documentos Fiscais",
    categoria: "Fiscal",
    descricao: "Sincronização de notas e comprovantes vinculados às unidades.",
    conectado: true,
  },
  {
    id: "storage",
    nome: "Repositório de Arquivos (Bucket)",
    categoria: "Documentos",
    descricao: "Armazenamento de PDFs, licenças e anexos de ocorrências.",
    conectado: true,
  },
  {
    id: "webhook",
    nome: "Webhooks de Alertas e Vencimentos",
    categoria: "Automação",
    descricao: "Disparo de eventos quando licenças ou tarefas se aproximam do prazo.",
    conectado: false,
  },
];

export default function IntegracoesConfigPage(): React.ReactElement {
  const router = useRouter();
  const [itens, setItens] = useState<IntegracaoItem[]>(INICIAIS);
  const [aviso, setAviso] = useState<string | null>(null);

  const toggleConexao = (id: string) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const proximo = !item.conectado;
        setAviso(`${item.nome}: ${proximo ? "conectado" : "desconectado"}.`);
        return { ...item, conectado: proximo };
      })
    );
    setTimeout(() => setAviso(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Plug size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrações</h1>
            <p className="text-slate-500 text-[13px]">Conecte serviços externos e gerencie canais de dados do BEVOX.</p>
          </div>
        </div>

        {aviso && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={16} /> {aviso}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itens.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {item.categoria}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.conectado
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.conectado ? "Conectado" : "Desconectado"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-[15px]">{item.nome}</h3>
                <p className="text-slate-500 text-[12px] mt-1">{item.descricao}</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleConexao(item.id)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    item.conectado
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {item.conectado ? "Desconectar" : "Conectar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </div>
    </div>
  );
}