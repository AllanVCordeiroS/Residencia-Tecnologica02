import type { SelectHTMLAttributes } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { campoBase } from "./campoStyles";

type SelectComIconeProps = {
  icon: LucideIcon;
  placeholder: string;
  options: string[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children">;

export default function SelectComIcone({
  icon: Icon,
  placeholder,
  options,
  ...selectProps
}: SelectComIconeProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <select
        defaultValue=""
        className={`${campoBase} cursor-pointer appearance-none py-2.5 pl-10 pr-10 invalid:text-slate-400 [&>option]:text-slate-900`}
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
    </div>
  );
}