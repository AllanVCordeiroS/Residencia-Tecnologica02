'use client';

import React, { useRef } from 'react';
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { companySettingsSchema, DEFAULT_COMPANY_SETTINGS } from "@/services/settingsSchemas";
import { useRouter } from 'next/navigation';
import { 
  Building2, Mail, MapPin, Phone, 
  ArrowLeft, Save, UploadCloud, Box
} from 'lucide-react';

export default function EmpresaConfigPage() {
  const router = useRouter();
  
  // Estados para controlar o preview da imagem
  const settings = useSettingsForm("bevox.settings.company", companySettingsSchema, DEFAULT_COMPANY_SETTINGS);
  const [logoPreview, setLogoPreview] = settings.field("logo");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função que lê o ficheiro selecionado e cria a URL temporária para visualização
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação simples de tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        settings.setMessage("O arquivo selecionado é maior que 2MB. Escolha uma imagem menor.");
        return;
      }
      
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        settings.setMessage("Escolha uma imagem PNG ou JPG.");
        return;
      }
      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => { setLogoPreview(String(reader.result)); setUploading(false); };
      reader.onerror = () => { settings.setMessage("Não foi possível ler a imagem."); setUploading(false); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-surface-muted/50 p-6 w-full font-sans">
      <div className="max-w-6xl mx-auto space-y-6">{(uploading || settings.message || !settings.ready) && <p role="status" aria-live="polite" className="text-sm text-foreground">{uploading ? "Lendo imagem..." : settings.message || (!settings.ready ? "Carregando dados..." : "")}</p>}
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight">Empresa</h1>
              <p className="text-slate-500 dark:text-foreground-muted text-[13px]">Gerencie sua Empresa.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sistema ativo
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Formulário Principal (Esquerda) */}
          <div className="flex-1 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-line">
              <Building2 size={20} className="text-blue-600 dark:text-blue-300" />
              <div>
                <h2 className="font-bold text-slate-800 dark:text-foreground text-[15px]">Dados da Empresa</h2>
                <p className="text-slate-500 dark:text-foreground-muted text-[12px]">Informações cadastrais da Adega Distribution.</p>
              </div>
            </div>

            <form id="company-settings" key={String(settings.ready)} className="space-y-5" onSubmit={(event) => {
              event.preventDefault();
              const values = Object.fromEntries(new FormData(event.currentTarget));
              const parsed = companySettingsSchema.safeParse({ ...values, logo: logoPreview });
              if (!parsed.success) { settings.setMessage("Revise os campos obrigatórios, e-mail, CNPJ (14 dígitos), CEP (8 dígitos) e telefone (10 ou 11 dígitos)."); return; }
              if (settings.save(parsed.data)) settings.setData(parsed.data);
            }}><fieldset disabled={!settings.ready || uploading} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5">Razão Social <span className="text-rose-500 dark:text-rose-300">*</span></label>
                  <input name="razao" aria-label="razao" type="text" defaultValue={settings.data.razao} required className="w-full px-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5 flex items-center gap-1">E-mail Corporativo <span className="text-rose-500 dark:text-rose-300">*</span></label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-foreground-muted" />
                    <input name="email" aria-label="email" type="email" defaultValue={settings.data.email} required className="w-full pl-8 pr-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5">Nome Fantasia <span className="text-rose-500 dark:text-rose-300">*</span></label>
                  <input name="fantasia" aria-label="fantasia" type="text" defaultValue={settings.data.fantasia} required className="w-full px-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5 flex items-center gap-1">Endereço <span className="text-rose-500 dark:text-rose-300">*</span></label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-foreground-muted" />
                    <input name="endereco" aria-label="endereco" type="text" defaultValue={settings.data.endereco} required className="w-full pl-8 pr-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5">CNPJ <span className="text-rose-500 dark:text-rose-300">*</span></label>
                  <input name="cnpj" aria-label="cnpj" type="text" defaultValue={settings.data.cnpj} required className="w-full px-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5">Bairro</label>
                  <input name="bairro" aria-label="bairro" type="text" defaultValue={settings.data.bairro} className="w-full px-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5">Inscrição Estadual</label>
                  <input name="inscricao" aria-label="inscricao" type="text" defaultValue={settings.data.inscricao} className="w-full px-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5 flex items-center gap-1">Cidade <span className="text-rose-500 dark:text-rose-300">*</span></label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-2.5 top-2.5 text-slate-400 dark:text-foreground-muted" />
                      <input name="cidade" aria-label="cidade" type="text" defaultValue={settings.data.cidade} required className="w-full pl-7 pr-2 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5">Estado <span className="text-rose-500 dark:text-rose-300">*</span></label>
                    <select name="estado" aria-label="Estado" defaultValue={settings.data.estado} required className="w-full px-2 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500">
                      {companySettingsSchema.shape.estado.options.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5">CEP <span className="text-rose-500 dark:text-rose-300">*</span></label>
                    <input name="cep" aria-label="cep" type="text" defaultValue={settings.data.cep} required className="w-full px-2 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-foreground mb-1.5 flex items-center gap-1">Telefone <span className="text-rose-500 dark:text-rose-300">*</span></label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-foreground-muted" />
                    <input name="telefone" aria-label="telefone" type="text" defaultValue={settings.data.telefone} required className="w-full pl-8 pr-3 py-2 bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-lg text-[13px] text-slate-700 dark:text-foreground focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </fieldset></form>
          </div>

          {/* Cartão do Logotipo (Direita) */}
          <aside className="w-full lg:w-[340px]">
            <div className="bg-white dark:bg-surface-raised border border-slate-200 dark:border-line rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-foreground text-[15px]">Logotipo da Empresa</h3>
                <Box size={16} className="text-slate-400 dark:text-foreground-muted" />
              </div>
              
              {/* Preview Escuro */}
              <div className="bg-[#0b1736] rounded-xl p-8 flex flex-col items-center justify-center text-center border border-[#14224f] mb-4 overflow-hidden">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-md overflow-hidden">
                  {/* Se houver uma imagem, mostra-a. Senão, mostra o ícone default */}
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

              {/* Input escondido e Botão de Trigger */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                accept="image/png, image/jpeg" 
                className="hidden" 
              />
              <button 
                type="button"
                disabled={!settings.ready || uploading} onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-bold text-[13px] rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2 mb-2 cursor-pointer"
              >
                <UploadCloud size={16} /> Alterar Logo
              </button>
              
              <p className="text-[11px] text-slate-400 dark:text-foreground-muted text-center leading-relaxed">
                Formatos aceitos: PNG, JPG. Tamanho máximo: 2MB.
              </p>
            </div>
          </aside>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex flex-wrap gap-3 justify-between items-center pt-4">
          <button 
            onClick={() => router.push("/configuracoes")} 
            className="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-foreground-muted hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <button type="submit" form="company-settings" disabled={!settings.ready || uploading} className="px-6 py-2.5 bg-blue-600 text-white text-[13px] font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}


