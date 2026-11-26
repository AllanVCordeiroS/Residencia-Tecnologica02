import { prisma } from '@/lib/prisma';

export interface CriarUsuarioInput {
  empresaId: string;
  perfilAcessoId: string;
  unidadePrincipalId?: string;
  unidadesAutorizadasIds?: string[];
  nome: string;
  email: string;
  senhaHash: string;
  telefone?: string;
}

export interface AtualizarUsuarioInput {
  id: string;
  perfilAcessoId?: string;
  unidadePrincipalId?: string | null;
  unidadesAutorizadasIds?: string[];
  nome?: string;
  email?: string;
  telefone?: string | null;
  status?: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
}

export async function listarUsuarios(empresaId: string) {
  return prisma.usuario.findMany({
    where: { empresaId },
    include: {
      perfilAcesso: {
        select: { id: true, nome: true },
      },
      unidadePrincipal: {
        select: { id: true, nome: true },
      },
      unidadesAutorizadas: {
        include: {
          unidade: { select: { id: true, nome: true } },
        },
      },
    },
    orderBy: { nome: 'asc' },
  });
}

export async function buscarUsuarioPorId(id: string) {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      perfilAcesso: {
        include: {
          permissoes: {
            include: { permissao: true },
          },
        },
      },
      unidadePrincipal: true,
      unidadesAutorizadas: {
        include: { unidade: true },
      },
      preferenciaNotificacao: true,
    },
  });
}

export async function criarUsuario(input: CriarUsuarioInput) {
  const unidadesSet = new Set<string>(input.unidadesAutorizadasIds ?? []);
  if (input.unidadePrincipalId) {
    unidadesSet.add(input.unidadePrincipalId);
  }

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        empresaId: input.empresaId,
        perfilAcessoId: input.perfilAcessoId,
        unidadePrincipalId: input.unidadePrincipalId ?? null,
        nome: input.nome.trim(),
        email: input.email.trim().toLowerCase(),
        senha: input.senhaHash,
        telefone: input.telefone?.trim() || null,
        status: 'ATIVO',
        unidadesAutorizadas:
          unidadesSet.size > 0
            ? {
                create: Array.from(unidadesSet).map((unidadeId) => ({
                  unidadeId,
                })),
              }
            : undefined,
        preferenciaNotificacao: {
          create: {
            canalSistemaAtivo: true,
          },
        },
      },
      include: {
        perfilAcesso: { select: { id: true, nome: true } },
        unidadePrincipal: { select: { id: true, nome: true } },
      },
    });

    return usuario;
  });
}

export async function atualizarUsuario(input: AtualizarUsuarioInput) {
  const { id, unidadesAutorizadasIds, ...rest } = input;

  return prisma.$transaction(async (tx) => {
    if (unidadesAutorizadasIds !== undefined) {
      await tx.usuarioUnidade.deleteMany({
        where: { usuarioId: id },
      });

      const unidadesSet = new Set<string>(unidadesAutorizadasIds);
      if (rest.unidadePrincipalId) {
        unidadesSet.add(rest.unidadePrincipalId);
      }

      if (unidadesSet.size > 0) {
        await tx.usuarioUnidade.createMany({
          data: Array.from(unidadesSet).map((unidadeId) => ({
            usuarioId: id,
            unidadeId,
          })),
        });
      }
    }

    return tx.usuario.update({
      where: { id },
      data: {
        ...(rest.perfilAcessoId !== undefined ? { perfilAcessoId: rest.perfilAcessoId } : {}),
        ...(rest.unidadePrincipalId !== undefined
          ? { unidadePrincipalId: rest.unidadePrincipalId }
          : {}),
        ...(rest.nome !== undefined ? { nome: rest.nome.trim() } : {}),
        ...(rest.email !== undefined ? { email: rest.email.trim().toLowerCase() } : {}),
        ...(rest.telefone !== undefined ? { telefone: rest.telefone?.trim() || null } : {}),
        ...(rest.status !== undefined ? { status: rest.status } : {}),
      },
    });
  });
}

export async function listarPerfisAcesso(empresaId: string) {
  return prisma.perfilAcesso.findMany({
    where: { empresaId },
    include: {
      permissoes: {
        include: { permissao: true },
      },
      _count: {
        select: { usuarios: true },
      },
    },
    orderBy: { nome: 'asc' },
  });
}

export async function listarPermissoesGlobais() {
  return prisma.permissao.findMany({
    orderBy: [{ modulo: 'asc' }, { nome: 'asc' }],
  });
}