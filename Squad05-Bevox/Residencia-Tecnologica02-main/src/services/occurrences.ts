import { mockOccurrences } from "@/data/mockOccurrences";
import type { CreateOccurrenceInput, Occurrence } from "@/types/occurrence";

let occurrencesDemo: Occurrence[] = mockOccurrences.map((item) => ({
  ...item,
  attachments: item.attachments.map((file) => ({ ...file })),
  images: item.images.map((file) => ({ ...file })),
}));
let nextOccurrenceNumber = 9850;

/** Repositório local em memória. Os registros são perdidos ao recarregar a aplicação. */
export async function getOccurrences(): Promise<Occurrence[]> {
  return occurrencesDemo.map((item) => ({
    ...item,
    attachments: item.attachments.map((file) => ({ ...file })),
    images: item.images.map((file) => ({ ...file })),
  }));
}

export async function createOccurrenceDemo(input: CreateOccurrenceInput): Promise<Occurrence> {
  const occurrence: Occurrence = {
    ...input,
    id: `occ-${nextOccurrenceNumber}`,
    protocol: `OC-${nextOccurrenceNumber}`,
    eventDate: input.eventDate,
    eventTime: input.eventTime,
    registeredAt: new Date().toISOString(),
    driver: input.driver ?? "",
    team: input.team ?? "",
    observations: input.observations ?? "",
    status: "Em Análise",
    attachments: input.attachments.map((file) => ({ ...file })),
    images: input.images.map((file) => ({ ...file })),
    demonstrative: true,
  };
  nextOccurrenceNumber += 1;
  occurrencesDemo = [occurrence, ...occurrencesDemo];
  return occurrence;
}

export async function linkTaskToOccurrence(occurrenceId: string, taskId: number): Promise<void> {
  occurrencesDemo = occurrencesDemo.map((item) =>
    item.id === occurrenceId ? { ...item, linkedTaskId: taskId } : item,
  );
}
