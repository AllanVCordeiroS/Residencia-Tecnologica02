import BMark from "@/components/cadastro/BMark";
import TopBar from "@/components/cadastro/TopBar";
import { IdCardIcon } from "@/components/login/icons";
import CadastroForm from "@/components/cadastro/CadastroForm";

export const metadata = { title: "BEVOX | Cadastro de Colaborador" };

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <TopBar />

      <main className="px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
          {/* Faixa colorida do topo do cartão */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-emerald-600" />

          {/* Cabeçalho do cartão */}
          <div className="flex items-center justify-between gap-4 bg-slate-50 px-6 py-5 sm:px-10">
            <div className="flex items-center gap-3">
              <BMark className="h-10 w-10 text-xl" />
              <div className="leading-tight">
                <p className="text-sm font-bold text-[#0b1530]">BEVOX Ecosystem</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Portal de acesso interno
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200">
              <IdCardIcon className="h-3.5 w-3.5 text-orange-500" />
              Colaborador / RH
            </span>
          </div>

          {/* Corpo do cartão */}
          <div className="px-6 py-8 sm:px-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1530]">
              Cadastro de Colaborador
            </h1>
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              Preencha os dados abaixo para registrar o novo usuário interno com
              as devidas permissões RBAC no ecossistema BEVOX.
            </p>

            {/* Marcador temporário: o formulário entra nas próximas etapas */}
            <div className="mt-8 rounded-lg border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              <CadastroForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}