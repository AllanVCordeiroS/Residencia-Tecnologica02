/** Opções compartilhadas pelo formulário de Nova Tarefa (dados locais, sem API). */

export const TASK_UNITS = [
  "Unidade Matriz — Recife",
  "Unidade Jaboatão",
  "Unidade Paulista",
  "Unidade Olinda",
  "Unidade Cabo",
] as const;

export const TASK_OWNERS = [
  { name: "Carlos Mendes", initials: "CM" },
  { name: "Carlos Eduardo", initials: "CE" },
  { name: "Ana Souza", initials: "AS" },
  { name: "Pedro Lima", initials: "PL" },
  { name: "Mariana Costa", initials: "MC" },
  { name: "Ricardo Alves", initials: "RA" },
  { name: "Juliana Martins", initials: "JM" },
  { name: "Felipe Rocha", initials: "FR" },
] as const;

export const TASK_CATEGORIES = [
  "Administrativo",
  "Documentos",
  "Financeiro",
  "Licenças e Alvarás",
  "Manutenção",
  "Operação",
  "Pessoas",
  "Relatórios",
] as const;

export const TASK_PRIORITIES = ["Urgente", "Alta", "Média", "Normal", "Baixa"] as const;
export type NewTaskPriority = (typeof TASK_PRIORITIES)[number];

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const ATTACHMENT_MAX_FILES = 10;
export const ATTACHMENT_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg"] as const;
export const ATTACHMENT_ACCEPT = ATTACHMENT_EXTENSIONS.map((e) => `.${e}`).join(",");
