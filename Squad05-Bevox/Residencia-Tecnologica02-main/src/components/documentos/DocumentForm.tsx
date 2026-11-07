"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Info, LoaderCircle, ShieldCheck, TriangleAlert, X } from "lucide-react";

import { OCR_DEMONSTRATIVO } from "@/data/documentFormOptions";
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
  const metodos = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: VALORES_PADRAO,
    mode: "onTouched",
  });
  const { handleSubmit, setValue, reset, watch, getValues, control, formState } = metodos;
  const arquivos = useDocumentFiles();

  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  const [salvoEm, setSalvoEm] = useState<Date | null>(null);
  const [dispensado, setDispensado] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const temporizadorAviso = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const temporizadorRota = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autosalvar = useRef(true);

  const rascunho = interpretarRascunho(useRascunhoBruto());

  /* Salva o rascunho (somente os campos) 800 ms depois da última alteração. */
  useEffect(() => {
    let espera: ReturnType<typeof setTimeout> | undefined;
    const assinatura = watch(() => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        if (autosalvar.current) setSalvoEm(salvarRascunho(getValues()));
      }, 800);
    });
    return () => {
      assinatura.unsubscribe();
      clearTimeout(espera);
    };
  }, [watch, getValues]);

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
  const temAlteracoes = formState.isDirty || arquivos.arquivos.length > 0;
  const mostrarBannerRascunho = Boolean(rascunho) && !dispensado && !formState.isDirty;

  function restaurarRascunho() {
    if (!rascunho) return;
    reset({ ...VALORES_PADRAO, ...rascunho.valores });
    setSalvoEm(new Date(rascunho.salvoEm));
    setDispensado(true);
    notificar("info", "Rascunho restaurado. Reanexe o arquivo, caso necessário.");
  }

  function ignorarRascunho() {
    limparRascunho();
    setDispensado(true);
  }

  /** Aplica ao formulário os valores (demonstrativos) do OCR e marca como confirmados. */
  function confirmarOcr(id: string) {
    arquivos.confirmarOcr(id);
    setValue("prazoIndeterminado", false, { shouldDirty: true });
    setValue("dataVencimento", OCR_DEMONSTRATIVO.vencimentoIso, { shouldDirty: true, shouldValidate: true });
    setValue("protocolo", OCR_DEMONSTRATIVO.protocolo, { shouldDirty: true, shouldValidate: true });
    notificar("sucesso", "Metadados do OCR (demonstrativo) aplicados: vencimento e protocolo.");
  }

  async function homologar(dados: DocumentFormValues) {
    setTentouEnviar(true);

    if (arquivos.arquivos.length === 0) {
      notificar("erro", MSG_SEM_ARQUIVO);
      document.getElementById("painel-ingestao")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (arquivos.arquivos.some((a) => a.status === "extraindo")) {
      notificar("info", "Aguarde a conclusão da extração dos metadados.");
      return;
    }

    setEnviando(true);
    // TODO(backend): enviar `dados` + arquivos para a API de homologação/indexação.
    // Hoje a indexação é apenas simulada.
    await new Promise((resolver) => setTimeout(resolver, 1200));

    autosalvar.current = false;
    limparRascunho();
    setEnviando(false);
    setConcluido(true);
    notificar("sucesso", `“${dados.titulo}” homologado e indexado (simulação — sem persistência).`);
    temporizadorRota.current = setTimeout(() => router.push(ROTA_LISTAGEM), 1800);
  }

  function aoInvalido() {
    setTentouEnviar(true);
    notificar("erro", "Revise os campos destacados antes de homologar.");
  }

  function aoDescartar() {
    if (!temAlteracoes) {
      router.push(ROTA_LISTAGEM);
      return;
    }
    setConfirmandoDescarte(true);
  }

  function confirmarDescarte() {
    autosalvar.current = false;
    limparRascunho();
    reset(VALORES_PADRAO);
    arquivos.limpar();
    setConfirmandoDescarte(false);
    router.push(ROTA_LISTAGEM);
  }

  return (
    <FormProvider {...metodos}>
      <form
        onSubmit={handleSubmit(homologar, aoInvalido)}
        noValidate
        aria-label="Homologação e registro de documento"
        className="flex flex-col gap-6"
      >
        {mostrarBannerRascunho && rascunho && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-900"
          >
            <span className="flex items-center gap-2">
              <Info className="size-4 shrink-0" aria-hidden="true" />
              Há um rascunho salvo às {formatarHoraRascunho(rascunho.salvoEm)}. Deseja restaurá-lo?
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={restaurarRascunho}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700"
              >
                Restaurar
              </button>
              <button
                type="button"
                onClick={ignorarRascunho}
                className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-blue-700 hover:bg-blue-100"
              >
                Ignorar
              </button>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
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
              onConfirmarOcr={confirmarOcr}
            />
          </div>
        </div>

        {/* Barra de ações */}
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-line bg-white/95 px-5 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${salvoEm ? "bg-blue-500" : "bg-slate-300"}`}
              />
              {salvoEm
                ? `Rascunho salvo às ${formatarHoraRascunho(salvoEm)}`
                : "Rascunho ainda não salvo"}
            </span>
            <span aria-hidden="true" className="hidden text-slate-300 sm:inline">
              •
            </span>
            {pendentes === 0 ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CircleCheck className="size-3.5" aria-hidden="true" />
                Todos os campos obrigatórios validados
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600">
                <TriangleAlert className="size-3.5" aria-hidden="true" />
                {pendentes} {pendentes === 1 ? "item obrigatório pendente" : "itens obrigatórios pendentes"}
              </span>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={aoDescartar}
              disabled={enviando || concluido}
              className="h-10 rounded-lg px-4 text-[13px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Descartar
            </button>
            <button
              type="submit"
              disabled={enviando || concluido}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {enviando ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : concluido ? (
                <CircleCheck className="size-4" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-4" aria-hidden="true" />
              )}
              {enviando ? "Indexando..." : concluido ? "Documento homologado" : "Homologar & Indexar Documento"}
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
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : aviso.tipo === "erro"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-blue-200 bg-blue-50 text-blue-900"
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

      {confirmandoDescarte && (
        <DialogoDescarte onCancelar={() => setConfirmandoDescarte(false)} onConfirmar={confirmarDescarte} />
      )}
    </FormProvider>
  );
}

function DialogoDescarte({
  onCancelar,
  onConfirmar,
}: {
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && onCancelar();
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onCancelar]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="descarte-titulo"
        aria-describedby="descarte-texto"
        className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl"
      >
        <h2 id="descarte-titulo" className="text-[17px] font-bold text-slate-900">
          Descartar este registro?
        </h2>
        <p id="descarte-texto" className="mt-2 text-[13px] text-slate-500">
          Os campos preenchidos, os arquivos anexados e o rascunho salvo serão removidos. Esta ação não pode
          ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancelar}
            className="h-10 rounded-lg border border-line px-4 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Continuar editando
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="h-10 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white hover:bg-red-700"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}
