"use client";

import { Building2 } from "lucide-react";
import { UNIDADES } from "@/lib/usuarios-mock";

interface Props {
  selecionadas: string[];
  onChange: (units: string[]) => void;
}

export function UnitsChecklist({ selecionadas, onChange }: Props) {
  const todas = selecionadas.length === UNIDADES.length;

  const toggleTodas = () => onChange(todas ? [] : [...UNIDADES]);
  const toggleUma = (u: string) =>
    onChange(selecionadas.includes(u) ? selecionadas.filter((x) => x !== u) : [...selecionadas, u]);

  const check = "h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500";

  return (
    <section className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0B1B3F]">Unidades autorizadas</h2>
          <p className="text-sm text-slate-600">Selecione as unidades que o usuário poderá acessar.</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3.5">
        <li>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-[#0B1B3F]">
            <input type="checkbox" checked={todas} onChange={toggleTodas} className={check} />
            Todas as unidades
          </label>
        </li>
        {UNIDADES.map((u) => (
          <li key={u}>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={selecionadas.includes(u)} onChange={() => toggleUma(u)} className={check} />
              {u}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
