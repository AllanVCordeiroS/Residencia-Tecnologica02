import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie";
import { AUTH_UNAVAILABLE, AuthError } from "@/server/auth/core";

export function noStore<T extends Response>(response: T): T {
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Vary", "Cookie");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export function expireSessionCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", expires: new Date(0), maxAge: 0 });
  return response;
}

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== request.nextUrl.origin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AuthError("INVALID_ORIGIN", 403, "Origem da solicitação não autorizada.");
  }
}

export async function readLoginBody(request: NextRequest) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new AuthError("INVALID_INPUT", 415, "Envie os dados do formulário em JSON.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AuthError("INVALID_INPUT", 400, "Preencha o e-mail e a senha.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new AuthError("INVALID_INPUT", 413, "O formulário excede o tamanho permitido."); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)) as unknown; }
  catch { throw new AuthError("INVALID_INPUT", 400, "Não foi possível ler os dados do formulário."); }
}

export function authFailure(error: unknown) {
  const known = error instanceof AuthError;
  return noStore(NextResponse.json({ error: known ? error.code : "AUTH_UNAVAILABLE", message: known ? error.message : AUTH_UNAVAILABLE }, { status: known ? error.status : 503 }));
}
