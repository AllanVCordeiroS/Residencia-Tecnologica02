import { useMemo, useState } from 'react';
import AuditFilters from './AuditFilters';
import AuditHeader from './AuditHeader';
import AuditDetailsModal from './AuditDetailsModal';
import AuditStats from './AuditStats';
import AuditTable from './AuditTable';
import { auditRecords } from './auditData';
import type { AuditAction, AuditRecord, AuditStatus } from './auditTypes';

const PAGE_SIZE = 6;

function isWithinPeriod(date: string, period: string) {
  if (period === 'Todo o período') return true;

  const [day, month, year] = date.split(' ')[0].split('/').map(Number);
  const recordDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === 'Hoje') return recordDate.getTime() === today.getTime();

  const days = period === 'Últimos 7 dias' ? 7 : 30;
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  return recordDate >= start && recordDate <= today;
}

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('Últimos 30 dias');
  const [action, setAction] = useState<AuditAction | 'Todos'>('Todos');
  const [status, setStatus] = useState<AuditStatus | 'Todos'>('Todos');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');

    return auditRecords.filter((record) => {
      const matchesSearch = !term || [record.user, record.action, record.item, record.details]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(term));
      const matchesPeriod = isWithinPeriod(record.date, period);
      const matchesAction = action === 'Todos' || record.action === action;
      const matchesStatus = status === 'Todos' || record.status === status;

      return matchesSearch && matchesPeriod && matchesAction && matchesStatus;
    });
  }, [search, period, action, status]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  return (
    <main className="space-y-6 p-4 text-slate-800 dark:text-foreground sm:p-6">
      <AuditHeader />
      <AuditStats />
      <AuditFilters
        search={search}
        period={period}
        action={action}
        status={status}
        onSearchChange={(value) => updateFilter(setSearch, value)}
        onPeriodChange={(value) => updateFilter(setPeriod, value)}
        onActionChange={(value) => updateFilter(setAction, value)}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        onApply={() => setPage(1)}
      />
      <AuditTable
        records={visibleRecords}
        total={filteredRecords.length}
        page={currentPage}
        pageSize={PAGE_SIZE}
        pageCount={pageCount}
        onPageChange={setPage}
        onSelectRecord={setSelectedRecord}
      />
      {selectedRecord && (
        <AuditDetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </main>
  );
}
