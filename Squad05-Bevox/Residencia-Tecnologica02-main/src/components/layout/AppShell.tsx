"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./Sidebar.module.css";

export default function AppShell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [sidebarFixada, setSidebarFixada] = useState(false);
  const [mouseNaSidebar, setMouseNaSidebar] = useState(false);
  const [focoNaSidebar, setFocoNaSidebar] = useState(false);
  const sidebarExpandida = sidebarFixada || mouseNaSidebar || focoNaSidebar;
  const pathname = usePathname();

  // Fecha o menu móvel ao trocar de rota (ajuste de estado durante a renderização).
  const [rotaAnterior, setRotaAnterior] = useState(pathname);
  if (rotaAnterior !== pathname) {
    setRotaAnterior(pathname);
    setMenuAberto(false);
  }

  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setMenuAberto(false);
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  return (
    <div data-sidebar-expanded={sidebarExpandida} className={`${styles.shell} min-h-screen bg-surface text-slate-900 dark:text-foreground`}>
      {/* Sidebar fixa (desktop) */}
      <aside
        aria-label="Navegação lateral"
        className={`${styles.desktopSidebar} fixed inset-y-0 left-0 z-40 hidden lg:block`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setMouseNaSidebar(true);
        }}
        onPointerLeave={() => setMouseNaSidebar(false)}
        onPointerDownCapture={() => setFocoNaSidebar(false)}
        onFocusCapture={(event) => setFocoNaSidebar(event.target.matches(":focus-visible"))}
        onKeyDownCapture={() => setFocoNaSidebar(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocoNaSidebar(false);
        }}
      >
        <Sidebar
          collapsed={!sidebarExpandida}
          pinned={sidebarFixada}
          onTogglePin={() => setSidebarFixada((fixada) => !fixada)}
        />
      </aside>

      {/* Sidebar móvel */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-slate-950/60"
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <Sidebar onNavigate={() => setMenuAberto(false)} />
          </div>
        </div>
      )}

      <div className={`${styles.content} flex min-h-screen min-w-0 flex-col`}>
        <Header onAbrirMenu={() => setMenuAberto(true)} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        {footer}
      </div>
    </div>
  );
}
