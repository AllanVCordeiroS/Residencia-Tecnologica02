import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const filename = path.resolve(import.meta.dirname, "../NotificationPreview.tsx");
const code = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const success = (data = []) => ({ data, isPending: false, isError: false, refetch() {} });
class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : ["2026-11-27T12:00:00Z"])); }
}
function render(eventId, sources = {}, props = {}) {
  const imports = {
    "@/hooks/queries/useTasksQuery": { useTasksQuery: () => sources.tasks ?? success() },
    "@/hooks/queries/useDocumentsQuery": { useDocumentsQuery: () => sources.documents ?? success() },
    "@/hooks/queries/useOccurrencesQuery": { useOccurrencesQuery: () => sources.occurrences ?? success() },
    "@/hooks/queries/useLicensesQuery": { useLicensesQuery: () => sources.licenses ?? success() },
    "@/components/financeiro/useFinanceQuery": { useFinanceQuery: () => sources.finance ?? success() },
    "@/services/licenses": {
      daysUntilExpiration: value => (Date.parse(value + "T00:00:00Z") - Date.parse("2026-11-27T00:00:00Z")) / 86400000,
      getLicenseStatus: item => item.dataEmissao > "2026-11-27" ? "Ainda não vigente" : "A vencer",
    },
    "next/navigation": { useRouter: () => ({ push() {} }) },
  };
  const loaded = { exports: {} };
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, Date: FixedDate, require: name => {
    if (name in imports) return imports[name];
    if (name.startsWith("@/")) throw new Error("Unexpected duplicate query or service: " + name);
    return require(name);
  } });
  return renderToStaticMarkup(React.createElement(loaded.exports.NotificationPreview, { eventId, horario: "18:00", channels: ["Sistema"], frequency: "Diário", ...props }));
}

test("task preview uses the available overdue record and its owner and deadline", () => {
  const html = render("1", { tasks: success([{ title: "Tarefa da sessão", late: true, unit: "Olinda", owner: "Ana", due: "20/11/2026" }]) });
  for (const text of ["Tarefa da sessão", "Olinda", "Ana", "20/11/2026", "Exemplo de pré-visualização"]) assert.ok(html.includes(text));
  assert.ok(html.includes("Ver lista de tarefas"));
});
test("license preview uses the license query and skips not-yet-valid and distant licenses", () => {
  const html = render("2", { licenses: success([
    { tipoLicenca: "Futura", dataEmissao: "2026-11-30", dataVencimento: "2026-12-01" },
    { tipoLicenca: "Distante", dataVencimento: "2027-01-01" },
    { tipoLicenca: "Licença da sessão", dataVencimento: "2026-11-30", unidadeNome: "Olinda", responsavelNome: "Responsável real" },
  ]) });
  assert.ok(html.includes("Licença da sessão"));
  assert.ok(html.includes("Responsável real"));
  assert.ok(!html.includes("Futura") && !html.includes("Distante"));
});
test("financial preview shares the finance hook and selects pending overdue records only", () => {
  const html = render("3", { finance: success([
    { descricao: "Realizado", status: "Realizado", dataVencimento: "2026-11-01" },
    { descricao: "Futuro", status: "Pendente", dataVencimento: "2026-12-01" },
    { descricao: "Conta da sessão", status: "Pendente", dataVencimento: "2026-11-20", unidadeNome: "Paulista" },
  ]) });
  assert.ok(html.includes("Conta da sessão"));
  assert.ok(!html.includes("Realizado") && !html.includes("Futuro"));
  assert.ok(html.includes("Não informado"));
});
test("document and occurrence previews retain existing record data", () => {
  assert.ok(render("4", { documents: success([{ title: "Documento da sessão", unit: "Matriz", responsible: "Ana", dueDate: "10/12/2026" }]) }).includes("Documento da sessão"));
  const html = render("5", { occurrences: success([{ title: "Ocorrência da sessão", status: "Aberta", owner: "Carlos", unitName: "Cabo", resolutionDeadline: "2026-11-30" }]) });
  assert.ok(html.includes("Ocorrência da sessão") && html.includes("Carlos"));
});
test("preview distinguishes loading, failure and missing records", () => {
  assert.ok(render("1", { tasks: { ...success(), isPending: true } }).includes("Carregando exemplo"));
  assert.ok(render("1", { tasks: { ...success(), isError: true } }).includes("Tentar novamente"));
  assert.ok(render("2").includes("Nenhum registro correspondente"));
});
test("preview reflects selected channels, frequency and time without claiming delivery", () => {
  const html = render("3", {}, { channels: [], frequency: "Imediato", horario: "06:00" });
  assert.ok(html.includes("Nenhum canal selecionado") && html.includes("Imediato") && html.includes("06:00"));
  assert.ok(!html.includes("enviado") && !html.includes("entregue"));
});

