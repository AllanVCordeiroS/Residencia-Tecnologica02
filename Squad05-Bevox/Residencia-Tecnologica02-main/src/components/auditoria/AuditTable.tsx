import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import type { AuditAction, AuditRecord } from './auditTypes';

type Props = {
  records: AuditRecord[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onSelectRecord: (record: AuditRecord) => void;
};

const actionAppearance: Record<AuditAction, { icon: typeof Trash2; className: string }> = {
  Exclusão: { icon: Trash2, className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  Alteração: { icon: Pencil, className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  Visualização: { icon: Eye, className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  Cadastro: { icon: Plus, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  Configuração: { icon: Settings, className: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' },
  Exportação: { icon: Download, className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300' },
};

const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

export default function AuditTable({ records, total, page, pageSize, pageCount, onPageChange, onSelectRecord }: Props) {
  const firstRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecord = Math.min(page * pageSize, total);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-line dark:bg-surface-raised" aria-label="Histórico de atividades">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-surface-muted dark:text-foreground-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Data e Hora</th><th className="px-4 py-3 font-semibold">Usuário</th><th className="px-4 py-3 font-semibold">Tipo de Ação</th><th className="px-4 py-3 font-semibold">Elemento</th><th className="px-4 py-3 font-semibold">Resultado</th><th className="px-4 py-3 font-semibold">Detalhes</th><th className="px-4 py-3" aria-label="Visualizar" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-line">
            {records.map((record) => {
              const actionStyle = actionAppearance[record.action];
              const ActionIcon = actionStyle.icon;
              const blocked = record.status === 'Bloqueada';
              return (
                <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-surface-muted/50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-foreground-muted">{record.date}</td>
                  <td className="whitespace-nowrap px-4 py-3"><span className="inline-flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 dark:bg-surface-muted dark:text-foreground">{initials(record.user)}</span>{record.user}</span></td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${actionStyle.className}`}><ActionIcon className="size-3" aria-hidden="true" />{record.action}</span></td>
                  <td className="px-4 py-3">{record.item}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${blocked ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                    {blocked ? <AlertCircle className="size-3" aria-hidden="true" /> : <CheckCircle2 className="size-3" aria-hidden="true" />}{record.status}
                  </span></td>
                  <td className="max-w-[240px] px-4 py-3 text-slate-600 dark:text-foreground-muted">{record.details}</td>
                  <td className="px-4 py-3"><button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700 dark:text-foreground-muted dark:hover:bg-surface-muted" type="button" aria-label={`Ver detalhes de ${record.user}`} onClick={() => onSelectRecord(record)}><Eye className="size-4" aria-hidden="true" /></button></td>
                </tr>
              );
            })}
            {records.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-foreground-muted">Nenhum registro encontrado para os filtros selecionados.</td></tr>}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-line dark:text-foreground-muted">
        <span>Mostrando {firstRecord} a {lastRecord} de {total} registros</span>
        <nav className="flex items-center gap-1" aria-label="Paginação">
          <button className="rounded-md p-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-surface-muted" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior"><ChevronLeft className="size-4" /></button>
          <span className="min-w-8 rounded-md bg-blue-600 px-2 py-1.5 text-center font-semibold text-white" aria-current="page">{page}</span>
          <button className="rounded-md p-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-surface-muted" type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Próxima página"><ChevronRight className="size-4" /></button>
        </nav>
      </footer>
    </section>
  );
}
