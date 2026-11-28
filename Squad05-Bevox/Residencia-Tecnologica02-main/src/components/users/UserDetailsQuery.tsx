"use client";

import { useUserDetailQuery } from "@/hooks/queries/useUserDetailQuery";
import UserDetails from "./UserDetails";
import { useRouter } from "next/navigation";
import { useUserActionMutation, useUserActionsPending } from "@/hooks/queries/useUsersQuery";

export function UserDetailsQuery({ id }: { id: string }) {
  const query = useUserDetailQuery(id);
  const router = useRouter();
  const toggleMutation = useUserActionMutation("toggle");
  const deleteMutation = useUserActionMutation("delete");
  const actionsPending = useUserActionsPending();
  if (query.isPending) {
    return <div role="status" className="animate-pulse rounded-2xl border border-line bg-surface-raised p-8 text-foreground-muted">Carregando detalhes do usuário…</div>;
  }
  if (query.isError) {
    return (
      <div role="alert" className="rounded-2xl border border-line bg-surface-raised p-8 text-foreground">
        <p>Não foi possível carregar os detalhes do usuário.</p>
        <button type="button" onClick={() => void query.refetch()} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Tentar novamente</button>
      </div>
    );
  }
  if (!query.data) {
    return <section className="rounded-2xl border border-line bg-surface-raised p-8 text-foreground"><h2 className="text-lg font-semibold">Usuário não encontrado</h2><p className="mt-2 text-sm text-foreground-muted">Não há usuário com este identificador.</p></section>;
  }
  return <>
    <p className="mb-4 text-xs text-foreground-muted">Cadastro demonstrativo. Alterações de status e exclusão afetam somente a sessão de navegação. Histórico e dados complementares, quando disponíveis, vêm dos mocks existentes.</p>
    {(toggleMutation.isError || deleteMutation.isError) && <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-300">Não foi possível atualizar o usuário.</p>}
    {actionsPending && <p role="status" className="mb-4 text-sm text-foreground-muted">Atualizando demonstração...</p>}
    <UserDetails key={id} user={query.data}
      actionsPending={actionsPending}
      onEdit={() => { if (!actionsPending) router.push(`/usuarios/${id}/editar`); }}
      onChangeRole={() => { if (!actionsPending) router.push(`/usuarios/${id}/editar`); }}
      onManageUnits={() => { if (!actionsPending) router.push(`/usuarios/${id}/editar`); }}
      onDeactivate={() => { if (!actionsPending) toggleMutation.mutate(id); }}
      onDelete={() => {
        if (!actionsPending && window.confirm("Excluir este usuário da demonstração? Os dados serão restaurados ao recarregar.")) {
          deleteMutation.mutate(id, { onSuccess: () => router.push("/usuarios") });
        }
      }}
    />
  </>;
}
