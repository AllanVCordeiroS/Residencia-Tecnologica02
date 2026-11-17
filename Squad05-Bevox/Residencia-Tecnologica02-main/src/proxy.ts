import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

/**
 * O login atual valida apenas campos no navegador e não emite sessão,
 * criaria uma falsa proteção e quebraria o protótipo existente.
 * Quando a autenticação real existir, a decisão de redirecionamento deverá
 * ser adicionada ao ramo "application" após validar a sessão no servidor.
 * A autorização das operações também deverá permanecer nos handlers/serviços.
 */
export function proxy(request: NextRequest) {
  const routeAccess = classifyRoute(request.nextUrl.pathname);

  if (routeAccess === "public") {
    return NextResponse.next();
  }

  if (routeAccess === "application") {
    // Sem identidade verificável no projeto atual: preservar o comportamento.
    return NextResponse.next();
  }

  // Rotas inexistentes/fora da política não recebem redirecionamentos.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
