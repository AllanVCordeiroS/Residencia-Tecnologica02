import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

type BotaoFiltroProps = {
  icon: LucideIcon;
  children: ReactNode;
};

// TODO (grupo): ligar ao filtro de período e de unidade quando houver dados.
export default function BotaoFiltro({ icon: Icon, children }: BotaoFiltroProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
      {children}
      <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
    </button>
  );
}