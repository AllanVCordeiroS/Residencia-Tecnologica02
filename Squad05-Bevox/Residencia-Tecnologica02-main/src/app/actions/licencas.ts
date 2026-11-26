'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export interface CriarLicencaInput {
  tipoLicenca: string;
  categoriaGovernanca: string;
  unidadeId?: string;
  orgaoEmissor: string;
  numeroDocumento: string;
  responsavelTecnico: string;
  dataEmissao: string; // YYYY-MM-DD
  dataVencimento: string; // YYYY-MM-DD
  alerta60: boolean;
  alerta30: boolean;
  alerta15: boolean;
  bloqueioCautelar: boolean;
}

export async function criarLicencaAction(input: CriarLicencaInput) {
  try {
    const unidade = input.unidadeId
      ? await prisma.unidade.findUnique({ where: { id: input.unidadeId } })
      : await prisma.unidade.findFirst({ orderBy: { nome: 'asc' } });

    if (!unidade) {
      return {
        ok: false as const,
        error: 'Nenhuma unidade encontrada no banco para vincular a licença.',
      };
    }

    const emissaoDate = new Date(`${input.dataEmissao}T00:00:00.000Z`);
    const vencimentoDate = new Date(`${input.dataVencimento}T00:00:00.000Z`);

    if (Number.isNaN(emissaoDate.getTime()) || Number.isNaN(vencimentoDate.getTime())) {
      return { ok: false as const, error: 'Datas de emissão ou vencimento inválidas.' };
    }

    const nomeTipo = input.tipoLicenca.trim() || 'Licença / Alvará';
    const tipoExistente = await prisma.tipoDocumento.findUnique({
      where: { nome: nomeTipo },
    });

    const tipoDocumento =
      tipoExistente ??
      (await prisma.tipoDocumento.create({
        data: {
          nome: nomeTipo,
          descricao: input.categoriaGovernanca,
          exigeValidade: true,
        },
      }));

    const diasAlerta: number[] = [];
    if (input.alerta60) diasAlerta.push(60);
    if (input.alerta30) diasAlerta.push(30);
    if (input.alerta15) diasAlerta.push(15);

    const licencaCriada = await prisma.$transaction(async (tx) => {
      const doc = await tx.documento.create({
        data: {
          unidadeId: unidade.id,
          tipoDocumentoId: tipoDocumento.id,
          titulo: `${nomeTipo} — ${input.numeroDocumento.trim()}`,
          descricao: `Órgão emissor: ${input.orgaoEmissor.trim()} | Responsável técnico: ${input.responsavelTecnico.trim()}`,
          dataEmissao: emissaoDate,
          dataValidade: vencimentoDate,
          status: input.bloqueioCautelar ? 'BLOQUEADA' : 'REGULAR',
        },
      });

      const licenca = await tx.licenca.create({
        data: {
          documentoId: doc.id,
          numero: input.numeroDocumento.trim(),
          orgaoEmissor: input.orgaoEmissor.trim(),
          categoriaGovernanca: input.categoriaGovernanca.trim(),
          responsavelTecnico: input.responsavelTecnico.trim(),
          bloqueioCautelar: input.bloqueioCautelar,
        },
      });

      for (const dias of diasAlerta) {
        const dataAlerta = new Date(vencimentoDate);
        dataAlerta.setUTCDate(dataAlerta.getUTCDate() - dias);

        await tx.documentoAlerta.create({
          data: {
            documentoId: doc.id,
            descricao: `Vencimento de ${nomeTipo} (${input.numeroDocumento.trim()}) em ${dias} dias`,
            dataAlerta,
            status: 'AGENDADO',
            tipoAlerta: `VENCIMENTO_${dias}D`,
          },
        });
      }

      return licenca;
    });

    revalidatePath('/licencas');
    revalidatePath('/licencas/cadastrar');
    revalidatePath('/documentos');

    return { ok: true as const, data: { id: licencaCriada.id } };
  } catch (error) {
    console.error('Erro ao cadastrar licença:', error);
    return {
      ok: false as const,
      error: 'Falha ao salvar licença no banco.',
    };
  }
}
export interface SerializedLicenseItem {
  id: string;
  name: string;
  number: string;
  kind: 'Alvará' | 'Licença';
  kindTone: 'blue' | 'green' | 'purple';
  unit: string;
  unitKind: string;
  issuer: string;
  owner: string;
  due: string;
  dueMeta: string;
  dueTone: 'warning' | 'danger' | 'success' | 'muted';
  status: 'A vencer' | 'Vencida' | 'Regular';
  iconKey: 'fileText' | 'leaf' | 'shieldCheck' | 'award' | 'truck' | 'fileX';
  iconTone: string;
  bloqueioCautelar: boolean;
}

function formatarDataBrSimples(date: Date | null | undefined): string {
  if (!date) return '–';
  const dia = String(date.getUTCDate()).padStart(2, '0');
  const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
  const ano = date.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

export async function listarLicencasAction() {
  try {
    const rows = await prisma.licenca.findMany({
      include: {
        documento: {
          include: {
            unidade: { select: { nome: true } },
            tipoDocumento: { select: { nome: true } },
            responsavel: { select: { nome: true } },
          },
        },
      },
      orderBy: {
        documento: { dataCadastro: 'desc' },
      },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const data: SerializedLicenseItem[] = rows.map((row, idx) => {
      const doc = row.documento;
      const nomeUnidade = doc?.unidade?.nome ?? 'Unidade';
      const unitKind = nomeUnidade.toLowerCase().includes('matriz') ? 'Matriz' : 'Filial';

      const baseNome = doc?.titulo || row.categoriaGovernanca || 'Licença';
      const isAlvara =
        baseNome.toLowerCase().includes('alvará') ||
        baseNome.toLowerCase().includes('alvara') ||
        (doc?.tipoDocumento?.nome ?? '').toLowerCase().includes('alvará');

      const kind: 'Alvará' | 'Licença' = isAlvara ? 'Alvará' : 'Licença';
      const tones: Array<'blue' | 'green' | 'purple'> = ['blue', 'green', 'purple'];
      const kindTone = tones[idx % tones.length];

      const iconKeys: Array<SerializedLicenseItem['iconKey']> = [
        'fileText',
        'leaf',
        'shieldCheck',
        'award',
        'truck',
        'fileX',
      ];
      const iconToneMap: Record<SerializedLicenseItem['iconKey'], string> = {
        fileText: 'blue',
        leaf: 'green',
        shieldCheck: 'purple',
        award: 'blue',
        truck: 'indigo',
        fileX: 'red',
      };
      const iconKey = iconKeys[idx % iconKeys.length];

      let due = '–';
      let dueMeta = 'Sem vencimento';
      let dueTone: SerializedLicenseItem['dueTone'] = 'muted';
      let status: SerializedLicenseItem['status'] = 'Regular';

      if (doc?.dataValidade) {
        due = formatarDataBrSimples(doc.dataValidade);
        const validade = new Date(doc.dataValidade);
        validade.setHours(0, 0, 0, 0);
        const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDias < 0 || row.bloqueioCautelar) {
          dueMeta = diffDias < 0 ? `Vencida há ${Math.abs(diffDias)} dias` : 'Bloqueio cautelar';
          dueTone = 'danger';
          status = 'Vencida';
        } else if (diffDias <= 30) {
          dueMeta = diffDias === 0 ? 'Vence hoje' : `Em ${diffDias} dias`;
          dueTone = 'warning';
          status = 'A vencer';
        } else {
          dueMeta = `${diffDias} dias`;
          dueTone = 'success';
          status = 'Regular';
        }
      } else if (row.bloqueioCautelar) {
        dueMeta = 'Bloqueio cautelar';
        dueTone = 'danger';
        status = 'Vencida';
      }

      return {
        id: row.id,
        name: baseNome,
        number: row.numero.startsWith('Nº') ? row.numero : `Nº ${row.numero}`,
        kind,
        kindTone,
        unit: nomeUnidade,
        unitKind,
        issuer: row.orgaoEmissor,
        owner: row.responsavelTecnico || doc?.responsavel?.nome || 'Responsável',
        due,
        dueMeta,
        dueTone,
        status,
        iconKey,
        iconTone: iconToneMap[iconKey],
        bloqueioCautelar: row.bloqueioCautelar,
      };
    });

    return { ok: true as const, data };
  } catch (error) {
    console.error('Erro ao listar licenças:', error);
    return { ok: false as const, error: 'Falha ao carregar licenças do banco.' };
  }
}