import { z } from 'zod';
import { EXTENSOES_ACEITAS, LIMITE_ARQUIVO_MB } from '@/data/documentFormOptions';

export const LICENSE_CATEGORIES = [
  { name: 'Alvará de Funcionamento', category: 'Alvarás Municipais e Posturas', agency: 'Prefeitura Municipal', description: 'Autorização para funcionamento do estabelecimento.', guidance: 'Confira as atividades autorizadas e as exigências municipais.' },
  { name: 'Licença Ambiental', category: 'Controle Ambiental', agency: 'CPRH / CETESB', description: 'Licenciamento das atividades com impacto ambiental.', guidance: 'Confira condicionantes e o órgão competente para a localização da unidade.' },
  { name: 'Licença Sanitária', category: 'Vigilância Sanitária', agency: 'VISA', description: 'Condições sanitárias da operação e armazenagem.', guidance: 'Confira as atividades e condições sanitárias abrangidas pela licença.' },
  { name: 'AVCB Bombeiros', category: 'Segurança contra Incêndio', agency: 'Corpo de Bombeiros', description: 'Segurança contra incêndio e condições de ocupação.', guidance: 'Confira a área vistoriada e as condições de segurança exigidas.' },
  { name: 'ANTT / Frota de Distribuição', category: 'Transporte e Logística', agency: 'ANTT', description: 'Registros e autorizações da frota de distribuição.', guidance: 'Confira a abrangência do registro e os veículos vinculados.' },
  { name: 'Outra Categoria Especial', category: 'Regulação Especial', agency: 'Órgão competente', description: 'Autorizações específicas da atividade operacional.', guidance: 'Informe o órgão e as condições específicas da autorização.' },
] as const;

const date = z.iso.date('Informe uma data válida');
export const licenseSchema = z.object({
  tipoLicenca: z.enum(LICENSE_CATEGORIES.map(item => item.name), { error: 'Selecione o tipo de licença' }),
  unidade: z.string().min(1, 'Selecione a unidade'),
  orgaoEmissor: z.string().trim().min(2, 'Informe o órgão emissor'),
  numeroDocumento: z.string().trim().min(1, 'Informe o número do documento'),
  responsavel: z.string().min(1, 'Selecione o responsável'),
  observacoes: z.string().max(2000, 'Máximo de 2000 caracteres'),
  vinculo: z.enum(['upload', 'existente']),
  documentoId: z.string(),
  arquivo: z.custom<File>(value => value === undefined || (typeof File !== 'undefined' && value instanceof File), 'Selecione um arquivo válido').optional(),
  dataEmissao: date,
  dataVencimento: date,
  inicioRenovacao: z.union([date, z.literal('')]),
  renovacaoEmAndamento: z.boolean(),
  protocoloRenovacao: z.string().trim(),
  alerta60: z.boolean(), alerta30: z.boolean(), alerta15: z.boolean(),
  bloqueioCautelar: z.boolean(),
}).superRefine((data, ctx) => {
  const issue = (path: keyof typeof data, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (data.dataVencimento < data.dataEmissao) issue('dataVencimento', 'O vencimento não pode ser anterior à emissão');
  if (data.inicioRenovacao && data.inicioRenovacao < data.dataEmissao) issue('inicioRenovacao', 'A renovação não pode iniciar antes da emissão');
  if (data.renovacaoEmAndamento) {
    if (!data.inicioRenovacao) issue('inicioRenovacao', 'Informe o início da renovação');
    if (!data.protocoloRenovacao) issue('protocoloRenovacao', 'Informe o protocolo de renovação em andamento');
    if (data.inicioRenovacao > localDate()) issue('inicioRenovacao', 'Uma renovação em andamento não pode iniciar no futuro');
  }
  if (data.vinculo === 'existente' && !data.documentoId) issue('documentoId', 'Selecione um documento existente');
  if (data.vinculo === 'upload') {
    if (!data.arquivo) issue('arquivo', 'Anexe um arquivo');
    else {
      if (!(EXTENSOES_ACEITAS as readonly string[]).includes(data.arquivo.name.split('.').pop()?.toLowerCase() ?? '')) issue('arquivo', 'Formato de arquivo não suportado');
      if (data.arquivo.size <= 0 || data.arquivo.size > LIMITE_ARQUIVO_MB * 1024 * 1024) issue('arquivo', `Selecione um arquivo não vazio de até ${LIMITE_ARQUIVO_MB} MB`);
    }
  }
});

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export type LicenseFormValues = z.infer<typeof licenseSchema>;
