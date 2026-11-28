"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authenticatedSessionSchema, type AuthenticatedSession, type AuthenticatedUser } from "@/schemas/auth";
import { setPreferenceOwner } from "@/lib/preference-owner";
import { clearPrivateClientState, getVerifiedSession, LOGOUT_FAILED_MESSAGE, logoutAndClear } from "@/services/authClient";
import { canAccessPath, firstAuthorizedPath } from "@/server/auth/permissions";

type AuthContextValue = {
  session: AuthenticatedSession | null;
  logout: () => Promise<void>;
  loggingOut: boolean;
  error: string | null;
};
const AuthContext = createContext<AuthContextValue | null>(null);
const LOGOUT_SIGNAL = "bevox:logout";

function authorizationScope(user: AuthenticatedUser): string {
  // Key order in a JSON response is not an authorization change.
  const permissions = Object.keys(user.permissoes).sort().map((module) => {
    const actions = user.permissoes[module as keyof typeof user.permissoes];
    return [module, Object.keys(actions).sort().map((action) => [action, actions[action as keyof typeof actions]])];
  });
  return JSON.stringify([user.id, user.perfil, user.unidadeId ?? null, user.unidade, permissions]);
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}

export default function AuthProvider({ initialSession, children }: { initialSession: AuthenticatedSession; children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [verified, setVerified] = useState<{ session: AuthenticatedSession; pathname: string; scope: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expectedOwner = useRef(initialSession.user.id);
  const currentPath = useRef(pathname);
  const request = useRef<{ generation: number; controller: AbortController | null }>({ generation: 0, controller: null });
  const ended = useRef(false);
  const logoutLock = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const preparedScope = useRef<string | null>(null);

  const abortVerification = useCallback(() => {
    request.current.generation++;
    request.current.controller?.abort();
    request.current.controller = null;
  }, []);

  const leave = useCallback((destination: string) => {
    if (ended.current) return;
    ended.current = true;
    abortVerification();
    setChecking(true);
    setVerified(null);
    setPreferenceOwner(null);
    void clearPrivateClientState(queryClient).catch(() => {
      // Navigation must still complete after the private content has been hidden.
    }).finally(() => window.location.replace(destination));
  }, [abortVerification, queryClient]);

  const verify = useCallback(async (afterLogoutFailure = false) => {
    if (ended.current || (logoutLock.current && !afterLogoutFailure)) return;
    abortVerification();
    const generation = request.current.generation;
    const controller = new AbortController();
    request.current.controller = controller;
    setChecking(true);
    try {
      const session = await getVerifiedSession(controller.signal);
      if (controller.signal.aborted || generation !== request.current.generation || ended.current) return;
      const initial = authenticatedSessionSchema.safeParse(initialSession);
      if (!initial.success || session.user.id !== expectedOwner.current) {
        leave(afterLogoutFailure ? "/login?motivo=logout-nao-confirmado" : "/login?motivo=expirada");
        return;
      }
      // A prefetched Router Cache entry may predate a permission change.
      // This UI gate supplements the server authorization on every new request.
      if (!canAccessPath(session.user, currentPath.current)) {
        leave(firstAuthorizedPath(session.user) ?? "/login?motivo=sem-permissao");
        return;
      }
      const scope = authorizationScope(session.user);
      if (preparedScope.current !== scope) {
        await clearPrivateClientState(queryClient);
        if (controller.signal.aborted || generation !== request.current.generation || ended.current) return;
        preparedScope.current = scope;
      }
      if (session.expiresAt <= Date.now()) {
        leave("/login?motivo=expirada");
        return;
      }
      setPreferenceOwner(session.user.id);
      setVerified({ session, pathname: currentPath.current, scope });
      setChecking(false);
    } catch {
      if (!controller.signal.aborted && generation === request.current.generation && !ended.current) {
        leave(afterLogoutFailure ? "/login?motivo=logout-nao-confirmado" : "/login?motivo=expirada");
      }
    }
  }, [abortVerification, initialSession, leave, queryClient]);

  // A new route is hidden in render before this check starts.
  useLayoutEffect(() => {
    currentPath.current = pathname;
    let active = true;
    void Promise.resolve().then(() => { if (active) void verify(); });
    return () => { active = false; abortVerification(); };
  }, [verify, abortVerification, pathname]);

  useEffect(() => {
    const recheck = () => {
      if (ended.current || logoutLock.current) return;
      flushSync(() => setChecking(true));
      void verify();
    };
    const visibility = () => {
      if (document.visibilityState === "visible") recheck();
    };
    // Hide the DOM before a history snapshot can retain private content.
    const pagehide = () => {
      abortVerification();
      flushSync(() => setChecking(true));
    };
    const storage = (event: StorageEvent) => {
      if (event.key === LOGOUT_SIGNAL && event.newValue) leave("/login");
    };
    try {
      channel.current = new BroadcastChannel(LOGOUT_SIGNAL);
      channel.current.onmessage = (event) => {
        if (event.data === "logout") leave("/login");
      };
    } catch { /* storage events are the fallback when BroadcastChannel is unavailable. */ }
    window.addEventListener("focus", recheck);
    window.addEventListener("pageshow", recheck);
    window.addEventListener("pagehide", pagehide);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener("pageshow", recheck);
      window.removeEventListener("pagehide", pagehide);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", visibility);
      channel.current?.close();
      channel.current = null;
    };
  }, [abortVerification, leave, verify]);

  useEffect(() => {
    if (!verified) return;
    const remaining = verified.session.expiresAt - Date.now();
    const timer = window.setTimeout(() => {
      if (verified.session.expiresAt <= Date.now()) leave("/login?motivo=expirada");
      else void verify();
    }, Math.min(Math.max(remaining, 0), 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [leave, verified, verify]);

  const logout = useCallback(async () => {
    if (logoutLock.current || ended.current) return;
    logoutLock.current = true;
    setLoggingOut(true);
    setError(null);
    abortVerification();
    try {
      await logoutAndClear(queryClient, () => {
        ended.current = true;
        setVerified(null);
        setPreferenceOwner(null);
        try { channel.current?.postMessage("logout"); } catch { /* Use storage fallback. */ }
        try {
          window.localStorage.setItem(LOGOUT_SIGNAL, String(Date.now()) + ":" + Math.random());
          window.localStorage.removeItem(LOGOUT_SIGNAL);
        } catch { /* Optional browser storage may be blocked. */ }
      });
      window.location.replace("/login");
    } catch {
      if (ended.current) window.location.replace("/login");
      else {
        setError(LOGOUT_FAILED_MESSAGE);
        // A lost response may have followed a successful revocation. Keep private
        // content hidden until the server confirms this session and route again.
        await verify(true);
      }
    } finally {
      logoutLock.current = false;
      setLoggingOut(false);
    }
  }, [abortVerification, queryClient, verify]);

  const session = verified?.session ?? null;
  const ready = session && verified?.pathname === pathname && !checking;
  return (
    <AuthContext.Provider value={{ session, logout, loggingOut, error }}>
      {/* Preserve forms only within the same scope; a changed scope remounts private state. */}
      <div key={verified?.scope ?? "pending"} style={{ display: ready ? "contents" : "none" }}>{session ? children : null}</div>
      {!ready && <p role="status" className="p-6 text-sm text-slate-500">Verificando sessão...</p>}
      {!ready && error && <p role="alert" className="p-6 text-sm text-red-600 dark:text-red-300">{error}</p>}
    </AuthContext.Provider>
  );
}
