'use server';

import { cadastrarEmpresaInicial } from '@/services/onboarding.service';

export async function acaoCadastrarEmpresaInicial(formData: FormData) {
  const razaoSocial = String(formData.get('razaoSocial') ?? '').trim();
  const nomeFantasia = String(formData.get('nomeFantasia') ?? '').trim();
  const cnpjEmpresa = String(formData.get('cnpjEmpresa') ?? '').replace(/\D/g, '');
  const emailEmpresa = String(formData.get('emailEmpresa') ?? '').trim();
  const telefoneEmpresa = String(formData.get('telefoneEmpresa') ?? '').trim();

  const nomeUnidade = String(formData.get('nomeUnidade') ?? '').trim();
  const cnpjUnidade = String(formData.get('cnpjUnidade') ?? '').replace(/\D/g, '');
  const endereco = String(formData.get('endereco') ?? '').trim();
  const cidade = String(formData.get('cidade') ?? '').trim();
  const estado = String(formData.get('estado') ?? '').trim().toUpperCase();

  const nomeAdmin = String(formData.get('nomeAdmin') ?? '').trim();
  const emailAdmin = String(formData.get('emailAdmin') ?? '').trim();
  const senhaHash = String(formData.get('senhaHash') ?? '');

  if (!razaoSocial || !cnpjEmpresa || !nomeUnidade || !emailAdmin || !senhaHash) {
    return { ok: false as const, error: 'Preencha todos os campos obrigatórios.' };
  }

  try {
    const resultado = await cadastrarEmpresaInicial({
      empresa: {
        razaoSocial,
        nomeFantasia: nomeFantasia || razaoSocial,
        cnpj: cnpjEmpresa,
        email: emailEmpresa || emailAdmin,
        telefone: telefoneEmpresa || '0000000000',
      },
      unidadeMatriz: {
        nome: nomeUnidade,
        cnpj: cnpjUnidade || cnpjEmpresa,
        endereco,
        cidade,
        estado,
      },
      admin: {
        nome: nomeAdmin,
        email: emailAdmin,
        senhaHash,
      },
    });

    return {
      ok: true as const,
      data: {
        empresaId: resultado.empresa.id,
        unidadeId: resultado.unidade.id,
        usuarioId: resultado.usuarioAdmin.id,
      },
    };
  } catch (error) {
    console.error('Erro no onboarding:', error);
    return {
      ok: false as const,
      error: 'Não foi possível concluir o cadastro inicial. Verifique os dados e tente novamente.',
    };
  }
}