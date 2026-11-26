'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buscarEmpresaAtual } from '@/services/empresa';

export interface ConfiguracaoFinanceiraPayload {
  moedaPadrao: string;
  diasAvisoVencimento: number;
  bloquearAposVencimento: boolean;
  multaPercentual: number;
  jurosMensalPercentual: number;
  observacoesPadrao?: string;
}

const VENCIMENTO_PADRAO = {
  diasAvisoVencimento: 7,
  bloquearAposVencimento: false,
};

const COBRANCA_PADRAO = {
  multaPercentual: 2,
  jurosMensalPercentual: 1,
};

function extrairConfiguracao(row: {
  moedaPadrao: string;
  configuracoesVencimento: Prisma.JsonValue;
  configuracoesCobranca: Prisma.JsonValue;
  preferenciasFinanceiras: Prisma.JsonValue;
}): ConfiguracaoFinanceiraPayload {
  const venc =
    row.configuracoesVencimento && typeof row.configuracoesVencimento === 'object' && !Array.isArray(row.configuracoesVencimento)
      ? (row.configuracoesVencimento as Record<string, unknown>)
      : {};

  const cob =
    row.configuracoesCobranca && typeof row.configuracoesCobranca === 'object' && !Array.isArray(row.configuracoesCobranca)
      ? (row.configuracoesCobranca as Record<string, unknown>)
      : {};

  const pref =
    row.preferenciasFinanceiras && typeof row.preferenciasFinanceiras === 'object' && !Array.isArray(row.preferenciasFinanceiras)
      ? (row.preferenciasFinanceiras as Record<string, unknown>)
      : {};

  return {
    moedaPadrao: row.moedaPadrao || 'BRL',
    diasAvisoVencimento:
      typeof venc.diasAvisoVencimento === 'number' ? venc.diasAvisoVencimento : 7,
    bloquearAposVencimento: Boolean(venc.bloquearAposVencimento),
    multaPercentual:
      typeof cob.multaPercentual === 'number' ? cob.multaPercentual : 2,
    jurosMensalPercentual:
      typeof cob.jurosMensalPercentual === 'number' ? cob.jurosMensalPercentual : 1,
    observacoesPadrao:
      typeof pref.observacoesPadrao === 'string' ? pref.observacoesPadrao : '',
  };
}

export async function obterConfiguracaoFinanceiraAction() {
  try {
    const empresa = await buscarEmpresaAtual();
    if (!empresa) {
      return { ok: true as const, data: null };
    }

    const row = await prisma.configuracaoFinanceira.findUnique({
      where: { empresaId: empresa.id },
    });

    if (!row) {
      return { ok: true as const, data: null };
    }

    return { ok: true as const, data: extrairConfiguracao(row) };
  } catch (error) {
    console.error('Erro ao buscar configuração financeira:', error);
    return {
      ok: false as const,
      error: 'Falha ao carregar parâmetros financeiros.',
    };
  }
}

export async function salvarConfiguracaoFinanceiraAction(
  input: ConfiguracaoFinanceiraPayload
) {
  try {
    const empresa = await buscarEmpresaAtual();
    if (!empresa) {
      return {
        ok: false as const,
        error: 'Nenhuma empresa cadastrada no banco para vincular os parâmetros.',
      };
    }

    const moedaLimpa = (input.moedaPadrao || 'BRL').trim().toUpperCase().slice(0, 3);
    const configuracoesVencimento: Prisma.InputJsonValue = {
      diasAvisoVencimento: Number(input.diasAvisoVencimento) || 0,
      bloquearAposVencimento: Boolean(input.bloquearAposVencimento),
    };
    const configuracoesCobranca: Prisma.InputJsonValue = {
      multaPercentual: Number(input.multaPercentual) || 0,
      jurosMensalPercentual: Number(input.jurosMensalPercentual) || 0,
    };
    const preferenciasFinanceiras: Prisma.InputJsonValue = {
      observacoesPadrao: (input.observacoesPadrao ?? '').trim(),
    };

    const salva = await prisma.configuracaoFinanceira.upsert({
      where: { empresaId: empresa.id },
      create: {
        empresaId: empresa.id,
        moedaPadrao: moedaLimpa,
        configuracoesVencimento: configuracoesVencimento ?? VENCIMENTO_PADRAO,
        configuracoesCobranca: configuracoesCobranca ?? COBRANCA_PADRAO,
        preferenciasFinanceiras,
      },
      update: {
        moedaPadrao: moedaLimpa,
        configuracoesVencimento,
        configuracoesCobranca,
        preferenciasFinanceiras,
      },
    });

    revalidatePath('/configuracoes/financeiro');
    return { ok: true as const, data: extrairConfiguracao(salva) };
  } catch (error) {
    console.error('Erro ao salvar configuração financeira:', error);
    return {
      ok: false as const,
      error: 'Falha ao salvar parâmetros financeiros no banco.',
    };
  }
}