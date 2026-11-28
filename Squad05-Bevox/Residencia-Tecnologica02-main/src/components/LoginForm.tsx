"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { AUTH_UNAVAILABLE_MESSAGE, AuthClientError, loginAndConfirm } from "@/services/authClient";
import { loginSchema } from "@/schemas/auth";
import type { LoginCredentials } from "@/types/auth";

export default function LoginForm() {
  const queryClient = useQueryClient();
  const submissionLock = useRef(false);
  const request = useRef<AbortController | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<string | null>(null);
  const [mostraSenha, exibirSenha] = useState(false);
  const [lembrarDispositivo, setLembrarDispositivo] = useState(true);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const reason = new URLSearchParams(window.location.search).get("motivo");
      setSessionFeedback(reason === "expirada" ? "Sua sessão expirou. Entre novamente para continuar."
        : reason === "logout-nao-confirmado" ? "Não foi possível confirmar o encerramento ou a validade da sessão. Entre novamente para continuar."
        : reason === "sem-permissao" ? "Você não possui permissão para acessar esta página." : null);
    });
    return () => { active = false; request.current?.abort(); };
  }, []);
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
    mode: "onBlur",
  });
  const busy = isSubmitting || authenticating;

  async function onSubmit(credentials: LoginCredentials) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setAuthenticating(true);
    clearErrors("root");
    const controller = new AbortController();
    request.current = controller;
    try {
      const { redirectTo } = await loginAndConfirm({ ...credentials, rememberDevice: lembrarDispositivo }, queryClient, controller.signal);
      if (!controller.signal.aborted) window.location.replace(redirectTo);
    } catch (error) {
      if (!controller.signal.aborted) {
        setError("root", { type: "manual", message: error instanceof AuthClientError ? error.message : AUTH_UNAVAILABLE_MESSAGE });
      }
    } finally {
      submissionLock.current = false;
      setAuthenticating(false);
      request.current = null;
    }
  }

  return (
    <form onSubmit={(event) => { void handleSubmit(onSubmit)(event); }} className="space-y-5">
      {sessionFeedback && <p role="status" className="text-sm text-slate-600 dark:text-foreground-muted">{sessionFeedback}</p>}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-slate-700 dark:text-foreground"
        >
          E-MAIL CORPORATIVO
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-foreground-muted">
            @
          </span>

          <input
            id="email"
            disabled={busy}
            type="email"
            autoComplete="username"
            placeholder="seu@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email", {
              onChange: () => clearErrors("root"),
            })}
            className="w-full rounded-lg border border-slate-300 dark:border-line bg-white dark:bg-surface-raised py-3 pl-10 pr-4 text-slate-900 dark:text-foreground outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {errors.email && (
          <p
            id="email-error"
            role="alert"
            className="mt-1 text-sm text-red-600 dark:text-red-300"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor="senha"
          className="text-sm font-bold text-slate-700 dark:text-foreground"
        >
          SENHA DE ACESSO
        </label>

        <a
          href="#"
          className="text-xs font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Esqueceu a senha?
        </a>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-foreground-muted">
          ♙
        </span>

        <input
          id="senha"
          disabled={busy}
          type={mostraSenha ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Digite sua senha"
          aria-invalid={Boolean(errors.senha)}
          aria-describedby={errors.senha ? "senha-error" : undefined}
          {...register("senha", {
            onChange: () => clearErrors("root"),
          })}
          className="w-full rounded-lg border border-slate-300 dark:border-line bg-white dark:bg-surface-raised py-3 pl-10 pr-12 text-slate-900 dark:text-foreground outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => exibirSenha(!mostraSenha)}
          aria-label={mostraSenha ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-foreground-muted hover:text-slate-700 dark:hover:text-foreground"
        >
          {mostraSenha ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {errors.senha && (
        <p
          id="senha-error"
          role="alert"
          className="text-sm text-red-600 dark:text-red-300"
        >
          {errors.senha.message}
        </p>
      )}

      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500 dark:text-foreground-muted">
        <input
          type="checkbox"
          disabled={busy}
          checked={lembrarDispositivo}
          onChange={(event) => setLembrarDispositivo(event.target.checked)}
          className="h-4 w-4 cursor-pointer accent-blue-700"
        />
        Lembrar este dispositivo por 30 dias
      </label>

      {errors.root && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {busy ? "Validando credenciais..." : "Acessar Plataforma"}
      </button>
    </form>
  );
}
