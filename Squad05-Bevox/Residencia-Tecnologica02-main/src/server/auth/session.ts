import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie";
import { authenticate, AuthError, revokeSession, verifySession } from "@/server/auth/core";
import { createDemoBackend } from "@/server/auth/demo-backend";
import { hasPermission } from "@/server/auth/permissions";
import type { Acao, Modulo } from "@/schemas/user";

// Ambiente demonstrativo solicitado: mesmos usuários, status e perfis dos mocks.
// Não utilizar estas credenciais ou este armazenamento em uma operação real.
const backend = createDemoBackend();

export const verifyServerSession = (token: unknown) => verifySession(backend, token);
export const loginOnServer = (input: unknown) => authenticate(backend, input);
export const logoutOnServer = (token: unknown) => revokeSession(backend, token);

export async function requireServerSession() {
  let session;
  try { session = await verifyServerSession((await cookies()).get(SESSION_COOKIE_NAME)?.value); } catch { session = null; }
  if (!session) redirect("/login?motivo=expirada");
  return session;
}

/** Guard de operações sensíveis para uso pelos Route Handlers/serviços de dados reais. */
export async function requireServerPermission(module: Modulo, action: Acao, unitId?: string) {
  const session = await verifyServerSession((await cookies()).get(SESSION_COOKIE_NAME)?.value);
  if (!session) throw new AuthError("SESSION_INVALID", 401, "Sua sessão expirou. Entre novamente para continuar.");
  if (!hasPermission(session.user, module, action, unitId)) throw new AuthError("FORBIDDEN", 403, "Você não possui permissão para acessar esta página.");
  return session;
}
