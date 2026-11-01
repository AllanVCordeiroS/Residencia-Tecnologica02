"use client";

import React, { useState } from "react";
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
    descricao: "Contas a receber com vencimento vencido.",
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

export default function NotificacoesPage(): React.ReactElement {
  const router = useRouter();

  const [emailActive, setEmailActive] = useState<boolean>(true);
  const [sistemaActive, setSistemaActive] = useState<boolean>(true);
  const [whatsappActive, setWhatsappActive] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(["Seg", "Ter", "Qua", "Qui", "Sex"]);
  const [horario, setHorario] = useState<string>("08:00");
  const [preferences, setPreferences] = useState<PreferenceItem[]>(initialPreferences);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleDay = (day: string) => {
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
      prev.map((item) => (item.id === id ? { ...item, frequencia: value } : item))
    );
  };

  const handleSalvar = () => {
    setStatusMessage("✅ Alterações de Notificações salvas com sucesso!");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleEnviarTeste = () => {
    alert("🧪 Notificação de teste enviada para o seu e-mail e painel!");
  };

  const handleVerTarefa = () => {
    alert("🔗 Redirecionando para a tarefa atrasada em exemplo...");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner de Mensagem / Alerta */}
        {statusMessage && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-medium transition-all">
            {statusMessage}
          </div>
        )}

        <div>
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <span>BEVOX</span> / <span>Adega Distribution</span> / <span className="text-blue-600 font-medium">Configurações</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">🔔</span>
                Notificações
              </h1>
              <p className="text-sm text-gray-500">
                Configure os alertas e defina quem receberá as notificações.
              </p>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-emerald-200">
              ● Configurações salvas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Canais de Notificação */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                <span>📢</span> Canais de notificação
              </h3>
              <p className="text-xs text-gray-500 mb-4">Escolha como deseja receber os alertas do sistema.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center relative bg-gray-50/50">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm mb-2">✉️</div>
                  <span className="font-bold text-xs text-gray-900">E-mail</span>
                  <span className="text-[10px] text-gray-400 mb-3">Receba notificações por e-mail.</span>
                  <button 
                    type="button"
                    onClick={() => setEmailActive(!emailActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${emailActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center relative bg-gray-50/50">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm mb-2">📲</div>
                  <span className="font-bold text-xs text-gray-900">Notificação no sistema</span>
                  <span className="text-[10px] text-gray-400 mb-3">Visualize os alertas no painel.</span>
                  <button 
                    type="button"
                    onClick={() => setSistemaActive(!sistemaActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${sistemaActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${sistemaActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center relative bg-gray-50/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm mb-2">💬</div>
                  <span className="font-bold text-xs text-gray-900">WhatsApp <span className="text-[9px] font-normal text-gray-400">(opcional)</span></span>
                  <span className="text-[10px] text-gray-400 mb-3">Receba alertas via WhatsApp.</span>
                  <button 
                    type="button"
                    onClick={() => setWhatsappActive(!whatsappActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${whatsappActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${whatsappActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Eventos e Preferências */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                <span>⚙️</span> Eventos e preferências
              </h3>
              <p className="text-xs text-gray-500 mb-4">Selecione quais eventos irão gerar notificações.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="pb-2 font-medium">EVENTO</th>
                      <th className="pb-2 font-medium">DESCRIÇÃO</th>
                      <th className="pb-2 font-medium">CANAL</th>
                      <th className="pb-2 font-medium">FREQUÊNCIA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preferences.map((pref) => (
                      <tr key={pref.id}>
                        <td className="py-3 font-semibold text-gray-900">{pref.evento}</td>
                        <td className="py-3 text-gray-500 text-[11px] max-w-[200px]">{pref.descricao}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 text-[10px]">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={pref.email} 
                                onChange={() => handleCheckboxChange(pref.id, "email")}
                                className="rounded text-blue-600 focus:ring-0" 
                              />
                              <span>E-mail</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={pref.sistema} 
                                onChange={() => handleCheckboxChange(pref.id, "sistema")}
                                className="rounded text-blue-600 focus:ring-0" 
                              />
                              <span>Sistema</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={pref.whatsapp} 
                                onChange={() => handleCheckboxChange(pref.id, "whatsapp")}
                                className="rounded text-blue-600 focus:ring-0" 
                              />
                              <span>WhatsApp</span>
                            </label>
                          </div>
                        </td>
                        <td className="py-3">
                          <select 
                            value={pref.frequencia} 
                            onChange={(e) => handleFrequenciaChange(pref.id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[11px] text-gray-700 cursor-pointer"
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
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                <span>🕒</span> Horário e frequência
              </h3>
              <p className="text-xs text-gray-500 mb-4">Defina o horário de envio das notificações por e-mail.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Horário preferencial</label>
                  <select 
                    value={horario} 
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer"
                  >
                    <option value="06:00">🕒 06:00</option>
                    <option value="08:00">🕒 08:00</option>
                    <option value="12:00">🕒 12:00</option>
                    <option value="18:00">🕒 18:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Dias da semana</label>
                  <div className="flex gap-1 flex-wrap">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, idx) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

          <div className="space-y-6">
            
            {/* Pré-visualização */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                <span>👁️</span> Pré-visualização
              </h3>
              <p className="text-xs text-gray-500 mb-4">Veja um exemplo de como será a notificação.</p>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 space-y-3">
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-black text-white rounded font-bold text-[9px] flex items-center justify-center">BX</div>
                    <div>
                      <div className="font-bold text-gray-900">BEVOX</div>
                      <div className="text-gray-400 text-[9px]">notificacoes@bevox.com.br</div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-[10px]">Hoje, {horario}</span>
                </div>

                <div>
                  <div className="font-bold text-xs text-gray-900 mb-1">Tarefa atrasada</div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    A tarefa &quot;Conferir documentos de licenciamento&quot; da Unidade Matriz — Recife está atrasada.
                  </p>
                </div>

                <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-gray-100 space-y-0.5">
                  <div>👤 <strong>Responsável:</strong> Ana Souza</div>
                  <div>📅 <strong>Prazo:</strong> 20/10/2026</div>
                </div>

                <button 
                  type="button"
                  onClick={handleVerTarefa}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Ver tarefa →
                </button>
              </div>
            </div>

            {/* Testar Notificações */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                <span>🧪</span> Testar notificações
              </h3>
              <p className="text-xs text-gray-500 mb-4">Receba um alerta de teste para verificar as configurações atuais.</p>

              <button 
                type="button"
                onClick={handleEnviarTeste}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs py-2 rounded-lg font-medium shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>▷</span> Enviar notificação de teste
              </button>
            </div>

          </div>

        </div>

        {/* Rodapé de Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button 
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
          >
            ✓ Salvar alterações
          </button>
        </div>

      </div>
    </div>
  );
}