import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
};

export default function Field({
  id,
  label,
  required,
  hint,
  children,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-600"
      >
        {label}
        {required && <span> *</span>}
      </label>

      {children}

      {hint && <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}