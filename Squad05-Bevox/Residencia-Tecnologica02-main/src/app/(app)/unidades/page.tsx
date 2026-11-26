"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Building2, Plus, Search, Download, MapPin, Phone } from "lucide-react";
import { listarUnidadesAction, criarUnidadeAction } from "@/app/actions/unidades";
import ExportModal from "@/components/unidades/ExportModal";

interface UnidadeRegistro {
  id: string;
  empresaId: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string | null;
  status: string;
}

export default function UnidadesPage(): React.ReactElement {
  const [unidades, setUnidades] = useState<UnidadeRegistro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"TODAS" | "ATIVA" | "INATIVA">("TODAS");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [exportModalAberto, setExportModalAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("PE");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    const res = await listarUnidadesAction();
    if (res.ok && Array.isArray(res.data)) {
      setUnidades(res.data as UnidadeRegistro[]);
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return unidades.filter((u) => {
      if (filtroStatus !== "TODAS" && u.status !== filtroStatus) return false;
      if (!termo) return true;
      return (
        u.nome.toLowerCase().includes(termo) ||
        u.cidade.toLowerCase().includes(termo) ||
        u.cnpj.toLowerCase().includes(termo)
      );
    });
  }, [unidades, busca, filtroStatus]);

  const totalAtivas = unidades.filter((u) => u.status === "ATIVA").length;
  const totalInativas = unidades.filter((u) => u.status !== "ATIVA").length;

  const handleCriarUnidade = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm(null);

    const empresaBaseId = unidades[0]?.empresaId;
    if (!empresaBaseId) {
      setErroForm("Cadastre ou carregue uma empresa antes de criar uma nova unidade.");
      return;
    }

    setSalvando(true);
    const res = await criarUnidadeAction({
      empresaId: empresaBaseId,
      nome,
      cnpj,
      endereco,
      cidade,
      estado,
      telefone: telefone || undefined,
      status: "ATIVA",
    });
    setSalvando(false);

    if (!res.ok) {
      setErroForm(res.error ?? "Erro ao cadastrar unidade.");
      return;
    }

    setNome("");
    setCnpj("");
    setEndereco("");
    setCidade("");
    setTelefone("");
    setModalNovoAberto(false);
    await carregar();
  };

  const unidadesExportaveis = filtradas.map((u) => ({
    nome: u.nome,
    cnpj: u.cnpj,
    cidade: `${u.cidade}/${u.estado}`,
    tipo: u.nome.toLowerCase().includes("matriz") ? "Matriz" : "Filial / CDD",
    responsavel: "—",
    funcionarios: 0,
    documentos: 0,
    tarefas: 0,
    licencas: 0,
    situacao: u.status,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unidades Operacionais</h1>
              <p className="text-slate-500 text-[13px]">Gerencie CDDs, filiais e matrizes cadastradas no BEVOX.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExportModalAberto(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[13px] rounded-lg shadow-sm cursor-pointer"
            >
              <Download size={16} /> Exportar
            </button>
            <button
              type="button"
              onClick={() => setModalNovoAberto(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-lg shadow-sm cursor-pointer"
            >
              <Plus size={16} /> Nova Unidade
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-[12px] font-bold text-slate-500">Total de Unidades</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{unidades.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-[12px] font-bold text-slate-500">Unidades Ativas</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{totalAtivas}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-[12px] font-bold text-slate-500">Inativas / Outros</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{totalInativas}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1">
            <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, cidade ou CNPJ..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as "TODAS" | "ATIVA" | "INATIVA")}
            className="px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white"
          >
            <option value="TODAS">Todas as situações</option>
            <option value="ATIVA">Ativas</option>
            <option value="INATIVA">Inativas</option>
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {carregando ? (
            <div className="p-8 text-center text-[13px] text-slate-500">Carregando unidades...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-slate-500">Nenhuma unidade encontrada.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtradas.map((u) => (
                <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-[15px]">{u.nome}</span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.status === "ATIVA"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1 flex flex-wrap items-center gap-4">
                      <span>CNPJ: {u.cnpj}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} /> {u.endereco} — {u.cidade}/{u.estado}
                      </span>
                      {u.telefone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={13} /> {u.telefone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {modalNovoAberto && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <form
              onSubmit={handleCriarUnidade}
              className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4"
            >
              <h2 className="text-lg font-bold text-slate-900">Cadastrar Nova Unidade</h2>

              {erroForm && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12px]">
                  {erroForm}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Nome da Unidade</label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">CNPJ</label>
                  <input
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">Telefone</label>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Endereço</label>
                <input
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">Cidade</label>
                  <input
                    required
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">UF</label>
                  <input
                    required
                    maxLength={2}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-bold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-bold cursor-pointer"
                >
                  {salvando ? "Salvando..." : "Salvar Unidade"}
                </button>
              </div>
            </form>
          </div>
        )}

        <ExportModal
          aberto={exportModalAberto}
          onFechar={() => setExportModalAberto(false)}
          unidades={unidadesExportaveis}
        />
      </div>
    </div>
  );
}