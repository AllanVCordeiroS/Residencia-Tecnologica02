import {
  ArrowRight,
  CircleCheck,
  ClipboardCheck,
  Clock,
  TriangleAlert,
} from "lucide-react";
import CartaoIndicador from "./CartaoIndicador";
import { PERCENTUAL_CONCLUIDAS, RESUMO } from "./dadosMock";

export default function IndicadoresOperacionais() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CartaoIndicador
        icon={ClipboardCheck}
        tom="azul"
        rotulo="Rotinas previstas"
        valor={RESUMO.previstas}
        descricao="No período selecionado"
        variacao="+12% este mês"
        variacaoBoa
      />

      <CartaoIndicador
        icon={CircleCheck}
        tom="verde"
        rotulo="Concluídas"
        valor={RESUMO.concluidas}
        descricao={`${PERCENTUAL_CONCLUIDAS}% das rotinas previstas`}
        variacao="+8% este mês"
        variacaoBoa
      />

      <CartaoIndicador
        icon={TriangleAlert}
        tom="vermelho"
        rotulo="Ocorrências abertas"
        valor={RESUMO.ocorrenciasAbertas}
        descricao="Precisam de acompanhamento"
        variacao="+3% este mês"
        variacaoBoa={false}
      />

      <CartaoIndicador
        icon={Clock}
        tom="ambar"
        rotulo="Rotinas atrasadas"
        valor={RESUMO.atrasadas}
        descricao="Fora do prazo planejado"
        variacao="+2% este mês"
        variacaoBoa={false}
        acao={
          // TODO (grupo): levar para a lista de rotinas atrasadas.
          <a
            href="#"
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline"
          >
            Ver todas
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        }
      />
    </div>
  );
}