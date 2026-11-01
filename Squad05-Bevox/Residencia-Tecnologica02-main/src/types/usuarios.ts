export const PERFIS = [
  "Administrador Geral",
  "Gestor de Unidade",
  "Financeiro",
  "Operacional",
  "Colaborador",
] as const;
export type Perfil = (typeof PERFIS)[number];

export type StatusUsuario = "ativo" | "convite_pendente" | "inativo";

export type AvatarTone =
  | "blueDark"
  | "green"
  | "blueLight"
  | "yellow"
  | "red"
  | "mint"
  | "lavender"
  | "blue";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: Perfil;
  unidade: string;
  status: StatusUsuario;
  ultimoAcesso: string | null;
  avatarTone: AvatarTone;
}

export const MODULOS = [
  "Dashboard",
  "Documentos",
  "Tarefas",
  "Licenças e Alvarás",
  "Financeiro",
  "Usuários",
] as const;
export type Modulo = (typeof MODULOS)[number];

export const ACOES = ["visualizar", "criar", "editar", "excluir"] as const;
export type Acao = (typeof ACOES)[number];

export type Permissoes = Record<Modulo, Record<Acao, boolean>>;
