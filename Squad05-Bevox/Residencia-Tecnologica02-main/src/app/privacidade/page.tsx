import type { Metadata } from "next";
import Link from "next/link";
import PublicAuthShell from "@/components/login/PublicAuthShell";

export const metadata: Metadata = { title: "BEVOX | Privacidade na demonstração" };

export default function PrivacyPage() {
  return <PublicAuthShell title="Política de Privacidade & LGPD">
    <article className="w-full max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed shadow-sm dark:border-line dark:bg-surface-raised sm:p-9">
      <h1 className="text-2xl font-bold">Política de Privacidade &amp; LGPD</h1>
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">Informações técnicas do ambiente demonstrativo. A política institucional aprovada da BEVOX não foi fornecida no projeto. Este conteúdo não a substitui nem declara conformidade jurídica.</p>
      <h2 className="text-lg font-semibold">Dados do cadastro nesta demonstração</h2>
      <p>Nome, e-mail, telefone, cargo, unidade, departamento e confirmações de ciência são usados para adicionar uma solicitação inativa à mesma lista de usuários da sessão do navegador. Não há envio desses dados a um serviço de cadastro ou banco de dados. A senha e sua confirmação são utilizadas apenas para validação do formulário e não são armazenadas ou incluídas no registro.</p>
      <h2 className="text-lg font-semibold">Armazenamento e acesso</h2>
      <p>O cadastro é temporário em memória e se perde ao recarregar a aplicação. As preferências existentes da aplicação usam armazenamento local. O acesso interno utiliza apenas as contas demonstrativas ativas dos mocks, com sessão temporária validada pelo servidor e cookie sem senha. O Logout encerra essa sessão. Uma solicitação de cadastro não cria cookie de autenticação nem habilita uma conta. Este mecanismo é exclusivo da demonstração e não é adequado para produção.</p>
      <h2 className="text-lg font-semibold">Antes de utilizar dados reais</h2>
      <p>Não utilize dados pessoais reais ou senhas usadas em outros serviços nesta demonstração. A política oficial, canais institucionais e regras de tratamento para operação real precisam ser disponibilizados pela organização junto da integração de backend.</p>
      <Link href="/cadastro" className="inline-block font-semibold text-blue-700 underline dark:text-blue-300">Voltar ao cadastro</Link>
    </article>
  </PublicAuthShell>;
}
