import { mockTasks } from "@/data/mockTasks";
import type { CreateTaskInput, Task } from "@/types/task";

/*
 * Repositório temporário em memória para preservar o comportamento que antes
 * vivia no useState do TaskCenter. Não persiste dados e não substitui uma API.
 */
let tasksDemo: Task[] = mockTasks.map((task) => ({
  ...task,
  subtasks: task.subtasks?.map((item) => ({ ...item })) ?? [],
  checklist: task.checklist?.map((item) => ({ ...item })) ?? [],
  attachments: task.attachments?.map((item) => ({ ...item })) ?? [],
}));

function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Os registros antigos têm apenas o prazo formatado; não inventamos datas de
// início ou conclusão ausentes. "Hoje" é resolvido ao carregar a demonstração.
const demoToday = localDate(new Date());
tasksDemo = tasksDemo.map((task) => ({
  ...task,
  unit: task.unit === "Matriz — Recife" ? "Unidade Matriz — Recife" : task.unit,
  dueDate: task.dueDate || (task.due === "Hoje" ? demoToday : task.due.split("/").reverse().join("-")),
}));

function presentTask(task: Task): Task {
  const today = localDate(new Date());
  const open = task.status !== "Concluída";
  return {
    ...task,
    due: task.dueDate === today ? "Hoje" : task.dueDate.split("-").reverse().join("/") || "Não informado",
    dueToday: open && task.dueDate === today,
    late: open && !!task.dueDate && task.dueDate < today,
    subtasks: task.subtasks.map((item) => ({ ...item })),
    checklist: task.checklist.map((item) => ({ ...item })),
    attachments: task.attachments.map((item) => ({ ...item })),
  };
}

export async function getTasks(): Promise<Task[]> {
  return tasksDemo.map(presentTask);
}

export async function createTaskDemo(input: CreateTaskInput): Promise<Task> {
  const total = input.subtasks.length + input.checklist.length;
  const done = input.subtasks.filter((item) => item.done).length + input.checklist.filter((item) => item.done).length;
  const task: Task = {
    ...input,
    id: tasksDemo.reduce((max, current) => Math.max(max, current.id), 0) + 1,
    due: input.dueDate.split("-").reverse().join("/"),
    status: "A fazer",
    progress: total ? Math.round(done / total * 100) : 0,
    isNew: true,
  };

  tasksDemo = [presentTask(task), ...tasksDemo];
  return presentTask(task);
}
