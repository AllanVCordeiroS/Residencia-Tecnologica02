'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { MoreVertical } from 'lucide-react';
import DocumentDialog from '@/components/documentos/DocumentDialog';
import { useDocumentsQuery } from '@/hooks/queries/useDocumentsQuery';
import { useInterfacePreferences } from '@/hooks/useInterfacePreferences';
import { getDocumentFileUrl } from '@/services/documents';
import { formatPreferenceDate } from '@/services/settings';
import { getLicenseAlerts, getLicenseStatus, isLicenseRestricted } from '@/services/licenses';
import type { License } from '@/types/license';

export default function LicenseActions({ license }: { license: License }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState<'license' | 'document' | null>(null);
  const [open, setOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const documents = useDocumentsQuery();
  const preferences = useInterfacePreferences();
  const linked = documents.data?.find(item => String(item.id) === license.documentoId);
  const fileUrl = uploadUrl || (linked ? getDocumentFileUrl(linked.id) : null);
  useEffect(() => {
    if (!license.arquivo) return;
    const url = URL.createObjectURL(license.arquivo);
    // Keep the URL alive while this row exists, and release it on refetch/removal.
    const task = setTimeout(() => setUploadUrl(url), 0);
    return () => { clearTimeout(task); URL.revokeObjectURL(url); };
  }, [license.arquivo]);
  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event.target instanceof Node && menu.current?.contains(event.target)) return;
      menu.current?.hidePopover();
    };
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => { window.removeEventListener('resize', close); window.removeEventListener('scroll', close, true); };
  }, [open]);
  function position() {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect || !menu.current) return;
    menu.current.style.left = Math.max(8, Math.min(rect.right - 240, window.innerWidth - 248)) + 'px';
    menu.current.style.top = Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - menu.current.offsetHeight - 8)) + 'px';
  }
  function menuKeys(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowDown' ? (index + 1) % items.length : event.key === 'ArrowUp' ? (index - 1 + items.length) % items.length : null;
    if (next !== null) { event.preventDefault(); items[next]?.focus(); }
    if (event.key === 'Escape') { menu.current?.hidePopover(); trigger.current?.focus(); }
    if (event.key === 'Tab') menu.current?.hidePopover();
  }
  function showDetails(mode: 'license' | 'document') { menu.current?.hidePopover(); setDetails(mode); }
  const date = (value: string) => value ? formatPreferenceDate(value, preferences) : 'Não informado';
  const downloadName = license.arquivo?.name;
  const actionClass = 'block w-full rounded-lg px-3 py-2 text-left hover:bg-surface-muted focus-visible:outline-2';
  return <>
    <button ref={trigger} type="button" popoverTarget={id} aria-haspopup="menu" aria-expanded={open} aria-controls={id}
      aria-label={`Ações de ${license.tipoLicenca}, documento ${license.numeroDocumento}`} className="row-more inline-flex size-8 items-center justify-center rounded hover:bg-surface-muted focus-visible:outline-2"
      onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); menu.current?.showPopover(); } }}><MoreVertical size={17} /></button>
    <div ref={menu} id={id} popover="auto" role="menu" aria-label={`Ações do documento ${license.numeroDocumento}`}
      onToggle={event => {
        const shown = event.newState === 'open'; setOpen(shown);
        if (shown) { position(); menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true }); }
      }} onKeyDown={menuKeys}
      className="fixed m-0 max-h-[calc(100dvh-1rem)] w-60 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-line bg-surface-raised p-2 text-sm text-foreground shadow-xl">
      <button type="button" role="menuitem" className={actionClass} onClick={() => showDetails('license')}>Visualizar detalhes</button>
      {linked && <button type="button" role="menuitem" className={actionClass} onClick={() => showDetails('document')}>Visualizar documento vinculado</button>}
      {fileUrl && <>
        <a role="menuitem" href={fileUrl} target="_blank" rel="noopener noreferrer" className={actionClass} onClick={() => menu.current?.hidePopover()}>Abrir arquivo</a>
        {(license.arquivo || fileUrl.startsWith('blob:')) && <a role="menuitem" href={fileUrl} download={downloadName || 'documento'} className={actionClass} onClick={() => menu.current?.hidePopover()}>Baixar arquivo</a>}
      </>}
    </div>
    {details && <DocumentDialog title={details === 'document' ? `Documento vinculado: ${linked?.title || license.documentoId}` : `${license.tipoLicenca} — ${license.numeroDocumento}`} onClose={() => { setDetails(null); trigger.current?.focus(); }}>
      {details === 'license' && <>
      <dl className="grid gap-4 sm:grid-cols-2">
        {[["Tipo de licença", license.tipoLicenca], ["Número do documento", license.numeroDocumento], ["Unidade", license.unidadeNome], ["Categoria da unidade", license.unidadeTipo], ["Órgão emissor", license.orgaoEmissor], ["Responsável", license.responsavelNome], ["Emissão", date(license.dataEmissao)], ["Vencimento", date(license.dataVencimento)], ["Status", getLicenseStatus(license)], ["Início da renovação", date(license.inicioRenovacao)], ["Protocolo de renovação", license.renovacaoEmAndamento ? license.protocoloRenovacao : 'Sem protocolo em andamento']].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-foreground-muted">{label}</dt><dd className="break-words font-semibold">{value || 'Não informado'}</dd></div>)}
      </dl>
      <p className="mt-4 whitespace-pre-wrap break-words">Condicionantes: {license.observacoes || 'Não informadas'}</p>
      <p className="mt-3">{isLicenseRestricted(license) ? 'Bloqueio cautelar: ativação da unidade impedida.' : 'Sem restrição cautelar ativa.'}</p>
      <p className="mt-3">Alertas preventivos atingidos: {getLicenseAlerts(license).map(day => `${day} dias`).join(', ') || 'Nenhum'}</p>
      </>}
      {license.documentoId && <section className="mt-5 rounded-lg border border-line p-3" aria-label="Documento vinculado">
        <h3 className="font-bold">Documento vinculado #{license.documentoId}</h3>
        {linked ? <dl className="mt-2 space-y-2">{[['Título', linked.title], ['Categoria', linked.category], ['Unidade', linked.unit], ['Responsável', linked.responsible], ['Situação documental', linked.status], ['Arquivo', `${linked.fileType} · ${linked.fileSize}`]].map(([label, value]) => <div key={label}><dt className="text-xs text-foreground-muted">{label}</dt><dd className="break-words">{value || 'Não informado'}</dd></div>)}</dl> : documents.isPending ? <p role="status">Carregando documento…</p> : documents.isError ? <p role="alert">Não foi possível consultar o documento. <button type="button" className="underline" onClick={() => void documents.refetch()}>Tentar novamente</button></p> : <p>Documento indisponível nesta sessão.</p>}
      </section>}
      {fileUrl ? <div className="mt-4 flex flex-wrap gap-4"><a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-300">Abrir {license.arquivo?.name || 'arquivo'}</a>{(license.arquivo || fileUrl.startsWith('blob:')) && <a href={fileUrl} download={downloadName || 'documento'} className="text-blue-600 underline dark:text-blue-300">Baixar arquivo</a>}</div> : <p className="mt-4 text-foreground-muted">Arquivo digital indisponível nesta sessão.</p>}
    </DocumentDialog>}
  </>;
}
