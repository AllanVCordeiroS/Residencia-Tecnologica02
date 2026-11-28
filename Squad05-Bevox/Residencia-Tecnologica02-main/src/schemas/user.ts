import * as z from "zod";

export const PERFIS = [
  "Administrador Geral",
  "Gestor de Unidade",
  "Financeiro",
  "Operacional",
  "Colaborador",
] as const;
export const perfilSchema = z.enum(PERFIS);
export const statusUsuarioSchema = z.enum([
  "ativo",
  "convite_pendente",
  "inativo",
]);
export const avatarToneSchema = z.enum([
  "blueDark",
  "green",
  "blueLight",
  "yellow",
  "red",
  "mint",
  "lavender",
  "blue",
]);

export const MODULOS = [
  "Dashboard",
  "Documentos",
  "Tarefas",
  "Licenças e Alvarás",
  "Financeiro",
  "Usuários",
] as const;
export const moduloSchema = z.enum(MODULOS);

export const ACOES = ["visualizar", "criar", "editar", "excluir"] as const;
export const acaoSchema = z.enum(ACOES);

export const permissoesSchema = z.record(
  moduloSchema,
  z.record(acaoSchema, z.boolean()),
);

export const usuarioSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string(),
  cargo: z.string(),
  perfil: perfilSchema,
  unidade: z.string(),
  status: statusUsuarioSchema,
  ultimoAcesso: z.string().nullable(),
  avatarTone: avatarToneSchema,
  telefone: z.string().optional(),
  unidadesAutorizadas: z.array(z.string()).optional(),
  permissoes: permissoesSchema.optional(),
  enviarConvite: z.boolean().optional(),
  exigirMfa: z.boolean().optional(),
  criadoEm: z.string().optional(),
  unidadeId: z.string().optional(),
  departamento: z.string().optional(),
  cadastroPendente: z.boolean().optional(),
  aceitesCadastro: z.object({ acessoCorporativo: z.boolean(), privacidade: z.boolean(), registradoEm: z.string() }).optional(),
});

export const userFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome completo."),
  email: z.string().trim().email("Informe um e-mail corporativo válido."),
  cargo: z.string().trim().min(1, "Informe o cargo ou função."),
  telefone: z.string().trim(),
  unidade: z.string().min(1, "Selecione a unidade vinculada."),
  perfil: perfilSchema,
  unidadesAutorizadas: z.array(z.string()),
  permissoes: permissoesSchema.superRefine((permissions, ctx) => {
    for (const modulo of MODULOS) {
      const permission = permissions[modulo];
      if (!permission.visualizar && (permission.criar || permission.editar || permission.excluir)) {
        ctx.addIssue({ code: "custom", message: "Ações exigem permissão de visualização.", path: [modulo] });
      }
    }
  }),
  enviarConvite: z.boolean(),
  exigirMfa: z.boolean(),
});
export type UserFormValues = z.infer<typeof userFormSchema>;

export const userRoleSchema = perfilSchema;
export const userStatusSchema = z.enum([
  "Ativo",
  "Convite pendente",
  "Inativo",
]);

export const userActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  ipAddress: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema,
  units: z.union([z.array(z.string()), z.string()]),
  status: userStatusSchema,
  lastAccess: z.string(),
  phone: z.string(),
  jobTitle: z.string(),
  mfaEnabled: z.boolean(),
  createdAt: z.string(),
  createdWith: z.string(),
  primaryUnit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  isOnline: z.boolean().optional(),
  fullAccess: z.boolean().optional(),
  authorizedModules: z.array(z.string()).optional(),
  activities: z.array(userActivitySchema).optional(),
});

export type Perfil = z.infer<typeof perfilSchema>;
export type StatusUsuario = z.infer<typeof statusUsuarioSchema>;
export type AvatarTone = z.infer<typeof avatarToneSchema>;
export type Modulo = z.infer<typeof moduloSchema>;
export type Acao = z.infer<typeof acaoSchema>;
export type Permissoes = z.infer<typeof permissoesSchema>;
export type Usuario = z.infer<typeof usuarioSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type UserActivity = z.infer<typeof userActivitySchema>;
export type User = z.infer<typeof userSchema>;
