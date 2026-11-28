import NextLink from "next/link";
import HeroPanel from "@/components/login/HeroPanel";
import LanguageSelector from "@/components/login/LanguageSelector";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <HeroPanel />

      <section className="bg-slate-50 dark:bg-surface-muted px-6 py-8">
        
         <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[420px] flex-col">
        {/* Cabeçalho */}
        <header className="flex items-center justify-end border-b border-slate-200 dark:border-line pb-6 text-xs text-slate-600 dark:text-foreground-muted">
          <LanguageSelector />
        </header>

        {/* Conteúdo principal */}
        <section className="flex-1 pt-16">
          <p className="mb-3 text-xs font-medium text-blue-700 dark:text-blue-300">
            PORTAL CORPORATIVO BEVOX
          </p>

          <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Acesse sua conta
          </h1>

          <p className="mb-8 text-sm leading-6 text-slate-500 dark:text-foreground-muted">
            Informe suas credenciais corporativas para gerenciar pedidos, frotas
            e estoques.
          </p>

          {/*informativo*/}
          <div className="mb-6 flex gap-3 rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4">
            <span className="text-lg text-blue-700 dark:text-blue-300">ⓘ</span>

            <p className="text-xs leading-4 text-slate-700 dark:text-foreground">
              <strong className="font-semibold text-slate-900 dark:text-foreground">
                Detecção Automática de Unidade:
              </strong>{" "}
              O sistema identificará automaticamente seu tenant através do
              domínio do e-mail corporativo fornecido.
            </p>
          </div>

          {}
          <LoginForm />

          <p className="mt-7 text-center text-xs text-slate-500 dark:text-foreground-muted">
            Não possui uma conta?{" "}
            <NextLink
              href="/cadastro"
              className="font-medium text-blue-700 dark:text-blue-300 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
            >
              Criar conta na BEVOX
            </NextLink>
          </p>

          {/*Ajuda*/}
          <div className="mt-8 border-t border-slate-200 dark:border-line pt-6 text-center text-xs leading-5 text-slate-500 dark:text-foreground-muted">
            Ainda não tem acesso à sua distribuidora?{" "}
            <a
              href="#"
              className="font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Fale com o Administrador do Sistema
            </a>
          </div>
        </section>

        {/*Rodapé*/}
        <footer className="mt-16 border-t border-slate-200 dark:border-line pt-6 text-[11px] leading-4 text-slate-400 dark:text-foreground-muted">
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-[175px]">
              BEVOX Gestão B2B © 2026. Todos os direitos reservados.
            </p>

            <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-slate-500 dark:text-foreground-muted">
              <NextLink href="/termos" className="hover:text-blue-700 dark:hover:text-blue-300">
                Termos de Uso
              </NextLink>
              <span>•</span>
              <NextLink href="/privacidade" className="hover:text-blue-700 dark:hover:text-blue-300">
                Privacidade
              </NextLink>
              <span>•</span>
              <a href="#" className="hover:text-blue-700 dark:hover:text-blue-300">
                Suporte Técnico
              </a>
            </nav>
          </div>
        </footer>
      </div>
      </section>
    </main>
  );
}
