"use client";

import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { PERFIS, type Perfil, type StatusUsuario } from "@/types/usuarios";
import { UNIDADES } from "@/lib/usuarios-mock";

export type StatusFiltro = "todos" | StatusUsuario;

export interface FiltrosState {
  busca: string;
  perfil: "todos" | Perfil;
  unidade: "todas" | string;
  status: StatusFiltro;
}

interface Props {
  filtros: FiltrosState;
  onChange: (f: FiltrosState) => void;
  contagem: { todos: number; ativo: number; convite_pendente: number; inativo: number };
}

function Select({
  value,
  onChange,
  children,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full min-w-40 appearance-none rounded-lg border-0 bg-slate-50 pl-3 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

export function UsersFilters({ filtros, onChange, contagem }: Props) {
  const set = <K extends keyof FiltrosState>(k: K, v: FiltrosState[K]) => onChange({ ...filtros, [k]: v });

  const tabs: Array<{ key: StatusFiltro; label: string; count: number }> = [
    { key: "todos", label: "Todos os usuários", count: contagem.todos },
    { key: "ativo", label: "Ativos", count: contagem.ativo },
    { key: "convite_pendente", label: "Convites pendentes", count: contagem.convite_pendente },
    { key: "inativo", label: "Inativos", count: contagem.inativo },
  ];

  return (
    <div className="px-4 pt-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filtros.busca}
            onChange={(e) => set("busca", e.target.value)}
            placeholder="Buscar por nome, e-mail ou unidade..."
            className="h-11 w-full rounded-lg bg-slate-50 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Select label="Filtrar por perfil" value={filtros.perfil} onChange={(v) => set("perfil", v as FiltrosState["perfil"]) }>
          <option value="todos">Todos os perfis</option>
          {PERFIS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>

        <Select label="Filtrar por unidade" value={filtros.unidade} onChange={(v) => set("unidade", v)}>
          <option value="todas">Todas as unidades</option>
          {UNIDADES.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>

        <Select label="Filtrar por status" value={filtros.status} onChange={(v) => set("status", v as StatusFiltro)}>
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="convite_pendente">Convite pendente</option>
          <option value="inativo">Inativo</option>
        </Select>

        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>
      </div>

      <div role="tablist" className="mt-4 flex gap-6 overflow-x-auto border-b border-transparent">
        {tabs.map((t) => {
          const active = filtros.status === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => set("status", t.key)}
              className={cn(
                "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors",
                active ? "border-blue-600 font-semibold text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {t.label}
              <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-semibold", active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
