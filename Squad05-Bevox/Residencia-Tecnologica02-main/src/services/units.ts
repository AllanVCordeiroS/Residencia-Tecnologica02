import { prisma } from '@/lib/prisma';

export interface CriarUnidadeInput {
  empresaId: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone?: string;
  status?: 'ATIVA' | 'INATIVA';
}

export interface AtualizarUnidadeInput {
  id: string;
  nome?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  telefone?: string | null;
  status?: 'ATIVA' | 'INATIVA';
}

export async function listarUnidades(empresaId?: string) {
  return prisma.unidade.findMany({
    where: empresaId ? { empresaId } : undefined,
    orderBy: { nome: 'asc' },
  });
}

export async function buscarUnidadePorId(id: string) {
  return prisma.unidade.findUnique({
    where: { id },
  });
}

export async function criarUnidade(input: CriarUnidadeInput) {
  return prisma.unidade.create({
    data: {
      empresaId: input.empresaId,
      nome: input.nome.trim(),
      cnpj: input.cnpj.replace(/\D/g, ''),
      endereco: input.endereco.trim(),
      cidade: input.cidade.trim(),
      estado: input.estado.trim().toUpperCase(),
      telefone: input.telefone?.trim() || null,
      status: input.status ?? 'ATIVA',
    },
  });
}

export async function atualizarUnidade(input: AtualizarUnidadeInput) {
  const { id, ...rest } = input;

  return prisma.unidade.update({
    where: { id },
    data: {
      ...(rest.nome !== undefined ? { nome: rest.nome.trim() } : {}),
      ...(rest.cnpj !== undefined ? { cnpj: rest.cnpj.replace(/\D/g, '') } : {}),
      ...(rest.endereco !== undefined ? { endereco: rest.endereco.trim() } : {}),
      ...(rest.cidade !== undefined ? { cidade: rest.cidade.trim() } : {}),
      ...(rest.estado !== undefined ? { estado: rest.estado.trim().toUpperCase() } : {}),
      ...(rest.telefone !== undefined ? { telefone: rest.telefone?.trim() || null } : {}),
      ...(rest.status !== undefined ? { status: rest.status } : {}),
    },
  });
}