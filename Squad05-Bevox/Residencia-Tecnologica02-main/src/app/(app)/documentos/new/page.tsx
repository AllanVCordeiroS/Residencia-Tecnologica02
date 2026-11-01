import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import DocumentForm from "@/components/documentos/DocumentForm";

export const metadata: Metadata = {
  title: "BEVOX | Homologação de Documento",
};

export default function CadastrarDocumentoPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <h1 className="text-[24px] font-extrabold leading-8 tracking-[-0.6px] text-slate-900 max-sm:text-[20px] max-sm:leading-7">
            Homologação &amp; Registro de Documento
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Envie documentos regulatórios, contratos, licenças ou alvarás com classificação automática e
            assinatura digital.
          </p>
        </div>

        <Link
          href="/documentos"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para Listagem
        </Link>
      </header>

      <DocumentForm />
    </div>
  );
}
