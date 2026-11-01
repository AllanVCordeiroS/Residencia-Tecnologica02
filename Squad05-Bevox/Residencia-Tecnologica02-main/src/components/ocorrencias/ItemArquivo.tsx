import { FileText, ImageIcon, X } from "lucide-react";

export type TipoArquivo = "pdf" | "imagem";

const ESTILOS = {
  pdf: { icon: FileText, caixa: "bg-red-50 text-red-500" },
  imagem: { icon: ImageIcon, caixa: "bg-emerald-50 text-emerald-600" },
} as const;

type ItemArquivoProps = {
  nome: string;
  tamanho: string;
  tipo: TipoArquivo;
};

export default function ItemArquivo({ nome, tamanho, tipo }: ItemArquivoProps) {
  const { icon: Icone, caixa } = ESTILOS[tipo];

  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${caixa}`}
      >
        <Icone className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[13px] font-semibold text-slate-800">{nome}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">{tamanho}</p>
      </div>

      {/* TODO (grupo): remover o arquivo da lista quando houver estado. */}
      <button
        type="button"
        aria-label={`Remover ${nome}`}
        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}