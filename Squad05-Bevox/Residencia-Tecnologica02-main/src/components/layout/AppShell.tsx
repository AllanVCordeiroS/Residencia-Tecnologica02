"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
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
    <div className="min-h-screen bg-surface text-slate-900">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar />
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

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <Header onAbrirMenu={() => setMenuAberto(true)} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        {footer}
      </div>
    </div>
  );
}
