"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FileDropzone from "@/components/documents/import/FileDropzone";

type Item = {
  nome: string;
  progresso: number;
  status: "enviando" | "sucesso" | "erro";
};

export default function ImportPage() {
  const router = useRouter();
  const [itens, setItens] = useState<Item[]>([]);

  function iniciar(files: File[]) {
    const inicio = itens.length;
    const novos: Item[] = files.map((f) => ({
      nome: f.name,
      progresso: 0,
      status: "enviando",
    }));
    setItens((antes) => [...antes, ...novos]);

    files.forEach((arquivo, i) => {
      const posicao = inicio + i;
      const timer = setInterval(() => {
        setItens((atual) =>
          atual.map((item, j) => {
            if (j !== posicao || item.status !== "enviando") return item;
            const p = item.progresso + 10;
            if (p < 100) return { ...item, progresso: p };
            const grande = arquivo.size > 10 * 1024 * 1024;
            return { ...item, progresso: 100, status: grande ? "erro" : "sucesso" };
          })
        );
      }, 300);
      setTimeout(() => clearInterval(timer), 4000);
    });
  }

  const terminou =
    itens.length > 0 && itens.every((item) => item.status !== "enviando");

  return (
    <div style={{ padding: 24 }}>
      <h1>Importação em Lote</h1>
      <FileDropzone onFilesSelected={iniciar} />

      <ul style={{ marginTop: 16 }}>
        {itens.map((item, i) => (
          <li key={i} style={{ marginBottom: 12 }}>
            <div>
              {item.nome} -{" "}
              {item.status === "enviando" && "Enviando..."}
              {item.status === "sucesso" && "Sucesso"}
              {item.status === "erro" && "Erro (arquivo maior que 10 MB)"}
            </div>
            <div style={{ background: "#ddd", height: 8, borderRadius: 4 }}>
              <div
                style={{
                  width: `${item.progresso}%`,
                  height: 8,
                  borderRadius: 4,
                  background: item.status === "erro" ? "red" : "green",
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <button disabled={!terminou} onClick={() => router.push("/documents")}>
        Concluir
      </button>
    </div>
  );
}