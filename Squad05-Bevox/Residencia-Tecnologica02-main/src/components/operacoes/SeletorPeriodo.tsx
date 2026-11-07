const PERIODOS = ["Hoje", "7 dias", "30 dias"];

// TODO (grupo): trocar o período quando houver dados de 7 e 30 dias.
export default function SeletorPeriodo() {
  return (
    <div
      role="group"
      aria-label="Período"
      className="inline-flex rounded-lg bg-slate-100 p-1"
    >
      {PERIODOS.map((periodo, indice) => (
        <button
          key={periodo}
          type="button"
          aria-pressed={indice === 0}
          className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
            indice === 0
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {periodo}
        </button>
      ))}
    </div>
  );
}