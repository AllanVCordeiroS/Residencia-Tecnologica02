"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
      <h1 className="text-lg font-bold text-slate-900">Não foi possível carregar o dashboard</h1>
      <p className="mt-2 text-sm text-slate-500">Houve um erro ao obter os dados. Tente novamente.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Tentar novamente
      </button>
    </div>
  );
}
