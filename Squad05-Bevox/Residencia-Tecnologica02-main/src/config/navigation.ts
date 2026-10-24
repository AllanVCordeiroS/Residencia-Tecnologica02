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
      { label: "Configurações", href: "/configuracoes", icon: Settings },
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
  operacional: { titulo: "Gestão Operacional", descricao: "Estoque, rotas e operação de campo." },
  financeiro: { titulo: "Gestão Financeira", descricao: "Contas, crédito e conciliação." },
  relatorios: { titulo: "Relatórios e Indicadores", descricao: "Indicadores consolidados e relatórios gerenciais." },
  usuarios: { titulo: "Usuários e Permissões", descricao: "Equipe, perfis de acesso e permissões." },
  configuracoes: { titulo: "Configurações", descricao: "Preferências da empresa e da plataforma." },
  notificacoes: { titulo: "Notificações", descricao: "Histórico completo de alertas e avisos." },
};

/** Rótulo do último item do breadcrumb para cada rota. */
export function tituloDaRota(pathname: string): string {
  if (pathname === "/dashboard") return "Visão Geral";
  const slug = pathname.replace(/^\//, "").split("/")[0];
  return modulosPendentes[slug]?.titulo ?? "Página";
}

export const ROTAS = {
  dashboard: "/dashboard",
  login: "/login",
  tarefas: "/tarefas",
  notificacoes: "/notificacoes",
  documentos: "/documentos",
  licencas: "/licencas",
  unidades: "/unidades",
  relatorios: "/relatorios",
  usuarios: "/usuarios",
  configuracoes: "/configuracoes",
} as const;
