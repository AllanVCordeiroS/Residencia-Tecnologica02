import type { ReactNode } from "react";
import { ArrowUp, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

const TONS = {
  azul: "bg-blue-50 text-blue-600",
  verde: "bg-emerald-50 text-emerald-600",
  vermelho: "bg-red-50 text-red-500",
  ambar: "bg-amber-50 text-amber-500",
} as const;

type CartaoIndicadorProps = {
  icon: LucideIcon;
  tom: keyof typeof TONS;
  rotulo: string;
  valor: number;
  descricao: string;
  variacao: string;
  variacaoBoa: boolean;
  acao?: ReactNode;
};

export default function CartaoIndicador({
  icon: Icon,
  tom,
  rotulo,
  valor,
  descricao,
  variacao,
  variacaoBoa,
  acao,
}: CartaoIndicadorProps) {
  return (
    <Card as="div" className="flex items-start gap-4 p-5">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${TONS[tom]}`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium text-slate-600">{rotulo}</p>
          {acao}
        </div>

        <p className="mt-1 text-[32px] font-extrabold leading-none tracking-tight text-slate-900">
          {valor}
        </p>
        <p className="mt-1.5 text-[12px] text-slate-500">{descricao}</p>

        <p
          className={`mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium ${
            variacaoBoa ? "text-emerald-600" : "text-red-500"
          }`}
        >
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
          {variacao}
        </p>
      </div>
    </Card>
  );
}