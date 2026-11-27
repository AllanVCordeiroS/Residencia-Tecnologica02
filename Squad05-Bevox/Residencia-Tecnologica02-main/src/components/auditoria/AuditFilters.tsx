import { CalendarDays, Check, ChevronDown, List, Search, SlidersHorizontal } from 'lucide-react';
import type { AuditAction, AuditStatus } from './auditTypes';

type Props = {
  search: string;
  period: string;
  action: AuditAction | 'Todos';
  status: AuditStatus | 'Todos';
  onSearchChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onActionChange: (value: AuditAction | 'Todos') => void;
  onStatusChange: (value: AuditStatus | 'Todos') => void;
  onApply: () => void;
};

const actionOptions: (AuditAction | 'Todos')[] = ['Todos', 'Exclusão', 'Alteração', 'Visualização', 'Cadastro', 'Configuração', 'Exportação'];

function SelectFilter<T extends string>({ icon: Icon, label, value, options, onChange }: {
  icon: typeof CalendarDays;
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-line dark:bg-surface-raised">
      <Icon className="size-4 shrink-0 text-slate-500 dark:text-foreground-muted" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] text-slate-500 dark:text-foreground-muted">{label}</span>
        <select className="w-full appearance-none bg-transparent text-xs font-medium outline-none" value={value} onChange={(event) => onChange(event.target.value as T)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </span>
      <ChevronDown className="size-4 shrink-0 text-slate-500 dark:text-foreground-muted" aria-hidden="true" />
    </label>
  );
}

export default function AuditFilters({ search, period, action, status, onSearchChange, onPeriodChange, onActionChange, onStatusChange, onApply }: Props) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-line dark:bg-surface-raised lg:flex-row" aria-label="Filtros de auditoria">
      <label className="flex min-h-11 min-w-[220px] flex-[1.4] items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-line">
        <Search className="size-4 shrink-0 text-slate-500 dark:text-foreground-muted" aria-hidden="true" />
        <input className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar por usuário, ação ou item..." />
      </label>
      <SelectFilter icon={CalendarDays} label="Período" value={period} options={['Últimos 30 dias', 'Últimos 7 dias', 'Hoje', 'Todo o período']} onChange={onPeriodChange} />
      <SelectFilter icon={List} label="Tipo de Ação" value={action} options={actionOptions} onChange={onActionChange} />
      <SelectFilter icon={Check} label="Resultado" value={status} options={['Todos', 'Concluída', 'Bloqueada']} onChange={onStatusChange} />
      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="button" onClick={onApply}>
        <SlidersHorizontal className="size-4" aria-hidden="true" />Filtrar
      </button>
    </section>
  );
}
