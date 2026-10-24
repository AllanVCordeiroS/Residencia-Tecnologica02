import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function range(page: number, total: number): Array<number | "..."> {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, 5, "...", total];
  if (page >= total - 2) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", page - 1, page, page + 1, "...", total];
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const btn = "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors";

  return (
    <nav aria-label="Paginação" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={cn(btn, "text-slate-500 hover:bg-slate-100 disabled:opacity-40")}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {range(page, totalPages).map((item, i) =>
        item === "..." ? (
          <span key={`e${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              btn,
              item === page ? "bg-blue-600 font-semibold text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="Próxima página"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(btn, "text-slate-500 hover:bg-slate-100 disabled:opacity-40")}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
