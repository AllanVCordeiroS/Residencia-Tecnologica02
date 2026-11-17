import { cn } from "@/lib/utils";
import type { AvatarTone } from "@/types/usuarios";

const TONES: Record<AvatarTone, string> = {
  blueDark: "bg-blue-700 text-white",
  green: "bg-emerald-400 text-white",
  blueLight: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  yellow: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300",
  red: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300",
  mint: "bg-emerald-300 text-emerald-900 dark:text-emerald-300",
  lavender: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
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
