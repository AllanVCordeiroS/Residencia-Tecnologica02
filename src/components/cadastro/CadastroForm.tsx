import { AtSignIcon, PhoneIcon, UserIcon } from "@/components/login/icons";
import { CARGOS, DEPARTAMENTOS, UNIDADES } from "./options";
import SelectField from "./SelectField";
import TextField from "./TextField";

export default function CadastroForm() {
  return (
    <form noValidate className="mt-8 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextField
          id="nome"
          label="Nome Completo"
          type="text"
          autoComplete="name"
          placeholder="Ex.: Carlos Eduardo Silva"
          icon={<UserIcon className="h-4 w-4" />}
        />
      </div>

      <TextField
        id="email"
        label="E-mail Corporativo"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nome@bevox.com.br"
        icon={<AtSignIcon className="h-4 w-4" />}
      />

      <TextField
        id="telefone"
        label="Telefone / WhatsApp"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(81) 99999-0000"
        icon={<PhoneIcon className="h-4 w-4" />}
      />

      <SelectField
        id="cargo"
        label="Cargo / Função"
        placeholder="Selecione o cargo"
        options={CARGOS}
      />

      <SelectField
        id="unidade"
        label="Unidade de Trabalho"
        placeholder="Selecione a unidade"
        options={UNIDADES}
      />

      <div className="sm:col-span-2">
        <SelectField
          id="departamento"
          label="Departamento"
          placeholder="Selecione o departamento"
          options={DEPARTAMENTOS}
        />
      </div>
    </form>
  );
}