import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import UserDetails from "../../../../components/users/UserDetails";
import { mockUsers } from "../../../../data/mockUsers";

interface UserDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;
  const user = mockUsers.find((item) => item.id === id);

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6">
      <header className="space-y-3">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para usuários
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Detalhes do Usuário
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Visualize as informações do perfil, permissões de acesso, unidades
            vinculadas e histórico de atividades do usuário.
          </p>
        </div>
      </header>

      <UserDetails user={user} />
    </main>
  );
}
