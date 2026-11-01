"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import {
  BadgeCheck,
  Check,
  CheckCheck,
  CloudUpload,
  Copy,
  Eye,
  FileUp,
  Fingerprint,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  EXTENSOES_ACEITAS,
  LIMITE_ARQUIVO_MB,
  OCR_DEMONSTRATIVO,
} from "@/data/documentFormOptions";
import { formatarTamanho, type ArquivoCustodia } from "@/hooks/useDocumentFiles";
import type { DocumentFormValues } from "./documentFormSchema";
import { Caixa } from "./DocumentFormUi";

function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

const CAMPOS_OCR = [
  { rotulo: "1. CNPJ Extraído", valor: OCR_DEMONSTRATIVO.cnpj, destaque: false },
  { rotulo: "2. Razão Social", valor: OCR_DEMONSTRATIVO.razaoSocial, destaque: false },
  { rotulo: "3. Vencimento Legal", valor: formatarDataBR(OCR_DEMONSTRATIVO.vencimentoIso), destaque: true },
  { rotulo: "4. Protocolo Oficial", valor: OCR_DEMONSTRATIVO.protocolo, destaque: false },
];

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
  onConfirmarOcr: (id: string) => void;
}

/** Coluna direita — Cockpit de Ingestão & OCR (OCR e assinatura são demonstrativos). */
export default function DocumentIngestionPanel({
  arquivos,
  erroUpload,
  erroObrigatorio,
  onAdicionar,
  onRemover,
  onVisualizar,
  onConfirmarOcr,
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
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <CloudUpload className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="painel-ingestao" className="text-[15px] font-semibold leading-tight text-slate-900">
            Cockpit de Ingestão &amp; OCR
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Processamento forense e extração com inteligência artificial
          </p>
        </div>
        <span
          title="O OCR, a assinatura digital e a indexação são simulados nesta versão (sem integração real)."
          className="shrink-0 rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-700"
        >
          Demo
        </span>
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
              arrastando ? "border-blue-500 bg-blue-50" : "border-blue-300 bg-blue-50/30 hover:bg-blue-50/60"
            }`}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
              <FileUp className="size-5" aria-hidden="true" />
            </span>
            <p className="text-[13px] text-slate-500">
              <strong className="font-semibold text-slate-900">Arraste seu arquivo para cá</strong> ou{" "}
              <span className="font-medium text-blue-600 underline-offset-2 hover:underline">
                busque no computador
              </span>
            </p>
            <p className="max-w-xs text-[11.5px] leading-snug text-slate-400">
              Suporta PDF pesquisável, XML (NF-e/CT-e), PNG, JPG ou TIFF (até {LIMITE_ARQUIVO_MB}MB)
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["PDF/A-1b", "XML NFe", "SHA-256"].map((etiqueta) => (
                <span
                  key={etiqueta}
                  className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500"
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
            <p role="alert" className="mt-2 text-[12px] text-red-600">
              {erroUpload ?? erroObrigatorio}
            </p>
          )}
        </div>

        {/* Arquivos em custódia */}
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Arquivo em custódia ({arquivos.length})
          </h3>

          {arquivos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-[12.5px] text-slate-400">
              Nenhum arquivo anexado. Envie o documento para habilitar a extração de metadados.
            </p>
          ) : (
            <ul className="space-y-3">
              {arquivos.map((arq) => {
                const extraindo = arq.status === "extraindo";
                return (
                  <li key={arq.id} className="rounded-xl border border-line bg-white">
                    <div className="flex items-center gap-3 p-3.5">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                          arq.extensao === "PDF" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
                        }`}
                        aria-hidden="true"
                      >
                        {arq.extensao}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-900" title={arq.nome}>
                          {arq.nome}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] text-slate-500">
                          {arq.extensao} • {formatarTamanho(arq.tamanho)}
                          <span aria-hidden="true">•</span>
                          {extraindo ? (
                            <span className="inline-flex items-center gap-1 text-blue-600">
                              <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
                              Extraindo...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                              <Check className="size-3" aria-hidden="true" />
                              Extração Concluída
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => onVisualizar(arq.id)}
                          aria-label={`Visualizar ${arq.nome}`}
                          className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemover(arq.id)}
                          aria-label={`Remover ${arq.nome}`}
                          className="rounded-md p-1.5 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-line px-3.5 pb-3.5 pt-3">
                      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                          Metadados extraídos via OCR:
                        </h4>
                        {arq.ocrConfirmado ? (
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                            <Check className="size-3.5" aria-hidden="true" />
                            Confirmado
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={extraindo}
                            onClick={() => onConfirmarOcr(arq.id)}
                            className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-300"
                          >
                            <CheckCheck className="size-3.5" aria-hidden="true" />
                            Confirmar todos com 1 clique
                          </button>
                        )}
                      </div>

                      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {CAMPOS_OCR.map((campo) => (
                          <div key={campo.rotulo} className="rounded-lg border border-line px-3 py-2">
                            <dt className="text-[11px] text-slate-400">{campo.rotulo}</dt>
                            <dd
                              className={`mt-0.5 truncate font-mono text-[11.5px] font-bold ${
                                extraindo
                                  ? "text-slate-300"
                                  : campo.destaque
                                    ? "text-emerald-600"
                                    : "text-slate-900"
                              }`}
                            >
                              {extraindo ? "••••••••••" : campo.valor}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-2 text-[11px] text-slate-400">
                        Valores de demonstração: nenhuma leitura real do arquivo é feita. Ao confirmar, o
                        vencimento e o protocolo são aplicados ao formulário.
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Assinatura digital e integridade */}
        <section aria-labelledby="assinatura-titulo" className="rounded-xl border border-line p-4">
          <h3 id="assinatura-titulo" className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-900">
            <BadgeCheck className="size-4 text-blue-600" aria-hidden="true" />
            Assinatura Digital &amp; ICP-Brasil
          </h3>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <span className="mt-0.5">
                <Caixa {...register("assinaturaCertificado")} />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-slate-900">
                  Assinado via certificado e-CNPJ A1 da Matriz
                </span>
                <span className="block text-[11.5px] text-slate-400">
                  Validade jurídica plena conforme MP 2.200-2/2001 e auditoria forense.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <span className="mt-0.5">
                <Caixa {...register("carimboTempo")} />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-slate-900">
                  Carimbo de tempo homologado ACT Observatório
                </span>
                <span className="block text-[11.5px] text-slate-400">
                  Garante a imutabilidade cronológica e irretratabilidade do upload.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-line bg-slate-50 px-3 py-2.5">
            <Fingerprint className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-600">
              SHA-256: {textoHash}
            </p>
            <button
              type="button"
              onClick={copiarHash}
              disabled={!hash || hash === "indisponivel"}
              className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              {copiado ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            O hash SHA-256 é calculado de fato no seu navegador a partir do primeiro arquivo. A assinatura
            e o carimbo de tempo são demonstrativos: não há integração com autoridade certificadora.
          </p>
        </section>
      </div>
    </Card>
  );
}
