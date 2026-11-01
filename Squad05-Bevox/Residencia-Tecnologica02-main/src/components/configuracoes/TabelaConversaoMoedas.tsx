'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import type { MoedaConversao } from '@/types/configuracoes';

const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function formatarDataAvaliacao(iso: string): string {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));

  const pegar = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? '';

  return `${pegar('day')} ${MESES[Number(pegar('month')) - 1]}, ${pegar('year')} às ${pegar('hour')}:${pegar('minute')}`;
}

interface MenuAcoesMoedaProps {
  codigo: string;
  podeEditar: boolean;
  onEditar: () => void;
  onRemover: () => void;
}

function MenuAcoesMoeda({
  codigo,
  podeEditar,
  onEditar,
  onRemover,
}: MenuAcoesMoedaProps) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const fecharAoClicarFora = (evento: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    };
    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAberto(false);
    };

    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEsc);
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEsc);
    };
  }, [aberto]);

  return (
    <div ref={raiz} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Ações para ${codigo}`}
        onClick={() => setAberto((atual) => !atual)}
        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled={!podeEditar}
            title={
              podeEditar
                ? undefined
                : 'Desative a conversão automática para editar a taxa manualmente.'
            }
            onClick={() => {
              setAberto(false);
              onEditar();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar conversão
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAberto(false);
              onRemover();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remover moeda
          </button>
        </div>
      )}
    </div>
  );
}

interface TabelaConversaoMoedasProps {
  moedas: MoedaConversao[];
  conversaoAutomaticaAtiva: boolean;
  onChange: (moedas: MoedaConversao[]) => void;
}

export function TabelaConversaoMoedas({
  moedas,
  conversaoAutomaticaAtiva,
  onChange,
}: TabelaConversaoMoedasProps) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState('');
  const ignorarProximoBlur = useRef(false);

  function iniciarEdicao(moeda: MoedaConversao) {
    ignorarProximoBlur.current = false;
    setEditandoId(moeda.id);
    setRascunho(moeda.taxaConversao.toFixed(2));
  }

  function confirmarEdicao() {
    const taxa = Number(rascunho.replace(',', '.'));

    if (editandoId && Number.isFinite(taxa) && taxa > 0) {
      onChange(
        moedas.map((moeda) =>
          moeda.id === editandoId
            ? {
                ...moeda,
                taxaConversao: taxa,
                dataAvaliacaoHistorica: new Date().toISOString(),
              }
            : moeda,
        ),
      );
    }
    setEditandoId(null);
  }

  function remover(id: string) {
    onChange(moedas.filter((moeda) => moeda.id !== id));
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Taxas de conversão das moedas alternativas
        </caption>
        <thead className="bg-slate-100 text-xs font-medium text-slate-500">
          <tr>
            <th scope="col" className="px-3 py-3">Moeda</th>
            <th scope="col" className="px-3 py-3">Conversão (%)</th>
            <th scope="col" className="px-3 py-3">Data Avaliação Histórica</th>
            <th scope="col" className="px-3 py-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 bg-slate-50">
          {moedas.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                Nenhuma moeda configurada.
              </td>
            </tr>
          )}

          {moedas.map((moeda) => (
            <tr key={moeda.id}>
              <td className="px-3 py-3">
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  <span aria-hidden="true" className="text-base leading-none">
                    {moeda.bandeira}
                  </span>
                  {moeda.codigo}
                </span>
              </td>

              <td className="px-3 py-3 text-slate-700">
                {editandoId === moeda.id ? (
                  <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    value={rascunho}
                    aria-label={`Taxa de conversão de ${moeda.codigo}`}
                    onChange={(e) => setRascunho(e.target.value)}
                    onBlur={() => {
                      if (ignorarProximoBlur.current) {
                        ignorarProximoBlur.current = false;
                        return;
                      }
                      confirmarEdicao();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        ignorarProximoBlur.current = true;
                        confirmarEdicao();
                      }
                      if (e.key === 'Escape') {
                        ignorarProximoBlur.current = true;
                        setEditandoId(null);
                      }
                    }}
                    className="h-8 w-20 rounded-md border border-blue-600 bg-white px-2 text-sm outline-none ring-2 ring-blue-600/20"
                  />
                ) : (
                  moeda.taxaConversao.toFixed(2)
                )}
              </td>

              <td className="px-3 py-3 text-slate-600">
                {formatarDataAvaliacao(moeda.dataAvaliacaoHistorica)}
              </td>

              <td className="px-3 py-3 text-right">
                <MenuAcoesMoeda
                  codigo={moeda.codigo}
                  podeEditar={!conversaoAutomaticaAtiva}
                  onEditar={() => iniciarEdicao(moeda)}
                  onRemover={() => remover(moeda.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
