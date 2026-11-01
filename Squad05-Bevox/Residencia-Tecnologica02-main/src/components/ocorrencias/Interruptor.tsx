"use client";

type InterruptorProps = {
  id: string;
  name: string;
  label: string;
  descricao: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Interruptor({
  id,
  name,
  label,
  descricao,
  checked,
  onChange,
}: InterruptorProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(evento) => onChange(evento.target.checked)}
        className="peer sr-only"
      />

      {/* A "bolinha" e o trilho são desenhados só com CSS */}
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-blue-600 peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500"
      />

      <span className="leading-tight">
        <span className="block text-[13px] font-semibold text-slate-800">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] text-slate-400">
          {descricao}
        </span>
      </span>
    </label>
  );
}