import type { License } from '@/types/license';
import type { OperationalUnit } from '@/types/unit';
import { getLicenseStatus } from '@/services/licenses';
import { mesmaIdentidade } from '@/services/unitRules';

export type LicenseFilters = { search: string; unit: string; type: string; status: string; due: string };
export type LicenseSortKey = 'name' | 'type' | 'unit' | 'issuer' | 'owner' | 'issued' | 'due' | 'status';
export type LicenseSort = { key: LicenseSortKey; direction: 'asc' | 'desc' };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

export function licenseKind(record: License): 'Alvará' | 'Licença' {
  return record.tipoLicenca.includes('Alvará') || record.tipoLicenca.includes('AVCB') ? 'Alvará' : 'Licença';
}

export function licenseUnit(record: License, units: OperationalUnit[]) {
  // IDs take precedence. Legacy names use the platform's existing identity rule.
  const current = units.find(unit => record.unidade ? unit.id === record.unidade : mesmaIdentidade(record.unidadeNome, unit));
  return current ? { key: current.id, name: current.nome, kind: current.tipo } : {
    key: record.unidade || `legacy:${record.unidadeNome}`, name: record.unidadeNome || 'Não informado', kind: record.unidadeTipo,
  };
}

export function licenseUnitOptions(records: License[], units: OperationalUnit[]) {
  const options = new Map(units.map(unit => [unit.id, { key: unit.id, name: unit.nome }]));
  for (const record of records) {
    const unit = licenseUnit(record, units);
    if (!options.has(unit.key)) options.set(unit.key, { key: unit.key, name: unit.name });
  }
  return [...options.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function filterLicenses(records: License[], filters: LicenseFilters, units: OperationalUnit[]) {
  const search = normalize(filters.search);
  return records.filter(record => {
    const unit = licenseUnit(record, units);
    return normalize([record.tipoLicenca, record.numeroDocumento, unit.name, record.unidadeNome, record.orgaoEmissor, record.responsavelNome].join(' ')).includes(search)
      // Accept the previous name-based filter retained by interface preferences.
      && (!filters.unit || filters.unit === unit.key || filters.unit === record.unidadeNome || filters.unit === unit.name)
      && (!filters.type || filters.type === record.tipoLicenca)
      && (!filters.status || filters.status === getLicenseStatus(record))
      && (!filters.due || filters.due === record.dataVencimento);
  });
}

export function sortLicenses(records: License[], sort: LicenseSort | null, units: OperationalUnit[]) {
  if (!sort) return [...records];
  const value = (record: License) => ({ name: record.tipoLicenca, type: licenseKind(record), unit: licenseUnit(record, units).name,
    issuer: record.orgaoEmissor, owner: record.responsavelNome, issued: record.dataEmissao, due: record.dataVencimento, status: getLicenseStatus(record) })[sort.key];
  return [...records].sort((a, b) => {
    const left = value(a), right = value(b);
    // Missing dates/information remain at the end in either direction.
    if (!left || !right) return left ? -1 : right ? 1 : 0;
    return left.localeCompare(right, 'pt-BR', { sensitivity: 'base', numeric: true }) * (sort.direction === 'asc' ? 1 : -1);
  });
}

export function licensePage<T>(records: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const current = Math.max(1, Math.min(page, totalPages));
  const start = (current - 1) * pageSize;
  return { current, totalPages, displayed: records.slice(start, start + pageSize), first: records.length ? start + 1 : 0, last: Math.min(start + pageSize, records.length) };
}

/** Selection spans pages, but hidden/removed records cannot remain selected. */
export function retainLicenseSelection(selected: ReadonlySet<string>, records: { id: string }[]) {
  return new Set(records.filter(record => selected.has(record.id)).map(record => record.id));
}
export function visibleLicenseSelection(selected: ReadonlySet<string>, visible: { id: string }[]) {
  const count = visible.filter(record => selected.has(record.id)).length;
  return { checked: visible.length > 0 && count === visible.length, indeterminate: count > 0 && count < visible.length };
}
export function toggleVisibleLicenses(selected: ReadonlySet<string>, visible: { id: string }[], checked: boolean) {
  const next = new Set(selected);
  for (const record of visible) { if (checked) next.add(record.id); else next.delete(record.id); }
  return next;
}

export function licenseCsv(records: License[]) {
  const cell = (value: string) => '"' + (/^[\s]*[=+@-]/.test(value) ? "'" + value : value).replaceAll('"', '""') + '"';
  const rows = [['Licença', 'Número', 'Tipo', 'Unidade', 'Órgão', 'Responsável', 'Emissão', 'Vencimento', 'Status', 'Condicionantes', 'Início da renovação', 'Protocolo'],
    ...records.map(record => [record.tipoLicenca, record.numeroDocumento, licenseKind(record), record.unidadeNome, record.orgaoEmissor, record.responsavelNome,
      record.dataEmissao, record.dataVencimento, getLicenseStatus(record), record.observacoes, record.inicioRenovacao, record.protocoloRenovacao])];
  return '\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n');
}
