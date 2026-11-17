/**
 * Chaves centralizadas do cache do BEVOX.
 * A hierarquia permite invalidar um domínio inteiro ou apenas uma consulta.
 */
export const queryKeys = {
  all: ["bevox"] as const,
  dashboard: {
    all: ["bevox", "dashboard"] as const,
    overview: () => ["bevox", "dashboard", "overview"] as const,
  },
  units: {
    all: ["bevox", "units"] as const,
    lists: () => ["bevox", "units", "list"] as const,
    list: () => ["bevox", "units", "list", "operational"] as const,
    detail: (id: string) => ["bevox", "units", "detail", id] as const,
  },
  documents: {
    all: ["bevox", "documents"] as const,
    lists: () => ["bevox", "documents", "list"] as const,
    list: () => ["bevox", "documents", "list", "all"] as const,
    detail: (id: number) => ["bevox", "documents", "detail", id] as const,
  },
  licenses: {
    all: ["bevox", "licenses"] as const,
    lists: () => ["bevox", "licenses", "list"] as const,
    list: () => ["bevox", "licenses", "list", "all"] as const,
    detail: (id: string) => ["bevox", "licenses", "detail", id] as const,
  },
  tasks: {
    all: ["bevox", "tasks"] as const,
    lists: () => ["bevox", "tasks", "list"] as const,
    list: () => ["bevox", "tasks", "list", "all"] as const,
    detail: (id: number) => ["bevox", "tasks", "detail", id] as const,
  },
  operations: {
    all: ["bevox", "operations"] as const,
    overview: () => ["bevox", "operations", "overview"] as const,
  },
  finance: {
    all: ["bevox", "finance"] as const,
    entries: () => ["bevox", "finance", "entries"] as const,
    indicators: () => ["bevox", "finance", "indicators"] as const,
  },
  reports: {
    all: ["bevox", "reports"] as const,
    dashboard: () => ["bevox", "reports", "dashboard"] as const,
  },
  settings: {
    all: ["bevox", "settings"] as const,
  },
  users: {
    all: ["bevox", "users"] as const,
    lists: () => ["bevox", "users", "list"] as const,
    detail: (id: string) => ["bevox", "users", "detail", id] as const,
  },
} as const;
