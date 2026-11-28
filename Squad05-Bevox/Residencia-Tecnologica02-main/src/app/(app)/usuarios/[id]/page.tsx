import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserDetailsQuery } from "@/components/users/UserDetailsQuery";

export const metadata = { title: "BEVOX | Detalhes do Usuário" };

export default async function UsuarioDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6">
      <header className="space-y-3">
        <Link href="/usuarios" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar para usuários
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Detalhes do Usuário</h1>
          <p className="mt-2 text-sm text-foreground-muted">Informações do perfil, permissões de acesso, unidades vinculadas e histórico de atividades.</p>
        </div>
      </header>
      <UserDetailsQuery id={id} />
    </main>
  );
}
