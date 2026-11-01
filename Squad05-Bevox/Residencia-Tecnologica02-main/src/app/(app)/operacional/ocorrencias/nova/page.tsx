import { Check, RefreshCw } from "lucide-react";
import ResumoOcorrencia from "@/components/ocorrencias/ResumoOcorrencia";
import SecaoDetalhesEvidencias from "@/components/ocorrencias/SecaoDetalhesEvidencias";
import SecaoInformacoesPrincipais from "@/components/ocorrencias/SecaoInformacoesPrincipais";
import SecaoResponsaveisPrazos from "@/components/ocorrencias/SecaoResponsaveisPrazos";
import SecaoRevisao from "@/components/ocorrencias/SecaoRevisao";

export const metadata = { title: "BEVOX | Registrar Ocorrência" };

export default function RegistrarOcorrenciaPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
          Registrar Ocorrência
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Informe os detalhes da ocorrência para que a equipe responsável possa
          agir.
        </p>
      </header>

      {/* Formulário à esquerda, resumo à direita */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SecaoInformacoesPrincipais />
          <SecaoDetalhesEvidencias />
          <SecaoResponsaveisPrazos />
        </div>

        <aside className="lg:sticky lg:top-24">
          <ResumoOcorrencia />
        </aside>
      </div>

      {/* Revisão ocupa a largura inteira */}
      <SecaoRevisao />

      {/* Ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* TODO (grupo): levar para /operacional quando houver a lista. */}
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Cancelar
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Registrar ocorrência
        </button>
      </div>
    </div>
  );
}