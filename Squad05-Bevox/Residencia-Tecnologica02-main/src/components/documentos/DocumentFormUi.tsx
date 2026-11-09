import type { ComponentProps, ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/Card";

/** Primitivos visuais compartilhados pelas seções do formulário "Novo Documento". */

export const INPUT_CLASSE =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 read-only:bg-slate-100 read-only:text-slate-600 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-100";

export function atributosDeErro(id: string, mensagem?: string) {
  return {
    id,
    "aria-invalid": mensagem ? true : undefined,
    "aria-describedby": mensagem ? `${id}-erro` : undefined,
  } as const;
}

export function SecaoCard({
  id,
  icone,
  tile,
  titulo,
  subtitulo,
  numero,
  children,
}: {
  id: string;
  icone: ReactNode;
  tile: string;
  titulo: string;
  subtitulo: string;
  numero: number;
  children: ReactNode;
}) {
  return (
    <Card aria-labelledby={id} className="overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line px-6 py-4">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tile}`}>
          {icone}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={id} className="text-[15px] font-semibold leading-tight text-slate-900">
            {titulo}
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">{subtitulo}</p>
        </div>
        <span className="hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:block">
          Seção {numero} de 3
        </span>
      </header>
      <div className="px-6 py-5">{children}</div>
    </Card>
  );
}

export function Campo({
  id,
  rotulo,
  obrigatorio,
  erro,
  className = "",
  children,
}: {
  id: string;
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-slate-800">
        {rotulo}
        {obrigatorio && (
          <span aria-hidden="true" className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>
      {children}
      {erro && (
        <p id={`${id}-erro`} role="alert" className="mt-1 text-[12px] text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}

export function EntradaTexto({
  icone,
  className = "",
  ...props
}: ComponentProps<"input"> & { icone?: ReactNode }) {
  return (
    <div className="relative">
      <input {...props} className={`${INPUT_CLASSE} ${icone ? "pr-10" : ""} ${className}`} />
      {icone && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icone}
        </span>
      )}
    </div>
  );
}

export function Selecao({ className = "", children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} className={`${INPUT_CLASSE} appearance-none pr-9 ${className}`}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

const TOM_CAIXA = {
  azul: "checked:border-blue-600 checked:bg-blue-600",
  verde: "checked:border-emerald-600 checked:bg-emerald-600",
  indigo: "checked:border-indigo-600 checked:bg-indigo-600",
  ambar: "checked:border-amber-500 checked:bg-amber-500",
  vermelho: "checked:border-red-500 checked:bg-red-500",
} as const;

/** Checkbox estilizado (aceita `register(...)` do React Hook Form). */
export function Caixa({
  tom = "azul",
  ...props
}: Omit<ComponentProps<"input">, "type"> & { tom?: keyof typeof TOM_CAIXA }) {
  return (
    <span className="relative inline-flex size-[18px] shrink-0">
      <input
        {...props}
        type="checkbox"
        className={`peer size-[18px] cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${TOM_CAIXA[tom]}`}
      />
      <Check
        aria-hidden="true"
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto size-3 text-white opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}

/** Radio estilizado (aceita `register(...)` do React Hook Form). */
export function RadioPonto(props: Omit<ComponentProps<"input">, "type">) {
  return (
    <span className="relative inline-flex size-[18px] shrink-0">
      <input
        {...props}
        type="radio"
        className="peer size-[18px] cursor-pointer appearance-none rounded-full border-2 border-slate-300 bg-white transition checked:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto size-2 rounded-full bg-blue-600 opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}
