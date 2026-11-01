import { Camera, ImageIcon, Paperclip, UploadCloud } from "lucide-react";
import AreaTextoContador from "./AreaTextoContador";
import Campo from "./Campo";
import ItemArquivo, { type TipoArquivo } from "./ItemArquivo";
import SecaoCard from "./SecaoCard";
import ZonaUpload from "./ZonaUpload";

// Dados de exemplo, iguais aos da imagem de referência.
const ARQUIVOS_EXEMPLO: { nome: string; tamanho: string; tipo: TipoArquivo }[] = [
  { nome: "nota-fiscal-123.pdf", tamanho: "2,4 MB", tipo: "pdf" },
  { nome: "foto-estoque.jpg", tamanho: "1,6 MB", tipo: "imagem" },
];

export default function SecaoDetalhesEvidencias() {
  return (
    <SecaoCard
      id="secao-detalhes"
      icon={Paperclip}
      titulo="2. Detalhes e evidências"
      descricao="Anexe arquivos, fotos e outras informações que ajudem na análise da ocorrência."
    >
      <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
        {/* Anexos */}
        <div>
          <p className="text-[13px] font-semibold text-slate-800">Anexos</p>
          <p className="mb-2.5 mt-0.5 text-[11px] leading-snug text-slate-400">
            Adicione documentos (PDF, JPG, PNG, DOC, DOCX). Tamanho máximo: 10MB
            por arquivo.
          </p>
          <ZonaUpload
            id="anexos"
            icon={UploadCloud}
            botaoIcon={Paperclip}
            botaoTexto="Selecionar arquivos"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          >
            Arraste arquivos aqui ou{" "}
            <span className="font-medium text-blue-600">clique para selecionar</span>
          </ZonaUpload>
        </div>

        {/* Evidências */}
        <div>
          <p className="text-[13px] font-semibold text-slate-800">
            Evidências (fotos)
          </p>
          <p className="mb-2.5 mt-0.5 text-[11px] leading-snug text-slate-400">
            Adicione imagens que comprovem a ocorrência.
          </p>
          <ZonaUpload
            id="fotos"
            icon={Camera}
            botaoIcon={ImageIcon}
            botaoTexto="Selecionar do dispositivo"
            accept="image/*"
          >
            <span className="font-medium text-blue-600">Adicionar imagens</span>
          </ZonaUpload>
        </div>

        {/* Arquivos anexados */}
        <div>
          <p className="text-[13px] font-medium text-slate-700">
            Arquivos anexados
          </p>
          <ul className="mt-2.5 space-y-2.5">
            {ARQUIVOS_EXEMPLO.map((arquivo) => (
              <ItemArquivo key={arquivo.nome} {...arquivo} />
            ))}
          </ul>
        </div>

        {/* Observações */}
        <Campo id="observacoes" label="Observações adicionais">
          <AreaTextoContador
            id="observacoes"
            name="observacoes"
            max={500}
            rows={3}
            placeholder="Inclua observações que possam auxiliar na análise da ocorrência..."
          />
        </Campo>
      </div>
    </SecaoCard>
  );
}