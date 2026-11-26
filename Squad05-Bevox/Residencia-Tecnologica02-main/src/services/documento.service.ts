import { prisma } from '@/lib/prisma';

interface NovoArquivoDocumentoInput {
  documentoId: string;
  enviadoPorId: string;
  nomeArquivo: string;
  referenciaArmazenamento: string;
  tipoArquivo: string;
  tamanho: bigint;
  hashSha256?: string;
}

export async function adicionarVersaoDocumento(input: NovoArquivoDocumentoInput) {
  return prisma.$transaction(async (tx) => {
    // Busca a maior versão atual do documento
    const ultimaVersao = await tx.documentoArquivo.findFirst({
      where: { documentoId: input.documentoId },
      orderBy: { versao: 'desc' },
      select: { versao: true },
    });

    const proximaVersao = (ultimaVersao?.versao ?? 0) + 1;

    // Marca todas as anteriores como não atuais
    await tx.documentoArquivo.updateMany({
      where: { documentoId: input.documentoId, versaoAtual: true },
      data: { versaoAtual: false },
    });

    // Cria a nova versão ativa
    return tx.documentoArquivo.create({
      data: {
        documentoId: input.documentoId,
        enviadoPorId: input.enviadoPorId,
        nomeArquivo: input.nomeArquivo,
        referenciaArmazenamento: input.referenciaArmazenamento,
        tipoArquivo: input.tipoArquivo,
        tamanho: input.tamanho,
        hashSha256: input.hashSha256,
        versao: proximaVersao,
        versaoAtual: true,
      },
    });
  });
}