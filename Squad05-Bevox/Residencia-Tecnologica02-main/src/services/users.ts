import { PERMISSOES_POR_PERFIL, UNIDADES, USUARIOS_MOCK } from "@/lib/usuarios-mock";
import { mockUsers } from "@/data/mockUsers";
import { ACOES, MODULOS } from "@/types/usuarios";
import type { UserDetail, UserStatus } from "@/types/user";
import type { StatusUsuario, Usuario } from "@/types/usuarios";
import { userFormSchema, type UserFormValues } from "@/schemas/user";
import { collaboratorDetailsSchema, type CollaboratorDetails } from "@/schemas/collaborator";

// Estado demonstrativo da sessão do navegador, sem persistência ou API.
let usersDemo: Usuario[] = structuredClone(USUARIOS_MOCK);

/** Apenas solicitação local: nunca recebe credenciais ou cria uma sessão autenticada. */
export function insertCollaboratorRequestDemo(input: CollaboratorDetails, unit: { id: string; nome: string }): Usuario {
  const data = collaboratorDetailsSchema.parse(input);
  if (data.unidadeId !== unit.id) throw new Error("Selecione uma unidade disponível.");
  if (usersDemo.some((user) => user.email.trim().toLowerCase() === data.email)) {
    throw new Error("Já existe um usuário com este e-mail.");
  }
  const user: Usuario = {
    id: crypto.randomUUID(), nome: data.nome, email: data.email, telefone: data.telefone,
    cargo: data.cargo, unidade: unit.nome, unidadeId: unit.id, departamento: data.departamento,
    perfil: "Colaborador", status: "inativo", cadastroPendente: true, ultimoAcesso: null,
    avatarTone: "blue", enviarConvite: false, exigirMfa: false, unidadesAutorizadas: [unit.nome],
    permissoes: Object.fromEntries(MODULOS.map((modulo) => [modulo, Object.fromEntries(ACOES.map((acao) => [acao, false]))])) as Usuario["permissoes"],
    criadoEm: new Date().toLocaleDateString("pt-BR"),
    aceitesCadastro: { acessoCorporativo: data.aceiteAcesso, privacidade: data.aceitePrivacidade, registradoEm: new Date().toISOString() },
  };
  usersDemo = [user, ...usersDemo];
  return structuredClone(user);
}

export async function getUserForm(id: string): Promise<UserFormValues | null> {
  const user = usersDemo.find((item) => item.id === id);
  if (!user) return null;
  const detail = await getUserDetail(id);
  return {
    nome: user.nome, email: user.email, cargo: user.cargo,
    telefone: detail?.phone ?? "", unidade: user.unidade, perfil: user.perfil,
    unidadesAutorizadas: user.unidadesAutorizadas ?? (user.unidade === "Todas as unidades" ? [...UNIDADES] : []),
    permissoes: structuredClone(user.permissoes ?? PERMISSOES_POR_PERFIL[user.perfil]),
    enviarConvite: user.enviarConvite ?? user.status === "convite_pendente",
    exigirMfa: user.exigirMfa ?? detail?.mfaEnabled ?? false,
  };
}

export async function saveUserDemo(input: UserFormValues, id?: string): Promise<Usuario> {
  const data = userFormSchema.parse(input);
  const existing = id ? usersDemo.find((user) => user.id === id) : undefined;
  if (id && !existing) throw new Error("Usuário não encontrado.");
  // Um cadastro público pode usar uma unidade operacional que não consta no catálogo legado.
  // Na edição, preserve apenas esse vínculo já validado; não aceite novos nomes arbitrários.
  const availableUnits: string[] = [...UNIDADES, ...(existing?.unidadeId ? [existing.unidade] : [])];
  if (![...availableUnits, "Todas as unidades"].includes(data.unidade) || data.unidadesAutorizadas.some((unit) => !availableUnits.includes(unit))) {
    throw new Error("Selecione unidades disponíveis.");
  }
  if (usersDemo.some((user) => user.id !== id && user.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("Já existe um usuário com este e-mail.");
  }
  const user: Usuario = {
    ...existing, ...data, id: existing?.id ?? crypto.randomUUID(),
    unidadeId: data.unidade === existing?.unidade ? existing?.unidadeId : undefined,
    status: existing?.status ?? (data.enviarConvite ? "convite_pendente" : "ativo"),
    ultimoAcesso: existing?.ultimoAcesso ?? null,
    avatarTone: existing?.avatarTone ?? "blue",
    criadoEm: existing?.criadoEm ?? (existing ? undefined : new Date().toLocaleDateString("pt-BR")),
  };
  usersDemo = existing ? usersDemo.map((item) => item.id === id ? user : item) : [user, ...usersDemo];
  return structuredClone(user);
}

export async function getUsers(): Promise<Usuario[]> {
  return structuredClone(usersDemo);
}

export async function toggleUserStatusDemo(id: string): Promise<void> {
  if (!usersDemo.some((user) => user.id === id)) throw new Error("Usuário não encontrado.");
  usersDemo = usersDemo.map((user) => user.id === id
    ? { ...user, status: user.status === "inativo" ? "ativo" : "inativo" }
    : user);
}

export async function deleteUserDemo(id: string): Promise<void> {
  if (!usersDemo.some((user) => user.id === id)) throw new Error("Usuário não encontrado.");
  usersDemo = usersDemo.filter((user) => user.id !== id);
}

const STATUS: Record<StatusUsuario, UserStatus> = {
  ativo: "Ativo",
  inativo: "Inativo",
  convite_pendente: "Convite pendente",
};

/** Adaptador de leitura dos mesmos registros usados pela tabela de usuários. */
export async function getUserDetail(id: string): Promise<UserDetail | null> {
  const usuario = usersDemo.find((item) => item.id === id);
  if (!usuario) return null;
  const original = USUARIOS_MOCK.find((item) => item.id === id);
  const existingDetails = mockUsers.find((item) => item.id === id && item.email === original?.email);
  const permissions = structuredClone(usuario.permissoes ?? PERMISSOES_POR_PERFIL[usuario.perfil]);
  return {
    ...(existingDetails ? {
      phone: existingDetails.phone,
      createdAt: existingDetails.createdAt,
      createdWith: existingDetails.createdWith,
      startDate: existingDetails.startDate,
      endDate: existingDetails.endDate,
      mfaEnabled: existingDetails.mfaEnabled,
      activities: structuredClone(existingDetails.activities ?? []),
    } : {}),
    id: usuario.id,
    phone: usuario.telefone ?? existingDetails?.phone,
    createdAt: usuario.criadoEm ?? existingDetails?.createdAt,
    mfaEnabled: usuario.exigirMfa ?? existingDetails?.mfaEnabled,
    name: usuario.nome,
    email: usuario.email,
    jobTitle: usuario.cargo,
    role: usuario.perfil,
    status: STATUS[usuario.status],
    lastAccess: usuario.ultimoAcesso ?? "",
    primaryUnit: usuario.unidade,
    units: [...new Set([...(usuario.unidade === "Todas as unidades" ? UNIDADES : [usuario.unidade]), ...(usuario.unidadesAutorizadas ?? [])])],
    avatarTone: usuario.avatarTone,
    permissions,
    fullAccess: MODULOS.every((modulo) => ACOES.every((acao) => permissions[modulo][acao])),
  };
}
