import { useId, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface CartaoSecaoProps {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  children: ReactNode;
  className?: string;
}

export function CartaoSecao({
  icone: Icone,
  titulo,
  descricao,
  children,
  className = '',
}: CartaoSecaoProps) {
  const idTitulo = useId();

  return (
    <section
      aria-labelledby={idTitulo}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <header className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
          aria-hidden="true"
        >
          <Icone className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 id={idTitulo} className="text-base font-semibold text-slate-900">
            {titulo}
          </h2>
          <p className="text-[13px] leading-snug text-slate-500">{descricao}</p>
        </div>
      </header>

      {children}
    </section>
  );
}
