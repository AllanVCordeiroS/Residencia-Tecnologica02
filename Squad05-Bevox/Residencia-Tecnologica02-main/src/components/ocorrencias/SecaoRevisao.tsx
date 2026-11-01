import {
  Clock,
  FileText,
  Gauge,
  ImageIcon,
  Paperclip,
  SquarePen,
  Timer,
} from "lucide-react";
import CartaoRevisao from "./CartaoRevisao";
import LinhaRevisao, { ValorVazio } from "./LinhaRevisao";
import Pilula from "./Pilula";
import SecaoCard from "./SecaoCard";

// Dados de exemplo, iguais aos da imagem. Na etapa 6 virão do formulário.
const ARQUIVOS_EXEMPLO = [
  { nome: "nota-fiscal-123.pdf", tamanho: "2,4 MB", tipo: "pdf" },
  { nome: "foto-estoque.jpg", tamanho: "1,6 MB", tipo: "imagem" },
] as const;

export default function SecaoRevisao() {
  return (
    <SecaoCard
      id="secao-revisao"
      icon={Gauge}
      titulo="4. Revisão"
      descricao="Confira as informações antes de finalizar o registro."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* 1. Informações principais */}
        <CartaoRevisao
          icon={SquarePen}
          titulo="Informações Principais"
          editarHref="#secao-informacoes"
        >
          <dl>
            <LinhaRevisao label="Tipo">
              <ValorVazio />
            </LinhaRevisao>
            <LinhaRevisao label="Categoria">
              <ValorVazio />
            </LinhaRevisao>
            <LinhaRevisao label="Unidade">
              <ValorVazio />
            </LinhaRevisao>
            <LinhaRevisao label="Gravidade">
              <ValorVazio />
            </LinhaRevisao>
            <LinhaRevisao label="Título">
              <span
                className="block max-w-[9rem] truncate text-[12px] font-semibold text-slate-900"
                title="Divergência no recebimento de mercadorias"
              >
                Divergência no recebimento de mercadorias
              </span>
            </LinhaRevisao>
            <LinhaRevisao label="Data e Hora">
              <span className="text-[12px] font-medium text-slate-800">
                17/04/2026 10:30
              </span>
            </LinhaRevisao>
            <LinhaRevisao label="Descrição">
              <ValorVazio>Não informada</ValorVazio>
            </LinhaRevisao>
          </dl>
        </CartaoRevisao>

        {/* 2. Detalhes e evidências */}
        <CartaoRevisao
          icon={Paperclip}
          titulo="Detalhes & Evidências"
          editarHref="#secao-detalhes"
        >
          <dl>
            <LinhaRevisao label="Anexos Totais">
              <Pilula tom="azul">2 arquivos</Pilula>
            </LinhaRevisao>
            <LinhaRevisao label="Imagens">
              <span className="text-[12px] font-medium text-slate-800">
                0 imagens
              </span>
            </LinhaRevisao>
            <LinhaRevisao label="Observações">
              <ValorVazio />
            </LinhaRevisao>
          </dl>

          <ul className="mt-3 space-y-2">
            {ARQUIVOS_EXEMPLO.map((arquivo) => (
              <li
                key={arquivo.nome}
                className="flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-2 text-[12px]"
              >
                {arquivo.tipo === "pdf" ? (
                  <FileText
                    className="h-3.5 w-3.5 shrink-0 text-red-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ImageIcon
                    className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-slate-800">
                  {arquivo.nome}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-slate-400">
                  {arquivo.tamanho}
                </span>
              </li>
            ))}
          </ul>
        </CartaoRevisao>

        {/* 3. Responsáveis e prazos */}
        <CartaoRevisao
          icon={Timer}
          titulo="Responsáveis & Prazos"
          editarHref="#secao-responsaveis"
        >
          <dl>
            <LinhaRevisao label="Responsável">
              <ValorVazio />
            </LinhaRevisao>
            <LinhaRevisao label="Equipe">
              <ValorVazio />
            </LinhaRevisao>
            <LinhaRevisao label="Prazo Limite">
              <Pilula tom="ambar">17/04/2026</Pilula>
            </LinhaRevisao>
            <LinhaRevisao label="Prioridade">
              <span className="text-[12px] font-bold text-red-600">Alta</span>
            </LinhaRevisao>
            <LinhaRevisao label="Tarefa Vinculada">
              <span className="text-[12px] font-bold text-emerald-600">
                Ativada
              </span>
            </LinhaRevisao>
          </dl>
        </CartaoRevisao>

        {/* 4. Validação */}
        <CartaoRevisao icon={Gauge} titulo="Validação do Registro">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Status atual
          </p>
          <div className="mt-2">
            <Pilula tom="azul" ponto>
              Em preenchimento
            </Pilula>
          </div>

          <div className="mt-3 flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-[12px] leading-snug text-blue-800">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <p>
              Revise os campos obrigatórios pendentes antes de confirmar o
              registro.
            </p>
          </div>
        </CartaoRevisao>
      </div>
    </SecaoCard>
  );
}