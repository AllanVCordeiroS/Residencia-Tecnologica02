
"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  SlidersHorizontal,
  Sun,
} from "lucide-react";

import { tituloDaRota } from "@/config/navigation";
import { empresaDemo, usuarioDemo } from "@/data/mockData";
import { useTheme } from "@/components/theme/ThemeProvider";

const focoBotao =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export default function Header({
  onAbrirMenu,
}: {
  onAbrirMenu: () => void;
}) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

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

        {/* Sininho apenas visual, por enquanto. Ass: Breno */}
        <span
          title="Notificações"
          className="relative rounded-lg p-2.5 text-slate-500 dark:text-foreground-muted"
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
          className="rounded-lg p-2.5 text-slate-500 dark:text-foreground-muted"
        >
          <SlidersHorizontal
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <span
          className="mx-1 hidden h-8 w-px bg-line sm:block"
          aria-hidden="true"
        />

        {/* Usuario, Vou criar um menu aqui. Ass: Breno  */}
        <div
          aria-label={`Perfil de ${usuarioDemo.nome}`}
          className="flex items-center gap-3 rounded-xl p-1.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-[12px] font-bold text-white">
            {usuarioDemo.iniciais}
          </span>

          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[14px] font-semibold text-slate-900 dark:text-foreground">
              {usuarioDemo.nome}
            </span>

            <span className="block text-[12px] text-slate-500 dark:text-foreground-muted">
              {usuarioDemo.perfil}
            </span>
          </span>

          <ChevronDown
            className="hidden h-4 w-4 text-slate-400 dark:text-foreground-muted sm:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
}
