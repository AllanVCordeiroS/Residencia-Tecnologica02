'use client';

import { useRef, useState } from 'react';
import { z } from 'zod';
import { ArrowDown, ArrowDownUp, ArrowUp, Award, CalendarClock, CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, FileText, Leaf, Search, ShieldCheck, Truck } from 'lucide-react';
import { useUnitsQuery } from '@/hooks/queries/useUnitsQuery';
import { useInterfacePreferences } from '@/hooks/useInterfacePreferences';
import { useSettingsFilters } from '@/hooks/useSettingsFilters';
import { formatPreferenceDate } from '@/services/settings';
import { daysUntilExpiration, getLicenseAlerts, getLicenseStatus, isLicenseRestricted } from '@/services/licenses';
import { LICENSE_CATEGORIES } from '@/schemas/license';
import type { License } from '@/types/license';
import LicenseActions from './LicenseActions';
import { filterLicenses, licenseKind, licensePage, licenseUnit, licenseUnitOptions, retainLicenseSelection, sortLicenses, toggleVisibleLicenses, visibleLicenseSelection, type LicenseSort, type LicenseSortKey } from './_lib/license-list';

const defaults = { search: '', unit: '', type: '', status: '', due: '' };
const filterSchema = z.object({ search: z.string(), unit: z.string(), type: z.string(), status: z.string(), due: z.string() });
const columns: { key: LicenseSortKey; label: string }[] = [
  { key: 'name', label: 'Licença / Alvará' }, { key: 'type', label: 'Tipo' }, { key: 'unit', label: 'Unidade' },
  { key: 'issuer', label: 'Órgão Emissor' }, { key: 'owner', label: 'Responsável' }, { key: 'issued', label: 'Emissão' },
  { key: 'due', label: 'Vencimento' }, { key: 'status', label: 'Status' },
];

function SelectionCheckbox({ checked, indeterminate = false, label, disabled, onChange }: { checked: boolean; indeterminate?: boolean; label: string; disabled?: boolean; onChange: (value: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return <input ref={element => { ref.current = element; if (element) element.indeterminate = indeterminate; }} type="checkbox" aria-label={label}
    aria-checked={indeterminate ? 'mixed' : checked} checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} className="size-4 cursor-pointer accent-blue-600" />;
}

export default function LicenseTable({ licenses, onExportSelected }: { licenses: License[]; onExportSelected: (records: License[]) => void }) {
  const preferences = useInterfacePreferences();
  const units = useUnitsQuery();
  const registeredUnits = units.data ?? [];
  const [filters, setFilters] = useSettingsFilters('licenses', filterSchema, defaults, preferences.global.keepFiltersAfterRefresh);
  const [sort, setSort] = useState<LicenseSort | null>(null);
  const [page, setPage] = useState(1);
  const filtered = filterLicenses(licenses, filters, registeredUnits);
  const sorted = sortLicenses(filtered, sort, registeredUnits);
  const pageSize = preferences.global.automaticPagination ? 6 : Math.max(licenses.length, 1);
  const { current, totalPages, displayed, first, last } = licensePage(sorted, page, pageSize);
  // Clamp the stored page too, so a later refetch cannot resurrect an invalid page.
  if (page !== current) setPage(current);
  const eligible = JSON.stringify(filtered.map(record => record.id).sort());
  const [selection, setSelection] = useState({ eligible, ids: new Set<string>() });
  let selected = selection.ids;
  if (selection.eligible !== eligible) {
    selected = retainLicenseSelection(selected, filtered);
    setSelection({ eligible, ids: selected });
  }
  const updateSelection = (ids: Set<string>) => setSelection({ eligible, ids });
  const header = visibleLicenseSelection(selected, displayed);
  const options = licenseUnitOptions(licenses, registeredUnits);
  const setFilter = (field: keyof typeof filters, value: string) => { setFilters(old => ({ ...old, [field]: value })); setPage(1); };
  const clear = () => { setFilters(defaults); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean);
  const date = (value: string) => value ? formatPreferenceDate(value, preferences) : 'Não informado';
  const selectedRecords = sorted.filter(record => selected.has(record.id));

  return <section data-table-view={preferences.global.tableView} style={{ height: 'auto', maxHeight: preferences.global.automaticPagination ? 900 : undefined, overflow: 'hidden' }}
    className={`table-card ${preferences.global.tableView === 'compact' ? '[&_.license-table_td]:!h-auto [&_.license-table_td]:!py-2 [&_.license-table_th]:!py-2' : ''}`}>
    <div className="filters-panel" style={{ height: 'auto', flexBasis: 'auto', paddingBottom: 16 }}>
      <div className="filter-controls" style={{ height: 'auto', flexWrap: 'wrap', alignItems: 'end' }}>
        <div className="search-field" style={{ flex: '1 1 220px', width: 'auto', maxWidth: '100%', marginRight: 0 }}><Search size={16} /><input aria-label="Buscar por licença, número, unidade, órgão ou responsável" value={filters.search} onChange={event => setFilter('search', event.target.value)} placeholder="Buscar licença, número, unidade, órgão ou responsável" className="min-w-0 w-full bg-transparent outline-none" /></div>
        <select aria-label="Filtrar unidade" className="select-control max-w-full" value={filters.unit} onChange={event => setFilter('unit', event.target.value)}><option value="">Todas as unidades</option>{filters.unit && !options.some(option => option.key === filters.unit) && <option value={filters.unit}>{filters.unit.replace(/^legacy:/, '')}</option>}{options.map(option => <option key={option.key} value={option.key}>{option.name}</option>)}</select>
        <select aria-label="Filtrar tipo de licença" className="select-control type-select max-w-full" value={filters.type} onChange={event => setFilter('type', event.target.value)}><option value="">Todos os tipos</option>{LICENSE_CATEGORIES.map(category => <option key={category.name}>{category.name}</option>)}</select>
        <select aria-label="Filtrar status" className="select-control status-select max-w-full" value={filters.status} onChange={event => setFilter('status', event.target.value)}><option value="">Todos os status</option>{['Regular', 'A vencer', 'Vencida', 'Ainda não vigente', 'Vigência não informada'].map(value => <option key={value}>{value}</option>)}</select>
        <label className="max-w-full text-xs text-foreground-muted">Vencimento em<input aria-label="Filtrar vencimento" type="date" className="select-control date-select mt-1 block max-w-full" value={filters.due} onChange={event => setFilter('due', event.target.value)} /></label>
      </div>
      {units.isPending && <p role="status" className="mt-2 text-xs">Carregando unidades cadastradas…</p>}
      {units.isError && <p role="alert" className="mt-2 text-xs">Não foi possível atualizar as unidades. As unidades das licenças continuam disponíveis. <button type="button" className="underline" onClick={() => void units.refetch()}>Tentar novamente</button></p>}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        {hasFilters && <button type="button" onClick={clear} className="rounded px-2 py-1 text-blue-600 underline dark:text-blue-300">Limpar pesquisa e filtros</button>}
        <span role="status">{selected.size} selecionada(s)</span>
        {selected.size > 0 && <><button type="button" className="inline-flex items-center gap-1 rounded border border-line px-3 py-2" onClick={() => onExportSelected(selectedRecords)}><Download size={14} />Exportar selecionadas (CSV)</button><button type="button" className="underline" onClick={() => updateSelection(new Set())}>Desmarcar todas</button></>}
      </div>
    </div>
    <div className="table-scroll" style={{ overflow: 'auto', minHeight: 120, maxHeight: preferences.global.automaticPagination ? 640 : undefined }} tabIndex={0} role="region" aria-label="Lista de licenças e alvarás">
      <table className="license-table" style={{ minWidth: 1200 }}>
        <caption className="sr-only">Licenças e alvarás. Ordene pelas colunas; a seleção do cabeçalho afeta apenas esta página.</caption>
        <colgroup><col style={{ width: 48 }} /><col style={{ width: 220 }} /><col style={{ width: 95 }} /><col style={{ width: 140 }} /><col style={{ width: 140 }} /><col style={{ width: 130 }} /><col style={{ width: 100 }} /><col style={{ width: 150 }} /><col style={{ width: 160 }} /><col style={{ width: 56 }} /></colgroup>
        <thead><tr>
          <th scope="col"><SelectionCheckbox {...header} label="Selecionar todas as licenças desta página" disabled={!displayed.length} onChange={checked => updateSelection(toggleVisibleLicenses(selected, displayed, checked))} /></th>
          {columns.map(column => <th scope="col" key={column.key} aria-sort={sort?.key === column.key ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
            <button type="button" className="inline-flex min-h-10 items-center gap-1 rounded text-left focus-visible:outline-2" onClick={() => setSort({ key: column.key, direction: sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc' })}>
              {column.label}{sort?.key !== column.key ? <ArrowDownUp size={12} aria-hidden="true" /> : sort.direction === 'asc' ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
            </button>
          </th>)}<th scope="col">Ações</th>
        </tr></thead>
        <tbody>{displayed.map(record => {
          const unit = licenseUnit(record, registeredUnits);
          const status = getLicenseStatus(record);
          const days = record.dataVencimento ? daysUntilExpiration(record.dataVencimento) : null;
          const tone = status === 'Vencida' ? 'danger' : status === 'A vencer' ? 'warning' : status === 'Regular' ? 'success' : 'muted';
          const pill = status === 'Vencida' ? 'expired' : status === 'A vencer' ? 'due-soon' : status === 'Regular' ? 'regular' : 'bg-surface-muted text-foreground-muted';
          const Icon = record.tipoLicenca.includes('Ambiental') ? Leaf : record.tipoLicenca.includes('Sanitária') ? ShieldCheck : record.tipoLicenca.includes('AVCB') ? Award : record.tipoLicenca.includes('ANTT') ? Truck : FileText;
          const alerts = getLicenseAlerts(record);
          return <tr key={record.id} aria-selected={selected.has(record.id)} className={selected.has(record.id) ? 'bg-blue-50/50 dark:bg-blue-950/20' : undefined}>
            <td><SelectionCheckbox label={`Selecionar ${record.tipoLicenca}, documento ${record.numeroDocumento}`} checked={selected.has(record.id)} onChange={checked => updateSelection(toggleVisibleLicenses(selected, [record], checked))} /></td>
            <td><div className="license-name-cell"><span className={`document-icon ${record.tipoLicenca.includes('Ambiental') ? 'doc-green' : record.tipoLicenca.includes('Sanitária') || record.tipoLicenca.includes('AVCB') ? 'doc-purple' : 'doc-blue'}`}><Icon size={16} /></span><div className="license-name-copy"><strong>{record.tipoLicenca || 'Não informado'}</strong><small>{record.numeroDocumento ? `Nº ${record.numeroDocumento}` : 'Não informado'}</small></div></div></td>
            <td><span className={`type-pill ${record.tipoLicenca.includes('Ambiental') ? 'type-green' : 'type-blue'}`}>{licenseKind(record)}</span></td>
            <td><div className="two-line-cell"><span>{unit.name}</span><small>{unit.kind || 'Não informado'}</small></div></td>
            <td className="break-words">{record.orgaoEmissor || 'Não informado'}</td><td className="break-words">{record.responsavelNome || 'Não informado'}</td>
            <td>{date(record.dataEmissao)}</td>
            <td><div className={`due-cell due-${tone}`}><strong>{date(record.dataVencimento)}</strong><span className="due-meta">{tone === 'danger' ? <CalendarClock size={12} /> : tone === 'warning' ? <Clock3 size={12} /> : tone === 'success' ? <CalendarDays size={12} /> : null}<span>{days === null ? 'Vigência não informada' : days < 0 ? `Vencida há ${-days} dia(s)` : days === 0 ? 'Vence hoje' : `Em ${days} dia(s)`}</span></span></div></td>
            <td><span className={`status-pill ${pill}`}>{['Regular', 'A vencer', 'Vencida'].includes(status) && <span className="status-dot" />}{status}</span>{alerts.length > 0 && <small className="mt-2 block text-amber-700 dark:text-amber-300">Alerta: {Math.min(...alerts)} dias</small>}{isLicenseRestricted(record) && <small className="mt-2 block text-red-600 dark:text-red-300">Bloqueio cautelar</small>}</td>
            <td><LicenseActions license={{ ...record, unidadeNome: unit.name, unidadeTipo: unit.kind }} /></td>
          </tr>;
        })}
        {!filtered.length && <tr><td colSpan={10}><div className="p-6 text-center">{licenses.length ? 'Nenhuma licença corresponde à pesquisa e aos filtros.' : 'Nenhuma licença cadastrada.'}{hasFilters && <button type="button" className="mx-auto mt-3 block text-blue-600 underline dark:text-blue-300" onClick={clear}>Limpar pesquisa e filtros</button>}</div></td></tr>}
        </tbody>
      </table>
    </div>
    {(preferences.global.showRowSummary || preferences.global.automaticPagination) && <div className="table-footer" style={{ minWidth: 0, minHeight: 55, height: 'auto', flexShrink: 0, flexWrap: 'wrap', gap: 12, padding: '12px 16px' }}>
      {preferences.global.showRowSummary && <span role="status">Mostrando <strong>{first}–{last}</strong> de <strong>{filtered.length}</strong> licenças e alvarás</span>}
      {preferences.global.automaticPagination && <nav aria-label="Paginação das licenças" className="pagination"><button aria-label="Página anterior" disabled={current === 1} onClick={() => setPage(current - 1)} className="page-arrow" type="button"><ChevronLeft size={16} /></button><span className="text-xs">Página {current} de {totalPages}</span><button aria-label="Próxima página" disabled={current === totalPages} onClick={() => setPage(current + 1)} className="page-arrow" type="button"><ChevronRight size={16} /></button></nav>}
    </div>}
  </section>;
}
