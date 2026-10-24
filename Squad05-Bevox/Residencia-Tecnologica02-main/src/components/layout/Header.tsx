
"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  SlidersHorizontal,
} from "lucide-react";

import { tituloDaRota } from "@/config/navigation";
import { empresaDemo, usuarioDemo } from "@/data/mockData";

const focoBotao =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export default function Header({
  onAbrirMenu,
}: {
  onAbrirMenu: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
      {/* Navegação */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menu de navegação"
          className={`rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden ${focoBotao}`}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-2 text-[14px] text-slate-500">
            <li className="hidden sm:block">
              <span className="text-slate-500">BEVOX</span>
            </li>

            <li
              aria-hidden="true"
              className="hidden text-slate-300 sm:block"
            >
              /
            </li>

            <li className="hidden font-semibold text-slate-900 md:block">
              {empresaDemo.nome}
            </li>

            <li
              aria-hidden="true"
              className="hidden text-slate-300 md:block"
            >
              /
            </li>

            <li
              aria-current="page"
              className="truncate font-medium text-blue-600"
            >
              {tituloDaRota(pathname)}
            </li>
          </ol>
        </nav>
      </div>

      {/* Cabeçalho */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Sininho apenas visual, por enquanto. Ass: Breno */}
        <span
          title="Notificações"
          className="relative rounded-lg p-2.5 text-slate-500"
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
          className="rounded-lg p-2.5 text-slate-500"
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
            <span className="block text-[14px] font-semibold text-slate-900">
              {usuarioDemo.nome}
            </span>

            <span className="block text-[12px] text-slate-500">
              {usuarioDemo.perfil}
            </span>
          </span>

          <ChevronDown
            className="hidden h-4 w-4 text-slate-400 sm:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
}
