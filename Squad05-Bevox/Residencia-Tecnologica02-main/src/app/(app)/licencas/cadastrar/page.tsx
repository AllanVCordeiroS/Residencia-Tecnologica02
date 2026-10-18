//!!PRECISA DA API TODOS, OS BGLS SÃO FICTÍCIOS!!
'use client';


import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronLeft, FileText, Leaf, ShieldCheck, Flame, Truck, 
  Building2, Landmark, Hash, User, UploadCloud, CalendarClock, 
  BellRing, Lock, Trash2, CheckCircle2
} from 'lucide-react';

// 1. Contrato de Dados (Zod) Completo
const licencaSchema = z.object({
  tipoLicenca: z.string().min(1, 'Selecione o tipo de licença'),
  categoriaGovernanca: z.string().min(1, 'Selecione a categoria'),
  unidade: z.string().min(1, 'Selecione a unidade'),
  orgaoEmissor: z.string().min(1, 'Órgão emissor é obrigatório'),
  numeroDocumento: z.string().min(1, 'Número do documento é obrigatório'),
  responsavel: z.string().min(1, 'Responsável técnico é obrigatório'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataVencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  arquivo: z.any().optional(),
  alerta60: z.boolean(),
  alerta30: z.boolean(),
  alerta15: z.boolean(),
  bloqueioCautelar: z.boolean(),
}).refine((dados) => {
  if (dados.dataEmissao && dados.dataVencimento) {
    return new Date(dados.dataVencimento) >= new Date(dados.dataEmissao);
  }
  return true;
}, {
  message: "O vencimento não pode ser anterior à emissão",
  path: ["dataVencimento"],
});

type LicencaFormData = z.infer<typeof licencaSchema>;

export default function CadastrarLicencaPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);

  // 2. Motor do Formulário
  const methods = useForm<LicencaFormData>({
    resolver: zodResolver(licencaSchema),
    defaultValues: {
      tipoLicenca: 'Alvará de Funcionamento',
      categoriaGovernanca: 'Alvarás Municipais & Posturas',
      unidade: '',
      orgaoEmissor: '',
      numeroDocumento: '',
      responsavel: '',
      dataEmissao: '',
      dataVencimento: '',
      alerta60: true,
      alerta30: true,
      alerta15: true,
      bloqueioCautelar: false,
    }
  });

  const onSubmit = async (dados: LicencaFormData) => {
    // 1. Simula o tempo de resposta da API (ex: 2 segundos a fazer upload do PDF)(!!SÓ SIMULA/ PRECISA FAZER O CORRE DA API!!)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // 2. Executa a ação de sucesso
    console.log(' Payload validado e pronto para a API:', dados);
    alert('Licença cadastrada com sucesso! Verifica a consola para ver o payload.');
    
    // router.push('/licencas'); // Redireciona para a listagem
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      methods.setValue('arquivo', e.dataTransfer.files[0], { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      methods.setValue('arquivo', e.target.files[0], { shouldValidate: true, shouldDirty: true });
    }
  };

  const removerArquivo = () => {
    methods.setValue('arquivo', undefined);
  };

  const arquivoAtual = methods.watch('arquivo');

  return (
    <div className="min-h-screen bg-slate-50 p-8 w-full">
      {/* HEADER */}
      <header className="mb-8">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="flex items-center text-sm text-slate-500 hover:text-blue-600 mb-3 font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para Listagem
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastrar Licença ou Alvará</h1>
        <p className="text-slate-500 text-sm mt-1">
          Registre uma nova licença com validação regulatória imediata, vínculo de documentos e régua preventiva.
        </p>
      </header>

      {/* STEPPER */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
        <div className="flex items-center gap-3 bg-white border border-blue-600 rounded-xl px-4 py-3 min-w-max shadow-sm">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</span>
          <div>
            <p className="text-[13px] font-bold text-blue-700 leading-tight">1. Informações Básicas</p>
            <p className="text-[11px] text-blue-500">Tipo e Enquadramento</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-blue-600 rounded-xl px-4 py-3 min-w-max shadow-sm">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</span>
          <div>
            <p className="text-[13px] font-bold text-blue-700 leading-tight">2. Unidade & Órgão</p>
            <p className="text-[11px] text-blue-500">Dados cadastrais e fiscais</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-blue-600 rounded-xl px-4 py-3 min-w-max shadow-sm">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</span>
          <div>
            <p className="text-[13px] font-bold text-blue-700 leading-tight">3. Vínculo Digital</p>
            <p className="text-[11px] text-blue-500">Upload de PDF</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-blue-600 rounded-xl px-4 py-3 min-w-max shadow-sm">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">4</span>
          <div>
            <p className="text-[13px] font-bold text-blue-700 leading-tight">4. Prazos & Régua</p>
            <p className="text-[11px] text-blue-500">Vigência e Alertas</p>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6">
          
          <div className="flex-1 space-y-6">
            
           {/* SECÇÃO 1 */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <h2 className="text-[15px] font-bold text-slate-800">Tipo de Licença e Enquadramento Operacional</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Cartão 1: Alvará */}
                <label className="relative cursor-pointer">
                  <input type="radio" value="Alvará de Funcionamento" {...methods.register('tipoLicenca')} className="peer sr-only" />
                  <div className="h-full p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 peer-checked:border-blue-600 peer-checked:bg-blue-50/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-[13px]">
                        <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><FileText size={16} /></span>
                        Alvará de Funcionamento
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Cartão 2: Licença Ambiental */}
                <label className="relative cursor-pointer">
                  <input type="radio" value="Licença Ambiental" {...methods.register('tipoLicenca')} className="peer sr-only" />
                  <div className="h-full p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-50/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-[13px]">
                        <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Leaf size={16} /></span>
                        Licença Ambiental
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                  Categoria de Governança Atribuída
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[13px] text-slate-500 cursor-not-allowed">
                  {methods.watch('tipoLicenca') === 'Alvará de Funcionamento' 
                    ? 'Alvarás Municipais & Posturas' 
                    : 'Controle Ambiental'}
                </div>
                {/* O valor continua a ser registado e enviado para a API(PRECISA FAZER O CORRE DA API AINDA) */}
                <input 
                  type="hidden" 
                  value={methods.watch('tipoLicenca') === 'Alvará de Funcionamento' ? 'Alvarás Municipais & Posturas' : 'Controle Ambiental'} 
                  {...methods.register('categoriaGovernanca')} 
                />
              </div>
            </section>

            {/* SECÇÃO 2 */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <h2 className="text-[15px] font-bold text-slate-800">Unidade Corporativa & Órgão Emissor</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Unidade Vinculada *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Building2 size={15} /></div>
                    <select {...methods.register('unidade')} className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-1 ${methods.formState.errors.unidade ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'}`}>
                      <option value="">Selecione a filial ou matriz...</option>
                      <option value="Filial CDD Paulista (PE)">Filial CDD Paulista (PE)</option>
                      <option value="Filial Salvador (BA)">Filial Salvador (BA)</option>
                      <option value="Matriz Recife (PE)">Matriz Recife (PE)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Órgão Emissor *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Landmark size={15} /></div>
                    <input type="text" {...methods.register('orgaoEmissor')} placeholder="Ex: Prefeitura Municipal" className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-1 ${methods.formState.errors.orgaoEmissor ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Número do Documento *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash size={15} /></div>
                    <input type="text" {...methods.register('numeroDocumento')} placeholder="Ex: 2025-43112" className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-1 ${methods.formState.errors.numeroDocumento ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Responsável Técnico *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><User size={15} /></div>
                    <input type="text" {...methods.register('responsavel')} placeholder="Nome do colaborador" className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-1 ${methods.formState.errors.responsavel ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'}`} />
                  </div>
                </div>
              </div>
            </section>

            {/* SECÇÃO 3 */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <h2 className="text-[15px] font-bold text-slate-800">Vínculo de Documento Digital</h2>
              </div>
              
              {arquivoAtual ? (
                <div className="w-full p-4 border border-emerald-200 bg-emerald-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-emerald-800 truncate">{arquivoAtual.name}</p>
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {(arquivoAtual.size / 1024 / 1024).toFixed(2)} MB anexado
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={removerArquivo} className="p-2 text-emerald-600 hover:bg-emerald-100 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  className={`relative w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-blue-600 mb-3"><UploadCloud size={24} /></div>
                  <p className="text-[14px] font-bold text-slate-700 mb-1">Clique para fazer upload ou arraste o arquivo</p>
                  <p className="text-[12px] text-slate-500">PDF, JPG ou PNG (Máx. 10MB)</p>
                </div>
              )}
            </section>

            {/* SECÇÃO 4 */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <h2 className="text-[15px] font-bold text-slate-800">Prazos de Vigência e Régua de Alertas</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Data de Emissão *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><CalendarClock size={15} /></div>
                    <input type="date" {...methods.register('dataEmissao')} className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-1 ${methods.formState.errors.dataEmissao ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Data de Vencimento *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><CalendarClock size={15} /></div>
                    <input type="date" {...methods.register('dataVencimento')} className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-1 ${methods.formState.errors.dataVencimento ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'}`} />
                  </div>
                  {methods.formState.errors.dataVencimento && (
                    <p className="text-red-500 text-xs mt-1">{methods.formState.errors.dataVencimento.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-[13px]">
                  <BellRing size={16} className="text-amber-500" /> Notificações de Vencimento
                </div>
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...methods.register('alerta60')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <span className="text-[13px] text-slate-700">Avisar 60 dias antes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...methods.register('alerta30')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <span className="text-[13px] text-slate-700">Avisar 30 dias antes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...methods.register('alerta15')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <span className="text-[13px] text-slate-700">Avisar 15 dias antes</span>
                  </label>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="pt-0.5">
                      <input type="checkbox" {...methods.register('bloqueioCautelar')} className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                        <Lock size={14} /> Ativar Bloqueio Cautelar Automático
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Impede operações da unidade no ERP caso a licença vença sem renovação registada.</p>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            <div className="flex justify-between pt-4 pb-12">
              <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 text-slate-700 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={methods.formState.isSubmitting}
                className="px-8 py-2.5 bg-blue-700 text-white text-[14px] font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {methods.formState.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Salvar Licença Definitiva
                  </>
                )}
              </button>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <aside className="w-full lg:w-[300px]">
            <div className="sticky top-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-[14px] mb-4 pb-3 border-b border-slate-100">
                <FileText size={16} className="text-blue-600" /> Resumo da licença
              </div>
              <div className="space-y-4 text-[12px]">
                <div>
                  <p className="text-slate-400 mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Tipo e Categoria</p>
                  <p className="font-bold text-slate-800">{methods.watch('tipoLicenca') || '-'}</p>
                  <p className="text-slate-500">{methods.watch('categoriaGovernanca') || '-'}</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-slate-400 mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Unidade Operacional</p>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <Building2 size={13} className="text-slate-400"/> 
                    {methods.watch('unidade') || 'Não selecionada'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-slate-400 mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Órgão e Documento</p>
                  <p className="font-bold text-slate-800">{methods.watch('orgaoEmissor') || 'Órgão não informado'}</p>
                  <p className="text-slate-500 mt-0.5">Nº: {methods.watch('numeroDocumento') || '---'}</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-slate-400 mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Vigência</p>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="text-[10px] text-slate-400">Emissão</p>
                      <p className="font-bold text-slate-800">{methods.watch('dataEmissao') ? new Date(methods.watch('dataEmissao')).toLocaleDateString('pt-BR') : '--/--/----'}</p>
                    </div>
                    <div className="w-8 h-px bg-slate-200"></div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Vencimento</p>
                      <p className="font-bold text-slate-800">{methods.watch('dataVencimento') ? new Date(methods.watch('dataVencimento')).toLocaleDateString('pt-BR') : '--/--/----'}</p>
                    </div>
                  </div>
                </div>
                {methods.watch('bloqueioCautelar') && (
                  <div className="pt-3 mt-2">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-start gap-2">
                      <Lock size={14} className="text-red-500 mt-0.5" />
                      <p className="text-[11px] font-bold text-red-700 leading-tight">Bloqueio Cautelar Ativo no Vencimento</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </form>
      </FormProvider>
    </div>
  );
}