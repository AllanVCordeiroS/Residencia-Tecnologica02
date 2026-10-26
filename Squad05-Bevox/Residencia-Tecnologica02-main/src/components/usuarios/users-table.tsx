"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Building2, Eye, Mail, MoreVertical, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";
import { Avatar } from "./avatar";
import { PerfilBadge, StatusBadge } from "./badges";
import type { Usuario } from "@/types/usuarios";

interface Props {
  usuarios: Usuario[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

function RowMenu({ usuario, onDelete, onToggleStatus }: { usuario: Usuario; onDelete: () => void; onToggleStatus: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Mais ações" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={iconBtn}>
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          <button
            role="menuitem"
            type="button"
            onClick={() => { onToggleStatus(); setOpen(false); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Power className="h-4 w-4" />
            {usuario.status === "inativo" ? "Reativar" : "Desativar"}
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => { onDelete(); setOpen(false); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

export function UsersTable({ usuarios, onDelete, onToggleStatus }: Props) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const todos = usuarios.length > 0 && usuarios.every((u) => selecionados.has(u.id));

  const toggleTodos = () => setSelecionados(todos ? new Set() : new Set(usuarios.map((u) => u.id)));
  const toggleUm = (id: string) =>
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
  const check = "h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500";

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="w-12 px-4 py-3">
              <input type="checkbox" aria-label="Selecionar todos" checked={todos} onChange={toggleTodos} className={check} />
            </th>
            <th className={th}>Usuário</th>
            <th className={`${th} hidden xl:table-cell`}>Cargo</th>
            <th className={th}>Perfil de acesso</th>
            <th className={th}>Unidade(s)</th>
            <th className={th}>Status</th>
            <th className={th}>Último acesso</th>
            <th className={`${th} text-right`}>Ações</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-16 text-center text-sm text-slate-500">
                Nenhum usuário encontrado. Ajuste a busca ou os filtros.
              </td>
            </tr>
          )}

          {usuarios.map((u) => (
            <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Selecionar ${u.nome}`}
                  checked={selecionados.has(u.id)}
                  onChange={() => toggleUm(u.id)}
                  className={check}
                />
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar nome={u.nome} tone={u.avatarTone} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0B1B3F]">{u.nome}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
              </td>

              <td className="hidden px-4 py-3 text-sm text-slate-600 xl:table-cell">{u.cargo}</td>

              <td className="px-4 py-3">
                <PerfilBadge perfil={u.perfil} />
              </td>

              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {u.unidade}
                </span>
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={u.status} />
              </td>

              <td className="px-4 py-3 text-sm text-slate-600">{u.ultimoAcesso ?? "—"}</td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {u.status === "convite_pendente" ? (
                    <button type="button" aria-label="Reenviar convite" title="Reenviar convite" className={iconBtn}>
                      <Mail className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link href={`/usuarios/${u.id}`} aria-label={`Ver ${u.nome}`} title="Ver detalhes" className={iconBtn}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}

                  {u.status === "inativo" ? (
                    <button
                      type="button"
                      aria-label="Reativar usuário"
                      title="Reativar"
                      onClick={() => onToggleStatus(u.id)}
                      className={iconBtn}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link href={`/usuarios/${u.id}/editar`} aria-label={`Editar ${u.nome}`} title="Editar" className={iconBtn}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}

                  <RowMenu usuario={u} onDelete={() => onDelete(u.id)} onToggleStatus={() => onToggleStatus(u.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
