export type DocumentStatus = "Atenção" | "Aprovado" | "Vencido" | "Em análise" | "Pendente";
export type DocumentFileType = "PDF" | "XLSX";
export type UnitType = "Filial" | "Matriz";
export type DueLevel = "critical" | "warning";

export interface LegalDocument {
  id: number;
  title: string;
  category: string;
  unit: string;
  unitType: UnitType;
  responsible: string;
  dueDate: string | null; // "dd/mm/aaaa", "-" ou null quando não há vencimento
  dueText: string;
  dueLevel?: DueLevel; // cor e ícone do texto relativo ("Em 5 dias")
  status: DocumentStatus;
  fileSize: string;
  fileType: DocumentFileType;
}