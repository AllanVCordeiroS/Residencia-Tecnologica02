"use client";

import AlertsNotifications from "@/components/dashboard/AlertsNotifications";
import CompanyOverviewChart from "@/components/dashboard/CompanyOverviewChart";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import QuickAccess from "@/components/dashboard/QuickAccess";
import RecentTasks from "@/components/dashboard/RecentTasks";
import UnitDistributionChart from "@/components/dashboard/UnitDistributionChart";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import { useDashboardQuery } from "@/hooks/queries/useDashboardQuery";

export default function DashboardContent() {
  const { data, isPending, isError, error, refetch, isFetching } = useDashboardQuery();

  if (isPending) {
    return (
      <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Carregando indicadores do dashboard...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <section role="alert" className="rounded-xl border border-red-200 bg-white p-6">
        <h1 className="text-base font-semibold text-slate-900">Não foi possível carregar o dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          {error instanceof Error ? error.message : "Ocorreu um erro ao consultar os indicadores."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {isFetching ? "Tentando novamente..." : "Tentar novamente"}
        </button>
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <WelcomeBanner data={data} />
      <DashboardMetrics data={data} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 *:h-full xl:col-span-8">
          <CompanyOverviewChart data={data} />
        </div>
        <div className="min-w-0 *:h-full xl:col-span-4">
          <UnitDistributionChart data={data} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 *:h-full xl:col-span-7">
          <RecentTasks tarefas={data.tarefasRecentes} />
        </div>
        <div className="min-w-0 *:h-full xl:col-span-5">
          <AlertsNotifications alertas={data.alertas} dataReferencia={data.dataReferencia} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 *:h-full xl:col-span-8">
          <QuickAccess />
        </div>
      </div>
    </div>
  );
}
