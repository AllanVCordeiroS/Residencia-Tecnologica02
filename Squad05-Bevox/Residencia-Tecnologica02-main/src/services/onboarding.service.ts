import { prisma } from '@/lib/prisma';

interface CriarEmpresaInput {
  empresa: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    email: string;
    telefone: string;
  };
  unidadeMatriz: {
    nome: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    estado: string;
    telefone?: string;
  };
  admin: {
    nome: string;
    email: string;
    senhaHash: string; // Passe a senha já criptografada (ex: bcrypt/argon2)
    telefone?: string;
  };
}

export async function cadastrarEmpresaInicial(input: CriarEmpresaInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Cria a empresa
    const empresa = await tx.empresa.create({
      data: input.empresa,
    });

    // 2. Cria configuração financeira padrão
    await tx.configuracaoFinanceira.create({
      data: {
        empresaId: empresa.id,
        moedaPadrao: 'BRL',
        configuracoesVencimento: { diasAlertaAntecipado: 5 },
        configuracoesCobranca: { permitirVencido: false },
      },
    });

    // 3. Cria a unidade matriz
    const unidade = await tx.unidade.create({
      data: {
        empresaId: empresa.id,
        ...input.unidadeMatriz,
      },
    });

    // 4. Busca todas as permissões globais e cria perfil Administrador
    const permissoes = await tx.permissao.findMany({ select: { id: true } });

    const perfilAdmin = await tx.perfilAcesso.create({
      data: {
        empresaId: empresa.id,
        nome: 'Administrador',
        descricao: 'Acesso total a todos os módulos da empresa',
        permissoes: {
          create: permissoes.map((p) => ({ permissaoId: p.id })),
        },
      },
    });

    // 5. Cria usuário administrador vinculado à unidade e preferências in-app
    const usuarioAdmin = await tx.usuario.create({
      data: {
        empresaId: empresa.id,
        perfilAcessoId: perfilAdmin.id,
        unidadePrincipalId: unidade.id,
        nome: input.admin.nome,
        email: input.admin.email,
        senha: input.admin.senhaHash,
        telefone: input.admin.telefone,
        unidadesAutorizadas: {
          create: { unidadeId: unidade.id },
        },
        preferenciaNotificacao: {
          create: {
            canalSistemaAtivo: true,
          },
        },
      },
    });

    // 6. Registra na auditoria
    await tx.registroAuditoria.create({
      data: {
        empresaId: empresa.id,
        usuarioId: usuarioAdmin.id,
        unidadeId: unidade.id,
        acaoRealizada: 'CRIAR',
        entidadeAfetada: 'EMPRESA',
        registroAfetadoId: empresa.id,
        descricao: `Cadastro inicial da empresa ${empresa.nomeFantasia} e unidade matriz.`,
        dadosPosteriores: { empresaId: empresa.id, unidadeId: unidade.id },
      },
    });

    return { empresa, unidade, usuarioAdmin };
  });
}