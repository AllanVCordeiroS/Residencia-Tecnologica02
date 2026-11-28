import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import PublicAuthShell, { PublicBrand } from "@/components/login/PublicAuthShell";
import CollaboratorForm from "@/components/login/CollaboratorForm";

export const metadata: Metadata = { title: "BEVOX | Cadastro de Colaborador" };

export default function CollaboratorRegistrationPage() {
  return <PublicAuthShell title="Cadastro de Colaborador">
    <section aria-labelledby="cadastro-title" className="w-full max-w-[760px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 dark:border-line dark:bg-surface-raised">
      <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-500" />
      <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/80 px-5 py-3 text-[#132748] sm:px-9 dark:bg-surface-muted dark:text-foreground">
        <PublicBrand title="BEVOX Ecosystem" subtitle="PORTAL DE ACESSO INTERNO" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold shadow-sm dark:bg-surface-raised"><UsersRound size={15} aria-hidden="true" className="text-amber-600 dark:text-amber-400" />Colaborador / RH</span>
      </div>
      <div className="px-5 py-5 sm:px-9 sm:py-6">
        <h1 id="cadastro-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Cadastro de Colaborador</h1>
        <p className="mb-5 mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-foreground-muted">Preencha seus dados para solicitar ou concluir seu acesso ao ambiente corporativo da BEVOX.</p>
        <CollaboratorForm />
      </div>
    </section>
  </PublicAuthShell>;
}
