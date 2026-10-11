import { BeerIcon } from "./icons";

/**
 * Logo provisória. Para usar a logo oficial, coloque o arquivo em /public
 * (ex.: public/bevox-logo.png) e troque o conteúdo por:
 *   <Image src="/bevox-logo.png" alt="BEVOX" width={96} height={40} priority />
 */
export default function Logo() {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 shadow-lg shadow-black/20 ring-1 ring-black/5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <BeerIcon className="h-4.5 w-4.5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-[#0b1530]">
        BEVOX
      </span>
    </div>
  );
}