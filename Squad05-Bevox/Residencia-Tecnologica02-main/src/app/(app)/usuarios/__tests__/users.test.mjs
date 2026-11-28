import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { QueryClient } from '@tanstack/react-query';

const requireDependency = createRequire(import.meta.url);
const project = path.resolve(import.meta.dirname, '../../../../..');
function loader(overrides = {}) {
  const cache = new Map();
  return function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(project, relative);
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      fileName: filename,
    }).outputText;
    const loaded = { exports: {} };
    vm.runInNewContext(compiled, {
      exports: loaded.exports, module: loaded, structuredClone, crypto, Set, Date,
      ...overrides.globals,
      require: name => {
        if (Object.hasOwn(overrides, name)) return overrides[name];
        if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
        return requireDependency(name);
      },
    }, { filename });
    cache.set(relative, loaded.exports);
    return loaded.exports;
  };
}

function setup() {
  const load = loader();
  const schema = load('src/schemas/user.ts');
  const mocks = load('src/lib/usuarios-mock.ts');
  const api = load('src/services/users.ts');
  const fixture = () => ({
    nome: ' Nova Pessoa ', email: ' nova@example.com ', cargo: ' Analista ', telefone: '123',
    unidade: mocks.UNIDADES[0], perfil: 'Colaborador', unidadesAutorizadas: [mocks.UNIDADES[1]],
    permissoes: structuredClone(mocks.PERMISSOES_POR_PERFIL.Colaborador), enviarConvite: true, exigirMfa: true,
  });
  return { load, schema, mocks, api, fixture };
}

test('avatar preserves all original initials and Gabriel Fernandes remains GF in both themes', () => {
  const load = loader({ '@/lib/utils': { cn: (...classes) => classes.filter(Boolean).join(' ') } });
  const { iniciais, Avatar } = load('src/components/usuarios/avatar.tsx');
  const { USUARIOS_MOCK } = load('src/lib/usuarios-mock.ts');
  assert.deepEqual(Array.from(USUARIOS_MOCK, user => iniciais(user.nome)), ['RS', 'CM', 'AS', 'MC', 'PL', 'GF', 'TL', 'BR']);
  assert.equal(iniciais('  Gabriel   Fernandes  '), 'GF');
  const gabriel = USUARIOS_MOCK.find(user => user.id === '6');
  const avatar = Avatar({ nome: gabriel.nome, tone: gabriel.avatarTone });
  assert.equal(avatar.props.children, 'GF');
  assert.match(avatar.props.className, /dark:bg-emerald-900\/40/);
  assert.equal(gabriel.nome, 'Gabriel Fernandes');
});

test('eight original users, profiles and permission defaults remain unchanged and isolated', async () => {
  const { api, mocks } = setup();
  const users = await api.getUsers();
  assert.deepEqual(users, structuredClone(mocks.USUARIOS_MOCK));
  assert.equal(users.length, 8);
  for (const user of users) {
    const detail = await api.getUserDetail(user.id);
    assert.deepEqual(detail.permissions, structuredClone(mocks.PERMISSOES_POR_PERFIL[user.perfil]));
  }
  users[0].nome = 'external change';
  assert.equal((await api.getUsers())[0].nome, 'Ricardo Silveira');
});

test('schema validates required fields, email, profile and permission dependencies', () => {
  const { schema, fixture } = setup();
  for (const patch of [{ nome: ' ' }, { cargo: '' }, { email: 'invalid' }, { unidade: '' }, { perfil: 'unknown' }]) {
    assert.equal(schema.userFormSchema.safeParse({ ...fixture(), ...patch }).success, false);
  }
  const value = fixture();
  value.permissoes.Usuários.editar = true;
  assert.equal(schema.userFormSchema.safeParse(value).success, false);
  assert.equal(schema.userFormSchema.parse(fixture()).nome, 'Nova Pessoa');
});

test('create saves every field, custom permissions and authorized units to the same memory store', async () => {
  const { api, fixture } = setup();
  const input = fixture();
  input.permissoes.Documentos.excluir = true;
  const created = await api.saveUserDemo(input);
  assert.equal((await api.getUsers()).length, 9);
  assert.equal(created.nome, 'Nova Pessoa');
  assert.equal(created.status, 'convite_pendente');
  const detail = await api.getUserDetail(created.id);
  assert.equal(detail.phone, '123');
  assert.equal(detail.permissions.Documentos.excluir, true);
  assert.deepEqual(Array.from(detail.units), [input.unidade, ...input.unidadesAutorizadas]);
  assert.equal(detail.activities, undefined);
  const form = await api.getUserForm(created.id);
  assert.equal(form.exigirMfa, true);
  created.permissoes.Documentos.excluir = false;
  assert.equal((await api.getUserDetail(created.id)).permissions.Documentos.excluir, true);
});

test('invalid units, duplicate emails and unavailable edit targets fail without modifying records', async () => {
  const { api, fixture } = setup();
  for (const patch of [{ email: 'RICARDO@adega.com.br' }, { unidade: 'unknown' }, { unidadesAutorizadas: ['unknown'] }]) {
    await assert.rejects(api.saveUserDemo({ ...fixture(), ...patch }));
  }
  await assert.rejects(api.saveUserDemo(fixture(), 'missing'));
  assert.equal((await api.getUsers()).length, 8);
});

test('edit preserves identity, status, last access and original history; toggle/delete update details', async () => {
  const { api, mocks } = setup();
  const before = await api.getUserDetail('1');
  const form = await api.getUserForm('1');
  const edited = await api.saveUserDemo({ ...form, nome: 'Ricardo editado', email: 'edited@example.com', perfil: 'Financeiro', permissoes: mocks.PERMISSOES_POR_PERFIL.Financeiro }, '1');
  assert.equal(edited.id, '1');
  assert.equal(edited.status, 'ativo');
  assert.equal(edited.ultimoAcesso, mocks.USUARIOS_MOCK[0].ultimoAcesso);
  const detail = await api.getUserDetail('1');
  assert.equal(detail.createdAt, before.createdAt);
  assert.deepEqual(detail.activities, before.activities);
  assert.equal(detail.permissions.Financeiro.excluir, true);
  await api.toggleUserStatusDemo('1');
  assert.equal((await api.getUserDetail('1')).status, 'Inativo');
  await api.toggleUserStatusDemo('1');
  assert.equal((await api.getUserDetail('1')).status, 'Ativo');
  await api.deleteUserDemo('1');
  assert.equal(await api.getUserDetail('1'), null);
  assert.equal(await api.getUserForm('1'), null);
  await assert.rejects(api.toggleUserStatusDemo('1'));
});

test('save and action mutations synchronize list and detail caches, including inactive cached records', async () => {
  const { api, fixture, load } = setup();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const hooks = loader({
    '@tanstack/react-query': { useQueryClient: () => client, useMutation: options => options },
    '@/services/users': api,
  })('src/hooks/queries/useUsersQuery.ts');
  const keys = load('src/lib/query-keys.ts').queryKeys;
  const save = hooks.useSaveUserMutation();
  await save.onMutate();
  const created = await save.mutationFn(fixture());
  await save.onSuccess(created);
  assert.equal(client.getQueryData(keys.users.lists()).length, 9);
  assert.equal(client.getQueryData(keys.users.detail(created.id)).name, 'Nova Pessoa');
  const toggle = hooks.useUserActionMutation('toggle');
  await toggle.onMutate();
  await toggle.mutationFn(created.id);
  await toggle.onSuccess(undefined, created.id);
  assert.equal(client.getQueryData(keys.users.detail(created.id)).status, 'Inativo');
  const remove = hooks.useUserActionMutation('delete');
  await remove.mutationFn(created.id);
  await remove.onSuccess(undefined, created.id);
  assert.equal(client.getQueryData(keys.users.detail(created.id)), null);
  assert.equal(client.getQueryData(keys.users.lists()).length, 8);
  client.clear();
});

function guard(dirty) {
  const events = {};
  const changes = [];
  const navigations = [];
  let discarded = 0;
  const window = {
    location: { href: 'https://bevox.test/usuarios/novo' },
    history: { state: {}, pushState() {}, forward() {}, go: delta => navigations.push(delta) },
    addEventListener: (name, handler) => { events[name] = handler; }, removeEventListener() {},
  };
  const load = loader({
    react: {
      useState: () => [false, value => changes.push(value)], useRef: value => ({ current: value }),
      useId: () => 'guard-id', useCallback: fn => fn, useEffect: fn => { fn(); },
    },
    'next/navigation': { useRouter: () => ({ push: target => navigations.push(target) }) },
    globals: { window, document: { addEventListener: (name, handler) => { events[name] = handler; }, removeEventListener() {} } },
  });
  const result = load('src/hooks/useUnsavedChanges.tsx').useUnsavedChanges({ dirty, onDiscard: () => { discarded++; } });
  const buttons = result.dialog.props.children.at(-1).props.children;
  return { ...result, events, changes, navigations, buttons, discarded: () => discarded };
}

test('empty form exits immediately; populated form stays without discarding, then confirms discard', () => {
  const empty = guard(false);
  empty.requestNavigation('/usuarios');
  assert.deepEqual(empty.navigations, ['/usuarios']);
  assert.equal(empty.events.beforeunload, undefined);
  const filled = guard(true);
  filled.requestNavigation('/usuarios');
  assert.deepEqual(filled.navigations, []);
  assert.equal(filled.changes.at(-1), true);
  filled.buttons[0].props.onClick();
  assert.equal(filled.discarded(), 0);
  assert.equal(filled.changes.at(-1), false);
  filled.requestDiscard(() => filled.navigations.push('/usuarios'));
  filled.buttons[1].props.onClick();
  assert.equal(filled.discarded(), 1);
  assert.deepEqual(filled.navigations, ['/usuarios']);
});

test('saved form may navigate and native reload/back protection uses existing guard', () => {
  const saved = guard(true);
  saved.allowNavigation();
  saved.requestNavigation('/usuarios');
  assert.deepEqual(saved.navigations, ['/usuarios']);
  assert.equal(saved.discarded(), 0);
  const filled = guard(true);
  let prevented = false;
  filled.events.beforeunload({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  filled.events.popstate({ stopImmediatePropagation() {} });
  assert.equal(filled.changes.at(-1), true);
  filled.buttons[0].props.onClick();
  assert.equal(filled.discarded(), 0);
});
