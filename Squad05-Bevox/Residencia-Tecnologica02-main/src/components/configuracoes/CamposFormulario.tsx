'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import type { OpcaoSelect } from '@/types/configuracoes';

export function classeControle(comErro: boolean): string {
  return [
    'h-10 w-full rounded-lg border bg-slate-50 px-3 text-sm text-slate-900',
    'outline-none transition-colors placeholder:text-slate-400',
    'focus:bg-white focus:ring-2',
    comErro
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200/70 focus:border-blue-600 focus:ring-blue-600/20',
  ].join(' ');
}

interface CampoProps {
  id?: string;
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  children: ReactNode;
}

export function Campo({ id, rotulo, obrigatorio, erro, children }: CampoProps) {
  const classeRotulo = 'mb-1.5 block text-xs font-medium text-slate-700';
  const conteudo = (
    <>
      {rotulo}
      {obrigatorio && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </>
  );

  return (
    <div>
      {id ? (
        <label htmlFor={id} className={classeRotulo}>
          {conteudo}
        </label>
      ) : (
        <span className={classeRotulo}>{conteudo}</span>
      )}

      {children}

      {erro && (
        <p
          id={id ? `${id}-erro` : undefined}
          role="alert"
          className="mt-1 text-xs text-red-600"
        >
          {erro}
        </p>
      )}
    </div>
  );
}

interface CampoTextoProps {
  rotulo: string;
  obrigatorio?: boolean;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
  placeholder?: string;
  maxLength?: number;
}

export function CampoTexto({
  rotulo,
  obrigatorio,
  valor,
  onChange,
  erro,
  placeholder,
  maxLength,
}: CampoTextoProps) {
  const id = useId();

  return (
    <Campo id={id} rotulo={rotulo} obrigatorio={obrigatorio} erro={erro}>
      <input
        id={id}
        type="text"
        value={valor}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={classeControle(Boolean(erro))}
      />
    </Campo>
  );
}

interface CampoSelectProps<T extends string | number> {
  rotulo: string;
  obrigatorio?: boolean;
  valor: T;
  opcoes: OpcaoSelect<T>[];
  onChange: (valor: T) => void;
  erro?: string;
}

export function CampoSelect<T extends string | number>({
  rotulo,
  obrigatorio,
  valor,
  opcoes,
  onChange,
  erro,
}: CampoSelectProps<T>) {
  const id = useId();

  return (
    <Campo id={id} rotulo={rotulo} obrigatorio={obrigatorio} erro={erro}>
      <div className="relative">
        <select
          id={id}
          value={String(valor)}
          onChange={(e) => {
            const escolhida = opcoes.find(
              (opcao) => String(opcao.valor) === e.target.value,
            );
            if (escolhida) onChange(escolhida.valor);
          }}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={`${classeControle(Boolean(erro))} appearance-none pr-9`}
        >
          {opcoes.map((opcao) => (
            <option key={String(opcao.valor)} value={String(opcao.valor)}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
    </Campo>
  );
}

const formatarPercentual = (valor: number) => valor.toFixed(2);

function analisarPercentual(texto: string): number {
  if (texto.trim() === '') return Number.NaN;
  return Number(texto.replace(',', '.'));
}

interface CampoPercentualProps {
  rotulo: string;
  obrigatorio?: boolean;
  valor: number;
  onChange: (valor: number) => void;
  erro?: string;
}

export function CampoPercentual({
  rotulo,
  obrigatorio,
  valor,
  onChange,
  erro,
}: CampoPercentualProps) {
  const id = useId();
  const [rascunho, setRascunho] = useState(() => ({
    valor,
    texto: formatarPercentual(valor),
  }));
  const texto = Object.is(rascunho.valor, valor)
    ? rascunho.texto
    : formatarPercentual(valor);

  return (
    <Campo id={id} rotulo={rotulo} obrigatorio={obrigatorio} erro={erro}>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
          aria-hidden="true"
        >
          %
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={texto}
          onChange={(e) => {
            const numero = analisarPercentual(e.target.value);
            setRascunho({
              valor: numero,
              texto: e.target.value,
            });
            onChange(numero);
          }}
          onBlur={() => {
            if (Number.isFinite(valor)) {
              setRascunho({ valor, texto: formatarPercentual(valor) });
            }
          }}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={`${classeControle(Boolean(erro))} pl-8`}
        />
      </div>
    </Campo>
  );
}

interface InterruptorProps {
  ativo: boolean;
  onChange: (ativo: boolean) => void;
  texto: string;
  ariaLabel?: string;
  classeTexto?: string;
}

export function Interruptor({
  ativo,
  onChange,
  texto,
  ariaLabel,
  classeTexto = 'text-sm font-medium text-slate-900',
}: InterruptorProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={ativo}
        aria-label={ariaLabel ?? texto}
        onClick={() => onChange(!ativo)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
          ativo ? 'bg-blue-700' : 'bg-slate-300'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            ativo ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className={classeTexto}>{texto}</span>
    </div>
  );
}
