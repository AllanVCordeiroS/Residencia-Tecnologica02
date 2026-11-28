import {
  Building2,
  ChartColumn,
  ClipboardCheck,
  CreditCard,
  FileText,
  House,
  Settings,
  ShieldCheck,
  Truck,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [{ label: "Dashboard Geral", href: "/dashboard", icon: House }],
  },
  {
    label: "Gestão Corporativa",
    items: [
      { label: "Gestão de Unidades", href: "/unidades", icon: Building2 },
      { label: "Documentos", href: "/documentos", icon: FileText },
      { label: "Licenças e Alvarás", href: "/licencas", icon: ShieldCheck },
      { label: "Tarefas", href: "/tarefas", icon: ClipboardCheck },
    ],
  },
  {
    label: "Operações e Resultados",
    items: [
      { label: "Gestão Operacional", href: "/operacional", icon: Truck },
      { label: "Gestão Financeira", href: "/financeiro", icon: CreditCard },
      { label: "Relatórios e Indicadores", href: "/relatorios", icon: ChartColumn },
    ],
  },
  {
    label: "Administração",
    items: [
      { label: "Usuários e Permissões", href: "/usuarios", icon: UserRoundCog },
      {
        label: "Configurações",
        href: "/configuracoes",
        icon: Settings,
      },
    ],
  },
];

/**
 * Módulos do menu que ainda não possuem tela própria.
 * A rota dinâmica `(app)/[modulo]` os exibe como "em desenvolvimento".
 */
export const modulosPendentes: Record<string, { titulo: string; descricao: string }> = {
  unidades: { titulo: "Gestão de Unidades", descricao: "Cadastro e acompanhamento das unidades operacionais." },
  documentos: { titulo: "Documentos", descricao: "Emissão, cadastro e acompanhamento de documentos." },
  licencas: { titulo: "Licenças e Alvarás", descricao: "Controle de vigência e renovação de licenças e alvarás." },
  tarefas: { titulo: "Tarefas", descricao: "Rotinas operacionais, prazos e responsáveis." },
  financeiro: { titulo: "Gestão Financeira", descricao: "Contas, crédito e conciliação." },
  relatorios: { titulo: "Relatórios e Indicadores", descricao: "Indicadores consolidados e relatórios gerenciais." },
  usuarios: { titulo: "Usuários e Permissões", descricao: "Equipe, perfis de acesso e permissões." },
  configuracoes: { titulo: "Configurações", descricao: "Preferências da empresa e da plataforma." },
};

/** Rótulo do último item do breadcrumb para cada rota. */
export function tituloDaRota(pathname: string): string {
  const rota = pathname.replace(/\/+$/, "") || "/";
  const titulos: Record<string, string> = {
    "/dashboard": "Visão Geral",
    "/configuracoes": "Configurações",
    "/configuracoes/empresa": "Dados da Empresa",
    "/configuracoes/seguranca": "Segurança e Acesso",
    "/configuracoes/notificacoes": "Notificações",
    "/configuracoes/preferencias": "Preferências do Sistema",
    "/configuracoes/parametros-financeiros": "Parâmetros Financeiros",
    "/configuracoes/integracoes-auditoria": "Integrações e Auditoria",
    "/notificacoes": "Notificações",
    "/operacional": "Gestão Operacional",
    "/operacional/registrar-ocorrencia": "Registrar Ocorrência",
    "/usuarios/novo": "Novo Usuário",
    "/unidades/nova": "Cadastrar Nova Unidade",
    "/unidades/novo": "Cadastrar Nova Unidade",
    "/licencas/cadastrar": "Cadastrar Licença ou Alvará",
    "/documentos/new": "Novo Documento",
  };
  if (titulos[rota]) return titulos[rota];
  if (/^\/(usuarios|users)\/[^/]+$/.test(rota)) return "Detalhes do Usuário";
  if (/^\/unidades\/[^/]+\/editar$/.test(rota)) return "Editar Unidade";
  const slug = pathname.replace(/^\//, "").split("/")[0];
  return modulosPendentes[slug]?.titulo ?? "Página";
}

export const ROTAS = {
  dashboard: "/dashboard",
  login: "/login",
  tarefas: "/tarefas",
  notificacoes: "/configuracoes/notificacoes",
  documentos: "/documentos",
  licencas: "/licencas",
  unidades: "/unidades",
  relatorios: "/relatorios",
  usuarios: "/usuarios",
  configuracoes: "/configuracoes",
} as const;
