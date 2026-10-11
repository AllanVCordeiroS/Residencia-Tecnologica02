import type { ReactNode } from "react";
import { BuildingIcon, CheckCircleIcon, ShieldCheckIcon, TruckIcon } from "./icons";
import Logo from "./Logo";

type Feature = {
  icon: ReactNode;
  tag: string;
  title: string;
  text: string;
  iconBox: string;
};

const features: Feature[] = [
  {
    icon: <BuildingIcon className="h-4 w-4" />,
    tag: "Multi-filiais",
    title: "Matriz & 3 CDDs",
    text: "Recife, Olinda e Jaboatão centralizados em tempo real.",
    iconBox: "bg-blue-500/15 text-blue-300",
  },
  {
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    tag: "Compliance",
    title: "100% Automatizado",
    text: "Bloqueios automáticos para alvarás sanitários vencidos.",
    iconBox: "bg-emerald-500/15 text-emerald-300",
  },
  {
    icon: <TruckIcon className="h-4 w-4" />,
    tag: "FEFO & Logística",
    title: "Rastreamento Total",
    text: "Controle de giro por lote e ciclo reverso de vasilhames.",
    iconBox: "bg-cyan-500/15 text-cyan-300",
  },
];

const clients = [
  { label: "AD", className: "bg-blue-600" },
  { label: "BV", className: "bg-emerald-600" },
  { label: "+18", className: "bg-slate-600" },
];

export default function HeroPanel() {
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-[#050b1a] px-12 py-10 text-white lg:flex xl:px-16">
      {/* Brilhos de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
      />

      <header className="relative flex items-start justify-between gap-4">
        <Logo />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Ambiente Enterprise v4.8
        </span>
      </header>

      <div className="relative max-w-xl py-10">
        <span className="mb-6 inline-block rounded-md border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
          Plataforma de gestão B2B
        </span>

        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
          A inteligência operacional e regulatória para{" "}
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            distribuidoras de bebidas
          </span>{" "}
          de alta performance.
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300">
          Rastreabilidade completa do barril à garrafa, roteirização inteligente
          e controle preventivo de conformidade fiscal e sanitária em um único
          backoffice.
        </p>

        <ul className="mt-10 grid grid-cols-3 gap-3">
          {features.map((feature) => (
            <li
              key={feature.tag}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
            >
              <span
                className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${feature.iconBox}`}
              >
                {feature.icon}
              </span>
              <p className="text-[11px] font-medium text-slate-400">{feature.tag}</p>
              <p className="mt-0.5 text-sm font-bold leading-tight">{feature.title}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
                {feature.text}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <footer className="relative flex items-center justify-between gap-6 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {clients.map((client) => (
              <span
                key={client.label}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050b1a] text-[10px] font-bold ${client.className}`}
              >
                {client.label}
              </span>
            ))}
          </div>
          <div className="text-xs leading-snug">
            <p className="font-semibold text-slate-200">
              Utilizado por distribuidoras líderes
            </p>
            <p className="text-slate-400">Ex: Adega Distribution Nordeste, Primor Log</p>
          </div>
        </div>

        <p className="flex shrink-0 items-center gap-1.5 text-xs text-slate-300">
          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
          Disponibilidade SLA 99,98%
        </p>
      </footer>
    </section>
  );
}