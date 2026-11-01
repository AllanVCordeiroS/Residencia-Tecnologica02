'use client';

import { Workflow } from 'lucide-react';

import {
  OPCOES_METODO_PAGAMENTO,
  OPCOES_METODO_RECEBIMENTO,
} from '@/lib/configuracoes-mock';
import type { ParametrosIntegracoes as ParametrosIntegracoesTipo } from '@/types/configuracoes';

import { CampoSelect, Interruptor } from './CamposFormulario';
import { CartaoSecao } from './CartaoSecao';

interface ParametrosIntegracoesProps {
  valor: ParametrosIntegracoesTipo;
  onChange: (valor: ParametrosIntegracoesTipo) => void;
}

const CLASSE_TEXTO_INTERRUPTOR = 'text-sm font-semibold text-slate-900';

export function ParametrosIntegracoes({
  valor,
  onChange,
}: ParametrosIntegracoesProps) {
  return (
    <CartaoSecao
      icone={Workflow}
      titulo="Parâmetros e Integrações"
      descricao="Conexão direta entre faturamento, expedição e contas a receber."
    >
      <div className="flex flex-col gap-3">
        <Interruptor
          ativo={valor.vincularVendasClientesAutomaticamente}
          texto="Vincular Vendas a Clientes Automaticamente"
          classeTexto={CLASSE_TEXTO_INTERRUPTOR}
          onChange={(vincularVendasClientesAutomaticamente) =>
            onChange({ ...valor, vincularVendasClientesAutomaticamente })
          }
        />

        <Interruptor
          ativo={valor.exigirCentroCustoLancamentos}
          texto="Exigir Centro de Custo em Lançamentos"
          classeTexto={CLASSE_TEXTO_INTERRUPTOR}
          onChange={(exigirCentroCustoLancamentos) =>
            onChange({ ...valor, exigirCentroCustoLancamentos })
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <CampoSelect
          rotulo="Métodos de Pagamento Padrão"
          valor={valor.metodoPagamentoPadrao}
          opcoes={OPCOES_METODO_PAGAMENTO}
          onChange={(metodoPagamentoPadrao) =>
            onChange({ ...valor, metodoPagamentoPadrao })
          }
        />

        <CampoSelect
          rotulo="Método de Recebimento Padrão"
          valor={valor.metodoRecebimentoPadrao}
          opcoes={OPCOES_METODO_RECEBIMENTO}
          onChange={(metodoRecebimentoPadrao) =>
            onChange({ ...valor, metodoRecebimentoPadrao })
          }
        />
      </div>
    </CartaoSecao>
  );
}
