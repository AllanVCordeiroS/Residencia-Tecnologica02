import { ShieldCheck } from 'lucide-react';

export default function AuditHeader() {
  return (
    <header className="flex items-center gap-4">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        <ShieldCheck className="size-8" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-foreground-muted">
          Histórico de atividades e alterações realizadas no sistema.
        </p>
      </div>
    </header>
  );
}
