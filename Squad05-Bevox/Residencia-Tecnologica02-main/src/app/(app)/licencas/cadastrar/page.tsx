'use client';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch, type DefaultValues, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Leaf, ShieldCheck, Flame, Truck, Files, ChevronLeft, UploadCloud, Trash2 } from 'lucide-react';
import { licenseSchema, LICENSE_CATEGORIES, type LicenseFormValues } from '@/schemas/license';
import { useUnitsQuery } from '@/hooks/queries/useUnitsQuery';
import { useUsersQuery } from '@/hooks/queries/useUsersQuery';
import { useDocumentsQuery } from '@/hooks/queries/useDocumentsQuery';
import { useCreateLicenseMutation } from '@/hooks/queries/useLicensesQuery';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { getLicenseStatus } from '@/services/licenses';
import { getDocumentFileUrl } from '@/services/documents';
import { EXTENSOES_ACEITAS, LIMITE_ARQUIVO_MB } from '@/data/documentFormOptions';
import type { OperationalUnit } from '@/types/unit';

const steps = ['Informações Básicas', 'Unidade e Órgão', 'Vínculo e Upload', 'Prazos e Régua de Alerta'];
const fields: FieldPath<LicenseFormValues>[][] = [['tipoLicenca'], ['unidade', 'orgaoEmissor', 'numeroDocumento', 'responsavel', 'observacoes'], ['vinculo', 'documentoId', 'arquivo'], ['dataEmissao', 'dataVencimento', 'inicioRenovacao', 'renovacaoEmAndamento', 'protocoloRenovacao', 'alerta60', 'alerta30', 'alerta15', 'bloqueioCautelar']];
const icons = [FileText, Leaf, ShieldCheck, Flame, Truck, Files];
const defaults: DefaultValues<LicenseFormValues> = { unidade: '', orgaoEmissor: '', numeroDocumento: '', responsavel: '', observacoes: '', vinculo: 'upload', documentoId: '', arquivo: undefined, dataEmissao: '', dataVencimento: '', inicioRenovacao: '', renovacaoEmAndamento: false, protocoloRenovacao: '', alerta60: true, alerta30: true, alerta15: true, bloqueioCautelar: false };
const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm dark:border-line dark:bg-surface-raised aria-invalid:border-red-500';
const panel = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-line dark:bg-surface-raised';
const formatDate = (value: string) => value ? value.split('-').reverse().join('/') : 'Não informada';

export default function CadastrarLicencaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const units = useUnitsQuery();
  const users = useUsersQuery();
  const documents = useDocumentsQuery();
  const create = useCreateLicenseMutation();
  const form = useForm<LicenseFormValues>({ resolver: zodResolver(licenseSchema), defaultValues: defaults, shouldUnregister: false });
  const values = useWatch({ control: form.control }) as LicenseFormValues;
  const guard = useUnsavedChanges({ dirty: form.formState.isDirty, onDiscard: () => form.reset(defaults) });
  const category = LICENSE_CATEGORIES.find(item => item.name === values.tipoLicenca);
  const unit = units.data?.find(item => item.id === values.unidade) as OperationalUnit | undefined;
  const responsible = users.data?.find(item => item.id === values.responsavel);
  const document = documents.data?.find(item => String(item.id) === values.documentoId);
  const status = values.dataVencimento ? getLicenseStatus(values) : 'Vigência não informada';

  function field(name: FieldPath<LicenseFormValues>, label: string, children: ReactNode) {
    const message = form.formState.errors[name]?.message;
    return <div><label htmlFor={name} className="text-sm font-semibold">{label}</label>{children}{message && <p id={name + '-error'} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-300">{String(message)}</p>}</div>;
  }
  function text(name: 'orgaoEmissor' | 'numeroDocumento' | 'dataEmissao' | 'dataVencimento' | 'inicioRenovacao' | 'protocoloRenovacao', label: string, type = 'text') {
    return field(name, label, <input id={name} type={type} {...form.register(name)} aria-invalid={!!form.formState.errors[name]} aria-describedby={name + '-error'} className={inputClass} />);
  }
  async function go(target: number) {
    if (target > step) {
      for (let i = 0; i < target; i++) {
        if (!await form.trigger(fields[i], { shouldFocus: true })) { setStep(i); return; }
      }
    }
    setStep(target);
  }
  async function submit(data: LicenseFormValues) {
    setError(null);
    try {
      await create.mutateAsync(data);
      guard.allowNavigation();
      form.reset(defaults);
      router.push('/licencas');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível cadastrar a licença.'); }
  }
  const selectFile = (file?: File) => form.setValue('arquivo', file, { shouldDirty: true, shouldValidate: true });

  return <div className="w-full bg-slate-50 p-4 text-slate-800 dark:bg-surface-muted dark:text-foreground sm:p-8">
    {guard.dialog}
    <header className="mb-7">
      <button type="button" onClick={() => guard.requestNavigation('/licencas')} className="mb-3 flex items-center gap-1 text-sm text-slate-500 dark:text-foreground-muted"><ChevronLeft size={16} />Voltar para Listagem</button>
      <h1 className="text-2xl font-bold">Cadastrar Licença ou Alvará</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-foreground-muted">Registre uma nova licença com validação regulatória imediata, vínculo de documentos e régua preventiva de alertas.</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-foreground-muted">Conferência dos campos no navegador. Cadastro e arquivos disponíveis nesta sessão; sem validação por órgão regulador ou envio ao servidor.</p>
    </header>
    <nav aria-label="Etapas do cadastro" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((label, index) => <button key={label} type="button" aria-current={step === index ? 'step' : undefined} onClick={() => void go(index)} className={'rounded-xl border p-3 text-left text-sm font-semibold ' + (step === index ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-slate-200 bg-white dark:border-line dark:bg-surface-raised')}><span className="mr-2">{index < step ? '✓' : index + 1}.</span>{label}</button>)}
    </nav>
    <form noValidate onSubmit={event => { if (step !== 3) { event.preventDefault(); void go(step + 1); } else void form.handleSubmit(submit, errors => { const invalid = fields.findIndex(list => list.some(key => errors[key])); if (invalid >= 0) setStep(invalid); })(event); }} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-5">
        <section className={panel} aria-label={steps[step]}>
          <h2 className="mb-5 font-bold">{step + 1}. {steps[step]}</h2>
          {step === 0 && <>
            <Controller name="tipoLicenca" control={form.control} render={({ field, fieldState }) => (
              <fieldset aria-describedby={fieldState.error ? 'tipoLicenca-error' : undefined}>
                <legend className="mb-3 text-sm">Tipo de Licença e Enquadramento Operacional <span className="text-red-600">*</span> (obrigatório)</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LICENSE_CATEGORIES.map((item, i) => {
                    const Icon = icons[i];
                    return <label key={item.name} className={'cursor-pointer rounded-xl border-2 p-4 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 ' + (field.value === item.name ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-line')}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name={field.name} value={item.name} checked={field.value === item.name} onChange={() => field.onChange(item.name)} onBlur={field.onBlur} ref={i === 0 ? field.ref : undefined} required aria-describedby={fieldState.error ? 'tipoLicenca-error' : undefined} />
                        <Icon size={18} /><strong className="text-sm">{item.name}</strong>
                      </div>
                      <p className="mt-2 text-xs font-semibold">{item.agency}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-foreground-muted">{item.description}</p>
                    </label>;
                  })}
                </div>
                {fieldState.error && <p id="tipoLicenca-error" role="alert" className="mt-2 text-xs text-red-600 dark:text-red-300">{fieldState.error.message}</p>}
              </fieldset>
            )} />
            <p className="mt-5 text-sm">Tipo selecionado: <strong>{category?.name || 'Selecione uma opção'}</strong></p>
            <p className="mt-2 text-sm">Categoria de governança: <strong>{category?.category || 'Não informada'}</strong></p>
          </>}
          {step === 1 && <div className="grid gap-5 sm:grid-cols-2">
            {field('unidade', 'Unidade / Centro de Distribuição *', <select id="unidade" {...form.register('unidade')} aria-invalid={!!form.formState.errors.unidade} className={inputClass}><option value="">Selecione a unidade</option>{units.data?.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>)}
            {text('orgaoEmissor', 'Órgão Regulador / Emissor *')}
            {unit && <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-surface-muted sm:col-span-2"><p>CNPJ: {unit.cnpj || 'Não informado'}</p><p>Inscrição estadual: {unit.inscricaoEstadual || 'Não informada'}</p><p>Identificação operacional: {unit.identificadorOperacional || 'Não informada'}</p></div>}
            {text('numeroDocumento', 'Número do Documento / Processo SEI *')}
            {field('responsavel', 'Responsável Técnico / Fiscal Interno *', <select id="responsavel" {...form.register('responsavel')} aria-invalid={!!form.formState.errors.responsavel} className={inputClass}><option value="">Selecione o responsável</option>{users.data?.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>)}
            <div className="sm:col-span-2">{field('observacoes', 'Condicionantes e Observações do Alvará', <textarea id="observacoes" rows={4} {...form.register('observacoes')} className={inputClass} />)}</div>
            {(units.isPending || users.isPending) && <p role="status">Carregando unidades e responsáveis…</p>}
            {(units.isError || users.isError) && <div role="alert">Falha ao consultar unidades ou responsáveis. <button type="button" onClick={() => { void units.refetch(); void users.refetch(); }}>Tentar novamente</button></div>}
          </div>}
          {step === 2 && <div className="space-y-4">
            <fieldset className="flex flex-wrap gap-5"><legend className="mb-3 text-sm">Escolha o vínculo documental *</legend><label><input type="radio" value="upload" {...form.register('vinculo')} /> Anexar novo arquivo</label><label><input type="radio" value="existente" {...form.register('vinculo')} /> Usar documento existente</label></fieldset>
            {values.vinculo === 'upload' ? <>
              <div onDragOver={event => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={event => { event.preventDefault(); setDrag(false); selectFile(event.dataTransfer.files[0]); }} className={'rounded-xl border-2 border-dashed p-6 text-center ' + (drag ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-slate-300 dark:border-line')}><UploadCloud className="mx-auto mb-3" /><label htmlFor="arquivo" className="block text-sm font-semibold">Selecione ou arraste um arquivo</label><input id="arquivo" type="file" accept={EXTENSOES_ACEITAS.map(extension => '.' + extension).join(',')} onChange={event => { selectFile(event.target.files?.[0]); event.target.value = ''; }} className="mt-4 max-w-full text-sm" /><p className="mt-3 text-xs">PDF, XML, PNG, JPG, JPEG ou TIFF. Máximo {LIMITE_ARQUIVO_MB} MB.</p></div>
              {values.arquivo && <div className="flex items-start justify-between gap-2 rounded-lg border border-line p-3 text-sm"><div className="min-w-0 break-words"><strong>{values.arquivo.name}</strong><p>{values.arquivo.type || values.arquivo.name.split('.').pop()?.toUpperCase()} · {(values.arquivo.size / 1024 / 1024).toFixed(2)} MB</p><p className="mt-1 text-xs">Selecionado localmente; sem upload ao servidor, OCR ou assinatura.</p></div><button type="button" aria-label="Remover arquivo" onClick={() => selectFile(undefined)}><Trash2 size={18} /></button></div>}
              {form.formState.errors.arquivo && <p role="alert" className="text-sm text-red-600">{String(form.formState.errors.arquivo.message)}</p>}
            </> : <>
              {field('documentoId', 'Documento cadastrado *', <select id="documentoId" {...form.register('documentoId')} aria-invalid={!!form.formState.errors.documentoId} className={inputClass}><option value="">Selecione o documento</option>{documents.data?.map(item => <option key={item.id} value={item.id}>{item.title} — {item.unit}</option>)}</select>)}
              {documents.isPending && <p role="status">Carregando documentos…</p>}
              {documents.isError && <p role="alert">Erro ao carregar documentos. <button type="button" onClick={() => void documents.refetch()}>Tentar novamente</button></p>}
              {documents.data?.length === 0 && <p>Nenhum documento cadastrado disponível.</p>}
              {document && <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-surface-muted"><strong>{document.title}</strong><p>{document.fileType} · {document.fileSize} · Status na origem: {document.status}</p><p>Vínculo ao registro existente; não implica validação regulatória.</p>{getDocumentFileUrl(document.id) ? <a href={getDocumentFileUrl(document.id)!} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Abrir arquivo disponível</a> : <p className="text-xs">Arquivo digital não disponível na sessão.</p>}<button type="button" onClick={() => form.setValue('documentoId', '', { shouldDirty: true, shouldValidate: true })} className="mt-2 block text-red-600">Remover vínculo</button></div>}
            </>}
          </div>}
          {step === 3 && <div className="space-y-5"><div className="grid gap-5 sm:grid-cols-2">{text('dataEmissao', 'Data de emissão *', 'date')}{text('dataVencimento', 'Data de vencimento *', 'date')}{text('inicioRenovacao', 'Início do processo de renovação', 'date')}{text('protocoloRenovacao', 'Protocolo de renovação')}<label className="text-sm sm:col-span-2"><input type="checkbox" {...form.register('renovacaoEmAndamento')} /> Protocolo de renovação em andamento</label></div><fieldset className="rounded-lg bg-slate-50 p-4 dark:bg-surface-muted"><legend className="text-sm font-semibold">Régua preventiva de alertas</legend><div className="flex flex-wrap gap-5">{([60, 30, 15] as const).map(day => <label key={day} className="text-sm"><input type="checkbox" {...form.register(('alerta' + day) as 'alerta60' | 'alerta30' | 'alerta15')} /> {day} dias antes</label>)}</div><p className="mt-3 text-xs text-slate-500 dark:text-foreground-muted">Os marcos selecionados geram avisos na listagem. E-mail e notificações externas dependem de integração.</p></fieldset><label className="block rounded-lg border border-red-200 p-4 text-sm dark:border-red-900"><input type="checkbox" {...form.register('bloqueioCautelar')} /> <strong>Ativar Bloqueio Cautelar Operacional</strong><span className="mt-2 block text-xs">Impede a ativação da unidade na demonstração após o vencimento, sem protocolo de renovação em andamento. Informar apenas uma data planejada não suspende a regra. Não há bloqueio de faturamento em backend.</span></label></div>}
        </section>
        {Object.keys(form.formState.errors).length > 0 && <p role="alert" className="text-sm text-red-600 dark:text-red-300">Revise os campos sinalizados antes de continuar.</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap justify-between gap-3 pb-8"><button type="button" onClick={() => guard.requestNavigation('/licencas')} className="secondary-button">Cancelar</button><div className="flex gap-3">{step > 0 && <button type="button" onClick={() => void go(step - 1)} className="secondary-button">Voltar etapa</button>}{step < 3 ? <button type="button" onClick={() => void go(step + 1)} className="primary-button">Avançar</button> : <button type="submit" disabled={create.isPending} className="primary-button disabled:opacity-50">{create.isPending ? 'Salvando…' : 'Concluir Cadastro'}</button>}</div></div>
      </div>
      <aside className={panel + ' lg:sticky lg:top-6'} aria-label="Resumo da licença"><h2 className="mb-4 font-bold">Resumo da licença</h2><dl className="space-y-3 break-words text-sm">{[['Tipo de licença', category?.name], ['Categoria', category?.category], ['Unidade', unit?.nome], ['Órgão emissor', values.orgaoEmissor], ['Número do documento', values.numeroDocumento], ['Responsável', responsible?.nome], ['Vencimento', formatDate(values.dataVencimento)], ['Situação da vigência', status]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500 dark:text-foreground-muted">{label}</dt><dd className="mt-1 font-semibold">{value || 'Não informado'}</dd></div>)}</dl><div className="mt-5 border-t border-line pt-4 text-xs"><strong>Orientação regulatória</strong><p className="mt-2 leading-5">{category?.guidance || 'Selecione o tipo de licença para consultar a orientação.'}</p></div></aside>
    </form>
  </div>;
}
