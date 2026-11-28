"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";
import { CheckCircle2, ChevronDown, Eye, EyeOff, Info, LoaderCircle, Mail, Phone, User, UserPlus } from "lucide-react";
import { Field } from "@/components/usuarios/form-section";
import { COLLABORATOR_DEPARTMENTS, COLLABORATOR_JOBS } from "@/data/collaboratorOptions";
import { useRegistrationUnitsQuery } from "@/hooks/queries/useRegistrationUnitsQuery";
import {
  createCollaboratorRegistrationSchema,
  formatBrazilianPhone,
  passwordRequirements,
  passwordStrength,
  type CollaboratorRegistrationValues,
  type RegistrationPasswordPolicy,
} from "@/schemas/collaborator";
import { readRegistrationPasswordPolicy, registerCollaboratorDemo } from "@/services/collaboratorRegistration";
import { DEFAULT_SECURITY_SETTINGS } from "@/services/settingsSchemas";

const defaults: CollaboratorRegistrationValues = {
  nome: "", email: "", telefone: "", cargo: "", unidadeId: "", departamento: "",
  senha: "", confirmarSenha: "", aceiteAcesso: false, aceitePrivacidade: false,
};
const fieldOrder = ["nome", "email", "telefone", "cargo", "unidadeId", "departamento", "senha", "confirmarSenha", "aceiteAcesso", "aceitePrivacidade"] as const;
const controlClass = "h-11 w-full min-w-0 rounded-lg border border-transparent bg-[#edf2ff] px-3 pr-11 text-sm text-[#233c68] [color-scheme:light] placeholder:text-[#526789] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 aria-invalid:border-red-500 disabled:cursor-not-allowed disabled:opacity-60";
const iconClass = "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#415b89]";
const focusClass = "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
const strengthColors = ["bg-slate-200", "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500"];

// Two frames let the browser paint the pending state even for the in-memory service.
function paintPendingState() {
  return new Promise<void>((resolve, reject) => requestAnimationFrame(() => {
    try {
      requestAnimationFrame(() => resolve());
    } catch {
      reject(new Error("Não foi possível renderizar o envio."));
    }
  }));
}

export default function CollaboratorForm() {
  const unitsQuery = useRegistrationUnitsQuery();
  const [policy, setPolicy] = useState<RegistrationPasswordPolicy>(DEFAULT_SECURITY_SETTINGS);
  const [policyStatus, setPolicyStatus] = useState<"loading" | "ready" | "error">("loading");
  const [policyAttempt, setPolicyAttempt] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);
  const errorFocus = useRef<keyof CollaboratorRegistrationValues | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const schema = useMemo(() => createCollaboratorRegistrationSchema(policy), [policy]);
  const {
    register, control, handleSubmit, setError, setFocus, reset, resetField, clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CollaboratorRegistrationValues>({
    resolver: zodResolver(schema), defaultValues: defaults, shouldFocusError: false,
    mode: "onBlur", reValidateMode: "onChange",
  });
  const [password, confirmation] = useWatch({ control, name: ["senha", "confirmarSenha"] });
  const strength = passwordStrength(password, policy);
  const matching = password.length > 0 && confirmation.length > 0 && password === confirmation;
  const activeUnits = (unitsQuery.data ?? []).filter((unit) => unit.ativa !== false);
  const unitsReady = !unitsQuery.isPending && !unitsQuery.isError && activeUnits.length > 0;
  const canSubmit = policyStatus === "ready" && unitsReady;
  const phoneField = register("telefone");

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const currentPolicy = readRegistrationPasswordPolicy();
        setPolicy(currentPolicy);
        setPolicyStatus("ready");
      } catch {
        setPolicyStatus("error");
      }
    });
    return () => { cancelled = true; };
  }, [policyAttempt]);

  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  useEffect(() => {
    if (!isSubmitting && errorFocus.current) {
      // Disabled fields cannot receive focus until the pending render has ended.
      setFocus(errorFocus.current);
      errorFocus.current = null;
    }
  }, [errors, isSubmitting, setFocus]);

  function fieldAttributes(name: keyof CollaboratorRegistrationValues, description?: string) {
    return {
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": [description, errors[name] ? `${name}-error` : undefined].filter(Boolean).join(" ") || undefined,
      "aria-required": true as const,
      required: true,
    };
  }

  function onSuccess() {
    // Never put form values (including passwords) into a mutation/query cache.
    resetField("senha", { defaultValue: "" });
    resetField("confirmarSenha", { defaultValue: "" });
    setShowPassword(false);
    setShowConfirmation(false);
    setSuccess(true);
  }

  async function submitValues(values: CollaboratorRegistrationValues) {
    clearErrors("root");
    if (!canSubmit) return;
    await paintPendingState();
    // Refresh guidance too: settings may have changed since this form was opened.
    try {
      setPolicy(readRegistrationPasswordPolicy());
    } catch {
      setPolicyStatus("error");
      setError("root", { message: "Não foi possível ler a política de senha. Tente carregá-la novamente." });
      return;
    }
    try {
      await registerCollaboratorDemo(values);
    } catch (error) {
      if (error instanceof ZodError) {
        let firstField: keyof CollaboratorRegistrationValues | undefined;
        for (const name of fieldOrder) {
          const issue = error.issues.find((item) => item.path[0] === name);
          if (issue) {
            setError(name, { type: "server", message: issue.message });
            firstField ??= name;
          }
        }
        if (firstField) errorFocus.current = firstField;
        else setError("root", { message: "Não foi possível validar o cadastro. Revise os dados e tente novamente." });
      } else if (error instanceof Error && error.message === "Já existe um usuário com este e-mail.") {
        setError("email", { type: "server", message: error.message });
        errorFocus.current = "email";
      } else if (error instanceof Error && error.message.includes("unidade")) {
        setError("unidadeId", { type: "server", message: "Esta unidade não está disponível. Atualize as unidades e selecione novamente." });
        errorFocus.current = "unidadeId";
        void unitsQuery.refetch();
      } else {
        setError("root", { message: "Não foi possível registrar a solicitação. Seus dados foram preservados; tente novamente." });
      }
      return;
    }
    onSuccess();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // This synchronous guard also covers clicks before RHF's next render/validation.
    if (submitting.current || isSubmitting || success || !canSubmit) return;
    submitting.current = true;
    try {
      await handleSubmit(submitValues, (invalidFields) => {
        const firstField = fieldOrder.find((name) => invalidFields[name]);
        if (firstField) errorFocus.current = firstField;
      })(event);
    } catch {
      setError("root", { message: "Não foi possível concluir o envio. Seus dados foram preservados; tente novamente." });
    } finally {
      submitting.current = false;
    }
  }

  if (success) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className={`space-y-5 py-4 text-sm text-[#233c68] dark:text-slate-200 ${focusClass}`}>
        <CheckCircle2 aria-hidden="true" className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
        <p className="text-lg font-bold text-[#10264b] dark:text-slate-100">Solicitação registrada</p>
        <p>Solicitação registrada nesta sessão demonstrativa como usuário inativo, sem liberação de acesso. Entre com uma das contas demonstrativas ativas já cadastradas. Senha não armazenada.</p>
        <p>O registro é temporário e será perdido ao recarregar a aplicação. Nenhum convite foi enviado.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/login" className={`inline-flex min-h-11 items-center bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 ${focusClass}`}>Entrar</Link>
          <button type="button" className={`min-h-11 px-2 font-semibold text-blue-700 dark:text-blue-300 ${focusClass}`} onClick={() => {
            reset(defaults);
            setSuccess(false);
            setPolicyStatus("loading");
            setPolicyAttempt((attempt) => attempt + 1);
            requestAnimationFrame(() => setFocus("nome"));
          }}>Nova solicitação</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Cadastro de colaborador" aria-busy={isSubmitting} className="space-y-5">
      <p className="text-xs text-[#526789] dark:text-slate-300">Todos os campos são obrigatórios.</p>
      <fieldset disabled={isSubmitting} className="m-0 min-w-0 space-y-5 border-0 p-0">
        <legend className="sr-only">Dados e consentimentos do colaborador</legend>
        <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome Completo" htmlFor="nome" required error={errors.nome?.message}>
              <div className="relative">
                <input id="nome" {...register("nome")} {...fieldAttributes("nome")} autoComplete="name" maxLength={160} placeholder="Digite seu nome completo" className={controlClass} />
                <User aria-hidden="true" className={iconClass} />
              </div>
            </Field>
          </div>
          <Field label="E-mail Corporativo" htmlFor="email" required error={errors.email?.message}>
            <div className="relative">
              <input id="email" type="email" {...register("email")} {...fieldAttributes("email")} autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} placeholder="nome@empresa.com.br" className={controlClass} />
              <Mail aria-hidden="true" className={iconClass} />
            </div>
          </Field>
          <Field label="Telefone / WhatsApp" htmlFor="telefone" required error={errors.telefone?.message}>
            <div className="relative">
              <input id="telefone" type="tel" {...phoneField} onChange={(event) => {
                const input = event.currentTarget;
                const digitCount = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
                input.value = formatBrazilianPhone(input.value);
                // Format before RHF reads the value, and retain the edited digit position.
                void phoneField.onChange(event);
                let cursor = 0;
                let digits = 0;
                while (cursor < input.value.length && digits < digitCount) {
                  if (/\d/.test(input.value[cursor])) digits += 1;
                  cursor += 1;
                }
                input.setSelectionRange(cursor, cursor);
              }} {...fieldAttributes("telefone")} autoComplete="tel-national" inputMode="tel" maxLength={15} placeholder="(81) 99999-9999" className={controlClass} />
              <Phone aria-hidden="true" className={iconClass} />
            </div>
          </Field>
          <Field label="Cargo / Função" htmlFor="cargo" required error={errors.cargo?.message}>
            <div className="relative">
              <select id="cargo" {...register("cargo")} {...fieldAttributes("cargo")} className={`${controlClass} appearance-none`}>
                <option value="">Selecione seu cargo</option>
                {COLLABORATOR_JOBS.map((job) => <option key={job} value={job}>{job}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className={iconClass} />
            </div>
          </Field>
          <Field label="Unidade de Trabalho" htmlFor="unidadeId" required error={errors.unidadeId?.message}>
            <div className="relative">
              <select id="unidadeId" {...register("unidadeId")} {...fieldAttributes("unidadeId", "units-status")} disabled={!unitsReady || isSubmitting} className={`${controlClass} appearance-none`}>
                <option value="">{unitsQuery.isPending ? "Carregando unidades..." : "Selecione sua unidade"}</option>
                {activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.nome}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className={iconClass} />
            </div>
            <div id="units-status" aria-live="polite" className="mt-1 text-xs text-[#526789] dark:text-slate-300">
              {unitsQuery.isPending ? <p>Carregando unidades de trabalho. Aguarde para enviar.</p> : unitsQuery.isError ? (
                <p role="alert">Não foi possível carregar as unidades. O envio está indisponível.</p>
              ) : activeUnits.length === 0 ? <p>Nenhuma unidade ativa disponível. O envio depende de uma unidade cadastrada e ativa.</p> : <span className="sr-only">Unidades ativas disponíveis.</span>}
              <button type="button" disabled={unitsQuery.isFetching || isSubmitting} onClick={() => { void unitsQuery.refetch(); }} className={`mt-1 min-h-8 text-blue-700 dark:text-blue-300 underline disabled:opacity-60 ${focusClass}`}>
                {unitsQuery.isFetching ? "Atualizando unidades..." : unitsQuery.isError ? "Tentar carregar unidades novamente" : "Atualizar unidades"}
              </button>
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Departamento" htmlFor="departamento" required error={errors.departamento?.message}>
              <div className="relative">
                <select id="departamento" {...register("departamento")} {...fieldAttributes("departamento")} className={`${controlClass} appearance-none`}>
                  <option value="">Selecione seu departamento</option>
                  {COLLABORATOR_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className={iconClass} />
              </div>
            </Field>
          </div>
          <Field label="Senha de Acesso" htmlFor="senha" required error={errors.senha?.message}>
            <div className="relative">
              <input id="senha" type={showPassword ? "text" : "password"} {...register("senha", { deps: ["confirmarSenha"] })} {...fieldAttributes("senha", "password-requirements password-strength")} autoComplete="new-password" maxLength={128} placeholder="Digite sua senha" className={controlClass} />
              <button type="button" aria-label={showPassword ? "Ocultar senha de acesso" : "Mostrar senha de acesso"} aria-pressed={showPassword} aria-controls="senha" onClick={() => setShowPassword((visible) => !visible)} className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#415b89] ${focusClass}`}>
                {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
              </button>
            </div>
            <div aria-hidden="true" className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((level) => <span key={level} className={`h-1 flex-1 rounded-full ${level <= strength.level ? strengthColors[strength.level] : "bg-slate-200"}`} />)}
            </div>
            <p id="password-strength" aria-live="polite" className="mt-1 text-xs font-medium text-[#415b89] dark:text-slate-300">{policyStatus === "ready" ? `Força da senha: ${strength.label}` : "Aguardando política de senha."}</p>
            <p id="password-requirements" className="mt-1 text-xs text-[#526789] dark:text-slate-300">{policyStatus === "ready" ? passwordRequirements(policy) : "Os requisitos serão exibidos após carregar a política."}</p>
          </Field>
          <Field label="Confirmar Senha" htmlFor="confirmarSenha" required error={errors.confirmarSenha?.message}>
            <div className="relative">
              <input id="confirmarSenha" type={showConfirmation ? "text" : "password"} {...register("confirmarSenha")} {...fieldAttributes("confirmarSenha", "password-match")} autoComplete="new-password" maxLength={128} placeholder="Digite novamente sua senha" className={controlClass} />
              <button type="button" aria-label={showConfirmation ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"} aria-pressed={showConfirmation} aria-controls="confirmarSenha" onClick={() => setShowConfirmation((visible) => !visible)} className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#415b89] ${focusClass}`}>
                {showConfirmation ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
              </button>
            </div>
            <p id="password-match" aria-live="polite" className={`mt-2 flex items-center gap-1 text-xs ${matching ? "text-emerald-700 dark:text-emerald-400" : confirmation ? "text-red-700 dark:text-red-300" : "text-[#526789] dark:text-slate-300"}`}>
              {matching && <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />}
              {matching ? "Senhas coincidentes" : confirmation ? "As senhas não coincidem." : "Digite novamente a senha para confirmar."}
            </p>
          </Field>
        </div>

        <div id="policy-status" aria-live="polite" className="text-xs text-[#526789] dark:text-slate-300">
          {policyStatus === "loading" && <p>Carregando política de senha. Aguarde para enviar.</p>}
          {policyStatus === "error" && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <p>Não foi possível carregar a política de senha. O envio está bloqueado até a leitura das configurações de segurança.</p>
              <button type="button" className={`mt-2 min-h-8 font-semibold underline ${focusClass}`} onClick={() => {
                setPolicyStatus("loading");
                setPolicyAttempt((attempt) => attempt + 1);
              }}>Tentar carregar política novamente</button>
            </div>
          )}
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-[#233c68] dark:text-slate-200">
          <div>
            <label htmlFor="aceiteAcesso" className="flex items-start gap-2">
              <input id="aceiteAcesso" type="checkbox" {...register("aceiteAcesso")} {...fieldAttributes("aceiteAcesso")} className={`mt-0.5 h-4 w-4 shrink-0 accent-blue-600 ${focusClass}`} />
              <span>Declaro estar ciente e de acordo com as diretrizes de acesso corporativo baseadas em funções (RBAC) e o termo de confidencialidade de dados da BEVOX.</span>
            </label>
            {errors.aceiteAcesso && <p id="aceiteAcesso-error" role="alert" className="mt-1 text-red-700 dark:text-red-300">{errors.aceiteAcesso.message}</p>}
          </div>
          <div>
            <div className="flex items-start gap-2">
              <input id="aceitePrivacidade" type="checkbox" {...register("aceitePrivacidade")} {...fieldAttributes("aceitePrivacidade")} aria-labelledby="privacy-consent-label" className={`mt-0.5 h-4 w-4 shrink-0 accent-blue-600 ${focusClass}`} />
              <div id="privacy-consent-label">
                <label htmlFor="aceitePrivacidade">Concordo com o tratamento dos meus dados pessoais conforme a </label>
                <Link href="/privacidade" target="_blank" rel="noopener noreferrer" className={`font-semibold text-blue-700 dark:text-blue-300 underline ${focusClass}`}>Política de Privacidade LGPD<span className="sr-only"> (abre em nova aba)</span></Link>
                <span> da BEVOX.</span>
              </div>
            </div>
            {errors.aceitePrivacidade && <p id="aceitePrivacidade-error" role="alert" className="mt-1 text-red-700 dark:text-red-300">{errors.aceitePrivacidade.message}</p>}
          </div>
        </div>
      </fieldset>

      <div id="demo-disclosure" className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-[#415b70] dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Demonstração local: esta solicitação registra um usuário inativo apenas nesta sessão, sem criar conta autenticada ou enviar convite. A senha não será armazenada. Para entrar, utilize uma das contas demonstrativas ativas já cadastradas.</p>
      </div>
      {errors.root && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{errors.root.message}</p>}
      <button type="submit" disabled={!canSubmit || isSubmitting} aria-busy={isSubmitting} aria-label={isSubmitting ? "Enviando cadastro..." : "Concluir Cadastro de Colaborador"} aria-describedby="demo-disclosure policy-status units-status" className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#064cf5] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}>
        {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> : <UserPlus aria-hidden="true" className="h-5 w-5" />}
        <span>{isSubmitting ? "Enviando cadastro..." : "Concluir Cadastro de Colaborador"}</span>
      </button>
      <p role="status" aria-live="polite" className="sr-only">{isSubmitting ? "Enviando cadastro..." : ""}</p>
    </form>
  );
}
