'use client';

import { CalendarDays, Info } from 'lucide-react';

import {
  OPCOES_PRAZO_FORNECEDORES,
  OPCOES_REGRA_DIAS_NAO_UTEIS,
} from '@/lib/configuracoes-mock';
import type {
  ErrosParametrosFinanceiros,
  RegrasVencimentoCobranca as RegrasVencimentoCobrancaTipo,
} from '@/types/configuracoes';

import { CampoPercentual, CampoSelect } from './CamposFormulario';
import { CartaoSecao } from './CartaoSecao';

interface RegrasVencimentoCobrancaProps {
  valor: RegrasVencimentoCobrancaTipo;
  onChange: (valor: RegrasVencimentoCobrancaTipo) => void;
  erros: ErrosParametrosFinanceiros;
}

export function RegrasVencimentoCobranca({
  valor,
  onChange,
  erros,
}: RegrasVencimentoCobrancaProps) {
  return (
    <CartaoSecao
      icone={CalendarDays}
      titulo="Regras Gerais de Vencimento e Cobrança"
      descricao="Diretrizes automáticas para fluxo de caixa, pagamentos e juros."
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <CampoSelect
          rotulo="Prazo Padrão (Fornecedores)"
          obrigatorio
          valor={valor.prazoPadraoFornecedoresDias}
          opcoes={OPCOES_PRAZO_FORNECEDORES}
          onChange={(prazoPadraoFornecedoresDias) =>
            onChange({ ...valor, prazoPadraoFornecedoresDias })
          }
        />

        <CampoSelect
          rotulo="Regra para Dias Não-Úteis"
          obrigatorio
          valor={valor.regraDiasNaoUteis}
          opcoes={OPCOES_REGRA_DIAS_NAO_UTEIS}
          onChange={(regraDiasNaoUteis) =>
            onChange({ ...valor, regraDiasNaoUteis })
          }
        />

        <CampoPercentual
          rotulo="Multa por Atraso (%)"
          obrigatorio
          valor={valor.multaAtrasoPercentual}
          erro={erros.multaAtrasoPercentual}
          onChange={(multaAtrasoPercentual) =>
            onChange({ ...valor, multaAtrasoPercentual })
          }
        />

        <CampoPercentual
          rotulo="Juros Mora p/ Mês (%)"
          obrigatorio
          valor={valor.jurosMoraMensalPercentual}
          erro={erros.jurosMoraMensalPercentual}
          onChange={(jurosMoraMensalPercentual) =>
            onChange({ ...valor, jurosMoraMensalPercentual })
          }
        />
      </div>

      <p className="mt-4 flex items-center gap-2 text-[13px] text-slate-600">
        <Info className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
        Aplicado automaticamente em notas e boletos expedidos via SEFAZ.
      </p>
    </CartaoSecao>
  );
}
