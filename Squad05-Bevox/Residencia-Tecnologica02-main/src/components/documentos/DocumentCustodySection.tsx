"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Lock, UserRoundCog } from "lucide-react";

import {
  CONFIDENCIALIDADE_DOCUMENTO,
  GESTORES_DOCUMENTO,
} from "@/data/documentFormOptions";
import type { DocumentFormValues } from "./documentFormSchema";
import {
  atributosDeErro,
  Campo,
  INPUT_CLASSE,
  RadioPonto,
  SecaoCard,
  Selecao,
} from "./DocumentFormUi";

/** Seção 3 — Custódia & Responsabilidade Técnica. */
export default function DocumentCustodySection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DocumentFormValues>();

  const gestor = useWatch({ control, name: "gestor" });
  const nivel = useWatch({ control, name: "confidencialidade" });
  const observacoes = useWatch({ control, name: "observacoes" }) ?? "";
  const departamento = GESTORES_DOCUMENTO.find((g) => g.rotulo === gestor)?.departamento ?? "";

  return (
    <SecaoCard
      id="secao-custodia"
      numero={3}
      tile="bg-indigo-50 text-indigo-600"
      icone={<UserRoundCog className="size-[18px]" aria-hidden="true" />}
      titulo="Custódia & Responsabilidade Técnica"
      subtitulo="Gestor responsável, alçada de segurança e nível de confidencialidade"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="gestor" rotulo="Gestor Custodiante" obrigatorio erro={errors.gestor?.message}>
          <Selecao {...register("gestor")} {...atributosDeErro("gestor", errors.gestor?.message)}>
            <option value="">Selecione o gestor</option>
            {GESTORES_DOCUMENTO.map((g) => (
              <option key={g.rotulo} value={g.rotulo}>
                {g.rotulo}
              </option>
            ))}
          </Selecao>
        </Campo>

        <Campo id="departamento" rotulo="Departamento Vinculado">
          {/* Preenchido automaticamente a partir do gestor; não é editável nem enviado. */}
          <input
            id="departamento"
            readOnly
            value={departamento}
            placeholder="Definido pelo gestor custodiante"
            className={INPUT_CLASSE}
          />
        </Campo>
      </div>

      <div role="group" aria-labelledby="confidencialidade-titulo" className="mt-5 min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <span id="confidencialidade-titulo" className="text-[13px] font-medium text-slate-800">
            Nível de Confidencialidade &amp; Acesso Restrito
          </span>
          <Lock className="size-3.5 text-slate-400" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {CONFIDENCIALIDADE_DOCUMENTO.map((opcao) => {
            const ativo = nivel === opcao.id;
            return (
              <label
                key={opcao.id}
                className={`flex cursor-pointer flex-col gap-1.5 rounded-lg border p-3 transition ${
                  ativo ? "border-blue-500 bg-blue-50/60" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className={`text-[13px] font-semibold ${ativo ? "text-blue-700" : "text-slate-900"}`}>
                    {opcao.titulo}
                  </span>
                  <RadioPonto value={opcao.id} {...register("confidencialidade")} />
                </span>
                <span className={`text-[11.5px] leading-snug ${ativo ? "text-blue-600" : "text-slate-400"}`}>
                  {opcao.descricao}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <Campo
        id="observacoes"
        rotulo="Notas Regulatórias & Observações de Homologação"
        erro={errors.observacoes?.message}
        className="mt-5"
      >
        <textarea
          {...register("observacoes")}
          {...atributosDeErro("observacoes", errors.observacoes?.message)}
          rows={2}
          maxLength={500}
          placeholder="Ex.: Alvará definitivo emitido após vistoria sanitária e aprovação de habite-se."
          className={`${INPUT_CLASSE} h-auto resize-y py-2.5 leading-snug`}
        />
        <p className="mt-1 text-right text-[11px] text-slate-400">{observacoes.length}/500</p>
      </Campo>
    </SecaoCard>
  );
}
