import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";

type SecaoCardProps = {
  id: string;
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  children: ReactNode;
};

export default function SecaoCard({
  id,
  icon: Icon,
  titulo,
  descricao,
  children,
}: SecaoCardProps) {
  return (
    <Card aria-labelledby={id} className="p-6">
      <header className="flex items-center gap-3 border-b border-line pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <CardTitle id={id} titulo={titulo} subtitulo={descricao} />
      </header>

      <div className="pt-5">{children}</div>
    </Card>
  );
}