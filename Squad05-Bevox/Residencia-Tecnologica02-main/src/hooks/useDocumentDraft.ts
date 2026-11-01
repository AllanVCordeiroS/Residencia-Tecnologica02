"use client";

import { useSyncExternalStore } from "react";

import type { DocumentFormValues } from "@/components/documentos/documentFormSchema";

/**
 * Rascunho do formulário "Novo Documento" guardado no navegador (localStorage).
 * Os arquivos anexados NÃO são salvos no rascunho, apenas os campos do formulário.
 */
const CHAVE = "bevox:documento:rascunho";
const EVENTO = "bevox:documento:rascunho-alterado";

export interface Rascunho {
  salvoEm: string;
  valores: Partial<DocumentFormValues>;
}

function assinar(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  window.addEventListener(EVENTO, aoMudar);
  return () => {
    window.removeEventListener("storage", aoMudar);
    window.removeEventListener(EVENTO, aoMudar);
  };
}

function lerBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

/** Texto bruto do rascunho (ou null). No servidor, sempre null. */
export function useRascunhoBruto(): string | null {
  return useSyncExternalStore(assinar, lerBruto, () => null);
}

export function interpretarRascunho(bruto: string | null): Rascunho | null {
  if (!bruto) return null;
  try {
    const dados: unknown = JSON.parse(bruto);
    if (
      typeof dados === "object" &&
      dados !== null &&
      "salvoEm" in dados &&
      "valores" in dados &&
      typeof (dados as Rascunho).salvoEm === "string" &&
      typeof (dados as Rascunho).valores === "object" &&
      (dados as Rascunho).valores !== null
    ) {
      return dados as Rascunho;
    }
  } catch {
    /* rascunho corrompido: ignora */
  }
  return null;
}

export function salvarRascunho(valores: DocumentFormValues): Date {
  const agora = new Date();
  try {
    const conteudo: Rascunho = { salvoEm: agora.toISOString(), valores };
    window.localStorage.setItem(CHAVE, JSON.stringify(conteudo));
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    /* armazenamento indisponível ou cheio: o formulário continua funcionando */
  }
  return agora;
}

export function limparRascunho() {
  try {
    window.localStorage.removeItem(CHAVE);
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    /* sem ação */
  }
}

/** "10:45 BRT" (horário de Recife). */
export function formatarHoraRascunho(data: Date | string): string {
  const hora = new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Recife",
  });
  return `${hora} BRT`;
}
