"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ClipboardCheck, ListChecks } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { ROTAS } from "@/config/navigation";
import { useTasksQuery } from "@/hooks/queries/useTasksQuery";
import TaskDetailsModal from "@/components/tarefas/TaskDetailsModal";

export default function RecentTasks() {
  const query = useTasksQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const tarefas = (query.data ?? []).slice(0, 5);
  return (
    <Card aria-labelledby="tarefas-recentes" className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><ListChecks className="h-5 w-5" aria-hidden="true" /></span>
          <CardTitle id="tarefas-recentes" titulo="Tarefas Recentes" subtitulo="Fluxo operacional de documentos e renovações." />
        </div>
        <Link href={ROTAS.tarefas} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline focus-visible:outline-2 dark:text-blue-300">Ver todas <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </div>
      {query.isPending ? <p role="status" className="py-8 text-sm text-foreground-muted">Carregando tarefas...</p> : query.isError ? <p role="alert" className="py-8 text-sm text-red-600 dark:text-red-300">Não foi possível carregar as tarefas. <button type="button" onClick={() => void query.refetch()} className="underline">Tentar novamente</button></p> : tarefas.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-foreground-muted">Nenhuma tarefa recente. Quando houver atividades, elas aparecem aqui.</p>
      ) : <ul className="mt-1">{tarefas.map((task) => (
        <li key={task.id} className="border-b border-line last:border-0">
          <button type="button" onClick={() => setSelectedId(task.id)} aria-label={`Ver detalhes da tarefa: ${task.title}`} className="-mx-2 flex w-[calc(100%+1rem)] flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-2 py-3.5 text-left hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-blue-600">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><ClipboardCheck className="h-5 w-5" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1 basis-48"><span className="block truncate text-[14px] font-bold text-foreground">{task.title}</span><span className="block truncate text-[12px] text-foreground-muted">{task.unit} • {task.category}</span></span>
            <span className="flex shrink-0 items-center gap-3"><span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${task.status === "Concluída" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"}`}>{task.status}</span><span className="w-[4.75rem] text-right text-[12px] tabular-nums text-foreground-muted">{task.dueDate ? task.dueDate.split("-").reverse().join("/") : task.due || "Sem prazo"}</span></span>
          </button>
        </li>
      ))}</ul>}
      {selectedId !== null && <TaskDetailsModal taskId={selectedId} onClose={() => setSelectedId(null)} />}
    </Card>
  );
}
