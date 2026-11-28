import { collaboratorDetailsSchema, createCollaboratorRegistrationSchema, type RegistrationPasswordPolicy } from "@/schemas/collaborator";
import { DEFAULT_SECURITY_SETTINGS, securitySettingsSchema } from "@/services/settingsSchemas";
import { readSettings } from "@/services/settings";
import { getOperationalUnits } from "@/services/units";
import { insertCollaboratorRequestDemo } from "@/services/users";

export function readRegistrationPasswordPolicy(): RegistrationPasswordPolicy {
  if (typeof window === "undefined") return structuredClone(DEFAULT_SECURITY_SETTINGS);
  return readSettings("bevox.settings.security", securitySettingsSchema, DEFAULT_SECURITY_SETTINGS);
}

export async function registerCollaboratorDemo(input: unknown) {
  // A política é reavaliada no envio. Dados de senha existem apenas nesta validação;
  // o armazenamento compartilhado e o retorno recebem exclusivamente dados não secretos.
  const parsed = createCollaboratorRegistrationSchema(readRegistrationPasswordPolicy()).parse(input);
  const units = await getOperationalUnits();
  const unit = units.find((item) => item.id === parsed.unidadeId && item.ativa !== false);
  if (!unit) throw new Error("Esta unidade não está disponível. Atualize as unidades e tente novamente.");
  return insertCollaboratorRequestDemo(collaboratorDetailsSchema.parse(parsed), unit);
}
