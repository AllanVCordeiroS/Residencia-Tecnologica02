import { licenseSchema, localDate } from '@/schemas/license';
import type { LicenseFormValues } from '@/schemas/license';
import type { License, LicenseStatus, UnitLicenseRestriction } from '@/types/license';
import { getOperationalUnits } from '@/services/units';
import { getUsers } from '@/services/users';
import { getDocuments, setDocumentDeletionGuard } from '@/services/documents';

const base = { unidade: '', responsavel: '', observacoes: '', vinculo: 'existente' as const, documentoId: '', dataEmissao: '', inicioRenovacao: '', renovacaoEmAndamento: false, protocoloRenovacao: '', alerta60: true, alerta30: true, alerta15: true, bloqueioCautelar: false };
// Os mesmos seis registros demonstrativos que já constavam na listagem.
let records: License[] = [
  { ...base, id: 'license-1', tipoLicenca: 'Alvará de Funcionamento', numeroDocumento: '2025-43112', unidadeNome: 'Unidade Paulista', unidadeTipo: 'Filial', orgaoEmissor: 'Prefeitura Municipal', responsavelNome: 'Ana Souza', dataVencimento: '2026-10-20' },
  { ...base, id: 'license-2', tipoLicenca: 'Licença Ambiental', numeroDocumento: '000781/2026', unidadeNome: 'Unidade Jaboatão', unidadeTipo: 'Filial', orgaoEmissor: 'CETESB', responsavelNome: 'Pedro Lima', dataVencimento: '2026-10-12' },
  { ...base, id: 'license-3', tipoLicenca: 'Licença Sanitária', numeroDocumento: '4532/2025', unidadeNome: 'Matriz – Recife', unidadeTipo: 'Matriz', orgaoEmissor: 'Vigilância Sanitária', responsavelNome: 'Carlos Eduardo', dataVencimento: '2027-03-15' },
  { ...base, id: 'license-4', tipoLicenca: 'AVCB Bombeiros', numeroDocumento: '7781/2025', unidadeNome: 'Unidade Caruaru', unidadeTipo: 'Filial', orgaoEmissor: 'Corpo de Bombeiros', responsavelNome: 'Larissa Almeida', dataVencimento: '2026-11-05' },
  { ...base, id: 'license-5', tipoLicenca: 'ANTT / Frota de Distribuição', numeroDocumento: '556/2024', unidadeNome: 'Unidade Jaboatão', unidadeTipo: 'Filial', orgaoEmissor: 'ANTT', responsavelNome: 'Mariana Costa', dataVencimento: '' },
  { ...base, id: 'license-6', tipoLicenca: 'Alvará de Funcionamento', numeroDocumento: '2025-7761', unidadeNome: 'Unidade Salvador', unidadeTipo: 'Filial', orgaoEmissor: 'Prefeitura Municipal', responsavelNome: 'Felipe Rocha', dataVencimento: '2026-09-28' },
];

export function daysUntilExpiration(value: string, today = localDate()) {
  return Math.round((Date.parse(value + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);
}
setDocumentDeletionGuard(id => !records.some(record => record.documentoId === String(id)));
export function getLicenseStatus(license: Pick<License, 'dataEmissao' | 'dataVencimento'>, today = localDate()): LicenseStatus {
  if (license.dataEmissao && license.dataEmissao > today) return 'Ainda não vigente';
  if (!license.dataVencimento) return 'Vigência não informada';
  const days = daysUntilExpiration(license.dataVencimento, today);
  return days < 0 ? 'Vencida' : days <= 60 ? 'A vencer' : 'Regular';
}
export function isLicenseRestricted(license: License, today = localDate()) {
  const renewal = license.renovacaoEmAndamento && license.protocoloRenovacao.trim() && license.inicioRenovacao && license.inicioRenovacao <= today;
  return Boolean(license.bloqueioCautelar && license.dataVencimento && license.dataVencimento < today && !renewal);
}
export function getLicenseAlerts(license: License, today = localDate()) {
  if (!license.dataVencimento) return [];
  const days = daysUntilExpiration(license.dataVencimento, today);
  return ([60, 30, 15] as const).filter(day => license[`alerta${day}`] && days >= 0 && days <= day);
}
/** Dados e arquivos mantidos somente na sessão; sem backend ou envio de notificações. */
export async function getLicenses(): Promise<License[]> { return records.map(record => ({ ...record })); }

export async function createLicense(input: LicenseFormValues): Promise<License> {
  const values = licenseSchema.parse(input);
  const [units, users, documents] = await Promise.all([getOperationalUnits(), getUsers(), getDocuments()]);
  const unit = units.find(item => item.id === values.unidade);
  const user = users.find(item => item.id === values.responsavel);
  if (!unit || !user) throw new Error('Unidade ou responsável não está mais disponível. Atualize a seleção.');
  if (values.vinculo === 'existente' && !documents.some(item => String(item.id) === values.documentoId)) throw new Error('Documento não está mais disponível.');
  const record: License = { ...values, arquivo: values.vinculo === 'upload' ? values.arquivo : undefined, documentoId: values.vinculo === 'existente' ? values.documentoId : '', id: crypto.randomUUID(), unidadeNome: unit.nome, unidadeTipo: unit.tipo, responsavelNome: user.nome };
  records = [record, ...records];
  return { ...record };
}

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[–—-]/g, ' ').replace(/\bunidade\b/g, '').replace(/\s+/g, ' ').trim();
/** Integração para operações locais, como ativação de unidade. Não bloqueia faturamento em backend. */
export async function getUnitLicenseRestriction(unitIdOrName: string): Promise<UnitLicenseRestriction> {
  const units = await getOperationalUnits();
  const unit = units.find(item => item.id === unitIdOrName || normalize(item.nome) === normalize(unitIdOrName));
  const licenses = (await getLicenses()).filter(item => (item.unidade === unitIdOrName || (unit && item.unidade === unit.id) || normalize(item.unidadeNome) === normalize(unit?.nome ?? unitIdOrName)) && isLicenseRestricted(item));
  const blocked = licenses.length > 0;
  return { blocked, permitido: !blocked, licenses, mensagem: blocked ? `Ativação impedida: ${licenses.map(item => `${item.tipoLicenca} (${item.numeroDocumento})`).join(', ')} vencida(s), com bloqueio cautelar e sem protocolo de renovação em andamento.` : null };
}
