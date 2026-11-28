import { z } from "zod";

export const operationalFormats = ["Filial / CDD Distribuição", "Ponto de Cross-Docking", "Hub Urbano Express", "Depósito Fechado"] as const;
export const taxRegimes = ["Simples Nacional", "Lucro Presumido", "Lucro Real"] as const;
export const trafficRestrictions = ["Sem restrição", "VUC e Caminhão Toco apenas", "Janela Noturna"] as const;
export const brazilStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;
export const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function isValidCnpj(value: string): boolean {
  if (!/^[\d.\/-]+$/.test(value)) return false;
  const digits = digitsOnly(value);
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  for (let size = 12; size <= 13; size++) {
    let sum = 0;
    let weight = size - 7;
    for (let i = 0; i < size; i++) {
      sum += Number(digits[i]) * weight--;
      if (weight < 2) weight = 9;
    }
    const remainder = sum % 11;
    if (Number(digits[size]) !== (remainder < 2 ? 0 : 11 - remainder)) return false;
  }
  return true;
}

const required = z.string().trim().min(1, "Campo obrigatório").max(200, "Use até 200 caracteres");
const quantity = z.number().finite().int("Informe uma quantidade inteira").min(0, "Não pode ser negativo").max(1_000_000);
const measure = z.number().finite().min(0, "Não pode ser negativo").max(1_000_000_000);
const phone = (length: number) => z.string().trim().refine((value) => /^[\d\s()+-]+$/.test(value) && digitsOnly(value).length === length && /^[1-9]{2}/.test(digitsOnly(value)), `Informe DDD e ${length - 2} dígitos`);

export const unitSchema = z.object({
  formatoOperacional: z.enum(operationalFormats, { error: "Selecione o formato operacional" }),
  cnpj: required.refine(isValidCnpj, "CNPJ inválido: confira os dígitos verificadores"),
  identificadorOperacional: required.regex(/^[\p{L}\d_-]+$/u, "Use letras, números, hífen ou sublinhado"),
  nome: required,
  razaoSocial: required,
  inscricaoEstadual: required.refine((value) => /^isento$/i.test(value) || /^\d{9}$|^\d{14}$/.test(digitsOnly(value)) && /^[\d.\/-]+$/.test(value), "Informe IE de Pernambuco com 9 ou 14 dígitos, ou ISENTO"),
  inscricaoMunicipal: z.string().trim().max(30).refine((value) => !value || /^isento$/i.test(value) || /^[\d.\/-]+$/.test(value), "Informe números ou ISENTO"),
  regimeTributario: z.enum(taxRegimes, { error: "Selecione o regime tributário" }),
  cep: required.regex(/^\d{5}-?\d{3}$/, "CEP deve conter 8 dígitos"),
  logradouro: required,
  numero: required,
  complemento: z.string().trim().max(200),
  bairro: required,
  municipio: required,
  uf: z.enum(brazilStates),
  poloLogistico: required,
  restricaoTrafego: z.enum(trafficRestrictions),
  areaArmazenagem: measure.positive("Informe a área de armazenagem"),
  peDireito: measure.positive("Informe o pé-direito útil"),
  capacidadePaletes: quantity,
  camaraFria: z.boolean(),
  metragemRefrigerada: measure,
  docas: quantity,
  niveladorasHidraulicas: z.boolean(),
  frotaToco: quantity,
  frotaCarretas: quantity,
  frotaVuc: quantity,
  responsavelId: required,
  emailOperacional: required.email("E-mail inválido"),
  telefoneFixo: phone(10),
  celularPlantao: phone(11).refine((value) => digitsOnly(value)[2] === "9", "Celular deve começar com 9 após o DDD"),
}).superRefine((value, ctx) => {
  if (value.camaraFria && value.metragemRefrigerada <= 0) ctx.addIssue({ code: "custom", path: ["metragemRefrigerada"], message: "Informe a área refrigerada" });
  if (!value.camaraFria && value.metragemRefrigerada !== 0) ctx.addIssue({ code: "custom", path: ["metragemRefrigerada"], message: "Sem câmara fria, a área refrigerada deve ser zero" });
  if (value.metragemRefrigerada > value.areaArmazenagem) ctx.addIssue({ code: "custom", path: ["metragemRefrigerada"], message: "A área refrigerada não pode exceder a área total" });
});

export type UnitFormValues = z.infer<typeof unitSchema>;
export const unitDefaults: UnitFormValues = {
  formatoOperacional: operationalFormats[0], cnpj: "", identificadorOperacional: "", nome: "", razaoSocial: "", inscricaoEstadual: "", inscricaoMunicipal: "", regimeTributario: "Lucro Real",
  cep: "", logradouro: "", numero: "", complemento: "", bairro: "", municipio: "", uf: "PE", poloLogistico: "", restricaoTrafego: "Sem restrição",
  areaArmazenagem: 0, peDireito: 0, capacidadePaletes: 0, camaraFria: false, metragemRefrigerada: 0, docas: 0, niveladorasHidraulicas: false, frotaToco: 0, frotaCarretas: 0, frotaVuc: 0,
  responsavelId: "", emailOperacional: "", telefoneFixo: "", celularPlantao: "",
};

export const unitStepFields: (keyof UnitFormValues)[][] = [
  ["formatoOperacional", "cnpj", "identificadorOperacional", "nome", "razaoSocial", "inscricaoEstadual", "inscricaoMunicipal", "regimeTributario"],
  ["cep", "logradouro", "numero", "complemento", "bairro", "municipio", "uf", "poloLogistico", "restricaoTrafego"],
  ["areaArmazenagem", "peDireito", "capacidadePaletes", "camaraFria", "metragemRefrigerada", "docas", "niveladorasHidraulicas", "frotaToco", "frotaCarretas", "frotaVuc"],
  ["responsavelId", "emailOperacional", "telefoneFixo", "celularPlantao"],
];
