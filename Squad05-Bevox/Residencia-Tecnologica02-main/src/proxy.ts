import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyServerSession } from "@/server/auth/session";
import { canAccessPath, firstAuthorizedPath } from "@/server/auth/permissions";
import { expireSessionCookie, noStore } from "@/server/auth/http";

const PUBLIC_ROUTES = ["/login", "/cadastro", "/privacidade", "/termos"] as const;
const PUBLIC_ASSETS = new Set(["/adega-distribution.jpg", "/bevox-logo-oficial.png", "/logo-bevox.png", "/file.svg", "/globe.svg", "/next.svg", "/vercel.svg", "/window.svg"]);
const AUTH_ENDPOINTS = new Set(["/api/auth/login", "/api/auth/logout", "/api/auth/session"]);

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_ASSETS.has(pathname) || AUTH_ENDPOINTS.has(pathname)) return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session;
  try { session = await verifyServerSession(token); } catch { session = null; }
  if (PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route))) {
    if (pathname === "/login" && session) {
      const destination = firstAuthorizedPath(session.user);
      if (destination) return noStore(NextResponse.redirect(new URL(destination, request.url)));
    }
    const response = noStore(NextResponse.next());
    return token && !session ? expireSessionCookie(response, request) : response;
  }
  if (!session) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "SESSION_INVALID", message: "Sua sessão expirou. Entre novamente para continuar." }, { status: 401 })
      : NextResponse.redirect(new URL(token ? "/login?motivo=expirada" : "/login", request.url));
    return noStore(expireSessionCookie(response, request));
  }
  if (pathname === "/") {
    return noStore(NextResponse.redirect(new URL(firstAuthorizedPath(session.user) ?? "/login?motivo=sem-permissao", request.url)));
  }
  if (!canAccessPath(session.user, pathname)) {
    return noStore(new NextResponse("Você não possui permissão para acessar esta página.", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } }));
  }
  return noStore(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$).*)",
  ],
};
