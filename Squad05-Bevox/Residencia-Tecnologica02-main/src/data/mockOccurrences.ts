import type { Occurrence } from "@/types/occurrence";

/** Registros exclusivamente demonstrativos; não representam dados de produção. */
export const mockOccurrences: Occurrence[] = [
  {
    id: "occ-9841", protocol: "OC-9841", kind: "Avaria de Carga", category: "Logística",
    unitId: "uo1", unitName: "Matriz – Recife", severity: "Alta", title: "Quebra de 14 caixas de Vinho Tinto Regional na Doca 03",
    description: "Quebra de caixas identificada durante a movimentação da carga na doca 03.", eventDate: "2026-04-17", eventTime: "09:38",
    registeredAt: "2026-04-17T09:38:00-03:00", owner: "Carlos Eduardo", driver: "Carlos Eduardo", team: "Operações",
    resolutionDeadline: "2026-04-20", priority: "Alta", status: "Em Análise", observations: "Aguardando conferência do estoque.", attachments: [], images: [], demonstrative: true,
  },
  {
    id: "occ-9838", protocol: "OC-9838", kind: "Divergência Fiscal", category: "Fiscal",
    unitId: "uo2", unitName: "Unidade Paulista", severity: "Média", title: "Divergência de 20 engradados Chopp Ambev vs XML NF-e",
    description: "Quantidade recebida diverge do documento fiscal eletrônico informado pelo fornecedor.", eventDate: "2026-04-17", eventTime: "08:15",
    registeredAt: "2026-04-17T08:15:00-03:00", owner: "Ana Souza", driver: "", team: "Fiscal",
    resolutionDeadline: "2026-04-21", priority: "Média", status: "Aguardando Glosa", observations: "Solicitada análise fiscal.", attachments: [], images: [], demonstrative: true,
  },
  {
    id: "occ-9824", protocol: "OC-9824", kind: "Desvio / Atraso", category: "Transporte",
    unitId: "uo3", unitName: "Unidade Jaboatão", severity: "Alta", title: "Atraso de rota carreta PE-8821 por retenção SEFAZ",
    description: "Veículo retido durante fiscalização, ocasionando atraso na rota de entrega.", eventDate: "2026-04-16", eventTime: "16:40",
    registeredAt: "2026-04-16T16:40:00-03:00", owner: "Felipe Rocha", driver: "Felipe Rocha", team: "Transporte",
    resolutionDeadline: "2026-04-17", priority: "Alta", status: "Resolvida", observations: "Rota retomada após liberação.", attachments: [], images: [], demonstrative: true,
  },
  {
    id: "occ-9812", protocol: "OC-9812", kind: "Manutenção de Frota", category: "Manutenção",
    unitId: "uo5", unitName: "Unidade Cabo", severity: "Crítica", title: "Pane em refrigeração no baú térmico caminhão #04",
    description: "Equipamento de refrigeração apresentou falha durante a operação.", eventDate: "2026-04-16", eventTime: "14:10",
    registeredAt: "2026-04-16T14:10:00-03:00", owner: "Larissa Almeida", driver: "", team: "Manutenção",
    resolutionDeadline: "2026-04-18", priority: "Crítica", status: "Em Oficina", observations: "Veículo direcionado para oficina.", attachments: [], images: [], demonstrative: true,
  },
  {
    id: "occ-9799", protocol: "OC-9799", kind: "Vasilhame Reverso", category: "Estoque",
    unitId: "uo4", unitName: "Unidade Olinda", severity: "Baixa", title: "Extravio de 30 paletes de vasilhames retornáveis",
    description: "Diferença identificada na conferência do retorno de vasilhames.", eventDate: "2026-04-15", eventTime: "11:20",
    registeredAt: "2026-04-15T11:20:00-03:00", owner: "Pedro Lima", driver: "Pedro Lima", team: "Estoque",
    resolutionDeadline: "2026-04-24", priority: "Baixa", status: "Apuração", observations: "Contagem complementar solicitada.", attachments: [], images: [], demonstrative: true,
  },
  {
    id: "occ-9792", protocol: "OC-9792", kind: "Avaria de Carga", category: "Logística",
    unitId: "uo1", unitName: "Matriz – Recife", severity: "Média", title: "Embalagens danificadas na conferência de recebimento",
    description: "Ocorrência identificada na conferência de recebimento do turno da manhã.", eventDate: "2026-04-14", eventTime: "10:05",
    registeredAt: "2026-04-14T10:05:00-03:00", owner: "Carlos Eduardo", driver: "", team: "Operações",
    resolutionDeadline: "2026-04-19", priority: "Média", status: "Em Análise", observations: "Aguardando retorno do fornecedor.", attachments: [], images: [], demonstrative: true,
  },
  {
    id: "occ-9788", protocol: "OC-9788", kind: "Desvio / Atraso", category: "Transporte",
    unitId: "uo2", unitName: "Unidade Paulista", severity: "Alta", title: "Entrega fora da janela acordada",
    description: "Entrega realizada fora da janela de recebimento programada.", eventDate: "2026-04-13", eventTime: "17:25",
    registeredAt: "2026-04-13T17:25:00-03:00", owner: "Ana Souza", driver: "", team: "Transporte",
    resolutionDeadline: "2026-04-18", priority: "Alta", status: "Em Análise", observations: "Solicitada justificativa da transportadora.", attachments: [], images: [], demonstrative: true,
  },
  {
    id: "occ-9773", protocol: "OC-9773", kind: "Manutenção de Frota", category: "Manutenção",
    unitId: "uo3", unitName: "Unidade Jaboatão", severity: "Média", title: "Revisão preventiva do veículo de apoio",
    description: "Revisão preventiva identificada durante checklist operacional.", eventDate: "2026-04-12", eventTime: "08:50",
    registeredAt: "2026-04-12T08:50:00-03:00", owner: "Pedro Lima", driver: "", team: "Manutenção",
    resolutionDeadline: "2026-04-22", priority: "Média", status: "Em Análise", observations: "Aguardando agendamento.", attachments: [], images: [], demonstrative: true,
  },
];
