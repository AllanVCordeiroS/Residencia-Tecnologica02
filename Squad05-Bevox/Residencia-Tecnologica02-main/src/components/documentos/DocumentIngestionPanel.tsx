"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import {
  BadgeCheck,
  Check,
  CloudUpload,
  Copy,
  Eye,
  FileUp,
  Fingerprint,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  EXTENSOES_ACEITAS,
  LIMITE_ARQUIVO_MB,
} from "@/data/documentFormOptions";
import { formatarTamanho, type ArquivoCustodia } from "@/hooks/useDocumentFiles";
import type { DocumentFormValues } from "./documentFormSchema";
import { Caixa } from "./DocumentFormUi";

function resumirHash(hash: string): string {
  return `${hash.slice(0, 11)}...${hash.slice(-11)}`;
}

interface Props {
  arquivos: ArquivoCustodia[];
  /** Mensagens de validação do upload (formato/tamanho). */
  erroUpload: string | null;
  /** Mensagem de obrigatoriedade exibida quando se tenta homologar sem arquivo. */
  erroObrigatorio: string | null;
  onAdicionar: (arquivos: File[]) => void;
  onRemover: (id: string) => void;
  onVisualizar: (id: string) => void;
}

/** Coluna direita — Cockpit de Ingestão & OCR (OCR e assinatura são demonstrativos). */
export default function DocumentIngestionPanel({
  arquivos,
  erroUpload,
  erroObrigatorio,
  onAdicionar,
  onRemover,
  onVisualizar,
}: Props) {
  const { register } = useFormContext<DocumentFormValues>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const principal = arquivos[0];
  const hash = principal?.sha256;

  const abrirSeletor = () => inputRef.current?.click();
  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirSeletor();
    }
  };
  const aoSoltar = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastando(false);
    onAdicionar(Array.from(e.dataTransfer.files));
  };

  const copiarHash = async () => {
    if (!hash || hash === "indisponivel") return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* área de transferência indisponível */
    }
  };

  const textoHash = !principal
    ? "aguardando arquivo"
    : hash === null
      ? "calculando..."
      : hash === "indisponivel"
        ? "indisponível neste navegador"
        : resumirHash(hash);

  return (
    <Card aria-labelledby="painel-ingestao" className="overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line px-6 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
          <CloudUpload className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="painel-ingestao" className="text-[15px] font-semibold leading-tight text-slate-900 dark:text-foreground">
            Cockpit de Ingestão &amp; OCR
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500 dark:text-foreground-muted">
            Seleção local e conferência manual do documento
          </p>
        </div>
      </header>

      <div className="space-y-5 px-6 py-5">
        {/* Área de upload */}
        <div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Selecionar arquivo ou arrastar e soltar"
            onClick={abrirSeletor}
            onKeyDown={aoTeclar}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={aoSoltar}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-5 py-8 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              arrastando ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40" : "border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
            }`}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-surface-raised text-blue-600 dark:text-blue-300 shadow-sm ring-1 ring-slate-100">
              <FileUp className="size-5" aria-hidden="true" />
            </span>
            <p className="text-[13px] text-slate-500 dark:text-foreground-muted">
              <strong className="font-semibold text-slate-900 dark:text-foreground">Arraste seu arquivo para cá</strong> ou{" "}
              <span className="font-medium text-blue-600 dark:text-blue-300 underline-offset-2 hover:underline">
                busque no computador
              </span>
            </p>
            <p className="max-w-xs text-[11.5px] leading-snug text-slate-400 dark:text-foreground-muted">
              Suporta PDF pesquisável, XML (NF-e/CT-e), PNG, JPG ou TIFF (até {LIMITE_ARQUIVO_MB}MB)
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["PDF/A-1b", "XML NFe", "SHA-256"].map((etiqueta) => (
                <span
                  key={etiqueta}
                  className="rounded border border-slate-200 dark:border-line bg-white dark:bg-surface-raised px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-foreground-muted"
                >
                  {etiqueta}
                </span>
              ))}
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept={EXTENSOES_ACEITAS.map((e) => `.${e}`).join(",")}
            onChange={(e) => {
              onAdicionar(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />

          {(erroUpload || erroObrigatorio) && (
            <p role="alert" className="mt-2 text-[12px] text-red-600 dark:text-red-300">
              {erroUpload ?? erroObrigatorio}
            </p>
          )}
        </div>

        {/* Arquivos em custódia */}
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-foreground-muted">
            Arquivo em custódia ({arquivos.length})
          </h3>

          {arquivos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 dark:border-line px-4 py-5 text-center text-[12.5px] text-slate-400 dark:text-foreground-muted">
              Nenhum arquivo anexado. Selecione um arquivo para conferir.
            </p>
          ) : (
            <ul className="space-y-3">
              {arquivos.map((arq) => {
                return (
                  <li key={arq.id} className="rounded-xl border border-line bg-white dark:bg-surface-raised">
                    <div className="flex items-center gap-3 p-3.5">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                          arq.extensao === "PDF" ? "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-300" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300"
                        }`}
                        aria-hidden="true"
                      >
                        {arq.extensao}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-foreground" title={arq.nome}>
                          {arq.nome}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] text-slate-500 dark:text-foreground-muted">
                          {arq.extensao} • {formatarTamanho(arq.tamanho)}
                          <span aria-hidden="true">•</span>
                          <span className="text-blue-600 dark:text-blue-300">Selecionado neste navegador</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 dark:text-foreground-muted">
                        <button
                          type="button"
                          onClick={() => onVisualizar(arq.id)}
                          aria-label={`Visualizar ${arq.nome}`}
                          className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-surface-muted hover:text-slate-700 dark:hover:text-foreground"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemover(arq.id)}
                          aria-label={`Remover ${arq.nome}`}
                          className="rounded-md p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <p className="border-t border-line p-3 text-xs text-foreground-muted">OCR não integrado. Preencha e confira as informações complementares manualmente. O arquivo permanece disponível nesta sessão; reanexe após recarregar.</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Assinatura digital e integridade */}
        <section aria-labelledby="assinatura-titulo" className="rounded-xl border border-line p-4">
          <h3 id="assinatura-titulo" className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-foreground">
            <BadgeCheck className="size-4 text-blue-600 dark:text-blue-300" aria-hidden="true" />
            Assinatura Digital &amp; ICP-Brasil
          </h3>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <span className="mt-0.5">
                <Caixa {...register("assinaturaCertificado")} />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-slate-900 dark:text-foreground">
                  Solicitar assinatura com certificado e-CNPJ
                </span>
                <span className="block text-[11.5px] text-slate-400 dark:text-foreground-muted">
                  Preferência registrada; assinatura digital ainda não integrada.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <span className="mt-0.5">
                <Caixa {...register("carimboTempo")} />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-slate-900 dark:text-foreground">
                  Solicitar carimbo de tempo
                </span>
                <span className="block text-[11.5px] text-slate-400 dark:text-foreground-muted">
                  Preferência registrada; serviço de carimbo de tempo não integrado.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-line bg-slate-50 dark:bg-surface-muted px-3 py-2.5">
            <Fingerprint className="size-4 shrink-0 text-slate-400 dark:text-foreground-muted" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-600 dark:text-foreground-muted">
              SHA-256: {textoHash}
            </p>
            <button
              type="button"
              onClick={copiarHash}
              disabled={!hash || hash === "indisponivel"}
              className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-300 disabled:cursor-not-allowed disabled:text-slate-300 dark:disabled:text-foreground-muted"
            >
              {copiado ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-foreground-muted">
            O hash SHA-256 é calculado de fato no seu navegador a partir do primeiro arquivo. A assinatura
            e o carimbo de tempo são demonstrativos: não há integração com autoridade certificadora.
          </p>
        </section>
      </div>
    </Card>
  );
}
