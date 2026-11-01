import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { campoBase } from "./campoStyles";

type InputComIconeProps = {
  icon: LucideIcon;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export default function InputComIcone({
  icon: Icon,
  ...inputProps
}: InputComIconeProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        className={`${campoBase} py-2.5 pl-10 pr-3 [&::-webkit-calendar-picker-indicator]:opacity-0`}
        {...inputProps}
      />
    </div>
  );
}