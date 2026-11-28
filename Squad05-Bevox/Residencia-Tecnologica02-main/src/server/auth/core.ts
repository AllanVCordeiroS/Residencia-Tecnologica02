import { z } from "zod";
import { authenticatedUserSchema, loginRequestSchema, type AuthenticatedSession } from "@/schemas/auth";
import { statusUsuarioSchema } from "@/schemas/user";
import { firstAuthorizedPath } from "@/server/auth/permissions";

export const INVALID_CREDENTIALS = "E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.";
export const AUTH_UNAVAILABLE = "Não foi possível validar a sessão demonstrativa. Tente novamente.";
export class AuthError extends Error {
  constructor(public readonly code: string, public readonly status: number, message: string) { super(message); }
}

const accountSchema = authenticatedUserSchema.extend({
  status: statusUsuarioSchema, cadastroPendente: z.boolean().default(false), passwordHash: z.string().min(1),
});
const storedSessionSchema = z.object({ accountId: z.string().min(1), expiresAt: z.number().finite(), revoked: z.boolean() });
export type ServerAccount = z.infer<typeof accountSchema>;
export type StoredSession = z.infer<typeof storedSessionSchema>;

/** Porta do armazenamento de contas e sessões, usada pelo adaptador demonstrativo. */
export interface AuthBackend {
  findAccountByEmail(email: string): Promise<ServerAccount | null>;
  findAccountById(id: string): Promise<ServerAccount | null>;
  verifyPassword(password: string, storedHash: string): Promise<boolean>;
  createSession(accountId: string, expiresAt: number): Promise<string>;
  readSession(token: string): Promise<StoredSession | null>;
  revokeSession(token: string): Promise<void>;
}

export function isSessionToken(value: unknown): value is string {
  return typeof value === "string" && value.length >= 32 && value.length <= 4096 && /^[A-Za-z0-9._~-]+$/.test(value);
}

function authorizedAccount(value: unknown) {
  const parsed = accountSchema.safeParse(value);
  return parsed.success && parsed.data.status === "ativo" && !parsed.data.cadastroPendente ? parsed.data : null;
}

export async function verifySession(backend: AuthBackend | null, token: unknown, now = Date.now()): Promise<AuthenticatedSession | null> {
  if (!backend || !isSessionToken(token)) return null;
  const parsed = storedSessionSchema.safeParse(await backend.readSession(token));
  if (!parsed.success || parsed.data.revoked || parsed.data.expiresAt <= now) return null;
  const account = authorizedAccount(await backend.findAccountById(parsed.data.accountId));
  if (!account || account.id !== parsed.data.accountId) return null;
  // Releia status e permissões a cada validação; o cookie não contém identidade confiável.
  return { user: authenticatedUserSchema.parse(account), expiresAt: parsed.data.expiresAt };
}

export async function authenticate(backend: AuthBackend | null, input: unknown, now = Date.now()) {
  const parsed = loginRequestSchema.safeParse(input);
  if (!parsed.success) throw new AuthError("INVALID_INPUT", 400, "Revise o e-mail e preencha a senha.");
  if (!backend) throw new AuthError("AUTH_UNAVAILABLE", 503, AUTH_UNAVAILABLE);
  const credentials = parsed.data;
  const result = accountSchema.safeParse(await backend.findAccountByEmail(credentials.email));
  if (!result.success || result.data.email.toLowerCase() !== credentials.email || !await backend.verifyPassword(credentials.senha, result.data.passwordHash)) {
    throw new AuthError("INVALID_CREDENTIALS", 401, INVALID_CREDENTIALS);
  }
  const account = result.data;
  if (account.status !== "ativo" || account.cadastroPendente) {
    throw new AuthError("ACCOUNT_NOT_AUTHORIZED", 403, "Esta conta está inativa ou ainda aguarda liberação de acesso.");
  }
  const redirectTo = firstAuthorizedPath(account);
  if (!redirectTo) throw new AuthError("FORBIDDEN", 403, "Você não possui permissão para acessar esta página.");
  const ttl = credentials.rememberDevice ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
  const token = await backend.createSession(account.id, now + ttl * 1000);
  let session;
  try { session = await verifySession(backend, token, now); }
  catch (error) {
    // Se a confirmação falhar após a criação, não entregue o cookie e tente revogar.
    try { await backend.revokeSession(token); } catch { /* O acesso continua negado. */ }
    throw error;
  }
  if (!session || session.user.id !== account.id || session.expiresAt > now + ttl * 1000) {
    if (isSessionToken(token)) await backend.revokeSession(token);
    throw new AuthError("AUTH_UNAVAILABLE", 503, AUTH_UNAVAILABLE);
  }
  return { token, session, redirectTo, rememberDevice: credentials.rememberDevice };
}

export async function revokeSession(backend: AuthBackend | null, token: unknown) {
  // Uma sessão só é válida enquanto existir no armazenamento do adaptador.
  if (backend && isSessionToken(token)) await backend.revokeSession(token);
}
