"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CircleCheck, FileText, Hash, Landmark } from "lucide-react";

import { categoryNames } from "@/data/mockDocuments";
import { UNIDADES_DOCUMENTO } from "@/data/documentFormOptions";
import type { DocumentFormValues } from "./documentFormSchema";
import { atributosDeErro, Campo, EntradaTexto, Selecao, SecaoCard } from "./DocumentFormUi";

/** Seção 1 — Metadados Fiscais & Regulatórios. */
export default function DocumentMetadataSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DocumentFormValues>();
  const titulo = useWatch({ control, name: "titulo" });
  const tituloValido = (titulo?.trim().length ?? 0) >= 3 && !errors.titulo;

  return (
    <SecaoCard
      id="secao-metadados"
      numero={1}
      tile="bg-blue-50 text-blue-600"
      icone={<FileText className="size-[18px]" aria-hidden="true" />}
      titulo="Metadados Fiscais & Regulatórios"
      subtitulo="Identificação legal, categorização do acervo e órgãos expedidores"
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <Campo
          id="titulo"
          rotulo="Nome do Documento / Título Identificador"
          obrigatorio
          erro={errors.titulo?.message}
          className="sm:col-span-2"
        >
          <EntradaTexto
            {...register("titulo")}
            {...atributosDeErro("titulo", errors.titulo?.message)}
            placeholder="Ex.: Alvará de Localização e Funcionamento 2026"
            autoComplete="off"
            icone={
              tituloValido ? (
                <CircleCheck className="size-[18px] text-emerald-500" aria-label="Campo válido" />
              ) : undefined
            }
          />
        </Campo>

        <Campo id="categoria" rotulo="Categoria Regulatória" obrigatorio erro={errors.categoria?.message}>
          <Selecao {...register("categoria")} {...atributosDeErro("categoria", errors.categoria?.message)}>
            <option value="">Selecione a categoria</option>
            {categoryNames.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </Selecao>
        </Campo>

        <Campo id="unidade" rotulo="Filial / Unidade Vinculada" obrigatorio erro={errors.unidade?.message}>
          <Selecao {...register("unidade")} {...atributosDeErro("unidade", errors.unidade?.message)}>
            <option value="">Selecione a unidade</option>
            {UNIDADES_DOCUMENTO.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </Selecao>
        </Campo>

        <Campo
          id="orgaoEmissor"
          rotulo="Órgão Emissor / Entidade Reguladora"
          obrigatorio
          erro={errors.orgaoEmissor?.message}
        >
          <EntradaTexto
            {...register("orgaoEmissor")}
            {...atributosDeErro("orgaoEmissor", errors.orgaoEmissor?.message)}
            placeholder="Ex.: Prefeitura Municipal de Paulista"
            autoComplete="off"
            icone={<Landmark className="size-4" aria-hidden="true" />}
          />
        </Campo>

        <Campo
          id="protocolo"
          rotulo="Nº do Protocolo / Registro Oficial"
          obrigatorio
          erro={errors.protocolo?.message}
        >
          <EntradaTexto
            {...register("protocolo")}
            {...atributosDeErro("protocolo", errors.protocolo?.message)}
            placeholder="PROT-2026-0000-XXXX"
            autoComplete="off"
            className="font-mono"
            icone={<Hash className="size-4" aria-hidden="true" />}
          />
        </Campo>
      </div>
    </SecaoCard>
  );
}
