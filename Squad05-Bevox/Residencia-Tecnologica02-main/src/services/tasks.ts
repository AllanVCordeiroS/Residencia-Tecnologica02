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

export async function getTasks(): Promise<Task[]> {
  return tasksDemo.map((task) => ({
    ...task,
    subtasks: task.subtasks?.map((item) => ({ ...item })) ?? [],
    checklist: task.checklist?.map((item) => ({ ...item })) ?? [],
    attachments: task.attachments?.map((item) => ({ ...item })) ?? [],
  }));
}

export async function createTaskDemo(input: CreateTaskInput): Promise<Task> {
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const dueToday = input.dueDate === todayISO;
  const task: Task = {
    ...input,
    id: tasksDemo.reduce((max, current) => Math.max(max, current.id), 0) + 1,
    due: dueToday ? "Hoje" : input.dueDate.split("-").reverse().join("/"),
    status: "A fazer",
    progress: 0,
    isNew: true,
    late: input.dueDate < todayISO,
    dueToday,
  };

  tasksDemo = [task, ...tasksDemo];
  return task;
}
