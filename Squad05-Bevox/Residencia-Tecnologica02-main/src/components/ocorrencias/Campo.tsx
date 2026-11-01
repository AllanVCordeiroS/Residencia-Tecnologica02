import type { ReactNode } from "react";

type CampoProps = {
  id: string;
  label: string;
  obrigatorio?: boolean;
  children: ReactNode;
};

export default function Campo({ id, label, obrigatorio, children }: CampoProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-slate-700"
      >
        {label}
        {obrigatorio && <span className="text-blue-600"> *</span>}
      </label>
      {children}
    </div>
  );
}