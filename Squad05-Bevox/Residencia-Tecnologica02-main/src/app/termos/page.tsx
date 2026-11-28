import type { Metadata } from "next";
import Link from "next/link";
import PublicAuthShell from "@/components/login/PublicAuthShell";

export const metadata: Metadata = { title: "BEVOX | Termos do ambiente demonstrativo" };

export default function TermsPage() {
  return <PublicAuthShell title="Termos de Adesão B2B">
    <article className="w-full max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed shadow-sm dark:border-line dark:bg-surface-raised sm:p-9">
      <h1 className="text-2xl font-bold">Termos de Adesão B2B</h1>
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">O documento institucional de adesão e confidencialidade não foi fornecido no projeto. Esta página explica o fluxo demonstrativo e não representa um contrato aprovado pela BEVOX.</p>
      <h2 className="text-lg font-semibold">Solicitação de acesso</h2>
      <p>O formulário registra apenas uma solicitação temporária, inativa e sem permissões, na lista de usuários demonstrativos. Cargo e departamento não concedem um perfil administrativo. Não há criação de credencial autenticável, convite enviado ou aprovação por RH conectada a um serviço.</p>
      <h2 className="text-lg font-semibold">Operação real ainda não integrada</h2>
      <p>Persistência, aprovação, autorização no servidor e tratamento seguro de credenciais dependem de backend. Os documentos institucionais e a política oficial de privacidade precisam ser disponibilizados antes de uma operação real.</p>
      <p>Consulte também as <Link href="/privacidade" className="font-semibold text-blue-700 underline dark:text-blue-300">informações de privacidade da demonstração</Link>.</p>
      <Link href="/cadastro" className="inline-block font-semibold text-blue-700 underline dark:text-blue-300">Voltar ao cadastro</Link>
    </article>
  </PublicAuthShell>;
}
