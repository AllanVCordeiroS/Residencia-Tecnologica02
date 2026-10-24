'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { 
  X, Save, ArrowUp, ArrowDown, Wallet, Tag, Building2, User, 
  Calendar, FileText, DollarSign, UploadCloud, Info, CheckCircle2, Clock3
} from 'lucide-react';
type LancamentoFormData = {
  tipo: 'Receita' | 'Despesa';
  categoria: string; subcategoria: string; descricao: string;
  valor: string; unidade: string; contraparte: string;
  dataVencimento: string; dataLancamento: string; status: string;
  formaPagamento: string; observacao: string; arquivo?: File;
};

export default function NovoLancamentoPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);

  const methods = useForm<LancamentoFormData>({
    defaultValues: {
      tipo: 'Receita', categoria: '', subcategoria: '', descricao: '', valor: '',
      unidade: '', contraparte: '', dataVencimento: '2026-10-27', 
      dataLancamento: '2026-10-27', status: 'Pendente', formaPagamento: '', observacao: ''
    }
  });

  const onSubmit = async (dados: LancamentoFormData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Dados do Lançamento:', dados);
    alert('Lançamento registado com sucesso!');
    router.back();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      methods.setValue('arquivo', e.dataTransfer.files[0], { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 w-full font-sans">
      <header className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Novo Lançamento</h1>
            <p className="text-slate-500 text-[13px]">Registre receitas, despesas ou outras movimentações financeiras.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <X size={16} /> Cancelar
          </button>
          <button onClick={methods.handleSubmit(onSubmit)} disabled={methods.formState.isSubmitting} className="px-5 py-2 bg-blue-600 text-white text-[13px] font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
            {methods.formState.isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={16} />}
            Salvar Lançamento
          </button>
        </div>
      </header>

      <FormProvider {...methods}>
        <form className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="border-b border-blue-600 inline-block pb-2 mb-6">
                <h2 className="text-[14px] font-bold text-blue-700 flex items-center gap-2"><FileText size={16} /> Dados do Lançamento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2">Tipo de Lançamento *</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" value="Receita" {...methods.register('tipo')} className="peer sr-only" />
                      <div className="flex justify-center items-center gap-2 py-2 text-[13px] font-bold rounded-md peer-checked:bg-blue-600 peer-checked:text-white text-slate-600 transition-colors">
                        <ArrowUp size={16} /> Receita
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" value="Despesa" {...methods.register('tipo')} className="peer sr-only" />
                      <div className="flex justify-center items-center gap-2 py-2 text-[13px] font-bold rounded-md peer-checked:bg-rose-600 peer-checked:text-white text-slate-600 transition-colors">
                        <ArrowDown size={16} /> Despesa
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2 flex items-center gap-1"><Tag size={14} className="text-slate-400"/> Categoria *</label>
                  <select {...methods.register('categoria')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500">
                    <option value="">Selecione a categoria</option>
                    <option value="Vendas">Vendas / Faturamento</option>
                    <option value="Operacional">Custos Operacionais</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="col-span-1">
                  <label className="block text-[12px] font-bold text-slate-700 mb-2">Subcategoria</label>
                  <select {...methods.register('subcategoria')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500">
                    <option value="">Selecione a subcategoria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-[12px] font-bold text-slate-700 mb-2">Descrição *</label>
                  <input type="text" {...methods.register('descricao')} placeholder="Ex.: Venda de bebidas - Cliente XYZ" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                  <div className="text-right text-[10px] text-slate-400 mt-1">0/200</div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2 text-rose-600">Valor *</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="text" {...methods.register('valor')} placeholder="Digite o valor" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2 flex items-center gap-1"><Building2 size={14} className="text-slate-400"/> Unidade *</label>
                  <select {...methods.register('unidade')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500">
                    <option value="">Selecione a unidade</option>
                    <option value="Matriz - Recife">Matriz - Recife</option>
                    <option value="Paulista">Paulista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2 flex items-center gap-1"><User size={14} className="text-slate-400"/> Contraparte *</label>
                  <input type="text" {...methods.register('contraparte')} placeholder="Ex.: Fornecedor, Cliente, etc." className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-t border-slate-100 pt-6">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2 flex items-center gap-1"><Calendar size={14} className="text-slate-400"/> Data de vencimento *</label>
                  <input type="date" {...methods.register('dataVencimento')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2 flex items-center gap-1"><Calendar size={14} className="text-slate-400"/> Data de lançamento *</label>
                  <input type="date" {...methods.register('dataLancamento')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2 flex items-center gap-1"><CheckCircle2 size={14} className="text-slate-400"/> Status *</label>
                  <select {...methods.register('status')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500">
                    <option value="Pendente">Pendente</option>
                    <option value="Realizado">Realizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2">Forma de pagamento/recebimento *</label>
                  <select {...methods.register('formaPagamento')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500">
                    <option value="">Selecione a forma</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2">Observação</label>
                  <textarea {...methods.register('observacao')} placeholder="Informações adicionais sobre o lançamento..." rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 resize-none"></textarea>
                  <div className="text-right text-[10px] text-slate-400 mt-1">0/500</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={16} className="text-slate-400"/> Documentos (opcional)</h3>
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}>
                <input type="file" className="hidden" id="file-upload" />
                <UploadCloud size={32} className="text-blue-500 mb-3" />
                <p className="text-[13px] font-bold text-slate-700">Arraste e solte seus arquivos aqui <span className="font-normal text-slate-500">ou clique para selecionar</span></p>
                <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG • Máx. 10MB</p>
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-[320px] space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-6">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2"><Calendar size={16} className="text-slate-400"/> Resumo do Lançamento</h3>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between"><span className="text-slate-500">Tipo</span><span className={`font-bold px-2 py-0.5 rounded ${methods.watch('tipo') === 'Receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{methods.watch('tipo')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Categoria</span><span className="font-medium text-slate-800">{methods.watch('categoria') || 'Não selecionada'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Descrição</span><span className="font-medium text-slate-800 truncate max-w-[150px]">{methods.watch('descricao') || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Valor</span><span className="font-bold text-[14px] text-slate-900">R$ {methods.watch('valor') || '0,00'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Unidade</span><span className="font-medium text-slate-800">{methods.watch('unidade') || 'Não selecionada'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Contraparte</span><span className="font-medium text-slate-800 truncate max-w-[150px]">{methods.watch('contraparte') || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Vencimento</span><span className="font-medium text-slate-800">{methods.watch('dataVencimento') ? new Date(methods.watch('dataVencimento')).toLocaleDateString('pt-BR') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Lançamento</span><span className="font-medium text-slate-800">{methods.watch('dataLancamento') ? new Date(methods.watch('dataLancamento')).toLocaleDateString('pt-BR') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-medium text-slate-400">{methods.watch('status')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Forma de pagamento</span><span className="font-medium text-slate-800">{methods.watch('formaPagamento') || '-'}</span></div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
              <h3 className="text-[13px] font-bold text-blue-800 mb-3 flex items-center gap-2"><Info size={16} /> Informações importantes</h3>
              <ul className="text-[11px] text-blue-700/80 space-y-2 list-disc pl-4">
                <li>O lançamento será registrado no fluxo de caixa da unidade selecionada.</li>
                <li>É possível vincular documentos e adicionar observações.</li>
                <li>O histórico de alterações ficará disponível no detalhe do lançamento.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-[13px] font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock3 size={16} className="text-slate-400"/> Lançamentos recentes</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <div className="flex gap-3 items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><ArrowUp size={12}/></div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Venda de bebidas - Cliente X</div>
                      <div className="text-[10px] text-slate-400">Matriz — Recife</div>
                      <div className="text-[12px] font-bold text-slate-900 mt-0.5">R$ 12.500,00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded">Receita</span>
                    <div className="text-[9px] text-slate-400 mt-1">26/10/2026</div>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <div className="flex gap-3 items-center">
                    <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><ArrowDown size={12}/></div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Fornecedor de bebidas</div>
                      <div className="text-[10px] text-slate-400">Paulista</div>
                      <div className="text-[12px] font-bold text-slate-900 mt-0.5">R$ 8.500,00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold rounded">Despesa</span>
                    <div className="text-[9px] text-slate-400 mt-1">25/10/2026</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </FormProvider>
    </div>
  );
}