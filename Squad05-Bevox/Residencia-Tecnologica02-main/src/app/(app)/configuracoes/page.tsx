import Link from "next/link";
import {
  Bell,
  Building2,
  ChevronRight,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const configurationLinks = [
  {
    href: "/configuracoes/empresa",
    label: "Empresa",
    description: "Dados cadastrais e identidade da empresa.",
    icon: Building2,
  },
  {
    href: "/configuracoes/seguranca",
    label: "Segurança",
    description: "Políticas de acesso e autenticação.",
    icon: ShieldCheck,
  },
  {
    href: "/configuracoes/notificacoes",
    label: "Notificações",
    description: "Alertas e preferências de comunicação.",
    icon: Bell,
  },
  {
    href: "/configuracoes/preferencias",
    label: "Preferências",
    description: "Idioma, formato de data e visualização.",
    icon: SlidersHorizontal,
  },
  {
    href: "/configuracoes/parametros-financeiros",
    label: "Parâmetros financeiros",
    description: "Moedas, categorias e regras financeiras.",
    icon: Settings,
  },
];

export default function ConfiguracoesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <header className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Settings size={24} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
          <p className="text-sm text-slate-500">
            Gerencie as preferências e os parâmetros do BEVOX.
          </p>
        </div>
      </header>

      <nav aria-label="Seções de configuração" className="grid gap-4 md:grid-cols-2">
        {configurationLinks.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-blue-300"
          >
            <span className="flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-slate-800">{label}</span>
                <span className="mt-1 block text-sm text-slate-500">{description}</span>
              </span>
            </span>
            <ChevronRight
              size={18}
              aria-hidden="true"
              className="shrink-0 text-slate-400 transition-colors group-hover:text-blue-600"
            />
          </Link>
        ))}
      </nav>
    </main>
  );
}