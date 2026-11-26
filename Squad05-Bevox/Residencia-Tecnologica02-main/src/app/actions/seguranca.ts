'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { buscarEmpresaAtual } from '@/services/empresa';
import { listarPerfisAcesso } from '@/services/usuarios';

export async function listarPerfisSegurancaAction() {
  try {
    const empresa = await buscarEmpresaAtual();
    if (!empresa) {
      return { ok: true as const, data: [] };
    }
    const perfis = await listarPerfisAcesso(empresa.id);
    return { ok: true as const, data: perfis };
  } catch (error) {
    console.error('Erro ao listar perfis de acesso:', error);
    return { ok: false as const, error: 'Falha ao carregar perfis de acesso.' };
  }
}

export async function criarPerfilAcessoAction(input: {
  nome: string;
  descricao?: string;
}) {
  try {
    const empresa = await buscarEmpresaAtual();
    if (!empresa) {
      return {
        ok: false as const,
        error: 'Nenhuma empresa cadastrada no banco para vincular o perfil.',
      };
    }

    const nomeLimpo = input.nome.trim();
    if (!nomeLimpo) {
      return { ok: false as const, error: 'Informe o nome do perfil de acesso.' };
    }

    const perfil = await prisma.perfilAcesso.create({
      data: {
        empresaId: empresa.id,
        nome: nomeLimpo,
        descricao: input.descricao?.trim() || 'Perfil personalizado',
      },
      include: {
        permissoes: {
          include: { permissao: true },
        },
        _count: {
          select: { usuarios: true },
        },
      },
    });

    revalidatePath('/configuracoes/seguranca');
    return { ok: true as const, data: perfil };
  } catch (error) {
    console.error('Erro ao criar perfil de acesso:', error);
    return { ok: false as const, error: 'Falha ao criar perfil de acesso no banco.' };
  }
}