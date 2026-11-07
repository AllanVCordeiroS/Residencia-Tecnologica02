import { ChevronDown, type LucideIcon } from "lucide-react";

type Opcao<T extends string> = { valor: T; rotulo: string };

type SelectFiltroProps<T extends string> = {
  icon: LucideIcon;
  rotuloAcessivel: string;
  valor: T;
  opcoes: Opcao<T>[];
  onChange: (valor: T) => void;
};

export default function SelectFiltro<T extends string>({
  icon: Icon,
  rotuloAcessivel,
  valor,
  opcoes,
  onChange,
}: SelectFiltroProps<T>) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
      <select
        aria-label={rotuloAcessivel}
        value={valor}
        onChange={(evento) => onChange(evento.target.value as T)}
        className="cursor-pointer appearance-none rounded-lg border border-line bg-white py-2.5 pl-10 pr-9 text-[13px] font-medium text-slate-700 shadow-sm outline-none transition hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
}