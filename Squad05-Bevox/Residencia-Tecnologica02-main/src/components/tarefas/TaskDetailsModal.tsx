"use client";

import { useEffect, useId, useRef } from "react";
import { X, ClipboardList } from "lucide-react";
import { useTasksQuery } from "@/hooks/queries/useTasksQuery";

const dateLabel = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split("-").reverse().join("/") : date || "Não informado";

/** Visualização de um registro do mesmo repositório usado pela Central de Tarefas. */
export default function TaskDetailsModal({ taskId, onClose }: { taskId: number; onClose: () => void }) {
  const query = useTasksQuery();
  const task = query.data?.find((item) => item.id === taskId);
  const modal = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { modal.current?.showModal(); }, []);
  return (
    <dialog ref={modal} aria-labelledby={titleId} onClose={onClose}
      onCancel={(event) => { event.preventDefault(); modal.current?.close(); }}
      onKeyDown={(event) => { if (event.key === "Escape") modal.current?.close(); }}
      onClick={(event) => { if (event.currentTarget === event.target) modal.current?.close(); }}
      className="fixed inset-0 m-auto max-h-[85vh] w-[min(680px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-surface-raised p-5 text-foreground shadow-2xl backdrop:bg-slate-950/60 sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
        <div><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-300"><ClipboardList size={16} />Detalhes da tarefa · #{taskId}</p><h2 id={titleId} className="text-xl font-bold">{task?.title ?? "Detalhes da tarefa"}</h2></div>
        <button type="button" autoFocus aria-label="Fechar detalhes da tarefa" onClick={() => modal.current?.close()} className="rounded-lg p-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-blue-600"><X size={20} /></button>
      </header>
      {query.isPending ? <p role="status">Carregando tarefa...</p> : query.isError ? <div role="alert"><p>Não foi possível carregar a tarefa.</p><button onClick={() => void query.refetch()} className="mt-3 text-blue-600 underline">Tentar novamente</button></div> : !task ? <p role="status">Tarefa não encontrada. O registro pode ter sido removido.</p> : <>
        <p className="mb-5 whitespace-pre-wrap rounded-xl bg-surface-muted p-4 text-sm leading-6">{task.description || "Descrição não informada."}</p>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[["Status", task.status], ["Prioridade", task.priority === "Concluída" ? "Não informada" : task.priority], ["Responsável", task.owner], ["Unidade vinculada", task.unit], ["Categoria", task.category], ["Data de início", dateLabel(task.startDate)], ["Prazo de conclusão", dateLabel(task.dueDate || task.due)], ["Data de conclusão", "Não informada"], ["Criado por", task.createdBy || "Não informado"]].map(([label,value]) => <div key={label}><dt className="text-xs text-foreground-muted">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}
        </dl>
        <div className="mt-5"><p className="mb-2 text-xs font-semibold text-foreground-muted">Progresso da execução</p><div role="progressbar" aria-label="Progresso da tarefa" aria-valuenow={task.progress} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full bg-blue-600" style={{width:`${task.progress}%`}} /></div><p className="mt-1 text-right text-xs text-foreground-muted">{task.progress}%</p></div>
        <section className="mt-6"><h3 className="font-semibold">Checklist e etapas</h3>{task.checklist.length + task.subtasks.length === 0 ? <p className="mt-2 text-sm text-foreground-muted">Nenhuma etapa ou checklist registrado.</p> : <ul className="mt-3 space-y-2">{task.subtasks.map((item) => <li key={`s-${item.id}`} className="flex gap-2 text-sm"><input type="checkbox" checked={item.done} readOnly aria-label={item.title} />{item.title}</li>)}{task.checklist.map((item) => <li key={`c-${item.id}`} className="flex gap-2 text-sm"><input type="checkbox" checked={item.done} readOnly aria-label={item.text} />{item.text}</li>)}</ul>}</section>
        <section className="mt-6"><h3 className="font-semibold">Anexos</h3>{task.attachments.length ? <ul className="mt-2 space-y-2">{task.attachments.map((file,index) => <li key={`${file.name}-${index}`} className="rounded-lg border border-line p-3 text-sm">{file.name}<span className="ml-2 text-xs text-foreground-muted">{(file.size / 1024).toFixed(1)} KB · {file.type}</span></li>)}</ul> : <p className="mt-2 text-sm text-foreground-muted">Nenhum anexo registrado.</p>}</section>
      </>}
    </dialog>
  );
}
