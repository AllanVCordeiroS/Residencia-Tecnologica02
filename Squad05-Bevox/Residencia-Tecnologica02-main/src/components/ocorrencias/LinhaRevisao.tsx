import type { ReactNode } from "react";

export function ValorVazio({
  children = "Não informado",
}: {
  children?: ReactNode;
}) {
  return (
    <span className="font-mono text-[11px] text-slate-400">{children}</span>
  );
}

type LinhaRevisaoProps = {
  label: string;
  children: ReactNode;
};

export default function LinhaRevisao({ label, children }: LinhaRevisaoProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[12px]">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}