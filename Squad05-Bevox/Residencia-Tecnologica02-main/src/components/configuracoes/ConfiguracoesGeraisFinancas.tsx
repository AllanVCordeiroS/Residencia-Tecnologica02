'use client';

import { Network } from 'lucide-react';

import {
  OPCOES_MOEDA_BASE,
  SIMBOLO_POR_MOEDA,
} from '@/lib/configuracoes-mock';
import type {
  CodigoMoeda,
  ConfiguracaoGeralFinancas,
  ErrosParametrosFinanceiros,
} from '@/types/configuracoes';

import { Campo, CampoSelect, CampoTexto, Interruptor } from './CamposFormulario';
import { CartaoSecao } from './CartaoSecao';
import { TabelaConversaoMoedas } from './TabelaConversaoMoedas';

interface ConfiguracoesGeraisFinancasProps {
  valor: ConfiguracaoGeralFinancas;
  onChange: (valor: ConfiguracaoGeralFinancas) => void;
  erros: ErrosParametrosFinanceiros;
}

export function ConfiguracoesGeraisFinancas({
  valor,
  onChange,
  erros,
}: ConfiguracoesGeraisFinancasProps) {
  function alterarMoedaBase(codigo: CodigoMoeda) {
    onChange({
      ...valor,
      moedaBase: codigo,
      simboloMonetario: SIMBOLO_POR_MOEDA[codigo],
    });
  }

  return (
    <CartaoSecao
      icone={Network}
      titulo="Configurações Gerais de Finanças"
      descricao="Configurações gerais de Finanças e conversão de moedas."
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <CampoSelect
          rotulo="Moeda Base (Local)"
          obrigatorio
          valor={valor.moedaBase}
          opcoes={OPCOES_MOEDA_BASE}
          onChange={alterarMoedaBase}
        />

        <CampoTexto
          rotulo="Símbolo Monetário"
          obrigatorio
          valor={valor.simboloMonetario}
          maxLength={5}
          erro={erros.simboloMonetario}
          onChange={(simboloMonetario) =>
            onChange({ ...valor, simboloMonetario })
          }
        />

        <CampoTexto
          rotulo="Símbolo Monetário Alternativo"
          obrigatorio
          valor={valor.simboloMonetarioAlternativo}
          maxLength={5}
          erro={erros.simboloMonetarioAlternativo}
          onChange={(simboloMonetarioAlternativo) =>
            onChange({ ...valor, simboloMonetarioAlternativo })
          }
        />

        <Campo rotulo="Conversão Automática (API)" obrigatorio>
          <div className="flex h-10 items-center">
            <Interruptor
              ativo={valor.conversaoAutomaticaAtiva}
              ariaLabel="Conversão automática (API)"
              texto={valor.conversaoAutomaticaAtiva ? 'Ativo' : 'Inativo'}
              onChange={(conversaoAutomaticaAtiva) =>
                onChange({ ...valor, conversaoAutomaticaAtiva })
              }
            />
          </div>
        </Campo>
      </div>

      <div className="mt-5">
        <TabelaConversaoMoedas
          moedas={valor.moedas}
          conversaoAutomaticaAtiva={valor.conversaoAutomaticaAtiva}
          onChange={(moedas) => onChange({ ...valor, moedas })}
        />
      </div>
    </CartaoSecao>
  );
}
