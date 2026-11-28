import type { FinanceEntryFormValues } from "@/schemas/finance";
export type { FinanceEntryFormValues } from "@/schemas/finance";
export type FinanceEntry = FinanceEntryFormValues & {
  id: string;
  unidadeNome: string;
  demonstrativo: boolean;
  arquivo?: File;
};
export type FinancePeriod = "month" | "previous" | "3months" | "6months" | "year";
export type FinanceRange = { start: string; end: string };
