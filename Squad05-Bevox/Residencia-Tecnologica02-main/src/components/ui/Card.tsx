import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
  "aria-labelledby"?: string;
}) {
  return (
    <Tag
      {...rest}
      className={`rounded-2xl border border-line bg-white dark:bg-surface-raised shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </Tag>
  );
}

export function CardTitle({
  id,
  titulo,
  subtitulo,
}: {
  id: string;
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <div>
      <h2 id={id} className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-foreground">
        {titulo}
      </h2>
      {subtitulo && <p className="mt-0.5 text-[13px] text-slate-500 dark:text-foreground-muted">{subtitulo}</p>}
    </div>
  );
}
