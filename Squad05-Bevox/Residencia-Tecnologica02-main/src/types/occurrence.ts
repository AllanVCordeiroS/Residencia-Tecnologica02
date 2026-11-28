export type OccurrenceKind =
  | "Avaria de Carga"
  | "Divergência Fiscal"
  | "Desvio / Atraso"
  | "Manutenção de Frota"
  | "Vasilhame Reverso"
  | "Outros";

export type OccurrenceSeverity = "Crítica" | "Alta" | "Média" | "Baixa";
export type OccurrenceStatus =
  | "Em Análise"
  | "Aguardando Glosa"
  | "Resolvida"
  | "Em Oficina"
  | "Apuração";

export interface OccurrenceFile {
  name: string;
  size: number;
  type: string;
}

export interface Occurrence {
  id: string;
  protocol: string;
  kind: OccurrenceKind;
  category: string;
  unitId: string;
  unitName: string;
  severity: OccurrenceSeverity;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  registeredAt: string;
  owner: string;
  driver: string;
  team: string;
  resolutionDeadline: string;
  priority: OccurrenceSeverity;
  status: OccurrenceStatus;
  observations: string;
  attachments: OccurrenceFile[];
  images: OccurrenceFile[];
  linkedTaskId?: number;
  demonstrative: true;
}

export interface CreateOccurrenceInput {
  kind: OccurrenceKind;
  category: string;
  unitId: string;
  unitName: string;
  severity: OccurrenceSeverity;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  owner: string;
  driver?: string;
  team?: string;
  resolutionDeadline: string;
  priority: OccurrenceSeverity;
  observations?: string;
  attachments: OccurrenceFile[];
  images: OccurrenceFile[];
}
