import { mockUsers } from "@/data/mockUsers";
import { USUARIOS_MOCK } from "@/lib/usuarios-mock";
import type { AuditEvent, ExternalIntegration } from "@/types/audit";

// Projeção somente de leitura dos registros demonstrativos existentes.
// Não é um log persistente ou imutável, nem representa eventos de produção.
export async function getAuditEvents(): Promise<AuditEvent[]> {
  return mockUsers.flatMap((details) => {
    const user = USUARIOS_MOCK.find((item) => item.id === details.id && item.email === details.email);
    if (!user) return [];
    return (details.activities ?? []).map((activity) => {
      const [day, month, year] = activity.date.split("/");
      return {
        id: `${user.id}-${activity.id}`,
        userId: user.id,
        userName: user.nome,
        // Os mocks não identificam quem executou alterações administrativas.
        responsible: activity.title === "Login realizado" ? user.nome : "Não informado",
        action: activity.title,
        module: activity.title === "Login realizado" ? "Segurança e Acesso" : "Usuários e Permissões",
        occurredAt: `${year}-${month}-${day}T${activity.time}:00-03:00`,
        description: activity.description,
        ipAddress: activity.ipAddress,
      };
    });
  }).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

// Serviços ilustrados na referência fornecida, ainda sem conectores implementados.
export async function getExternalIntegrations(): Promise<ExternalIntegration[]> {
  return [
    { id: "google-drive", name: "Google Drive", category: "Documentos", initials: "GD", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300", description: "Armazenamento e sincronização de documentos." },
    { id: "stripe", name: "Stripe", category: "Financeiro", initials: "S", color: "bg-indigo-600 text-white", description: "Processamento de pagamentos e recebimentos." },
    { id: "mailchimp", name: "Mailchimp", category: "Comunicação", initials: "M", color: "bg-amber-300 text-slate-900", description: "Comunicação e campanhas de e-mail." },
  ];
}
