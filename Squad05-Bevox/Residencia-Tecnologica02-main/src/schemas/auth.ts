import * as z from "zod";
import { perfilSchema, permissoesSchema } from "@/schemas/user";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Preencha seu e-mail.").email("Digite um e-mail válido.").max(254),
  senha: z.string().min(1, "Preencha sua senha.").max(128, "Use até 128 caracteres.").refine((value) => value.trim().length > 0, "Preencha sua senha."),
});

export const loginRequestSchema = loginSchema.extend({ rememberDevice: z.boolean().default(false) });

/** DTO autorizado no servidor; não contém token ou hash de senha. */
export const authenticatedUserSchema = z.object({
  id: z.string().min(1), nome: z.string().min(1), email: z.string().email(),
  perfil: perfilSchema, unidade: z.string(), unidadeId: z.string().optional(), permissoes: permissoesSchema,
});
export const authenticatedSessionSchema = z.object({ user: authenticatedUserSchema, expiresAt: z.number().finite().positive() });
export const sessionResponseSchema = z.object({ session: authenticatedSessionSchema });
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type AuthenticatedSession = z.infer<typeof authenticatedSessionSchema>;
