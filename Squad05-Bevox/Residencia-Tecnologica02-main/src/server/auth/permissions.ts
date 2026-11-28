import type { AuthenticatedUser } from "@/schemas/auth";
import type { Acao, Modulo } from "@/schemas/user";
import { ACOES, MODULOS } from "@/schemas/user";

const moduleRoutes: [string, Modulo][] = [
  ["/dashboard", "Dashboard"], ["/documentos", "Documentos"], ["/tarefas", "Tarefas"],
  ["/licencas", "Licenças e Alvarás"], ["/financeiro", "Financeiro"], ["/usuarios", "Usuários"], ["/users", "Usuários"],
];
const administrationRoutes = ["/unidades", "/operacional", "/relatorios", "/configuracoes", "/notificacoes"];
const matches = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(prefix + "/");

export function hasPermission(user: AuthenticatedUser, module: Modulo, action: Acao, unitId?: string) {
  if (!MODULOS.includes(module) || !ACOES.includes(action)) return false;
  if (unitId !== undefined && (typeof unitId !== "string" || !unitId)) return false;
  if (!user.permissoes[module]?.visualizar || !user.permissoes[module]?.[action]) return false;
  return !unitId || user.perfil === "Administrador Geral" || user.unidadeId === unitId;
}

export function canAccessPath(user: AuthenticatedUser, pathname: string) {
  const rule = moduleRoutes.find(([prefix]) => matches(pathname, prefix));
  if (rule) {
    const action: Acao = /\/(?:novo|nova|new|cadastrar|registrar-ocorrencia|import)(?:\/|$)/.test(pathname) ? "criar"
      : /\/editar(?:\/|$)/.test(pathname) ? "editar" : "visualizar";
    return hasPermission(user, rule[1], action);
  }
  // O catálogo legado não possui permissões por ação para estes módulos.
  // Até existir uma regra granular no backend, não conceda acesso a outros perfis.
  return administrationRoutes.some((prefix) => matches(pathname, prefix)) && user.perfil === "Administrador Geral";
}

export function firstAuthorizedPath(user: AuthenticatedUser) {
  return ["/dashboard", "/documentos", "/tarefas", "/licencas", "/financeiro", "/usuarios", "/configuracoes"].find((path) => canAccessPath(user, path)) ?? null;
}
