"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlignLeft, Building2, CalendarCheck, CalendarDays, Check, ChevronsDown, CircleAlert, CirclePlus, CircleUser,
  CloudUpload, FileText, Flag, ListChecks, Network, Paperclip, Plus, Tag, TextCursorInput, Trash2, X,
} from "lucide-react";
import { usuarioDemo } from "@/data/mockData";
import {
  ATTACHMENT_ACCEPT, ATTACHMENT_EXTENSIONS, ATTACHMENT_MAX_BYTES, ATTACHMENT_MAX_FILES,
  TASK_CATEGORIES, TASK_OWNERS, TASK_PRIORITIES, TASK_UNITS, type NewTaskPriority,
} from "./taskOptions";

export type NewTaskData = {
  title: string; description: string; unit: string; owner: string; initials: string; category: string;
  priority: NewTaskPriority; startDate: string; dueDate: string; // datas em ISO (yyyy-mm-dd)
  subtasks: { id: string; title: string; done: boolean }[];
  checklist: { id: string; text: string; done: boolean }[];
  attachments: { name: string; size: number; type: string }[];
  createdBy: string; createdAt: string;
};

/* ---------- Validação ---------- */
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const req = (m: string) => z.string().min(1, m);
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
    dataInicio: req("Informe a data de início.").regex(ISO, "Data de início inválida."),
    prazo: req("Informe o prazo.").regex(ISO, "Prazo inválido."),
    subtarefas: z.array(z.object({ titulo: text("Informe o título da subtarefa ou remova-a.", 100, "A subtarefa") })),
    checklist: z.array(z.object({ texto: z.string().max(150, "O item deve ter no máximo 150 caracteres."), feito: z.boolean() })),
  })
  .refine((v) => !ISO.test(v.dataInicio) || !ISO.test(v.prazo) || v.prazo >= v.dataInicio, {
    path: ["prazo"],
    message: "O prazo não pode ser anterior à data de início.",
  });
type FormValues = z.infer<typeof schema>;

/* ---------- Configuração dos campos ---------- */
const SELECTS = [
  { name: "unidade", label: "Unidade", icon: Building2, ph: "Selecione a unidade", opts: TASK_UNITS },
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
  Urgente: "text-red-600", Alta: "text-red-500", Média: "text-amber-500", Normal: "text-blue-500", Baixa: "text-emerald-500",
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
  `w-full rounded-md border bg-white text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    err ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
  }`;
const iconBtn = "flex shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600";

function Err({ children, className = "" }: { children?: string; className?: string }) {
  return children ? (
    <p role="alert" className={`mt-1 flex items-start gap-1 text-[11px] leading-snug text-red-600 ${className}`}>
      <CircleAlert size={12} className="mt-px shrink-0" />
      {children}
    </p>
  ) : null;
}

function Label({ icon: Icon, children, required, optional, htmlFor }: { icon: typeof Tag; children: ReactNode; required?: boolean; optional?: boolean; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
      <Icon size={14} className="text-slate-500" />
      {children}
      {required && <span className="text-red-500" aria-hidden="true">*</span>}
      {optional && <span className="font-normal text-slate-500">(opcional)</span>}
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
  <span className={`text-[11px] tabular-nums ${n > max ? "font-semibold text-red-600" : "text-slate-400"}`}>{n}/{max}</span>
);

/* ---------- Drawer ---------- */
export default function NewTaskDrawer({ onClose, onCreate }: { onClose: () => void; onCreate: (t: NewTaskData) => void }) {
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
  const { register, control, handleSubmit, setFocus, trigger, formState: { errors, isDirty, submitCount } } = useForm<FormValues>({
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

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setFocus("titulo");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
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
  }, [onClose, setFocus]);

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

  function submit(d: FormValues) {
    const stamp = now.getTime();
    onCreate({
      title: d.titulo.trim(), description: d.descricao.trim(), unit: d.unidade, owner: d.responsavel,
      initials: TASK_OWNERS.find((o) => o.name === d.responsavel)?.initials ?? d.responsavel.slice(0, 2).toUpperCase(),
      category: d.categoria, priority: d.prioridade as NewTaskPriority, startDate: d.dataInicio, dueDate: d.prazo,
      subtasks: d.subtarefas.map((s, i) => ({ id: `sub-${stamp}-${i}`, title: s.titulo.trim(), done: false })),
      checklist: d.checklist.filter((c) => c.texto.trim()).map((c, i) => ({ id: `chk-${stamp}-${i}`, text: c.texto.trim(), done: c.feito })),
      attachments: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      createdBy: usuarioDemo.nome, createdAt: now.toISOString(),
    });
    onClose();
  }

  const dirty = isDirty || files.length > 0;
  const priority = v.prioridade ?? "";

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div aria-hidden="true" onClick={() => !dirty && onClose()} className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" />
      <div
        ref={panel} role="dialog" aria-modal="true" aria-labelledby="new-task-title"
        className="relative flex h-full w-full max-w-[564px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out starting:translate-x-full"
      >
        <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between px-6 pb-4 pt-5">
            <h2 id="new-task-title" className="text-[20px] font-semibold tracking-tight text-slate-900">Nova Tarefa</h2>
            <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100">
              <X size={20} />
            </button>
          </header>

          <nav aria-label="Etapas" className="border-y border-slate-200 px-4 py-3 sm:px-6">
            <ol className="flex items-center justify-center gap-2 sm:gap-3">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2 sm:gap-3">
                  {i > 0 && <span aria-hidden="true" className="hidden h-px w-8 bg-slate-200 sm:block" />}
                  <button type="button" onClick={() => goTo(s.id)} aria-current={step === s.id ? "step" : undefined} className="flex items-center gap-2 px-1 py-0.5">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${step === s.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                    <span className={`text-[13px] ${step === s.id ? "font-semibold text-slate-900" : "hidden text-slate-500 sm:inline"}`}>{s.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="relative min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5">
            <div id="nt-sec-dados" className="space-y-4">
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
                        {Lead && <Lead size={16} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${name === "prioridade" ? PRIORITY_COLOR[priority] ?? "text-slate-400" : "text-slate-500"}`} />}
                        <select id={`nt-${name}`} aria-invalid={!!errors[name]} {...register(name)} className={`${field(!!errors[name])} h-10 cursor-pointer appearance-none truncate pr-9 ${Lead ? "pl-9" : "pl-3"} ${v[name] ? "" : "text-slate-400"}`}>
                          <option value="">{ph}</option>
                          {opts.map((o) => <option key={o} className="text-slate-800">{o}</option>)}
                        </select>
                        <ChevronsDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      </div>
                    </Field>
                  );
                })}
                {DATES.map(({ name, label, icon }) => (
                  <Field key={name} label={label} icon={icon} htmlFor={`nt-${name}`} error={errors[name]?.message}>
                    <div className="relative">
                      <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
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
                        <span className="w-4 text-center text-[11px] text-slate-400">{i + 1}.</span>
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
                <button type="button" onClick={() => subs.append({ titulo: "" })} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50/40 text-[12px] font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700">
                  <CirclePlus size={15} /> Adicionar subtarefa
                </button>
              </div>
            </div>

            <section id="nt-sec-checklist" aria-label="Checklist">
              <div className="mb-2"><Label icon={ListChecks} optional>Checklist</Label></div>
              <ul className="space-y-1.5">
                {checks.fields.map((f, i) => (
                  <li key={f.id}>
                    <div className="group flex items-center gap-3">
                      <input type="checkbox" aria-label={`Marcar item ${i + 1} como concluído`} {...register(`checklist.${i}.feito`)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600" />
                      <input
                        autoComplete="off" placeholder="Descreva o item" aria-label={`Item ${i + 1} do checklist`}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), checks.append({ texto: "", feito: false }))}
                        {...register(`checklist.${i}.texto`)}
                        className={`min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1 text-[13px] outline-none placeholder:text-slate-400 hover:border-slate-200 focus:border-blue-500 ${v.checklist?.[i]?.feito ? "text-slate-400 line-through" : "text-slate-800"}`}
                      />
                      <button type="button" onClick={() => checks.remove(i)} aria-label={`Remover item ${i + 1} do checklist`} className={`${iconBtn} h-7 w-7 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100`}><Trash2 size={14} /></button>
                    </div>
                    <Err className="ml-7">{errors.checklist?.[i]?.texto?.message}</Err>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => checks.append({ texto: "", feito: false })} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-800">
                <Plus size={14} /> Adicionar item
              </button>
            </section>

            <section id="nt-sec-anexos" aria-label="Anexos">
              <div className="mb-2"><Label icon={Paperclip} optional>Anexos</Label></div>
              <div
                role="button" tabIndex={0} aria-label="Selecionar arquivos para anexar"
                onClick={() => picker.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), picker.current?.click())}
                onDragOver={(e) => (e.preventDefault(), setDragging(true))}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => (e.preventDefault(), setDragging(false), addFiles(e.dataTransfer.files))}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed px-4 py-7 text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-200 [&>*]:pointer-events-none ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/40 hover:border-blue-400"}`}
              >
                <CloudUpload size={26} className="text-blue-600" />
                <p className="text-[13px] text-slate-800">Arraste arquivos aqui ou <span className="font-medium text-blue-600">clique para selecionar</span></p>
                <p className="text-[11px] text-slate-500">PDF, DOC, XLSX, PNG, JPG até 10MB</p>
                <input ref={picker} type="file" multiple accept={ATTACHMENT_ACCEPT} tabIndex={-1} className="sr-only" onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
              </div>
              {fileErrors.length > 0 && (
                <ul role="alert" className="mt-2 space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  {fileErrors.map((m) => <li key={m} className="text-[11px] text-red-700">{m}</li>)}
                </ul>
              )}
              <ul className="mt-3 space-y-2">
                {files.map((f) => (
                  <li key={fileKey(f)} className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600"><FileText size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-slate-800">{f.name}</span>
                      <span className="block text-[11px] text-slate-500">{size(f.size)}</span>
                    </span>
                    <button type="button" onClick={() => (setFiles(files.filter((x) => x !== f)), setFileErrors([]))} aria-label={`Remover anexo ${f.name}`} className={`${iconBtn} h-7 w-7`}><X size={15} /></button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <footer className="border-t border-slate-200 px-6 pb-4 pt-3">
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{usuarioDemo.iniciais}</span>
                <div className="leading-tight">
                  <p className="text-[10px] text-slate-500">Criado por</p>
                  <p className="text-[12px] font-semibold text-slate-900">{usuarioDemo.nome}</p>
                  <p className="text-[10px] text-slate-500">{iso(now).split("-").reverse().join("/")} às {pad(now.getHours())}:{pad(now.getMinutes())}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500">Status inicial</p>
                <span className="mt-1 inline-block rounded bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">A fazer</span>
              </div>
            </div>
            {submitCount > 0 && Object.keys(errors).length > 0 && <Err className="mt-3 font-medium">Corrija os campos destacados para criar a tarefa.</Err>}
            <div className="mt-3 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="h-9 rounded-md border border-slate-200 px-5 text-[12px] font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-5 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-700">
                <Check size={15} /> Criar Tarefa
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
