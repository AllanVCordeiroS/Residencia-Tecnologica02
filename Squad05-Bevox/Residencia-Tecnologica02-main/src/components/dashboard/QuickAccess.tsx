import Link from "next/link";
import { Building2, ChartLine, CirclePlus, FilePlus, ShieldPlus, Users, type LucideIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { ROTAS } from "@/config/navigation";

/**
 * Ainda não existem formulários de cadastro; os atalhos levam ao módulo
 * correspondente (hoje uma tela informativa) em vez de simular a ação.
 */
const ATALHOS: { titulo: string; href: string; icone: LucideIcon }[] = [
  { titulo: "Cadastrar Documento", href: ROTAS.documentos, icone: FilePlus },
  { titulo: "Nova Tarefa", href: ROTAS.tarefas, icone: CirclePlus },
  { titulo: "Cadastrar Licença", href: ROTAS.licencas, icone: ShieldPlus },
  { titulo: "Ver Indicadores", href: ROTAS.relatorios, icone: ChartLine },
  { titulo: "Gerenciar Unidades", href: ROTAS.unidades, icone: Building2 },
  { titulo: "Gerenciar Equipe", href: ROTAS.usuarios, icone: Users },
];

export default function QuickAccess() {
  return (
    <Card aria-labelledby="acesso-rapido" className="p-5 sm:p-6">
      <CardTitle id="acesso-rapido" titulo="Acesso Rápido" subtitulo="Acesse diretamente as funcionalidades e fluxos mais utilizados." />
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ATALHOS.map(({ titulo, href, icone: Icone }) => (
          <li key={titulo}>
            <Link
              href={href}
              className="group flex h-full min-h-[7rem] flex-col items-center justify-center gap-2.5 rounded-xl border border-line bg-slate-50/60 p-3 text-center transition hover:border-blue-200 hover:bg-blue-50/60 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-line group-hover:ring-blue-200">
                <Icone className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[12px] font-medium leading-tight text-slate-700">{titulo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
