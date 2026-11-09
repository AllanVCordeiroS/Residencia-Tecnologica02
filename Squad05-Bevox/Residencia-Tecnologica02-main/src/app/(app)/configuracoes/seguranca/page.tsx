"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AccessProfile {
  id: string;
  perfil: string;
  descricao: string;
  permissoes: string;
  status: "Ativo" | "Inativo";
}

interface ActiveSession {
  id: string;
  dispositivo: string;
  localizacao: string;
  ultimoAcesso: string;
}

const initialProfiles: AccessProfile[] = [
  { id: "1", perfil: "Administrador Geral", descricao: "Acesso total ao sistema", permissoes: "Todas as permissões", status: "Ativo" },
  { id: "2", perfil: "Gestor de Unidade", descricao: "Gerencia dados da unidade", permissoes: "Unidades, Tarefas, Financeiro", status: "Ativo" },
  { id: "3", perfil: "Analista Financeiro", descricao: "Acesso ao módulo financeiro", permissoes: "Financeiro, Relatórios", status: "Ativo" },
  { id: "4", perfil: "Consulta", descricao: "Visualização de dados", permissoes: "Relatórios, Dashboard", status: "Ativo" },
];

const initialSessions: ActiveSession[] = [
  { id: "1", dispositivo: "Windows • Chrome", localizacao: "Recife - PE", ultimoAcesso: "Hoje, 17:45" },
  { id: "2", dispositivo: "iPhone • Safari", localizacao: "Recife - PE", ultimoAcesso: "Hoje, 14:20" },
  { id: "3", dispositivo: "Windows • Edge", localizacao: "São Paulo - SP", ultimoAcesso: "Ontem, 21:12" },
];

export default function SegurancaAcessoPage(): React.ReactElement {
  const router = useRouter();

  const [selected2FA, setSelected2FA] = useState<string>("Aplicativo");
  const [exigirMaiusculas, setExigirMaiusculas] = useState<boolean>(true);
  const [exigirSimbolos, setExigirSimbolos] = useState<boolean>(true);
  
  const [profiles, setProfiles] = useState<AccessProfile[]>(initialProfiles);
  const [sessions, setSessions] = useState<ActiveSession[]>(initialSessions);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSalvar = () => {
    setStatusMessage("✅ Alterações de Segurança e Acesso salvas com sucesso!");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleNovoPerfil = () => {
    const nome = prompt("Digite o nome do novo perfil de acesso:");
    if (nome) {
      const novo: AccessProfile = {
        id: Date.now().toString(),
        perfil: nome,
        descricao: "Perfil personalizado",
        permissoes: "Personalizada",
        status: "Ativo",
      };
      setProfiles([...profiles, novo]);
    }
  };

  const handleEncerrarSessao = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleEncerrarTodas = () => {
    if (confirm("Tem certeza que deseja encerrar todas as outras sessões ativas?")) {
      setSessions(sessions.slice(0, 1)); // Mantém apenas a primeira
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner de Status */}
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
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">🛡️</span>
                Segurança e Acesso
              </h1>
              <p className="text-sm text-gray-500">
                Gerencie as políticas de segurança, autenticação e controle de acesso do sistema.
              </p>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-emerald-200">
              ● Sistema seguro
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Política de Segurança */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>🛡️</span> Política de Segurança
            </h3>
            <p className="text-xs text-gray-500 -mt-2">Configure as principais regras de segurança do sistema.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tempo de expiração da sessão</label>
                <select defaultValue="8 horas" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <option value="8 horas">🕐 8 horas</option>
                  <option value="4 horas">🕐 4 horas</option>
                  <option value="1 hora">🕐 1 hora</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mínimo de caracteres da senha</label>
                <select defaultValue="8 caracteres" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <option value="8 caracteres">🔒 8 caracteres</option>
                  <option value="10 caracteres">🔒 10 caracteres</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Exigir letras maiúsculas</label>
                <button 
                  type="button"
                  onClick={() => setExigirMaiusculas(!exigirMaiusculas)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs text-gray-700 font-medium">{exigirMaiusculas ? "Sim" : "Não"}</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${exigirMaiusculas ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.25 transition-transform ${exigirMaiusculas ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Exigir números e símbolos</label>
                <button 
                  type="button"
                  onClick={() => setExigirSimbolos(!exigirSimbolos)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs text-gray-700 font-medium">{exigirSimbolos ? "Sim" : "Não"}</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${exigirSimbolos ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.25 transition-transform ${exigirSimbolos ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bloqueio após tentativas inválidas</label>
                <select defaultValue="5 tentativas" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <option value="5 tentativas">🛑 5 tentativas</option>
                  <option value="3 tentativas">🛑 3 tentativas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tempo de bloqueio</label>
                <select defaultValue="15 minutos" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <option value="15 minutos">⏱ 15 minutos</option>
                  <option value="30 minutos">⏱ 30 minutos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Autenticação em Dois Fatores */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>📲</span> Autenticação em Dois Fatores (2FA)
            </h3>
            <p className="text-xs text-gray-500 -mt-2">Adicione uma camada extra de segurança ao seu acesso.</p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
              <span>ℹ️</span> A autenticação em dois fatores está ativada para todos os usuários.
            </div>

            <label className="block text-xs font-semibold text-gray-500">Método de verificação</label>
            <div className="grid grid-cols-3 gap-3">
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
                    onClick={() => setSelected2FA(method.name)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 text-blue-600 font-bold shadow-xs"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-lg mb-1">{method.icon}</div>
                    <div className="text-xs">{method.name}</div>
                    {method.desc && <div className="text-[9px] text-gray-400 font-normal">{method.desc}</div>}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gerenciamento de Acessos */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>👥</span> Gerenciamento de Acessos
            </h3>
            <p className="text-xs text-gray-500 -mt-2">Controle os perfis e permissões dos usuários do sistema.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-medium">PERFIL</th>
                    <th className="pb-2 font-medium">DESCRIÇÃO</th>
                    <th className="pb-2 font-medium">PERMISSÕES</th>
                    <th className="pb-2 font-medium">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {profiles.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-bold text-gray-900">{item.perfil}</td>
                      <td className="py-2.5 text-gray-500 text-[11px]">{item.descricao}</td>
                      <td className="py-2.5 text-gray-600 text-[11px]">{item.permissoes}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600 font-medium">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              type="button"
              onClick={handleNovoPerfil}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              + Novo Perfil
            </button>
          </div>

          {/* Sessões Ativas */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span>💻</span> Sessões Ativas
                </h3>
                <p className="text-xs text-gray-500">Monitore os dispositivos conectados à sua conta.</p>
              </div>
              <button 
                type="button"
                onClick={handleEncerrarTodas}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium underline cursor-pointer"
              >
                Encerrar todas
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-medium">DISPOSITIVO</th>
                    <th className="pb-2 font-medium">LOCALIZAÇÃO</th>
                    <th className="pb-2 font-medium">ÚLTIMO ACESSO</th>
                    <th className="pb-2 font-medium text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="py-2.5 font-medium text-gray-900">{session.dispositivo}</td>
                      <td className="py-2.5 text-gray-500">📍 {session.localizacao}</td>
                      <td className="py-2.5 text-gray-500">{session.ultimoAcesso}</td>
                      <td className="py-2.5 text-right">
                        <button 
                          type="button"
                          onClick={() => handleEncerrarSessao(session.id)}
                          className="text-[10px] text-rose-600 hover:underline font-medium cursor-pointer"
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

        {/* Rodapé de Ações */}
        <div className="flex justify-start gap-3 pt-4 border-t border-gray-200">
          <button 
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            ← Voltar
          </button>
          <button 
            type="button"
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
          >
            💾 Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}