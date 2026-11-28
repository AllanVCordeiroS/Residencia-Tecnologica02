"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getUserForm } from "@/services/users";
import UserForm from "./user-form";

export default function UserEditQuery({ id }: { id: string }) {
  const query = useQuery({ queryKey: [...queryKeys.users.all, "form", id], queryFn: () => getUserForm(id) });
  if (query.isPending) return <p role="status">Carregando usuário...</p>;
  if (query.isError) return <div role="alert">Não foi possível carregar o usuário. <button type="button" className="underline" onClick={() => void query.refetch()}>Tentar novamente</button></div>;
  if (!query.data) return <p>Usuário não encontrado. <Link href="/usuarios" className="underline">Voltar à lista</Link></p>;
  return <UserForm key={id} id={id} initialValues={query.data} />;
}
