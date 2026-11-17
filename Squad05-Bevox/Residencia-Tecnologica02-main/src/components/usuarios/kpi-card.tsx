import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  helper: string;
  iconWrapper: string;
  helperClass: string;
}

export function KpiCard({ icon: Icon, label, value, helper, iconWrapper, helperClass }: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200/70 dark:border-line/70 bg-white dark:bg-surface-raised p-4 shadow-sm">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", iconWrapper)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-600 dark:text-foreground-muted">{label}</p>
        <p className="text-3xl font-bold leading-tight text-foreground">{value}</p>
        <p className={cn("text-xs font-medium", helperClass)}>{helper}</p>
      </div>
    </div>
  );
}
