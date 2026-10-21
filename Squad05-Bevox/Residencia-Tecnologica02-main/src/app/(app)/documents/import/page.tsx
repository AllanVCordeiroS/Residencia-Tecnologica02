"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import FileDropzone from "@/components/documents/import/FileDropzone";

type Item = {
  id: number;
  nome: string;
  tamanho: number;
  tipo: string;
  progresso: number;
  status: "enviando" | "sucesso" | "erro";
};

function formatar(bytes: number) {
  return bytes >= 1024 * 1024
    ? (bytes / 1024 / 1024).toFixed(1) + " MB"
    : Math.max(1, Math.round(bytes / 1024)) + " KB";
}

export default function ImportPage() {
  const router = useRouter();
  const [itens, setItens] = useState<Item[]>([]);
  const proximoId = useRef(1);

  function iniciar(files: File[]) {
    const novos: Item[] = files.map((f) => ({
      id: proximoId.current++,
      nome: f.name,
      tamanho: f.size,
      tipo: (f.name.split(".").pop() || "").toUpperCase(),
      progresso: 0,
      status: "enviando",
    }));
    setItens((antes) => [...antes, ...novos]);

    novos.forEach((novo) => {
      const timer = setInterval(() => {
        setItens((atual) =>
          atual.map((item) => {
            if (item.id !== novo.id || item.status !== "enviando") return item;
            const p = item.progresso + 10;
            if (p < 100) return { ...item, progresso: p };
            const grande = item.tamanho > 10 * 1024 * 1024;
            return { ...item, progresso: 100, status: grande ? "erro" : "sucesso" };
          })
        );
      }, 300);
      setTimeout(() => clearInterval(timer), 4000);
    });
  }

  function remover(id: number) {
    setItens((atual) => atual.filter((item) => item.id !== id));
  }

  const processados = itens.filter((i) => i.status === "sucesso").length;
  const comErro = itens.filter((i) => i.status === "erro").length;
  const andamento = itens.filter((i) => i.status === "enviando").length;
  const totalMB = (itens.reduce((s, i) => s + i.tamanho, 0) / 1024 / 1024).toFixed(2);
  const podeConfirmar = itens.length > 0 && andamento === 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15, 23, 42, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(720px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: 20,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Importação em Lote de Documentos</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Faça upload simulado de múltiplos PDFs, XMLs ou planilhas de indexação.
            </p>
          </div>
          <button
            onClick={() => router.push("/documents")}
            aria-label="Fechar"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <FileDropzone onFilesSelected={iniciar} />

          {itens.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
                FILA DE INGESTÃO E PROCESSAMENTO ({itens.length} arquivos)
              </div>
              {itens.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "6px 8px",
                        borderRadius: 6,
                        background: item.tipo === "PDF" ? "#fee2e2" : "#fef3c7",
                        color: item.tipo === "PDF" ? "#b91c1c" : "#b45309",
                      }}
                    >
                      {item.tipo}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, wordBreak: "break-all" }}>
                        {item.nome}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {formatar(item.tamanho)} •{" "}
                        {item.status === "enviando" && "Processando..."}
                        {item.status === "sucesso" && "Processado com sucesso"}
                        {item.status === "erro" && "Erro: arquivo maior que 10 MB"}
                      </div>
                    </div>
                    <button
                      onClick={() => remover(item.id)}
                      aria-label="Remover"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Trash2 size={16} color="#94a3b8" />
                    </button>
                  </div>
                  <div style={{ background: "#e2e8f0", height: 6, borderRadius: 3, marginTop: 10 }}>
                    <div
                      style={{
                        width: `${item.progresso}%`,
                        height: 6,
                        borderRadius: 3,
                        background: item.status === "erro" ? "#dc2626" : "#2563eb",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            padding: 20,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: 12, color: "#475569" }}>
            {itens.length} arquivos selecionados ({totalMB} MB) • {processados} processado(s),{" "}
            {andamento} em andamento, {comErro} com erro
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => router.push("/documents")}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              disabled={!podeConfirmar}
              onClick={() => router.push("/documents")}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                cursor: podeConfirmar ? "pointer" : "not-allowed",
                opacity: podeConfirmar ? 1 : 0.5,
              }}
            >
              Confirmar e Ingerir no Repositório ({itens.length} arquivos)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}