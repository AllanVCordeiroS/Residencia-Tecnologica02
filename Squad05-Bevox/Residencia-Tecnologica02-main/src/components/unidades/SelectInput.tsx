import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/components/backoffice/icons";
import { inputClass } from "./inputStyles";

type SelectInputProps = {
  options: string[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">;

export default function SelectInput({ options, ...selectProps }: SelectInputProps) {
  return (
    <div className="relative">
      <select
        className={`${inputClass} appearance-none pr-10`}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}