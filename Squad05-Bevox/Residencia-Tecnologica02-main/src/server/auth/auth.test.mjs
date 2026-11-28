import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const requireDependency = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../../..');
function loader(overrides = {}) {
  const cache = new Map();
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative).exports;
    const filename = path.join(root, relative);
    const loaded = { exports: {} };
    cache.set(relative, loaded);
    vm.runInNewContext(ts.transpileModule(readFileSync(filename, 'utf8'), {
      fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, {
      exports: loaded.exports, module: loaded, URL, Request, Response, Headers, TextDecoder, Uint8Array, Date, Set, Map, structuredClone, crypto,
      require(name) {
        if (Object.hasOwn(overrides, name)) return overrides[name];
        if (name === 'server-only') return {};
        if (name === 'next/navigation') return { redirect: route => { throw new Error('redirect:' + route); } };
        if (name === 'next/headers') return { cookies: async () => ({ get: () => undefined }) };
        return name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : requireDependency(name);
      },
    }, { filename });
    return loaded.exports;
  }
  return load;
}
function fixture() {
  const load = loader();
  const { MODULOS, ACOES } = load('src/schemas/user.ts');
  const user = {
    id: 'test-account', nome: 'Pessoa Teste', email: 'test@example.com', perfil: 'Colaborador', unidade: 'Unidade Teste', unidadeId: 'test-unit',
    permissoes: Object.fromEntries(MODULOS.map(module => [module, Object.fromEntries(ACOES.map(action => [action, module === 'Dashboard' && action === 'visualizar']))])),
    status: 'ativo', cadastroPendente: false, passwordHash: 'test-double-hash-not-a-production-credential',
  };
  const records = new Map();
  let created = 0;
  const backend = {
    findAccountByEmail: async email => email === user.email ? structuredClone(user) : null,
    findAccountById: async id => id === user.id ? structuredClone(user) : null,
    verifyPassword: async (password, hash) => password === 'test-only-password' && hash === user.passwordHash,
    createSession: async (accountId, expiresAt) => { created++; const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', ''); records.set(token, { accountId, expiresAt, revoked: false }); return token; },
    readSession: async token => structuredClone(records.get(token) ?? null),
    revokeSession: async token => { const record = records.get(token); if (record) record.revoked = true; },
  };
  return { load, user, backend, records, core: load('src/server/auth/core.ts'), created: () => created };
}
const credentials = () => ({ email: ' TEST@EXAMPLE.COM ', senha: 'test-only-password', rememberDevice: false });
const NextRequest = requireDependency('next/server').NextRequest;
const request = (path, body, headers = {}, protocol = 'http:') => new NextRequest(protocol + '//localhost:3001' + path, {
  method: 'POST', headers: { origin: protocol + '//localhost:3001', 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('login validates email and password without trimming the password or accepting whitespace-only credentials', () => {
  const load = loader();
  const { loginRequestSchema } = load('src/schemas/auth.ts');
  const parsed = loginRequestSchema.parse({ ...credentials(), senha: ' padded-password ' });
  assert.equal(parsed.email, 'test@example.com');
  assert.equal(parsed.senha, ' padded-password ');
  for (const patch of [{ email: '' }, { email: 'bad' }, { senha: '' }, { senha: '   ' }, { senha: 'x'.repeat(129) }, { rememberDevice: 'true' }]) assert.equal(loginRequestSchema.safeParse({ ...credentials(), ...patch }).success, false);
});

test('the configured demonstration authenticates an active mock but never accepts an unknown identity or forged cookie', async () => {
  const load = loader();
  const server = load('src/server/auth/session.ts');
  const result = await server.loginOnServer({ email: 'ricardo@adega.com.br', senha: '123456' });
  try {
    assert.equal(result.session.user.id, '1');
    assert.equal(result.session.user.perfil, 'Administrador Geral');
    assert.equal((await server.verifyServerSession(result.token)).user.id, '1');
  } finally { await server.logoutOnServer(result.token); }
  assert.equal(await server.verifyServerSession(result.token), null);
  await assert.rejects(server.loginOnServer({ email: 'inexistente@example.com', senha: '123456' }), error => error.status === 401 && error.code === 'INVALID_CREDENTIALS');
  for (const token of [undefined, 'ricardo%40adega.com.br', 'forged-token'.repeat(8)]) assert.equal(await server.verifyServerSession(token), null);
  await assert.rejects(server.requireServerSession(), /redirect:\/login/);
  await assert.rejects(server.requireServerPermission('Usuários', 'excluir'), error => error.status === 401);
});

test('incorrect password or unknown email never creates a session and shares the required generic message', async () => {
  const { backend, core, created } = fixture();
  for (const patch of [{ senha: 'wrong-password' }, { email: 'missing@example.com' }]) {
    await assert.rejects(core.authenticate(backend, { ...credentials(), ...patch }), error => error.status === 401 && error.message === core.INVALID_CREDENTIALS);
  }
  assert.equal(created(), 0);
});

test('inactive, invited and pending-registration accounts are denied even when password verification succeeds', async () => {
  const { backend, core, user, created } = fixture();
  for (const [status, pending] of [['inativo', false], ['convite_pendente', false], ['ativo', true]]) {
    user.status = status; user.cadastroPendente = pending;
    await assert.rejects(core.authenticate(backend, credentials()), error => error.status === 403 && error.code === 'ACCOUNT_NOT_AUTHORIZED');
  }
  assert.equal(created(), 0);
});

test('an authorized test backend verifies password and stored session before returning the correct sanitized identity', async () => {
  const { backend, core, user, created } = fixture();
  const result = await core.authenticate(backend, { ...credentials(), perfil: 'Administrador Geral', permissoes: { all: true } });
  assert.equal(created(), 1);
  assert.equal(result.redirectTo, '/dashboard');
  assert.equal(result.session.user.id, user.id);
  assert.equal(result.session.user.perfil, 'Colaborador');
  assert.equal('passwordHash' in result.session.user, false);
  assert.equal('status' in result.session.user, false);
  assert.equal(JSON.stringify(result.session).includes(result.token), false);
});

test('session validation rejects forged, expired, revoked, missing-account and newly inactive accounts', async () => {
  const { backend, core, user, records } = fixture();
  assert.equal(await core.verifySession(backend, 'forged'.repeat(10)), null);
  const { token } = await core.authenticate(backend, credentials());
  const record = records.get(token);
  record.expiresAt = Date.now() - 1;
  assert.equal(await core.verifySession(backend, token), null);
  record.expiresAt = Date.now() + 60000; record.revoked = true;
  assert.equal(await core.verifySession(backend, token), null);
  record.revoked = false; user.status = 'inativo';
  assert.equal(await core.verifySession(backend, token), null);
  user.status = 'ativo'; record.accountId = 'deleted-account';
  assert.equal(await core.verifySession(backend, token), null);
  assert.equal(await core.verifySession(backend, 'a'.repeat(4097)), null);
});

test('logout revokes only the current stored session and does not swallow backend failures', async () => {
  const { backend, core } = fixture();
  const first = await core.authenticate(backend, credentials());
  const second = await core.authenticate(backend, credentials());
  assert.notEqual(first.token, second.token);
  await core.revokeSession(backend, first.token);
  assert.equal(await core.verifySession(backend, first.token), null);
  assert.ok(await core.verifySession(backend, second.token));
  backend.revokeSession = async () => { throw new Error('Backend unavailable'); };
  await assert.rejects(core.revokeSession(backend, second.token), /Backend unavailable/);
});

test('session creation must be confirmed and cannot outlive its requested expiration', async () => {
  const { backend, core, records } = fixture();
  const create = backend.createSession;
  backend.createSession = async (...args) => { const token = await create(...args); records.get(token).expiresAt += 1; return token; };
  await assert.rejects(core.authenticate(backend, credentials()), error => error.status === 503);
  assert.equal([...records.values()][0].revoked, true);
});

test('a backend failure after creation cannot deliver a session and attempts to revoke the unconfirmed token', async () => {
  const { backend, core, records } = fixture();
  backend.readSession = async () => { throw new Error('Confirmation unavailable'); };
  await assert.rejects(core.authenticate(backend, credentials()), /Confirmation unavailable/);
  assert.equal([...records.values()][0].revoked, true);
});

test('server permissions enforce action, view and unit without treating every authenticated user as administrator', async () => {
  const { core, backend, user, load, created } = fixture();
  const rules = load('src/server/auth/permissions.ts');
  assert.equal(rules.canAccessPath(user, '/dashboard'), true);
  for (const route of ['/usuarios/1/editar', '/configuracoes', '/unidades/nova', '/documentos/new', '/unknown']) assert.equal(rules.canAccessPath(user, route), false, route);
  user.permissoes.Documentos.visualizar = true;
  user.permissoes.Documentos.criar = true;
  assert.equal(rules.hasPermission(user, 'Documentos', 'criar', user.unidadeId), true);
  assert.equal(rules.hasPermission(user, 'Documentos', 'criar', 'other-unit'), false);
  assert.equal(rules.hasPermission(user, 'Documentos', 'toString'), false);
  assert.equal(rules.hasPermission(user, '__proto__', 'visualizar'), false);
  assert.equal(rules.hasPermission(user, 'Documentos', 'criar', ''), false);
  assert.equal(rules.canAccessPath(user, '/documentos/new'), true);
  assert.equal(rules.canAccessPath(user, '/documentos/9/editar'), false);
  user.permissoes.Documentos.visualizar = false;
  assert.equal(rules.hasPermission(user, 'Documentos', 'criar'), false);
  user.permissoes.Dashboard.visualizar = false;
  await assert.rejects(core.authenticate(backend, credentials()), error => error.status === 403);
  assert.equal(created(), 0);
});

test('all private and dynamic paths reject cookies that only claim to identify a user, including dotted paths and API URLs', async () => {
  const load = loader();
  const { proxy } = load('src/proxy.ts');
  const routes = ['/', '/dashboard', '/unidades', '/documentos/new', '/tarefas', '/financeiro', '/licencas/cadastrar', '/operacional', '/relatorios', '/usuarios/1/editar', '/users/1', '/usuarios/id.with.dot', '/configuracoes/seguranca', '/notificacoes', '/unknown'];
  for (const cookie of ['', 'bevox_session=ricardo%40adega.com.br', 'bevox_session=' + 'forged'.repeat(10)]) {
    for (const route of routes) {
      const response = await proxy(new NextRequest('http://localhost:3001' + route, { headers: { cookie } }));
      assert.match(response.headers.get('location'), /^http:\/\/localhost:3001\/login(?:\?|$)/, route);
      assert.match(response.headers.get('cache-control'), /no-store/);
    }
    assert.equal((await proxy(new NextRequest('http://localhost:3001/api/private', { headers: { cookie } }))).status, 401);
  }
});

test('public pages and known public assets stay public, while fake cookies never redirect registration Entrar to Dashboard', async () => {
  const { proxy } = loader()('src/proxy.ts');
  for (const route of ['/login', '/cadastro', '/privacidade', '/termos', '/bevox-logo-oficial.png']) {
    const response = await proxy(new NextRequest('http://localhost:3001' + route, { headers: { cookie: 'bevox_session=ricardo%40adega.com.br' } }));
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.status, 200);
  }
  const code = readFileSync(path.join(root, 'src/proxy.ts'), 'utf8');
  assert.equal(code.includes('.*\\\\..*'), false, 'matcher must not exempt every dotted route');
});

test('a verified test session permits only authorized server routes and refreshed status changes revoke that access', async () => {
  const { backend, core, user } = fixture();
  const { token } = await core.authenticate(backend, credentials());
  const load = loader({ '@/server/auth/session': { verifyServerSession: value => core.verifySession(backend, value) } });
  const { proxy } = load('src/proxy.ts');
  const req = route => new NextRequest('http://localhost:3001' + route, { headers: { cookie: 'bevox_session=' + token } });
  assert.equal((await proxy(req('/dashboard'))).status, 200);
  assert.equal((await proxy(req('/usuarios'))).status, 403);
  assert.equal((await proxy(req('/login'))).headers.get('location'), 'http://localhost:3001/dashboard');
  user.status = 'inativo';
  assert.match((await proxy(req('/dashboard'))).headers.get('location'), /\/login/);
});

test('login endpoint validates requests and credentials without exposing internal storage errors', async () => {
  const load = loader();
  const { POST } = load('src/app/api/auth/login/route.ts');
  for (const [body, status] of [[{ email: '', senha: '' }, 400], ['{invalid', 400], [{ email: 'inexistente@example.com', senha: '123456' }, 401], ['x'.repeat(9000), 413]]) {
    const response = await POST(request('/api/auth/login', body));
    assert.equal(response.status, status);
    assert.match(response.headers.get('cache-control'), /no-store/);
    const data = await response.json();
    assert.equal('session' in data, false);
    assert.equal(JSON.stringify(data).includes('123456'), false);
  }
  const failing = loader({ '@/server/auth/session': { loginOnServer: async () => { throw new Error('database-secret-do-not-return'); } } });
  const response = await failing('src/app/api/auth/login/route.ts').POST(request('/api/auth/login', credentials()));
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes('database-secret'), false);
});

test('login and logout reject cross-origin or missing-origin requests without mutating cookies', async () => {
  const load = loader();
  for (const route of ['login', 'logout']) {
    const { POST } = load('src/app/api/auth/' + route + '/route.ts');
    const cross = await POST(request('/api/auth/' + route, credentials(), { origin: 'https://attacker.example' }));
    assert.equal(cross.status, 403);
    assert.equal(cross.headers.get('set-cookie'), null);
    const withoutOrigin = request('/api/auth/' + route, credentials());
    withoutOrigin.headers.delete('origin');
    assert.equal((await POST(withoutOrigin)).status, 403);
  }
});

test('HTTP logout expires the legacy cookie on the server with HttpOnly/SameSite and does not report success on revocation failure', async () => {
  const load = loader();
  const response = await load('src/app/api/auth/logout/route.ts').POST(request('/api/auth/logout', {}, { cookie: 'bevox_session=legacy' }, 'https:'));
  assert.equal(response.status, 204);
  const cookie = response.headers.get('set-cookie');
  for (const pattern of [/bevox_session=/, /Max-Age=0/i, /HttpOnly/i, /SameSite=lax/i, /Secure/i, /Path=\//i]) assert.match(cookie, pattern);
  const failed = loader({ '@/server/auth/session': { logoutOnServer: async () => { throw new Error('not revoked'); } } });
  const failedResponse = await failed('src/app/api/auth/logout/route.ts').POST(request('/api/auth/logout', {}));
  assert.equal(failedResponse.status, 503);
  assert.equal(failedResponse.headers.get('set-cookie'), null);
});

test('session endpoint denies all unverified identities and never returns the fallback administrator', async () => {
  const { GET } = loader()('src/app/api/auth/session/route.ts');
  const response = await GET(new NextRequest('http://localhost:3001/api/auth/session', { headers: { cookie: 'bevox_session=ricardo%40adega.com.br' } }));
  assert.equal(response.status, 401);
  const data = await response.json();
  assert.equal('session' in data, false);
  assert.equal(JSON.stringify(data).includes('Ricardo'), false);
});

test('successful HTTP test backend sets only a server cookie and returns no opaque token or password hash', async () => {
  const { backend, core } = fixture();
  const load = loader({ '@/server/auth/session': { loginOnServer: input => core.authenticate(backend, input) } });
  const response = await load('src/app/api/auth/login/route.ts').POST(request('/api/auth/login', { ...credentials(), rememberDevice: true }, {}, 'https:'));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=lax/i);
  const json = await response.json();
  assert.equal(json.session.user.perfil, 'Colaborador');
  assert.equal('token' in json, false);
  assert.equal('passwordHash' in json.session.user, false);
  assert.equal(json.redirectTo, '/dashboard');
});

async function demoFixture(t) {
  const parent = path.join(root, '.next/cache');
  await mkdir(parent, { recursive: true });
  const directory = await mkdtemp(path.join(parent, 'bevox-auth-test-'));
  t.after(async () => {
    assert.equal(path.dirname(directory), parent);
    assert.ok(path.basename(directory).startsWith('bevox-auth-test-'));
    await rm(directory, { recursive: true, force: true });
  });
  const load = loader();
  const backend = load('src/server/auth/demo-backend.ts').createDemoBackend(directory);
  const core = load('src/server/auth/core.ts');
  const mocks = load('src/lib/usuarios-mock.ts');
  return { load, backend, core, mocks, directory };
}

for (const [email, id, profile, status] of [
  ['ricardo@adega.com.br', '1', 'Administrador Geral', 'ativo'],
  ['carlos@adega.com.br', '2', 'Gestor de Unidade', 'ativo'],
  ['ana@adega.com.br', '3', 'Financeiro', 'ativo'],
  ['mariana@adega.com.br', '4', 'Operacional', 'ativo'],
  ['pedro@adega.com.br', '5', 'Colaborador', 'convite_pendente'],
  ['gabriel@adega.com.br', '6', 'Gestor de Unidade', 'ativo'],
  ['tatiana@adega.com.br', '7', 'Financeiro', 'inativo'],
  ['bruno@adega.com.br', '8', 'Operacional', 'ativo'],
]) {
  test('demonstration account ' + email + ' preserves its own identity, permissions and status ' + status, async t => {
    const { backend, core, mocks, directory } = await demoFixture(t);
    const input = { email, senha: '123456' };
    if (status !== 'ativo') {
      await assert.rejects(core.authenticate(backend, input), error => error.status === 403 && error.code === 'ACCOUNT_NOT_AUTHORIZED');
      assert.equal((await readdir(directory)).length, 0);
    } else {
      const result = await core.authenticate(backend, input);
      const expected = mocks.USUARIOS_MOCK.find(user => user.id === id);
      assert.equal(result.session.user.id, id);
      assert.equal(result.session.user.nome, expected.nome);
      assert.equal(result.session.user.email, email);
      assert.equal(result.session.user.perfil, profile);
      assert.equal(result.session.user.unidade, expected.unidade);
      assert.equal(JSON.stringify(result.session.user.permissoes), JSON.stringify(mocks.PERMISSOES_POR_PERFIL[profile]));
      assert.equal(result.redirectTo, '/dashboard');
      assert.equal('senha' in result.session.user, false);
      assert.equal('passwordHash' in result.session.user, false);
      assert.equal(JSON.stringify(result.session).includes('123456'), false);
      assert.equal((await core.verifySession(backend, result.token)).user.id, id);
      await core.revokeSession(backend, result.token);
      assert.equal(await core.verifySession(backend, result.token), null);
    }
    assert.equal(mocks.USUARIOS_MOCK.find(user => user.id === id).status, status);
    assert.equal(mocks.USUARIOS_MOCK.length, 8);
  });
}

test('demo rejects every wrong credential without creating files; normalization applies only to email', async t => {
  const { core, backend, directory } = await demoFixture(t);
  for (const input of [
    { email: 'missing@adega.com.br', senha: '123456' },
    { email: 'ricardo@adega.com.br', senha: 'errada' },
    { email: 'ricardo@adega.com.br', senha: ' 123456 ' },
    { email: 'missing@adega.com.br', senha: 'errada' },
  ]) await assert.rejects(core.authenticate(backend, input), error => error.status === 401 && error.message === core.INVALID_CREDENTIALS);
  for (const input of [{ email: '', senha: '123456' }, { email: 'inválido', senha: '123456' }, { email: 'ricardo@adega.com.br', senha: '' }]) {
    await assert.rejects(core.authenticate(backend, input), error => error.status === 400);
  }
  assert.equal((await readdir(directory)).length, 0);
  const result = await core.authenticate(backend, { email: '  RICARDO@ADEGA.COM.BR  ', senha: '123456', perfil: 'Colaborador' });
  assert.equal(result.session.user.email, 'ricardo@adega.com.br');
  assert.equal(result.session.user.perfil, 'Administrador Geral');
});

test('independent demo instances share persisted sessions and logout revokes copied tokens across workers', async t => {
  const { core, backend, directory } = await demoFixture(t);
  const independent = loader()('src/server/auth/demo-backend.ts').createDemoBackend(directory);
  const first = await core.authenticate(backend, { email: 'ricardo@adega.com.br', senha: '123456' });
  const second = await core.authenticate(independent, { email: 'carlos@adega.com.br', senha: '123456', rememberDevice: true });
  assert.notEqual(first.token, second.token);
  assert.equal((await core.verifySession(independent, first.token)).user.id, '1');
  assert.equal((await core.verifySession(backend, second.token)).user.id, '2');
  assert.equal(first.session.expiresAt - Date.now() <= 8 * 60 * 60 * 1000, true);
  assert.equal(second.session.expiresAt - Date.now() > 29 * 24 * 60 * 60 * 1000, true);
  await core.revokeSession(independent, first.token);
  assert.equal(await core.verifySession(backend, first.token), null);
  assert.equal((await core.verifySession(backend, second.token)).user.id, '2');
  const serialized = (await Promise.all((await readdir(directory)).map(file => readFile(path.join(directory, file), 'utf8')))).join('');
  for (const secret of ['123456', 'senha', 'passwordHash', first.token, second.token]) assert.equal(serialized.includes(secret), false);
});

test('demo expiration, corrupted sessions, forged cookies and removed/restricted accounts cannot authorize access', async t => {
  const { core, backend, mocks, directory } = await demoFixture(t);
  for (const token of ['ricardo%40adega.com.br', '1', 'forged'.repeat(10), '../../dashboard']) assert.equal(await core.verifySession(backend, token), null);
  const result = await core.authenticate(backend, { email: 'ricardo@adega.com.br', senha: '123456' });
  const account = mocks.USUARIOS_MOCK[0];
  account.status = 'inativo';
  assert.equal(await core.verifySession(backend, result.token), null);
  account.status = 'ativo'; account.cadastroPendente = true;
  assert.equal(await core.verifySession(backend, result.token), null);
  account.cadastroPendente = false;
  mocks.USUARIOS_MOCK.shift();
  assert.equal(await core.verifySession(backend, result.token), null);
  mocks.USUARIOS_MOCK.unshift(account);
  const file = path.join(directory, createHash('sha256').update(result.token).digest('hex') + '.json');
  await writeFile(file, '{invalid');
  assert.equal(await core.verifySession(backend, result.token), null);
  await writeFile(file, JSON.stringify({ accountId: account.id, expiresAt: Date.now() - 1, revoked: false }));
  assert.equal(await core.verifySession(backend, result.token), null);
  assert.equal((await readdir(directory)).length, 0);
});

test('existing mock role and unit rules remain enforced for demonstration users without admin promotion', async t => {
  const { core, backend, load } = await demoFixture(t);
  const rules = load('src/server/auth/permissions.ts');
  const carlos = (await core.authenticate(backend, { email: 'carlos@adega.com.br', senha: '123456' })).session.user;
  const ana = (await core.authenticate(backend, { email: 'ana@adega.com.br', senha: '123456' })).session.user;
  const mariana = (await core.authenticate(backend, { email: 'mariana@adega.com.br', senha: '123456' })).session.user;
  assert.equal(carlos.unidadeId, 'uo3');
  assert.equal(ana.unidadeId, 'uo1');
  assert.equal(mariana.unidadeId, 'uo2');
  assert.equal(rules.hasPermission(carlos, 'Tarefas', 'editar', 'uo3'), true);
  assert.equal(rules.hasPermission(carlos, 'Tarefas', 'editar', 'uo2'), false);
  assert.equal(rules.canAccessPath(carlos, '/usuarios/1/editar'), false);
  assert.equal(rules.canAccessPath(ana, '/financeiro'), true);
  assert.equal(rules.canAccessPath(ana, '/usuarios'), false);
  assert.equal(rules.canAccessPath(mariana, '/financeiro'), false);
  assert.equal(rules.canAccessPath(mariana, '/tarefas'), true);
  assert.equal(rules.canAccessPath(mariana, '/configuracoes'), false);
});

test('real demo adapter completes HTTP login, session, Proxy and logout without an external service', async t => {
  const { core, backend } = await demoFixture(t);
  const load = loader({ '@/server/auth/session': {
    loginOnServer: input => core.authenticate(backend, input),
    verifyServerSession: token => core.verifySession(backend, token),
    logoutOnServer: token => core.revokeSession(backend, token),
  } });
  const login = await load('src/app/api/auth/login/route.ts').POST(request('/api/auth/login', { email: 'carlos@adega.com.br', senha: '123456' }));
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.doesNotMatch(login.headers.get('set-cookie'), /Expires=|Max-Age=/i);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const withCookie = route => new NextRequest('http://localhost:3001' + route, { headers: { cookie } });
  const session = await load('src/app/api/auth/session/route.ts').GET(withCookie('/api/auth/session'));
  assert.equal(session.status, 200);
  assert.equal((await session.json()).session.user.id, '2');
  const { proxy } = load('src/proxy.ts');
  assert.equal((await proxy(withCookie('/dashboard'))).status, 200);
  assert.equal((await proxy(withCookie('/'))).headers.get('location'), 'http://localhost:3001/dashboard');
  assert.equal((await proxy(withCookie('/usuarios/1/editar'))).status, 403);
  const logout = await load('src/app/api/auth/logout/route.ts').POST(request('/api/auth/logout', {}, { cookie }));
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/i);
  assert.equal((await load('src/app/api/auth/session/route.ts').GET(withCookie('/api/auth/session'))).status, 401);
  assert.match((await proxy(withCookie('/dashboard'))).headers.get('location'), /\/login/);
});
