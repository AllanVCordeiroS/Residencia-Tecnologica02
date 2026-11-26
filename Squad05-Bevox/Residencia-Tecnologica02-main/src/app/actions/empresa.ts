'use server';

import { revalidatePath } from 'next/cache';
import {
  atualizarEmpresa,
  buscarEmpresaAtual,
  type AtualizarEmpresaInput,
} from '@/services/empresa';

export async function obterEmpresaAction() {
  try {
    const empresa = await buscarEmpresaAtual();
    return { ok: true as const, data: empresa };
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return { ok: false as const, error: 'Falha ao carregar dados da empresa.' };
  }
}

export async function salvarEmpresaAction(input: AtualizarEmpresaInput) {
  try {
    const empresa = await atualizarEmpresa(input);
    revalidatePath('/configuracoes/empresa');
    revalidatePath('/unidades');
    return { ok: true as const, data: empresa };
  } catch (error) {
    console.error('Erro ao salvar empresa:', error);
    return { ok: false as const, error: 'Falha ao atualizar os dados da empresa.' };
  }
}