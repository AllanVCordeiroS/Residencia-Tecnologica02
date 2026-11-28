"use client";

import Link from "next/link";
import { z } from "zod";
import { useInterfacePreferences } from "@/hooks/useInterfacePreferences";
import { useSettingsFilters } from "@/hooks/useSettingsFilters";
import { formatPreferenceDate } from "@/services/settings";
import { useRef, useState } from "react";
import { ArrowLeft, Info, Plug, Search, SearchCheck, X } from "lucide-react";
import { useAuditQuery, useIntegrationsQuery } from "@/hooks/queries/useAuditQuery";
import type { AuditEvent, ExternalIntegration } from "@/types/audit";
import { CartaoSecao } from "./CartaoSecao";

const inputClass = "w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-blue-500";
const buttonClass = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-blue-500";
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const filtersSchema = z.object({ search: z.string(), user: z.string(), module: z.string(), action: z.string(), start: z.string(), end: z.string() });
const defaultFilters = { search: "", user: "", module: "", action: "", start: "", end: "" };

export default function IntegracoesAuditoria() {
  const audit = useAuditQuery();
  const integrations = useIntegrationsQuery();
  const preferences = useInterfacePreferences();
  const formatDate = (value: string) => formatPreferenceDate(value, preferences, true);
  const [filters, setFilters] = useSettingsFilters("audit", filtersSchema, defaultFilters, preferences.global.keepFiltersAfterRefresh);
  const { search, user, module, action, start, end } = filters;
  const [page, setPage] = useState(1);
  function changeFilter(key: keyof typeof filters, value: string) {
    setFilters((old) => ({ ...old, [key]: value }));
    setPage(1);
  }
  const setSearch = (value: string) => changeFilter("search", value);
  const setUser = (value: string) => changeFilter("user", value);
  const setModule = (value: string) => changeFilter("module", value);
  const setAction = (value: string) => changeFilter("action", value);
  const setStart = (value: string) => changeFilter("start", value);
  const setEnd = (value: string) => changeFilter("end", value);
  const [selected, setSelected] = useState<AuditEvent | ExternalIntegration | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const events = audit.data ?? [];
  const invalidPeriod = Boolean(start && end && start > end);
  const filtered = invalidPeriod ? [] : events.filter((event) => {
    const day = formatPreferenceDate(event.occurredAt, { ...preferences, user: { ...preferences.user, dateFormat: "AAAA-MM-DD" } });
    return (!user || event.userId === user) && (!module || event.module === module)
      && (!action || event.action === action) && (!start || day >= start) && (!end || day <= end)
      && normalize(`${event.userName} ${event.responsible} ${event.action} ${event.module} ${event.description}`).includes(normalize(search.trim()));
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount);
  const visibleEvents = preferences.global.automaticPagination ? filtered.slice((currentPage - 1) * 10, currentPage * 10) : filtered;
  const cellClass = preferences.global.tableView === "compact" ? "px-3 py-1.5" : "p-3";
  function openDetails(value: AuditEvent | ExternalIntegration) {
    setSelected(value);
    dialogRef.current?.showModal();
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-600 p-3 text-white"><Plug className="h-6 w-6" aria-hidden="true" /></span>
          <div><h1 className="text-2xl font-bold tracking-tight text-foreground">Integrações e Auditoria</h1><p className="mt-1 text-sm text-foreground-muted">Gerencie as preferências e os parâmetros do BEVOX.</p></div>
        </div>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <CartaoSecao className="min-w-0" icone={Plug} titulo="Integrações e Serviços Externos" descricao="Conheça os serviços previstos e consulte a disponibilidade.">
          <p className="mb-5 flex gap-2 rounded-lg bg-surface-muted p-3 text-xs leading-5 text-foreground-muted"><Info className="mt-0.5 h-4 w-4 shrink-0" />Nenhum conector externo está configurado. Não há credenciais, conexões ou sincronizações ativas.</p>
          {integrations.isPending ? <p role="status" className="text-sm text-foreground-muted">Carregando integrações...</p> : integrations.isError ? <div role="alert"><p>Não foi possível carregar os serviços.</p><button className={buttonClass} onClick={() => void integrations.refetch()}>Tentar novamente</button></div> : <ul className="space-y-3">
            {integrations.data.map((integration) => <li key={integration.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${integration.color}`} aria-hidden="true">{integration.initials}</span>
              <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-foreground">{integration.name}</h2><p className="mt-1 text-xs text-foreground-muted">{integration.category}</p><span className="mt-1 inline-block text-[11px] text-foreground-muted">Não configurado</span></div>
              <button className={buttonClass} onClick={() => openDetails(integration)} aria-label={`Ver detalhes de ${integration.name}`}>Ver detalhes</button>
            </li>)}
            {integrations.data.length === 0 && <li className="text-sm text-foreground-muted">Nenhuma integração disponível.</li>}
          </ul>}
        </CartaoSecao>

        <CartaoSecao className="min-w-0" icone={SearchCheck} titulo="Auditoria e Histórico Administrativo" descricao="Consulte os registros demonstrativos já disponíveis no projeto.">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[["Registros", events.length], ["Usuários", new Set(events.map((event) => event.userId)).size], ["Módulos", new Set(events.map((event) => event.module)).size]].map(([label, value]) => <div key={label} className="rounded-lg bg-surface-muted p-3"><p className="text-lg font-bold text-foreground">{value}</p><p className="text-[11px] text-foreground-muted">{label}</p></div>)}
          </div>
          <label className="relative mb-3 block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" aria-hidden="true" /><span className="sr-only">Pesquisar registros</span><input className={`${inputClass} pl-9`} placeholder="Buscar nos registros..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-xs text-foreground-muted">Usuário vinculado<select className={inputClass} value={user} onChange={(event) => setUser(event.target.value)}><option value="">Todos os usuários</option>{[...new Map(events.map((event) => [event.userId, event.userName])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className="space-y-1 text-xs text-foreground-muted">Módulo<select className={inputClass} value={module} onChange={(event) => setModule(event.target.value)}><option value="">Todos os módulos</option>{[...new Set(events.map((event) => event.module))].map((name) => <option key={name}>{name}</option>)}</select></label>
            <label className="space-y-1 text-xs text-foreground-muted">Ação<select className={inputClass} value={action} onChange={(event) => setAction(event.target.value)}><option value="">Todas as ações</option>{[...new Set(events.map((event) => event.action))].map((name) => <option key={name}>{name}</option>)}</select></label>
            <label className="space-y-1 text-xs text-foreground-muted">De<input type="date" className={inputClass} value={start} onChange={(event) => setStart(event.target.value)} /></label>
            <label className="space-y-1 text-xs text-foreground-muted">Até<input type="date" className={inputClass} value={end} onChange={(event) => setEnd(event.target.value)} /></label>
            <button className={`${buttonClass} self-end`} onClick={() => { setFilters(defaultFilters); setPage(1); }}>Limpar filtros</button>
          </div>
          {invalidPeriod && <p role="alert" className="mb-3 text-xs text-red-600 dark:text-red-300">A data final deve ser igual ou posterior à inicial.</p>}
          {audit.isPending ? <p role="status" className="py-8 text-center text-sm text-foreground-muted">Carregando registros...</p> : audit.isError ? <div role="alert"><p>Não foi possível carregar o histórico.</p><button className={buttonClass} onClick={() => void audit.refetch()}>Tentar novamente</button></div> :
            <div className="relative overflow-x-auto rounded-lg border border-line"><table className="w-full min-w-[570px] text-left text-xs"><caption className="sr-only">Registros demonstrativos de auditoria</caption><thead className="bg-surface-muted text-[10px] uppercase text-foreground-muted"><tr>{["Data/Hora", "Usuário / origem", "Ação / módulo", "Ações"].map((heading) => <th scope="col" className="p-3" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">
              {visibleEvents.map((event) => <tr key={event.id} className="text-foreground"><td className={`whitespace-nowrap ${cellClass}`}>{formatDate(event.occurredAt)}</td><td className={cellClass}><p>{event.userName}</p><p className="mt-1 text-[10px] text-foreground-muted">Responsável: {event.responsible}</p></td><td className={cellClass}><p className="font-medium">{event.action}</p><p className="mt-1 text-[10px] text-foreground-muted">{event.module}</p></td><td className={cellClass}><button onClick={() => openDetails(event)} className="whitespace-nowrap font-semibold text-blue-600 hover:underline focus-visible:outline-2 dark:text-blue-300">Ver detalhes<span className="sr-only">: {event.action}</span></button></td></tr>)}
              {filtered.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-foreground-muted">Nenhum registro encontrado para os filtros selecionados.</td></tr>}
            </tbody></table></div>}
          {preferences.global.showRowSummary && <p className="mt-3 text-xs text-foreground-muted" role="status">{visibleEvents.length} de {filtered.length} registros filtrados; {events.length} no total.</p>}
          {preferences.global.automaticPagination && filtered.length > 0 && <nav aria-label="Paginação da auditoria" className="mt-3 flex flex-wrap items-center gap-3"><button className={buttonClass} disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><span className="text-xs text-foreground-muted">Página {currentPage} de {pageCount}</span><button className={buttonClass} disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Próxima</button></nav>}
        </CartaoSecao>
      </div>
      <div className="rounded-xl border border-line bg-surface-raised p-3 shadow-sm"><Link href="/configuracoes" className={buttonClass}><ArrowLeft className="h-4 w-4" />Voltar às configurações</Link></div>

      <dialog ref={dialogRef} aria-labelledby="audit-dialog-title" className="fixed inset-0 m-auto max-h-[85vh] w-[min(520px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-surface-raised p-6 text-foreground shadow-2xl backdrop:bg-slate-950/60" onKeyDown={(event) => { if (event.key === "Escape") dialogRef.current?.close(); }} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        <div className="mb-5 flex items-center justify-between gap-4"><h2 id="audit-dialog-title" className="text-lg font-bold">{selected && ("action" in selected ? selected.action : selected.name)}</h2><button className={buttonClass} aria-label="Fechar detalhes" onClick={() => dialogRef.current?.close()}><X className="h-4 w-4" /></button></div>
        {selected && ("action" in selected ? <dl className="space-y-4 text-sm">{[["Usuário vinculado", selected.userName], ["Responsável pela ação", selected.responsible], ["Módulo", selected.module], ["Data e horário", formatDate(selected.occurredAt)], ["Descrição", selected.description], ["IP registrado (demonstração)", selected.ipAddress]].map(([label, value]) => <div key={label}><dt className="text-xs text-foreground-muted">{label}</dt><dd className="mt-1">{value || "Não informado"}</dd></div>)}</dl> : <div className="space-y-4 text-sm"><p>{selected.description}</p><p className="text-foreground-muted">Categoria: {selected.category}</p><p className="rounded-lg bg-surface-muted p-4 leading-6">Integração prevista na referência visual, ainda indisponível nesta aplicação. Nenhuma conexão externa foi estabelecida. Configuração de credenciais e sincronização dependem da implementação de um conector no backend.</p><p className="text-xs text-foreground-muted">Última sincronização: não disponível.</p></div>)}
      </dialog>
    </div>
  );
}

