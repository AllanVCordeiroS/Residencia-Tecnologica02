import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { AuditRecord } from './auditTypes';

type Props = { record: AuditRecord; onClose: () => void };

export default function AuditDetailsModal({ record, onClose }: Props) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-line dark:bg-surface-raised" role="dialog" aria-modal="true" aria-labelledby="audit-modal-title">
        <button className="absolute right-4 top-4 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-foreground-muted dark:hover:bg-surface-muted" type="button" onClick={onClose} aria-label="Fechar"><X className="size-4" /></button>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Detalhes do registro</p>
        <h2 className="mt-2 pr-8 text-lg font-bold" id="audit-modal-title">{record.action} — {record.item}</h2>
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500 dark:text-foreground-muted">Usuário</dt><dd className="mt-1 text-sm font-semibold">{record.user}</dd></div>
          <div><dt className="text-xs text-slate-500 dark:text-foreground-muted">Data e hora</dt><dd className="mt-1 text-sm font-semibold">{record.date}</dd></div>
          <div><dt className="text-xs text-slate-500 dark:text-foreground-muted">Resultado</dt><dd className="mt-1 text-sm font-semibold">{record.status}</dd></div>
          <div><dt className="text-xs text-slate-500 dark:text-foreground-muted">Tipo de ação</dt><dd className="mt-1 text-sm font-semibold">{record.action}</dd></div>
        </dl>
        <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-line dark:text-foreground-muted">{record.details}</p>
        <button className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto" type="button" onClick={onClose}>Fechar detalhes</button>
      </section>
    </div>
  );
}
