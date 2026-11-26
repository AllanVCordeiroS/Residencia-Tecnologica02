'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Mail, MapPin, Phone,
  ArrowLeft, Save, UploadCloud, Box,
} from 'lucide-react';
import { obterEmpresaAction, salvarEmpresaAction } from '@/app/actions/empresa';

export default function EmpresaConfigPage() {
  const router = useRouter();

  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [razaoSocial, setRazaoSocial] = useState('Adega Distribution Ltda.');
  const [email, setEmail] = useState('contato@adegadistribution.com.br');
  const [nomeFantasia, setNomeFantasia] = useState('Adega Distribution');
  const [endereco, setEndereco] = useState('Av. Recife, 1000');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [bairro, setBairro] = useState('Boa Viagem');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('123.456.789');
  const [cidade, setCidade] = useState('Recife');
  const [estado, setEstado] = useState('PE');
  const [cep, setCep] = useState('51021-000');
  const [telefone, setTelefone] = useState('(81) 3123-4567');

  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ativo = true;
    obterEmpresaAction().then((res) => {
      if (!ativo || !res.ok || !res.data) return;
      setEmpresaId(res.data.id);
      setRazaoSocial(res.data.razaoSocial);
      setNomeFantasia(res.data.nomeFantasia);
      setCnpj(res.data.cnpj);
      setEmail(res.data.email);
      setTelefone(res.data.telefone);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
  setFeedback({
    tipo: 'erro',
    texto: 'O arquivo selecionado é maior que 2MB. Por favor, escolha uma imagem menor.',
  });
  return;
}

      const imageUrl = URL.createObjectURL(file);
      setLogoPreview(imageUrl);
    }
  };

  const handleSalvar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    if (!empresaId) {
      setFeedback({
        tipo: 'erro',
        texto: 'Nenhuma empresa encontrada no banco. Execute o cadastro inicial (onboarding) primeiro.',
      });
      return;
    }

    setSalvando(true);
    const res = await salvarEmpresaAction({
      id: empresaId,
      razaoSocial,
      nomeFantasia,
      cnpj,
      email,
      telefone,
    });
    setSalvando(false);

    if (res.ok) {
      setFeedback({ tipo: 'ok', texto: 'Dados da empresa salvos com sucesso.' });
    } else {
      setFeedback({ tipo: 'erro', texto: res.error });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Empresa</h1>
              <p className="text-slate-500 text-[13px]">Gerencie sua Empresa.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sistema ativo
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-[13px] font-medium ${
              feedback.tipo === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.texto}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Formulário Principal (Esquerda) */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <Building2 size={20} className="text-blue-600" />
              <div>
                <h2 className="font-bold text-slate-800 text-[15px]">Dados da Empresa</h2>
                <p className="text-slate-500 text-[12px]">Informações cadastrais da {nomeFantasia || 'Adega Distribution'}.</p>
              </div>
            </div>

            <form onSubmit={handleSalvar} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Razão Social <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">E-mail Corporativo <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Nome Fantasia <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">Endereço <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">CNPJ <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Bairro</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Inscrição Estadual</label>
                  <input
                    type="text"
                    value={inscricaoEstadual}
                    onChange={(e) => setInscricaoEstadual(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">Cidade <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="w-full pl-7 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Estado <span className="text-rose-500">*</span></label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="PE">PE</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">CEP <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">Telefone <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Cartão do Logotipo (Direita) */}
          <aside className="w-full lg:w-[340px]">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-[15px]">Logotipo da Empresa</h3>
                <Box size={16} className="text-slate-400" />
              </div>

              <div className="bg-[#0b1736] rounded-xl p-8 flex flex-col items-center justify-center text-center border border-[#14224f] mb-4 overflow-hidden">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-md overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview do Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Box size={24} />
                  )}
                </div>
                <h4 className="text-white font-bold text-[18px] tracking-wide mb-1">BEVOX</h4>
                <p className="text-blue-300 text-[10px] tracking-[0.2em] mb-4">BACKOFFICE ERP</p>
                <div className="flex items-center gap-1.5 text-[#f3c544] bg-[#342813] border border-[#52411e] px-2.5 py-1 rounded text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f3c544]"></span> Adega Matriz
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/png, image/jpeg"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-blue-50 text-blue-600 font-bold text-[13px] rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 mb-2 cursor-pointer"
              >
                <UploadCloud size={16} /> Alterar Logo
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Formatos aceitos: PNG, JPG. Tamanho máximo: 2MB.
              </p>
            </div>
          </aside>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            type="button"
            disabled={salvando}
            onClick={() => handleSalvar()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-[13px] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}