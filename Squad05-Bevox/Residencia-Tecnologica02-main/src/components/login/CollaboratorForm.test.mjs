import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { test } from "node:test";
import React from "react";
import { QueryClient } from "@tanstack/react-query";
import ts from "typescript";

const requireDependency = createRequire(import.meta.url);
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const formPath = "src/components/login/CollaboratorForm.tsx";
const hookPath = "src/hooks/queries/useRegistrationUnitsQuery.ts";
const publicKey = ["bevox-public", "registration", "units"];
const plain = (value) => JSON.parse(JSON.stringify(value));

function sourceLoader(overrides = {}, globals = {}) {
  const cache = new Map();
  return function load(relative) {
    const filename = resolve(project, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, {
      module: loaded, exports: loaded.exports, structuredClone, crypto, ...globals,
      require(name) {
        assert.doesNotMatch(name, /auth-cookie|\/auth(?:\/|$)|\/session(?:\/|$)|next\/navigation/);
        if (Object.hasOwn(overrides, name)) return overrides[name];
        return name.startsWith("@/") ? load("src/" + name.slice(2) + ".ts") : requireDependency(name);
      },
    }, { filename });
    return loaded.exports;
  };
}

function findAll(tree, predicate) {
  if (!React.isValidElement(tree)) return [];
  return [
    ...(predicate(tree) ? [tree] : []),
    ...React.Children.toArray(tree.props.children).flatMap((child) => findAll(child, predicate)),
  ];
}

test("registration imports no authentication, cookie, private query or cache-publishing dependency", () => {
  const source = readFileSync(resolve(project, formPath), "utf8");
  const file = ts.createSourceFile(formPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports = file.statements.filter(ts.isImportDeclaration).map((node) => node.moduleSpecifier.text);
  for (const name of imports) {
    assert.doesNotMatch(name, /auth|cookie|session|services\/users|query-keys|useUnitsQuery|@tanstack|next\/navigation/);
  }
  assert.ok(imports.includes("@/hooks/queries/useRegistrationUnitsQuery"));
  assert.doesNotMatch(source, /document\.cookie|localStorage|sessionStorage|setQueryData|invalidateQueries|cancelQueries|getUsers/);
});

test("public units cache contains only the DTO for the same existing operational records", async () => {
  const client = new QueryClient();
  const load = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options } });
  const options = load(hookPath).useRegistrationUnitsQuery();
  try {
    const units = await load("src/services/units.ts").getOperationalUnits();
    assert.ok(units.length > 0);
    assert.ok(units.some((unit) => Object.hasOwn(unit, "cnpj")));
    const data = await client.fetchQuery(options);
    assert.deepEqual(plain(options.queryKey), publicKey);
    assert.deepEqual(plain(data), units.map((unit) => ({ id: unit.id, nome: unit.nome, ativa: unit.ativa !== false })));
    for (const unit of data) assert.deepEqual(Object.keys(unit).sort(), ["ativa", "id", "nome"]);
    assert.deepEqual(client.getQueryCache().getAll().map((query) => plain(query.queryKey)), [publicKey]);
    assert.deepEqual(plain(client.getQueryData(publicKey)), plain(data));
  } finally {
    client.clear();
  }
});

test("public units preserve inactive/legacy records and propagate errors without a fixture fallback", async () => {
  let units = [
    { id: "existing-inactive", nome: "Registro inativo de teste", ativa: false, cnpj: "restrito", responsavel: "restrito", contato: "restrito" },
    { id: "existing-legacy", nome: "Registro legado de teste", email: "restrito" },
  ];
  const load = sourceLoader({
    "@tanstack/react-query": { useQuery: (options) => options },
    "@/services/units": { getOperationalUnits: async () => { if (units instanceof Error) throw units; return units; } },
  });
  const { queryFn } = load(hookPath).useRegistrationUnitsQuery();
  assert.deepEqual(plain(await queryFn()), [
    { id: "existing-inactive", nome: "Registro inativo de teste", ativa: false },
    { id: "existing-legacy", nome: "Registro legado de teste", ativa: true },
  ]);
  units = [];
  assert.deepEqual(plain(await queryFn()), []);
  units = new Error("Falha de leitura");
  await assert.rejects(queryFn(), /Falha de leitura/);
});

async function registrationFixture() {
  const client = new QueryClient();
  const hooks = [];
  let cursor = 0;
  let effects = [];
  let query;
  let resolver;
  const errors = {};
  const values = {
    nome: "Pessoa Colaboradora", email: "cadastro-publico@example.com", telefone: "(81) 99999-9999",
    cargo: "Vendedor", unidadeId: "", departamento: "Operações & Logística",
    senha: "UmaSenha!2026", confirmarSenha: "UmaSenha!2026", aceiteAcesso: true, aceitePrivacidade: true,
  };
  const document = {};
  Object.defineProperty(document, "cookie", {
    get() { assert.fail("Registration must not read a session cookie"); },
    set() { assert.fail("Registration must not create a session cookie"); },
  });
  const storage = {
    getItem: () => null,
    setItem: () => assert.fail("Registration must not persist credentials or session state"),
    removeItem: () => assert.fail("Registration must not change storage"),
  };
  const Link = () => null;
  const form = {
    register: (name) => ({ name }), control: {}, formState: { errors, isSubmitting: false },
    setError: (name, error) => { errors[name] = error; }, setFocus() {},
    clearErrors: (name) => { delete errors[name]; },
    resetField: (name, options) => { values[name] = options.defaultValue; },
    reset: (defaults) => Object.assign(values, defaults),
    handleSubmit: (onValid, onInvalid) => async () => {
      const result = await resolver(values, {}, { criteriaMode: "firstError", fields: {} });
      Object.assign(errors, result.errors);
      return Object.keys(result.errors).length ? onInvalid(result.errors) : onValid(result.values);
    },
  };
  const load = sourceLoader({
    react: {
      ...React,
      useMemo: (callback) => callback(),
      useState: (initial) => {
        const index = cursor++;
        if (!(index in hooks)) hooks[index] = initial;
        return [hooks[index], (next) => { hooks[index] = typeof next === "function" ? next(hooks[index]) : next; }];
      },
      useRef: (initial) => { const index = cursor++; return hooks[index] ??= { current: initial }; },
      useEffect: (callback, deps) => {
        const index = cursor++;
        if (!hooks[index] || deps.some((value, i) => value !== hooks[index][i])) {
          hooks[index] = deps;
          effects.push(callback);
        }
      },
    },
    "react-hook-form": {
      useForm: (options) => { resolver = options.resolver; return form; },
      useWatch: () => [values.senha, values.confirmarSenha],
    },
    "next/link": { default: Link, __esModule: true },
    "@/components/usuarios/form-section": { Field: () => null },
    "@tanstack/react-query": { useQuery: (options) => { query = options; return { data: client.getQueryData(options.queryKey), isPending: false, isError: false }; } },
  }, { document, window: { localStorage: storage, sessionStorage: storage }, requestAnimationFrame: (callback) => callback() });
  load(hookPath).useRegistrationUnitsQuery();
  const units = await client.fetchQuery(query);
  values.unidadeId = units[0].id;
  const Form = load(formPath).default;
  function render() {
    cursor = 0;
    effects = [];
    const tree = Form();
    effects.forEach((callback) => callback());
    return tree;
  }
  render();
  await Promise.resolve(); // Let the real password-policy read finish.
  return { client, load, render, values, errors, Link };
}

test("submitting registration keeps the shared demo insert inactive, clears passwords, and never publishes private data", async () => {
  const fixture = await registrationFixture();
  const { client, render, values, load, Link, errors } = fixture;
  const privateEvents = [];
  client.getQueryCache().subscribe((event) => {
    if (event.query.queryKey[0] === "bevox") privateEvents.push(event.type);
  });
  try {
    const tree = render();
    assert.equal(tree.type, "form");
    assert.equal(findAll(tree, (node) => node.props.type === "submit")[0].props.disabled, false);
    await tree.props.onSubmit({ preventDefault() {} });
    assert.deepEqual(errors, {});
    const success = render();
    assert.equal(success.props.role, "status");
    const messages = findAll(success, (node) => node.type === "p").map((node) => node.props.children).join(" ");
    assert.match(messages, /demonstrativa como usuário inativo/);
    assert.match(messages, /sem liberação de acesso/);
    assert.match(messages, /contas demonstrativas ativas/);
    assert.match(messages, /Senha não armazenada/);
    assert.match(messages, /temporário/);
    const login = findAll(success, (node) => node.type === Link && node.props.href === "/login");
    assert.equal(login.length, 1);
    assert.equal(login[0].props.onClick, undefined);
    assert.equal(login[0].props.onNavigate, undefined);
    assert.equal(values.senha, "");
    assert.equal(values.confirmarSenha, "");
    assert.deepEqual(privateEvents, []);
    assert.deepEqual(client.getQueryCache().getAll().map((query) => plain(query.queryKey)), [publicKey]);
    assert.equal(client.getMutationCache().getAll().length, 0);
    const users = await load("src/services/users.ts").getUsers();
    const created = users.find((user) => user.email === values.email);
    assert.equal(created.status, "inativo");
    assert.equal(created.cadastroPendente, true);
    assert.equal(created.enviarConvite, false);
    assert.doesNotMatch(JSON.stringify(created), /senha|confirmarSenha|UmaSenha!2026/);
  } finally {
    client.clear();
  }
});

test("invalid registration retains validation and never creates a private query or success state", async () => {
  const { client, render, values, errors } = await registrationFixture();
  try {
    values.aceitePrivacidade = false;
    await render().props.onSubmit({ preventDefault() {} });
    assert.match(errors.aceitePrivacidade.message, /Privacidade/);
    assert.equal(render().type, "form");
    assert.deepEqual(client.getQueryCache().getAll().map((query) => plain(query.queryKey)), [publicKey]);
  } finally {
    client.clear();
  }
});

test("successful public registration neither replaces nor invalidates existing private cache entries", async () => {
  const { client, render, errors } = await registrationFixture();
  const privateKeys = [["bevox", "users", "list"], ["bevox", "units", "list", "operational"]];
  const privateEvents = [];
  try {
    privateKeys.forEach((key) => client.setQueryData(key, [{ id: "private-sentinel" }]));
    const previous = privateKeys.map((key) => client.getQueryState(key));
    client.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === "bevox") privateEvents.push(event.type);
    });
    await render().props.onSubmit({ preventDefault() {} });
    assert.deepEqual(errors, {});
    assert.equal(render().props.role, "status");
    privateKeys.forEach((key, index) => assert.equal(client.getQueryState(key), previous[index]));
    assert.deepEqual(privateEvents, []);
  } finally {
    client.clear();
  }
});
