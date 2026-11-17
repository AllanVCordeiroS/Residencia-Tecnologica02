export type TaskStatus = "A fazer" | "Em andamento" | "Em revisão" | "Concluída";
export type TaskPriority = "Alta" | "Urgente" | "Média" | "Normal" | "Baixa" | "Concluída";
export type NewTaskPriority = Exclude<TaskPriority, "Concluída">;

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskAttachment {
  name: string;
  size: number;
  type: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  unit: string;
  owner: string;
  initials: string;
  category: string;
  priority: NewTaskPriority;
  startDate: string;
  dueDate: string;
  subtasks: TaskSubtask[];
  checklist: TaskChecklistItem[];
  attachments: TaskAttachment[];
  createdBy: string;
  createdAt: string;
}

export interface Task extends Omit<CreateTaskInput, "priority"> {
  id: number;
  priority: TaskPriority;
  due: string;
  status: TaskStatus;
  progress: number;
  isNew?: boolean;
  late?: boolean;
  dueToday?: boolean;
}
