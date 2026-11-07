'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { salvarParametrosFinanceiros } from '@/lib/configuracoes-mock';
import type {
  ErrosParametrosFinanceiros,
  ParametrosFinanceiros,
} from '@/types/configuracoes';

import { CategoriasPlanoContas } from './CategoriasPlanoContas';
import { ConfiguracoesGeraisFinancas } from './ConfiguracoesGeraisFinancas';
import { ParametrosIntegracoes } from './ParametrosIntegracoes';
import { RegrasVencimentoCobranca } from './RegrasVencimentoCobranca';

interface ParametrosFinanceirosFormProps {
  valoresIniciais: ParametrosFinanceiros;
}

type StatusEnvio =
  | { tipo: 'ocioso' }
  | { tipo: 'salvando' }
  | { tipo: 'sucesso'; mensagem: string }
  | { tipo: 'erro'; mensagem: string };

const percentualValido = (n: number) =>
  Number.isFinite(n) && n >= 0 && n <= 100;

function validar(dados: ParametrosFinanceiros): ErrosParametrosFinanceiros {
  const erros: ErrosParametrosFinanceiros = {};
  const { configuracaoGeral, regras } = dados;

  if (!configuracaoGeral.simboloMonetario.trim()) {
    erros.simboloMonetario = 'Informe o símbolo monetário.';
  }
  if (!configuracaoGeral.simboloMonetarioAlternativo.trim()) {
    erros.simboloMonetarioAlternativo = 'Informe o símbolo monetário alternativo.';
  }
  if (!percentualValido(regras.multaAtrasoPercentual)) {
    erros.multaAtrasoPercentual = 'Informe um valor entre 0 e 100.';
  }
  if (!percentualValido(regras.jurosMoraMensalPercentual)) {
    erros.jurosMoraMensalPercentual = 'Informe um valor entre 0 e 100.';
  }

  return erros;
}

export function ParametrosFinanceirosForm({
  valoresIniciais,
}: ParametrosFinanceirosFormProps) {
  const router = useRouter();

  const [dados, setDados] = useState<ParametrosFinanceiros>(valoresIniciais);
  const [erros, setErros] = useState<ErrosParametrosFinanceiros>({});
  const [status, setStatus] = useState<StatusEnvio>({ tipo: 'ocioso' });

  const salvando = status.tipo === 'salvando';

  function atualizar<K extends keyof ParametrosFinanceiros>(
    chave: K,
    valor: ParametrosFinanceiros[K],
  ) {
    setDados((atual) => ({ ...atual, [chave]: valor }));
    if (!salvando) setStatus({ tipo: 'ocioso' });
  }

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (salvando) return;

    const novosErros = validar(dados);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      setStatus({
        tipo: 'erro',
        mensagem: 'Revise os campos destacados antes de salvar.',
      });
      return;
    }

    setStatus({ tipo: 'salvando' });

    try {
      await salvarParametrosFinanceiros(dados);
      setStatus({ tipo: 'sucesso', mensagem: 'Alterações salvas.' });
    } catch (erro: unknown) {
      console.error('Erro ao salvar parâmetros financeiros:', erro);
      setStatus({
        tipo: 'erro',
        mensagem: 'Não foi possível salvar as alterações. Tente novamente.',
      });
    }
  }

  return (
    <form onSubmit={aoEnviar} noValidate className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <ConfiguracoesGeraisFinancas
          valor={dados.configuracaoGeral}
          erros={erros}
          onChange={(valor) => atualizar('configuracaoGeral', valor)}
        />

        <CategoriasPlanoContas
          categorias={dados.categorias}
          onChange={(valor) => atualizar('categorias', valor)}
        />

        <RegrasVencimentoCobranca
          valor={dados.regras}
          erros={erros}
          onChange={(valor) => atualizar('regras', valor)}
        />

        <ParametrosIntegracoes
          valor={dados.integracoes}
          onChange={(valor) => atualizar('integracoes', valor)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={salvando}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </button>

        <button
          type="submit"
          disabled={salvando}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {salvando ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${
            status.tipo === 'erro' ? 'text-red-600' : 'text-emerald-700'
          }`}
        >
          {status.tipo === 'sucesso' || status.tipo === 'erro'
            ? status.mensagem
            : ''}
        </p>
      </div>
    </form>
  );
}
