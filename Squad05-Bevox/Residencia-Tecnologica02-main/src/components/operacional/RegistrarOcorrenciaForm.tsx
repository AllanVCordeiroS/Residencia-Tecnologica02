"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileImage,
  FileText,
  Paperclip,
  Pencil,
  ShieldCheck,
  UploadCloud,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useCreateOccurrenceMutation } from "@/hooks/queries/useCreateOccurrenceMutation";
import { useCreateTaskMutation } from "@/hooks/queries/useCreateTaskMutation";
import { useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { occurrenceFormSchema, type OccurrenceFormValues } from "@/schemas/occurrence";
import { occurrenceCategories, occurrenceKinds, occurrenceSeverities } from "@/schemas/occurrence";
import { TASK_OWNERS } from "@/components/tarefas/taskOptions";
import { DATA_REFERENCIA_DEMO } from "@/data/mockData";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { linkTaskToOccurrence } from "@/services/occurrences";
import type { OccurrenceFile } from "@/types/occurrence";
import { useQueryClient } from "@tanstack/react-query";
import { occurrenceQueryKeys } from "@/lib/occurrence-query-keys";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ATTACHMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];
const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-line dark:bg-surface-muted dark:text-foreground dark:focus:bg-surface-raised dark:focus:ring-blue-950";
const labelClass = "mb-1.5 block text-[11px] font-semibold text-slate-700 dark:text-foreground";

interface PhotoFile {
  file: File;
  previewUrl: string;
}

function toFileInfo(file: File): OccurrenceFile {
  return { name: file.name, size: file.size, type: file.type || "application/octet-stream" };
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p role="alert" className="mt-1 text-[10px] font-medium text-rose-600 dark:text-rose-300">{children}</p>;
}

function SectionHeading({ number, icon, title, description }: { number: number; icon: ReactNode; title: string; description: string }) {
  return <div className="mb-4 flex items-center gap-3 border-b border-line pb-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">{icon}</span><div><h2 className="text-xs font-bold text-slate-800 dark:text-foreground sm:text-sm">{number}. {title}</h2><p className="mt-0.5 text-[10px] text-slate-400 dark:text-foreground-muted">{description}</p></div></div>;
}

function ReviewItem({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-line"><span className="text-[10px] text-slate-400 dark:text-foreground-muted">{label}</span><span className="max-w-[62%] break-words text-right text-[10px] font-semibold text-slate-700 dark:text-foreground">{value || "Não informado"}</span></div>;
}

export default function RegistrarOcorrenciaForm() {
  const router = useRouter();
  const usuario = useSessionUser();
  const queryClient = useQueryClient();
  const { data: units = [], isPending: unitsPending } = useUnitsQuery();
  const createOccurrence = useCreateOccurrenceMutation();
  const createTask = useCreateTaskMutation();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [draggingAttachments, setDraggingAttachments] = useState(false);
  const [draggingPhotos, setDraggingPhotos] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const photoUrlsRef = useRef<string[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceFormSchema),
    mode: "onChange",
    defaultValues: {
      // O select vazio usa "" no DOM; manter o mesmo valor evita dirty falso
      // apenas por montar o formulário. O schema continua rejeitando o vazio.
      kind: "" as OccurrenceFormValues["kind"],
      category: "" as OccurrenceFormValues["category"],
      unitId: "",
      severity: "" as OccurrenceFormValues["severity"],
      title: "",
      eventDate: DATA_REFERENCIA_DEMO,
      eventTime: "10:30",
      description: "",
      owner: "",
      driver: "",
      team: "",
      resolutionDeadline: DATA_REFERENCIA_DEMO,
      priority: "Alta",
      observations: "",
      createLinkedTask: true,
      taskOwner: "",
      taskDueDate: "2026-04-24",
    },
  });

  const values = useWatch({ control: form.control });
  const guard = useUnsavedChanges({
    dirty: form.formState.isDirty || attachments.length > 0 || photos.length > 0,
    description: "Existem informações preenchidas que ainda não foram enviadas. Caso saia agora, você poderá perder as alterações realizadas.",
  });
  const linkedTask = values.createLinkedTask;
  const selectedUnit = units.find((unit) => unit.id === values.unitId);
  const allFieldsValid = form.formState.isValid && fileErrors.length === 0;

  useEffect(() => () => {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function addFiles(fileList: FileList | File[], mode: "attachment" | "photo") {
    const files = Array.from(fileList);
    const errors: string[] = [];
    if (mode === "attachment") {
      const accepted: File[] = [];
      for (const file of files) {
        const ext = extension(file);
        if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
          errors.push(`${file.name}: formato não permitido.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          errors.push(`${file.name}: ultrapassa o limite de 10 MB.`);
          continue;
        }
        accepted.push(file);
      }
      setAttachments((current) => {
        const existing = new Set(current.map((file) => `${file.name}-${file.size}`));
        return [...current, ...accepted.filter((file) => !existing.has(`${file.name}-${file.size}`))];
      });
    } else {
      const accepted: PhotoFile[] = [];
      for (const file of files) {
        const ext = extension(file);
        if (!IMAGE_EXTENSIONS.includes(ext) || !file.type.startsWith("image/")) {
          errors.push(`${file.name}: selecione uma imagem JPG ou PNG.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          errors.push(`${file.name}: ultrapassa o limite de 10 MB.`);
          continue;
        }
        const previewUrl = URL.createObjectURL(file);
        photoUrlsRef.current.push(previewUrl);
        accepted.push({ file, previewUrl });
      }
      setPhotos((current) => {
        const existing = new Set(current.map(({ file }) => `${file.name}-${file.size}`));
        const duplicates = accepted.filter(({ file }) => existing.has(`${file.name}-${file.size}`));
        duplicates.forEach(({ previewUrl }) => {
          URL.revokeObjectURL(previewUrl);
          photoUrlsRef.current = photoUrlsRef.current.filter((url) => url !== previewUrl);
        });
        return [...current, ...accepted.filter(({ file }) => !existing.has(`${file.name}-${file.size}`))];
      });
    }
    setFileErrors(errors);
    if (mode === "attachment" && attachmentInputRef.current) attachmentInputRef.current.value = "";
    if (mode === "photo" && photoInputRef.current) photoInputRef.current.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      const removed = current[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
        photoUrlsRef.current = photoUrlsRef.current.filter((url) => url !== removed.previewUrl);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function onSubmit(data: OccurrenceFormValues) {
    setSubmitError("");
    if (fileErrors.length > 0) {
      setSubmitError("Corrija os arquivos inválidos antes de registrar a ocorrência.");
      return;
    }
    const unit = units.find((item) => item.id === data.unitId);
    if (!unit) {
      setSubmitError("A unidade selecionada não foi encontrada. Atualize a página e tente novamente.");
      return;
    }

    try {
      const createdOccurrence = await createOccurrence.mutateAsync({
        kind: data.kind,
        category: data.category,
        unitId: unit.id,
        unitName: unit.nome,
        severity: data.severity,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        owner: data.owner,
        driver: data.driver,
        team: data.team,
        resolutionDeadline: data.resolutionDeadline,
        priority: data.priority,
        observations: data.observations,
        attachments: attachments.map(toFileInfo),
        images: photos.map(({ file }) => toFileInfo(file)),
      });

      if (data.createLinkedTask) {
        const taskOwner = TASK_OWNERS.find((owner) => owner.name === data.taskOwner);
        if (taskOwner && data.taskDueDate) {
          const createdTask = await createTask.mutateAsync({
            title: `Ocorrência: ${data.title}`,
            description: `Tarefa criada a partir da ocorrência ${createdOccurrence.protocol}. ${data.description}`,
            unit: unit.nome,
            owner: taskOwner.name,
            initials: taskOwner.initials,
            category: "Operação",
            priority: data.priority === "Crítica" ? "Urgente" : data.priority,
            startDate: data.eventDate,
            dueDate: data.taskDueDate,
            subtasks: [],
            checklist: [],
            attachments: [...attachments, ...photos.map(({ file }) => file)].map((file) => ({ name: file.name, size: file.size, type: file.type || "application/octet-stream" })),
            createdBy: usuario.nome,
            createdAt: new Date().toISOString(),
          });
          await linkTaskToOccurrence(createdOccurrence.id, createdTask.id);
          await queryClient.invalidateQueries({ queryKey: occurrenceQueryKeys.all });
        }
      }
      guard.allowNavigation();
      router.push("/operacional?ocorrencia=registrada");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível concluir o registro demonstrativo.");
    }
  }

  const taskOwnerValue = TASK_OWNERS.find((owner) => owner.name === values.taskOwner);
  const submitPending = form.formState.isSubmitting || createOccurrence.isPending || createTask.isPending;

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5">
      <div className="flex flex-col gap-1">
        <button type="button" onClick={() => guard.requestNavigation("/operacional")} className="mb-1 inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-blue-700 dark:text-foreground-muted dark:hover:text-blue-300"><ArrowLeft size={14} />Voltar para Central de Operações</button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">Registrar Ocorrência</h1>
        <p className="text-xs text-slate-500 dark:text-foreground-muted sm:text-sm">Informe os detalhes da ocorrência para que a equipe responsável possa agir.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <Card className="p-4 sm:p-5">
            <SectionHeading number={1} icon={<Pencil size={15} />} title="Informações principais" description="Preencha os dados básicos da ocorrência." />
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <div><label className={labelClass} htmlFor="kind">Tipo de ocorrência <Required /></label><select id="kind" className={inputClass} {...form.register("kind")}><option value="">Selecione o tipo</option>{occurrenceKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select><FieldError>{form.formState.errors.kind?.message}</FieldError></div>
              <div><label className={labelClass} htmlFor="category">Categoria <Required /></label><select id="category" className={inputClass} {...form.register("category")}><option value="">Selecione a categoria</option>{occurrenceCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select><FieldError>{form.formState.errors.category?.message}</FieldError></div>
              <div><label className={labelClass} htmlFor="unitId">Unidade <Required /></label><div className="relative"><Building2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select id="unitId" className={`${inputClass} pl-9`} disabled={unitsPending} {...form.register("unitId")}><option value="">{unitsPending ? "Carregando unidades..." : "Selecione a unidade"}</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.nome}</option>)}</select></div><FieldError>{form.formState.errors.unitId?.message}</FieldError></div>
              <div><label className={labelClass} htmlFor="severity">Gravidade <Required /></label><select id="severity" className={inputClass} {...form.register("severity")}><option value="">Selecione a gravidade</option>{occurrenceSeverities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}</select><FieldError>{form.formState.errors.severity?.message}</FieldError></div>
              <div><label className={labelClass} htmlFor="title">Título <Required /></label><input id="title" maxLength={120} placeholder="Ex.: Divergência no recebimento de mercadorias" className={inputClass} {...form.register("title")} /><div className="mt-1 flex justify-between"><FieldError>{form.formState.errors.title?.message}</FieldError><span className="text-[9px] text-slate-400">{(values.title ?? "").length}/120</span></div></div>
              <div className="grid grid-cols-[1fr_112px] gap-2"><div><label className={labelClass} htmlFor="eventDate">Data da ocorrência <Required /></label><div className="relative"><CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="eventDate" type="date" className={`${inputClass} pl-9`} {...form.register("eventDate")} /></div><FieldError>{form.formState.errors.eventDate?.message}</FieldError></div><div><label className={labelClass} htmlFor="eventTime">Horário <Required /></label><div className="relative"><Clock3 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="eventTime" type="time" className={`${inputClass} pl-9`} {...form.register("eventTime")} /></div><FieldError>{form.formState.errors.eventTime?.message}</FieldError></div></div>
              <div className="sm:col-span-2"><label className={labelClass} htmlFor="description">Descrição <Required /></label><textarea id="description" rows={4} maxLength={1000} placeholder="Descreva o que aconteceu, o impacto e outras informações relevantes..." className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-line dark:bg-surface-muted dark:text-foreground dark:focus:bg-surface-raised dark:focus:ring-blue-950" {...form.register("description")} /><div className="mt-1 flex justify-between"><FieldError>{form.formState.errors.description?.message}</FieldError><span className="text-[9px] text-slate-400">{(values.description ?? "").length}/1000</span></div></div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 xl:sticky xl:top-20">
            <div className="mb-3 flex items-center gap-2 border-b border-line pb-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><ClipboardIcon /></span><h2 className="text-xs font-bold text-slate-800 dark:text-foreground">Resumo da ocorrência</h2></div>
            <div className="space-y-3">
              <SummaryLine label="Tipo" value={values.kind || "Não informado"} />
              <SummaryLine label="Categoria" value={values.category || "Não informado"} />
              <SummaryLine label="Unidade" value={selectedUnit?.nome || "Selecione uma unidade"} />
              <SummaryLine label="Gravidade" value={values.severity || "Não informado"} />
              <SummaryLine label="Data da ocorrência" value={values.eventDate ? `${values.eventDate.split("-").reverse().join("/")} · ${values.eventTime || "--:--"}` : "Não informada"} />
              <div className="pt-1"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${allFieldsValid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"}`}><span className={`h-1.5 w-1.5 rounded-full ${allFieldsValid ? "bg-emerald-500" : "bg-blue-500"}`} />{allFieldsValid ? "Pronto para revisão" : "Em preenchimento"}</span></div>
            </div>
            <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-[10px] leading-relaxed text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-200"><CircleHelp size={13} className="mr-1 inline" />Os campos com asterisco são obrigatórios para registrar a ocorrência.</p>
          </Card>
        </div>

        <Card className="p-4 sm:p-5">
          <SectionHeading number={2} icon={<Paperclip size={15} />} title="Detalhes e evidências" description="Anexe arquivos, fotos e outras informações que ajudem na análise da ocorrência." />
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="mb-2"><h3 className="text-[11px] font-semibold text-slate-700 dark:text-foreground">Anexos</h3><p className="mt-0.5 text-[10px] text-slate-400">PDF, JPG, JPEG, PNG, DOC e DOCX. Máximo de 10 MB por arquivo.</p></div>
              <input ref={attachmentInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={(event) => event.target.files && addFiles(event.target.files, "attachment")} />
              <button type="button" onClick={() => attachmentInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDraggingAttachments(true); }} onDragLeave={() => setDraggingAttachments(false)} onDrop={(event) => { event.preventDefault(); setDraggingAttachments(false); addFiles(event.dataTransfer.files, "attachment"); }} className={`flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition ${draggingAttachments ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-blue-200 bg-slate-50/70 hover:bg-blue-50/60 dark:border-blue-900 dark:bg-surface-muted"}`}><UploadCloud size={23} className="mb-2 text-blue-500" /><span className="text-[11px] font-semibold text-slate-600 dark:text-foreground">Arraste arquivos aqui ou <span className="text-blue-600">clique para selecionar</span></span><span className="mt-1 text-[9px] text-slate-400">Até 10 MB por arquivo</span></button>
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => <div key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"><FileText size={15} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[10px] font-semibold text-slate-700 dark:text-foreground">{file.name}</strong><small className="text-[9px] text-slate-400">{extension(file).toUpperCase()} · {formatBytes(file.size)}</small></span><button type="button" onClick={() => removeAttachment(index)} aria-label={`Remover ${file.name}`} className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><X size={14} /></button></div>)}
                {attachments.length === 0 && <p className="text-[10px] text-slate-400">Nenhum anexo selecionado.</p>}
              </div>
            </div>
            <div>
              <div className="mb-2"><h3 className="text-[11px] font-semibold text-slate-700 dark:text-foreground">Evidências (fotos)</h3><p className="mt-0.5 text-[10px] text-slate-400">Adicione imagens que comprovem a ocorrência. JPG ou PNG, até 10 MB cada.</p></div>
              <input ref={photoInputRef} type="file" multiple accept="image/png,image/jpeg,.jpg,.jpeg,.png" className="hidden" onChange={(event) => event.target.files && addFiles(event.target.files, "photo")} />
              <button type="button" onClick={() => photoInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDraggingPhotos(true); }} onDragLeave={() => setDraggingPhotos(false)} onDrop={(event) => { event.preventDefault(); setDraggingPhotos(false); addFiles(event.dataTransfer.files, "photo"); }} className={`flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition ${draggingPhotos ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-blue-200 bg-slate-50/70 hover:bg-blue-50/60 dark:border-blue-900 dark:bg-surface-muted"}`}><Camera size={23} className="mb-2 text-blue-500" /><span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Adicionar imagens</span><span className="mt-1 text-[9px] text-slate-400">Selecionar do dispositivo ou arrastar</span></button>
              {photos.length > 0 ? <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{photos.map(({ file, previewUrl }, index) => <div key={`${file.name}-${file.size}-${index}`} className="group relative overflow-hidden rounded-lg border border-line"><div className="relative aspect-[4/3] bg-slate-100 dark:bg-surface-muted"><Image unoptimized fill sizes="(max-width: 640px) 50vw, 200px" src={previewUrl} alt={`Pré-visualização ${file.name}`} className="h-full w-full object-cover" /></div><p className="truncate px-2 py-1.5 text-[9px] text-slate-600 dark:text-foreground-muted">{file.name}</p><button type="button" onClick={() => removePhoto(index)} aria-label={`Remover imagem ${file.name}`} className="absolute right-1 top-1 rounded-full bg-slate-950/70 p-1 text-white"><X size={12} /></button></div>)}</div> : <p className="mt-3 text-[10px] text-slate-400">Nenhuma imagem selecionada.</p>}
            </div>
          </div>
          {fileErrors.length > 0 && <div role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[10px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{fileErrors.map((error) => <p key={error}>{error}</p>)}</div>}
          <div className="mt-5 max-w-2xl"><label htmlFor="observations" className={labelClass}>Observações adicionais</label><textarea id="observations" rows={3} maxLength={500} placeholder="Inclua observações que possam auxiliar na análise da ocorrência..." className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:border-line dark:bg-surface-muted dark:text-foreground dark:focus:bg-surface-raised" {...form.register("observations")} /><div className="mt-1 flex justify-between"><FieldError>{form.formState.errors.observations?.message}</FieldError><span className="text-[9px] text-slate-400">{(values.observations ?? "").length}/500</span></div></div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionHeading number={3} icon={<Clock3 size={15} />} title="Responsáveis e prazos" description="Defina quem será responsável e os prazos para resolução da ocorrência." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="owner" className={labelClass}>Responsável pela ocorrência <Required /></label><div className="relative"><UserRound size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select id="owner" className={`${inputClass} pl-9`} {...form.register("owner")}><option value="">Selecione o responsável</option>{TASK_OWNERS.map((owner) => <option key={owner.name} value={owner.name}>{owner.name}</option>)}</select></div><FieldError>{form.formState.errors.owner?.message}</FieldError></div>
            <div><label htmlFor="team" className={labelClass}>Equipe responsável (opcional)</label><div className="relative"><Users size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select id="team" className={`${inputClass} pl-9`} {...form.register("team")}><option value="">Selecione a equipe</option>{["Operações", "Transporte", "Fiscal", "Manutenção", "Estoque"].map((team) => <option key={team}>{team}</option>)}</select></div></div>
            <div><label htmlFor="resolutionDeadline" className={labelClass}>Data limite para resolução <Required /></label><div className="relative"><CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="resolutionDeadline" type="date" className={`${inputClass} pl-9`} {...form.register("resolutionDeadline")} /></div><FieldError>{form.formState.errors.resolutionDeadline?.message}</FieldError></div>
            <div><label htmlFor="priority" className={labelClass}>Prioridade de atendimento <Required /></label><select id="priority" className={inputClass} {...form.register("priority")}><option value="">Selecione a prioridade</option>{occurrenceSeverities.map((priority) => <option key={priority}>{priority}</option>)}</select><FieldError>{form.formState.errors.priority?.message}</FieldError></div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-blue-600" {...form.register("createLinkedTask")} /><span><strong className="block text-[11px] font-semibold text-slate-800 dark:text-foreground">Criar tarefa vinculada a esta ocorrência</strong><span className="mt-0.5 block text-[10px] text-slate-400">Uma tarefa será criada no módulo de tarefas para acompanhar a resolução.</span></span></label>
            {linkedTask && <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 dark:bg-surface-muted sm:grid-cols-2"><div><label htmlFor="taskOwner" className={labelClass}>Responsável da tarefa <Required /></label><div className="relative"><UserRound size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select id="taskOwner" className={`${inputClass} pl-9`} {...form.register("taskOwner")}><option value="">Selecione o responsável</option>{TASK_OWNERS.map((owner) => <option key={owner.name} value={owner.name}>{owner.name}</option>)}</select></div><FieldError>{form.formState.errors.taskOwner?.message}</FieldError></div><div><label htmlFor="taskDueDate" className={labelClass}>Prazo da tarefa <Required /></label><div className="relative"><CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="taskDueDate" type="date" className={`${inputClass} pl-9`} {...form.register("taskDueDate")} /></div><FieldError>{form.formState.errors.taskDueDate?.message}</FieldError></div></div>}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionHeading number={4} icon={<CheckCircle2 size={15} />} title="Revisão" description="Confira as informações antes de finalizar o registro." />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ReviewCard title="Informações principais" icon={<Pencil size={13} />}><ReviewItem label="Tipo" value={values.kind} /><ReviewItem label="Categoria" value={values.category} /><ReviewItem label="Unidade" value={selectedUnit?.nome} /><ReviewItem label="Gravidade" value={values.severity} /><ReviewItem label="Título" value={values.title} /><ReviewItem label="Data e hora" value={values.eventDate ? `${values.eventDate.split("-").reverse().join("/")} ${values.eventTime}` : ""} /><ReviewItem label="Descrição" value={values.description} /></ReviewCard>
            <ReviewCard title="Detalhes e evidências" icon={<Paperclip size={13} />}><ReviewItem label="Anexos totais" value={`${attachments.length} arquivo(s)`} /><ReviewItem label="Imagens" value={`${photos.length} imagem(ns)`} /><ReviewItem label="Observações" value={values.observations || "Não informado"} /><div className="mt-2 space-y-1">{attachments.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[9px] text-slate-600 dark:bg-surface-muted dark:text-foreground-muted"><FileText size={11} className="shrink-0" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span>{formatBytes(file.size)}</span></div>)}{photos.map(({ file }, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[9px] text-slate-600 dark:bg-surface-muted dark:text-foreground-muted"><FileImage size={11} className="shrink-0" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span>{formatBytes(file.size)}</span></div>)}</div></ReviewCard>
            <ReviewCard title="Responsáveis e prazos" icon={<Clock3 size={13} />}><ReviewItem label="Responsável" value={values.owner} /><ReviewItem label="Equipe" value={values.team || "Não informada"} /><ReviewItem label="Prazo limite" value={values.resolutionDeadline?.split("-").reverse().join("/")} /><ReviewItem label="Prioridade" value={values.priority} /><ReviewItem label="Tarefa vinculada" value={linkedTask ? "Ativada" : "Desativada"} />{linkedTask && <><ReviewItem label="Responsável da tarefa" value={taskOwnerValue?.name} /><ReviewItem label="Prazo da tarefa" value={values.taskDueDate?.split("-").reverse().join("/")} /></>}</ReviewCard>
            <ReviewCard title="Validação do registro" icon={<ShieldCheck size={13} />}><div className="mb-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${allFieldsValid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"}`}><span className={`h-1.5 w-1.5 rounded-full ${allFieldsValid ? "bg-emerald-500" : "bg-blue-500"}`} />{allFieldsValid ? "Pronto para registrar" : "Em preenchimento"}</span></div><p className="text-[10px] leading-relaxed text-slate-500 dark:text-foreground-muted">{allFieldsValid ? "Os campos obrigatórios foram preenchidos. Revise os dados e confirme o registro." : "Preencha os campos obrigatórios e corrija eventuais erros antes de confirmar."}</p><div className="mt-3 space-y-2 text-[10px]"><div className="flex items-center gap-2">{form.formState.errors.kind || form.formState.errors.category || form.formState.errors.unitId || form.formState.errors.severity || form.formState.errors.title || form.formState.errors.description ? <AlertCircle size={13} className="text-rose-500" /> : <CheckCircle2 size={13} className="text-emerald-500" />}<span className="text-slate-500 dark:text-foreground-muted">Informações principais</span></div><div className="flex items-center gap-2">{fileErrors.length ? <AlertCircle size={13} className="text-rose-500" /> : <CheckCircle2 size={13} className="text-emerald-500" />}<span className="text-slate-500 dark:text-foreground-muted">Validação dos arquivos</span></div><div className="flex items-center gap-2">{linkedTask && (!values.taskOwner || !values.taskDueDate) ? <AlertCircle size={13} className="text-rose-500" /> : <CheckCircle2 size={13} className="text-emerald-500" />}<span className="text-slate-500 dark:text-foreground-muted">Responsáveis e prazos</span></div></div></ReviewCard>
          </div>
        </Card>

        <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
          <button type="button" onClick={() => guard.requestNavigation("/operacional")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:bg-surface-raised dark:text-foreground-muted dark:hover:bg-surface-muted"><X size={14} />Cancelar</button>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">{submitError && <p role="alert" className="max-w-xl text-right text-[10px] text-rose-600 dark:text-rose-300">{submitError}</p>}<button type="submit" disabled={submitPending || unitsPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"><Check size={15} />{submitPending ? "Registrando..." : "Registrar ocorrência"}</button></div>
        </div>
      </form>
      {guard.dialog}
    </div>
  );
}

function Required() {
  return <span className="text-rose-500">*</span>;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[9px] text-slate-400 dark:text-foreground-muted">{label}</p><p className="mt-0.5 break-words text-[11px] font-semibold text-slate-700 dark:text-foreground">{value}</p></div>;
}

function ReviewCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-line bg-slate-50/70 p-3 dark:bg-surface-muted"><h3 className="mb-2 flex items-center gap-2 border-b border-line pb-2 text-[10px] font-bold text-slate-700 dark:text-foreground"><span className="text-blue-600 dark:text-blue-300">{icon}</span>{title}</h3>{children}</section>;
}

function ClipboardIcon() {
  return <FileText size={15} />;
}
