import { z } from "zod";
import { COLLABORATOR_DEPARTMENTS, COLLABORATOR_JOBS } from "@/data/collaboratorOptions";
import { DEFAULT_SECURITY_SETTINGS, securitySettingsSchema } from "@/services/settingsSchemas";

export type RegistrationPasswordPolicy = z.infer<typeof securitySettingsSchema>;

export const collaboratorDetailsSchema = z.object({
  nome: z.string().trim().min(3, "Informe nome e sobrenome.").max(160, "Use até 160 caracteres.").transform((value) => value.replace(/\s+/g, " "))
    .refine((value) => value.split(" ").filter((part) => /\p{L}/u.test(part)).length >= 2, "Informe nome e sobrenome."),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(254),
  telefone: z.string().trim().refine((value) => /^[\d\s()+-]+$/.test(value) && /^[1-9]{2}[2-9]\d{7,8}$/.test(value.replace(/\D/g, "")), "Informe um telefone com DDD e 10 ou 11 dígitos."),
  cargo: z.string().refine((value) => COLLABORATOR_JOBS.includes(value), "Selecione um cargo disponível."),
  unidadeId: z.string().min(1, "Selecione sua unidade."),
  departamento: z.string().refine((value) => COLLABORATOR_DEPARTMENTS.some((item) => item === value), "Selecione seu departamento."),
  aceiteAcesso: z.boolean().refine(Boolean, "Confirme as diretrizes de acesso corporativo."),
  aceitePrivacidade: z.boolean().refine(Boolean, "Confirme a Política de Privacidade LGPD."),
});

export function passwordRequirements(policy: RegistrationPasswordPolicy = DEFAULT_SECURITY_SETTINGS) {
  return `Use de ${parseInt(policy.minimum, 10)} a 128 caracteres${policy.exigirMaiusculas ? ", com letra maiúscula" : ""}${policy.exigirSimbolos ? ", número e símbolo" : ""}.`;
}

export function passwordMatchesPolicy(value: string, policy: RegistrationPasswordPolicy = DEFAULT_SECURITY_SETTINGS) {
  return value.length >= parseInt(policy.minimum, 10) && value.length <= 128
    && (!policy.exigirMaiusculas || /\p{Lu}/u.test(value))
    && (!policy.exigirSimbolos || (/\d/.test(value) && /[^\p{L}\p{N}\s]/u.test(value)));
}

export function createCollaboratorRegistrationSchema(policy: RegistrationPasswordPolicy = DEFAULT_SECURITY_SETTINGS) {
  return collaboratorDetailsSchema.extend({
    senha: z.string().refine((value) => passwordMatchesPolicy(value, policy), passwordRequirements(policy)),
    confirmarSenha: z.string().min(1, "Confirme sua senha."),
  }).refine((value) => value.senha === value.confirmarSenha, { path: ["confirmarSenha"], message: "As senhas não coincidem." });
}

export type CollaboratorRegistrationValues = z.infer<ReturnType<typeof createCollaboratorRegistrationSchema>>;
export type CollaboratorDetails = z.infer<typeof collaboratorDetailsSchema>;

export function passwordStrength(value: string, policy: RegistrationPasswordPolicy = DEFAULT_SECURITY_SETTINGS) {
  const variety = [/[\p{Ll}]/u, /[\p{Lu}]/u, /\d/, /[^\p{L}\p{N}\s]/u].filter((pattern) => pattern.test(value)).length;
  const level = !value ? 0 : !passwordMatchesPolicy(value, policy) ? (value.length < 6 ? 1 : 2) : value.length >= 12 && variety === 4 ? 4 : 3;
  return { level, label: ["Informe uma senha", "Muito fraca", "Fraca", "Média", "Forte"][level] };
}

export function formatBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  const subscriber = digits.slice(2);
  const split = subscriber.length > 8 ? 5 : 4;
  return `(${digits.slice(0, 2)}) ${subscriber.slice(0, split)}${subscriber.length > split ? `-${subscriber.slice(split)}` : ""}`;
}
