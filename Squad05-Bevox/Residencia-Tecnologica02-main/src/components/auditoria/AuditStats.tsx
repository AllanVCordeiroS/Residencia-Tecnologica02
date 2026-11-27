import { CircleCheck, Clock3, FileText, TriangleAlert } from 'lucide-react';

const stats = [
  { label: 'Total de Registros', value: '1.284', trend: '↑ +12%', icon: FileText, tone: 'blue' },
  { label: 'Ações Bloqueadas', value: '18', trend: '↑ +2%', icon: TriangleAlert, tone: 'amber' },
  { label: 'Ações Concluídas', value: '1.266', trend: '↑ +12%', icon: CircleCheck, tone: 'green' },
  { label: 'Última Atividade', value: 'Hoje, 17:47', icon: Clock3, tone: 'violet' },
] as const;

const iconTones = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
};

export default function AuditStats() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo da auditoria">
      {stats.map(({ label, value, trend, icon: Icon, tone }) => (
        <article key={label} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-line dark:bg-surface-raised">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconTones[tone]}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-foreground-muted">{label}</p>
            <p className="mt-1 truncate text-lg font-bold">{value}</p>
          </div>
          {trend && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">{trend}</span>}
        </article>
      ))}
    </section>
  );
}
