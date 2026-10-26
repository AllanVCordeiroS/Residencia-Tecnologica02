"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NovoUsuarioPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");

  const [unidade, setUnidade] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("Colaborador");
  const [unidadesAutorizadas, setUnidadesAutorizadas] = useState<string[]>([]);

  const [permissoes, setPermissoes] = useState<Permissoes>(clonar(PERMISSOES_POR_PERFIL["Colaborador"]));

  const [enviarConvite, setEnviarConvite] = useState(true);
  const [exigirMfa, setExigirMfa] = useState(false);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const trocarPerfil = (p: Perfil) => {
    setPerfil(p);
    setPermissoes(clonar(PERMISSOES_POR_PERFIL[p]));
  };

  const alternarPermissao = (modulo: Modulo, acao: Acao, valor: boolean) =>
    setPermissoes((prev) => {
      const next = clonar(prev);
      next[modulo][acao] = valor;
      if (acao === "visualizar" && !valor) {
        next[modulo].criar = next[modulo].editar = next[modulo].excluir = false;
      } else if (acao !== "visualizar" && valor) {
        next[modulo].visualizar = true;
      }
      return next;
    });

  const escopo = useMemo(() => {
    if (unidadesAutorizadas.length === UNIDADES.length) return "Todas as unidades";
    if (unidadesAutorizadas.length === 0) return unidade || "—";
    return `${unidadesAutorizadas.length} unidade(s)`;
  }, [unidadesAutorizadas, unidade]);

  const validar = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Informe o nome completo.";
    if (!EMAIL_RE.test(email)) e.email = "Informe um e-mail corporativo válido.";
    if (!cargo.trim()) e.cargo = "Informe o cargo ou função.";
    if (!unidade) e.unidade = "Selecione a unidade vinculada.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const salvar = async () => {
    if (!validar()) return;
    setSalvando(true);
    const payload = {
      nome,
      email,
      cargo,
      telefone: telefone || null,
      unidadePrincipal: unidade,
      perfil,
      unidadesAutorizadas,
      permissoes,
      enviarConvite,
      exigirMfa,
    };
    console.log("Novo usuário:", payload);
    setSalvando(false);
    router.push("/usuarios");
  };

  return (
    <main className="min-h-screen bg-[#F6F8FE] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0B1B3F]">Novo usuário</h1>
            <p className="mt-1 text-sm text-slate-600">Cadastre o colaborador e configure seu acesso ao BEVOX.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/usuarios"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-[#0B1B3F] hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Link>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" />
              {salvando ? "Salvando..." : "Salvar usuário"}
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <FormSection icon={IdCard} title="1. Dados do usuário" description="Informações pessoais e profissionais do colaborador.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nome completo" htmlFor="nome" required error={erros.nome}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João da Silva Santos" className={inputClass} />
                  </div>
                </Field>

                <Field label="E-mail corporativo" htmlFor="email" required error={erros.email}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@adega.com.br" className={inputClass} />
                  </div>
                </Field>

                <Field label="Cargo ou função" htmlFor="cargo" required error={erros.cargo}>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Vendedor, Analista, etc." className={inputClass} />
                  </div>
                </Field>

                <Field label="Telefone (opcional)" htmlFor="telefone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(81) 91234-5678" className={inputClass} />
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection icon={Network} title="2. Vínculo organizacional" description="Defina a unidade(s) e o perfil de acesso do usuário.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Unidade vinculada" htmlFor="unidade" required error={erros.unidade}>
                  <div className="relative">
                    <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="unidade"
                      value={unidade}
                      onChange={(e) => setUnidade(e.target.value)}
                      className={`${inputClass} appearance-none pr-9 ${unidade ? "text-slate-800" : "text-slate-400"}`}
                    >
                      <option value="">Selecione a unidade</option>
                      {UNIDADES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </Field>

                <Field label="Perfil de acesso" htmlFor="perfil" required>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </Field>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-lg bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-700">Resumo do acesso</p>
                    <p className="text-slate-700">Perfil selecionado: <strong>{perfil}</strong></p>
                    <p className="text-slate-700">Escopo de unidade: <strong>{escopo}</strong></p>
                  </div>
                </div>
                <p className="max-w-xs text-xs text-blue-700 sm:text-right">
                  As permissões efetivas serão validadas no servidor, de acordo com o perfil e as unidades autorizadas.
                </p>
              </div>
            </FormSection>

            <FormSection icon={Lock} title="3. Convite e segurança" description="Garanta a segurança do acesso e o controle da conta.">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Switch checked={enviarConvite} onChange={setEnviarConvite} label="Enviar convite por e-mail" />
                  <div>
                    <p className="text-sm font-semibold text-[#0B1B3F]">Enviar convite por e-mail para ativação da conta</p>
                    <p className="text-xs text-slate-600">O usuário receberá um link temporário para criar sua senha.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Switch checked={exigirMfa} onChange={setExigirMfa} label="Exigir autenticação multifator" />
                  <div>
                    <p className="text-sm font-semibold text-[#0B1B3F]">Exigir autenticação multifator (MFA)</p>
                    <p className="text-xs text-slate-600">Quando disponível, aumenta a segurança da conta.</p>
                  </div>
                </div>
              </div>
            </FormSection>
          </div>

          <aside className="space-y-6">
            <PermissionMatrix perfil={perfil} onPerfilChange={trocarPerfil} permissoes={permissoes} onToggle={alternarPermissao} />
            <UnitsChecklist selecionadas={unidadesAutorizadas} onChange={setUnidadesAutorizadas} />
          </aside>
        </div>
      </div>
    </main>
  );
}
