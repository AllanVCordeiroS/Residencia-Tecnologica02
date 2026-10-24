import type { ReactNode } from "react";

type SectionCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
};

export default function SectionCard({
  icon,
  title,
  description,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header
        className={`flex items-start justify-between gap-4 ${
          children ? "border-b border-slate-100 pb-4" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </span>
          <div>
            <h2 className="text-base font-bold text-[#0b1530]">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
        {action}
      </header>

      {children && <div className="pt-5">{children}</div>}
    </section>
  );
}