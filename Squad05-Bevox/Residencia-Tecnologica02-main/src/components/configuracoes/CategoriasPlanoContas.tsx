'use client';

import { useState, type KeyboardEvent } from 'react';
import {
  ArrowUpDown,
  Check,
  GripVertical,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import type { CategoriaPlanoContas } from '@/types/configuracoes';

import { CartaoSecao } from './CartaoSecao';

interface CategoriasPlanoContasProps {
  categorias: CategoriaPlanoContas[];
  onChange: (categorias: CategoriaPlanoContas[]) => void;
}

export function CategoriasPlanoContas({
  categorias,
  onChange,
}: CategoriasPlanoContasProps) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novaId, setNovaId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState('');
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  function iniciarEdicao(categoria: CategoriaPlanoContas) {
    setEditandoId(categoria.id);
    setRascunho(categoria.nome);
  }

  function encerrarEdicao() {
    setEditandoId(null);
    setNovaId(null);
    setRascunho('');
  }

  function cancelarEdicao() {
    if (novaId && editandoId === novaId) {
      onChange(categorias.filter((categoria) => categoria.id !== novaId));
    }
    encerrarEdicao();
  }

  function confirmarEdicao() {
    const nome = rascunho.trim();
    if (!editandoId) return;
    if (!nome) {
      cancelarEdicao();
      return;
    }
    onChange(
      categorias.map((categoria) =>
        categoria.id === editandoId ? { ...categoria, nome } : categoria,
      ),
    );
    encerrarEdicao();
  }

  function aoDigitar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      confirmarEdicao();
    }
    if (evento.key === 'Escape') cancelarEdicao();
  }

  function adicionarCategoria() {
    const categoriasAtuais =
      novaId && editandoId === novaId
        ? categorias.filter((categoria) => categoria.id !== novaId)
        : categorias;
    if (editandoId) encerrarEdicao();
    const id = crypto.randomUUID();
    onChange([...categoriasAtuais, { id, nome: '' }]);
    setNovaId(id);
    setEditandoId(id);
    setRascunho('');
  }

  function excluir(categoria: CategoriaPlanoContas) {
    if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
    onChange(categorias.filter((item) => item.id !== categoria.id));
  }

  function ordenarPorNome() {
    const ordenadas = [...categorias].sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR'),
    );
    onChange(ordemAscendente ? ordenadas : ordenadas.reverse());
    setOrdemAscendente((atual) => !atual);
  }

  function mover(origemId: string, destinoId: string) {
    if (origemId === destinoId) return;
    const origem = categorias.findIndex((c) => c.id === origemId);
    const destino = categorias.findIndex((c) => c.id === destinoId);
    if (origem < 0 || destino < 0) return;

    const copia = [...categorias];
    const [removida] = copia.splice(origem, 1);
    copia.splice(destino, 0, removida);
    onChange(copia);
  }

  function moverPorTeclado(
    evento: KeyboardEvent<HTMLButtonElement>,
    indice: number,
  ) {
    const deslocamento =
      evento.key === 'ArrowUp' ? -1 : evento.key === 'ArrowDown' ? 1 : 0;
    if (deslocamento === 0) return;

    evento.preventDefault();
    const alvo = categorias[indice + deslocamento];
    if (alvo) mover(categorias[indice].id, alvo.id);
  }

  return (
    <CartaoSecao
      icone={ListChecks}
      titulo="Categorias e Plano de Contas"
      descricao="Controle das categorias e subcategorias do plano de Contas."
    >
      <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-500">
        <button
          type="button"
          onClick={ordenarPorNome}
          aria-label="Ordenar categorias por nome"
          className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Categoria
          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
        </button>
        <span className="uppercase tracking-wide">Ações</span>
      </div>

      <ul className="mt-1">
        {categorias.map((categoria, indice) => {
          const emEdicao = editandoId === categoria.id;

          return (
            <li
              key={categoria.id}
              draggable={!emEdicao}
              onDragStart={() => setArrastandoId(categoria.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (arrastandoId) mover(arrastandoId, categoria.id);
                setArrastandoId(null);
              }}
              onDragEnd={() => setArrastandoId(null)}
              className={`flex items-center gap-2 px-3 py-3.5 transition-opacity ${
                arrastandoId === categoria.id ? 'opacity-40' : ''
              }`}
            >
              <button
                type="button"
                aria-label={`Reordenar ${categoria.nome || 'nova categoria'} (use as setas para cima e para baixo)`}
                onKeyDown={(e) => moverPorTeclado(e, indice)}
                className="cursor-grab rounded text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </button>

              {emEdicao ? (
                <input
                  autoFocus
                  type="text"
                  value={rascunho}
                  placeholder="Nome da categoria"
                  aria-label="Nome da categoria"
                  onChange={(e) => setRascunho(e.target.value)}
                  onKeyDown={aoDigitar}
                  className="h-9 min-w-0 flex-1 rounded-md border border-blue-600 bg-white px-2 text-sm text-slate-900 outline-none ring-2 ring-blue-600/20"
                />
              ) : (
                <span className="min-w-0 flex-1 text-sm text-slate-900">
                  {categoria.nome}
                </span>
              )}

              <div className="flex items-center gap-3">
                {emEdicao ? (
                  <>
                    <button
                      type="button"
                      onClick={confirmarEdicao}
                      aria-label="Confirmar nome da categoria"
                      className="text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicao}
                      aria-label="Cancelar edição"
                      className="text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(categoria)}
                      aria-label={`Editar ${categoria.nome}`}
                      className="text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => excluir(categoria)}
                      aria-label={`Excluir ${categoria.nome}`}
                      className="text-red-600 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}

        {categorias.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-slate-500">
            Nenhuma categoria cadastrada. Adicione a primeira para montar o plano de contas.
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={adicionarCategoria}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Adicionar Nova Categoria
      </button>
    </CartaoSecao>
  );
}
