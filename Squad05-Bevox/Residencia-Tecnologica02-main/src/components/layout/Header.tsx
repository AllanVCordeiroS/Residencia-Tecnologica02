
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  ExternalLink,
  Menu,
  Moon,
  SlidersHorizontal,
  Sun,
} from "lucide-react";

import { useSessionUser } from "@/hooks/useSessionUser";
import { tituloDaRota } from "@/config/navigation";
import { empresaDemo } from "@/data/mockData";
import { alertasDemo } from "@/data/mockData";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";

const focoBotao =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export default function Header({
  onAbrirMenu,
}: {
  onAbrirMenu: () => void;
}) {
  const pathname = usePathname();
  const { logout, loggingOut, error: logoutError } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const usuario = useSessionUser();
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [notificacoesLidas, setNotificacoesLidas] = useState<string[]>([]);
  const notificacoesRef = useRef<HTMLDivElement>(null);
  const perfilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fecharMenus = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificacoesRef.current?.contains(target)) setNotificacoesAbertas(false);
      if (!perfilRef.current?.contains(target)) setPerfilAberto(false);
    };
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificacoesAbertas(false);
        setPerfilAberto(false);
      }
    };
    document.addEventListener("mousedown", fecharMenus);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("mousedown", fecharMenus);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  const naoLidas = alertasDemo.filter((alerta) => !notificacoesLidas.includes(alerta.id));
  const sair = () => { void logout(); };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/95 dark:bg-surface-raised/95 px-4 backdrop-blur sm:px-8">
      {/* Navegação */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menu de navegação"
          className={`rounded-lg p-2 text-slate-600 dark:text-foreground-muted hover:bg-slate-100 dark:hover:bg-surface-muted lg:hidden ${focoBotao}`}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-2 text-[14px] text-slate-500 dark:text-foreground-muted">
            <li className="hidden sm:block">
              <span className="text-slate-500 dark:text-foreground-muted">BEVOX</span>
            </li>

            <li
              aria-hidden="true"
              className="hidden text-slate-300 dark:text-foreground-muted sm:block"
            >
              /
            </li>

            <li className="hidden font-semibold text-slate-900 dark:text-foreground md:block">
              {empresaDemo.nome}
            </li>

            <li
              aria-hidden="true"
              className="hidden text-slate-300 dark:text-foreground-muted md:block"
            >
              /
            </li>

            <li
              aria-current="page"
              className="truncate font-medium text-blue-600 dark:text-blue-300"
            >
              {tituloDaRota(pathname)}
            </li>
          </ol>
        </nav>
      </div>

      {/* Cabeçalho */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          title={resolvedTheme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          aria-label={resolvedTheme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          aria-pressed={resolvedTheme === "dark"}
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          className={`rounded-lg p-2.5 text-slate-500 dark:text-foreground-muted hover:bg-slate-100 dark:hover:bg-surface-muted ${focoBotao}`}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        <div ref={notificacoesRef} className="relative">
          <button type="button" title="Notificações" aria-label="Abrir notificações" aria-expanded={notificacoesAbertas} onClick={() => { setNotificacoesAbertas((aberta) => !aberta); setPerfilAberto(false); }} className={`relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 dark:text-foreground-muted dark:hover:bg-surface-muted ${focoBotao}`}>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {naoLidas.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-raised" aria-hidden="true" />}
          </button>
          {notificacoesAbertas && <div className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface-raised shadow-xl shadow-slate-900/15"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="text-sm font-bold text-foreground">Notificações</h2><p className="mt-0.5 text-[11px] text-foreground-muted">{naoLidas.length} não lidas</p></div>{naoLidas.length > 0 && <button type="button" onClick={() => setNotificacoesLidas(alertasDemo.map((alerta) => alerta.id))} className="text-[11px] font-semibold text-blue-600 dark:text-blue-300">Marcar todas como lidas</button>}</div><ul className="max-h-80 overflow-y-auto divide-y divide-line">{alertasDemo.map((alerta) => { const lida = notificacoesLidas.includes(alerta.id); return <li key={alerta.id} className={`flex gap-3 px-4 py-3 ${lida ? "opacity-60" : "bg-blue-50/50 dark:bg-blue-950/20"}`}><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">{alerta.titulo}</p><p className="mt-1 text-[11px] leading-4 text-foreground-muted">{alerta.descricao}</p></div>{!lida && <button type="button" title="Marcar como lida" aria-label={`Marcar ${alerta.titulo} como lida`} onClick={() => setNotificacoesLidas((lidas) => [...lidas, alerta.id])} className="self-start rounded-md p-1 text-slate-400 hover:text-emerald-600"><Check className="h-4 w-4" /></button>}</li>; })}</ul><Link href="/configuracoes/notificacoes" onClick={() => setNotificacoesAbertas(false)} className="flex items-center justify-center gap-2 border-t border-line px-4 py-3 text-xs font-semibold text-blue-600 dark:text-blue-300"><ExternalLink className="h-3.5 w-3.5" /> Notificações</Link></div>}
        </div>
        {/* Sininho visual legado, mantido fora do fluxo. */}
        <span
          title="Notificações"
          className="hidden"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />

          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            aria-hidden="true"
          />
        </span>

        {/* Configurações, apenas o icone, vou ajustar. Ass: Breno */}
        <span
          title="Configurações"
          className="hidden"
        >
          <SlidersHorizontal
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <Link href="/configuracoes" title="Configurações" aria-label="Abrir configurações" className={`rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 dark:text-foreground-muted dark:hover:bg-surface-muted ${focoBotao}`}>
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
        </Link>

        <span
          className="mx-1 hidden h-8 w-px bg-line sm:block"
          aria-hidden="true"
        />

        {/* Usuario, Vou criar um menu aqui. Ass: Breno  */}
        <div
          ref={perfilRef}
          aria-label={`Perfil de ${usuario.nome}`}
          className="relative flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-surface-muted"
          onClick={() => { setPerfilAberto((aberto) => !aberto); setNotificacoesAbertas(false); }}
          role="button"
          tabIndex={0}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-[12px] font-bold text-white">
            {usuario.iniciais}
          </span>

          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[14px] font-semibold text-slate-900 dark:text-foreground">
              {usuario.nome}
            </span>

            <span className="block text-[12px] text-slate-500 dark:text-foreground-muted">
              {usuario.perfil}
            </span>
          </span>

          <ChevronDown
            className="hidden h-4 w-4 text-slate-400 dark:text-foreground-muted sm:block"
            aria-hidden="true"
          />
          {perfilAberto && (
            <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-line bg-surface-raised p-2 text-left shadow-xl shadow-slate-900/15">
              <div className="border-b border-line px-3 pb-3 pt-2"><p className="text-sm font-bold text-foreground">{usuario.nome}</p><p className="mt-1 text-xs text-foreground-muted">{usuario.perfil}</p></div>
              <Link href="/usuarios" onClick={(event) => { event.stopPropagation(); setPerfilAberto(false); }} className="mt-2 block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-surface-muted">Usuários e permissões</Link>
              <Link href="/configuracoes" onClick={(event) => { event.stopPropagation(); setPerfilAberto(false); }} className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-surface-muted">Configurações da plataforma</Link>
              <button type="button" disabled={loggingOut} aria-busy={loggingOut} onClick={(event) => { event.stopPropagation(); sair(); }} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30">{loggingOut ? "Encerrando sessão..." : "Sair da plataforma"}</button>
              {logoutError && <p role="alert" className="px-3 py-2 text-xs text-red-600 dark:text-red-300">{logoutError}</p>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
