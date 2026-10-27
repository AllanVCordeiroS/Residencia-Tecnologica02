"use client";

import { useState, type TextareaHTMLAttributes } from "react";
import { campoBase } from "./campoStyles";

type AreaTextoContadorProps = {
  max: number;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "maxLength" | "onChange"
>;

export default function AreaTextoContador({
  max,
  ...textareaProps
}: AreaTextoContadorProps) {
  const [total, setTotal] = useState(0);

  return (
    <div className="relative">
      <textarea
        rows={4}
        maxLength={max}
        onChange={(evento) => setTotal(evento.target.value.length)}
        className={`${campoBase} resize-none px-3.5 pb-7 pt-2.5`}
        {...textareaProps}
      />
      <span className="pointer-events-none absolute bottom-2.5 right-3.5 font-mono text-[10px] text-slate-400">
        {total}/{max}
      </span>
    </div>
  );
}