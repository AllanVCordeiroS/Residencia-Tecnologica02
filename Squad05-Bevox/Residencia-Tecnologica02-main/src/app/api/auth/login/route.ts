import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie";
import { AuthError } from "@/server/auth/core";
import { loginOnServer } from "@/server/auth/session";
import { assertSameOrigin, authFailure, expireSessionCookie, noStore, readLoginBody } from "@/server/auth/http";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const result = await loginOnServer(await readLoginBody(request));
    const response = noStore(NextResponse.json({ session: result.session, redirectTo: result.redirectTo }));
    response.cookies.set(SESSION_COOKIE_NAME, result.token, {
      path: "/", httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:",
      ...(result.rememberDevice ? { maxAge: Math.max(0, Math.floor((result.session.expiresAt - Date.now()) / 1000)), expires: new Date(result.session.expiresAt) } : {}),
    });
    return response;
  } catch (error) {
    const response = authFailure(error);
    // Uma origem rejeitada não pode usar o erro de Login para encerrar outra sessão.
    return error instanceof AuthError && error.code === "INVALID_ORIGIN" ? response : expireSessionCookie(response, request);
  }
}
