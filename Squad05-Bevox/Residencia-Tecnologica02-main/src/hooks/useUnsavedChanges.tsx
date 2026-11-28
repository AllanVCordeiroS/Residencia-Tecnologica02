"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Options {
  dirty: boolean;
  onDiscard?: () => void;
  savedDraftMessage?: string;
  description?: string;
}

/**
 * Proteção compartilhada de formulários. Navegações internas usam diálogo
 * BEVOX; fechar/recarregar a aba usa o aviso nativo exigido pelo navegador.
 */
export function useUnsavedChanges({ dirty, onDiscard, savedDraftMessage, description }: Options) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);
  const dirtyRef = useRef(dirty);
  const discardRef = useRef(onDiscard);
  const allowed = useRef(false);
  const pending = useRef<(() => void) | null>(null);
  const restoringHistory = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => { dirtyRef.current = dirty; discardRef.current = onDiscard; }, [dirty, onDiscard]);
  const allowNavigation = useCallback(() => { allowed.current = true; }, []);
  const requestDiscard = useCallback((action: () => void) => {
    if (!dirtyRef.current || allowed.current) { action(); return; }
    pending.current = action;
    setOpen(true);
  }, []);
  const requestNavigation = useCallback((path: string) => {
    if (!dirtyRef.current || allowed.current) { router.push(path); return; }
    pending.current = () => router.push(path);
    setOpen(true);
  }, [router]);

  useEffect(() => {
    if (open) modal.current?.showModal();
    else modal.current?.close();
  }, [open]);

  useEffect(() => {
    if (!dirty || allowed.current) return;
    // A entrada de guarda mantém o formulário montado ao pressionar Voltar.
    const guardKey = "__bevoxFormGuard";
    const originalUrl = window.location.href;
    window.history.pushState({ ...window.history.state, [guardKey]: true }, "", originalUrl);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current || allowed.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const interceptAnchor = (event: MouseEvent) => {
      if (allowed.current || !dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin || (target.pathname === window.location.pathname && target.search === window.location.search)) return;
      event.preventDefault();
      event.stopPropagation();
      requestNavigation(target.pathname + target.search + target.hash);
    };
    const interceptBack = (event: PopStateEvent) => {
      if (allowed.current || !dirtyRef.current) return;
      event.stopImmediatePropagation();
      if (restoringHistory.current) { restoringHistory.current = false; return; }
      restoringHistory.current = true;
      window.history.forward();
      pending.current = () => { window.history.go(-2); };
      setOpen(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", interceptAnchor, true);
    window.addEventListener("popstate", interceptBack, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", interceptAnchor, true);
      window.removeEventListener("popstate", interceptBack, true);
      if (window.location.href === originalUrl && window.history.state?.[guardKey]) {
        const state = { ...window.history.state };
        delete state[guardKey];
        window.history.replaceState(state, "", originalUrl);
      }
    };
  }, [dirty, requestNavigation]);

  function stay() {
    pending.current = null;
    setOpen(false);
  }

  function leave() {
    const navigate = pending.current;
    allowed.current = true;
    discardRef.current?.();
    setOpen(false);
    navigate?.();
  }

  const dialog = (
    <dialog ref={modal} aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); stay(); }}
      onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); stay(); } }}
      onClick={(event) => { if (event.target === event.currentTarget) stay(); }}
      className="fixed inset-0 m-auto w-[min(460px,calc(100vw-2rem))] rounded-2xl border border-line bg-surface-raised p-6 text-foreground shadow-2xl backdrop:bg-slate-950/60">
      <h2 id={titleId} className="text-lg font-bold">Deseja realmente sair desta página?</h2>
      <p id={descriptionId} className="mt-3 text-sm leading-6 text-foreground-muted">{description ?? "Existem informações preenchidas que ainda não foram concluídas. Caso saia agora, você poderá perder as alterações realizadas."}</p>
      {savedDraftMessage && <p className="mt-3 rounded-lg bg-surface-muted p-3 text-xs leading-5 text-foreground-muted">{savedDraftMessage}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" autoFocus onClick={stay} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-blue-600">Continuar preenchendo</button>
        <button type="button" onClick={leave} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-red-500">Sair e descartar alterações</button>
      </div>
    </dialog>
  );
  return { requestNavigation, requestDiscard, allowNavigation, dialog };
}
