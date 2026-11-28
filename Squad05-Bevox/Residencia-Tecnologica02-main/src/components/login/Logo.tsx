import Image from "next/image";

/**
 * Logo provisória. Para usar a logo oficial, coloque o arquivo em /public
 * (ex.: public/bevox-logo.png) e troque o conteúdo por:
 *   <Image src="/bevox-logo.png" alt="BEVOX" width={96} height={40} priority />
 */
export default function Logo() {
  return (
    <div className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-lg shadow-black/20 ring-1 ring-black/5">
      <Image
        src="/bevox-logo-oficial.png"
        alt="BEVOX — distribuição de bebidas e plataforma de gestão B2B"
        width={190}
        height={76}
        priority
        className="h-auto w-[170px] object-contain"
      />
    </div>
  );
}
