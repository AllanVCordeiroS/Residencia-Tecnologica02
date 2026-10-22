"use client";
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

const EXTENSOES = ["pdf", "xml", "zip", "xlsx", "csv", "png", "jpg", "jpeg"];

type Props = { onFilesSelected: (files: File[]) => void };

export default function FileDropzone({ onFilesSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState("");

  function processar(lista: FileList | null) {
    if (!lista) return;
    const todos = Array.from(lista);
    const validos = todos.filter((a) => {
      const ext = a.name.split(".").pop()?.toLowerCase() ?? "";
      return EXTENSOES.includes(ext);
    });
    setErro(
      validos.length < todos.length
        ? "Alguns arquivos foram ignorados. Aceitamos PDF, XML, ZIP, XLSX, CSV e imagens."
        : ""
    );
    if (validos.length > 0) onFilesSelected(validos);
  }

  const etiqueta = {
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    background: "#fff",
  } as const;

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          processar(e.dataTransfer.files);
        }}
        style={{
          border: "2px dashed #93b4f5",
          borderRadius: 12,
          background: "#f5f8ff",
          padding: 32,
          textAlign: "center",
          cursor: "pointer",
        }}
      >
       <div style={{ display: "flex", justifyContent: "center" }}>
  <UploadCloud size={36} color="#2563eb" />
</div>
        <p style={{ margin: "12px 0" }}>
          Arraste múltiplos arquivos aqui ou{" "}
          <span style={{ color: "#2563eb" }}>clique para selecionar</span>
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <span style={etiqueta}>PDF</span>
          <span style={etiqueta}>XML (NF-e/CT-e)</span>
          <span style={etiqueta}>ZIP Regulatório</span>
          <span style={etiqueta}>Planilhas XLSX/CSV</span>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
          Limite até 50MB por lote (máx. 100 arquivos)
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.xml,.zip,.xlsx,.csv,.png,.jpg,.jpeg"
        hidden
        onChange={(e) => {
          processar(e.target.files);
          e.target.value = "";
        }}
      />
      {erro && <p style={{ color: "red", marginTop: 8 }}>{erro}</p>}
    </div>
  );
}