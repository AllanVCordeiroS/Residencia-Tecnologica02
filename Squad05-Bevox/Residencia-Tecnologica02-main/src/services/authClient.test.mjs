import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import path from "node:path";
import ts from "typescript";
import React from "react";
import { QueryClient } from "@tanstack/react-query";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const modules = new Map();
function load(relative, overrides = {}) {
  const filename = path.resolve(root, relative);
  if (!Object.keys(overrides).length && modules.has(filename)) return modules.get(filename);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loadedModule = { exports: {} };
  const resolveImport = (name) => Object.hasOwn(overrides, name) ? overrides[name]
    : name.startsWith("@/") ? load(name.slice(2) + ".ts") : require(name);
  new Function("require", "module", "exports", compiled)(resolveImport, loadedModule, loadedModule.exports);
  if (!Object.keys(overrides).length) modules.set(filename, loadedModule.exports);
  return loadedModule.exports;
}
const auth = load("services/authClient.ts");
const owner = load("lib/preference-owner.ts");
const { MODULOS, ACOES } = load("schemas/user.ts");
const permissions = Object.fromEntries(MODULOS.map((name) => [name, Object.fromEntries(ACOES.map((action) => [action, action === "visualizar"]))]));
const session = (id = "test-user") => ({
  user: { id, nome: "Pessoa de Teste", email: "pessoa@example.test", perfil: "Colaborador", unidade: "Teste", permissoes: structuredClone(permissions) },
  expiresAt: Date.now() + 60_000,
});
const credentials = () => ({ email: "pessoa@example.test", senha: randomUUID(), rememberDevice: false });
const response = (body, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const settle = async () => { for (let i = 0; i < 12; i++) await new Promise((resolve) => setImmediate(resolve)); };
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };

class Storage {
  values = new Map();
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
let storage;
beforeEach(() => {
  storage = new Storage();
  globalThis.window = { sessionStorage: storage };
  globalThis.document = Object.defineProperty({}, "cookie", { get() { assert.fail("Auth must never read a browser cookie"); }, set() { assert.fail("Auth must never create a browser cookie"); } });
  owner.setPreferenceOwner(null);
});

test("login fails closed on invalid input and never sends it", async () => {
  globalThis.fetch = () => assert.fail("Invalid input must not reach server");
  await assert.rejects(auth.loginAndConfirm({ ...credentials(), email: "invalid" }, new QueryClient()), (error) => error.status === 400);
});

test("401 has the exact generic invalid-credentials message; 403 and 503 stay distinct", async () => {
  for (const [status, message] of [[400, "Confira o e-mail e a senha informados."], [401, auth.INVALID_CREDENTIALS_MESSAGE], [403, "Esta conta não está autorizada a acessar a plataforma."], [503, auth.AUTH_UNAVAILABLE_MESSAGE]]) {
    globalThis.fetch = async () => response({ error: "test", message: "must not expose backend details" }, status);
    await assert.rejects(auth.loginAndConfirm(credentials(), new QueryClient()), (error) => error.status === status && error.message === message);
  }
});

test("successful login cancels and clears previous queries/mutations BEFORE POST, then confirms GET", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["private"], { previousOwner: true });
  queryClient.getMutationCache().build(queryClient, {}).state.variables = { previousPrivateValue: true };
  owner.setPreferenceOwner("previous-user");
  storage.setItem("bevox.settings.filters.table.previous-user", "private-filter");
  storage.setItem("public-preference", "keep");
  const calls = [];
  const expected = session();
  const input = credentials();
  globalThis.fetch = async (url, init) => {
    calls.push(url);
    assert.equal(init.credentials, "same-origin");
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    assert.equal(queryClient.getQueryCache().getAll().length, 0);
    assert.equal(queryClient.getMutationCache().getAll().length, 0);
    assert.equal(owner.getPreferenceOwner(), "default");
    if (url === "/api/auth/login") {
      assert.equal(init.method, "POST");
      assert.deepEqual(JSON.parse(init.body), input);
      return response({ session: expected, redirectTo: "/dashboard" });
    }
    assert.equal(init.method, undefined);
    return response({ session: expected });
  };
  const result = await auth.loginAndConfirm(input, queryClient);
  assert.equal(result.session.user.id, expected.user.id);
  assert.equal(result.redirectTo, "/dashboard");
  assert.deepEqual(calls, ["/api/auth/login", "/api/auth/session"]);
  assert.equal(storage.getItem("bevox.settings.filters.table.previous-user"), null);
  assert.equal(storage.getItem("public-preference"), "keep");
  assert.equal(owner.getPreferenceOwner(), "default");
});

test("POST 200 alone cannot authenticate: GET 401/503, malformed, expired or changed identity all deny", async () => {
  for (const confirm of [
    () => response({}, 401), () => response({}, 503), () => response({ session: {} }),
    () => response({ session: { ...session(), expiresAt: Date.now() - 1 } }),
    () => response({ session: session("other-user") }),
  ]) {
    globalThis.fetch = async (url) => url.endsWith("/login")
      ? response({ session: session(), redirectTo: "/dashboard" }) : confirm();
    await assert.rejects(auth.loginAndConfirm(credentials(), new QueryClient()), auth.AuthClientError);
    assert.equal(owner.getPreferenceOwner(), "default");
  }
});

test("unsafe redirects cannot become navigation targets", () => {
  for (const value of ["https://example.test", "//example.test", "/\\example.test", "/%2fexample.test", "/login", "/cadastro", "/", "/dashboard?next=//evil", undefined]) {
    assert.throws(() => auth.internalAuthRedirect(value), auth.AuthClientError);
  }
  assert.equal(auth.internalAuthRedirect("/documentos/novo"), "/documentos/novo");
});

test("network and JSON errors never expose credentials, backend errors, or authenticate", async () => {
  const input = credentials();
  globalThis.fetch = async () => { throw new Error(input.senha); };
  await assert.rejects(auth.loginAndConfirm(input, new QueryClient()), { message: auth.AUTH_UNAVAILABLE_MESSAGE });
  globalThis.fetch = async () => new Response("<html>error</html>");
  await assert.rejects(auth.loginAndConfirm(input, new QueryClient()), { message: auth.AUTH_UNAVAILABLE_MESSAGE });
});

test("logout failure preserves identity, query/mutation data and filter cache for retry", async () => {
  const client = new QueryClient();
  client.setQueryData(["private"], "preserve");
  client.getMutationCache().build(client, {});
  owner.setPreferenceOwner("current-user");
  storage.setItem("bevox.settings.filters.table.current-user", "preserve");
  for (const status of [200, 401, 503]) {
    globalThis.fetch = async () => response({}, status);
    await assert.rejects(auth.logoutAndClear(client, () => assert.fail("Must not announce logout")), { message: auth.LOGOUT_FAILED_MESSAGE });
    assert.equal(owner.getPreferenceOwner(), "current-user");
    assert.equal(client.getQueryData(["private"]), "preserve");
    assert.equal(client.getMutationCache().getAll().length, 1);
    assert.equal(storage.length, 1);
  }
});

test("logout waits for POST 204, hides identity, cancels requests then clears including mutations", async () => {
  const posted = deferred();
  const events = [];
  const client = new QueryClient();
  client.setQueryData(["private"], "old");
  client.getMutationCache().build(client, {});
  const originalCancel = client.cancelQueries.bind(client);
  const originalClear = client.clear.bind(client);
  client.cancelQueries = (...args) => { events.push("cancel"); return originalCancel(...args); };
  client.clear = () => { events.push("clear"); return originalClear(); };
  owner.setPreferenceOwner("old-user");
  globalThis.fetch = (url, init) => {
    assert.equal(url, "/api/auth/logout");
    assert.equal(init.method, "POST");
    assert.equal(init.credentials, "same-origin");
    assert.equal(init.cache, "no-store");
    events.push("post");
    return posted.promise;
  };
  const result = auth.logoutAndClear(client, () => { events.push("revoked"); });
  assert.deepEqual(events, ["post"]);
  assert.equal(client.getQueryData(["private"]), "old");
  posted.resolve(response(null, 204));
  await result;
  assert.deepEqual(events.slice(0, 4), ["post", "revoked", "cancel", "clear"]);
  assert.equal(owner.getPreferenceOwner(), "default");
  assert.equal(client.getQueryCache().getAll().length, 0);
  assert.equal(client.getMutationCache().getAll().length, 0);
});

test("aborted session checks forward cancellation and fail closed", async () => {
  const controller = new AbortController();
  globalThis.fetch = (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener("abort", () => reject(new Error("aborted")));
  });
  const pending = auth.getVerifiedSession(controller.signal);
  controller.abort();
  await assert.rejects(pending, auth.AuthClientError);
});

function providerFixture() {
  const hooks = [];
  let cursor = 0;
  let pathname = "/dashboard";
  const scheduled = [];
  const effects = (effect, deps) => {
    const index = cursor++;
    const previous = hooks[index];
    if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
      hooks[index] = { deps, cleanup: previous?.cleanup };
      scheduled.push(() => { hooks[index].cleanup?.(); hooks[index].cleanup = effect(); });
    }
  };
  const memo = (fn, deps) => {
    const index = cursor++;
    if (!hooks[index] || deps.some((value, i) => !Object.is(value, hooks[index].deps[i]))) hooks[index] = { value: fn, deps };
    return hooks[index].value;
  };
  const windowEvents = new Map();
  const documentEvents = new Map();
  const destinations = [];
  const broadcasts = [];
  const timers = new Map();
  const client = new QueryClient();
  globalThis.window = {
    sessionStorage: storage, localStorage: new Storage(),
    location: { replace: (route) => destinations.push(route) },
    addEventListener: (name, fn) => windowEvents.set(name, fn),
    removeEventListener: (name) => windowEvents.delete(name),
    setTimeout: (fn) => { const id = randomUUID(); timers.set(id, fn); return id; },
    clearTimeout: (id) => timers.delete(id),
  };
  globalThis.document = {
    visibilityState: "visible",
    addEventListener: (name, fn) => documentEvents.set(name, fn),
    removeEventListener: (name) => documentEvents.delete(name),
  };
  const OriginalChannel = globalThis.BroadcastChannel;
  const channelInstances = [];
  globalThis.BroadcastChannel = class {
    constructor() { channelInstances.push(this); }
    postMessage(value) { broadcasts.push(value); }
    close() {}
  };
  const Provider = load("providers/AuthProvider.tsx", {
    react: {
      ...React,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in hooks)) hooks[index] = typeof initial === "function" ? initial() : initial;
        return [hooks[index], (value) => { hooks[index] = typeof value === "function" ? value(hooks[index]) : value; }];
      },
      useRef: (initial) => {
        const index = cursor++;
        if (!(index in hooks)) hooks[index] = { current: initial };
        return hooks[index];
      },
      useCallback: memo, useEffect: effects, useLayoutEffect: effects,
    },
    "react-dom": { flushSync: (fn) => fn() },
    "next/navigation": { usePathname: () => pathname },
    "@tanstack/react-query": { useQueryClient: () => client },
  }).default;
  const initialSession = session();
  const render = () => {
    cursor = 0;
    const tree = Provider({ initialSession, children: "PRIVATE" });
    while (scheduled.length) scheduled.shift()();
    const boundary = React.Children.toArray(tree.props.children)[0];
    return { context: tree.props.value, visible: boundary.props.style.display === "contents" && boundary.props.children === "PRIVATE", mounted: boundary.props.children === "PRIVATE", scopeKey: boundary.key };
  };
  return {
    render, destinations, broadcasts, client, windowEvents, documentEvents, timers,
    navigate: (route) => { pathname = route; },
    broadcast: () => channelInstances.at(-1).onmessage({ data: "logout" }),
    restore: () => {
      for (const hook of hooks) hook?.cleanup?.();
      globalThis.BroadcastChannel = OriginalChannel;
    },
  };
}

test("provider hides private children until confirmed, sets preference owner to verified id and rechecks route", async () => {
  const pending = deferred();
  globalThis.fetch = () => pending.promise;
  const fixture = providerFixture();
  try {
    assert.equal(fixture.render().visible, false);
    await settle();
    pending.resolve(response({ session: session() }));
    await settle();
    assert.equal(fixture.render().visible, true);
    assert.equal(owner.getPreferenceOwner(), "test-user");
    globalThis.fetch = async () => response({}, 401);
    fixture.navigate("/documentos");
    assert.equal(fixture.render().visible, false);
    await settle();
    assert.deepEqual(fixture.destinations, ["/login?motivo=expirada"]);
    assert.equal(owner.getPreferenceOwner(), "default");
  } finally { fixture.restore(); }
});

test("provider ignores an older response and fails closed on newest 503", async () => {
  const first = deferred();
  const second = deferred();
  const calls = [];
  globalThis.fetch = (_url, init) => { calls.push(init.signal); return calls.length === 1 ? first.promise : second.promise; };
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    fixture.windowEvents.get("focus")();
    assert.equal(calls[0].aborted, true);
    second.resolve(response({}, 503));
    await settle();
    first.resolve(response({ session: session() }));
    await settle();
    assert.equal(fixture.render().visible, false);
    assert.deepEqual(fixture.destinations, ["/login?motivo=expirada"]);
  } finally { fixture.restore(); }
});

test("pagehide removes private DOM; pageshow/visibility verify again and storage logout clears data", async () => {
  let count = 0;
  globalThis.fetch = async () => { count++; return response({ session: session() }); };
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    assert.equal(fixture.render().visible, true);
    fixture.windowEvents.get("pagehide")();
    assert.equal(fixture.render().visible, false);
    assert.equal(fixture.render().mounted, true);
    fixture.windowEvents.get("pageshow")();
    await settle();
    assert.equal(fixture.render().visible, true);
    fixture.documentEvents.get("visibilitychange")();
    assert.equal(fixture.render().visible, false);
    await settle();
    assert.equal(fixture.render().visible, true);
    assert.equal(count, 3);
    fixture.client.setQueryData(["private"], "old");
    fixture.windowEvents.get("storage")({ key: "bevox:logout", newValue: "nonsecret-signal" });
    assert.equal(fixture.render().visible, false);
    await settle();
    assert.deepEqual(fixture.destinations, ["/login"]);
    assert.equal(fixture.render().mounted, false);
    assert.equal(fixture.client.getQueryData(["private"]), undefined);
  } finally { fixture.restore(); }
});

test("provider logout failure gives retry feedback and preserves session; success broadcasts and fully replaces", async () => {
  let failLogout = true;
  let logoutCalls = 0;
  globalThis.fetch = async (url) => {
    if (url.endsWith("/logout")) { logoutCalls++; return response(null, failLogout ? 503 : 204); }
    return response({ session: session() });
  };
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    const view = fixture.render();
    fixture.client.setQueryData(["private"], "keep on failure");
    await Promise.all([view.context.logout(), view.context.logout()]);
    assert.equal(logoutCalls, 1);
    assert.equal(fixture.render().context.error, auth.LOGOUT_FAILED_MESSAGE);
    assert.equal(fixture.render().visible, true);
    assert.equal(fixture.client.getQueryData(["private"]), "keep on failure");
    assert.deepEqual(fixture.destinations, []);
    assert.deepEqual(fixture.broadcasts, []);
    failLogout = false;
    await fixture.render().context.logout();
    assert.equal(fixture.render().visible, false);
    assert.deepEqual(fixture.destinations, ["/login"]);
    assert.deepEqual(fixture.broadcasts, ["logout"]);
    assert.equal(fixture.client.getQueryData(["private"]), undefined);
    assert.equal(owner.getPreferenceOwner(), "default");
  } finally { fixture.restore(); }
});

test("BroadcastChannel logout signal immediately hides a verified page", async () => {
  globalThis.fetch = async () => response({ session: session() });
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    assert.equal(fixture.render().visible, true);
    fixture.broadcast();
    assert.equal(fixture.render().visible, false);
    await settle();
    assert.deepEqual(fixture.destinations, ["/login"]);
  } finally { fixture.restore(); }
});

test("expiry timer hides content, clears identity/cache and uses full expired-session redirect", async () => {
  globalThis.fetch = async () => response({ session: session() });
  const fixture = providerFixture();
  const originalNow = Date.now;
  try {
    fixture.render();
    await settle();
    assert.equal(fixture.render().visible, true);
    fixture.client.setQueryData(["private"], "expired");
    Date.now = () => originalNow() + 120_000;
    [...fixture.timers.values()][0]();
    assert.equal(fixture.render().visible, false);
    await settle();
    assert.equal(owner.getPreferenceOwner(), "default");
    assert.equal(fixture.client.getQueryData(["private"]), undefined);
    assert.deepEqual(fixture.destinations, ["/login?motivo=expirada"]);
  } finally { Date.now = originalNow; fixture.restore(); }
});

test("session user maps only the provider DTO; no session or provider throws without fallback person", () => {
  const { useSessionUser } = load("hooks/useSessionUser.ts", { "@/providers/AuthProvider": { useAuth: () => ({ session: session() }) } });
  assert.deepEqual(useSessionUser(), { nome: "Pessoa de Teste", primeiroNome: "Pessoa", iniciais: "PD", perfil: "Colaborador" });
  const unauthenticated = load("hooks/useSessionUser.ts", { "@/providers/AuthProvider": { useAuth: () => ({ session: null }) } });
  assert.throws(unauthenticated.useSessionUser, /sessão verificada/);
});

test("settings owner comes from verified id in memory, defaults publicly and never reads cookies", () => {
  const { settingsUserKey } = load("services/settings.ts");
  assert.equal(settingsUserKey(), "default");
  owner.setPreferenceOwner("verified-id");
  assert.equal(settingsUserKey(), "verified-id");
  owner.setPreferenceOwner(null);
  assert.equal(settingsUserKey(), "default");
});

test("fresh permissions override a cached page and redirect fully to the first authorized route", async () => {
  let currentSession = session();
  globalThis.fetch = async () => response({ session: currentSession });
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    assert.equal(fixture.render().visible, true);
    fixture.client.setQueryData(["private"], "cached dashboard");
    currentSession = structuredClone(currentSession);
    currentSession.user.permissoes.Dashboard.visualizar = false;
    fixture.windowEvents.get("focus")();
    assert.equal(fixture.render().visible, false);
    await settle();
    assert.equal(fixture.render().mounted, false);
    assert.equal(fixture.client.getQueryData(["private"]), undefined);
    assert.equal(owner.getPreferenceOwner(), "default");
    assert.deepEqual(fixture.destinations, ["/documentos"]);
  } finally { fixture.restore(); }
});

test("prefetched create routes require fresh action permission, even when module viewing is allowed", async () => {
  globalThis.fetch = async () => response({ session: session() });
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    assert.equal(fixture.render().visible, true);
    fixture.navigate("/documentos/new");
    assert.equal(fixture.render().visible, false);
    await settle();
    assert.equal(fixture.render().mounted, false);
    assert.deepEqual(fixture.destinations, ["/dashboard"]);
  } finally { fixture.restore(); }
});

test("a session with no authorized route cannot redisplay cached children", async () => {
  const denied = session();
  for (const permission of Object.values(denied.user.permissoes)) permission.visualizar = false;
  globalThis.fetch = async () => response({ session: denied });
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    assert.equal(fixture.render().mounted, false);
    assert.deepEqual(fixture.destinations, ["/login?motivo=sem-permissao"]);
  } finally { fixture.restore(); }
});

test("same-user scope changes clear queries/mutations before display and replace the private form instance", async () => {
  for (const change of [
    (user) => { user.unidadeId = "other-unit"; },
    (user) => { user.unidade = "Outra unidade"; },
    (user) => { user.perfil = "Financeiro"; },
    (user) => { user.permissoes.Financeiro.criar = true; },
  ]) {
    let currentSession = session();
    globalThis.fetch = async () => response({ session: currentSession });
    const fixture = providerFixture();
    try {
      fixture.render();
      await settle();
      const previous = fixture.render();
      assert.equal(previous.visible, true);
      fixture.client.setQueryData(["private"], "data from former scope");
      fixture.client.getMutationCache().build(fixture.client, {}).state.variables = { formerScope: true };
      const cancellation = deferred();
      let cancelCalls = 0;
      fixture.client.cancelQueries = () => { cancelCalls++; return cancellation.promise; };
      currentSession = structuredClone(currentSession);
      change(currentSession.user);
      fixture.windowEvents.get("focus")();
      await settle();
      assert.equal(cancelCalls, 1);
      assert.equal(fixture.render().visible, false, "No display until former requests finish cancelling");
      assert.equal(fixture.client.getQueryCache().getAll().length, 0);
      assert.equal(fixture.client.getMutationCache().getAll().length, 0);
      assert.equal(owner.getPreferenceOwner(), "default");
      cancellation.resolve();
      await settle();
      const refreshed = fixture.render();
      assert.equal(refreshed.visible, true);
      assert.notEqual(refreshed.scopeKey, previous.scopeKey, "A new React key discards local private form state");
      assert.equal(refreshed.context.session.user.id, previous.context.session.user.id);
      assert.equal(owner.getPreferenceOwner(), "test-user");
      assert.deepEqual(fixture.destinations, []);
    } finally { fixture.restore(); }
  }
});

test("equal scope preserves cached data and private form identity despite reordered permissions or renewed expiry", async () => {
  let currentSession = session();
  globalThis.fetch = async () => response({ session: currentSession });
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    const previous = fixture.render();
    fixture.client.setQueryData(["private"], "keep same scope");
    let cancelCalls = 0;
    const cancel = fixture.client.cancelQueries.bind(fixture.client);
    fixture.client.cancelQueries = (...args) => { cancelCalls++; return cancel(...args); };
    currentSession = structuredClone(currentSession);
    currentSession.expiresAt += 60_000;
    currentSession.user.nome = "Nome atualizado";
    currentSession.user.permissoes = Object.fromEntries(Object.entries(currentSession.user.permissoes).reverse().map(([module, actions]) => [module, Object.fromEntries(Object.entries(actions).reverse())]));
    fixture.windowEvents.get("focus")();
    const checking = fixture.render();
    assert.equal(checking.visible, false);
    assert.equal(checking.mounted, true, "Revalidation must preserve in-progress form values");
    assert.equal(checking.scopeKey, previous.scopeKey);
    await settle();
    const refreshed = fixture.render();
    assert.equal(refreshed.visible, true);
    assert.equal(refreshed.scopeKey, previous.scopeKey);
    assert.equal(fixture.client.getQueryData(["private"]), "keep same scope");
    assert.equal(cancelCalls, 0);
    assert.deepEqual(fixture.destinations, []);
  } finally { fixture.restore(); }
});

test("an ambiguous logout hides immediately while confirming; GET 401/503 clears cache without announcing success", async () => {
  for (const status of [401, 503]) {
    const confirmation = deferred();
    let revoked = false;
    const calls = [];
    globalThis.fetch = async (url) => {
      calls.push(url);
      if (url.endsWith("/logout")) { revoked = true; throw new Error("response lost after revocation"); }
      return revoked ? confirmation.promise : response({ session: session() });
    };
    const fixture = providerFixture();
    try {
      fixture.render();
      await settle();
      const view = fixture.render();
      assert.equal(view.visible, true);
      fixture.client.setQueryData(["private"], "must stay hidden");
      const loggingOut = view.context.logout();
      await settle();
      assert.equal(fixture.render().visible, false);
      assert.equal(fixture.render().context.loggingOut, true);
      assert.equal(fixture.render().context.error, auth.LOGOUT_FAILED_MESSAGE);
      assert.deepEqual(calls, ["/api/auth/session", "/api/auth/logout", "/api/auth/session"]);
      confirmation.resolve(response({}, status));
      await loggingOut;
      await settle();
      assert.equal(fixture.render().mounted, false);
      assert.equal(fixture.client.getQueryData(["private"]), undefined);
      assert.equal(owner.getPreferenceOwner(), "default");
      assert.deepEqual(fixture.broadcasts, []);
      assert.deepEqual(fixture.destinations, ["/login?motivo=logout-nao-confirmado"]);
    } finally { fixture.restore(); }
  }
});

test("logout failure revalidates authorization as well as identity before allowing retry", async () => {
  let denied = false;
  globalThis.fetch = async (url) => {
    if (url.endsWith("/logout")) { denied = true; return response({}, 503); }
    const currentSession = session();
    if (denied) currentSession.user.permissoes = structuredClone(permissions);
    if (denied) currentSession.user.permissoes.Dashboard.visualizar = false;
    return response({ session: currentSession });
  };
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    const view = fixture.render();
    await view.context.logout();
    await settle();
    assert.equal(fixture.render().mounted, false);
    assert.deepEqual(fixture.destinations, ["/documentos"]);
    assert.deepEqual(fixture.broadcasts, []);
  } finally { fixture.restore(); }
});

test("logout recovery confirms the latest route if navigation occurred while the POST was pending", async () => {
  const posted = deferred();
  globalThis.fetch = async (url) => url.endsWith("/logout") ? posted.promise : response({ session: session() });
  const fixture = providerFixture();
  try {
    fixture.render();
    await settle();
    const loggingOut = fixture.render().context.logout();
    fixture.navigate("/documentos");
    assert.equal(fixture.render().visible, false);
    posted.resolve(response({}, 503));
    await loggingOut;
    assert.equal(fixture.render().visible, true);
    assert.equal(fixture.render().context.error, auth.LOGOUT_FAILED_MESSAGE);
    assert.deepEqual(fixture.destinations, []);
  } finally { fixture.restore(); }
});

test("the request deadline remains active during hanging GET and POST JSON bodies", async () => {
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const deadlines = new Map();
  globalThis.setTimeout = (callback, delay) => {
    const id = randomUUID();
    deadlines.set(id, { callback, delay });
    return id;
  };
  globalThis.clearTimeout = (id) => deadlines.delete(id);
  try {
    for (const operation of [
      () => auth.getVerifiedSession(),
      () => auth.loginAndConfirm(credentials(), new QueryClient()),
    ]) {
      let jsonStarted = false;
      let signal;
      globalThis.fetch = async (_url, init) => {
        signal = init.signal;
        return { status: 200, json: () => { jsonStarted = true; return new Promise(() => {}); } };
      };
      const pending = operation();
      await settle();
      assert.equal(jsonStarted, true);
      const deadline = [...deadlines.values()].find(({ delay }) => delay === 15_000);
      assert.ok(deadline, "Headers must not clear the body deadline");
      const rejection = assert.rejects(pending, { message: auth.AUTH_UNAVAILABLE_MESSAGE });
      deadline.callback();
      await rejection;
      assert.equal(signal.aborted, true);
      assert.equal(deadlines.size, 0);
    }
  } finally {
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
  }
});

test("caller cancellation after headers also rejects a hanging JSON body", async () => {
  const controller = new AbortController();
  let jsonStarted = false;
  globalThis.fetch = async () => ({ status: 200, json: () => { jsonStarted = true; return new Promise(() => {}); } });
  const pending = auth.getVerifiedSession(controller.signal);
  await settle();
  assert.equal(jsonStarted, true);
  controller.abort();
  await assert.rejects(pending, { message: auth.AUTH_UNAVAILABLE_MESSAGE });
});

test("an already aborted request never reaches fetch", async () => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = () => assert.fail("Aborted request must not reach server");
  await assert.rejects(auth.getVerifiedSession(controller.signal), auth.AuthClientError);
});

test("Header preserves the original Users and permissions group destination", () => {
  let stateIndex = 0;
  const currentSession = session("user with space");
  const Header = load("components/layout/Header.tsx", {
    react: {
      ...React,
      useState: (initial) => [stateIndex++ === 1 ? true : initial, () => {}],
      useRef: () => ({ current: null }),
      useEffect: () => {},
    },
    "next/link": { default: "a", __esModule: true },
    "next/navigation": { usePathname: () => "/dashboard" },
    "@/hooks/useSessionUser": { useSessionUser: () => ({ nome: currentSession.user.nome, iniciais: "PT", perfil: "Colaborador" }) },
    "@/providers/AuthProvider": { useAuth: () => ({ session: currentSession, logout() {}, loggingOut: false, error: null }) },
    "@/config/navigation": { tituloDaRota: () => "Dashboard" },
    "@/data/mockData": { empresaDemo: { nome: "Teste" }, alertasDemo: [] },
    "@/components/theme/ThemeProvider": { useTheme: () => ({ resolvedTheme: "light", setTheme() {} }) },
  }).default;
  const hrefs = [];
  const visit = (element) => {
    if (!React.isValidElement(element)) return;
    if (element.props.href) hrefs.push(element.props.href);
    React.Children.toArray(element.props.children).forEach(visit);
  };
  visit(Header({ onAbrirMenu() {} }));
  assert.ok(hrefs.includes("/usuarios"));
  assert.ok(!hrefs.includes("/usuarios/user%20with%20space"));
  assert.ok(!hrefs.includes("/usuarios/1"));
});
