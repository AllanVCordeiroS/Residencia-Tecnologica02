import { CircleCheckIcon } from "@/components/backoffice/icons";
import Field from "./Field";
import { inputClass } from "./inputStyles";
import SelectInput from "./SelectInput";

const REGIMES = [
  "TARE Bebidas PE (Incentivo)",
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
];

export default function DadosFiscais() {
  return (
    <div className="space-y-5">
      {/* CNPJ */}
      <div>
        <Field id="cnpj" label="CNPJ da Nova Unidade" required>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            inputMode="numeric"
            defaultValue="00.000.000/0009-00"
            className={inputClass}
          />
        </Field>

        {/* Mensagem fixa de exemplo; a validação real depende do banco/API. */}
        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
          <CircleCheckIcon className="h-3.5 w-3.5 shrink-0" />
          CNPJ ativo e regular perante a SEFAZ Pernambuco (Base Sintegra
          validada).
        </p>
      </div>

      {/* Identificador e nome fantasia */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="identificador"
          label="Identificador Operacional da Unidade"
          required
          hint="Nome amigável utilizado em relatórios e rotas."
        >
          <input
            id="identificador"
            name="identificador"
            type="text"
            defaultValue="CDD Olinda 2 - Bultrins"
            className={inputClass}
          />
        </Field>

        <Field
          id="nomeFantasia"
          label="Nome Fantasia Comercial"
          required
          hint="Nome comercial registrado na JUCELPE."
        >
          <input
            id="nomeFantasia"
            name="nomeFantasia"
            type="text"
            defaultValue="Adega Distribution Bultrins"
            className={inputClass}
          />
        </Field>
      </div>

      {/* Razão social */}
      <Field id="razaoSocial" label="Razão Social Completa" required>
        <input
          id="razaoSocial"
          name="razaoSocial"
          type="text"
          defaultValue="Adega Distribuição e Logística de Bebidas PE Ltda."
          className={inputClass}
        />
      </Field>

      {/* Inscrições e regime tributário */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="ie" label="Inscrição Estadual (IE)" required>
          <input
            id="ie"
            name="ie"
            type="text"
            inputMode="numeric"
            defaultValue="0528491-92"
            className={inputClass}
          />
        </Field>

        <Field id="im" label="Inscrição Municipal (IM)">
          <input
            id="im"
            name="im"
            type="text"
            inputMode="numeric"
            defaultValue="984210"
            className={inputClass}
          />
        </Field>

        <Field id="regime" label="Regime Tributário PE" required>
          <SelectInput
            id="regime"
            name="regime"
            options={REGIMES}
            defaultValue={REGIMES[0]}
          />
        </Field>
      </div>
    </div>
  );
}