import {
  ArrowRight,
  CircleCheck,
  ClipboardCheck,
  Clock,
  TriangleAlert,
} from "lucide-react";
import type { ResumoPainel } from "@/lib/painelOperacional";
import CartaoIndicador from "./CartaoIndicador";

type IndicadoresOperacionaisProps = {
  painel: ResumoPainel;
  onVerAtrasadas: () => void;
};

export default function IndicadoresOperacionais({
  painel,
  onVerAtrasadas,
}: IndicadoresOperacionaisProps) {
  const { totais, variacao, rotuloComparacao } = painel;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CartaoIndicador
        icon={ClipboardCheck}
        tom="azul"
        rotulo="Rotinas previstas"
        valor={totais.previstas}
        descricao="No período selecionado"
        variacao={variacao.previstas}
        comparacao={rotuloComparacao}
        boaQuandoSobe
      />

      <CartaoIndicador
        icon={CircleCheck}
        tom="verde"
        rotulo="Concluídas"
        valor={totais.concluidas}
        descricao={`${painel.percentualConcluidas}% das rotinas previstas`}
        variacao={variacao.concluidas}
        comparacao={rotuloComparacao}
        boaQuandoSobe
      />

      <CartaoIndicador
        icon={TriangleAlert}
        tom="vermelho"
        rotulo="Ocorrências abertas"
        valor={painel.ocorrenciasAbertas}
        descricao="Precisam de acompanhamento"
        variacao={variacao.ocorrencias}
        comparacao={rotuloComparacao}
        boaQuandoSobe={false}
      />

      <CartaoIndicador
        icon={Clock}
        tom="ambar"
        rotulo="Rotinas atrasadas"
        valor={totais.atrasadas}
        descricao="Fora do prazo planejado"
        variacao={variacao.atrasadas}
        comparacao={rotuloComparacao}
        boaQuandoSobe={false}
        acao={
          <button
            type="button"
            onClick={onVerAtrasadas}
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline"
          >
            Ver todas
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        }
      />
    </div>
  );
}