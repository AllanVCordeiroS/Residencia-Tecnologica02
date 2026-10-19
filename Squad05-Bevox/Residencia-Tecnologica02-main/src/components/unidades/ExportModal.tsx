"use client";

import { useState } from "react";
import { Archive, Check, FileSpreadsheet, FileText, LockKeyhole, X, Download, ShieldCheck } from "lucide-react";

export type FormatoRelatorio = "pdf" | "excel" | "csv" | "zip";
export type ModuloRelatorio = "cadastro" | "documentos" | "tarefas" | "licencas";

const formatos: { id: FormatoRelatorio; titulo: string; descricao: string; Icone: typeof FileText }[] = [
  { id: "pdf", titulo: "PDF Executivo", descricao: "Relatório pronto para impressão", Icone: FileText },
  { id: "excel", titulo: "Planilha Excel", descricao: "Dados em formato tabular", Icone: FileSpreadsheet },
  { id: "csv", titulo: "CSV Estruturado", descricao: "Dados para integração", Icone: FileText },
  { id: "zip", titulo: "Pacote Zip Regulatório", descricao: "Dossiê de dados estruturados", Icone: Archive },
];

interface UnidadeExportavel { nome: string; cnpj: string; cidade: string; tipo: string; responsavel: string; funcionarios: number; documentos: number; tarefas: number; licencas: number; situacao: string }
interface ExportModalProps { aberto: boolean; onFechar: () => void; unidades: UnidadeExportavel[] }

export default function ExportModal({ aberto, onFechar, unidades }: ExportModalProps) {
  const [formato, setFormato] = useState<FormatoRelatorio>("pdf");
  const [escopo, setEscopo] = useState("todas");
  const [periodo, setPeriodo] = useState("6m");
  const [modulos, setModulos] = useState<ModuloRelatorio[]>(["cadastro", "documentos", "tarefas", "licencas"]);
  if (!aberto) return null;

  const alternarModulo = (modulo: ModuloRelatorio) => setModulos((atuais) => atuais.includes(modulo) ? atuais.filter((item) => item !== modulo) : [...atuais, modulo]);
  const gerarRelatorio = () => {
    const dados = escopo === "todas" ? unidades : unidades.filter((u) => u.nome.toLowerCase().includes(escopo));
    const nomeArquivo = `bevox-relatorio-unidades-${new Date().toISOString().slice(0, 10)}`;
    if (formato === "pdf") {
      const janela = window.open("", "_blank", "width=1000,height=750");
      if (!janela) { window.alert("Permita pop-ups para gerar o relatório em PDF."); return; }
      const linhas = dados.map((u) => `<tr><td>${u.nome}</td><td>${u.cnpj}</td><td>${u.cidade}</td><td>${u.tipo}</td><td>${u.responsavel}</td><td>${u.funcionarios}</td><td>${u.situacao}</td></tr>`).join("");
      janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de Unidades BEVOX</title><style>body{font:12px Arial,sans-serif;padding:28px;color:#172033}h1{font-size:22px}p{color:#586174}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #dce2ed;padding:8px;text-align:left}th{background:#eff4ff}@media print{button{display:none}}</style></head><body><h1>Relatório de Unidades Operacionais</h1><p>Adega Distribution · Gerado em ${new Date().toLocaleDateString("pt-BR")} · Período: ${periodo}</p><table><thead><tr><th>Unidade</th><th>CNPJ</th><th>Cidade</th><th>Tipo</th><th>Responsável</th><th>Funcionários</th><th>Situação</th></tr></thead><tbody>${linhas}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`);
      janela.document.close();
      return;
    }
    const conteudo = formato === "zip" ? JSON.stringify({ relatorio: "Unidades Operacionais", geradoEm: new Date().toISOString(), periodo, modulos, unidades: dados }, null, 2) : ["Unidade;CNPJ;Cidade;Tipo;Responsável;Funcionários;Documentos;Tarefas;Licenças;Situação", ...dados.map((u) => [u.nome,u.cnpj,u.cidade,u.tipo,u.responsavel,u.funcionarios,u.documentos,u.tarefas,u.licencas,u.situacao].join(";"))].join("\n");
    const blob = new Blob(["\ufeff", conteudo], { type: formato === "zip" ? "application/json;charset=utf-8" : "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${nomeArquivo}.${formato === "zip" ? "json" : formato === "excel" ? "csv" : "csv"}`; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="export-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
    <section className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7"><div className="flex gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Download size={21}/></div><div><h2 id="export-title" className="text-lg font-bold text-slate-900">Exportar Relatório de Unidades Operacionais</h2><p className="mt-1 text-xs text-slate-500">Doc Ref: BEVOX-OPS-UNIT-2026 · Documento corporativo</p></div></div><button onClick={onFechar} aria-label="Fechar modal" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={19}/></button></header>
      <div className="max-h-[70vh] space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
        <section><h3 className="mb-3 text-sm font-bold text-slate-800">1. Formato do arquivo</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{formatos.map(({id,titulo,descricao,Icone}) => <button key={id} type="button" onClick={() => setFormato(id)} className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition ${formato === id ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300"}`}><Icone size={21} className={formato === id ? "text-blue-700" : "text-slate-500"}/><span className="flex-1"><span className="block text-sm font-semibold text-slate-800">{titulo}</span><span className="mt-1 block text-xs text-slate-500">{descricao}</span></span>{formato === id && <Check size={17} className="text-blue-700"/>}</button>)}</div></section>
        <section><h3 className="mb-3 text-sm font-bold text-slate-800">2. Escopo &amp; filtros</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600">Unidades inclusas<select value={escopo} onChange={(e) => setEscopo(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"><option value="todas">Todas as unidades</option>{unidades.map((u) => <option key={u.nome} value={u.nome.toLowerCase()}>{u.nome}</option>)}</select></label><label className="text-xs font-medium text-slate-600">Período dos indicadores<select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"><option value="30d">Últimos 30 dias</option><option value="3m">Últimos 3 meses</option><option value="6m">Últimos 6 meses</option><option value="1a">Último ano</option></select></label></div></section>
        <section><h3 className="mb-3 text-sm font-bold text-slate-800">3. Módulos a incluir</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{([{id:"cadastro",label:"Cadastro das unidades",desc:"Dados cadastrais e responsáveis"},{id:"documentos",label:"Documentos",desc:"Regularidade e pendências"},{id:"tarefas",label:"Tarefas operacionais",desc:"Atribuições e status"},{id:"licencas",label:"Licenças e alvarás",desc:"Validade e vencimentos"}] as {id:ModuloRelatorio;label:string;desc:string}[]).map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3"><input type="checkbox" checked={modulos.includes(item.id)} onChange={() => alternarModulo(item.id)} className="mt-1 h-4 w-4 accent-blue-600"/><span><span className="block text-sm font-medium text-slate-800">{item.label}</span><span className="mt-0.5 block text-xs text-slate-500">{item.desc}</span></span></label>)}</div></section>
        <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4"><LockKeyhole size={20} className="mt-0.5 shrink-0 text-blue-700"/><div><p className="text-sm font-semibold text-slate-800">Trilha de Auditoria &amp; Rastreabilidade</p><p className="mt-1 text-xs leading-5 text-slate-600">A exportação é preparada para rastreabilidade, com referência de integridade SHA-256 prevista no fluxo corporativo e atenção às diretrizes da LGPD. A geração local deste protótipo não calcula nem assina um hash criptográfico.</p></div><ShieldCheck size={18} className="ml-auto mt-0.5 shrink-0 text-blue-600"/></div>
      </div>
      <footer className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><p className="text-xs text-slate-500"><span className="font-semibold text-emerald-700">● Pronto para gerar</span><br/>Formato A4 protegido · {unidades.length} unidades disponíveis</p><div className="flex gap-2"><button onClick={onFechar} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancelar</button><button onClick={gerarRelatorio} disabled={modulos.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Download size={16}/>Gerar e baixar relatório</button></div></footer>
    </section>
  </div>;
}