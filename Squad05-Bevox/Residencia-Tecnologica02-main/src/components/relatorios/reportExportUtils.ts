export type ReportFilters = {
  period: string;
  unit: string;
  category: string;
  comparison: string;
};

export type ReportExportUnit = {
  name: string;
  tasks: number;
  docs: number;
  occurrences: number;
};

export type ReportExportCost = { name: string; value: number; amount: string };
export type ReportExportMetric = { label: string; value: string; category: string };
export type ReportExportFormat = "pdf" | "xlsx" | "zip";
export type ReportExportTemplate = { id: string; title: string; eyebrow: string; description: string };

type ExportInput = {
  format: ReportExportFormat;
  template: ReportExportTemplate;
  formatTitle: string;
  filters: ReportFilters;
  metrics: ReportExportMetric[];
  units: ReportExportUnit[];
  costs: ReportExportCost[];
};

const htmlEntities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: string | number) => String(value).replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char);
const xmlEscape = (value: string | number) => escapeHtml(value).replaceAll("&#39;", "&apos;");
const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
const bytesFromText = (text: string) => new TextEncoder().encode(text);

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function joinBytes(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
  let offset = 0;
  parts.forEach((part) => { output.set(part, offset); offset += part.length; });
  return output;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zip(files: { name: string; content: string | Uint8Array }[]) {
  const local: Uint8Array[] = [], central: Uint8Array[] = [];
  let offset = 0;
  const set16 = (view: DataView, at: number, value: number) => view.setUint16(at, value, true);
  const set32 = (view: DataView, at: number, value: number) => view.setUint32(at, value >>> 0, true);
  for (const file of files) {
    const name = bytesFromText(file.name);
    const content = typeof file.content === "string" ? bytesFromText(file.content) : file.content;
    const crc = crc32(content), header = new Uint8Array(30), directory = new Uint8Array(46);
    const h = new DataView(header.buffer), d = new DataView(directory.buffer);
    set32(h, 0, 0x04034b50); set16(h, 4, 20); set16(h, 6, 0x0800); set16(h, 8, 0);
    set16(h, 10, 0); set16(h, 12, 33); set32(h, 14, crc); set32(h, 18, content.length);
    set32(h, 22, content.length); set16(h, 26, name.length); set16(h, 28, 0);
    set32(d, 0, 0x02014b50); set16(d, 4, 20); set16(d, 6, 20); set16(d, 8, 0x0800);
    set16(d, 10, 0); set16(d, 12, 0); set16(d, 14, 33); set32(d, 16, crc);
    set32(d, 20, content.length); set32(d, 24, content.length); set16(d, 28, name.length);
    set16(d, 30, 0); set16(d, 32, 0); set16(d, 34, 0); set16(d, 36, 0);
    set32(d, 38, 0); set32(d, 42, offset);
    local.push(header, name, content); central.push(directory, name);
    offset += header.length + name.length + content.length;
  }
  const localData = joinBytes(local), centralData = joinBytes(central), end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  set32(e, 0, 0x06054b50); set16(e, 4, 0); set16(e, 6, 0); set16(e, 8, files.length);
  set16(e, 10, files.length); set32(e, 12, centralData.length); set32(e, 16, localData.length); set16(e, 20, 0);
  const bytes = joinBytes([localData, centralData, end]);
  return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: "application/zip" });
}

function columnName(index: number) {
  let result = "";
  for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + ((n - 1) % 26)) + result;
  return result;
}

function worksheet(rows: (string | number)[][]) {
  const body = rows.map((row, ri) => `<row r="${ri + 1}">${row.map((value, ci) => {
    const ref = `${columnName(ci)}${ri + 1}`;
    return typeof value === "number" && Number.isFinite(value)
      ? `<c r="${ref}" t="n"><v>${value}</v></c>`
      : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
  }).join("")}</row>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

function xlsx(sheets: { name: string; rows: (string | number)[][] }[]) {
  const sheetTags = sheets.map((s, i) => `<sheet name="${xmlEscape(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("");
  const relationTags = sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("");
  const overrideTags = sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
  return zip([
    { name: "[Content_Types].xml", content: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${overrideTags}</Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", content: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetTags}</sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", content: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationTags}</Relationships>` },
    ...sheets.map((sheet, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, content: worksheet(sheet.rows) })),
  ]);
}

function sha256(text: string) {
  if (!globalThis.crypto?.subtle) throw new Error("Este navegador não disponibilizou SHA-256.");
  return globalThis.crypto.subtle.digest("SHA-256", bytesFromText(text)).then((digest) =>
    Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
  );
}

function buildRows({ template, formatTitle, filters, metrics, units, costs }: Omit<ExportInput, "format">) {
  const date = new Date().toLocaleDateString("pt-BR");
  const metricRows: (string | number)[][] = [["Indicador", "Valor", "Categoria"], ...metrics.map(({ label, value, category }) => [label, value, category])];
  const unitRows: (string | number)[][] = [["Unidade", "Tarefas concluídas (%)", "Documentos regularizados (%)", "Ocorrências abertas"], ...units.map((u) => [u.name === "Matriz" ? "Matriz — Recife" : u.name, u.tasks, u.docs, u.occurrences])];
  const costRows: (string | number)[][] = [["Categoria de despesa", "Participação (%)", "Valor demonstrativo"], ...costs.map((c) => [c.name, c.value, c.amount])];
  const filterRows: (string | number)[][] = [["Parâmetro", "Valor selecionado"], ["Modelo de compilação", template.title], ["Formato", formatTitle], ["Período", filters.period], ["Unidade", filters.unit], ["Categoria", filters.category], ["Comparação", filters.comparison], ["Data de geração", date]];
  const csv = [["Dossiê Bevox — Relatórios e Indicadores"], ...filterRows, [], ["Indicadores"], ...metricRows, [], ["Desempenho por unidade"], ...unitRows, [], ["Despesas por categoria"], ...costRows].map((row) => row.map(csvCell).join(";")).join("\r\n");
  return { date, filterRows, metricRows, unitRows, costRows, csv };
}

export async function exportReportFile(input: ExportInput) {
  const { format, template, filters, metrics, units, costs } = input;
  const { date, filterRows, metricRows, unitRows, costRows, csv } = buildRows(input);
  const filename = `bevox-dossie-${template.id}-${new Date().toISOString().slice(0, 10)}`;
  if (format === "pdf") {
    const popup = window.open("", "_blank", "width=1000,height=750");
    if (!popup) throw new Error("O navegador bloqueou a nova janela. Permita pop-ups para preparar o PDF.");
    const rows = (data: (string | number)[][]) => data.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
    const filtersHtml = filterRows.slice(1).map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`).join("");
    popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(template.title)} — Bevox</title><style>@page{size:A4;margin:16mm}body{font:11px Arial;color:#182337;line-height:1.45}header{border-bottom:3px solid #2864f0;padding-bottom:16px;margin-bottom:20px}.brand{font-size:10px;letter-spacing:2px;font-weight:bold;color:#2864f0}h1{font-size:23px}h2{font-size:14px;margin:22px 0 8px}table{width:100%;border-collapse:collapse;margin-bottom:15px}th,td{border:1px solid #dbe3ee;padding:7px;text-align:left}th{background:#eef4ff}.callout{padding:10px;background:#f4f7fc}small{color:#66758b}</style></head><body><header><div class="brand">BEVOX · ADEGA DISTRIBUTION</div><h1>${escapeHtml(template.title)}</h1><p>${escapeHtml(template.eyebrow)} · Gerado em ${date}</p></header><p>${escapeHtml(template.description)}</p><div class="callout"><strong>Parâmetros do relatório</strong><ul>${filtersHtml}</ul></div><h2>Resumo de indicadores</h2><table><thead><tr><th>Indicador</th><th>Valor</th><th>Categoria</th></tr></thead><tbody>${rows(metricRows)}</tbody></table><h2>Desempenho por unidade</h2><table><thead><tr><th>Unidade</th><th>Tarefas</th><th>Documentos</th><th>Ocorrências</th></tr></thead><tbody>${rows(unitRows)}</tbody></table><h2>Despesas por categoria</h2><table><thead><tr><th>Categoria</th><th>Participação</th><th>Valor demonstrativo</th></tr></thead><tbody>${rows(costRows)}</tbody></table><small>Valores demonstrativos para fins de prototipação.</small><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250))<\/script></body></html>`);
    popup.document.close();
    return "Dossiê preparado para impressão. Na janela aberta, selecione “Salvar como PDF” para baixar o arquivo.";
  }
  if (format === "xlsx") {
    downloadBlob(xlsx([{ name: "Resumo", rows: [...filterRows, [], ...metricRows] }, { name: "Unidades", rows: unitRows }, { name: "Despesas", rows: costRows }]), `${filename}.xlsx`);
    return "Planilha XLSX gerada com as abas Resumo, Unidades e Despesas.";
  }

  const files = [
    { name: "relatorio-indicadores.csv", content: `\uFEFF${csv}` },
    { name: "resumo-dossie.json", content: JSON.stringify({ empresa: "Adega Distribution", produto: "Bevox", modelo: template.title, geradoEm: new Date().toISOString(), filtros: filters, observacao: "Dados demonstrativos; não representam informações financeiras reais.", indicadores: metrics, unidades: units, despesas: costs }, null, 2) },
    { name: "LEIA-ME.txt", content: "BEVOX — PACOTE DE DOSSIÊ\n\nDados demonstrativos exportados localmente. Os hashes verificam a integridade, mas não constituem assinatura digital nem autenticação corporativa.\n" },
  ];
  const hashes = await Promise.all(files.map(async (file) => ({ arquivo: file.name, sha256: await sha256(file.content) })));
  const manifest = JSON.stringify({ algoritmo: "SHA-256", geradoEm: new Date().toISOString(), observacao: "Manifesto de integridade; não constitui assinatura digital ou autenticação corporativa.", arquivos: hashes }, null, 2);
  downloadBlob(zip([...files, { name: "manifesto-integridade.json", content: manifest }]), `${filename}.zip`);
  return "Pacote ZIP gerado com manifesto SHA-256. O manifesto não é uma assinatura digital.";
}

export function downloadScheduleConfig(input: {
  template: string; format: string; filters: ReportFilters; frequency: string;
  preferredTime: string; scheduledAt: string; recipients: string[];
}) {
  const stamp = new Date().toISOString().slice(0, 10);
  const config = {
    title: "Configuração de entrega de dossiê Bevox", generatedAt: new Date().toISOString(),
    deliveryServiceStatus: "not-configured",
    note: "O protótipo não possui serviço de agendamento nem envio automático de e-mails.",
    template: input.template, format: input.format, filters: input.filters,
    frequency: input.frequency, preferredTime: input.preferredTime,
    firstScheduledAt: new Date(input.scheduledAt).toISOString(), recipients: input.recipients,
  };
  downloadBlob(new Blob([JSON.stringify(config, null, 2)], { type: "application/json;charset=utf-8" }), `bevox-configuracao-entrega-${stamp}.json`);
}
