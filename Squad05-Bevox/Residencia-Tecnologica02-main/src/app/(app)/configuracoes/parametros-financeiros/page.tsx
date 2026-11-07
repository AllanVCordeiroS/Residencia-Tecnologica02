import type { Metadata } from 'next';
import { Landmark } from 'lucide-react';

import { ParametrosFinanceirosForm } from '@/components/configuracoes/ParametrosFinanceirosForm';
import { buscarParametrosFinanceiros } from '@/lib/configuracoes-mock';

export const metadata: Metadata = {
  title: 'Parâmetros Financeiros | BEVOX',
};

export default async function ParametrosFinanceirosPage() {
  const parametros = await buscarParametrosFinanceiros();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white"
            aria-hidden="true"
          >
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-slate-900">
              Parâmetros Financeiros
            </h1>
            <p className="text-sm text-slate-600">
              Gerencie as preferências e os parâmetros do BEVOX.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Sistema ativo
        </span>
      </header>

      <ParametrosFinanceirosForm valoresIniciais={parametros} />
    </div>
  );
}
