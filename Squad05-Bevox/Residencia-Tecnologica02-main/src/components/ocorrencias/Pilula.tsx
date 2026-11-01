import type { ReactNode } from "react";

const TONS = {
  azul: "border-blue-100 bg-blue-50 text-blue-700",
  ambar: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

const PONTOS = {
  azul: "bg-blue-600",
  ambar: "bg-amber-500",
} as const;

type PilulaProps = {
  tom?: keyof typeof TONS;
  ponto?: boolean;
  children: ReactNode;
};

export default function Pilula({
  tom = "azul",
  ponto = false,
  children,
}: PilulaProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONS[tom]}`}
    >
      {ponto && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${PONTOS[tom]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}