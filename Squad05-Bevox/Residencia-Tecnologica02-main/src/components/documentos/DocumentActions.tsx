"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { EllipsisVertical, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { queryKeys } from "@/lib/query-keys";
import { deleteDocumentDemo, getDocumentFileUrl, updateDocumentDemo } from "@/services/documents";
import { documentStatusSchema } from "@/schemas/document";
import type { LegalDocument } from "@/types/document";
import DocumentDialog from "./DocumentDialog";
import { INPUT_CLASSE } from "./DocumentFormUi";

export default function DocumentActions({ doc }: { doc: LegalDocument }) {
  const id = useId();
  const menu = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"details" | "edit" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cache = useQueryClient();
  const { data: units = [] } = useUnitsQuery();
  const fileUrl = getDocumentFileUrl(doc.id);
  const close = () => { if (!busy) { setMode(null); setError(""); } };
  function open(next: typeof mode) {
    menu.current?.hidePopover();
    setError("");
    setMode(next);
  }
  async function refresh() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: queryKeys.documents.all }),
      cache.invalidateQueries({ queryKey: queryKeys.licenses.all }),
      cache.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
  }
  async function remove() {
    setBusy(true);
    try { await deleteDocumentDemo(doc.id); await refresh(); setMode(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir."); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = String(values.get("title") ?? "").trim();
    const responsible = String(values.get("responsible") ?? "").trim();
    if (title.length < 3 || !responsible) { setError("Informe título e responsável válidos."); return; }
    const dueDate = String(values.get("dueDate") ?? "") || null;
    const unitName = String(values.get("unit"));
    const unit = units.find((item) => item.nome === unitName);
    const status = documentStatusSchema.parse(values.get("status"));
    if (dueDate && dueDate < new Date().toLocaleDateString("sv-SE") && status === "Aprovado") {
      setError("Um documento vencido não pode ser aprovado. Atualize a vigência ou selecione Vencido."); return;
    }
    setBusy(true); setError("");
    try {
      await updateDocumentDemo(doc.id, {
        title, responsible, dueDate, unit: unitName,
        unitId: unit?.id ?? doc.unitId,
        unitType: unit ? (unit.tipo === "Matriz" ? "Matriz" : "Filial") : doc.unitType,
        dueText: dueDate ? "Vigência cadastrada" : "Prazo indeterminado",
        dueLevel: undefined, status,
        ...(doc.formValues ? { formValues: { ...doc.formValues, titulo: title, unidade: unitName, gestor: responsible, prazoIndeterminado: !dueDate, dataVencimento: dueDate ?? "" } } : {}),
      });
      await refresh(); setMode(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" aria-label={`Visualizar ${doc.title}`} onClick={() => open("details")} className="rounded p-1 focus-visible:outline-2"><Eye className="size-4" /></button>
      <button type="button" popoverTarget={id} aria-label={`Mais opções para ${doc.title}`}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (menu.current) {
            menu.current.style.left = Math.max(8, Math.min(rect.right - 208, window.innerWidth - 216)) + "px";
            menu.current.style.top = Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 260)) + "px";
          }
        }} className="rounded p-1 focus-visible:outline-2"><EllipsisVertical className="size-4" /></button>
      <div id={id} ref={menu} popover="auto"
        onKeyDown={(event) => {
          const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button,a"));
          const index = items.indexOf(document.activeElement as HTMLElement);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); items[(index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
          }
        }}
        className="fixed m-0 w-52 rounded-xl border border-line bg-surface-raised p-2 text-left text-sm text-foreground shadow-xl [&>button]:block [&>button]:w-full [&>button]:rounded-lg [&>button]:px-3 [&>button]:py-2 [&>button]:text-left [&>button:hover]:bg-surface-muted">
        <button type="button" onClick={() => open("details")}>Visualizar detalhes</button>
        <button type="button" onClick={() => open("edit")}>Editar informações</button>
        <button type="button" onClick={() => open("edit")}>Alterar status</button>
        {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" onClick={() => menu.current?.hidePopover()} className="block rounded-lg px-3 py-2 hover:bg-surface-muted">Abrir arquivo</a>}
        <button type="button" onClick={() => open("delete")} className="text-red-600">Excluir documento</button>
      </div>
      {mode && <DocumentDialog title={mode === "delete" ? "Excluir documento?" : mode === "edit" ? "Editar documento" : doc.title} onClose={close}>
        {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
        {mode === "details" && <>
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries({ Categoria: doc.category, Unidade: doc.unit, Responsável: doc.responsible, Vencimento: doc.dueDate || "Prazo indeterminado", Status: doc.status, Arquivo: doc.fileType + " • " + doc.fileSize, "Órgão emissor": doc.formValues?.orgaoEmissor, Protocolo: doc.formValues?.protocolo, Emissão: doc.formValues?.dataEmissao, Observações: doc.formValues?.observacoes }).filter(([, value]) => Boolean(value)).map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-foreground-muted">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}
          </dl>
          {fileUrl ? <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-blue-600 underline">Abrir arquivo</a> : <p className="mt-5 text-foreground-muted">Arquivo indisponível nesta sessão.</p>}
        </>}
        {mode === "edit" && <form onSubmit={save} className="space-y-4">
          <label className="block">Título<input name="title" defaultValue={doc.title} required minLength={3} className={INPUT_CLASSE} /></label>
          <label className="block">Unidade<select name="unit" defaultValue={doc.unit} required className={INPUT_CLASSE}>
            {!units.some((unit) => unit.nome === doc.unit) && <option value={doc.unit}>{doc.unit}</option>}
            {units.map((unit) => <option key={unit.id} value={unit.nome}>{unit.nome}</option>)}
          </select></label>
          <label className="block">Responsável<input name="responsible" defaultValue={doc.responsible} required className={INPUT_CLASSE} /></label>
          <label className="block">Vencimento (vazio para prazo indeterminado)<input name="dueDate" type="date" defaultValue={doc.dueDate?.includes("/") ? doc.dueDate.split("/").reverse().join("-") : doc.dueDate ?? ""} className={INPUT_CLASSE} /></label>
          <label className="block">Status<select name="status" defaultValue={doc.status} className={INPUT_CLASSE}>{documentStatusSchema.options.map((status) => <option key={status}>{status}</option>)}</select></label>
          <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={close}>Cancelar</button><button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-white">{busy ? "Salvando..." : "Salvar alterações"}</button></div>
        </form>}
        {mode === "delete" && <><p>Deseja excluir “{doc.title}”? Esta ação remove o registro salvo neste navegador e não pode ser desfeita.</p><div className="mt-5 flex justify-end gap-3"><button type="button" autoFocus disabled={busy} onClick={close}>Cancelar</button><button type="button" disabled={busy} onClick={() => void remove()} className="rounded-lg bg-red-600 px-4 py-2 text-white">{busy ? "Excluindo..." : "Excluir documento"}</button></div></>}
      </DocumentDialog>}
    </div>
  );
}
