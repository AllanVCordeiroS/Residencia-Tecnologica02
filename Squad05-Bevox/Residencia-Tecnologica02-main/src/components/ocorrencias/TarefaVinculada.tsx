"use client";

import { useState } from "react";
import { Calendar, User } from "lucide-react";
import Campo from "./Campo";
import InputComIcone from "./InputComIcone";
import Interruptor from "./Interruptor";
import { RESPONSAVEIS } from "./opcoes";
import SelectComIcone from "./SelectComIcone";

export default function TarefaVinculada() {
  const [criarTarefa, setCriarTarefa] = useState(true);

  return (
    <div className="space-y-5">
      <Interruptor
        id="criarTarefa"
        name="criarTarefa"
        label="Criar tarefa vinculada a esta ocorrência"
        descricao="Uma tarefa será criada automaticamente para acompanhar a resolução."
        checked={criarTarefa}
        onChange={setCriarTarefa}
      />

      {criarTarefa && (
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Campo id="responsavelTarefa" label="Responsável da tarefa" obrigatorio>
            <SelectComIcone
              id="responsavelTarefa"
              name="responsavelTarefa"
              icon={User}
              placeholder="Selecione o responsável"
              options={RESPONSAVEIS}
              required
            />
          </Campo>

          <Campo id="prazoTarefa" label="Prazo da tarefa" obrigatorio>
            <InputComIcone
              id="prazoTarefa"
              name="prazoTarefa"
              icon={Calendar}
              type="date"
              defaultValue="2026-04-24"
            />
          </Campo>
        </div>
      )}
    </div>
  );
}