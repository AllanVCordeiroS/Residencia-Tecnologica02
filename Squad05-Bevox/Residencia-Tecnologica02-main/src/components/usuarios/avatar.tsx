import { cn } from "@/lib/utils";
import type { AvatarTone } from "@/types/usuarios";

const TONES: Record<AvatarTone, string> = {
  blueDark: "bg-blue-700 text-white",
  green: "bg-emerald-400 text-white",
  blueLight: "bg-blue-100 text-blue-700",
  yellow: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
  mint: "bg-emerald-300 text-emerald-900",
  lavender: "bg-indigo-100 text-indigo-700",
  blue: "bg-blue-600 text-white",
};

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const first = partes[0]?.[0] ?? "";
  const last = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ nome, tone, className }: { nome: string; tone: AvatarTone; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
        TONES[tone],
        className
      )}
    >
      {iniciais(nome)}
    </div>
  );
}
