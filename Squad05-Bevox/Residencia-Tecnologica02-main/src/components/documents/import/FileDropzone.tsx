"use client";
import { useRef, useState } from "react";

const TIPOS = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

type Props = { onFilesSelected: (files: File[]) => void };

export default function FileDropzone({ onFilesSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState("");

  function processar(lista: FileList | null) {
    if (!lista) return;
    const todos = Array.from(lista);
    const validos = todos.filter((a) => TIPOS.includes(a.type));
    setErro(
      validos.length < todos.length
        ? "Só são aceitos PDF e imagens (PNG, JPG, WEBP)."
        : ""
    );
    if (validos.length > 0) onFilesSelected(validos);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          processar(e.dataTransfer.files);
        }}
        style={{ border: "2px dashed #999", padding: 32, cursor: "pointer" }}
      >
        Arraste arquivos aqui ou clique para escolher
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,image/*"
        hidden
        onChange={(e) => processar(e.target.files)}
      />
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}