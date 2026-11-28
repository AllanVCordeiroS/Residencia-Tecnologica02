import Link from "next/link";
import Logo from "@/components/login/Logo";
import LanguageSelector from "@/components/login/LanguageSelector";

export function PublicBrand({ title = "BEVOX", subtitle = "B2B ECOSYSTEM", subtitleClassName = "" }: { title?: string; subtitle?: string; subtitleClassName?: string }) {
  return <span className="inline-flex min-w-0 items-center gap-2.5">
    <span className="shrink-0 [&>div]:h-10 [&>div]:w-10 [&>div]:rounded-lg [&>div]:p-1 [&_img]:w-full"><Logo /></span>
    <span className="min-w-0"><span className="block text-sm font-extrabold tracking-tight">{title}</span><span className={`block text-[10px] font-medium leading-4 ${subtitleClassName}`}>{subtitle}</span></span>
  </span>;
}

export default function PublicAuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_30%_35%,#dfe8ff_0%,#f5f7ff_58%,#f8fafc_100%)] text-[#132748] dark:bg-none dark:bg-surface-muted dark:text-foreground">
    <header className="border-b border-white/10 bg-[#081a34] px-4 py-3 text-white sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/login" aria-label="BEVOX — entrar" className="w-fit rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"><PublicBrand subtitleClassName="text-amber-400" /></Link>
        <p className="text-sm font-semibold sm:col-span-2 sm:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:text-center">{title}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs sm:col-start-2 sm:row-start-1 sm:justify-end lg:col-start-3">
          <LanguageSelector variant="dark" />
          <span className="border-l border-white/20 pl-3">Já possui conta? <Link href="/login" className="font-bold text-blue-300 underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300">Entrar</Link></span>
        </div>
      </div>
    </header>
    <main className="flex flex-1 items-start justify-center px-4 py-6 sm:px-6 sm:py-7">{children}</main>
    <footer className="mt-auto bg-[#081a34] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <PublicBrand title="BEVOX B2B Platform" subtitle="Governança Fiscal e Distribuição Logística de Bebidas" />
        <nav aria-label="Documentos institucionais" className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-200">
          <Link href="/termos" className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-blue-300">Termos de Adesão B2B</Link>
          <Link href="/privacidade" className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-blue-300">Política de Privacidade &amp; LGPD</Link>
        </nav>
      </div>
    </footer>
  </div>;
}
