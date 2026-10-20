import type { InputHTMLAttributes, ReactNode } from "react";
import { fieldBase, fieldError, fieldOk } from "./fieldStyles";

type TextFieldProps = {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

export default function TextField({
  id,
  label,
  icon,
  error,
  ...inputProps
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-[#0b1530]">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${fieldBase} ${icon ? "pr-11" : "pr-4"} ${error ? fieldError : fieldOk}`}
          {...inputProps}
        />
        {icon && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}