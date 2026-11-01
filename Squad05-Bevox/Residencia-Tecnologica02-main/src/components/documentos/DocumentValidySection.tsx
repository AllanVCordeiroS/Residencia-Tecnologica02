"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Bell, CalendarClock, Hourglass, Megaphone } from "lucide-react";

import {
  ALERTAS_DOCUMENTO,
  CANAIS_DOCUMENTO,
  type TomAlerta,
} from "@/data/documentFormOptions";
import type { DocumentFormValues } from "./documentFormSchema";
import { atributosDeErro, Caixa, Campo, INPUT_CLASSE, SecaoCard } from "./DocumentFormUi";

const CARTAO_ALERTA: Record<TomAlerta, { ativo: string; titulo: string; descricao: string }> = {
  azul: {
    ativo: "border-blue-200 bg-blue-50/60",
    titulo: "text-slate-900",
    descricao: "text-slate-400",
  },
  ambar: {
    ativo: "border-amber-300 bg-amber-50",
    titulo: "text-amber-800",
    descricao: "text-amber-700",
  },
  vermelho: {
    ativo: "border-red-300 bg-red-50",
    titulo: "text-slate-900",
    descricao: "font-semibold text-red-600",
  },
};

/** Seção 2 — Vigência & Régua de Notificação Inteligente. */
export default function DocumentValiditySection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DocumentFormValues>();

  const indeterminado = useWatch({ control, name: "prazoIndeterminado" });
  const alertasAtivos = useWatch({ control, name: "alertas" }) ?? [];
  const canaisAtivos = useWatch({ control, name: "canais" }) ?? [];

  return (
    <SecaoCard
      id="secao-vigencia"
      numero={2}
      tile="bg-amber-50 text-amber-600"
      icone={<CalendarClock className="size-[18px]" aria-hidden="true" />}
      titulo="Vigência & Régua de Notificação Inteligente"
      subtitulo="SLA de renovação, datas limites e canais automáticos de disparo"
    >
      <div className="rounded-xl border border-line bg-slate-50/70 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
            <Hourglass className="size-4 text-blue-600" aria-hidden="true" />
            Ciclo de Validade Regulamentar
          </h3>

          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-slate-600">
            <span className="relative inline-flex h-5 w-9 shrink-0">
              <input
                type="checkbox"
                role="switch"
                {...register("prazoIndeterminado")}
                className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-blue-600"
              />
              <span
                aria-hidden="true"
                className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4"
              />
            </span>
            Prazo indeterminado
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="dataEmissao" rotulo="Data de Emissão" obrigatorio erro={errors.dataEmissao?.message}>
            <input
              type="date"
              {...register("dataEmissao")}
              {...atributosDeErro("dataEmissao", errors.dataEmissao?.message)}
              className={INPUT_CLASSE}
            />
          </Campo>

          <Campo
            id="dataVencimento"
            rotulo="Data de Vencimento / Validade"
            obrigatorio={!indeterminado}
            erro={errors.dataVencimento?.message}
          >
            <input
              type="date"
              {...register("dataVencimento")}
              {...atributosDeErro("dataVencimento", errors.dataVencimento?.message)}
              disabled={indeterminado}
              className={INPUT_CLASSE}
            />
          </Campo>
        </div>
      </div>

      {/* fieldset desabilitado não altera os valores do formulário, só bloqueia a interação */}
      <fieldset disabled={indeterminado} className="mt-5 min-w-0 disabled:opacity-60">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
            <Bell className="size-4 text-amber-500" aria-hidden="true" />
            Régua de Alertas Preventivos Configurável
          </h3>
          <span className="text-[11.5px] text-slate-400">Disparo multicanal automático</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {ALERTAS_DOCUMENTO.map((alerta) => {
            const ativo = alertasAtivos.includes(alerta.id);
            const estilo = CARTAO_ALERTA[alerta.tom];
            return (
              <label
                key={alerta.id}
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition ${
                  ativo ? estilo.ativo : "border-slate-200 bg-white"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`text-[13px] font-semibold ${ativo ? estilo.titulo : "text-slate-500"}`}>
                    {alerta.titulo}
                  </span>
                  <Caixa
                    tom={alerta.tom}
                    value={alerta.id}
                    {...register("alertas")}
                    aria-label={`Alerta ${alerta.titulo} antes do vencimento`}
                  />
                </span>
                <span className={`text-[11.5px] ${ativo ? estilo.descricao : "text-slate-400"}`}>
                  {alerta.descricao}
                </span>
              </label>
            );
          })}
        </div>
        {errors.alertas?.message && (
          <p role="alert" className="mt-1.5 text-[12px] text-red-600">
            {errors.alertas.message}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-line bg-slate-50/70 px-3.5 py-2.5">
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-800">
            <Megaphone className="size-4 text-blue-600" aria-hidden="true" />
            Canais ativos:
          </span>
          {CANAIS_DOCUMENTO.map((canal) => (
            <label key={canal.id} className="flex cursor-pointer items-center gap-2 text-[12.5px] text-slate-600">
              <Caixa tom={canal.tom} value={canal.id} {...register("canais")} />
              {canal.rotulo}
            </label>
          ))}
        </div>
        {errors.canais?.message && (
          <p role="alert" className="mt-1.5 text-[12px] text-red-600">
            {errors.canais.message}
          </p>
        )}
        {canaisAtivos.length > 0 && indeterminado && (
          <p className="mt-2 text-[11.5px] text-slate-400">
            Alertas desativados: documentos de prazo indeterminado não possuem vencimento.
          </p>
        )}
      </fieldset>
    </SecaoCard>
  );
}
