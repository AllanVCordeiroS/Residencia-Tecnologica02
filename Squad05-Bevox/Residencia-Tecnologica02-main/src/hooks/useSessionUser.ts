"use client";

import { useAuth } from "@/providers/AuthProvider";
import type { Usuario } from "@/types";

export function useSessionUser(): Usuario {
  const { session } = useAuth();
  if (!session) throw new Error("Uma sessão verificada é necessária.");
  const { nome, perfil } = session.user;
  const nomes = nome.trim().split(/\s+/);
  return {
    nome,
    primeiroNome: nomes[0],
    iniciais: nomes.slice(0, 2).map((parte) => parte[0]).join("").toUpperCase(),
    perfil,
  };
}
