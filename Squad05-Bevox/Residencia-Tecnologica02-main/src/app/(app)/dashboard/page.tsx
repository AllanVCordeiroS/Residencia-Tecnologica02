import type { Metadata } from "next";
import AlertsNotifications from "@/components/dashboard/AlertsNotifications";
import CompanyOverviewChart from "@/components/dashboard/CompanyOverviewChart";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import QuickAccess from "@/components/dashboard/QuickAccess";
import RecentTasks from "@/components/dashboard/RecentTasks";
import UnitDistributionChart from "@/components/dashboard/UnitDistributionChart";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import { getDashboardData } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "BEVOX | Dashboard Geral",
  description: "Visão geral operacional da Adega Distribution.",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

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
