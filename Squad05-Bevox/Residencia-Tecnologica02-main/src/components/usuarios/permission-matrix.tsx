"use client";

import { Banknote, CheckSquare, ChevronDown, FileText, Info, LayoutDashboard, ListChecks, ShieldCheck, Users, UserCog, type LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ACOES, MODULOS, PERFIS, type Acao, type Modulo, type Perfil, type Permissoes } from "@/types/usuarios";

const MODULO_ICON: Record<Modulo, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Documentos: FileText,
  Tarefas: ListChecks,
  "Licenças e Alvarás": ShieldCheck,
  Financeiro: Banknote,
  Usuários: Users,
};

const ACAO_LABEL: Record<Acao, string> = {
  visualizar: "Visualizar",
  criar: "Criar",
  editar: "Editar",
  excluir: "Excluir",
};

interface Props {
  perfil: Perfil;
  onPerfilChange: (p: Perfil) => void;
  permissoes: Permissoes;
  onToggle: (modulo: Modulo, acao: Acao, value: boolean) => void;
}

export function PermissionMatrix({ perfil, onPerfilChange, permissoes, onToggle }: Props) {
  const grid = "grid grid-cols-[minmax(0,1fr)_repeat(4,52px)] items-center";

  return (
    <section className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0B1B3F]">Matriz de permissões</h2>
          <p className="text-sm text-slate-600">Ative ou desative as permissões do perfil selecionado.</p>
        </div>
      </div>

      <div className="relative mt-5">
        <UserCog className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <select
          aria-label="Perfil de acesso"
          value={perfil}
          onChange={(e) => onPerfilChange(e.target.value as Perfil)}
          className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm font-semibold text-[#0B1B3F] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PERFIS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      <div className="mt-5">
        <div className={`${grid} border-b border-slate-100 pb-2 text-[11px] font-semibold text-slate-500`}>
          <span>Módulo</span>
          {ACOES.map((a) => (
            <span key={a} className="text-center">{ACAO_LABEL[a]}</span>
          ))}
        </div>

        {MODULOS.map((modulo) => {
          const Icon = MODULO_ICON[modulo];
          return (
            <div key={modulo} className={`${grid} border-b border-slate-100 py-3 last:border-b-0`}>
              <span className="flex items-center gap-2 pr-2 text-sm text-slate-700">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                {modulo}
              </span>
              {ACOES.map((acao) => (
                <span key={acao} className="flex justify-center">
                  <Switch
                    size="sm"
                    checked={permissoes[modulo][acao]}
                    onChange={(v) => onToggle(modulo, acao, v)}
                    label={`${ACAO_LABEL[acao]} em ${modulo}`}
                  />
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        As permissões podem ser personalizadas conforme a necessidade da sua empresa.
      </div>
    </section>
  );
}
