"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/** Native modal supplies focus trapping, Escape and top-layer rendering. */
export default function DocumentDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return (
    <dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[min(600px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-surface-raised p-6 text-sm text-foreground shadow-2xl backdrop:bg-slate-950/50">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-lg font-bold">{title}</h2>
        <button type="button" aria-label="Fechar diálogo" onClick={onClose} className="rounded px-2 py-1 hover:bg-surface-muted">✕</button>
      </div>
      {children}
    </dialog>
  );
}
