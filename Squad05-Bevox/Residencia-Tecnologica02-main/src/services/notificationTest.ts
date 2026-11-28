import { notificationSettingsSchema } from "@/services/settingsSchemas";

export type LocalTestNotification = { title: string; description: string; createdAt: string };
type Effects = {
  beforeNotify: () => Promise<void>;
  notify: (notification: LocalTestNotification) => void | Promise<void>;
  playSound?: () => Promise<void>;
};

/** Explicit local test; no email, WhatsApp or scheduled delivery is attempted. */
export async function runNotificationTest(settings: unknown, eventId: string, effects: Effects) {
  const parsed = notificationSettingsSchema.safeParse(settings);
  if (!parsed.success) throw new Error("Revise as configurações de notificação antes de testar.");
  const data = parsed.data;
  const event = data.preferences.find(item => item.id === eventId);
  if (!event) throw new Error("Selecione um evento disponível para testar.");
  const unsupported = [data.emailActive && event.email && "E-mail", data.whatsappActive && event.whatsapp && "WhatsApp"].filter((channel): channel is string => typeof channel === "string");
  if (!data.sistemaActive || !event.sistema) {
    throw new Error(`Ative o canal Sistema para o evento selecionado. ${unsupported.length ? `${unsupported.join(" e ")} ${unsupported.length > 1 ? "não possuem" : "não possui"} serviço de envio conectado.` : "Nenhum canal local está ativo para este evento."}`);
  }
  await effects.beforeNotify();
  const notification: LocalTestNotification = { title: `${event.evento} — teste local`, description: `Teste de configuração: ${event.descricao}`, createdAt: new Date().toISOString() };
  await effects.notify(notification);
  let soundFailed = false;
  try { await effects.playSound?.(); } catch { soundFailed = true; }
  return { notification, unsupported, soundFailed };
}
