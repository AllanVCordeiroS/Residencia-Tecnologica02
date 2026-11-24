import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie";

const PUBLIC_ROUTES = ["/login"] as const;
const APPLICATION_ROUTES = [
  "/dashboard",
  "/documentos",
  "/financeiro",
  "/licencas",
  "/relatorios",
  "/tarefas",
  "/unidades",
  "/usuarios",
  "/users",
  "/configuracoes",
  "/operacional",
  "/notificacoes",
] as const;

type RouteAccess = "public" | "application" | "unmatched";

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function classifyRoute(pathname: string): RouteAccess {
  if (PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route))) {
    return "public";
  }

  if (APPLICATION_ROUTES.some((route) => matchesRoute(pathname, route))) {
    return "application";
  }

  return "unmatched";
}

export function proxy(request: NextRequest) {
  const routeAccess = classifyRoute(request.nextUrl.pathname);
  const isAuthenticated = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (routeAccess === "public") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (routeAccess === "application" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|.*\\..*).*)",
  ],
};
