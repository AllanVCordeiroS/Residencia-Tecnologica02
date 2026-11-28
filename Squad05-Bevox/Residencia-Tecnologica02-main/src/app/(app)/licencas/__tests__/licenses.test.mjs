import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const requireDependency = createRequire(import.meta.url);

// Execute the actual TypeScript with the project's compiler, without adding a runner.
const project = path.resolve(import.meta.dirname, '../../../../..');
function loadSource(relative, overrides = {}) {
  const filename = path.join(project, relative);
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: loadedModule.exports, module: loadedModule, File, crypto,
    require: name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith('@/')) return loadSource('src/' + name.slice(2) + '.ts', overrides);
      return requireDependency(name);
    },
  }, { filename });
  return loadedModule.exports;
}
const { licenseSchema } = loadSource('src/schemas/license.ts');
const { LIMITE_ARQUIVO_MB } = loadSource('src/data/documentFormOptions.ts');
const fixture = () => ({
  tipoLicenca: 'Licença Ambiental', unidade: 'unit-1', orgaoEmissor: 'CPRH',
  numeroDocumento: 'ABC-123', responsavel: 'user-1', observacoes: '',
  vinculo: 'existente', documentoId: '1', dataEmissao: '2026-01-01',
  dataVencimento: '2027-12-31', inicioRenovacao: '', renovacaoEmAndamento: false,
  protocoloRenovacao: '', alerta60: true, alerta30: true, alerta15: true, bloqueioCautelar: false,
});
function service() {
  let guard;
  const licenses = loadSource('src/services/licenses.ts', {
    '@/schemas/license': { licenseSchema, localDate: () => '2026-11-26' },
    '@/services/units': { getOperationalUnits: async () => [{ id: 'unit-1', nome: 'Unidade real de teste', tipo: 'Filial' }] },
    '@/services/users': { getUsers: async () => [{ id: 'user-1', nome: 'Responsável de teste' }] },
    '@/services/documents': {
      getDocuments: async () => [{ id: 1 }],
      setDocumentDeletionGuard: callback => { guard = callback; },
    },
  });
  return { ...licenses, deletionAllowed: id => guard(id) };
}

test('schema accepts valid data and trims document and agency', () => {
  const parsed = licenseSchema.parse({ ...fixture(), numeroDocumento: ' ABC-123 ', orgaoEmissor: ' CPRH ' });
  assert.equal(parsed.numeroDocumento, 'ABC-123');
  assert.equal(parsed.orgaoEmissor, 'CPRH');
});
test('type selection is required and limited to existing categories', () => {
  for (const tipoLicenca of [undefined, '', 'Inventada']) {
    const result = licenseSchema.safeParse({ ...fixture(), tipoLicenca });
    assert.equal(result.success, false);
    assert.equal(result.error.issues[0].path[0], 'tipoLicenca');
    assert.equal(result.error.issues[0].message, 'Selecione o tipo de licença');
  }
});
test('schema rejects missing required fields and invalid dates', () => {
  for (const patch of [
    { unidade: '' }, { responsavel: '' }, { orgaoEmissor: ' ' }, { numeroDocumento: ' ' },
    { dataEmissao: '' }, { dataVencimento: '2026-02-30' },
    { dataEmissao: '2027-01-01', dataVencimento: '2026-01-01' },
    { observacoes: 'x'.repeat(2001) },
  ]) assert.equal(licenseSchema.safeParse({ ...fixture(), ...patch }).success, false);
});
test('document link and uploads require valid existing selection or supported nonempty file', () => {
  assert.equal(licenseSchema.safeParse({ ...fixture(), documentoId: '' }).success, false);
  for (const arquivo of [undefined, new File([], 'empty.pdf'), new File(['x'], 'bad.exe'), new File(['x'.repeat((LIMITE_ARQUIVO_MB + 1) * 1024 * 1024)], 'large.pdf')]) {
    assert.equal(licenseSchema.safeParse({ ...fixture(), vinculo: 'upload', arquivo }).success, false);
  }
  assert.equal(licenseSchema.safeParse({ ...fixture(), vinculo: 'upload', arquivo: new File(['content'], 'valid.PDF') }).success, true);
});
test('renewal in progress requires protocol and a valid past start date', () => {
  for (const patch of [
    { inicioRenovacao: '', protocoloRenovacao: '123' },
    { inicioRenovacao: '2026-02-01', protocoloRenovacao: '' },
    { inicioRenovacao: '2025-12-31', protocoloRenovacao: '123' },
    { inicioRenovacao: '2999-01-01', protocoloRenovacao: '123' },
  ]) assert.equal(licenseSchema.safeParse({ ...fixture(), renovacaoEmAndamento: true, ...patch }).success, false);
});
test('statuses reflect date boundaries and do not claim regularity without expiration', () => {
  const api = service();
  for (const [dataVencimento, expected] of [
    ['', 'Vigência não informada'], ['2026-11-25', 'Vencida'], ['2026-11-26', 'A vencer'],
    ['2027-01-25', 'A vencer'], ['2027-01-26', 'Regular'],
  ]) assert.equal(api.getLicenseStatus({ dataEmissao: '', dataVencimento }), expected);
  assert.equal(api.getLicenseStatus({ dataEmissao: '2026-12-01', dataVencimento: '2027-12-01' }), 'Ainda não vigente');
});
test('six original records and absent emission dates are preserved; results are copies', async () => {
  const api = service();
  const records = await api.getLicenses();
  assert.equal(records.length, 6);
  assert.deepEqual(Array.from(records, record => record.id), ['license-1', 'license-2', 'license-3', 'license-4', 'license-5', 'license-6']);
  assert.ok(records.every(record => record.dataEmissao === ''));
  records[0].numeroDocumento = 'changed';
  assert.equal((await api.getLicenses())[0].numeroDocumento, '2025-43112');
});
test('creation resolves actual unit and responsible, preserves records and protects linked documents', async () => {
  const api = service();
  const created = await api.createLicense(fixture());
  assert.equal(created.unidadeNome, 'Unidade real de teste');
  assert.equal(created.responsavelNome, 'Responsável de teste');
  assert.equal(created.dataEmissao, '2026-01-01');
  assert.ok(created.id);
  assert.equal((await api.getLicenses()).length, 7);
  assert.equal(api.deletionAllowed(1), false);
  assert.equal(api.deletionAllowed(2), true);
  created.numeroDocumento = 'changed externally';
  assert.equal((await api.getLicenses())[0].numeroDocumento, 'ABC-123');
});
test('invalid or unavailable references cannot create a record', async () => {
  const api = service();
  for (const patch of [{ unidade: 'missing' }, { responsavel: 'missing' }, { documentoId: '999' }, { tipoLicenca: '' }]) {
    await assert.rejects(api.createLicense({ ...fixture(), ...patch }));
  }
  assert.equal((await api.getLicenses()).length, 6);
});
test('upload retains the actual file and clears an inactive document link', async () => {
  const api = service();
  const arquivo = new File(['content'], 'license.pdf');
  const record = await api.createLicense({ ...fixture(), vinculo: 'upload', arquivo });
  assert.equal(record.arquivo, arquivo);
  assert.equal(record.documentoId, '');
});
test('alerts and precautionary restriction respect actual renewal protocol', () => {
  const api = service();
  const record = { ...fixture(), dataVencimento: '2026-11-25', bloqueioCautelar: true };
  assert.equal(api.isLicenseRestricted(record), true);
  assert.equal(api.isLicenseRestricted({ ...record, inicioRenovacao: '2026-11-20' }), true);
  assert.equal(api.isLicenseRestricted({ ...record, inicioRenovacao: '2026-11-20', renovacaoEmAndamento: true, protocoloRenovacao: '123' }), false);
  assert.equal(api.getLicenseAlerts(record).length, 0);
  assert.deepEqual(Array.from(api.getLicenseAlerts({ ...record, dataVencimento: '2026-12-06' })), [60, 30, 15]);
});

// Pure list behavior, using the same service rules with an explicit calendar day.
const list = loadSource('src/app/(app)/licencas/_lib/license-list.ts', { '@/services/licenses': service() });
const noFilters = { search: '', unit: '', type: '', status: '', due: '' };
const ids = records => Array.from(records, record => record.id);
const unitFixtures = [
  { id: 'unit-1', nome: 'Matriz – Recife', tipo: 'Matriz' },
  { id: 'unit-2', nome: 'Unidade sem licenças', tipo: 'Filial' },
];
const license = (id, patch = {}) => ({ ...fixture(), id, unidadeNome: 'Matriz – Recife', unidadeTipo: 'Matriz', responsavelNome: 'Ana Souza', ...patch });

test('search covers all five fields with accents and case ignored, and combines every filter', () => {
  const record = license('one');
  const records = [record, license('two', { tipoLicenca: 'Licença Sanitária', numeroDocumento: 'OTHER', orgaoEmissor: 'VISA', dataVencimento: '2026-12-01' })];
  for (const search of ['LICENCA AMBIENTAL', 'abc-123', 'RECIFE', 'cprh', 'ANA SOUZA']) {
    assert.ok(ids(list.filterLicenses(records, { ...noFilters, search }, unitFixtures)).includes('one'));
  }
  const combined = { search: 'ana', unit: 'unit-1', type: 'Licença Ambiental', status: 'Regular', due: '2027-12-31' };
  assert.deepEqual(ids(list.filterLicenses(records, combined, unitFixtures)), ['one']);
  for (const patch of [{ search: 'missing' }, { unit: 'unit-2' }, { type: 'Licença Sanitária' }, { status: 'Vencida' }, { due: '2027-01-01' }]) {
    assert.equal(list.filterLicenses(records, { ...combined, ...patch }, unitFixtures).length, 0);
  }
});

test('units include current unused units and legacy units without duplicates or discarded records', () => {
  const records = [license('current'), license('legacy-match', { unidade: '', unidadeNome: 'Unidade Matriz - Recife' }),
    license('orphan', { unidade: '', unidadeNome: 'Unidade Salvador' }), license('old-id', { unidade: 'removed-id', unidadeNome: 'Unidade antiga' })];
  const options = Array.from(list.licenseUnitOptions(records, unitFixtures), unit => unit.key).sort();
  assert.deepEqual(options, ['legacy:Unidade Salvador', 'removed-id', 'unit-1', 'unit-2'].sort());
  assert.deepEqual(ids(list.filterLicenses(records, { ...noFilters, unit: 'unit-1' }, unitFixtures)), ['current', 'legacy-match']);
  assert.deepEqual(ids(list.filterLicenses(records, { ...noFilters, unit: 'legacy:Unidade Salvador' }, unitFixtures)), ['orphan']);
  assert.deepEqual(ids(list.filterLicenses(records, noFilters, unitFixtures)), ids(records));
  assert.deepEqual(ids(list.filterLicenses(records, { ...noFilters, unit: 'Unidade Salvador' }, unitFixtures)), ['orphan']);
  assert.equal(list.licenseUnit(license('renamed'), [{ ...unitFixtures[0], nome: 'Nome atual' }]).name, 'Nome atual');
});

test('eight columns sort ascending and descending without mutating records', () => {
  const first = license('a', { tipoLicenca: 'Alvará de Funcionamento', unidade: '', unidadeNome: 'Araçú', orgaoEmissor: 'Agência', responsavelNome: 'Ana', dataEmissao: '2026-01-01', dataVencimento: '2026-12-01' });
  const second = license('z', { tipoLicenca: 'Licença Sanitária', unidade: '', unidadeNome: 'Zumbi', orgaoEmissor: 'Vigilância', responsavelNome: 'Zélia', dataEmissao: '2026-02-01', dataVencimento: '2027-12-31' });
  const records = Object.freeze([second, first]);
  for (const key of ['name', 'type', 'unit', 'issuer', 'owner', 'issued', 'due', 'status']) {
    assert.deepEqual(ids(list.sortLicenses(records, { key, direction: 'asc' }, [])), ['a', 'z'], key + ' ascending');
    assert.deepEqual(ids(list.sortLicenses(records, { key, direction: 'desc' }, [])), ['z', 'a'], key + ' descending');
  }
  assert.deepEqual(ids(records), ['z', 'a']);
});

test('table type labels remain Alvará/Licença, including AVCB, while filtering uses model categories', () => {
  const categories = [
    ['Alvará de Funcionamento', 'Alvará'], ['Licença Ambiental', 'Licença'],
    ['Licença Sanitária', 'Licença'], ['AVCB Bombeiros', 'Alvará'],
    ['ANTT / Frota de Distribuição', 'Licença'], ['Outra Categoria Especial', 'Licença'],
  ];
  const records = categories.map(([tipoLicenca], index) => license(String(index), { tipoLicenca }));
  for (const [tipoLicenca, expected] of categories) {
    const record = records.find(item => item.tipoLicenca === tipoLicenca);
    assert.equal(list.licenseKind(record), expected);
    assert.deepEqual(ids(list.filterLicenses(records, { ...noFilters, type: tipoLicenca }, unitFixtures)), [record.id]);
  }
  assert.equal(list.filterLicenses(records, { ...noFilters, type: 'Alvará' }, unitFixtures).length, 0);
});

test('sorting follows combined filters; absent dates stay last and equal values retain order', () => {
  const records = [license('missing', { dataEmissao: '', dataVencimento: '' }), license('older', { dataEmissao: '2025-01-01' }), license('newer', { dataEmissao: '2026-01-01' })];
  assert.deepEqual(ids(list.sortLicenses(records, { key: 'issued', direction: 'desc' }, [])), ['newer', 'older', 'missing']);
  const filtered = list.filterLicenses(records, { ...noFilters, status: 'Regular', search: 'CPRH' }, []);
  assert.deepEqual(ids(list.sortLicenses(filtered, { key: 'issued', direction: 'asc' }, [])), ['older', 'newer']);
  assert.deepEqual(ids(list.sortLicenses(records, { key: 'name', direction: 'desc' }, [])), ids(records));
});

test('pagination clamps after refetch/filter and handles empty and unpaginated lists', () => {
  const records = Array.from({ length: 13 }, (_, index) => license(String(index + 1)));
  const last = list.licensePage(records, 99, 6);
  assert.equal(last.current, 3); assert.equal(last.first, 13); assert.equal(last.last, 13);
  assert.deepEqual(ids(last.displayed), ['13']);
  const reduced = list.licensePage(records.slice(0, 2), last.current, 6);
  assert.equal(reduced.current, 1); assert.equal(reduced.last, 2);
  const empty = list.licensePage([], 3, 6);
  assert.equal(empty.current, 1); assert.equal(empty.first, 0); assert.equal(empty.last, 0);
  assert.equal(list.licensePage(records, 1, records.length).displayed.length, 13);
});

test('individual/header selection is indeterminate, scoped to visible page and pruned on filter/refetch', () => {
  const records = Array.from({ length: 8 }, (_, index) => license(String(index + 1)));
  const first = list.licensePage(records, 1, 6).displayed;
  const second = list.licensePage(records, 2, 6).displayed;
  let selected = list.toggleVisibleLicenses(new Set(), [first[0]], true);
  assert.equal(list.visibleLicenseSelection(selected, first).indeterminate, true);
  assert.equal(list.visibleLicenseSelection(selected, first).checked, false);
  selected = list.toggleVisibleLicenses(selected, first, true);
  assert.equal(selected.size, 6);
  assert.equal(list.visibleLicenseSelection(selected, first).checked, true);
  assert.equal(list.visibleLicenseSelection(selected, second).checked, false);
  selected = list.toggleVisibleLicenses(selected, [second[0]], true);
  selected = list.toggleVisibleLicenses(selected, first, false);
  assert.deepEqual(Array.from(selected), ['7']);
  selected = list.retainLicenseSelection(selected, records.map(record => ({ ...record })));
  assert.equal(selected.has('7'), true, 'new object identities do not discard selection');
  selected = list.retainLicenseSelection(selected, records.filter(record => record.id !== '7'));
  assert.equal(selected.size, 0, 'hidden or removed records are discarded');
  assert.equal(list.visibleLicenseSelection(new Set(), []).checked, false);
  assert.equal(list.visibleLicenseSelection(new Set(), []).indeterminate, false);
});

test('CSV exports actual selected data, dates, renewal protocol, escaping and formula protection', () => {
  const csv = list.licenseCsv([license('csv', { numeroDocumento: 'ABC;"123"', orgaoEmissor: '\t=HYPERLINK("x")', observacoes: 'Linha 1\nLinha 2', protocoloRenovacao: 'PROTO-123' })]);
  assert.equal(csv.charCodeAt(0), 0xFEFF);
  assert.ok(csv.includes('"ABC;""123"""'));
  assert.ok(csv.includes('"\'\t=HYPERLINK(""x"")"'));
  assert.ok(csv.includes('"Linha 1\nLinha 2"'));
  assert.ok(csv.includes('"2026-01-01";"2027-12-31";"Regular"'));
  assert.ok(csv.includes('"PROTO-123"'));
  assert.ok(!csv.includes('OTHER-UNSELECTED'));
});

test('date differences remain calendar days across month, leap day and DST boundaries', () => {
  const api = service();
  assert.equal(api.daysUntilExpiration('2026-12-01', '2026-11-30'), 1);
  assert.equal(api.daysUntilExpiration('2024-03-01', '2024-02-28'), 2);
  assert.equal(api.daysUntilExpiration('2026-03-09', '2026-03-08'), 1);
  assert.equal(api.daysUntilExpiration('2026-11-01', '2026-11-02'), -1);
});

test('successful registration refreshes the existing license and unit query keys', async () => {
  const calls = [];
  const records = [license('created')];
  const query = loadSource('src/hooks/queries/useLicensesQuery.ts', {
    '@tanstack/react-query': {
      useQuery: options => options,
      useQueryClient: () => ({
        setQueryData: (key, data) => calls.push(['set', key, data]),
        invalidateQueries: async ({ queryKey }) => { calls.push(['invalidate', queryKey]); },
      }),
      useMutation: options => options,
    },
    '@/services/licenses': { createLicense: async () => records[0], getLicenses: async () => records },
  });
  const mutation = query.useCreateLicenseMutation();
  await mutation.onSuccess();
  assert.equal(calls[0][0], 'set');
  assert.deepEqual(calls[0][2], records);
  assert.deepEqual(Array.from(calls.filter(call => call[0] === 'invalidate'), call => Array.from(call[1])), [['bevox', 'licenses'], ['bevox', 'units']]);
});
