"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2, Check, ChevronRight, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useUsersQuery } from "@/hooks/queries/useUsersQuery";
import { useUnitMutation, useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { brazilStates, operationalFormats, taxRegimes, trafficRestrictions, unitDefaults, unitSchema, unitStepFields } from "@/schemas/unit";
import type { OperationalUnit, UnitFormValues } from "@/types/unit";

const steps = ["Dados Cadastrais e Fiscais", "Endereço e Localização", "Operação e Infraestrutura", "Gestão e Responsáveis"];
const titles = ["Identificação da Unidade", "Endereço e Logística de Acesso", "Operação e Infraestrutura de Bebidas", "Gestão e Responsáveis Locais"];
type Field = { name: keyof UnitFormValues; label: string; type?: "number" | "email" | "tel" | "checkbox"; options?: readonly string[]; optional?: boolean; hint?: string };
const fields: Field[][] = [
  [
    { name: "formatoOperacional", label: "Tipo de estabelecimento / formato operacional", options: operationalFormats },
    { name: "cnpj", label: "CNPJ da nova unidade", hint: "Informe um CNPJ válido, com ou sem pontuação." },
    { name: "identificadorOperacional", label: "Identificador operacional da unidade" },
    { name: "nome", label: "Nome fantasia comercial" },
    { name: "razaoSocial", label: "Razão social completa" },
    { name: "inscricaoEstadual", label: "Inscrição Estadual (IE)", hint: "Pernambuco: 9 ou 14 dígitos; informe ISENTO quando aplicável." },
    { name: "inscricaoMunicipal", label: "Inscrição Municipal (IM)", optional: true },
    { name: "regimeTributario", label: "Regime Tributário de Pernambuco", options: taxRegimes },
  ],
  [
    { name: "cep", label: "CEP" }, { name: "logradouro", label: "Logradouro / Avenida / Rodovia" },
    { name: "numero", label: "Número", hint: "Use S/N quando não houver número." }, { name: "complemento", label: "Complemento", optional: true },
    { name: "bairro", label: "Bairro" }, { name: "municipio", label: "Município" },
    { name: "uf", label: "UF", options: brazilStates }, { name: "poloLogistico", label: "Polo Logístico Regional" },
    { name: "restricaoTrafego", label: "Restrição de tráfego / janela viária", options: trafficRestrictions },
  ],
  [
    { name: "areaArmazenagem", label: "Área total de armazenagem (m²)", type: "number" },
    { name: "peDireito", label: "Pé-direito útil (metros)", type: "number" },
    { name: "capacidadePaletes", label: "Capacidade de paletes", type: "number" },
    { name: "camaraFria", label: "Câmara fria (Chopp e Especiais)", type: "checkbox" },
    { name: "metragemRefrigerada", label: "Metragem refrigerada (m²)", type: "number" },
    { name: "docas", label: "Docas de carga e descarga", type: "number" },
    { name: "niveladorasHidraulicas", label: "Niveladoras hidráulicas", type: "checkbox" },
    { name: "frotaToco", label: "Frota inicial — Caminhões Toco", type: "number" },
    { name: "frotaCarretas", label: "Frota inicial — Carretas / Sider", type: "number" },
    { name: "frotaVuc", label: "Frota inicial — VUCs Urbanos", type: "number" },
  ],
  [
    { name: "responsavelId", label: "Gestor operacional responsável" },
    { name: "emailOperacional", label: "E-mail operacional", type: "email" },
    { name: "telefoneFixo", label: "Telefone fixo com DDD", type: "tel" },
    { name: "celularPlantao", label: "Celular de plantão com DDD", type: "tel" },
  ],
];

function initialValues(unit?: OperationalUnit): UnitFormValues {
  if (!unit) return { ...unitDefaults };
  // Não presume dados fiscais ou infraestrutura nos registros antigos.
  const values = { ...unitDefaults };
  for (const key of Object.keys(values) as (keyof UnitFormValues)[]) {
    if (unit[key] !== undefined) Object.assign(values, { [key]: unit[key] });
  }
  values.municipio = unit.municipio ?? unit.cidade.split("/")[0];
  return values;
}

export default function UnitForm({ unit }: { unit?: OperationalUnit }) {
  const router = useRouter();
  const users = useUsersQuery();
  const mutation = useUnitMutation();
  const [step, setStep] = useState(0);
  const { register, control, handleSubmit, trigger, getFieldState, setValue, setFocus, formState: { errors, isDirty } } = useForm<UnitFormValues>({ resolver: zodResolver(unitSchema), defaultValues: initialValues(unit), shouldUnregister: false });
  const guard = useUnsavedChanges({ dirty: isDirty });
  const cold = useWatch({ control, name: "camaraFria" });
  const inputClass = "mt-2 w-full rounded-lg border border-line bg-surface-muted px-3 py-3 text-sm text-foreground outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 aria-invalid:border-red-500";

  async function advance(target = step + 1) {
    const valid = await trigger(unitStepFields[step], { shouldFocus: true });
    if (valid) setStep(Math.min(target, 3));
  }

  const save = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({ type: "save", values, id: unit?.id });
      guard.allowNavigation();
      router.push("/unidades");
    } catch { /* O serviço retorna a mensagem exibida abaixo. */ }
  }, (invalid) => {
    const index = unitStepFields.findIndex((group) => group.some((key) => invalid[key]));
    if (index >= 0) {
      setStep(index);
      const key = unitStepFields[index].find((field) => invalid[field]);
      if (key) requestAnimationFrame(() => setFocus(key));
    }
  });

  return <div className="mx-auto w-full max-w-5xl space-y-5">
    <button type="button" onClick={() => guard.requestNavigation("/unidades")} className="inline-flex items-center gap-2 rounded text-sm text-foreground-muted hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"><ArrowLeft size={16} />Voltar para Listagem</button>
    <header><h1 className="text-2xl font-bold">{unit ? "Editar Unidade" : "Cadastrar Nova Unidade"}</h1><p className="mt-2 text-sm text-foreground-muted">{unit ? "Atualize os dados cadastrais, a infraestrutura e os responsáveis da unidade." : "Adicione uma nova filial, centro de distribuição ou entreposto logístico à rede da Adega Distribution."}</p></header>
    <nav aria-label="Etapas do cadastro" className="grid gap-2 rounded-2xl bg-blue-900 p-4 text-white sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((label, index) => <button key={label} type="button" aria-current={step === index ? "step" : undefined} disabled={mutation.isPending || index > step + 1} onClick={() => { if (index < step) setStep(index); else if (index > step) void advance(index); }} className={`flex items-center gap-3 rounded-xl p-3 text-left text-xs focus-visible:outline-2 focus-visible:outline-white ${step === index ? "bg-blue-700 font-bold" : "text-blue-100 disabled:opacity-50"}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-300">{index < step ? <Check size={16} /> : index + 1}</span>{label}</button>)}
    </nav>
    <form noValidate onSubmit={(event) => { if (step < 3) { event.preventDefault(); void advance(); } else void save(event); }}>
      <fieldset disabled={mutation.isPending}>
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line bg-surface-muted p-5"><span className="rounded-lg bg-blue-100 p-2 text-blue-800 dark:bg-blue-950 dark:text-blue-200"><Building2 size={22} /></span><div><p className="text-xs text-foreground-muted">Etapa {step + 1} de 4</p><h2 className="mt-1 font-bold">{titles[step]}</h2></div></div>
          <div className="p-5 sm:p-7">
            <p className="mb-5 text-xs text-foreground-muted">Campos com * são obrigatórios. Dados mantidos na memória desta sessão; recarregar a página encerra esse armazenamento.</p>
            {unit && step === 0 && <p className="mb-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">Unidades com vínculos devem manter o nome para preservar as associações existentes. Complete os dados ausentes dos registros antigos antes de salvar.</p>}
            {step === 1 && <p className="mb-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">Preencha o endereço manualmente. Consulta de CEP e visualização geográfica não estão disponíveis neste ambiente.</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              {fields[step].map((field) => {
                const error = errors[field.name];
                const isOwner = field.name === "responsavelId";
                const decimal = ["areaArmazenagem", "peDireito", "metragemRefrigerada"].includes(field.name);
                return <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium">{field.label}{!field.optional && field.type !== "checkbox" ? " *" : ""}</label>
                  {field.type === "checkbox" ? <label className="mt-2 flex items-center gap-3 rounded-lg border border-line bg-surface-muted p-3 text-sm"><input id={field.name} type="checkbox" {...register(field.name, { onChange: (event) => { if (field.name === "camaraFria" && !event.target.checked) setValue("metragemRefrigerada", 0, { shouldDirty: true, shouldValidate: getFieldState("metragemRefrigerada").isTouched }); } })} className="h-4 w-4 accent-blue-700" />Disponível nesta unidade</label>
                    : field.options || isOwner ? <select id={field.name} {...register(field.name)} aria-invalid={Boolean(error)} aria-describedby={error ? `${field.name}-error` : undefined} className={inputClass}>
                      {isOwner ? <><option value="">{users.isPending ? "Carregando responsáveis…" : "Selecione um usuário"}</option>{users.data?.map((user) => <option key={user.id} value={user.id}>{user.nome} — {user.email}</option>)}</> : field.options?.map((option) => <option key={option}>{option}</option>)}
                    </select>
                      : <input id={field.name} type={field.type ?? "text"} {...register(field.name, { valueAsNumber: field.type === "number" })} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? decimal ? "0.01" : "1" : undefined} readOnly={field.name === "metragemRefrigerada" && !cold} aria-invalid={Boolean(error)} aria-describedby={error ? `${field.name}-error` : field.hint ? `${field.name}-hint` : undefined} className={inputClass} />}
                  {field.hint && <p id={`${field.name}-hint`} className="mt-1 text-xs text-foreground-muted">{field.hint}</p>}
                  {error && <p id={`${field.name}-error`} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-300">{error.message}</p>}
                  {isOwner && users.isError && <p role="alert" className="mt-2 text-sm text-red-600">Não foi possível carregar os responsáveis. <button type="button" onClick={() => void users.refetch()} className="underline">Tentar novamente</button></p>}
                  {isOwner && users.data?.length === 0 && <p className="mt-2 text-xs text-foreground-muted">Nenhum usuário disponível. Cadastre um responsável no módulo de usuários.</p>}
                </div>;
              })}
            </div>
            {step === 2 && <p className="mt-5 text-xs text-foreground-muted">A frota inicial é a soma das quantidades de Caminhões Toco, Carretas / Sider e VUCs Urbanos.</p>}
            {mutation.isError && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{mutation.error.message}</p>}
          </div>
          <footer className="flex flex-wrap justify-between gap-3 border-t border-line bg-surface-muted p-5">
            <button type="button" onClick={() => guard.requestNavigation("/unidades")} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold">Cancelar</button>
            <div className="flex flex-wrap gap-3">{step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold">Voltar etapa</button>}
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50">{step === 3 ? <Save size={16} /> : <ChevronRight size={16} />}{mutation.isPending ? "Salvando…" : step === 3 ? unit ? "Salvar alterações" : "Salvar e Ativar Unidade" : "Avançar"}</button>
            </div>
          </footer>
        </Card>
      </fieldset>
    </form>
    {guard.dialog}
  </div>;
}

export function EditUnit({ id }: { id: string }) {
  const query = useUnitsQuery();
  if (query.isPending) return <p role="status">Carregando unidade…</p>;
  if (query.isError) return <div role="alert">Não foi possível carregar a unidade. <button type="button" onClick={() => void query.refetch()} className="underline">Tentar novamente</button></div>;
  const unit = query.data.find((item) => item.id === id);
  if (!unit) return <p>Unidade não encontrada nesta sessão.</p>;
  return <UnitForm key={unit.id} unit={unit} />;
}
