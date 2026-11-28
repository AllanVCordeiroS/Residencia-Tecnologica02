import { z } from "zod";
import { parametrosFinanceirosSchema } from "@/schemas/finance";

const required = z.string().trim().min(1).max(200);
export const companySettingsSchema = z.object({
  razao: required, email: z.email(), fantasia: required, endereco: required,
  cnpj: z.string().refine((value) => value.replace(/\D/g, "").length === 14),
  bairro: z.string().max(200), inscricao: z.string().max(100), cidade: required,
  estado: z.enum(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]),
  cep: z.string().refine((value) => /^\d{8}$/.test(value.replace(/\D/g, ""))),
  telefone: z.string().refine((value) => /^\d{10,11}$/.test(value.replace(/\D/g, ""))),
  logo: z.string().nullable().refine((value) => value === null || /^data:image\/(png|jpeg);base64,/.test(value)),
});
export const DEFAULT_COMPANY_SETTINGS: z.infer<typeof companySettingsSchema> = {
  razao: "Adega Distribution Ltda.", email: "contato@adegadistribution.com.br", fantasia: "Adega Distribution", endereco: "Av. Recife, 1000", cnpj: "12.345.678/0001-90", bairro: "Boa Viagem", inscricao: "123.456.789", cidade: "Recife", estado: "PE", cep: "51021-000", telefone: "(81) 3123-4567", logo: null,
};
export const notificationEventSchema = z.object({
  id: required, evento: required, descricao: required,
  email: z.boolean(), sistema: z.boolean(), whatsapp: z.boolean(),
  frequencia: z.enum(["Imediato", "7 dias antes", "Diário"]),
});
export const notificationSettingsSchema = z.object({
  emailActive: z.boolean(), sistemaActive: z.boolean(), whatsappActive: z.boolean(),
  selectedDays: z.array(z.enum(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"])).min(1),
  horario: z.enum(["06:00", "08:00", "12:00", "18:00"]), preferences: z.array(notificationEventSchema),
});
export const securitySettingsSchema = z.object({
  selected2FA: z.enum(["Aplicativo", "E-mail", "SMS"]), exigirMaiusculas: z.boolean(), exigirSimbolos: z.boolean(),
  expiry: z.enum(["8 horas", "4 horas", "1 hora"]), minimum: z.enum(["8 caracteres", "10 caracteres"]),
  attempts: z.enum(["5 tentativas", "3 tentativas"]), lockout: z.enum(["15 minutos", "30 minutos"]),
});
export const DEFAULT_SECURITY_SETTINGS: z.infer<typeof securitySettingsSchema> = { selected2FA: "Aplicativo", exigirMaiusculas: true, exigirSimbolos: true, expiry: "8 horas", minimum: "8 caracteres", attempts: "5 tentativas", lockout: "15 minutos" };
export const financialSettingsSchema = parametrosFinanceirosSchema.superRefine((value, context) => {
  const invalid = !value.configuracaoGeral.simboloMonetario.trim() || !value.configuracaoGeral.simboloMonetarioAlternativo.trim()
    || value.configuracaoGeral.moedas.some((item) => !Number.isFinite(item.taxaConversao) || item.taxaConversao <= 0 || Number.isNaN(Date.parse(item.dataAvaliacaoHistorica)))
    || value.categorias.some((item) => !item.nome.trim())
    || new Set(value.categorias.map((item) => item.nome.trim().toLocaleLowerCase("pt-BR"))).size !== value.categorias.length
    || ![7, 15, 30, 45, 60].includes(value.regras.prazoPadraoFornecedoresDias);
  if (invalid) context.addIssue({ code: "custom", message: "Revise os símbolos, taxas de conversão, prazos e categorias (nomes obrigatórios e únicos)." });
});
