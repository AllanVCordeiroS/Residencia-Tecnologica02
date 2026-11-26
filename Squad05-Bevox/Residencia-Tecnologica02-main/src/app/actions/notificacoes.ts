'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export interface EventoNotificacaoInput {
  tipoEvento: string;
  frequencia: string;
  ativo: boolean;
}

export interface SalvarPreferenciasNotificacaoInput {
  canalSistemaAtivo: boolean;
  diasEnvio: string[];
  horarioPreferencial: string; // Ex.: "08:00"
  eventos: EventoNotificacaoInput[];
}

function parseHorarioParaDate(horario: string): Date | null {
  const match = /^(\d{2}):(\d{2})$/.exec(horario.trim());
  if (!match) return null;
  const horas = Number(match[1]);
  const minutos = Number(match[2]);
  if (horas > 23 || minutos > 59) return null;
  return new Date(Date.UTC(1970, 0, 1, horas, minutos, 0, 0));
}

function formatarHorarioDeDate(date: Date | null): string {
  if (!date) return '08:00';
  const horas = String(date.getUTCHours()).padStart(2, '0');
  const minutos = String(date.getUTCMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

async function obterUsuarioAlvo() {
  return prisma.usuario.findFirst({
    orderBy: { dataCadastro: 'asc' },
    select: { id: true, nome: true },
  });
}

export async function obterPreferenciasNotificacaoAction() {
  try {
    const usuario = await obterUsuarioAlvo();
    if (!usuario) {
      return { ok: true as const, data: null };
    }

    const pref = await prisma.preferenciaNotificacao.findUnique({
      where: { usuarioId: usuario.id },
      include: { eventos: true },
    });

    if (!pref) {
      return { ok: true as const, data: null };
    }

    return {
      ok: true as const,
      data: {
        canalSistemaAtivo: pref.canalSistemaAtivo,
        diasEnvio: pref.diasEnvio ? pref.diasEnvio.split(',').filter(Boolean) : [],
        horarioPreferencial: formatarHorarioDeDate(pref.horarioPreferencial),
        eventos: pref.eventos.map((ev) => ({
          tipoEvento: ev.tipoEvento,
          frequencia: ev.frequencia,
          ativo: ev.ativo,
        })),
      },
    };
  } catch (error) {
    console.error('Erro ao carregar preferências de notificação:', error);
    return {
      ok: false as const,
      error: 'Falha ao carregar preferências de notificação.',
    };
  }
}

export async function salvarPreferenciasNotificacaoAction(
  input: SalvarPreferenciasNotificacaoInput
) {
  try {
    const usuario = await obterUsuarioAlvo();
    if (!usuario) {
      return {
        ok: false as const,
        error: 'Nenhum usuário encontrado no banco para vincular as preferências.',
      };
    }

    const diasFormatados = input.diasEnvio.join(',');
    const horarioDate = parseHorarioParaDate(input.horarioPreferencial);

    await prisma.$transaction(async (tx) => {
      const pref = await tx.preferenciaNotificacao.upsert({
        where: { usuarioId: usuario.id },
        create: {
          usuarioId: usuario.id,
          canalSistemaAtivo: input.canalSistemaAtivo,
          diasEnvio: diasFormatados,
          horarioPreferencial: horarioDate,
        },
        update: {
          canalSistemaAtivo: input.canalSistemaAtivo,
          diasEnvio: diasFormatados,
          horarioPreferencial: horarioDate,
        },
      });

      for (const ev of input.eventos) {
        await tx.preferenciaEvento.upsert({
          where: {
            preferenciaNotificacaoId_tipoEvento: {
              preferenciaNotificacaoId: pref.id,
              tipoEvento: ev.tipoEvento,
            },
          },
          create: {
            preferenciaNotificacaoId: pref.id,
            tipoEvento: ev.tipoEvento,
            frequencia: ev.frequencia,
            ativo: ev.ativo,
          },
          update: {
            frequencia: ev.frequencia,
            ativo: ev.ativo,
          },
        });
      }
    });

    revalidatePath('/configuracoes/notificacoes');
    return { ok: true as const };
  } catch (error) {
    console.error('Erro ao salvar preferências de notificação:', error);
    return {
      ok: false as const,
      error: 'Falha ao salvar preferências de notificação no banco.',
    };
  }
}