import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface AtualizarEmpresaInput {
  id: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  status?: 'ATIVA' | 'INATIVA' | 'SUSPENSA';
}

export interface AtualizarConfiguracaoFinanceiraInput {
  empresaId: string;
  moedaPadrao?: string;
  configuracoesVencimento?: Prisma.InputJsonValue;
  configuracoesCobranca?: Prisma.InputJsonValue;
  preferenciasFinanceiras?: Prisma.InputJsonValue;
}

export async function buscarEmpresaAtual() {
  return prisma.empresa.findFirst({
    include: {
      configuracaoFinanceira: true,
      _count: {
        select: {
          unidades: true,
          usuarios: true,
        },
      },
    },
    orderBy: { dataCadastro: 'asc' },
  });
}

export async function buscarEmpresaPorId(id: string) {
  return prisma.empresa.findUnique({
    where: { id },
    include: {
      configuracaoFinanceira: true,
      unidades: {
        orderBy: { nome: 'asc' },
      },
    },
  });
}

export async function atualizarEmpresa(input: AtualizarEmpresaInput) {
  const { id, ...rest } = input;

  return prisma.empresa.update({
    where: { id },
    data: {
      ...(rest.razaoSocial !== undefined ? { razaoSocial: rest.razaoSocial.trim() } : {}),
      ...(rest.nomeFantasia !== undefined ? { nomeFantasia: rest.nomeFantasia.trim() } : {}),
      ...(rest.cnpj !== undefined ? { cnpj: rest.cnpj.replace(/\D/g, '') } : {}),
      ...(rest.email !== undefined ? { email: rest.email.trim().toLowerCase() } : {}),
      ...(rest.telefone !== undefined ? { telefone: rest.telefone.trim() } : {}),
      ...(rest.status !== undefined ? { status: rest.status } : {}),
    },
  });
}

export async function salvarConfiguracaoFinanceira(input: AtualizarConfiguracaoFinanceiraInput) {
  return prisma.configuracaoFinanceira.upsert({
    where: { empresaId: input.empresaId },
    create: {
      empresaId: input.empresaId,
      moedaPadrao: (input.moedaPadrao ?? 'BRL').toUpperCase(),
      configuracoesVencimento: input.configuracoesVencimento ?? { diasAlertaAntecipado: 5 },
      configuracoesCobranca: input.configuracoesCobranca ?? { permitirVencido: false },
      ...(input.preferenciasFinanceiras !== undefined
        ? { preferenciasFinanceiras: input.preferenciasFinanceiras }
        : {}),
    },
    update: {
      ...(input.moedaPadrao !== undefined
        ? { moedaPadrao: input.moedaPadrao.toUpperCase() }
        : {}),
      ...(input.configuracoesVencimento !== undefined
        ? { configuracoesVencimento: input.configuracoesVencimento }
        : {}),
      ...(input.configuracoesCobranca !== undefined
        ? { configuracoesCobranca: input.configuracoesCobranca }
        : {}),
      ...(input.preferenciasFinanceiras !== undefined
        ? { preferenciasFinanceiras: input.preferenciasFinanceiras }
        : {}),
    },
  });
}