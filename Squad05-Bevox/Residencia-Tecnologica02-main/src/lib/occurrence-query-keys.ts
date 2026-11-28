export const occurrenceQueryKeys = {
  all: ["bevox", "occurrences"] as const,
  lists: () => ["bevox", "occurrences", "list"] as const,
  list: () => ["bevox", "occurrences", "list", "all"] as const,
  detail: (id: string) => ["bevox", "occurrences", "detail", id] as const,
};
