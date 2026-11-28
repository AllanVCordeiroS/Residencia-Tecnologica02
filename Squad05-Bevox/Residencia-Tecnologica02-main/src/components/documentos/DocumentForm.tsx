"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Info, LoaderCircle, ShieldCheck, TriangleAlert, X } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { queryKeys } from "@/lib/query-keys";
import { createDocumentDemo } from "@/services/documents";
import { formatarTamanho } from "@/hooks/useDocumentFiles";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import DocumentDialog from "./DocumentDialog";
import { useDocumentFiles } from "@/hooks/useDocumentFiles";
import {
  formatarHoraRascunho,
  interpretarRascunho,
  limparRascunho,
  salvarRascunho,
  useRascunhoBruto,
} from "@/hooks/useDocumentDraft";
import DocumentCustodySection from "./DocumentCustodySection";
import DocumentIngestionPanel from "./DocumentIngestionPanel";
import DocumentMetadataSection from "./DocumentMetadataSection";
import DocumentValiditySection from "./DocumentValiditySection";
import { documentSchema, VALORES_PADRAO, type DocumentFormValues } from "./documentFormSchema";

const MSG_SEM_ARQUIVO = "Anexe ao menos um documento para homologar.";
const ROTA_LISTAGEM = "/documentos";

type Aviso = { tipo: "sucesso" | "erro" | "info"; texto: string };

export default function DocumentForm() {
  const router = useRouter();
  const cache = useQueryClient();
  const { data: units = [] } = useUnitsQuery();
  const metodos = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: VALORES_PADRAO,
    mode: "onTouched",
  });
  const { handleSubmit, reset, subscribe, getValues, control, formState } = metodos;
  const arquivos = useDocumentFiles();

  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [confirmandoExclusaoRascunho, setConfirmandoExclusaoRascunho] = useState(false);
  const [salvoEm, setSalvoEm] = useState<Date | null>(null);
  const [erroRascunho, setErroRascunho] = useState(false);
  const [restaurado, setRestaurado] = useState(false);
  const [dispensado, setDispensado] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const temporizadorAviso = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const temporizadorRota = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autosalvar = useRef(true);

  const rascunho = interpretarRascunho(useRascunhoBruto());

  /* Salva o rascunho (somente os campos) 800 ms depois da última alteração. */
  useEffect(() => {
    let espera: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribe({ formState: { values: true }, callback: () => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        if (autosalvar.current) {
          const saved = salvarRascunho(getValues());
          setSalvoEm(saved);
          setErroRascunho(saved === null);
        }
      }, 800);
    } });
    return () => {
      unsubscribe();
      clearTimeout(espera);
    };
  }, [subscribe, getValues]);

  useEffect(
    () => () => {
      clearTimeout(temporizadorAviso.current);
      clearTimeout(temporizadorRota.current);
    },
    [],
  );

  function notificar(tipo: Aviso["tipo"], texto: string) {
    clearTimeout(temporizadorAviso.current);
    setAviso({ tipo, texto });
    temporizadorAviso.current = setTimeout(() => setAviso(null), 5000);
  }

  /* Estado da validação exibido na barra inferior. */
  const valores = useWatch({ control });
  const analise = documentSchema.safeParse(valores);
  const camposPendentes = analise.success
    ? 0
    : new Set(analise.error.issues.map((i) => String(i.path[0]))).size;
  const pendentes = camposPendentes + (arquivos.arquivos.length === 0 ? 1 : 0);

  const erroObrigatorio = tentouEnviar && arquivos.arquivos.length === 0 ? MSG_SEM_ARQUIVO : null;
  const temAlteracoes = formState.isDirty || restaurado || arquivos.arquivos.length > 0;
  const guard = useUnsavedChanges({
    dirty: temAlteracoes && !concluido,
    onDiscard: () => { autosalvar.current = false; limparRascunho(); arquivos.limpar(); },
    savedDraftMessage: rascunho ? "Há um rascunho salvo neste navegador. Ao confirmar o descarte ele também será excluído. Os arquivos não são salvos no rascunho." : undefined,
  });
  const mostrarBannerRascunho = Boolean(rascunho) && !dispensado && !formState.isDirty;

  function restaurarRascunho() {
    if (!rascunho) return;
    reset({ ...VALORES_PADRAO, ...rascunho.valores });
    setSalvoEm(new Date(rascunho.salvoEm));
    setDispensado(true);
    setRestaurado(true);
    notificar("info", "Rascunho restaurado. Reanexe o arquivo, caso necessário.");
  }

  function ignorarRascunho() {
    if (!limparRascunho()) {
      notificar("erro", "Não foi possível excluir o rascunho. Verifique o armazenamento do navegador.");
      return;
    }
    setSalvoEm(null);
    setDispensado(true);
    setConfirmandoExclusaoRascunho(false);
  }

  async function homologar(dados: DocumentFormValues) {
    setTentouEnviar(true);

    if (arquivos.arquivos.length === 0) {
      notificar("erro", MSG_SEM_ARQUIVO);
      document.getElementById("painel-ingestao")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setEnviando(true);
    try {
      const unit = units.find((item) => item.nome === dados.unidade);
      if (!unit) throw new Error("Selecione uma unidade cadastrada disponível.");
      const dueDate = dados.prazoIndeterminado ? null : dados.dataVencimento!;
      for (const arquivo of arquivos.arquivos) {
        const type = arquivo.extensao as "PDF" | "XML" | "PNG" | "JPG" | "JPEG" | "TIF" | "TIFF";
        await createDocumentDemo({
          title: arquivos.arquivos.length > 1 ? dados.titulo + " — " + arquivo.nome : dados.titulo,
          category: dados.categoria, unit: unit.nome, unitId: unit.id,
          unitType: unit.tipo === "Matriz" ? "Matriz" : "Filial",
          responsible: dados.gestor, dueDate,
          dueText: dueDate ? "Vigência cadastrada" : "Prazo indeterminado",
          status: dueDate && dueDate < new Date().toLocaleDateString("sv-SE") ? "Vencido" : "Em análise",
          fileSize: formatarTamanho(arquivo.tamanho), fileType: type, formValues: dados,
        }, arquivo.file);
      }
      autosalvar.current = false;
      limparRascunho();
      await cache.invalidateQueries({ queryKey: queryKeys.documents.all });
      setConcluido(true);
      guard.allowNavigation();
      router.push(ROTA_LISTAGEM);
    } catch (error) {
      notificar("erro", error instanceof Error ? error.message : "Não foi possível salvar o documento.");
    } finally {
      setEnviando(false);
    }
  }

  function aoInvalido() {
    setTentouEnviar(true);
    notificar("erro", "Revise os campos destacados antes de homologar.");
  }

  return (
    <FormProvider {...metodos}>
      <form
        onSubmit={(event) => { void handleSubmit(homologar, aoInvalido)(event); }}
        noValidate
        aria-label="Homologação e registro de documento"
        className="flex flex-col gap-6"
      >
        {mostrarBannerRascunho && rascunho && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-[13px] text-blue-900 dark:text-blue-300"
          >
            <span className="flex items-center gap-2">
              <Info className="size-4 shrink-0" aria-hidden="true" />
              <span><strong className="block">Rascunho salvo: {rascunho.valores.titulo || "Documento sem título"}</strong><span className="block">{rascunho.valores.categoria || "Categoria pendente"} • {rascunho.valores.unidade || "Unidade pendente"}</span><span className="block">Atualizado em {new Date(rascunho.salvoEm).toLocaleString("pt-BR")} • {documentSchema.safeParse({ ...VALORES_PADRAO, ...rascunho.valores }).success ? "Informações preenchidas; reanexe o arquivo" : "Preenchimento parcial"}.</span>Arquivos não são preservados no rascunho.</span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={restaurarRascunho}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700"
              >
                Continuar preenchimento
              </button>
              <button
                type="button"
                onClick={() => setConfirmandoExclusaoRascunho(true)}
                className="rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-surface-raised px-3 py-1.5 text-[12px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                Excluir rascunho
              </button>
            </span>
          </div>
        )}

        {erroRascunho && <p role="alert" className="rounded-lg border border-red-200 p-3 text-sm text-red-600">Não foi possível salvar o rascunho no navegador. Mantenha esta página aberta para preservar os campos preenchidos.</p>}
        <fieldset disabled={mostrarBannerRascunho || enviando} className="grid min-w-0 grid-cols-1 items-start gap-6 disabled:opacity-60 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            <DocumentMetadataSection />
            <DocumentValiditySection />
            <DocumentCustodySection />
          </div>

          <div className="min-w-0">
            <DocumentIngestionPanel
              arquivos={arquivos.arquivos}
              erroUpload={arquivos.erro}
              erroObrigatorio={erroObrigatorio}
              onAdicionar={arquivos.adicionar}
              onRemover={arquivos.remover}
              onVisualizar={arquivos.visualizar}
            />
          </div>
        </fieldset>

        {/* Barra de ações */}
        <p className="text-xs text-foreground-muted">Os registros são salvos neste navegador. Os arquivos ficam disponíveis durante esta sessão; OCR, assinatura e envio ao servidor ainda não estão integrados.</p>
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-line bg-white/95 dark:bg-surface-raised/95 px-5 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-foreground">
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${salvoEm ? "bg-blue-500" : "bg-slate-300 dark:bg-surface-muted"}`}
              />
              {salvoEm
                ? `Rascunho salvo às ${formatarHoraRascunho(salvoEm)}`
                : "Rascunho ainda não salvo"}
            </span>
            <span aria-hidden="true" className="hidden text-slate-300 dark:text-foreground-muted sm:inline">
              •
            </span>
            {pendentes === 0 ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300">
                <CircleCheck className="size-3.5" aria-hidden="true" />
                Todos os campos obrigatórios validados
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
                <TriangleAlert className="size-3.5" aria-hidden="true" />
                {pendentes} {pendentes === 1 ? "item obrigatório pendente" : "itens obrigatórios pendentes"}
              </span>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => guard.requestNavigation('/documentos')}
              disabled={enviando || concluido}
              className="h-10 rounded-lg px-4 text-[13px] font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-surface-muted disabled:opacity-50"
            >
              Descartar
            </button>
            <button
              type="submit"
              disabled={enviando || concluido || mostrarBannerRascunho}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {enviando ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : concluido ? (
                <CircleCheck className="size-4" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-4" aria-hidden="true" />
              )}
              {enviando ? "Salvando..." : concluido ? "Documento salvo" : "Salvar documento"}
            </button>
          </div>
        </div>
      </form>

      {/* Feedback das ações */}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-20 z-[90] w-[calc(100%-2rem)] max-w-sm">
        {aviso && (
          <div
            role={aviso.tipo === "erro" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] shadow-lg ${
              aviso.tipo === "sucesso"
                ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
                : aviso.tipo === "erro"
                  ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300"
                  : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300"
            }`}
          >
            {aviso.tipo === "sucesso" ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : aviso.tipo === "erro" ? (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <p className="flex-1">{aviso.texto}</p>
            <button
              type="button"
              onClick={() => setAviso(null)}
              aria-label="Fechar aviso"
              className="rounded p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {guard.dialog}
      {confirmandoExclusaoRascunho && (
        <DocumentDialog title="Excluir rascunho?" onClose={() => setConfirmandoExclusaoRascunho(false)}>
          <p>Os campos salvos neste navegador serão removidos.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" autoFocus onClick={() => setConfirmandoExclusaoRascunho(false)} className="rounded-lg border border-line px-4 py-2">Continuar preenchendo</button>
            <button type="button" onClick={ignorarRascunho} className="rounded-lg bg-red-600 px-4 py-2 text-white">Excluir rascunho</button>
          </div>
        </DocumentDialog>
      )}
    </FormProvider>
  );
}
