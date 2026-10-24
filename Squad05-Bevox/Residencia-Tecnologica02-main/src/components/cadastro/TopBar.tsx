import Link from "next/link";
import { ChevronDownIcon, GlobeIcon } from "@/components/login/icons";
import BMark from "./BMark";

export default function TopBar() {
  return (
    <header className="bg-[#1a2336] px-4 text-white sm:px-6">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Esquerda: marca */}
        <div className="flex items-center gap-2.5">
          <BMark />
          <div className="leading-none">
            <p className="text-lg font-bold tracking-tight">BEVOX</p>
            <p className="mt-1 text-[10px] font-bold tracking-wider text-orange-500">
              B2B ECOSYSTEM
            </p>
          </div>
        </div>

        {/* Centro: título (some no celular) */}
        <p className="hidden text-sm font-semibold md:block">
          Cadastro de Colaborador
        </p>

        {/* Direita: idioma, link de entrar e avatar */}
        <div className="col-start-3 flex items-center justify-end gap-4">
          {/* O idioma ainda é fixo; o seletor é só visual. */}
          <span className="hidden items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-200 sm:inline-flex">
            <GlobeIcon className="h-3.5 w-3.5" />
            PT-BR
            <ChevronDownIcon className="h-3 w-3" />
          </span>

          <p className="hidden text-xs text-slate-300 sm:block">
            Já possui conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-white underline underline-offset-2"
            >
              Entrar
            </Link>
          </p>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-[11px] font-extrabold text-slate-700">
            BV
          </span>
        </div>
      </div>
    </header>
  );
}