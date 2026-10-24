import { ChevronRightIcon } from "@/components/backoffice/icons";

const steps = [
  "Dados Cadastrais & Fiscais",
  "Endereço & Localização",
  "Operação & Infraestrutura",
  "Gestão & Responsáveis",
];

export default function Stepper({ current = 1 }: { current?: number }) {
  return (
    <nav
      aria-label="Etapas do cadastro"
      className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
    >
      <ol className="flex items-center gap-1 overflow-x-auto">
        {steps.map((label, index) => {
          const number = index + 1;
          const isActive = number === current;

          return (
            <li key={label} className="flex min-w-52 flex-1 items-center gap-1">
              <a
                href="#"
                aria-current={isActive ? "step" : undefined}
                className={`flex flex-1 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#e3e9f7] text-slate-600"
                  }`}
                >
                  {number}
                </span>
                <span className="truncate">{label}</span>
              </a>

              {number < steps.length && (
                <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}