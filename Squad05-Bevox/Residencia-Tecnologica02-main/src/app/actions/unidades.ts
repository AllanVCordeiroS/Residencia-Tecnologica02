'use server';

import { revalidatePath } from 'next/cache';
import {
  atualizarUnidade,
  criarUnidade,
  listarUnidades,
  type AtualizarUnidadeInput,
  type CriarUnidadeInput,
} from '@/services/units';

export async function listarUnidadesAction(empresaId?: string) {
  try {
    const unidades = await listarUnidades(empresaId);
    return { ok: true as const, data: unidades };
  } catch (error) {
    console.error('Erro ao listar unidades:', error);
    return { ok: false as const, error: 'Falha ao carregar unidades.' };
  }
}

export async function criarUnidadeAction(input: CriarUnidadeInput) {
  try {
    const unidade = await criarUnidade(input);
    revalidatePath('/unidades');
    return { ok: true as const, data: unidade };
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    return { ok: false as const, error: 'Falha ao cadastrar unidade.' };
  }
}

export async function atualizarUnidadeAction(input: AtualizarUnidadeInput) {
  try {
    const unidade = await atualizarUnidade(input);
    revalidatePath('/unidades');
    return { ok: true as const, data: unidade };
  } catch (error) {
    console.error('Erro ao atualizar unidade:', error);
    return { ok: false as const, error: 'Falha ao atualizar unidade.' };
  }
}