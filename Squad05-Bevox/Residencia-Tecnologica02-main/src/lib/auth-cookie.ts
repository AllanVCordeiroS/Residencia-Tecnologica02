import { USUARIOS_MOCK } from "@/lib/usuarios-mock";
import { sessionSchema } from "@/schemas/auth";
import type { Usuario as DashboardUsuario } from "@/types";
import type { Usuario as MockUsuario } from "@/types/usuarios";

export const SESSION_COOKIE_NAME = "bevox_session";

function toDashboardUsuario(usuario: MockUsuario): DashboardUsuario {
  const nomes = usuario.nome.trim().split(/\s+/);

  return {
    nome: usuario.nome,
    primeiroNome: nomes[0],
    iniciais: nomes.slice(0, 2).map((nome) => nome[0]).join("").toUpperCase(),
    perfil: usuario.perfil,
  };
}

export function getFallbackSessionUser(): DashboardUsuario {
  return toDashboardUsuario(USUARIOS_MOCK[0]);
}

export function setSessionCookie(email: string, rememberDevice: boolean) {
  const session = sessionSchema.parse({ email });
  const attributes = [
    "Path=/",
    "SameSite=Lax",
    ...(rememberDevice ? ["Max-Age=2592000"] : []),
    ...(window.location.protocol === "https:" ? ["Secure"] : []),
  ];

  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(session.email.toLowerCase())}; ${attributes.join("; ")}`;
}

export function getSessionUser(): DashboardUsuario {
  const fallbackUser = USUARIOS_MOCK[0];

  if (typeof document === "undefined") {
    return getFallbackSessionUser();
  }

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!cookie) {
    return getFallbackSessionUser();
  }

  let email: string;
  try {
    email = decodeURIComponent(cookie.slice(SESSION_COOKIE_NAME.length + 1));
  } catch {
    return getFallbackSessionUser();
  }

  const session = sessionSchema.safeParse({ email });
  if (!session.success) {
    return getFallbackSessionUser();
  }

  const usuario =
    USUARIOS_MOCK.find(
      (user) => user.email.toLowerCase() === session.data.email.toLowerCase(),
    ) ?? fallbackUser;

  return toDashboardUsuario(usuario);
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
