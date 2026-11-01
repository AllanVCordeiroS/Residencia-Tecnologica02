/** Opções e constantes da tela "Novo Documento". Dados demonstrativos (sem backend). */

export const UNIDADES_DOCUMENTO = [
  "CDD Paulista — Unidade Operacional (PE)",
  "CDD Jaboatão — Unidade Operacional (PE)",
  "CDD Olinda — Unidade Operacional (PE)",
  "CDD Cabo — Unidade Operacional (PE)",
  "CDD Caruaru — Unidade Operacional (PE)",
  "Matriz — Recife (PE)",
] as const;

export const GESTORES_DOCUMENTO = [
  {
    rotulo: "Ana Souza — Diretoria Jurídica & Compliance",
    departamento: "Diretoria de Compliance & Relações Institucionais",
  },
  {
    rotulo: "Carlos Eduardo — Gerência Fiscal & Tributária",
    departamento: "Controladoria Fiscal e Tributária",
  },
  {
    rotulo: "Pedro Lima — Gerência Operacional",
    departamento: "Operações & Logística",
  },
  {
    rotulo: "Juliana Martins — Gerência Administrativa",
    departamento: "Administrativo & Facilities",
  },
] as const;

export const ALERTA_IDS = ["60", "30", "15", "5"] as const;
export const CANAL_IDS = ["email", "whatsapp", "erp"] as const;
export const CONFIDENCIALIDADE_IDS = [
  "restrito_unidade",
  "confidencial_diretoria",
  "corporativo_geral",
] as const;

export type TomAlerta = "azul" | "ambar" | "vermelho";

export const ALERTAS_DOCUMENTO: {
  id: (typeof ALERTA_IDS)[number];
  titulo: string;
  descricao: string;
  tom: TomAlerta;
}[] = [
  { id: "60", titulo: "60 dias", descricao: "Alerta preventivo", tom: "azul" },
  { id: "30", titulo: "30 dias", descricao: "Abertura chamado", tom: "azul" },
  { id: "15", titulo: "15 dias", descricao: "Nível crítico", tom: "ambar" },
  { id: "5", titulo: "5 dias", descricao: "Escalação diretiva", tom: "vermelho" },
];

export const CANAIS_DOCUMENTO: {
  id: (typeof CANAL_IDS)[number];
  rotulo: string;
  tom: "azul" | "verde" | "indigo";
}[] = [
  { id: "email", rotulo: "E-mail Corporativo", tom: "azul" },
  { id: "whatsapp", rotulo: "WhatsApp Gerencial", tom: "verde" },
  { id: "erp", rotulo: "Tarefas no ERP", tom: "indigo" },
];

export const CONFIDENCIALIDADE_DOCUMENTO: {
  id: (typeof CONFIDENCIALIDADE_IDS)[number];
  titulo: string;
  descricao: string;
}[] = [
  {
    id: "restrito_unidade",
    titulo: "Restrito à Unidade",
    descricao: "Operadores e gerentes da unidade vinculada",
  },
  {
    id: "confidencial_diretoria",
    titulo: "Confidencial Diretoria",
    descricao: "Acesso restrito ao Jurídico e C-Level",
  },
  {
    id: "corporativo_geral",
    titulo: "Corporativo Geral",
    descricao: "Visível para auditoria e toda a empresa",
  },
];

/** Upload */
export const EXTENSOES_ACEITAS = ["pdf", "xml", "png", "jpg", "jpeg", "tif", "tiff"] as const;
export const LIMITE_ARQUIVO_MB = 50;

/**
 * Valores fixos usados pela extração OCR SIMULADA. Não há integração real de OCR:
 * a tela apenas demonstra o fluxo de "extrair → conferir → confirmar".
 */
export const OCR_DEMONSTRATIVO = {
  cnpj: "00.000.000/0002-81",
  razaoSocial: "Adega Dist. Paulista",
  vencimentoIso: "2027-04-16",
  protocolo: "PROT-2026-9812",
  /** Tempo da extração simulada, em ms. */
  duracaoMs: 1400,
} as const;
