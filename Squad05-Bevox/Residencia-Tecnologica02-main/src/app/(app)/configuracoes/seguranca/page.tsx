"use client";

import React from "react";
import { Shield, Smartphone, Users, Monitor } from "lucide-react";
import { SecurityAccessProfiles } from "./SecurityAccessProfiles";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { securitySettingsSchema, DEFAULT_SECURITY_SETTINGS } from "@/services/settingsSchemas";
import { useRouter } from "next/navigation";

interface ActiveSession {
  id: string;
  dispositivo: string;
  localizacao: string;
  ultimoAcesso: string;
}

const initialSessions: ActiveSession[] = [
  { id: "1", dispositivo: "Windows • Chrome", localizacao: "Recife - PE", ultimoAcesso: "Hoje, 17:45" },
  { id: "2", dispositivo: "iPhone • Safari", localizacao: "Recife - PE", ultimoAcesso: "Hoje, 14:20" },
  { id: "3", dispositivo: "Windows • Edge", localizacao: "São Paulo - SP", ultimoAcesso: "Ontem, 21:12" },
];

export default function SegurancaAcessoPage(): React.ReactElement {
  const router = useRouter();

  const settings = useSettingsForm("bevox.settings.security", securitySettingsSchema, DEFAULT_SECURITY_SETTINGS);
  const [selected2FA, setSelected2FA] = settings.field("selected2FA");
  const [exigirMaiusculas, setExigirMaiusculas] = settings.field("exigirMaiusculas");
  const [exigirSimbolos, setExigirSimbolos] = settings.field("exigirSimbolos");
  const sessions = initialSessions;
  const statusMessage = settings.message;
  const handleSalvar = () => settings.save();
  const handleNovoPerfil = () => router.push("/usuarios");
  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-surface-muted min-h-screen text-gray-800 dark:text-foreground font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner de Status */}
        {statusMessage && (
          <div role="status" aria-live="polite" className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl text-sm font-medium transition-all">
            {statusMessage}
          </div>
        )}

        <div>
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
                <span className="p-2 bg-blue-600 text-white rounded-lg"><Shield aria-hidden="true" size={22} /></span>
                Segurança e Acesso
              </h1>
              <p className="text-sm text-gray-500 dark:text-foreground-muted">
                Gerencie as políticas de segurança, autenticação e controle de acesso do sistema.
              </p>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-blue-200 dark:border-blue-800">
              Política local
            </span>
          </div>
        </div>

        {!settings.ready && !statusMessage && <p role="status" className="text-sm text-foreground-muted">Carregando configurações…</p>}
        <fieldset disabled={!settings.ready} className="min-w-0 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Política de Segurança */}
          <div className="min-w-0 bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
              <Shield aria-hidden="true" size={20} className="text-blue-600 dark:text-blue-300" /> Política de Segurança
            </h3>
            <p className="text-xs text-gray-500 dark:text-foreground-muted -mt-2">Configure as principais regras de segurança do sistema.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Tempo de expiração da sessão</label>
                <select aria-label="Tempo de expiração da sessão" value={settings.data.expiry} onChange={(e) => settings.field("expiry")[1](e.target.value as typeof settings.data.expiry)} className="w-full bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-foreground cursor-pointer">
                  <option value="8 horas">🕐 8 horas</option>
                  <option value="4 horas">🕐 4 horas</option>
                  <option value="1 hora">🕐 1 hora</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Mínimo de caracteres da senha</label>
                <select aria-label="Mínimo de caracteres da senha" value={settings.data.minimum} onChange={(e) => settings.field("minimum")[1](e.target.value as typeof settings.data.minimum)} className="w-full bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-foreground cursor-pointer">
                  <option value="8 caracteres">🔒 8 caracteres</option>
                  <option value="10 caracteres">🔒 10 caracteres</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Exigir letras maiúsculas</label>
                <button 
                  type="button"
                  role="switch" aria-label="Exigir letras maiúsculas" aria-checked={exigirMaiusculas} onClick={() => setExigirMaiusculas(!exigirMaiusculas)}
                  className="w-full bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg p-2 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs text-gray-700 dark:text-foreground font-medium">{exigirMaiusculas ? "Sim" : "Não"}</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${exigirMaiusculas ? 'bg-blue-600' : 'bg-gray-300 dark:bg-surface-muted'}`}>
                    <div className={`w-3.5 h-3.5 bg-white dark:bg-surface-raised rounded-full absolute top-0.25 transition-transform ${exigirMaiusculas ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Exigir números e símbolos</label>
                <button 
                  type="button"
                  role="switch" aria-label="Exigir números e símbolos" aria-checked={exigirSimbolos} onClick={() => setExigirSimbolos(!exigirSimbolos)}
                  className="w-full bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg p-2 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs text-gray-700 dark:text-foreground font-medium">{exigirSimbolos ? "Sim" : "Não"}</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${exigirSimbolos ? 'bg-blue-600' : 'bg-gray-300 dark:bg-surface-muted'}`}>
                    <div className={`w-3.5 h-3.5 bg-white dark:bg-surface-raised rounded-full absolute top-0.25 transition-transform ${exigirSimbolos ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Bloqueio após tentativas inválidas</label>
                <select aria-label="Bloqueio após tentativas inválidas" value={settings.data.attempts} onChange={(e) => settings.field("attempts")[1](e.target.value as typeof settings.data.attempts)} className="w-full bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-foreground cursor-pointer">
                  <option value="5 tentativas">🛑 5 tentativas</option>
                  <option value="3 tentativas">🛑 3 tentativas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted mb-1">Tempo de bloqueio</label>
                <select aria-label="Tempo de bloqueio" value={settings.data.lockout} onChange={(e) => settings.field("lockout")[1](e.target.value as typeof settings.data.lockout)} className="w-full bg-gray-50 dark:bg-surface-muted border border-gray-200 dark:border-line rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-foreground cursor-pointer">
                  <option value="15 minutos">⏱ 15 minutos</option>
                  <option value="30 minutos">⏱ 30 minutos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Autenticação em Dois Fatores */}
          <div className="min-w-0 bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
              <Smartphone aria-hidden="true" size={20} className="text-blue-600 dark:text-blue-300" /> Autenticação em Dois Fatores (2FA)
            </h3>
            <p className="text-xs text-gray-500 dark:text-foreground-muted -mt-2">Adicione uma camada extra de segurança ao seu acesso.</p>

            <label className="block text-xs font-semibold text-gray-500 dark:text-foreground-muted">Método de verificação</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "Aplicativo", desc: "(Authenticator)", icon: "📱" },
                { name: "E-mail", desc: "", icon: "✉️" },
                { name: "SMS", desc: "", icon: "💬" },
              ].map((method) => {
                const isSelected = selected2FA === method.name;
                return (
                  <button
                    key={method.name}
                    type="button"
                    aria-pressed={isSelected} onClick={() => setSelected2FA(method.name as typeof selected2FA)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-bold shadow-xs"
                        : "border-gray-200 dark:border-line bg-white dark:bg-surface-raised text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-muted"
                    }`}
                  >
                    <div className="text-lg mb-1">{method.icon}</div>
                    <div className="text-xs">{method.name}</div>
                    {method.desc && <div className="text-[9px] text-gray-400 dark:text-foreground-muted font-normal">{method.desc}</div>}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gerenciamento de Acessos */}
          <div className="min-w-0 bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
              <Users aria-hidden="true" size={20} className="text-blue-600 dark:text-blue-300" /> Gerenciamento de Acessos
            </h3>
            <p className="text-xs text-gray-500 dark:text-foreground-muted -mt-2">Controle os perfis e permissões dos usuários do sistema.</p>

            <SecurityAccessProfiles />

            <button 
              type="button"
              onClick={handleNovoPerfil}
              className="bg-gray-100 dark:bg-surface-muted hover:bg-gray-200 dark:hover:bg-surface-muted text-gray-700 dark:text-foreground text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              Gerenciar usuários e perfis
            </button>
          </div>

          {/* Sessões Ativas */}
          <div className="min-w-0 bg-white dark:bg-surface-raised p-5 rounded-xl border border-gray-200 dark:border-line shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                  <Monitor aria-hidden="true" size={20} className="text-blue-600 dark:text-blue-300" /> Sessões Ativas
                </h3>
                <p className="text-xs text-gray-500 dark:text-foreground-muted">Monitore os dispositivos conectados à sua conta.</p>
              </div>
              <button 
                type="button"
                disabled aria-describedby="security-sessions-info" title="Encerramento remoto indisponível: serviço de sessões não conectado"
                className="text-xs text-gray-500 dark:text-foreground-muted hover:text-gray-700 dark:hover:text-foreground font-medium opacity-50 cursor-not-allowed"
              >
                Encerrar todas
              </button>
            </div>

            <p id="security-sessions-info" className="text-xs text-foreground-muted">Registros de exemplo; não representam sessões verificadas. Encerramento indisponível: serviço de sessões não conectado.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-xs">
                <thead>
                  <tr className="text-gray-400 dark:text-foreground-muted border-b border-gray-100 dark:border-line">
                    <th className="pb-2 font-medium">DISPOSITIVO</th>
                    <th className="pb-2 font-medium">NAVEGADOR</th>
                    <th className="pb-2 font-medium">LOCALIZAÇÃO</th>
                    <th className="pb-2 font-medium">ÚLTIMO ACESSO</th>
                    <th className="pb-2 font-medium text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-line">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="py-2.5 font-medium text-gray-900 dark:text-foreground">{session.dispositivo.split(" • ")[0]} <span className="text-foreground-muted">(exemplo)</span></td>
                      <td className="py-2.5 text-gray-500 dark:text-foreground-muted">{session.dispositivo.split(" • ")[1]}</td>
                      <td className="py-2.5 text-gray-500 dark:text-foreground-muted">📍 {session.localizacao}</td>
                      <td className="py-2.5 text-gray-500 dark:text-foreground-muted">{session.ultimoAcesso}</td>
                      <td className="py-2.5 text-right">
                        <button 
                          type="button"
                          disabled aria-describedby="security-sessions-info" title="Exemplo: não corresponde a uma sessão verificável"
                          className="text-[10px] text-rose-600 dark:text-rose-300 font-medium opacity-50 cursor-not-allowed"
                        >
                          Encerrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        </fieldset>
        {/* Rodapé de Ações */}
        <div className="flex flex-col sm:flex-row justify-start gap-3 pt-4 border-t border-gray-200 dark:border-line">
          <button 
            type="button"
            onClick={() => router.push("/configuracoes")}
            className="bg-white dark:bg-surface-raised border border-gray-300 dark:border-line hover:bg-gray-50 dark:hover:bg-surface-muted text-gray-700 dark:text-foreground px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            ← Voltar
          </button>
          <button 
            type="button"
            disabled={!settings.ready} onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
          >
            💾 Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}





