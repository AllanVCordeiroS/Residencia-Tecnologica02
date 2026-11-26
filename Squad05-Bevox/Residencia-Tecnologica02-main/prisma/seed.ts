import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Permissões Globais por Módulo
  const modulos = [
    'DASHBOARD',
    'UNIDADES',
    'DOCUMENTOS',
    'LICENCAS',
    'TAREFAS',
    'FINANCEIRO',
    'USUARIOS',
    'AUDITORIA',
  ];
  const acoes = ['VISUALIZAR', 'CRIAR', 'EDITAR', 'EXCLUIR'];

  for (const modulo of modulos) {
    for (const nome of acoes) {
      await prisma.permissao.upsert({
        where: { modulo_nome: { modulo, nome } },
        update: {},
        create: {
          modulo,
          nome,
          descricao: `Permite ${nome.toLowerCase()} registros no módulo ${modulo.toLowerCase()}`,
        },
      });
    }
  }

  // 2. Tipos de Documentos Padrão
  const tiposDoc = [
    {
      nome: 'Alvará de Funcionamento',
      descricao: 'Autorização municipal para funcionamento da unidade',
      exigeValidade: true,
    },
    {
      nome: 'Licença Ambiental',
      descricao: 'Licenciamento ambiental aplicável à operação',
      exigeValidade: true,
    },
    {
      nome: 'AVCB (Corpo de Bombeiros)',
      descricao: 'Auto de Vistoria do Corpo de Bombeiros',
      exigeValidade: true,
    },
    {
      nome: 'Contrato Social',
      descricao: 'Documento societário constitutivo da empresa',
      exigeValidade: false,
    },
  ];

  for (const tipo of tiposDoc) {
    await prisma.tipoDocumento.upsert({
      where: { nome: tipo.nome },
      update: {},
      create: tipo,
    });
  }

  // 3. Categorias Financeiras Globais (máximo de 2 níveis)
  const categoriasBase = [
    {
      nome: 'Despesas Operacionais',
      descricao: 'Custos e despesas da rotina operacional das unidades',
      tipo: 'DESPESA',
      subcategorias: [
        { nome: 'Manutenção de Frota', tipo: 'DESPESA' },
        { nome: 'Energia e Água (CDD)', tipo: 'DESPESA' },
      ],
    },
    {
      nome: 'Receita de Distribuição',
      descricao: 'Entradas provenientes da comercialização e distribuição',
      tipo: 'RECEITA',
      subcategorias: [
        { nome: 'Venda Atacado', tipo: 'RECEITA' },
        { nome: 'Venda Varejo', tipo: 'RECEITA' },
      ],
    },
  ];

  for (const cat of categoriasBase) {
    let categoriaPai = await prisma.categoriaFinanceira.findFirst({
      where: { nome: cat.nome, categoriaPaiId: null },
    });

    if (!categoriaPai) {
      categoriaPai = await prisma.categoriaFinanceira.create({
        data: {
          nome: cat.nome,
          descricao: cat.descricao,
          tipo: cat.tipo,
          status: 'ATIVA',
        },
      });
    }

    for (const sub of cat.subcategorias) {
      const subExistente = await prisma.categoriaFinanceira.findFirst({
        where: { nome: sub.nome, categoriaPaiId: categoriaPai.id },
      });

      if (!subExistente) {
        await prisma.categoriaFinanceira.create({
          data: {
            nome: sub.nome,
            tipo: sub.tipo,
            status: 'ATIVA',
            categoriaPaiId: categoriaPai.id,
          },
        });
      }
    }
  }

  console.log('Seed do BEVOX concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });