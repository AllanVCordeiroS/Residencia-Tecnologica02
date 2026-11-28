"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Globe, Grid3x3, List, Rows3, Save, SlidersHorizontal, UserRound } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { interfacePreferencesSchema, type InterfacePreferences } from "@/schemas/preferences";
import { DEFAULT_INTERFACE_PREFERENCES, readInterfacePreferences, saveInterfacePreferences, formatPreferenceDate } from "@/services/settings";

const inputClass = "w-full rounded-lg border border-line bg-surface-raised px-3 py-2.5 text-xs text-foreground focus:outline-2 focus:outline-blue-600";
const choiceClass = "flex min-h-16 flex-1 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-xs focus-visible:outline-2 focus-visible:outline-blue-600";
function Field({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="block space-y-1.5 text-xs font-medium text-foreground"><span>{label}</span><select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{option === "inherit" ? "Usar padrão global" : option === "pt-BR" ? "Português - BR" : option}</option>)}</select></label>;
}
function Toggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return <div className="space-y-2"><span className="block text-xs font-medium text-foreground">{label}</span><button type="button" role="switch" aria-checked={enabled} aria-label={label} onClick={() => onChange(!enabled)} className="flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-blue-600"><span className={`h-5 w-9 rounded-full p-0.5 ${enabled ? "bg-blue-600" : "bg-slate-400"}`}><span className={`block size-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : ""}`} /></span><span className="text-xs text-foreground-muted">{enabled ? "Sim" : "Não"}</span></button></div>;
}
function Card({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-line bg-surface-raised p-5 shadow-sm"><div className="mb-5 flex items-start gap-3"><span className="text-blue-600 dark:text-blue-300">{icon}</span><div><h2 className="text-sm font-bold text-foreground">{title}</h2><p className="mt-1 text-xs text-foreground-muted">{description}</p></div></div>{children}</section>;
}
export default function PreferenciasSistema() {
  const { theme } = useTheme();
  const [data, setData] = useState(DEFAULT_INTERFACE_PREFERENCES);
  const [baseline, setBaseline] = useState(DEFAULT_INTERFACE_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const guard = useUnsavedChanges({ dirty: ready && JSON.stringify(data) !== JSON.stringify(baseline) });
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      try {
        const stored = readInterfacePreferences();
        if (active) { setData(stored); setBaseline(stored); setReady(true); }
      } catch { if (active) setMessage("Não foi possível carregar as preferências. Os dados locais foram preservados. Recarregue para tentar novamente."); }
    });
    return () => { active = false; };
    // Load the draft once; theme changes from this form are committed only on Save.
  }, []);
  function global<K extends keyof InterfacePreferences["global"]>(key: K, value: InterfacePreferences["global"][K]) { setData((old) => ({ ...old, global: { ...old.global, [key]: value } })); setMessage(""); }
  function user<K extends keyof InterfacePreferences["user"]>(key: K, value: InterfacePreferences["user"][K]) { setData((old) => ({ ...old, user: { ...old.user, [key]: value } })); setMessage(""); }
  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    // Theme remains owned by the global control, including changes while this draft is open.
    const parsed = interfacePreferencesSchema.safeParse({ ...data, user: { ...data.user, theme } });
    if (!parsed.success) { setMessage("Revise as opções selecionadas antes de salvar."); return; }
    try { saveInterfacePreferences(parsed.data); setData(parsed.data); setBaseline(parsed.data); setMessage("Preferências salvas neste navegador."); }
    catch { setMessage("Não foi possível salvar. Verifique o espaço e a permissão de armazenamento do navegador."); }
  }
  return <form onSubmit={save} className="mx-auto w-full max-w-6xl space-y-5 p-3 sm:p-6">
    <header className="flex items-center gap-3"><span className="rounded-lg bg-blue-600 p-2 text-white"><SlidersHorizontal size={20} /></span><div><h1 className="text-xl font-bold text-foreground">Preferências do Sistema</h1><p className="text-xs text-foreground-muted">Gerencie as preferências globais e individuais do sistema.</p></div></header>
    <p className="text-xs text-foreground-muted">Padrões globais neste navegador; preferências pessoais vinculadas à sessão local. Aplicáveis à auditoria, à tabela de licenças e ao teste local de notificações. O tema usa o mecanismo existente.</p>
    {!ready && !message && <p role="status">Carregando preferências...</p>}
    <fieldset disabled={!ready} className="min-w-0 space-y-5 disabled:opacity-60">
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card title="Preferências Globais de Localização" description="Configurações aplicáveis a todas as unidades por padrão." icon={<Globe size={21} />}><div className="space-y-4">
          <Field label="Idioma do Sistema" value={data.global.language} options={["pt-BR"]} onChange={() => global("language", "pt-BR")} />
          <Field label="Formato de Data" value={data.global.dateFormat} options={["DD/MM/AAAA", "AAAA-MM-DD"]} onChange={(v) => global("dateFormat", v as InterfacePreferences["global"]["dateFormat"])} />
          <Field label="Fuso Horário Padrão" value={data.global.timeZone} options={interfacePreferencesSchema.shape.global.shape.timeZone.options} onChange={(v) => global("timeZone", v as InterfacePreferences["global"]["timeZone"])} />
        </div></Card>
        <Card title="Visualização e Comportamento de Tabelas" description="Padrões de renderização e interação com tabelas." icon={<Grid3x3 size={21} />}><div className="grid gap-5 sm:grid-cols-2">
          <Toggle label="Paginação Automática" enabled={data.global.automaticPagination} onChange={(v) => global("automaticPagination", v)} />
          <Toggle label="Manter Filtros após Atualizar" enabled={data.global.keepFiltersAfterRefresh} onChange={(v) => global("keepFiltersAfterRefresh", v)} />
          <Toggle label="Exibir Resumo de Linhas" enabled={data.global.showRowSummary} onChange={(v) => global("showRowSummary", v)} />
          <div><span className="text-xs font-medium text-foreground">Visualização de Tabelas</span><div className="mt-2 flex gap-2">{(["compact", "standard"] as const).map((value) => <button key={value} type="button" aria-pressed={data.global.tableView === value} onClick={() => global("tableView", value)} className={`${choiceClass} ${data.global.tableView === value ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "border-line text-foreground-muted"}`}>{value === "compact" ? <List size={21} /> : <Rows3 size={21} />}{value === "compact" ? "Lista Compacta" : "Lista Padrão"}</button>)}</div></div>
        </div></Card>
      </div>
      <Card title="Preferências Individuais do Usuário" description="Suas configurações pessoais que sobrescrevem os padrões globais apenas para você." icon={<UserRound size={21} />}><div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-5"><Field label="Idioma de Exibição Pessoal" value={data.user.language} options={["inherit", "pt-BR"]} onChange={(v) => user("language", v as InterfacePreferences["user"]["language"])} /><Toggle label="Exibir Alertas Visuais" enabled={data.user.showVisualAlerts} onChange={(v) => user("showVisualAlerts", v)} /></div>
        <Field label="Formato de Data Pessoal" value={data.user.dateFormat} options={["inherit", "DD/MM/AAAA", "AAAA-MM-DD"]} onChange={(v) => user("dateFormat", v as InterfacePreferences["user"]["dateFormat"])} />
        <Toggle label="Ativar Sons de Notificação" enabled={data.user.playNotificationSounds} onChange={(v) => user("playNotificationSounds", v)} />
      </div></Card>
      <p className="text-xs text-foreground-muted">Exemplo de data: {formatPreferenceDate("2026-11-26T15:30:00Z", data, true)}. Sem tradução adicional ou conexão externa.</p>
    </fieldset>
    <div className="flex flex-wrap gap-3"><button type="button" onClick={() => guard.requestNavigation("/configuracoes")} className="flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-4 py-2 text-xs text-foreground"><ArrowLeft size={16} />Voltar</button><button disabled={!ready} type="submit" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs text-white disabled:opacity-50"><Save size={16} />Salvar Alterações</button></div>
    <p role="status" aria-live="polite" className="text-sm text-foreground">{message}</p>{guard.dialog}
  </form>;
}

