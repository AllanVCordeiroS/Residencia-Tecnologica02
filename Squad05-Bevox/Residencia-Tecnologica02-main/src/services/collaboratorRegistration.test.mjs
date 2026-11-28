import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const requireDependency = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../..');
function setup(overrides = {}, globals = {}) {
  const cache = new Map();
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative).exports;
    const filename = path.join(root, relative);
    const loaded = { exports: {} };
    cache.set(relative, loaded);
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename,
    }).outputText;
    vm.runInNewContext(compiled, {
      exports: loaded.exports, module: loaded, structuredClone, crypto, Date, Set, Map, URL, ...globals,
      require(name) {
        if (Object.hasOwn(overrides, name)) return overrides[name];
        if (name === 'server-only') return {};
        return name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : requireDependency(name);
      },
    }, { filename });
    return loaded.exports;
  }
  return { load, schema: load('src/schemas/collaborator.ts'), users: load('src/services/users.ts'), api: load('src/services/collaboratorRegistration.ts') };
}
const fixture = () => ({ nome: '  Pessoa   Colaboradora  ', email: ' NOVA@Exemplo.COM ', telefone: '(81) 99999-9999', cargo: 'Vendedor', unidadeId: 'uo1', departamento: 'Operações & Logística', senha: 'UmaSenha!2026', confirmarSenha: 'UmaSenha!2026', aceiteAcesso: true, aceitePrivacidade: true });

test('normalizes name/email and validates all required registration fields without a domain restriction', () => {
  const { schema } = setup();
  const form = schema.createCollaboratorRegistrationSchema();
  const parsed = form.parse(fixture());
  assert.equal(parsed.nome, 'Pessoa Colaboradora');
  assert.equal(parsed.email, 'nova@exemplo.com');
  for (const [key, value] of Object.entries({ nome: 'Ana', email: 'invalido', telefone: '(00) 1111-1111', cargo: 'Administrador Geral', unidadeId: '', departamento: 'Área inventada', senha: 'curta', confirmarSenha: 'diferente', aceiteAcesso: false, aceitePrivacidade: false })) {
    assert.equal(form.safeParse({ ...fixture(), [key]: value }).success, false, key);
  }
  assert.equal(form.safeParse({ ...fixture(), email: 'pessoa@gmail.com' }).success, true);
  assert.equal(form.safeParse({ ...fixture(), telefone: '(81) 3333-4444' }).success, true);
});

test('password policy and strength respond to contents and current eight/ten-character policy', () => {
  const { schema, load } = setup();
  const defaults = load('src/services/settingsSchemas.ts').DEFAULT_SECURITY_SETTINGS;
  assert.equal(schema.passwordStrength('').level, 0);
  assert.equal(schema.passwordStrength('123').label, 'Muito fraca');
  assert.equal(schema.passwordStrength('abcdefgh').label, 'Fraca');
  assert.equal(schema.passwordStrength('Abcd!123').label, 'Média');
  assert.equal(schema.passwordStrength(fixture().senha).label, 'Forte');
  assert.equal(schema.passwordMatchesPolicy('Abcd!123', { ...defaults, minimum: '10 caracteres' }), false);
  assert.equal(schema.passwordMatchesPolicy('abcdefgh', { ...defaults, exigirMaiusculas: false, exigirSimbolos: false }), true);
  assert.equal(schema.passwordMatchesPolicy('A'.repeat(129) + '!1'), false);
});

test('Brazilian phone mask is derived from digits and allows clearing and editing', () => {
  const { schema } = setup();
  assert.equal(schema.formatBrazilianPhone('81999999999'), '(81) 99999-9999');
  assert.equal(schema.formatBrazilianPhone('8133334444'), '(81) 3333-4444');
  assert.equal(schema.formatBrazilianPhone('(81) 99999-9999'), '(81) 99999-9999');
  assert.equal(schema.formatBrazilianPhone(''), '');
  assert.equal(schema.formatBrazilianPhone('81'), '(81');
});

test('registration inserts into the same users store, inactive and without any privileges or credential retention', async () => {
  const { api, users, load } = setup();
  const units = await load('src/services/units.ts').getOperationalUnits();
  const input = { ...fixture(), unidadeId: units[0].id, perfil: 'Administrador Geral', status: 'ativo', permissoes: { all: true } };
  const created = await api.registerCollaboratorDemo(input);
  assert.equal((await users.getUsers()).length, 9);
  assert.equal(created.perfil, 'Colaborador');
  assert.equal(created.status, 'inativo');
  assert.equal(created.cadastroPendente, true);
  assert.equal(created.unidadeId, units[0].id);
  assert.equal(created.unidade, units[0].nome);
  assert.equal(created.departamento, fixture().departamento);
  assert.equal(created.enviarConvite, false);
  assert.equal(created.aceitesCadastro.privacidade, true);
  assert.ok(Object.values(created.permissoes).every(permissions => Object.values(permissions).every(value => value === false)));
  const serialized = JSON.stringify(await users.getUsers());
  for (const secret of ['senha', 'confirmarSenha', input.senha]) assert.equal(serialized.includes(secret), false);
  assert.equal((await users.getUserDetail(created.id)).status, 'Inativo');
  created.nome = 'não alterar armazenamento';
  assert.equal((await users.getUsers())[0].nome, 'Pessoa Colaboradora');
});

test('duplicate email is rejected against existing users and concurrent submissions create only one request', async () => {
  const { api, users, load } = setup();
  const units = await load('src/services/units.ts').getOperationalUnits();
  const input = { ...fixture(), unidadeId: units[0].id };
  await assert.rejects(api.registerCollaboratorDemo({ ...input, email: ' RICARDO@ADEGA.COM.BR ' }), /Já existe/);
  const settled = await Promise.allSettled([api.registerCollaboratorDemo(input), api.registerCollaboratorDemo(input)]);
  assert.equal(settled.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(settled.filter(item => item.status === 'rejected').length, 1);
  assert.equal((await users.getUsers()).length, 9);
});

test('existing user edit can preserve a registered operational unit and registration metadata, rejecting invented units', async () => {
  const { api, users, load } = setup();
  const units = await load('src/services/units.ts').getOperationalUnits();
  const created = await api.registerCollaboratorDemo({ ...fixture(), unidadeId: units[0].id });
  const form = await users.getUserForm(created.id);
  const saved = await users.saveUserDemo({ ...form, cargo: 'Vendedor revisado' }, created.id);
  assert.equal(saved.unidadeId, created.unidadeId);
  assert.equal(saved.departamento, created.departamento);
  assert.equal(saved.cadastroPendente, true);
  assert.equal(saved.aceitesCadastro.registradoEm, created.aceitesCadastro.registradoEm);
  await assert.rejects(users.saveUserDemo({ ...form, unidade: 'Unidade inventada' }, created.id), /unidades disponíveis/);
});

test('unavailable and inactive units and failed units service cannot insert a request', async () => {
  for (const list of [[], [{ id: 'uo1', nome: 'Unidade de teste', ativa: false }]]) {
    const { api, users } = setup({ '@/services/units': { getOperationalUnits: async () => list } });
    await assert.rejects(api.registerCollaboratorDemo(fixture()), /unidade não está disponível/);
    assert.equal((await users.getUsers()).length, 8);
  }
  const { api, users } = setup({ '@/services/units': { getOperationalUnits: async () => { throw new Error('Falha de consulta'); } } });
  await assert.rejects(api.registerCollaboratorDemo(fixture()), /Falha de consulta/);
  assert.equal((await users.getUsers()).length, 8);
});

test('policy is re-read on submit and malformed/inaccessible preferences block insertion without writing storage', async () => {
  let raw;
  const window = { localStorage: { getItem: () => raw, setItem: () => assert.fail('Registration must not write local storage') } };
  const { api, users, load } = setup({}, { window });
  const defaults = load('src/services/settingsSchemas.ts').DEFAULT_SECURITY_SETTINGS;
  raw = JSON.stringify({ ...defaults, minimum: '10 caracteres' });
  await assert.rejects(api.registerCollaboratorDemo({ ...fixture(), senha: 'Abcd!123', confirmarSenha: 'Abcd!123' }));
  raw = '{invalid';
  assert.throws(() => api.readRegistrationPasswordPolicy());
  await assert.rejects(api.registerCollaboratorDemo(fixture()));
  window.localStorage.getItem = () => { throw new Error('Armazenamento bloqueado'); };
  await assert.rejects(api.registerCollaboratorDemo(fixture()), /Armazenamento bloqueado/);
  assert.equal((await users.getUsers()).length, 8);
});

test('public registration and legal pages remain accessible, while private routes reject forged session cookies', async () => {
  const { load } = setup();
  const { proxy } = load('src/proxy.ts');
  const { NextRequest } = requireDependency('next/server');
  for (const route of ['/login', '/cadastro', '/privacidade', '/termos']) {
    assert.equal((await proxy(new NextRequest('http://localhost:3001' + route))).headers.get('location'), null);
  }
  for (const route of ['/dashboard', '/usuarios', '/licencas', '/financeiro']) {
    assert.equal((await proxy(new NextRequest('http://localhost:3001' + route))).headers.get('location'), 'http://localhost:3001/login');
  }
  for (const route of ['/cadastro', '/privacidade', '/termos']) {
    assert.equal((await proxy(new NextRequest('http://localhost:3001' + route, { headers: { cookie: 'bevox_session=demo%40example.com' } }))).headers.get('location'), null);
  }
  assert.equal((await proxy(new NextRequest('http://localhost:3001/login', { headers: { cookie: 'bevox_session=demo%40example.com' } }))).headers.get('location'), null);
});
