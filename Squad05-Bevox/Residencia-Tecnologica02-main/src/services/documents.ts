import { mockDocuments } from "@/data/mockDocuments";
import { legalDocumentSchema } from "@/schemas/document";
import type { LegalDocument } from "@/types/document";

/**
 * Demonstrative browser storage adapter; no remote API or database is called.
 */
export async function getDocuments(): Promise<LegalDocument[]> {
  return read().map((doc) => ({ ...deriveDocumentValidity(doc), fileUrl: files.get(doc.id) ?? doc.fileUrl }));
}

/** Accept the original Brazilian dates and the ISO values written by forms. */
export function documentDueDateIso(value: string | null): string | null {
  if (!value) return null;
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value.split("/").reverse().join("-") : value;
}

export function deriveDocumentValidity(doc: LegalDocument, now = new Date()): LegalDocument {
  const iso = documentDueDateIso(doc.dueDate);
  if (!iso) return { ...doc, dueText: "Prazo indeterminado", dueLevel: undefined };
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const date = new Date(iso + "T00:00:00Z").getTime();
  if (!Number.isFinite(date)) return { ...doc, dueText: "Verifique a data de vencimento", dueLevel: undefined };
  const days = Math.round((date - today) / 86400000);
  return {
    ...doc,
    status: days < 0 ? "Vencido" : doc.status,
    dueText: days < 0 ? `Vencido há ${-days} dia(s)` : days === 0 ? "Vence hoje" : `Vence em ${days} dia(s)`,
    dueLevel: days <= 5 ? "critical" : days <= 30 ? "warning" : undefined,
  };
}

const KEY = "bevox:documents:v1";
const files = new Map<number, string>();
let deletionGuard: ((id: number) => boolean | Promise<boolean>) | null = null;

/** Protect linked licenses without introducing a circular service dependency. */
export function setDocumentDeletionGuard(guard: (id: number) => boolean | Promise<boolean>) {
  deletionGuard = guard;
}

function read(): LegalDocument[] {
  if (typeof window === "undefined") return mockDocuments.map((doc) => ({ ...doc }));
  const raw = window.localStorage.getItem(KEY);
  return raw ? legalDocumentSchema.array().parse(JSON.parse(raw)) : mockDocuments.map((doc) => ({ ...doc }));
}

function write(documents: LegalDocument[]) {
  if (typeof window === "undefined") throw new Error("Armazenamento local indisponível.");
  window.localStorage.setItem(KEY, JSON.stringify(documents));
}

/** Records persist locally; selected files are available only during this browser session. */
export async function createDocumentDemo(input: Omit<LegalDocument, "id">, file?: File): Promise<LegalDocument> {
  const documents = read();
  const created = legalDocumentSchema.parse({ ...input, id: Math.max(0, ...documents.map((doc) => doc.id)) + 1 });
  write([created, ...documents]);
  if (file) files.set(created.id, URL.createObjectURL(file));
  return { ...created, fileUrl: files.get(created.id) ?? created.fileUrl };
}

export async function updateDocumentDemo(id: number, patch: Partial<Omit<LegalDocument, "id">>): Promise<LegalDocument> {
  const documents = read();
  const current = documents.find((doc) => doc.id === id);
  if (!current) throw new Error("Documento não encontrado.");
  const updated = legalDocumentSchema.parse({ ...current, ...patch, id });
  write(documents.map((doc) => doc.id === id ? updated : doc));
  return { ...updated, fileUrl: files.get(id) ?? updated.fileUrl };
}

export async function deleteDocumentDemo(id: number): Promise<void> {
  if (deletionGuard && !(await deletionGuard(id))) {
    throw new Error("Este documento está vinculado a uma licença. Remova o vínculo antes de excluir.");
  }
  const documents = read();
  if (!documents.some((doc) => doc.id === id)) throw new Error("Documento não encontrado.");
  write(documents.filter((doc) => doc.id !== id));
  const url = files.get(id);
  if (url) URL.revokeObjectURL(url);
  files.delete(id);
}

export function getDocumentFileUrl(id: number): string | null {
  if (files.has(id)) return files.get(id)!;
  try { return read().find((doc) => doc.id === id)?.fileUrl ?? null; }
  catch { return null; }
}
