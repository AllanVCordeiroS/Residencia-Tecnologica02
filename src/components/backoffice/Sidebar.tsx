import type { ComponentType } from "react";
import {
  BeerIcon,
  BuildingIcon,
  ChartColumnIcon,
  ChevronsUpDownIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
  type IconProps,
} from "./icons";

type NavItem = {
  label: string;
  icon: ComponentType<IconProps>;
  active?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    title: "Principal",
    items: [{ label: "Dashboard Geral", icon: LayoutDashboardIcon }],
  },
  {
    title: "Gestão Corporativa",
    items: [
      { label: "Gestão de Unidades", icon: BuildingIcon, active: true },
      { label: "Documentos", icon: FileTextIcon },
      { label: "Licenças e Alvarás", icon: ShieldCheckIcon },
      { label: "Tarefas", icon: ClipboardCheckIcon },
    ],
  },
  {
    title: "Operações e Resultados",
    items: [
      { label: "Gestão Operacional", icon: TruckIcon },
      { label: "Gestão Financeira", icon: CreditCardIcon },
      { label: "Relatórios e Indicadores", icon: ChartColumnIcon },
    ],
  },
  {
    title: "Administração",
    items: [
      { label: "Usuários e Permissões", icon: UsersIcon },
      { label: "Configurações", icon: SettingsIcon },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 overflow-y-auto bg-[#0a1020] px-3 py-5 text-slate-300 lg:flex">
      {/* Marca */}
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0a1020]">
          <BeerIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-base font-extrabold tracking-tight text-white">BEVOX</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Backoffice ERP
          </p>
        </div>
      </div>

      {/* Empresa ativa */}
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 text-left transition hover:bg-white/10"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a2236] text-xs font-extrabold text-amber-400 ring-1 ring-amber-400/30">
          AD
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-bold text-white">
            Adega Distribution
          </span>
          <span className="block text-[11px] font-medium text-amber-400">
            Empresa Ativa • Matriz
          </span>
        </span>
        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {/* Navegação */}
      <nav aria-label="Menu principal" className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-blue-300/60">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <a
                      href="#"
                      aria-current={item.active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        item.active
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}