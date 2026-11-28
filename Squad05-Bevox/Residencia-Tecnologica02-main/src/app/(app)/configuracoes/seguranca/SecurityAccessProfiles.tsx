"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PERMISSOES_POR_PERFIL } from "@/lib/usuarios-mock";
import { useUsersQuery } from "@/hooks/queries/useUsersQuery";
import { ACOES, MODULOS, PERFIS, type Perfil } from "@/types/usuarios";

export function SecurityAccessProfiles() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Perfil>(PERFIS[0]);
  const usersQuery = useUsersQuery();
  const users = usersQuery.data ?? [];
  const cell = "p-3 align-top";
  return (
    <>
      <p className="text-xs text-foreground-muted">Perfis do cadastro de usuários. Criação, edição e ativação de perfis indisponíveis; permissões individuais podem ser editadas no usuário.</p>
      {usersQuery.isPending && <p role="status" className="text-xs text-foreground-muted">Carregando usuários vinculados…</p>}
      {usersQuery.isError && <div role="alert" className="text-xs"><p>Não foi possível consultar os usuários vinculados.</p><button type="button" className="mt-2 text-blue-600 underline dark:text-blue-300" onClick={() => void usersQuery.refetch()}>Tentar novamente</button></div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-xs">
          <caption className="sr-only">Perfis e permissões padrão do cadastro de usuários</caption>
          <thead className="bg-blue-50 text-foreground-muted dark:bg-surface-muted"><tr>{["Perfil", "Descrição", "Permissões", "Status", "Ações"].map(label => <th key={label} scope="col" className={cell}>{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {PERFIS.map(perfil => {
              const linkedUsers = users.filter(user => user.perfil === perfil);
              const modules = MODULOS.filter(module => ACOES.some(action => PERMISSOES_POR_PERFIL[perfil][module][action]));
              return <tr key={perfil}>
                <th scope="row" className={`${cell} font-semibold`}>{perfil}</th>
                <td className={cell}>{usersQuery.isPending || usersQuery.isError ? "Contagem indisponível" : `${linkedUsers.length} usuário(s) no cadastro`}</td>
                <td className={cell}>{modules.join(", ") || "Sem permissões"}</td>
                <td className={cell}>Definido</td>
                <td className={cell}>
                  <details onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.removeAttribute("open"); event.currentTarget.querySelector("summary")?.focus(); } }}>
                    <summary aria-label={`Ações de ${perfil}`} className="cursor-pointer rounded px-2 py-1 text-center focus-visible:outline-2">•••</summary>
                    <div className="mt-2 space-y-2 rounded-lg border border-line bg-surface-raised p-2">
                      <button type="button" className="text-blue-600 dark:text-blue-300 underline" onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); setSelected(perfil); dialog.current?.showModal(); }}>Ver detalhes</button>
                      <Link href="/usuarios" className="block text-blue-600 dark:text-blue-300 underline">Gerenciar usuários</Link>
                    </div>
                  </details>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <dialog ref={dialog} aria-labelledby="security-profile-title" onKeyDown={event => { if (event.key === "Escape") dialog.current?.close(); }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl border border-line bg-surface-raised p-5 text-foreground shadow-xl backdrop:bg-black/50">
        <div className="flex items-start justify-between gap-4">
          <h2 id="security-profile-title" className="font-bold">{selected}</h2>
          <button type="button" onClick={() => dialog.current?.close()} className="rounded border border-line px-3 py-1">Fechar</button>
        </div>
        <p className="my-3 text-sm text-foreground-muted">Permissões padrão do perfil; permissões individuais podem ser diferentes.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead><tr><th scope="col" className={cell}>Módulo</th>{ACOES.map(action => <th key={action} scope="col" className={`${cell} capitalize`}>{action}</th>)}</tr></thead>
            <tbody>{MODULOS.map(module => <tr key={module} className="border-t border-line"><th scope="row" className={cell}>{module}</th>{ACOES.map(action => <td key={action} className={cell}>{PERMISSOES_POR_PERFIL[selected][module][action] ? "Sim" : "Não"}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <h3 className="mt-4 font-semibold">Usuários vinculados</h3>
        <ul className="mt-2 space-y-2 text-sm">{users.filter(user => user.perfil === selected).map(user => <li key={user.id} className="flex flex-wrap justify-between gap-2"><span>{user.nome} · {user.status === "ativo" ? "Ativo" : user.status === "inativo" ? "Inativo" : "Convite pendente"}</span><Link href={`/usuarios/${user.id}/editar`} className="text-blue-600 dark:text-blue-300 underline">Editar usuário: {user.nome}</Link></li>)}</ul>
        {!usersQuery.isPending && !usersQuery.isError && !users.some(user => user.perfil === selected) && <p className="mt-2 text-sm text-foreground-muted">Nenhum usuário vinculado a este perfil.</p>}
      </dialog>
    </>
  );
}
