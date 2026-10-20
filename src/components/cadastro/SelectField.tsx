import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/components/login/icons";
import { fieldBase, fieldError, fieldOk } from "./fieldStyles";

type SelectFieldProps = {
  id: string;
  label: string;
  options: string[];
  placeholder: string;
  error?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className">;

export default function SelectField({
  id,
  label,
  options,
  placeholder,
  error,
  ...selectProps
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-[#0b1530]">
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${fieldBase} appearance-none pr-11 ${error ? fieldError : fieldOk}`}
          {...selectProps}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}