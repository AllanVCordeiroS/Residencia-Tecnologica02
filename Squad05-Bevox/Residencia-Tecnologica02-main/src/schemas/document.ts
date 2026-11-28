import * as z from "zod";

import {
  ALERTA_IDS,
  CANAL_IDS,
  CONFIDENCIALIDADE_IDS,
} from "@/data/documentFormOptions";

export const documentSchema = z
  .object({
    titulo: z.string().trim().min(3, "Informe o nome do documento (mín. 3 caracteres)"),
    categoria: z.string().min(1, "A categoria é obrigatória"),
    unidade: z.string().min(1, "Selecione a unidade vinculada"),
    orgaoEmissor: z.string().trim().min(3, "Informe o órgão emissor"),
    protocolo: z.string().trim().min(3, "Informe o nº do protocolo / registro oficial"),
    dataEmissao: z.string().min(1, "Data de emissão obrigatória"),
    prazoIndeterminado: z.boolean(),
    dataVencimento: z.string().optional(),
    alertas: z.array(z.enum(ALERTA_IDS)),
    canais: z.array(z.enum(CANAL_IDS)),
    gestor: z.string().min(1, "Selecione o gestor custodiante"),
    confidencialidade: z.enum(CONFIDENCIALIDADE_IDS),
    observacoes: z.string().max(500, "Máximo de 500 caracteres"),
    assinaturaCertificado: z.boolean(),
    carimboTempo: z.boolean(),
  })
  .superRefine((dados, ctx) => {
    if (dados.prazoIndeterminado) return;

    if (!dados.dataVencimento) {
      ctx.addIssue({
        code: "custom",
        message: "Data de vencimento obrigatória",
        path: ["dataVencimento"],
      });
    } else if (
      dados.dataEmissao &&
      new Date(dados.dataVencimento) <= new Date(dados.dataEmissao)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "O vencimento deve ser posterior à emissão",
        path: ["dataVencimento"],
      });
    }

    if (dados.alertas.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione ao menos um alerta preventivo",
        path: ["alertas"],
      });
    }
    if (dados.canais.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione ao menos um canal de notificação",
        path: ["canais"],
      });
    }
  });

export type DocumentFormValues = z.infer<typeof documentSchema>;

export const VALORES_PADRAO: DocumentFormValues = {
  titulo: "",
  categoria: "",
  unidade: "",
  orgaoEmissor: "",
  protocolo: "",
  dataEmissao: "",
  prazoIndeterminado: false,
  dataVencimento: "",
  alertas: ["60", "30", "15", "5"],
  canais: ["email", "whatsapp", "erp"],
  gestor: "",
  confidencialidade: "confidencial_diretoria",
  observacoes: "",
  assinaturaCertificado: true,
  carimboTempo: true,
};

export const documentStatusSchema = z.enum([
  "Atenção",
  "Aprovado",
  "Vencido",
  "Em análise",
  "Pendente",
]);
export const documentFileTypeSchema = z.enum(["PDF", "XLSX", "XML", "PNG", "JPG", "JPEG", "TIF", "TIFF"]);
export const unitTypeSchema = z.enum(["Filial", "Matriz"]);
export const dueLevelSchema = z.enum(["critical", "warning"]);

export const legalDocumentSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  unit: z.string(),
  unitType: unitTypeSchema,
  responsible: z.string(),
  dueDate: z.string().nullable(),
  dueText: z.string(),
  dueLevel: dueLevelSchema.optional(),
  status: documentStatusSchema,
  fileSize: z.string(),
  fileType: documentFileTypeSchema,
  fileUrl: z.string().optional(),
  unitId: z.string().optional(),
  formValues: documentSchema.optional(),
});

export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export type DocumentFileType = z.infer<typeof documentFileTypeSchema>;
export type UnitType = z.infer<typeof unitTypeSchema>;
export type DueLevel = z.infer<typeof dueLevelSchema>;
export type LegalDocument = z.infer<typeof legalDocumentSchema>;
