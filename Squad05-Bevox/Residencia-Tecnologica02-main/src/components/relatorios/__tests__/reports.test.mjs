import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { webcrypto, createHash } from 'node:crypto';
import ts from 'typescript';

const directory = path.resolve(import.meta.dirname, '..');
function load(name, globals = {}) {
  const filename = path.join(directory, name + '.ts');
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: loadedModule, exports: loadedModule.exports, TextEncoder, Blob, crypto: webcrypto,
    require: specifier => {
      if (specifier.startsWith('./')) return load(specifier.slice(2), globals);
      throw new Error('Unexpected dependency ' + specifier);
    }, ...globals,
  }, { filename });
  return loadedModule.exports;
}
const data = load('reportData');
const plain = value => JSON.parse(JSON.stringify(value));
const record = (id, category, date, complete, unit = 'Unidade Matriz — Recife') => ({ id, title: `Registro ${id}`, unit, category, date, dateBasis: 'Prazo', status: complete ? 'Concluída' : 'Pendente', complete, attention: !complete });
const rows = [record('a', 'Tarefas', '2026-11-10', true), record('b', 'Tarefas', '2026-11-12', false), record('c', 'Documentos', null, true), record('d', 'Operacional', '2026-10-01', false, 'Paulista')];

test('validates stored ISO and Brazilian dates without rolling invalid dates', () => {
  assert.equal(data.isoDate('30/11/2026'), '2026-11-30');
  assert.equal(data.isoDate('2026-11-26T18:30:00Z'), '2026-11-26');
  assert.equal(data.isoDate('2026-02-30'), null);
  assert.equal(data.isoDate(null), null);
  assert.equal(data.isoDate('Hoje'), null);
});

test('periods use calendar boundaries, inclusive rolling days and previous month', () => {
  const now = new Date(2026, 10, 26, 14);
  assert.deepEqual(plain(data.periodRange('Este mês', now)), { start: '2026-11-01', end: '2026-11-26' });
  assert.deepEqual(plain(data.periodRange('Últimos 30 dias', now)), { start: '2026-10-28', end: '2026-11-26' });
  assert.deepEqual(plain(data.periodRange('Mês anterior', now)), { start: '2026-10-01', end: '2026-10-31' });
  assert.equal(data.periodRange('Todo o período', now), null);
});

test('comparison has equal number of days and clamps leap day last-year comparison', () => {
  assert.deepEqual(plain(data.comparisonRange({ start: '2026-11-01', end: '2026-11-26' }, 'Período anterior')), { start: '2026-10-06', end: '2026-10-31' });
  assert.deepEqual(plain(data.comparisonRange({ start: '2024-02-01', end: '2024-02-29' }, 'Mesmo período do ano passado')), { start: '2023-02-01', end: '2023-02-28' });
  assert.equal(data.comparisonRange(null, 'Período anterior'), null);
  assert.equal(data.comparisonRange({ start: '2026-11-01', end: '2026-11-26' }, 'Sem comparação'), null);
});

test('combines unit normalization, category, date and case insensitive search', () => {
  const selected = data.filterReportRecords(rows, { start: '2026-11-01', end: '2026-11-26' }, 'Matriz - Recife', 'Tarefas', 'REGISTRO A');
  assert.deepEqual(plain(selected.map(row => row.id)), ['a']);
  assert.equal(data.filterReportRecords(rows, null, 'Todas as unidades', 'Todas as categorias').length, 4);
  assert.equal(data.filterReportRecords(rows, { start: '2026-11-01', end: '2026-11-26' }, 'Todas as unidades', 'Todas as categorias').length, 2);
});

test('absence of records remains null, while existing unfinished tasks give zero', () => {
  assert.equal(data.completionRate([]), null);
  assert.equal(data.completionRate([rows[1]]), 0);
  assert.equal(data.completionRate(rows.slice(0, 2)), 50);
  const unit = data.unitPerformance([rows[0]])[0];
  assert.equal(unit.docs, null);
  assert.equal(unit.tasks, 100);
});

test('cohorts contain only stored dates and never fill invented historical months', () => {
  const cohorts = data.monthlyCohorts([rows[0], rows[2], rows[3]]);
  assert.deepEqual(plain(cohorts.map(row => row.month)), ['2026-10', '2026-11']);
  assert.equal(cohorts[0].tasks, null);
  assert.equal(cohorts[1].tasks, 100);
});

test('adapts sources, joins finance by unit ID, preserves financial origin and amount', () => {
  const units = [{ id: 'uo1', nome: 'Unidade Matriz — Recife' }];
  const finance = [{ id: '7', tipo: 'Despesa', descricao: 'Despesa da sessão', valor: 123.45, unidade: 'uo1', unidadeNome: 'Nome legado', categoria: 'Logística', dataLancamento: '2026-11-15', dataVencimento: '2026-11-20', status: 'Pendente', demonstrativo: true }];
  const result = data.buildReportRecords([], [], [], [], units, '2026-11-26', finance)[0];
  assert.equal(result.unit, units[0].nome);
  assert.equal(result.amount, 123.45);
  assert.equal(result.date, '2026-11-15');
  assert.equal(result.source, 'Demonstrativo');
  assert.equal(result.attention, true);
  assert.equal(result.complete, false);
  finance[0].demonstrativo = false;
  finance[0].status = 'Realizado';
  assert.equal(data.buildReportRecords([], [], [], [], units, '2026-11-26', finance)[0].source, 'Cadastro local em memória');
  assert.equal(data.buildReportRecords([], [], [], [], units, '2026-11-26', finance)[0].attention, false);
});

function exportHarness() {
  let blob, filename, html;
  const globals = {
    URL: { createObjectURL: value => { blob = value; return 'blob:test'; }, revokeObjectURL() {} },
    document: { createElement: () => ({ set download(value) { filename = value; }, click() {}, remove() {} }), body: { appendChild() {} } },
    window: { setTimeout() {}, open: () => ({ document: { write: value => { html = value; }, close() {} } }) },
  };
  return { exports: load('reportExportUtils', globals), result: () => ({ blob, filename, html }) };
}
function unzipStored(buffer) {
  const files = new Map();
  let offset = 0;
  while (buffer.readUInt32LE(offset) === 0x04034b50) {
    const size = buffer.readUInt32LE(offset + 18), length = buffer.readUInt16LE(offset + 26), extra = buffer.readUInt16LE(offset + 28);
    const name = buffer.subarray(offset + 30, offset + 30 + length).toString('utf8');
    const start = offset + 30 + length + extra;
    files.set(name, buffer.subarray(start, start + size).toString('utf8'));
    offset = start + size;
  }
  assert.equal(buffer.readUInt32LE(offset), 0x02014b50);
  assert.equal(buffer.readUInt32LE(buffer.length - 22), 0x06054b50);
  return files;
}
const input = format => ({ format, template: { id: 'executive', title: 'Relatório <teste>', eyebrow: 'Resumo', description: 'Teste' }, formatTitle: format, filters: { period: 'Este mês', unit: 'Matriz', category: 'Todas as categorias', comparison: 'Sem comparação', search: 'Registro', basis: 'Situação atual, sem histórico' }, metrics: [{ label: 'Conclusão de tarefas', value: '50%', category: 'Tarefas', note: 'Sem base comparável' }], units: data.unitPerformance(rows), costs: [], records: rows });

test('XLSX is an actual OOXML ZIP containing filtered records, basis and missing-data cells', async () => {
  const harness = exportHarness();
  await harness.exports.exportReportFile(input('xlsx'));
  const { blob, filename } = harness.result();
  assert.match(filename, /\.xlsx$/);
  const files = unzipStored(Buffer.from(await blob.arrayBuffer()));
  assert.ok(files.has('[Content_Types].xml'));
  assert.match(files.get('xl/workbook.xml'), /name="Registros"/);
  assert.match(files.get('xl/worksheets/sheet4.xml'), /Registro a/);
  assert.match(files.get('xl/worksheets/sheet1.xml'), /Situação atual, sem histórico/);
  assert.match(files.get('xl/worksheets/sheet2.xml'), /Sem registros/);
});

test('ZIP contains real filtered CSV/JSON and verified SHA-256 hashes, with template narrowing', async () => {
  const harness = exportHarness();
  const payload = input('zip');
  payload.template.id = 'compliance';
  payload.records = [...rows, { ...rows[0], id: 'hostile', category: 'Documentos', title: '=HYPERLINK("example")' }];
  await harness.exports.exportReportFile(payload);
  const files = unzipStored(Buffer.from(await harness.result().blob.arrayBuffer()));
  const summary = JSON.parse(files.get('resumo-dossie.json'));
  assert.ok(summary.registros.every(row => row.category !== 'Tarefas'));
  assert.ok(summary.unidades.every(unit => unit.tasks === null));
  assert.match(files.get('relatorio-indicadores.csv'), /'\=HYPERLINK/);
  const manifest = JSON.parse(files.get('manifesto-integridade.json'));
  for (const file of manifest.arquivos) assert.equal(file.sha256, createHash('sha256').update(files.get(file.arquivo)).digest('hex'));
});

test('print export escapes content and includes actual details without claiming PDF download', async () => {
  const harness = exportHarness();
  const message = await harness.exports.exportReportFile(input('pdf'));
  assert.match(message, /preparado para impressão/);
  assert.match(harness.result().html, /Relatório &lt;teste&gt;/);
  assert.match(harness.result().html, /Registro a/);
  assert.match(harness.result().html, /Base da data/);
  assert.match(harness.result().html, /<script>.*window\.print\(\).*<\/script>/);
  assert.equal(harness.result().blob, undefined);
});

test('evolution selects one indicator and aligns observed months without inventing values', () => {
  const current = [record('a', 'Tarefas', '2026-10-12', true), record('b', 'Tarefas', '2026-10-15', false), record('c', 'Documentos', '2026-11-10', true), record('undated', 'Tarefas', null, true)];
  const previous = [record('old', 'Tarefas', '2026-08-01', false)];
  const points = data.indicatorEvolution(current, previous, data.evolutionIndicators[0], { start: '2026-10-01', end: '2026-11-20' }, { start: '2026-08-01', end: '2026-09-20' });
  assert.equal(points.length, 1);
  assert.equal(points[0].current, 50);
  assert.equal(points[0].previous, 0);
  assert.equal(points[0].currentMonth, '2026-10');
  assert.equal(points[0].previousMonth, '2026-08');
  assert.equal(points[0].currentCount, 2);
});

test('evolution preserves missing current/comparison values and disables unbounded comparison', () => {
  const current = [record('a', 'Tarefas', '2026-11-10', false)];
  const previous = [record('b', 'Tarefas', '2026-08-01', true)];
  const points = data.indicatorEvolution(current, previous, data.evolutionIndicators[0], { start: '2026-10-01', end: '2026-11-20' }, { start: '2026-08-01', end: '2026-09-20' });
  assert.deepEqual(plain(points.map(point => [point.current, point.previous])), [[null, 100], [0, null]]);
  const all = data.indicatorEvolution(current, previous, data.evolutionIndicators[0], null, null);
  assert.equal(all.length, 1);
  assert.equal(all[0].label, '2026-11');
  assert.equal(all[0].previous, null);
  assert.equal(data.indicatorEvolution([], [], data.evolutionIndicators[0], null, null).length, 0);
});

test('financial evolution separates revenue/expenses and retains actual zero amounts', () => {
  const current = [
    { ...record('a', 'Financeiro', '2026-11-10', false), financeType: 'Despesa', amount: 10.12 },
    { ...record('b', 'Financeiro', '2026-11-11', true), financeType: 'Despesa', amount: 20.23 },
    { ...record('c', 'Financeiro', '2026-12-01', true), financeType: 'Receita', amount: 0 },
  ];
  const expenses = data.indicatorEvolution(current, [], data.evolutionIndicators[3], null, null);
  assert.equal(expenses.length, 1);
  assert.equal(expenses[0].current, 30.35);
  assert.equal(expenses[0].currentCount, 2);
  const revenue = data.indicatorEvolution(current, [], data.evolutionIndicators[4], null, null);
  assert.equal(revenue[0].current, 0);
  assert.equal(revenue[0].currentMonth, '2026-12');
});

test('evolution honors existing unit, search, category and date filters in both periods', () => {
  const all = [...rows, record('old', 'Tarefas', '2026-10-10', true), record('other', 'Tarefas', '2026-11-10', true, 'Paulista')];
  const range = { start: '2026-11-01', end: '2026-11-26' };
  const older = data.comparisonRange(range, 'Período anterior');
  const select = interval => data.filterReportRecords(all, interval, 'Matriz - Recife', 'Tarefas', 'Registro');
  const result = data.indicatorEvolution(select(range), select(older), data.evolutionIndicators[0], range, older);
  assert.equal(result[0].current, 50);
  assert.equal(result[0].previous, 100);
});

test('evolution renders a category-specific selector, accessible table and honest empty state', async () => {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const filename = path.join(directory, 'IndicatorEvolution.tsx');
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }, fileName: filename,
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(compiled, { module: loaded, exports: loaded.exports, require: specifier => {
    if (specifier === './reportData') return data;
    if (specifier === '@/components/financeiro/financeMath') return load('../financeiro/financeMath');
    return require(specifier);
  } }, { filename });
  const render = props => renderToStaticMarkup(React.createElement(loaded.exports.default, { records: rows, previous: [], range: null, previousRange: null, category: 'Tarefas', ...props }));
  const html = render({});
  assert.match(html, /Indicador da evolução/);
  assert.match(html, /<option value="tasks" selected="">Tarefas concluídas/);
  assert.doesNotMatch(html, /<option value="docs"/);
  assert.match(html, /<caption/);
  assert.match(html, /50%/);
  assert.match(html, /sem histórico de alterações de status/);
  assert.match(render({ records: [] }), /Nenhum registro datado deste indicador/);
  const finance = render({ category: 'Financeiro', records: [{ ...record('f', 'Financeiro', '2026-11-10', false), financeType: 'Despesa', amount: 123.45 }] });
  assert.match(finance, /value="expenses" selected=""/);
  assert.match(finance, /123,45/);
});
