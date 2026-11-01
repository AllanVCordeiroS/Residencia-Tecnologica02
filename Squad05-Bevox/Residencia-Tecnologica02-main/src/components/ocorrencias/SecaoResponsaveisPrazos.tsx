import { Calendar, Flag, Timer, User, Users } from "lucide-react";
import Campo from "./Campo";
import InputComIcone from "./InputComIcone";
import { EQUIPES, PRIORIDADES, RESPONSAVEIS } from "./opcoes";
import SecaoCard from "./SecaoCard";
import SelectComIcone from "./SelectComIcone";
import TarefaVinculada from "./TarefaVinculada";

export default function SecaoResponsaveisPrazos() {
  return (
    <SecaoCard
      id="secao-responsaveis"
      icon={Timer}
      titulo="3. Responsáveis e prazos"
      descricao="Defina quem será responsável e os prazos para resolução da ocorrência."
    >
      <div className="space-y-6">
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Campo id="responsavel" label="Responsável pela ocorrência" obrigatorio>
            <SelectComIcone
              id="responsavel"
              name="responsavel"
              icon={User}
              placeholder="Selecione o responsável"
              options={RESPONSAVEIS}
              required
            />
          </Campo>

          <Campo id="equipe" label="Equipe responsável (opcional)">
            <SelectComIcone
              id="equipe"
              name="equipe"
              icon={Users}
              placeholder="Selecione a equipe"
              options={EQUIPES}
            />
          </Campo>

          <Campo id="dataLimite" label="Data limite para resolução" obrigatorio>
            <InputComIcone
              id="dataLimite"
              name="dataLimite"
              icon={Calendar}
              type="date"
              defaultValue="2026-04-17"
            />
          </Campo>

          <Campo id="prioridade" label="Prioridade de atendimento" obrigatorio>
            <SelectComIcone
              id="prioridade"
              name="prioridade"
              icon={Flag}
              placeholder="Selecione a prioridade"
              options={PRIORIDADES}
              defaultValue="Alta"
              required
            />
          </Campo>
        </div>

        <TarefaVinculada />
      </div>
    </SecaoCard>
  );
}