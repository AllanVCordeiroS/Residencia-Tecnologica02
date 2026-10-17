import type { Metadata } from "next";
import Link from "next/link";
import { ROTAS } from "@/config/navigation";

export const metadata: Metadata = { title: "BEVOX | Sobre" };

export default function SobrePage() {
  return (
    <article className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sobre o BEVOX</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
        O BEVOX é um ERP especializado em distribuição B2B de bebidas. Une um backoffice web a um app
        responsivo e offline-first para equipes de rua, centralizando a operação e reduzindo processos
        manuais.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
        Seu foco é a conformidade documental (alvarás, licenças e laudos), o controle de estoque e
        validade, a conta-corrente de vasilhames e a visibilidade em tempo real entre vendas, logística
        e backoffice.
      </p>
      <Link href={ROTAS.dashboard} className="mt-6 inline-block text-[14px] font-semibold text-blue-600 hover:text-blue-800">
        Voltar ao Dashboard
      </Link>
    </article>
  );
}
