"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Lock, UserPlus, Users } from "lucide-react";
import { KpiCard } from "@/components/usuarios/kpi-card";
import { Pagination } from "@/components/usuarios/pagination";
import { UsersFilters, type FiltrosState } from "@/components/usuarios/users-filters";
import { UsersTable } from "@/components/usuarios/users-table";
import { RESUMO_MOCK, USUARIOS_MOCK } from "@/lib/usuarios-mock";
import type { Usuario } from "@/types/usuarios";

const POR_PAGINA = 8;

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_MOCK);
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
      if (q && !`${u.nome} ${u.email} ${u.unidade}`.toLowerCase().includes(q)) return false;
      if (filtros.perfil !== "todos" && u.perfil !== filtros.perfil) return false;
      if (filtros.unidade !== "todas" && u.unidade !== filtros.unidade && u.unidade !== "Todas as unidades") return false;
      if (filtros.status !== "todos" && u.status !== filtros.status) return false;
      return true;
    });
  }, [usuarios, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const contagem = {
    todos: RESUMO_MOCK.total,
    ativo: RESUMO_MOCK.ativos,
    convite_pendente: RESUMO_MOCK.convitesPendentes,
    inativo: RESUMO_MOCK.inativos,
  };

  const alterarFiltros = (f: FiltrosState) => {
    setFiltros(f);
    setPagina(1);
  };

  const excluir = (id: string) => {
    if (!window.confirm("Excluir este usuário? Esta ação não pode ser desfeita.")) return;
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const alternarStatus = (id: string) =>
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "inativo" ? "ativo" : "inativo" } : u))
    );

  const inicio = filtrados.length === 0 ? 0 : (paginaAtual - 1) * POR_PAGINA + 1;
  const fim = Math.min(paginaAtual * POR_PAGINA, filtrados.length);

  return (
    <main className="min-h-screen bg-[#F6F8FE] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0B1B3F]">Usuários e Permissões</h1>
            <p className="mt-1 text-sm text-slate-600">
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
            value={RESUMO_MOCK.total}
            helper="Cadastrados na plataforma"
            iconWrapper="bg-blue-100 text-blue-600"
            helperClass="text-slate-600"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Usuários ativos"
            value={RESUMO_MOCK.ativos}
            helper="Com acesso habilitado"
            iconWrapper="bg-emerald-50 text-emerald-500"
            helperClass="text-emerald-700"
          />
          <KpiCard
            icon={Clock}
            label="Convites pendentes"
            value={RESUMO_MOCK.convitesPendentes}
            helper="Aguardando ativação"
            iconWrapper="bg-amber-50 text-amber-500"
            helperClass="text-amber-700"
          />
          <KpiCard
            icon={Lock}
            label="Usuários inativos / bloqueados"
            value={RESUMO_MOCK.inativos}
            helper="Sem acesso ao sistema"
            iconWrapper="bg-red-50 text-red-500"
            helperClass="text-red-700"
          />
        </section>

        <section className="mt-5 rounded-xl border border-slate-200/70 bg-white shadow-sm">
          <UsersFilters filtros={filtros} onChange={alterarFiltros} contagem={contagem} />

          <UsersTable usuarios={visiveis} onDelete={excluir} onToggleStatus={alternarStatus} />

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row">
            <p className="text-sm text-slate-600">
              Mostrando <strong className="text-[#0B1B3F]">{inicio} – {fim}</strong> de{" "}
              <strong className="text-[#0B1B3F]">{filtrados.length}</strong> usuários
            </p>
            <Pagination page={paginaAtual} totalPages={totalPaginas} onChange={setPagina} />
          </footer>
        </section>
      </div>
    </main>
  );
}
