import { Banknote, Lock, MessageSquare, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Perfil, StatusUsuario } from "@/types/usuarios";

const PERFIL_STYLE: Record<Perfil, { icon: LucideIcon; className: string }> = {
  "Administrador Geral": { icon: ShieldCheck, className: "bg-blue-100 text-blue-700" },
  "Gestor de Unidade": { icon: Lock, className: "bg-indigo-100 text-indigo-700" },
  Financeiro: { icon: Banknote, className: "bg-emerald-50 text-emerald-700" },
  Operacional: { icon: Lock, className: "bg-blue-50 text-blue-700" },
  Colaborador: { icon: MessageSquare, className: "bg-slate-100 text-slate-600" },
};

export function PerfilBadge({ perfil }: { perfil: Perfil }) {
  const { icon: Icon, className } = PERFIL_STYLE[perfil];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold", className)}>
      <Icon className="h-3.5 w-3.5" />
      {perfil}
    </span>
  );
}

const STATUS_STYLE: Record<StatusUsuario, { label: string; dot: string; className: string }> = {
  ativo: { label: "Ativo", dot: "bg-emerald-500", className: "bg-emerald-50 text-emerald-700" },
  convite_pendente: { label: "Convite pendente", dot: "bg-amber-500", className: "bg-amber-50 text-amber-700" },
  inativo: { label: "Inativo", dot: "bg-red-500", className: "bg-red-50 text-red-700" },
};

export function StatusBadge({ status }: { status: StatusUsuario }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
