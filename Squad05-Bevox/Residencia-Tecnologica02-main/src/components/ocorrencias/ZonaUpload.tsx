import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type ZonaUploadProps = {
  id: string;
  icon: LucideIcon;
  botaoIcon: LucideIcon;
  botaoTexto: string;
  accept: string;
  children: ReactNode;
};

export default function ZonaUpload({
  id,
  icon: Icon,
  botaoIcon: BotaoIcon,
  botaoTexto,
  accept,
  children,
}: ZonaUploadProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-4 py-6 text-center text-[13px] text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-500"
    >
      <input
        id={id}
        name={id}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
      />

      <Icon className="h-8 w-8 text-blue-600" aria-hidden="true" />
      <span>{children}</span>

      <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 shadow-sm">
        <BotaoIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
        {botaoTexto}
      </span>
    </label>
  );
}