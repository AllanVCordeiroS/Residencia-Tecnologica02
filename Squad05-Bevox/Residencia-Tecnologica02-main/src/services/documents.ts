import { mockDocuments } from "@/data/mockDocuments";
import type { LegalDocument } from "@/types/document";

/**
 * Adaptador demonstrativo de leitura, este serviço mantém o contrato que poderá ser ligado à uma futura API que vou criar.
 */
export async function getDocuments(): Promise<LegalDocument[]> {
  return mockDocuments.map((document) => ({ ...document }));
}
