import { Card, CardTitle } from "@/components/ui/Card";
import type { LinhaResumo } from "@/lib/resumoUnidades";
import type { FiltroUnidade } from "@/types/operacional";

type ResumoUnidadesProps = {
  linhas: LinhaResumo[];
  selecionada: FiltroUnidade;
  onSelecionar: (unidade: FiltroUnidade) => void;
};

export default function ResumoUnidades({
  linhas,
  selecionada,
  onSelecionar,
}: ResumoUnidadesProps) {
  const totalFeitas = linhas.reduce((soma, linha) => soma + linha.feitas, 0);
  const totalPrevistas = linhas.reduce((soma, linha) => soma + linha.total, 0);
  const totalOcorrencias = linhas.reduce(
    (soma, linha) => soma + linha.ocorrencias,
    0,
  );

  return (
    <Card aria-labelledby="resumo-unidades-titulo" className="p-5">
      <CardTitle
        id="resumo-unidades-titulo"
        titulo="Resumo por unidade"
        subtitulo="Clique em uma unidade para filtrar a tela."
      />

      <table className="mt-4 w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-line text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <th scope="col" className="pb-2 pl-2">Unidade</th>
            <th scope="col" className="pb-2">Rotinas</th>
            <th scope="col" className="pb-2 pr-2 text-right">Ocorrências</th>
          </tr>
        </thead>

        <tbody>
          {linhas.map((linha) => {
            const ativa = selecionada === linha.unidade.id;
            return (
              <tr
                key={linha.unidade.id}
                className={`border-b border-line/70 ${ativa ? "bg-blue-50/70" : ""}`}
              >
                <th scope="row" className="py-2.5 pl-2 pr-2 font-normal">
                  <button
                    type="button"
                    aria-pressed={ativa}
                    onClick={() =>
                      onSelecionar(ativa ? "todas" : linha.unidade.id)
                    }
                    className={`text-left font-semibold hover:text-blue-700 hover:underline ${
                      ativa ? "text-blue-700" : "text-slate-800"
                    }`}
                  >
                    {linha.unidade.nome}
                  </button>
                </th>

                <td className="py-2.5 pr-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <span
                      className={`h-2 w-2 rounded-full ${linha.unidade.barra}`}
                      aria-hidden="true"
                    />
                    {linha.feitas}/{linha.total}
                  </span>
                </td>

                <td className="py-2.5 pr-2 text-right">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        linha.ocorrencias > 0 ? "bg-red-500" : "bg-slate-300"
                      }`}
                      aria-hidden="true"
                    />
                    {linha.ocorrencias}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="text-[12px] font-bold text-slate-900">
            <th scope="row" className="pb-1 pl-2 pt-3 text-left">Total</th>
            <td className="pb-1 pt-3">
              {totalFeitas}/{totalPrevistas}
            </td>
            <td className="pb-1 pr-2 pt-3 text-right">{totalOcorrencias}</td>
          </tr>
        </tfoot>
      </table>

      {selecionada !== "todas" && (
        <button
          type="button"
          onClick={() => onSelecionar("todas")}
          className="mt-3 text-[12px] font-semibold text-blue-600 hover:underline"
        >
          Ver todas as unidades
        </button>
      )}
    </Card>
  );
}