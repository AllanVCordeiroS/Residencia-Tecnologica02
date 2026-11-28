import type { QueryClient } from "@tanstack/react-query";
import { loginRequestSchema, sessionResponseSchema, type AuthenticatedSession } from "@/schemas/auth";
import { setPreferenceOwner } from "@/lib/preference-owner";

export const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.";
export const AUTH_UNAVAILABLE_MESSAGE = "Não foi possível acessar a autenticação demonstrativa. Tente novamente.";
export const LOGOUT_FAILED_MESSAGE = "Não foi possível confirmar o encerramento da sessão. Tente sair novamente.";

export class AuthClientError extends Error {
  constructor(message: string, public readonly status: number = 0) {
    super(message);
    this.name = "AuthClientError";
  }
}

async function request<T>(path: string, init: RequestInit, read: (response: Response) => T | Promise<T>): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  let rejectAbort: () => void = () => {};
  const aborted = new Promise<never>((_resolve, reject) => {
    rejectAbort = () => reject(new AuthClientError(AUTH_UNAVAILABLE_MESSAGE));
    controller.signal.addEventListener("abort", rejectAbort, { once: true });
  });
  if (init.signal?.aborted) abort();
  init.signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 15_000);
  try {
    // Redirect responses must never turn into a successful HTML login page.
    const result = (async () => {
      if (controller.signal.aborted) throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE);
      const response = await fetch(path, { ...init, signal: controller.signal, credentials: "same-origin", cache: "no-store", redirect: "error" });
      return read(response);
    })();
    // Keep both the deadline and caller cancellation active until JSON has been consumed.
    return await Promise.race([result, aborted]);
  } catch (error) {
    if (error instanceof AuthClientError) throw error;
    throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE);
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", rejectAbort);
  }
}

async function readSession(response: Response): Promise<AuthenticatedSession> {
  if (response.status !== 200) throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE, response.status);
  try {
    const { session } = sessionResponseSchema.parse(await response.json());
    if (session.expiresAt <= Date.now()) throw new Error("expired");
    return session;
  } catch {
    throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE, response.status);
  }
}

export async function getVerifiedSession(signal?: AbortSignal) {
  return request("/api/auth/session", { signal }, readSession);
}

/** Discard all queries AND mutations; credentials never enter a mutation cache. */
export async function clearPrivateClientState(queryClient: QueryClient) {
  setPreferenceOwner(null);
  let cancellation: Promise<void> | undefined;
  try {
    cancellation = queryClient.cancelQueries();
  } finally {
    queryClient.clear();
    if (typeof window !== "undefined") {
      try {
        const storage = window.sessionStorage;
        const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
        for (const key of keys) {
          if (key?.startsWith("bevox.settings.filters.")) storage.removeItem(key);
        }
      } catch { /* Optional storage can be denied by the browser. */ }
    }
  }
  try { await cancellation; } finally { queryClient.clear(); }
}

/** A server-approved redirect must still be a plain internal path in the browser. */
export function internalAuthRedirect(value: unknown): string {
  if (typeof value !== "string" || !/^\/[a-zA-Z0-9/_-]*$/.test(value) || value.startsWith("//")) {
    throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE);
  }
  if (["/", "/login", "/cadastro"].includes(value)) throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE);
  return value;
}

export async function loginAndConfirm(
  input: { email: string; senha: string; rememberDevice: boolean },
  queryClient: QueryClient,
  signal?: AbortSignal,
) {
  const parsed = loginRequestSchema.safeParse(input);
  if (!parsed.success) throw new AuthClientError("Confira o e-mail e a senha informados.", 400);
  await clearPrivateClientState(queryClient);
  const { postedSession, redirectTo } = await request("/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal,
  }, async (response) => {
    if (response.status === 400) throw new AuthClientError("Confira o e-mail e a senha informados.", 400);
    if (response.status === 401) throw new AuthClientError(INVALID_CREDENTIALS_MESSAGE, 401);
    if (response.status === 403) throw new AuthClientError("Esta conta não está autorizada a acessar a plataforma.", 403);
    if (response.status !== 200) throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE, response.status);
    try {
      const body = await response.json();
      return { postedSession: sessionResponseSchema.parse(body).session, redirectTo: internalAuthRedirect(body.redirectTo) };
    } catch {
      throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE);
    }
  });
  const session = await getVerifiedSession(signal);
  if (session.user.id !== postedSession.user.id || postedSession.expiresAt <= Date.now()) {
    throw new AuthClientError(AUTH_UNAVAILABLE_MESSAGE);
  }
  // Identity is assigned only by AuthProvider after its own session confirmation.
  return { session, redirectTo };
}

export async function logoutAndClear(queryClient: QueryClient, onRevoked: () => void) {
  let status: number;
  try { status = await request("/api/auth/logout", { method: "POST" }, (response) => response.status); }
  catch { throw new AuthClientError(LOGOUT_FAILED_MESSAGE); }
  if (status !== 204) throw new AuthClientError(LOGOUT_FAILED_MESSAGE, status);
  onRevoked();
  await clearPrivateClientState(queryClient);
}
