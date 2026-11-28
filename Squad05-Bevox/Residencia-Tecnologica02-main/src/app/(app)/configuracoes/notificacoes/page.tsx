"use client";

import React, { useRef, useState } from "react";
import { Bell, Mail, Smartphone, MessageSquare, SlidersHorizontal, Clock, Eye, FlaskConical, LoaderCircle } from "lucide-react";
import { NotificationPreview } from "./NotificationPreview";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { useInterfacePreferences } from "@/hooks/useInterfacePreferences";
import { notificationSettingsSchema } from "@/services/settingsSchemas";
import { playSettingsNotificationSound, readSettings, settingsUserKey } from "@/services/settings";
import { runNotificationTest, type LocalTestNotification } from "@/services/notificationTest";
import { useRouter } from "next/navigation";

interface PreferenceItem {
  id: string;
  evento: string;
  descricao: string;
  email: boolean;
  sistema: boolean;
  whatsapp: boolean;
  frequencia: string;
}

const initialPreferences: PreferenceItem[] = [
  {
    id: "1",
    evento: "Tarefas atrasadas",
    descricao: "Tarefas que não foram concluídas no prazo.",
    email: true,
    sistema: true,
    whatsapp: false,
    frequencia: "Imediato",
  },
  {
    id: "2",
    evento: "Licenças próximas do vencimento",
    descricao: "Aviso sobre licenças e alvarás que vencem em breve.",
    email: true,
    sistema: true,
    whatsapp: false,
    frequencia: "7 dias antes",
  },
  {
    id: "3",
    evento: "Contas em atraso",
    descricao: "Contas pendentes após o vencimento.",
    email: true,
    sistema: true,
    whatsapp: true,
    frequencia: "Diário",
  },
  {
    id: "4",
    evento: "Novos documentos",
    descricao: "Documentos publicados para sua análise.",
    email: true,
    sistema: true,
    whatsapp: false,
    frequencia: "Imediato",
  },
  {
    id: "5",
    evento: "Ocorrências abertas",
    descricao: "Novas ocorrências registradas nas unidades.",
    email: true,
    sistema: true,
    whatsapp: false,
    frequencia: "Imediato",
  },
];

const defaults = notificationSettingsSchema.parse({ emailActive: true, sistemaActive: true, whatsappActive: false, selectedDays: ["Seg", "Ter", "Qua", "Qui", "Sex"], horario: "08:00", preferences: initialPreferences });

export default function NotificacoesPage(): React.ReactElement {
  const router = useRouter();

  const settings = useSettingsForm(`bevox.settings.notifications.${settingsUserKey()}`, notificationSettingsSchema, defaults);
  const interfacePrefs = useInterfacePreferences();
  const [emailActive, setEmailActive] = settings.field("emailActive");
  const [sistemaActive, setSistemaActive] = settings.field("sistemaActive");
  const [whatsappActive, setWhatsappActive] = settings.field("whatsappActive");
  const [selectedDays, setSelectedDays] = settings.field("selectedDays");
  const [horario, setHorario] = settings.field("horario");
  const [preferences, setPreferences] = settings.field("preferences");
  const statusMessage = settings.message;
  const [testAlert, setTestAlert] = useState<LocalTestNotification | null>(null);
  const [selectedEvent, setSelectedEvent] = useState("1");
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState(false);
  const testInProgress = useRef(false);
  const selectedPreference = preferences.find((item) => item.id === selectedEvent);
  const saved = confirmed !== null && confirmed === JSON.stringify(settings.data);
  const previewChannels = [emailActive && selectedPreference?.email && "E-mail", sistemaActive && selectedPreference?.sistema && "Sistema", whatsappActive && selectedPreference?.whatsapp && "WhatsApp"].filter((channel): channel is string => typeof channel === "string");

  const toggleDay = (day: typeof selectedDays[number]) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCheckboxChange = (id: string, field: "email" | "sistema" | "whatsapp") => {
    setPreferences((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const handleFrequenciaChange = (id: string, value: string) => {
    setPreferences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, frequencia: value as typeof item.frequencia } : item))
    );
  };

  const handleSalvar = () => {
    setConfirmed(null);
    if (!settings.save()) return;
    try {
      const stored = readSettings(`bevox.settings.notifications.${settingsUserKey()}`, notificationSettingsSchema, defaults);
      if (JSON.stringify(stored) !== JSON.stringify(settings.data)) throw new Error("Divergência na gravação");
      setConfirmed(JSON.stringify(stored));
    } catch { settings.setMessage("Não foi possível confirmar o salvamento. Tente novamente."); }
  };
  const handleEnviarTeste = async () => {
    if (testInProgress.current || !settings.ready) return;
    testInProgress.current = true;
    setTestAlert(null);
    setTestError(false);
    setTestMessage("");
    setTesting(true);
    try {
      const result = await runNotificationTest(settings.data, selectedEvent, {
        // Let the browser paint the busy state before publishing the local notification.
        beforeNotify: () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        notify: notification => { if (interfacePrefs.user.showVisualAlerts) setTestAlert(notification); },
        playSound: interfacePrefs.user.playNotificationSounds ? playSettingsNotificationSound : undefined,
      });
      setTestMessage([
        interfacePrefs.user.showVisualAlerts ? `Notificação local de teste exibida: ${result.notification.title}.` : `Teste local executado para ${selectedPreference?.evento}; alertas visuais estão desativados nas Preferências.`,
        result.unsupported.length ? `${result.unsupported.join(" e ")}: envio externo indisponível; nenhum envio foi realizado nesses canais.` : "",
        result.soundFailed ? "O navegador não permitiu reproduzir o som; a notificação local foi processada." : "",
      ].filter(Boolean).join(" "));
    } catch (error) {
      setTestError(true);
      setTestMessage(error instanceof Error ? error.message : "Não foi possível executar o teste local. Tente novamente.");
    } finally { testInProgress.current = false; setTesting(false); }
  };
  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-surface-muted min-h-screen text-gray-800 dark:text-foreground font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner de Mensagem / Alerta */}
        {statusMessage && (
          <div role="status" aria-live="polite" className="p-4 bg-surface-raised border border-line text-foreground rounded-xl text-sm font-medium transition-all">
            {statusMessage}
          </div>
        )}

        <div>
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
                <span className="p-2 bg-blue-600 text-white rounded-lg"><Bell size={20} /></span>
                Notificações
              </h1>
              <p className="text-sm text-gray-500 dark:text-foreground-muted">
                Configure os alertas e defina quem receberá as notificações.
              </p>
            </div>
            {saved && <span className="text-xs text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
              ● Configurações salvas
            </span>}
          </div>
        </div>

        {!settings.ready && <p role="status">{settings.message ? "Configurações indisponíveis." : "Carregando configurações…"}</p>}
        <fieldset disabled={!settings.ready} className="min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-4">
          
          <div className="min-w-0 space-y-6">
            
            {/* Canais de Notificação */}
            <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-1 flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-blue-600" /> Canais de notificação
              </h3>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mb-4">Escolha como deseja receber os alertas do sistema.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 dark:border-line rounded-xl p-4 flex flex-col items-center text-center relative bg-gray-50/50 dark:bg-surface-muted/50">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm mb-2"><Mail size={18} /></div>
                  <span className="font-bold text-xs text-gray-900 dark:text-foreground">E-mail</span>
                  <span className="text-[10px] text-gray-400 dark:text-foreground-muted mb-3">Receba notificações por e-mail.</span>
                  <button 
                    type="button"
                    role="switch" aria-label="Canal email" aria-checked={emailActive} onClick={() => setEmailActive(!emailActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${emailActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-surface-muted'}`}
                  >
                    <div className={`w-4 h-4 bg-white dark:bg-surface-raised rounded-full transition-transform ${emailActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-line rounded-xl p-4 flex flex-col items-center text-center relative bg-gray-50/50 dark:bg-surface-muted/50">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm mb-2"><Smartphone size={18} /></div>
                  <span className="font-bold text-xs text-gray-900 dark:text-foreground">Notificação no sistema</span>
                  <span className="text-[10px] text-gray-400 dark:text-foreground-muted mb-3">Visualize os alertas no painel.</span>
                  <button 
                    type="button"
                    role="switch" aria-label="Canal sistema" aria-checked={sistemaActive} onClick={() => setSistemaActive(!sistemaActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${sistemaActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-surface-muted'}`}
                  >
                    <div className={`w-4 h-4 bg-white dark:bg-surface-raised rounded-full transition-transform ${sistemaActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-line rounded-xl p-4 flex flex-col items-center text-center relative bg-gray-50/50 dark:bg-surface-muted/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-sm mb-2"><MessageSquare size={18} /></div>
                  <span className="font-bold text-xs text-gray-900 dark:text-foreground">WhatsApp <span className="text-[9px] font-normal text-gray-400 dark:text-foreground-muted">(opcional)</span></span>
                  <span className="text-[10px] text-gray-400 dark:text-foreground-muted mb-3">Receba alertas via WhatsApp.</span>
                  <button 
                    type="button"
                    role="switch" aria-label="Canal whatsapp" aria-checked={whatsappActive} onClick={() => setWhatsappActive(!whatsappActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${whatsappActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-surface-muted'}`}
                  >
                    <div className={`w-4 h-4 bg-white dark:bg-surface-raised rounded-full transition-transform ${whatsappActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Eventos e Preferências */}
            <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-1 flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-blue-600" /> Eventos e preferências
              </h3>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mb-4">Selecione quais eventos irão gerar notificações.</p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="text-gray-500 dark:text-foreground-muted bg-blue-50/60 dark:bg-blue-950/30 border-b border-gray-100 dark:border-line">
                      <th className="pb-2 font-medium">EVENTO</th>
                      <th className="pb-2 font-medium">DESCRIÇÃO</th>
                      <th className="pb-2 font-medium">CANAL</th>
                      <th className="pb-2 font-medium">FREQUÊNCIA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-line">
                    {preferences.map((pref) => (
                      <tr key={pref.id}>
                        <td className="py-3 font-semibold text-gray-900 dark:text-foreground">{pref.evento}</td>
                        <td className="py-3 text-gray-500 dark:text-foreground-muted text-[11px] max-w-[200px]">{pref.descricao}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                aria-label={`email para ${pref.evento}`} checked={pref.email} disabled={!emailActive} 
                                onChange={() => handleCheckboxChange(pref.id, "email")}
                                className="rounded text-blue-600 dark:text-blue-300 accent-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600"
                              />
                              <span>E-mail</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                aria-label={`sistema para ${pref.evento}`} checked={pref.sistema} disabled={!sistemaActive} 
                                onChange={() => handleCheckboxChange(pref.id, "sistema")}
                                className="rounded text-blue-600 dark:text-blue-300 focus:ring-0"
                              />
                              <span>Sistema</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                aria-label={`whatsapp para ${pref.evento}`} checked={pref.whatsapp} disabled={!whatsappActive} 
                                onChange={() => handleCheckboxChange(pref.id, "whatsapp")}
                                className="rounded text-blue-600 dark:text-blue-300 focus:ring-0"
                              />
                              <span>WhatsApp</span>
                            </label>
                          </div>
                        </td>
                        <td className="py-3">
                          <select 
                            aria-label={`Frequência para ${pref.evento}`}
                            value={pref.frequencia} 
                            onChange={(e) => handleFrequenciaChange(pref.id, e.target.value)}
                            className="bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded px-2 py-1 text-[11px] text-gray-700 dark:text-foreground cursor-pointer"
                          >
                            <option value="Imediato">Imediato</option>
                            <option value="7 dias antes">7 dias antes</option>
                            <option value="Diário">Diário</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Horário e Frequência */}
            <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-1 flex items-center gap-2">
                <Clock size={17} className="text-blue-600" /> Horário e frequência
              </h3>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mb-4">Defina o horário de envio das notificações por e-mail.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Horário preferencial</label>
                  <select 
                    aria-label="Horário preferencial"
                    value={horario} 
                    onChange={(e) => setHorario(e.target.value as typeof horario)}
                    className="w-full bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-foreground cursor-pointer"
                  >
                    <option value="06:00">🕒 06:00</option>
                    <option value="08:00">🕒 08:00</option>
                    <option value="12:00">🕒 12:00</option>
                    <option value="18:00">🕒 18:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Dias da semana</label>
                  <div className="flex gap-1 flex-wrap">
                    {(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const).map((day, idx) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={idx}
                          type="button"
                          aria-pressed={isSelected} onClick={() => toggleDay(day)}
                          className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-surface-muted text-gray-600 dark:text-foreground-muted hover:bg-gray-200 dark:hover:bg-surface-muted'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="min-w-0 space-y-6">
            
            {/* Pré-visualização */}
            <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-1 flex items-center gap-2">
                <Eye size={17} className="text-blue-600" /> Pré-visualização
              </h3>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mb-4">Veja um exemplo de como será a notificação.</p>

              <label htmlFor="preview-event" className="block text-xs font-medium mb-1">Evento da pré-visualização</label>
              <select id="preview-event" disabled={testing} value={selectedEvent} onChange={(event) => { setSelectedEvent(event.target.value); setTestAlert(null); setTestMessage(""); setTestError(false); }} className="w-full rounded border border-line bg-surface-raised p-2 text-xs mb-3">
                {preferences.map((item) => <option key={item.id} value={item.id}>{item.evento}</option>)}
              </select>
              {selectedPreference ? <NotificationPreview eventId={selectedEvent} horario={horario} channels={previewChannels} frequency={selectedPreference.frequencia} /> : <p className="text-xs text-foreground-muted">Nenhum evento selecionado para pré-visualizar.</p>}
            </div>

            {/* Testar Notificações */}
            <div className="bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-foreground text-sm mb-1 flex items-center gap-2">
                <FlaskConical size={17} className="text-blue-600" /> Testar notificações
              </h3>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mb-4">Receba um alerta de teste para verificar as configurações atuais.</p>

              <button 
                type="button"
                disabled={testing || !settings.ready} aria-busy={testing} onClick={handleEnviarTeste}
                className="w-full min-h-10 bg-white dark:bg-surface-raised border border-gray-300 dark:border-line hover:bg-gray-50 dark:hover:bg-surface-muted text-gray-700 dark:text-foreground text-xs px-3 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:cursor-wait disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {testing ? <LoaderCircle aria-hidden="true" size={15} className="animate-spin motion-reduce:animate-none" /> : <span aria-hidden="true">▷</span>} {testing ? "Enviando teste..." : "Enviar notificação de teste"}
              </button>
              {testAlert && <div role="status" className="mt-3 rounded-lg border border-blue-300 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"><p className="font-semibold">{testAlert.title}</p><p className="mt-1">{testAlert.description}</p><p className="mt-1 text-[10px]">{new Date(testAlert.createdAt).toLocaleString("pt-BR")}</p><button type="button" aria-label="Fechar notificação de teste" className="mt-2 underline" onClick={() => setTestAlert(null)}>Fechar</button></div>}
              {testMessage && <p role={testError ? "alert" : "status"} className={`mt-3 text-xs ${testError ? "text-red-600 dark:text-red-300" : "text-foreground-muted"}`}>{testMessage}</p>}
            </div>

          </div>

        </div>

        </fieldset>
        {/* Rodapé de Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-line">
          <button 
            type="button"
            onClick={() => router.push("/configuracoes")}
            className="bg-white dark:bg-surface-raised border border-gray-300 dark:border-line hover:bg-gray-50 dark:hover:bg-surface-muted text-gray-700 dark:text-foreground px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            ← Voltar
          </button>
          <button 
            type="button"
            disabled={!settings.ready || saved} onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-default text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
          >
            ✓ Salvar alterações
          </button>
        </div>

      </div>
    </div>
  );
}



