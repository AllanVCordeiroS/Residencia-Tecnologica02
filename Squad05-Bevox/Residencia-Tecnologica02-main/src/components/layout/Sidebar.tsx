"use client";

import Link from "next/link";
import Image from "next/image";
import { useId } from "react";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, LogOut, Pin, PinOff } from "lucide-react";

import { navGroups } from "@/config/navigation";
import { useSessionUser } from "@/hooks/useSessionUser";
import { empresaDemo } from "@/data/mockData";
import { useAuth } from "@/providers/AuthProvider";
import styles from "./Sidebar.module.css";

export default function Sidebar({
  onNavigate,
  collapsed = false,
  pinned = false,
  onTogglePin,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
}) {
  const navigationId = useId();
  const pathname = usePathname();
  const { logout, loggingOut, error: logoutError } = useAuth();
  const usuario = useSessionUser();

  function handleLogout() {
    void logout();
  }

  return (
    <div data-collapsed={collapsed} className={`${styles.sidebar} flex h-full min-h-0 flex-col bg-navy-950 text-slate-300`}>
      {/* Marca -> Adicionar a foto da Bevox. Ass: Breno */}
      <div aria-label="BEVOX Backoffice ERP" title="BEVOX Backoffice ERP" className={`${styles.brand} flex shrink-0 items-center gap-3 px-5 pt-5`}>
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/15">
          <Image
            src="/bevox-logo-oficial.png"
            alt=""
            fill
            sizes="44px"
            className="object-contain p-0.5"
          />
        </span>

        <div className={`${styles.expandedOnly} leading-tight`}>
          <p className="text-[17px] font-extrabold tracking-wide text-white">
            BEVOX
          </p>
          <p className="text-[11px] tracking-wide text-slate-400">
            BACKOFFICE ERP
          </p>
        </div>
      </div>

      {onTogglePin && (
        <div className={`${styles.pinRow} mt-2 shrink-0 px-5`}>
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={pinned ? "Desafixar menu lateral" : "Fixar menu lateral"}
            title={pinned ? "Desafixar menu lateral" : "Fixar menu lateral"}
            aria-pressed={pinned}
            aria-expanded={!collapsed}
            aria-controls={navigationId}
            className={`flex h-8 w-full items-center justify-center gap-2 rounded-lg text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${pinned ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
          >
            {pinned ? <PinOff className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Pin className="h-4 w-4 shrink-0" aria-hidden="true" />}
            <span className={styles.expandedOnly}>{pinned ? "Menu fixado" : "Fixar menu"}</span>
          </button>
        </div>
      )}

      {/* Empresa: apenas visual, Colocar uma interação de menu e adicionar a imagem da Adega. Ass: Breno */}
      <div className={`${styles.company} mx-4 mt-5 shrink-0`}>
        <div
          aria-label={`Empresa ${empresaDemo.nome}`}
          title={`Empresa ${empresaDemo.nome}`}
          className={`${styles.companyCard} flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left`}
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#101c31] ring-1 ring-white/10">
            <Image
              src="/adega-distribution.jpg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>

          <span className={`${styles.expandedOnly} min-w-0 flex-1 leading-tight`}>
            <span className="block truncate text-[13px] font-semibold text-white">
              {empresaDemo.nome}
            </span>

            <span className="block truncate text-[11px] text-amber-400">
              Empresa {empresaDemo.status} • {empresaDemo.sede}
            </span>
          </span>

          <ChevronsUpDown
            className={`${styles.expandedOnly} h-4 w-4 shrink-0 text-slate-400`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Navegação */}
      <nav
        id={navigationId}
        aria-label="Menu principal"
        className={`${styles.navigation} mt-4 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4`}
      >
        {navGroups.map((grupo) => (
          <div key={grupo.label} className="mb-4">
            <p className={`${styles.expandedOnly} ${styles.groupLabel} px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-blue-400`}>
              {grupo.label}
            </p>

            <ul className="space-y-1">
              {grupo.items.map(({ href, label, icon: Icon }) => {
                const ativo =
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(`${href}/`));

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-label={label}
                      title={label}
                      aria-current={ativo ? "page" : undefined}
                      className={`${styles.navLink} flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                        ativo
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Icon
                        className="h-[18px] w-[18px] shrink-0"
                        aria-hidden="true"
                      />
                      <span className={styles.expandedOnly}>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Usuário */}
      <div aria-label={`Usuário ${usuario.nome}, ${usuario.perfil}`} title={`${usuario.nome} • ${usuario.perfil}`} className={`${styles.userFooter} flex shrink-0 items-center gap-3 border-t border-white/10 px-5 py-4`}>
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[12px] font-bold text-white ring-1 ring-white/15">
          {usuario.iniciais}

          <span
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy-950 bg-emerald-500"
            aria-hidden="true"
          />
        </span>

        <span className={`${styles.expandedOnly} min-w-0 flex-1 leading-tight`}>
          <span className="block truncate text-[13px] font-semibold text-white">
            {usuario.nome}
          </span>

          <span className="block truncate text-[11px] text-slate-400">
            {usuario.perfil}
          </span>
        </span>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-busy={loggingOut}
          title={loggingOut ? "Encerrando sessão..." : "Sair"}
          aria-label="Sair da plataforma"
          className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors motion-reduce:transition-none hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {logoutError && <p role="alert" className="px-3 pb-3 text-xs text-red-300">{logoutError}</p>}
    </div>
  );
}
