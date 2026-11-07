"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  EXTENSOES_ACEITAS,
  LIMITE_ARQUIVO_MB,
  OCR_DEMONSTRATIVO,
} from "@/data/documentFormOptions";

export interface ArquivoCustodia {
  id: string;
  file: File;
  nome: string;
  tamanho: number;
  extensao: string;
  /** Extração OCR simulada. */
  status: "extraindo" | "concluida";
  ocrConfirmado: boolean;
  /** Hash real calculado no navegador; "indisponivel" quando o contexto não é seguro. */
  sha256: string | null | "indisponivel";
}

export function formatarTamanho(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function calcularSha256(arquivo: File): Promise<string | "indisponivel"> {
  try {
    if (!globalThis.crypto?.subtle) return "indisponivel";
    const digest = await crypto.subtle.digest("SHA-256", await arquivo.arrayBuffer());
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "indisponivel";
  }
}

/** Arquivos em custódia: validação, extração OCR simulada e hash SHA-256 real. */
export function useDocumentFiles() {
  const [arquivos, setArquivos] = useState<ArquivoCustodia[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const proximoId = useRef(1);
  const temporizadores = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const ativos = temporizadores.current;
    return () => ativos.forEach(clearTimeout);
  }, []);

  const adicionar = useCallback((lista: File[]) => {
    const mensagens: string[] = [];
    const novos: ArquivoCustodia[] = [];

    for (const file of lista) {
      const extensao = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!(EXTENSOES_ACEITAS as readonly string[]).includes(extensao)) {
        mensagens.push(`“${file.name}”: formato não suportado (aceitamos PDF, XML, PNG, JPG ou TIFF).`);
        continue;
      }
      if (file.size > LIMITE_ARQUIVO_MB * 1024 * 1024) {
        mensagens.push(`“${file.name}”: excede o limite de ${LIMITE_ARQUIVO_MB} MB.`);
        continue;
      }
      novos.push({
        id: `arq-${proximoId.current++}`,
        file,
        nome: file.name,
        tamanho: file.size,
        extensao: extensao.toUpperCase(),
        status: "extraindo",
        ocrConfirmado: false,
        sha256: null,
      });
    }

    setErro(mensagens.length ? mensagens.join(" ") : null);
    if (novos.length === 0) return;

    setArquivos((atual) => {
      // Ignora duplicados (mesmo nome e tamanho).
      const inedito = novos.filter(
        (n) => !atual.some((a) => a.nome === n.nome && a.tamanho === n.tamanho),
      );
      return [...atual, ...inedito];
    });

    for (const novo of novos) {
      const timer = setTimeout(() => {
        temporizadores.current.delete(timer);
        setArquivos((atual) =>
          atual.map((a) => (a.id === novo.id ? { ...a, status: "concluida" } : a)),
        );
      }, OCR_DEMONSTRATIVO.duracaoMs);
      temporizadores.current.add(timer);

      void calcularSha256(novo.file).then((hash) =>
        setArquivos((atual) => atual.map((a) => (a.id === novo.id ? { ...a, sha256: hash } : a))),
      );
    }
  }, []);

  const remover = useCallback((id: string) => {
    setArquivos((atual) => atual.filter((a) => a.id !== id));
    setErro(null);
  }, []);

  const confirmarOcr = useCallback((id: string) => {
    setArquivos((atual) => atual.map((a) => (a.id === id ? { ...a, ocrConfirmado: true } : a)));
  }, []);

  const limpar = useCallback(() => {
    setArquivos([]);
    setErro(null);
  }, []);

  const visualizar = useCallback((id: string) => {
    const alvo = arquivos.find((a) => a.id === id);
    if (!alvo) return;
    const url = URL.createObjectURL(alvo.file);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [arquivos]);

  return { arquivos, erro, adicionar, remover, confirmarOcr, limpar, visualizar };
}
