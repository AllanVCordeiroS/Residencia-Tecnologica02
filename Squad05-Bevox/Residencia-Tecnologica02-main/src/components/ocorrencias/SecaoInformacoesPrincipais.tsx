import {
  Building2,
  Calendar,
  ClipboardList,
  Clock,
  SquarePen,
  Tag,
  TriangleAlert,
  Type,
} from "lucide-react";
import AreaTextoContador from "./AreaTextoContador";
import Campo from "./Campo";
import InputComIcone from "./InputComIcone";
import { CATEGORIAS, GRAVIDADES, TIPOS_OCORRENCIA, UNIDADES } from "./opcoes";
import SecaoCard from "./SecaoCard";
import SelectComIcone from "./SelectComIcone";

export default function SecaoInformacoesPrincipais() {
  return (
    <SecaoCard
      id="secao-informacoes"
      icon={SquarePen}
      titulo="1. Informações principais"
      descricao="Preencha os dados básicos da ocorrência."
    >
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Campo id="tipo" label="Tipo de ocorrência" obrigatorio>
          <SelectComIcone
            id="tipo"
            name="tipo"
            icon={ClipboardList}
            placeholder="Selecione o tipo"
            options={TIPOS_OCORRENCIA}
            required
          />
        </Campo>

        <Campo id="categoria" label="Categoria" obrigatorio>
          <SelectComIcone
            id="categoria"
            name="categoria"
            icon={Tag}
            placeholder="Selecione a categoria"
            options={CATEGORIAS}
            required
          />
        </Campo>

        <Campo id="unidade" label="Unidade" obrigatorio>
          <SelectComIcone
            id="unidade"
            name="unidade"
            icon={Building2}
            placeholder="Selecione a unidade"
            options={UNIDADES}
            required
          />
        </Campo>

        <Campo id="gravidade" label="Gravidade" obrigatorio>
          <SelectComIcone
            id="gravidade"
            name="gravidade"
            icon={TriangleAlert}
            placeholder="Selecione a gravidade"
            options={GRAVIDADES}
            required
          />
        </Campo>

        <Campo id="titulo" label="Título" obrigatorio>
          <InputComIcone
            id="titulo"
            name="titulo"
            icon={Type}
            type="text"
            maxLength={120}
            defaultValue="Divergência no recebimento de mercadorias"
          />
        </Campo>

        <Campo id="data" label="Data e hora da ocorrência" obrigatorio>
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-2">
            <InputComIcone
              id="data"
              name="data"
              icon={Calendar}
              type="date"
              defaultValue="2026-04-17"
            />
            <InputComIcone
              id="hora"
              name="hora"
              icon={Clock}
              type="time"
              defaultValue="10:30"
              aria-label="Hora da ocorrência"
            />
          </div>
        </Campo>

        <div className="sm:col-span-2">
          <Campo id="descricao" label="Descrição" obrigatorio>
            <AreaTextoContador
              id="descricao"
              name="descricao"
              max={1000}
              placeholder="Descreva o que aconteceu, o impacto e outras informações relevantes..."
            />
          </Campo>
        </div>
      </div>
    </SecaoCard>
  );
}