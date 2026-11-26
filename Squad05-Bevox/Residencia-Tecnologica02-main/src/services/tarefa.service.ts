import { prisma } from '@/lib/prisma';

interface CriarTarefaInput {
  unidadeId: string;
  criadorId: string;
  titulo: string;
  descricao: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  dataInicio: Date;
  prazo: Date;
  responsaveisIds: string[]; // Deve conter pelo menos 1 ID
  responsavelPrincipalId: string;
  checklistItens?: string[];
}

export async function criarTarefa(input: CriarTarefaInput) {
  if (!input.responsaveisIds || input.responsaveisIds.length === 0) {
    throw new Error('A tarefa deve possuir pelo menos um responsável.');
  }

  return prisma.$transaction(async (tx) => {
    const tarefa = await tx.tarefa.create({
      data: {
        unidadeId: input.unidadeId,
        criadorId: input.criadorId,
        titulo: input.titulo,
        descricao: input.descricao,
        prioridade: input.prioridade,
        dataInicio: input.dataInicio,
        prazo: input.prazo,
        responsaveis: {
          create: input.responsaveisIds.map((usuarioId) => ({
            usuarioId,
            principal: usuarioId === input.responsavelPrincipalId,
          })),
        },
        checklist: input.checklistItens?.length
          ? {
              create: input.checklistItens.map((descricao, idx) => ({
                descricao,
                ordem: idx + 1,
              })),
            }
          : undefined,
      },
      include: {
        responsaveis: true,
        checklist: true,
      },
    });

    return tarefa;
  });
}

export async function removerResponsavelTarefa(tarefaId: string, usuarioId: string) {
  return prisma.$transaction(async (tx) => {
    const totalResponsaveis = await tx.tarefaResponsavel.count({
      where: { tarefaId },
    });

    if (totalResponsaveis <= 1) {
      throw new Error('Não é possível remover o único responsável da tarefa.');
    }

    return tx.tarefaResponsavel.delete({
      where: {
        tarefaId_usuarioId: { tarefaId, usuarioId },
      },
    });
  });
}

export async function concluirItemChecklist(itemId: string, usuarioId: string) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.tarefaChecklist.update({
      where: { id: itemId },
      data: {
        status: 'CONCLUIDO',
        concluidoPorId: usuarioId,
        dataConclusao: new Date(),
      },
    });

    // Verifica se ainda existe algum item pendente nesta tarefa
    const pendentes = await tx.tarefaChecklist.count({
      where: {
        tarefaId: item.tarefaId,
        status: { not: 'CONCLUIDO' },
      },
    });

    if (pendentes === 0) {
      await tx.tarefa.update({
        where: { id: item.tarefaId },
        data: {
          status: 'CONCLUIDA',
          dataConclusao: new Date(),
        },
      });
    }

    return item;
  });
}