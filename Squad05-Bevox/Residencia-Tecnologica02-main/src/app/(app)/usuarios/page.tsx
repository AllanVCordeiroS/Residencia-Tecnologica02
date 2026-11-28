"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Lock, UserPlus, Users } from "lucide-react";
import { KpiCard } from "@/components/usuarios/kpi-card";
import { Pagination } from "@/components/usuarios/pagination";
import { UsersFilters, type FiltrosState } from "@/components/usuarios/users-filters";
import { UsersTable } from "@/components/usuarios/users-table";
import { useUserActionMutation, useUsersQuery, useUserActionsPending, useUserSaveSucceeded } from "@/hooks/queries/useUsersQuery";

const POR_PAGINA = 8;

export default function UsuariosPage() {
  const query = useUsersQuery();
  const usuarios = useMemo(() => query.data ?? [], [query.data]);
  const toggleMutation = useUserActionMutation("toggle");
  const deleteMutation = useUserActionMutation("delete");
  const actionsPending = useUserActionsPending();
  const saveSucceeded = useUserSaveSucceeded();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: "",
    perfil: "todos",
    unidade: "todas",
    status: "todos",
  });

  const filtrados = useMemo(() => {
    const q = filtros.busca.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (q && !`${u.nome} ${u.email} ${u.unidade} ${(u.unidadesAutorizadas ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
      if (filtros.perfil !== "todos" && u.perfil !== filtros.perfil) return false;
      if (filtros.unidade !== "todas" && u.unidade !== filtros.unidade && u.unidade !== "Todas as unidades" && !u.unidadesAutorizadas?.includes(filtros.unidade)) return false;
      if (filtros.status !== "todos" && u.status !== filtros.status) return false;
      return true;
    });
  }, [usuarios, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const contagem = {
    todos: usuarios.length,
    ativo: usuarios.filter((user) => user.status === "ativo").length,
    convite_pendente: usuarios.filter((user) => user.status === "convite_pendente").length,
    inativo: usuarios.filter((user) => user.status === "inativo").length,
  };

  const alterarFiltros = (f: FiltrosState) => {
    setFiltros(f);
    setPagina(1);
  };

  const excluir = (id: string) => {
    if (actionsPending || !window.confirm("Excluir este usuário da demonstração? Os dados serão restaurados ao recarregar.")) return;
    deleteMutation.mutate(id);
  };

  const alternarStatus = (id: string) => {
    if (!actionsPending) toggleMutation.mutate(id);
  };

  const inicio = filtrados.length === 0 ? 0 : (paginaAtual - 1) * POR_PAGINA + 1;
  const fim = Math.min(paginaAtual * POR_PAGINA, filtrados.length);

  return (
    <main className="mx-auto w-full max-w-[1200px]">
      <div className="mx-auto max-w-[1200px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Usuários e Permissões</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-foreground-muted">
              Gerencie os colaboradores, seus níveis de acesso, unidades vinculadas e a segurança da plataforma.
            </p>
          </div>
          <Link
            href="/usuarios/novo"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <UserPlus className="h-4 w-4" />
            Novo usuário
          </Link>
        </header>

        <section aria-label="Resumo" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Users}
            label="Total de usuários"
            value={contagem.todos}
            helper="Usuários nesta demonstração"
            iconWrapper="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
            helperClass="text-slate-600 dark:text-foreground-muted"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Usuários ativos"
            value={contagem.ativo}
            helper="Com acesso habilitado"
            iconWrapper="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-300"
            helperClass="text-emerald-700 dark:text-emerald-300"
          />
          <KpiCard
            icon={Clock}
            label="Convites pendentes"
            value={contagem.convite_pendente}
            helper="Aguardando ativação"
            iconWrapper="bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-300"
            helperClass="text-amber-700 dark:text-amber-300"
          />
          <KpiCard
            icon={Lock}
            label="Usuários inativos / bloqueados"
            value={contagem.inativo}
            helper="Sem acesso ao sistema"
            iconWrapper="bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-300"
            helperClass="text-red-700 dark:text-red-300"
          />
        </section>

        <section className="mt-5 rounded-xl border border-slate-200/70 dark:border-line/70 bg-white dark:bg-surface-raised shadow-sm">
          {saveSucceeded && <p role="status" className="px-4 pt-4 text-sm text-emerald-700 dark:text-emerald-300">Último cadastro ou edição salvo em memória. Nenhum convite foi enviado.</p>}
          <p className="px-4 pt-4 text-xs text-foreground-muted">Dados demonstrativos. Alterações nesta lista são mantidas apenas durante a navegação e não persistem ao recarregar.</p>
          {query.isPending && <p role="status" className="p-4 text-sm text-foreground-muted">Carregando usuários...</p>}
          {(toggleMutation.isError || deleteMutation.isError) && <p role="alert" className="p-4 text-sm text-red-600 dark:text-red-300">Não foi possível atualizar o usuário. Tente novamente.</p>}
          {actionsPending && <p role="status" className="p-4 text-sm text-foreground-muted">Atualizando demonstração...</p>}
          {query.isError && <div role="alert" className="p-4 text-sm text-red-600 dark:text-red-300">Não foi possível carregar os usuários. <button onClick={() => void query.refetch()} className="underline">Tentar novamente</button></div>}
          <UsersFilters filtros={filtros} onChange={alterarFiltros} contagem={contagem} />

          {!query.isPending && !query.isError && <UsersTable usuarios={visiveis} onDelete={excluir} onToggleStatus={alternarStatus} actionsPending={actionsPending} />}

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 dark:border-line px-4 py-4 sm:flex-row">
            <p className="text-sm text-slate-600 dark:text-foreground-muted">
              Mostrando <strong className="text-foreground">{inicio} – {fim}</strong> de{" "}
              <strong className="text-foreground">{filtrados.length}</strong> usuários
            </p>
            <Pagination page={paginaAtual} totalPages={totalPaginas} onChange={setPagina} />
          </footer>
        </section>
      </div>
    </main>
  );
}
