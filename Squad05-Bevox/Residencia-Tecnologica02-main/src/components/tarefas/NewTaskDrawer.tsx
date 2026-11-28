"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlignLeft, Building2, CalendarCheck, CalendarDays, Check, ChevronsDown, CircleAlert, CirclePlus, CircleUser,
  CloudUpload, FileText, Flag, ListChecks, Network, Paperclip, Plus, Tag, TextCursorInput, Trash2, X,
} from "lucide-react";
import { usuarioDemo } from "@/data/mockData";
import type { CreateTaskInput } from "@/types/task";
import {
  ATTACHMENT_ACCEPT, ATTACHMENT_EXTENSIONS, ATTACHMENT_MAX_BYTES, ATTACHMENT_MAX_FILES,
  TASK_CATEGORIES, TASK_OWNERS, TASK_PRIORITIES, type NewTaskPriority,
} from "./taskOptions";

export type NewTaskData = CreateTaskInput;

/* ---------- Validação ---------- */
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const req = (m: string) => z.string().trim().min(1, m);
const date = (message: string) => req(message).refine((value) => {
  if (!ISO.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Informe uma data válida.");
const text = (m: string, max: number, label: string) =>
  z.string().trim().min(1, m).max(max, `${label} deve ter no máximo ${max} caracteres.`);

const schema = z
  .object({
    titulo: text("Informe o título da tarefa.", 100, "O título"),
    descricao: text("Informe a descrição da tarefa.", 500, "A descrição"),
    unidade: req("Selecione a unidade."),
    responsavel: req("Selecione o responsável."),
    categoria: req("Selecione a categoria."),
    prioridade: req("Selecione a prioridade."),
    dataInicio: date("Informe a data de início."),
    prazo: date("Informe o prazo."),
    subtarefas: z.array(z.object({ titulo: text("Informe o título da subtarefa ou remova-a.", 100, "A subtarefa") })),
    checklist: z.array(z.object({ texto: text("Preencha o item do checklist ou remova-o.", 150, "O item"), feito: z.boolean() })),
  })
  .refine((v) => !ISO.test(v.dataInicio) || !ISO.test(v.prazo) || v.prazo >= v.dataInicio, {
    path: ["prazo"],
    message: "O prazo não pode ser anterior à data de início.",
  });
type FormValues = z.infer<typeof schema>;

/* ---------- Configuração dos campos ---------- */
const SELECTS = [
  { name: "unidade", label: "Unidade", icon: Building2, ph: "Selecione a unidade", opts: [] as readonly string[] },
  { name: "responsavel", label: "Responsável", icon: CircleUser, ph: "Selecione o responsável", opts: TASK_OWNERS.map((o) => o.name), lead: CircleUser },
  { name: "categoria", label: "Categoria", icon: Tag, ph: "Selecione a categoria", opts: TASK_CATEGORIES },
  { name: "prioridade", label: "Prioridade", icon: Flag, ph: "Selecione a prioridade", opts: TASK_PRIORITIES, lead: CircleAlert },
] as const;
const DATES = [
  { name: "dataInicio", label: "Data de início", icon: CalendarDays },
  { name: "prazo", label: "Prazo", icon: CalendarCheck },
] as const;
const STEPS = [
  { id: "dados", label: "Dados da tarefa" },
  { id: "checklist", label: "Checklist" },
  { id: "anexos", label: "Anexos" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

const PRIORITY_COLOR: Record<string, string> = {
  Urgente: "text-red-600 dark:text-red-300", Alta: "text-red-500 dark:text-red-300", Média: "text-amber-500 dark:text-amber-300", Normal: "text-blue-500 dark:text-blue-300", Baixa: "text-emerald-500 dark:text-emerald-300",
};
const PICKER =
  "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

/* ---------- Utilitários ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fileKey = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
const size = (b: number) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

function fileError(f: File, files: File[]) {
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(ATTACHMENT_EXTENSIONS as readonly string[]).includes(ext)) return "formato não permitido. Use PDF, DOC, XLSX, PNG ou JPG.";
  if (f.size === 0) return "o arquivo está vazio.";
  if (f.size > ATTACHMENT_MAX_BYTES) return `o arquivo excede 10 MB (${size(f.size)}).`;
  if (files.some((x) => fileKey(x) === fileKey(f))) return "arquivo já adicionado.";
  if (files.length >= ATTACHMENT_MAX_FILES) return `limite de ${ATTACHMENT_MAX_FILES} anexos atingido.`;
  return null;
}

/* ---------- Peças de UI ---------- */
const field = (err?: boolean) =>
  `w-full rounded-md border bg-white dark:bg-surface-raised text-[13px] text-slate-800 dark:text-foreground outline-none transition placeholder:text-slate-400 dark:placeholder:text-foreground-muted focus:ring-2 ${
    err ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 dark:border-line focus:border-blue-500 focus:ring-blue-100"
  }`;
const iconBtn = "flex shrink-0 items-center justify-center rounded-md text-slate-400 dark:text-foreground-muted transition hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300";

function Err({ children, className = "" }: { children?: string; className?: string }) {
  return children ? (
    <p role="alert" className={`mt-1 flex items-start gap-1 text-[11px] leading-snug text-red-600 dark:text-red-300 ${className}`}>
      <CircleAlert size={12} className="mt-px shrink-0" />
      {children}
    </p>
  ) : null;
}

function Label({ icon: Icon, children, required, optional, htmlFor }: { icon: typeof Tag; children: ReactNode; required?: boolean; optional?: boolean; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800 dark:text-foreground">
      <Icon size={14} className="text-slate-500 dark:text-foreground-muted" />
      {children}
      {required && <span className="text-red-500 dark:text-red-300" aria-hidden="true">*</span>}
      {optional && <span className="font-normal text-slate-500 dark:text-foreground-muted">(opcional)</span>}
    </label>
  );
}

function Field({ label, icon, htmlFor, error, counter, children }: { label: string; icon: typeof Tag; htmlFor: string; error?: string; counter?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label icon={icon} htmlFor={htmlFor} required>{label}</Label>
        {counter}
      </div>
      {children}
      <Err>{error}</Err>
    </div>
  );
}

const Counter = ({ n, max }: { n: number; max: number }) => (
  <span className={`text-[11px] tabular-nums ${n > max ? "font-semibold text-red-600 dark:text-red-300" : "text-slate-400 dark:text-foreground-muted"}`}>{n}/{max}</span>
);

/* ---------- Drawer ---------- */
export default function NewTaskDrawer({ onClose, onCreate }: { onClose: () => void; onCreate: (t: NewTaskData) => Promise<unknown> }) {
  const units = useUnitsQuery();
  const [now] = useState(() => new Date());
  const [defaults] = useState<FormValues>(() => {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    return {
      titulo: "", descricao: "", unidade: "", responsavel: "", categoria: "", prioridade: "Alta",
      dataInicio: iso(new Date()), prazo: iso(due), subtarefas: [],
      checklist: ["Criar/atualizar documentação necessária", "Revisar informações com o responsável", "Enviar para aprovação"].map((texto) => ({ texto, feito: false })),
    };
  });
  const { register, control, handleSubmit, setFocus, trigger, formState: { errors, isDirty, isSubmitting, submitCount } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: defaults, mode: "onTouched", reValidateMode: "onChange",
  });
  const subs = useFieldArray({ control, name: "subtarefas" });
  const checks = useFieldArray({ control, name: "checklist" });
  const v = useWatch({ control });

  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState<StepId>("dados");
  const panel = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const guard = useUnsavedChanges({
    dirty: isDirty || files.length > 0,
    description: "Existem informações da tarefa que ainda não foram salvas. Ao sair, os dados preenchidos serão descartados.",
  });
  const { requestDiscard, allowNavigation } = guard;
  const close = useCallback(() => {
    if (!submitting.current) requestDiscard(() => onClose());
  }, [requestDiscard, onClose]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setFocus("titulo");
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.closest("dialog[open]")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>('button, input:not([tabindex="-1"]), select, textarea, [tabindex="0"]')].filter((el) => el.offsetParent);
      const [first, last] = [items[0], items[items.length - 1]];
      const edge = e.shiftKey ? first : last;
      if (document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [close, setFocus]);

  // Revalida o prazo sempre que as datas mudam
  useEffect(() => {
    if (v.prazo) void trigger("prazo");
  }, [v.dataInicio, v.prazo, trigger]);

  function goTo(id: StepId) {
    setStep(id);
    document.getElementById(`nt-sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addFiles(list: FileList | null) {
    const next = [...files];
    const errs: string[] = [];
    for (const f of Array.from(list ?? [])) {
      const e = fileError(f, next);
      if (e) errs.push(`“${f.name}”: ${e}`);
      else next.push(f);
    }
    setFileErrors(errs);
    setFiles(next);
  }

  async function submit(d: FormValues) {
    if (submitting.current) return;
    submitting.current = true;
    setSubmitError(null);
    const created = new Date();
    const stamp = created.getTime();
    try {
      await onCreate({
        title: d.titulo.trim(), description: d.descricao.trim(), unit: d.unidade, owner: d.responsavel,
        initials: TASK_OWNERS.find((o) => o.name === d.responsavel)?.initials ?? d.responsavel.slice(0, 2).toUpperCase(),
        category: d.categoria, priority: d.prioridade as NewTaskPriority, startDate: d.dataInicio, dueDate: d.prazo,
        subtasks: d.subtarefas.map((s, i) => ({ id: `sub-${stamp}-${i}`, title: s.titulo.trim(), done: false })),
        checklist: d.checklist.map((c, i) => ({ id: `chk-${stamp}-${i}`, text: c.texto.trim(), done: c.feito })),
        attachments: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        createdBy: usuarioDemo.nome, createdAt: created.toISOString(),
      });
      allowNavigation();
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível criar a tarefa. Tente novamente.");
    } finally {
      submitting.current = false;
    }
  }

  const priority = v.prioridade ?? "";

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {guard.dialog}
      <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" />
      <div
        ref={panel} role="dialog" aria-modal="true" aria-labelledby="new-task-title"
        className="relative flex h-full w-full max-w-[564px] flex-col bg-white dark:bg-surface-raised shadow-2xl transition-transform duration-300 ease-out starting:translate-x-full"
      >
        <form noValidate onSubmit={(event) => { void handleSubmit(submit)(event); }} className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between px-6 pb-4 pt-5">
            <h2 id="new-task-title" className="text-[20px] font-semibold tracking-tight text-slate-900 dark:text-foreground">Nova Tarefa</h2>
            <button type="button" onClick={close} disabled={isSubmitting} aria-label="Fechar" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-foreground-muted hover:bg-slate-100 dark:hover:bg-surface-muted disabled:opacity-50">
              <X size={20} />
            </button>
          </header>

          <nav aria-label="Etapas" className="border-y border-slate-200 dark:border-line px-4 py-3 sm:px-6">
            <ol className="flex items-center justify-center gap-2 sm:gap-3">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2 sm:gap-3">
                  {i > 0 && <span aria-hidden="true" className="hidden h-px w-8 bg-slate-200 dark:bg-surface-muted sm:block" />}
                  <button type="button" onClick={() => goTo(s.id)} aria-current={step === s.id ? "step" : undefined} className="flex items-center gap-2 px-1 py-0.5">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${step === s.id ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-surface-muted text-slate-500 dark:text-foreground-muted"}`}>{i + 1}</span>
                    <span className={`text-[13px] ${step === s.id ? "font-semibold text-slate-900 dark:text-foreground" : "hidden text-slate-500 dark:text-foreground-muted sm:inline"}`}>{s.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <fieldset disabled={isSubmitting} className="relative min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            <div id="nt-sec-dados" onFocusCapture={() => setStep("dados")} className="space-y-4">
              <Field label="Título" icon={TextCursorInput} htmlFor="nt-titulo" error={errors.titulo?.message} counter={<Counter n={v.titulo?.length ?? 0} max={100} />}>
                <input id="nt-titulo" autoComplete="off" placeholder="Ex.: Renovar licença ambiental" aria-invalid={!!errors.titulo} {...register("titulo")} className={`${field(!!errors.titulo)} h-10 px-3`} />
              </Field>
              <Field label="Descrição" icon={AlignLeft} htmlFor="nt-descricao" error={errors.descricao?.message} counter={<Counter n={v.descricao?.length ?? 0} max={500} />}>
                <textarea id="nt-descricao" rows={4} placeholder="Descreva o que precisa ser feito, objetivos e observações..." aria-invalid={!!errors.descricao} {...register("descricao")} className={`${field(!!errors.descricao)} min-h-[90px] resize-none px-3 py-2.5`} />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SELECTS.map(({ name, label, icon, ph, opts, ...rest }) => {
                  const Lead = "lead" in rest ? rest.lead : null;
                  return (
                    <Field key={name} label={label} icon={icon} htmlFor={`nt-${name}`} error={errors[name]?.message}>
                      <div className="relative">
                        {Lead && <Lead size={16} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${name === "prioridade" ? PRIORITY_COLOR[priority] ?? "text-slate-400 dark:text-foreground-muted" : "text-slate-500 dark:text-foreground-muted"}`} />}
                        <select id={`nt-${name}`} disabled={name === "unidade" && units.isPending} aria-invalid={!!errors[name]} {...register(name)} className={`${field(!!errors[name])} h-10 cursor-pointer appearance-none truncate pr-9 ${Lead ? "pl-9" : "pl-3"} ${v[name] ? "" : "text-slate-400 dark:text-foreground-muted"}`}>
                          <option value="">{ph}</option>
                          {(name === "unidade" ? (units.data ?? []).map((unit) => unit.nome) : opts).map((o) => <option key={o} className="text-slate-800 dark:text-foreground">{o}</option>)}
                        </select>
                        <ChevronsDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-foreground-muted" />
                      </div>
                      {name === "unidade" && units.isError && <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-300">Não foi possível carregar as unidades. <button type="button" onClick={() => void units.refetch()} className="underline">Tentar novamente</button></p>}
                    </Field>
                  );
                })}
                {DATES.map(({ name, label, icon }) => (
                  <Field key={name} label={label} icon={icon} htmlFor={`nt-${name}`} error={errors[name]?.message}>
                    <div className="relative">
                      <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-foreground-muted" />
                      <input id={`nt-${name}`} type="date" min={name === "prazo" ? v.dataInicio || undefined : undefined} aria-invalid={!!errors[name]} {...register(name)} className={`${field(!!errors[name])} h-10 cursor-pointer pl-9 pr-3 ${PICKER}`} />
                    </div>
                  </Field>
                ))}
              </div>

              <div>
                <div className="mb-1.5"><Label icon={Network} optional>Subtarefas</Label></div>
                <ul className="space-y-2">
                  {subs.fields.map((f, i) => (
                    <li key={f.id} className="mb-0">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center text-[11px] text-slate-400 dark:text-foreground-muted">{i + 1}.</span>
                        <input
                          autoComplete="off" placeholder="Título da subtarefa" aria-label={`Subtarefa ${i + 1}`} aria-invalid={!!errors.subtarefas?.[i]}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), subs.append({ titulo: "" }))}
                          {...register(`subtarefas.${i}.titulo`)} className={`${field(!!errors.subtarefas?.[i])} h-9 px-3`}
                        />
                        <button type="button" onClick={() => subs.remove(i)} aria-label={`Remover subtarefa ${i + 1}`} className={`${iconBtn} h-9 w-9`}><Trash2 size={15} /></button>
                      </div>
                      <Err className="ml-6">{errors.subtarefas?.[i]?.titulo?.message}</Err>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => subs.append({ titulo: "" })} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 dark:border-line bg-slate-50/40 dark:bg-surface-muted/40 text-[12px] font-medium text-slate-700 dark:text-foreground hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  <CirclePlus size={15} /> Adicionar subtarefa
                </button>
              </div>
            </div>

            <section id="nt-sec-checklist" onFocusCapture={() => setStep("checklist")} aria-label="Checklist">
              <div className="mb-2"><Label icon={ListChecks} optional>Checklist</Label></div>
              <ul className="space-y-1.5">
                {checks.fields.map((f, i) => (
                  <li key={f.id}>
                    <div className="group flex items-center gap-3">
                      <input type="checkbox" aria-label={`Marcar item ${i + 1} como concluído`} {...register(`checklist.${i}.feito`)} className="h-4 w-4 cursor-pointer rounded border-slate-300 dark:border-line accent-blue-600" />
                      <input
                        autoComplete="off" placeholder="Descreva o item" aria-label={`Item ${i + 1} do checklist`}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), checks.append({ texto: "", feito: false }))}
                        {...register(`checklist.${i}.texto`)}
                        className={`min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1 text-[13px] outline-none placeholder:text-slate-400 dark:placeholder:text-foreground-muted hover:border-slate-200 dark:hover:border-line focus:border-blue-500 ${v.checklist?.[i]?.feito ? "text-slate-400 dark:text-foreground-muted line-through" : "text-slate-800 dark:text-foreground"}`}
                      />
                      <button type="button" onClick={() => checks.remove(i)} aria-label={`Remover item ${i + 1} do checklist`} className={`${iconBtn} h-7 w-7 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100`}><Trash2 size={14} /></button>
                    </div>
                    <Err className="ml-7">{errors.checklist?.[i]?.texto?.message}</Err>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => checks.append({ texto: "", feito: false })} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-300">
                <Plus size={14} /> Adicionar item
              </button>
            </section>

            <section id="nt-sec-anexos" onFocusCapture={() => setStep("anexos")} aria-label="Anexos">
              <div className="mb-2"><Label icon={Paperclip} optional>Anexos</Label></div>
              <div
                role="button" tabIndex={0} aria-label="Selecionar arquivos para anexar"
                onClick={() => picker.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), picker.current?.click())}
                onDragOver={(e) => (e.preventDefault(), setDragging(true))}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => (e.preventDefault(), setDragging(false), addFiles(e.dataTransfer.files))}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed px-4 py-7 text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-200 [&>*]:pointer-events-none ${dragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40" : "border-slate-300 dark:border-line bg-slate-50/40 dark:bg-surface-muted/40 hover:border-blue-400"}`}
              >
                <CloudUpload size={26} className="text-blue-600 dark:text-blue-300" />
                <p className="text-[13px] text-slate-800 dark:text-foreground">Arraste arquivos aqui ou <span className="font-medium text-blue-600 dark:text-blue-300">clique para selecionar</span></p>
                <p className="text-[11px] text-slate-500 dark:text-foreground-muted">PDF, DOC, XLSX, PNG, JPG até 10MB</p>
                <input ref={picker} type="file" multiple accept={ATTACHMENT_ACCEPT} tabIndex={-1} className="sr-only" onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
              </div>
              {fileErrors.length > 0 && (
                <ul role="alert" className="mt-2 space-y-1 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-3 py-2">
                  {fileErrors.map((m) => <li key={m} className="text-[11px] text-red-700 dark:text-red-300">{m}</li>)}
                </ul>
              )}
              <ul className="mt-3 space-y-2">
                {files.map((f) => (
                  <li key={fileKey(f)} className="flex items-center gap-3 rounded-md border border-slate-200 dark:border-line px-3 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300"><FileText size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-slate-800 dark:text-foreground">{f.name}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-foreground-muted">{size(f.size)}</span>
                    </span>
                    <button type="button" onClick={() => (setFiles(files.filter((x) => x !== f)), setFileErrors([]))} aria-label={`Remover anexo ${f.name}`} className={`${iconBtn} h-7 w-7`}><X size={15} /></button>
                  </li>
                ))}
              </ul>
            </section>
          </fieldset>

          <footer className="border-t border-slate-200 dark:border-line px-6 pb-4 pt-3">
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{usuarioDemo.iniciais}</span>
                <div className="leading-tight">
                  <p className="text-[10px] text-slate-500 dark:text-foreground-muted">Criado por</p>
                  <p className="text-[12px] font-semibold text-slate-900 dark:text-foreground">{usuarioDemo.nome}</p>
                  <p className="text-[10px] text-slate-500 dark:text-foreground-muted">{iso(now).split("-").reverse().join("/")} às {pad(now.getHours())}:{pad(now.getMinutes())}</p>
                </div>
              </div>
            </div>
            {submitCount > 0 && Object.keys(errors).length > 0 && <Err className="mt-3 font-medium">Corrija os campos destacados para criar a tarefa.</Err>}
            <Err className="mt-3 font-medium">{submitError ?? undefined}</Err>
            <div className="mt-3 flex justify-end gap-3">
              <button type="button" onClick={close} disabled={isSubmitting} className="h-9 rounded-md border border-slate-200 dark:border-line px-5 text-[12px] font-medium text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-surface-muted disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-5 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                <Check size={15} /> {isSubmitting ? "Salvando..." : "Criar Tarefa"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
