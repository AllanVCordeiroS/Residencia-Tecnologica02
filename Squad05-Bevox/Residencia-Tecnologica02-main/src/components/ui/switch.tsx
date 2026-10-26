"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, size = "md", disabled, label }: SwitchProps) {
  const track = size === "md" ? "h-6 w-11" : "h-[18px] w-8";
  const thumb = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  const shift = size === "md" ? "translate-x-5" : "translate-x-3.5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        track,
        checked ? "bg-blue-600" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block translate-x-0.5 rounded-full bg-white shadow transition-transform",
          thumb,
          checked && shift
        )}
      />
    </button>
  );
}
