"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Eye, MoreVertical, Pencil, Power, Trash2, X } from "lucide-react";
import { useUnitMutation } from "@/hooks/queries/useUnitsQuery";
import type { OperationalUnit } from "@/types/unit";

function UnitDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[min(700px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-surface-raised p-6 text-foreground shadow-2xl backdrop:bg-slate-950/60">
    <header className="mb-5 flex items-center justify-between gap-4"><h2 id={titleId} className="text-lg font-bold">{title}</h2><button type="button" autoFocus onClick={onClose} aria-label="Fechar diálogo" className="rounded p-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-blue-600"><X size={20} /></button></header>
    {children}
  </dialog>;
}

export default function UnitActions({ unit }: { unit: OperationalUnit }) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [dialog, setDialog] = useState<"details" | "toggle" | "delete" | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const mutation = useUnitMutation();
  const closeMenu = () => { setPosition(null); trigger.current?.focus({ preventScroll: true }); };
  useEffect(() => {
    if (!position) return;
    menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setPosition(null); };
    const close = () => setPosition(null);
    const closeOnExternalScroll = (event: Event) => {
      if (event.target instanceof Node && menu.current?.contains(event.target)) return;
      close();
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", closeOnExternalScroll, true);
    return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", close); window.removeEventListener("scroll", closeOnExternalScroll, true); };
  }, [position]);
  function openDialog(type: "details" | "toggle" | "delete") { closeMenu(); mutation.reset(); setDialog(type); }
  async function confirm() {
    if (dialog !== "delete" && dialog !== "toggle") return;
    try { await mutation.mutateAsync({ type: dialog, id: unit.id }); setDialog(null); } catch { /* Mensagem do serviço no diálogo. */ }
  }
  const menuClass = "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface-muted focus:bg-surface-muted focus:outline-none";
  const details: [string, ReactNode][] = [
    ["CNPJ", unit.cnpj], ["Identificador operacional", unit.identificadorOperacional], ["Razão social", unit.razaoSocial],
    ["Inscrição Estadual", unit.inscricaoEstadual], ["Inscrição Municipal", unit.inscricaoMunicipal], ["Regime tributário", unit.regimeTributario],
    ["Formato operacional", unit.formatoOperacional ?? unit.subtipo], ["Tipo", unit.tipo], ["Cidade", unit.cidade], ["CEP", unit.cep],
    ["Logradouro", unit.logradouro], ["Número", unit.numero], ["Complemento", unit.complemento], ["Bairro", unit.bairro],
    ["Polo Logístico Regional", unit.poloLogistico], ["Restrição de tráfego", unit.restricaoTrafego],
    ["Área de armazenagem (m²)", unit.areaArmazenagem], ["Pé-direito (m)", unit.peDireito], ["Capacidade de paletes", unit.capacidadePaletes],
    ["Câmara fria", unit.camaraFria === undefined ? undefined : unit.camaraFria ? "Sim" : "Não"], ["Metragem refrigerada (m²)", unit.metragemRefrigerada],
    ["Docas", unit.docas], ["Niveladoras hidráulicas", unit.niveladorasHidraulicas === undefined ? undefined : unit.niveladorasHidraulicas ? "Sim" : "Não"],
    ["Frota — Caminhões Toco", unit.frotaToco], ["Frota — Carretas / Sider", unit.frotaCarretas], ["Frota — VUCs Urbanos", unit.frotaVuc],
    ["Responsável", unit.responsavel], ["E-mail operacional", unit.emailOperacional], ["Telefone fixo", unit.telefoneFixo], ["Celular de plantão", unit.celularPlantao],
    ["Funcionários", unit.funcionarios], ["Documentos pendentes", unit.documentosPendentes], ["Tarefas atrasadas", unit.tarefasAtrasadas], ["Licenças vencendo", unit.licencasVencendo],
    ["Operação", unit.ativa === false ? "Inativa" : "Ativa"], ["Situação", unit.situacao],
  ];
  return <>
    <button ref={trigger} type="button" aria-label={`Ações de ${unit.nome}`} aria-haspopup="menu" aria-expanded={Boolean(position)} aria-controls={position ? menuId : undefined} onClick={() => {
      if (position) { closeMenu(); return; }
      const rect = trigger.current!.getBoundingClientRect();
      setPosition({ left: Math.max(8, Math.min(rect.right - 220, window.innerWidth - 228)), top: Math.max(8, rect.bottom + 8 + 190 > window.innerHeight ? rect.top - 198 : rect.bottom + 8) });
    }} className="rounded p-2 text-foreground-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-blue-600"><MoreVertical size={16} /></button>
    {position && createPortal(<div ref={menu} id={menuId} role="menu" aria-label={`Ações de ${unit.nome}`} style={position} onKeyDown={(event) => {
      const items = Array.from(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); items[event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length]?.focus({ preventScroll: true }); }
      if (event.key === "Escape") { event.preventDefault(); closeMenu(); }
      if (event.key === "Tab") closeMenu();
    }} className="fixed z-[100] max-h-[calc(100dvh-1rem)] w-[min(220px,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-line bg-surface-raised p-1 shadow-xl">
      <button role="menuitem" type="button" onClick={() => openDialog("details")} className={menuClass}><Eye size={16} />Visualizar detalhes</button>
      <Link role="menuitem" href={`/unidades/${unit.id}/editar`} onClick={closeMenu} className={menuClass}><Pencil size={16} />Editar unidade</Link>
      <button role="menuitem" type="button" onClick={() => openDialog("toggle")} className={menuClass}><Power size={16} />{unit.ativa === false ? "Ativar unidade" : "Desativar unidade"}</button>
      <button role="menuitem" type="button" onClick={() => openDialog("delete")} className={`${menuClass} text-red-600 dark:text-red-300`}><Trash2 size={16} />Excluir unidade</button>
    </div>, document.body)}
    {dialog && <UnitDialog title={dialog === "details" ? unit.nome : dialog === "delete" ? "Excluir unidade?" : unit.ativa === false ? "Ativar unidade?" : "Desativar unidade?"} onClose={() => { if (!mutation.isPending) setDialog(null); }}>
      {dialog === "details" ? <><dl className="grid gap-4 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="min-w-0 rounded-lg bg-surface-muted p-3"><dt className="text-xs text-foreground-muted">{label}</dt><dd className="mt-1 break-words text-sm">{value === undefined || value === "" ? "Não informado" : value}</dd></div>)}</dl><Link href={`/unidades/${unit.id}/editar`} className="mt-5 inline-block rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white">Editar unidade</Link></>
        : <><p className="text-sm leading-6 text-foreground-muted">{dialog === "delete" ? `Excluir ${unit.nome} remove o cadastro desta sessão. A operação será bloqueada se houver documentos, tarefas, licenças ou pendências vinculadas. Para preservar o histórico, prefira desativar a unidade.` : `${unit.ativa === false ? "Ativar" : "Desativar"} ${unit.nome}? O cadastro e seu histórico serão preservados.`}</p>
          {mutation.isError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{mutation.error.message}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" disabled={mutation.isPending} onClick={() => setDialog(null)} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold">Cancelar</button><button type="button" disabled={mutation.isPending} onClick={() => void confirm()} className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending ? "Processando…" : dialog === "delete" ? "Confirmar exclusão" : "Confirmar"}</button></div></>}
    </UnitDialog>}
  </>;
}
