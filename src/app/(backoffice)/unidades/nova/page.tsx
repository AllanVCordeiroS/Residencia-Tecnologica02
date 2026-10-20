import {
  ArrowLeftIcon,
  BuildingIcon,
  MapIcon,
  MapPinIcon,
} from "@/components/backoffice/icons";
import Breadcrumb from "@/components/unidades/Breadcrumb";
import DadosFiscais from "@/components/unidades/DadosFiscais";
import SectionCard from "@/components/unidades/SectionCard";
import Stepper from "@/components/unidades/Stepper";
import TipoEstabelecimento from "@/components/unidades/TipoEstabelecimento";

export const metadata = { title: "BEVOX | Cadastrar Nova Unidade" };

const breadcrumb = [
  { label: "BEVOX" },
  { label: "Gestão Corporativa" },
  { label: "Gestão de Unidades" },
  { label: "Nova Unidade", current: true },
];

export default function NovaUnidadePage() {
  return (
    <div className="space-y-5">
      <header>
        <Breadcrumb items={breadcrumb} />

        <div className="mt-2 flex items-center gap-3">
          {/* TODO (grupo): apontar para a lista de unidades quando existir. */}
          <a
            href="#"
            aria-label="Voltar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </a>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1530]">
            Cadastrar Nova Unidade
          </h1>
        </div>

        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Adicione uma nova filial, centro de distribuição ou entreposto
          logístico à rede da Adega Distribution.
        </p>
      </header>

      <Stepper current={1} />

      <div className="max-w-3xl space-y-5">
        {/* Seção 1 */}
        <SectionCard
          icon={<BuildingIcon className="h-5 w-5" />}
          title="1. Identificação da Unidade"
          description="Classificação física, razão social e dados fiscais na SEFAZ-PE."
          action={
            <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              Obrigatório
            </span>
          }
        >
          <TipoEstabelecimento />

          <div className="mt-6">
            <DadosFiscais />
          </div>
        </SectionCard>

        {/* Seção 2: a imagem de referência termina no cabeçalho */}
        <SectionCard
          icon={<MapPinIcon className="h-5 w-5" />}
          title="2. Endereço & Logística de Acesso"
          description="Localização geográfica, polo regional e diretrizes de circulação pesada."
          action={
            // TODO (grupo): abrir o mapa quando houver integração.
            <a
              href="#"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
            >
              <MapIcon className="h-3.5 w-3.5" />
              Ver no Mapa
            </a>
          }
        />
      </div>
    </div>
  );
}