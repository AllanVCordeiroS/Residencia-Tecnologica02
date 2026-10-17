import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ROTAS } from "@/config/navigation";

export default function BrandCard() {
  return (
    <section
      aria-labelledby="proposta"
      className="flex flex-col justify-between rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 p-6 text-white"
    >
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/15 text-blue-300">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 id="proposta" className="mt-8 text-xl font-bold leading-snug tracking-tight">
          Juntos, por uma gestão mais eficiente.
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
          BEVOX • Tecnologia corporativa e inteligência de distribuição a favor do seu negócio.
        </p>
      </div>
      <Link
        href={ROTAS.sobre}
        className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-navy-900 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Saiba mais <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
