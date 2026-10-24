import { montarMetricas } from "@/lib/dashboard";
import type { DashboardData } from "@/types";
import MetricCard from "./MetricCard";

export default function DashboardMetrics({ data }: { data: DashboardData }) {
  return (
    <section aria-label="Indicadores principais" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {montarMetricas(data).map((m) => (
        <MetricCard key={m.id} metrica={m} />
      ))}
    </section>
  );
}
