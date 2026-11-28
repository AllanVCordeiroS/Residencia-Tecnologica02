"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema, type UserFormValues } from "@/schemas/user";
import { useSaveUserMutation } from "@/hooks/queries/useUsersQuery";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  Briefcase,
  ChevronDown,
  IdCard,
  Info,
  Landmark,
  Lock,
  Mail,
  Network,
  Phone,
  User,
  UserPlus,
  X,
  ShieldCheck,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Field, FormSection, inputClass } from "@/components/usuarios/form-section";
import { PermissionMatrix } from "@/components/usuarios/permission-matrix";
import { UnitsChecklist } from "@/components/usuarios/units-checklist";
import { PERMISSOES_POR_PERFIL, UNIDADES } from "@/lib/usuarios-mock";
import { PERFIS, type Acao, type Modulo, type Perfil, type Permissoes } from "@/types/usuarios";

const clonar = (p: Permissoes): Permissoes => JSON.parse(JSON.stringify(p));


export default function UserForm({ id, initialValues }: { id?: string; initialValues?: UserFormValues }) {
  const router = useRouter();
  const defaults: UserFormValues = initialValues ?? {
    nome: "", email: "", cargo: "", telefone: "", unidade: "", perfil: "Colaborador",
    unidadesAutorizadas: [], permissoes: clonar(PERMISSOES_POR_PERFIL.Colaborador),
    enviarConvite: true, exigirMfa: false,
  };
  const { register, control, setValue, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema), defaultValues: defaults,
  });
  const values = useWatch({ control });
  const unidade = values.unidade ?? defaults.unidade;
  const perfil = values.perfil ?? defaults.perfil;
  const unidadesAutorizadas = (values.unidadesAutorizadas ?? defaults.unidadesAutorizadas) as string[];
  const permissoes = (values.permissoes ?? defaults.permissoes) as Permissoes;
  const enviarConvite = values.enviarConvite ?? defaults.enviarConvite;
  const exigirMfa = values.exigirMfa ?? defaults.exigirMfa;
  const mutation = useSaveUserMutation(id);
  const salvando = mutation.isPending;
  const { requestNavigation, requestDiscard, allowNavigation, dialog } = useUnsavedChanges({
    dirty: isDirty,
    onDiscard: () => reset(defaults),
  });
  const erros = { nome: errors.nome?.message, email: errors.email?.message, cargo: errors.cargo?.message, unidade: errors.unidade?.message };
  const trocarPerfil = (p: Perfil) => {
    setValue("perfil", p, { shouldDirty: true, shouldValidate: true });
    setValue("permissoes", clonar(PERMISSOES_POR_PERFIL[p]), { shouldDirty: true });
  };
  const alternarPermissao = (modulo: Modulo, acao: Acao, valor: boolean) => {
    const next = clonar(permissoes);
    next[modulo][acao] = valor;
    if (acao === "visualizar" && !valor) next[modulo].criar = next[modulo].editar = next[modulo].excluir = false;
    else if (acao !== "visualizar" && valor) next[modulo].visualizar = true;
    setValue("permissoes", next, { shouldDirty: true, shouldValidate: true });
  };
  const escopo = useMemo(() => {
    const units = new Set([...unidadesAutorizadas, ...(unidade ? [unidade] : [])]);
    if (unidade === "Todas as unidades" || units.size === UNIDADES.length) return "Todas as unidades";
    if (units.size === 0) return "—";
    return `${units.size} unidade(s)`;
  }, [unidadesAutorizadas, unidade]);

  const salvar = handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync(data);
      allowNavigation();
      router.push("/usuarios");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível salvar o usuário.";
      setError(message.includes("e-mail") ? "email" : "root", { message });
    }
  });

  return (
    <main className="mx-auto w-full max-w-[1200px]">
      {dialog}
      <form onSubmit={salvar} noValidate aria-busy={salvando}>
        <fieldset disabled={salvando} className="min-w-0 border-0 p-0">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{id ? "Editar usuário" : "Novo usuário"}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-foreground-muted">Cadastre o colaborador e configure seu acesso ao BEVOX.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => requestNavigation("/usuarios")} className="text-sm font-semibold text-foreground-muted">Voltar</button>
            <button
              type="button"
              onClick={() => requestDiscard(() => router.push("/usuarios"))}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 dark:border-line bg-white dark:bg-surface-raised px-4 text-sm font-semibold text-foreground hover:bg-slate-50 dark:hover:bg-surface-muted"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" />
              {salvando ? "Salvando..." : "Salvar usuário"}
            </button>
          </div>
        </header>

        <p className="mt-4 text-xs text-foreground-muted">Os dados são mantidos em memória durante a navegação e serão restaurados ao recarregar. Nenhum convite é enviado.</p>
        {errors.root && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{errors.root.message}</p>}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-6">
            <FormSection icon={IdCard} title="1. Dados do usuário" description="Informações pessoais e profissionais do colaborador.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nome completo" htmlFor="nome" required error={erros.nome}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-foreground-muted" />
                    <input id="nome" {...register("nome")} aria-invalid={!!errors.nome} aria-describedby={errors.nome ? "nome-error" : undefined} placeholder="Ex: João da Silva Santos" className={inputClass} />
                  </div>
                </Field>

                <Field label="E-mail corporativo" htmlFor="email" required error={erros.email}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-foreground-muted" />
                    <input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} placeholder="exemplo@adega.com.br" className={inputClass} />
                  </div>
                </Field>

                <Field label="Cargo ou função" htmlFor="cargo" required error={erros.cargo}>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-foreground-muted" />
                    <input id="cargo" {...register("cargo")} aria-invalid={!!errors.cargo} aria-describedby={errors.cargo ? "cargo-error" : undefined} placeholder="Ex: Vendedor, Analista, etc." className={inputClass} />
                  </div>
                </Field>

                <Field label="Telefone (opcional)" htmlFor="telefone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-foreground-muted" />
                    <input id="telefone" type="tel" {...register("telefone")} aria-invalid={!!errors.telefone} aria-describedby={errors.telefone ? "telefone-error" : undefined} placeholder="(81) 91234-5678" className={inputClass} />
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection icon={Network} title="2. Vínculo organizacional" description="Defina a unidade(s) e o perfil de acesso do usuário.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Unidade vinculada" htmlFor="unidade" required error={erros.unidade}>
                  <div className="relative">
                    <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-foreground-muted" />
                    <select
                      id="unidade"
                      value={unidade}
                      onChange={(e) => setValue("unidade", e.target.value, { shouldDirty: true, shouldValidate: true })}
                      aria-invalid={!!errors.unidade} aria-describedby={errors.unidade ? "unidade-error" : undefined}
                      className={`${inputClass} appearance-none pr-9 ${unidade ? "text-slate-800 dark:text-foreground" : "text-slate-400 dark:text-foreground-muted"}`}
                    >
                      <option value="">Selecione a unidade</option>
                      {id && <option value="Todas as unidades">Todas as unidades</option>}
                      {id && unidade && unidade !== "Todas as unidades" && !UNIDADES.some((item) => item === unidade) && <option value={unidade}>{unidade}</option>}
                      {UNIDADES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-foreground-muted" />
                  </div>
                </Field>

                <Field label="Perfil de acesso" htmlFor="perfil" required>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-foreground-muted" />
                    <select
                      id="perfil"
                      value={perfil}
                      onChange={(e) => trocarPerfil(e.target.value as Perfil)}
                      className={`${inputClass} appearance-none pr-9`}
                    >
                      {PERFIS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-foreground-muted" />
                  </div>
                </Field>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">Resumo do acesso</p>
                    <p className="text-slate-700 dark:text-foreground">Perfil selecionado: <strong>{perfil}</strong></p>
                    <p className="text-slate-700 dark:text-foreground">Escopo de unidade: <strong>{escopo}</strong></p>
                  </div>
                </div>
                <p className="max-w-xs text-xs text-blue-700 dark:text-blue-300 sm:text-right">
                  Configuração local em memória. O controle efetivo de acesso depende de integração com o servidor.
                </p>
              </div>
            </FormSection>

            <FormSection icon={Lock} title="3. Convite e segurança" description="Garanta a segurança do acesso e o controle da conta.">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Switch checked={enviarConvite} onChange={(v) => setValue("enviarConvite", v, { shouldDirty: true })} label="Registrar convite pendente" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Registrar convite pendente</p>
                    <p className="text-xs text-slate-600 dark:text-foreground-muted">Registra apenas a intenção de convite. Nenhum e-mail é enviado. Na edição, o status atual é preservado.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Switch checked={exigirMfa} onChange={(v) => setValue("exigirMfa", v, { shouldDirty: true })} label="Exigir autenticação multifator" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Exigir autenticação multifator (MFA)</p>
                    <p className="text-xs text-slate-600 dark:text-foreground-muted">Preferência local; a autenticação multifator depende de integração.</p>
                  </div>
                </div>
              </div>
            </FormSection>
          </div>

          <aside className="min-w-0 space-y-6">
            <PermissionMatrix perfil={perfil} onPerfilChange={trocarPerfil} permissoes={permissoes} onToggle={alternarPermissao} />
            <UnitsChecklist selecionadas={unidadesAutorizadas} onChange={(v) => setValue("unidadesAutorizadas", v, { shouldDirty: true })} />
          </aside>
        </div>
        </fieldset>
      </form>
    </main>
  );
}
