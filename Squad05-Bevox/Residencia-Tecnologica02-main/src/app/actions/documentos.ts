'use server';
import type {
  DocumentFileType,
  DocumentStatus,
  DueLevel,
  LegalDocument,
  UnitType,
} from '@/types/document';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export interface CriarDocumentoInput {
  unidadeId?: string;
  tipoDocumentoId?: string;
  tipoNome?: string;
  responsavelId?: string | null;
  titulo: string;
  descricao?: string;
  dataEmissao: string; // YYYY-MM-DD
  dataValidade?: string | null; // YYYY-MM-DD ou vazio
  status?: string;
  arquivo?: {
    nomeArquivo: string;
    referenciaArmazenamento?: string;
    tipoArquivo: string;
    tamanho: number;
  };
}

export async function listarOpcoesDocumentoAction() {
  try {
    const [unidades, tipos, usuarios] = await Promise.all([
      prisma.unidade.findMany({
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true, cidade: true, estado: true },
      }),
      prisma.tipoDocumento.findMany({
        where: { status: 'ATIVO' },
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true, exigeValidade: true },
      }),
      prisma.usuario.findMany({
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true },
      }),
    ]);

    return {
      ok: true as const,
      data: { unidades, tipos, usuarios },
    };
  } catch (error) {
    console.error('Erro ao carregar opções de documento:', error);
    return {
      ok: false as const,
      error: 'Falha ao carregar unidades e tipos de documento.',
    };
  }
}

export async function criarDocumentoAction(input: CriarDocumentoInput) {
  try {
    const tituloLimpo = input.titulo.trim();
    if (!tituloLimpo) {
      return { ok: false as const, error: 'Informe o título do documento.' };
    }

    const unidade = input.unidadeId
      ? await prisma.unidade.findUnique({ where: { id: input.unidadeId } })
      : await prisma.unidade.findFirst({ orderBy: { nome: 'asc' } });

    if (!unidade) {
      return {
        ok: false as const,
        error: 'Nenhuma unidade cadastrada para vincular o documento.',
      };
    }

    let tipoDocumentoId = input.tipoDocumentoId;
    if (!tipoDocumentoId) {
      const nomeTipo = (input.tipoNome || 'Documento Geral').trim();
      const tipoExistente = await prisma.tipoDocumento.findUnique({
        where: { nome: nomeTipo },
      });
      if (tipoExistente) {
        tipoDocumentoId = tipoExistente.id;
      } else {
        const criado = await prisma.tipoDocumento.create({
          data: {
            nome: nomeTipo,
            exigeValidade: Boolean(input.dataValidade),
          },
        });
        tipoDocumentoId = criado.id;
      }
    }

    const emissaoDate = new Date(`${input.dataEmissao}T00:00:00.000Z`);
    if (Number.isNaN(emissaoDate.getTime())) {
      return { ok: false as const, error: 'Data de emissão inválida.' };
    }

    const validadeDate = input.dataValidade
      ? new Date(`${input.dataValidade}T00:00:00.000Z`)
      : null;

    const usuarioResponsavel =
      input.responsavelId ??
      (await prisma.usuario.findFirst({ select: { id: true } }))?.id ??
      null;

    const documento = await prisma.$transaction(async (tx) => {
      const doc = await tx.documento.create({
        data: {
          unidadeId: unidade.id,
          tipoDocumentoId,
          responsavelId: input.responsavelId ?? null,
          titulo: tituloLimpo,
          descricao: input.descricao?.trim() || null,
          dataEmissao: emissaoDate,
          dataValidade: validadeDate,
          status: input.status || 'PENDENTE',
        },
      });

      if (input.arquivo && usuarioResponsavel) {
        await tx.documentoArquivo.create({
          data: {
            documentoId: doc.id,
            enviadoPorId: usuarioResponsavel,
            nomeArquivo: input.arquivo.nomeArquivo,
            referenciaArmazenamento:
              input.arquivo.referenciaArmazenamento ||
              `uploads/documentos/${doc.id}/${input.arquivo.nomeArquivo}`,
            tipoArquivo: input.arquivo.tipoArquivo || 'application/octet-stream',
            tamanho: BigInt(Math.max(0, Math.round(input.arquivo.tamanho))),
          },
        });
      }

      return doc;
    });

    revalidatePath('/documentos');
    revalidatePath('/documentos/new');
    revalidatePath('/documentos/import');

    return { ok: true as const, data: { id: documento.id, titulo: documento.titulo } };
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    return {
      ok: false as const,
      error: 'Falha ao salvar documento no banco.',
    };
  }
}
function mapearStatusDocumento(statusDb: string, dataValidade: Date | null): DocumentStatus {
  const normalizado = statusDb.trim().toUpperCase();
  if (normalizado === 'APROVADO' || normalizado === 'REGULAR') return 'Aprovado';
  if (normalizado === 'EM_ANALISE' || normalizado === 'EM ANALISE') return 'Em análise';
  if (normalizado === 'VENCIDO' || normalizado === 'BLOQUEADA') return 'Vencido';
  if (normalizado === 'ATENCAO' || normalizado === 'ATENÇÃO') return 'Atenção';

  if (dataValidade) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diffDias = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return 'Vencido';
    if (diffDias <= 15) return 'Atenção';
  }

  return 'Pendente';
}

function formatarDataBr(date: Date | null): string | null {
  if (!date) return null;
  const dia = String(date.getUTCDate()).padStart(2, '0');
  const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
  const ano = date.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarTamanhoArquivo(bytes: bigint | null | undefined): string {
  if (!bytes || bytes <= BigInt(0)) return '—';
  const num = Number(bytes);
  if (num >= 1024 * 1024) return `${(num / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(num / 1024))} KB`;
}

export async function listarDocumentosAction() {
  try {
    const rows = await prisma.documento.findMany({
      orderBy: { dataCadastro: 'desc' },
      include: {
        unidade: { select: { nome: true } },
        tipoDocumento: { select: { nome: true } },
        responsavel: { select: { nome: true } },
        arquivos: {
          orderBy: { dataEnvio: 'desc' },
          take: 1,
          select: { nomeArquivo: true, tipoArquivo: true, tamanho: true },
        },
      },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const documents: LegalDocument[] = rows.map((row, idx) => {
      const status = mapearStatusDocumento(row.status, row.dataValidade);
      const tipoArquivoRaw = row.arquivos[0]?.tipoArquivo?.toUpperCase() ?? '';
      const fileType: DocumentFileType =
        tipoArquivoRaw.includes('XLS') || tipoArquivoRaw.includes('CSV') ? 'XLSX' : 'PDF';

      const nomeUnidade = row.unidade?.nome ?? 'Unidade';
      const unitType: UnitType = nomeUnidade.toLowerCase().includes('matriz') ? 'Matriz' : 'Filial';

      let dueText = 'Sem vencimento';
      let dueLevel: DueLevel | undefined;

      if (row.dataValidade) {
        const validade = new Date(row.dataValidade);
        validade.setHours(0, 0, 0, 0);
        const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias < 0) {
          dueText = `Vencido há ${Math.abs(diffDias)} dias`;
          dueLevel = 'critical';
        } else if (diffDias <= 15) {
          dueText = diffDias === 0 ? 'Vence hoje' : `Em ${diffDias} dias`;
          dueLevel = 'warning';
        } else {
          dueText = `Em ${diffDias} dias`;
        }
      }

      return {
        id: idx + 1,
        title: row.titulo,
        category: row.tipoDocumento?.nome ?? 'Geral',
        unit: nomeUnidade,
        unitType,
        responsible: row.responsavel?.nome ?? 'Responsável não atribuído',
        dueDate: formatarDataBr(row.dataValidade),
        dueText,
        dueLevel,
        status,
        fileSize: formatarTamanhoArquivo(row.arquivos[0]?.tamanho),
        fileType,
      };
    });

    return { ok: true as const, data: documents };
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    return { ok: false as const, error: 'Falha ao carregar documentos do banco.' };
  }
}