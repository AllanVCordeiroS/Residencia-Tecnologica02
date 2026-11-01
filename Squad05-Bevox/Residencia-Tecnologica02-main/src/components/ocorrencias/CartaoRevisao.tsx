import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type CartaoRevisaoProps = {
  icon: LucideIcon;
  titulo: string;
  editarHref?: string;
  children: ReactNode;
};

export default function CartaoRevisao({
  icon: Icon,
  titulo,
  editarHref,
  children,
}: CartaoRevisaoProps) {
  return (
    <section className="rounded-xl border border-line bg-slate-50 p-4">
      <header className="flex items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <h3 className="text-[13px] font-bold leading-tight text-slate-900">
            {titulo}
          </h3>
        </div>

        {editarHref && (
          <a
            href={editarHref}
            className="shrink-0 text-[12px] font-semibold text-blue-600 hover:underline"
          >
            Editar
          </a>
        )}
      </header>

      <div className="pt-3">{children}</div>
    </section>
  );
}