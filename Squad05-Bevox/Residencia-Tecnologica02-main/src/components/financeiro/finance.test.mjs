import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
const externalRequire = createRequire(import.meta.url);
// Executa TS existente sem adicionar runner/dependências/configurações globais.
function loadTS(relative, overrides = {}) {
  const filename = path.resolve(process.cwd(), relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  const localRequire = (name) => {
    if (name in overrides) return overrides[name];
    if (name.startsWith('@/')) return loadTS('src/' + name.slice(2) + '.ts', overrides);
    return externalRequire(name);
  };
  new Function('require', 'module', 'exports', compiled)(localRequire, mod, mod.exports);
  return mod.exports;
}
const math = loadTS('src/components/financeiro/financeMath.ts');
const { financeEntrySchema } = loadTS('src/schemas/finance.ts');
const base = { id: 'test', tipo: 'Receita', descricao: 'Venda', valor: 10.25, categoria: 'Vendas', unidade: 'uo1', unidadeNome: 'Matriz', contraparte: 'Cliente', dataLancamento: '2026-11-26', dataVencimento: '2026-11-27', status: 'Pendente', formaPagamento: 'PIX', subcategoria: '', observacao: '', demonstrativo: false };
test('schema rejeita valores inválidos, datas inexistentes e campos vazios', () => {
  assert.ok(financeEntrySchema.safeParse(base).success);
  for (const valor of [0, -1, Infinity, NaN, 1.111]) assert.equal(financeEntrySchema.safeParse({ ...base, valor }).success, false);
  assert.equal(financeEntrySchema.safeParse({ ...base, dataLancamento: '2026-02-30' }).success, false);
  for (const key of ['descricao', 'categoria', 'unidade', 'contraparte']) assert.equal(financeEntrySchema.safeParse({ ...base, [key]: '' }).success, false);
});
test('valor BR, decimal e agrupamento sem truncar texto', () => {
  assert.equal(math.parseFinanceAmount('1.234,56'), 1234.56);
  assert.equal(math.parseFinanceAmount('1.234'), 1234);
  assert.equal(math.parseFinanceAmount('1234.56'), 1234.56);
  for (const raw of ['', '12abc', '1,234', '-1', '1.23.4']) assert.ok(Number.isNaN(math.parseFinanceAmount(raw)));
});
test('períodos atravessam anos e comparação usa mesma quantidade de meses', () => {
  const range = math.periodRange('3months', new Date(2026, 0, 15));
  assert.deepEqual(range, { start: '2025-11-01', end: '2026-01-31' });
  assert.deepEqual(math.previousRange(range), { start: '2025-08-01', end: '2025-10-31' });
});
test('filtros e somas em centavos excluem outra unidade/período', () => {
  const rows = [base, { ...base, unidade: 'uo2' }, { ...base, dataLancamento: '2026-10-31' }];
  assert.equal(math.filterFinance(rows, { start: '2026-11-01', end: '2026-11-30' }, 'uo1').length, 1);
  assert.equal(math.sumFinance([{ valor: 0.1 }, { valor: 0.2 }]), 0.3);
  assert.equal(math.monthlyFinance([base], { start: '2026-10-01', end: '2026-11-30' })[1].Receitas, 10.25);
  assert.equal(math.variation(10, 0), 'Sem base no período anterior');
});
test('previsão inclui só pendências em 30 dias e status depende da data atual', () => {
  const rows = [base, { ...base, status: 'Realizado' }, { ...base, dataVencimento: '2026-11-25' }, { ...base, dataVencimento: '2026-12-26' }];
  const result = math.forecastFinance(rows, '2026-11-26');
  assert.equal(result.length, 30);
  assert.equal(result.reduce((s, e) => s + e.Entradas, 0), 10.25);
  assert.equal(math.entryStatus(base, '2026-11-28'), 'Em atraso');
  assert.equal(math.entryStatus({ ...base, status: 'Realizado' }, '2026-11-28'), 'Recebido');
});
test('CSV preserva aspas, BOM, decimais e neutraliza fórmulas', () => {
  const csv = math.financeCSV([{ ...base, descricao: '=SUM(1)', contraparte: 'Cliente "A"' }]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"\'=SUM(1)"'));
  assert.ok(csv.includes('"Cliente ""A"""'));
  assert.ok(csv.includes('"10,25"'));
});
test('serviço preserva exemplos, isola snapshots, valida unidade e salva em memória', async () => {
  const service = loadTS('src/services/finance.ts', { '@/services/units': { getOperationalUnits: async () => [{ id: 'uo1', nome: 'Matriz', ativa: true }, { id: 'off', ativa: false }] } });
  const initial = await service.getFinanceEntries();
  assert.equal(initial.length, 7);
  assert.equal(initial.find(e => e.contraparte === 'Ambev Brasil').valor, 24800);
  initial[0].valor = -100;
  assert.equal((await service.getFinanceEntries())[0].valor, 24800);
  await assert.rejects(service.saveFinanceEntry({ ...base, unidade: 'off' }), /ativa/);
  await assert.rejects(service.saveFinanceEntry({ ...base, valor: 0 }));
  const saved = await service.saveFinanceEntry(base);
  assert.equal(saved.demonstrativo, false);
  assert.equal((await service.getFinanceEntries()).length, 8);
});

