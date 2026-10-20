const tipos = [
  {
    value: "filial",
    title: "Filial / CDD Distribuição",
    description: "Armazenamento amplo, faturamento próprio e despacho regional.",
  },
  {
    value: "cross-docking",
    title: "Ponto de Cross-Docking",
    description: "Transbordo rápido sem estocagem prolongada de cargas.",
  },
  {
    value: "hub-urbano",
    title: "Hub Urbano Express",
    description: "Atendimento de última milha (last-mile) para centros adensados.",
  },
  {
    value: "deposito",
    title: "Depósito Fechado",
    description: "Exclusivo para guarda de estoque pulmão da matriz.",
  },
];

export default function TipoEstabelecimento() {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-slate-600">
        Tipo de Estabelecimento / Formato Operacional
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {tipos.map((tipo, index) => (
          <label
            key={tipo.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/70 has-[:checked]:ring-1 has-[:checked]:ring-blue-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-500"
          >
            <input
              type="radio"
              name="tipoEstabelecimento"
              value={tipo.value}
              defaultChecked={index === 0}
              className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
            />
            <span className="leading-snug">
              <span className="block text-xs font-bold text-[#0b1530]">
                {tipo.title}
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {tipo.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}