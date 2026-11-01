import { ClipboardCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Pilula from "./Pilula";

const ITENS = [
  { label: "Tipo", valor: "Não informado" },
  { label: "Categoria", valor: "Não informado" },
  { label: "Unidade", valor: "Não informada" },
  { label: "Gravidade", valor: "Não informado" },
  { label: "Data da ocorrência", valor: "Não informada" },
];

export default function ResumoOcorrencia() {
  return (
    <Card aria-labelledby="resumo-titulo" className="p-6">
      <header className="flex items-center gap-3 border-b border-line pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <CardTitle id="resumo-titulo" titulo="Resumo da ocorrência" />
      </header>

      <dl className="space-y-3.5 pt-5">
        {ITENS.map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] text-slate-400">{item.label}</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-slate-800">
              {item.valor}
            </dd>
          </div>
        ))}

        <div>
          <dt className="text-[11px] text-slate-400">Status</dt>
          <dd className="mt-1.5">
            <Pilula tom="azul" ponto>
              Em preenchimento
            </Pilula>
          </dd>
        </div>
      </dl>
    </Card>
  );
}