import { BellIcon, ChevronDownIcon, SlidersHorizontalIcon } from "./icons";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Caminho da empresa */}
      <nav aria-label="Localização" className="flex items-center gap-2 text-sm">
        <span className="text-xs font-semibold text-slate-500">BEVOX</span>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-[#0b1530]">Adega Distribution</span>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-cyan-600">Gestão de Unidades</span>
      </nav>

      {/* Ações e usuário */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          aria-label="Notificações"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <BellIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Preferências"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <SlidersHorizontalIcon className="h-5 w-5" />
        </button>

        <span className="mx-2 hidden h-8 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          className="flex items-center gap-3 rounded-lg p-1.5 text-left transition hover:bg-slate-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a1020] text-xs font-extrabold text-white">
            RS
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold text-[#0b1530]">
              Ricardo Silveira
            </span>
            <span className="block text-xs text-slate-500">Administrador Geral</span>
          </span>
          <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}