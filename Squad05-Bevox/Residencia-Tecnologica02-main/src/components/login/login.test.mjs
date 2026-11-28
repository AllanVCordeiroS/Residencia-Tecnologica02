import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Execute the real components and preference service using the project's Node test pattern.
const require = createRequire(import.meta.url);
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
function sourceLoader(overrides = {}, globals = {}) {
  const cache = new Map();
  function load(relative) {
    const filename = resolve(project, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, {
      ...globals, module: loaded, exports: loaded.exports,
      require: (name) => {
        if (Object.hasOwn(overrides, name)) return overrides[name];
        if (name.startsWith("@/") || name.startsWith("./")) {
          const base = name.startsWith("@/") ? resolve(project, "src", name.slice(2)) : resolve(dirname(filename), name);
          const extension = existsSync(`${base}.ts`) ? ".ts" : ".tsx";
          return load(`${base}${extension}`);
        }
        return require(name);
      },
    });
    return loaded.exports;
  }
  return load;
}

function findAll(tree, predicate) {
  if (!React.isValidElement(tree)) return [];
  return [
    ...(predicate(tree) ? [tree] : []),
    ...React.Children.toArray(tree.props.children).flatMap((child) => findAll(child, predicate)),
  ];
}

function selectorFixture() {
  const hooks = [];
  const listeners = new Map();
  const values = new Map();
  let cursor = 0;
  let effects = [];
  let failWrite = false;
  let focus = null;
  const trigger = { focus: () => { focus = "trigger"; } };
  const option = { focus: () => { focus = "option"; } };
  const inside = {};
  const root = { contains: (target) => [trigger, option, inside].includes(target) };
  const document = {
    cookie: "",
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  const window = Object.assign(new EventTarget(), {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        if (failWrite) throw new Error("Storage unavailable");
        values.set(key, String(value));
      },
      removeItem: (key) => values.delete(key),
    },
  });
  const load = sourceLoader({ react: {
    ...React,
    useId: () => "language-test",
    useState: (initial) => {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = initial;
      return [hooks[index], (next) => { hooks[index] = typeof next === "function" ? next(hooks[index]) : next; }];
    },
    useRef: (initial) => {
      const index = cursor++;
      hooks[index] ??= { current: initial };
      return hooks[index];
    },
    useEffect: (callback, deps) => {
      const index = cursor++;
      if (!hooks[index] || deps.some((value, i) => value !== hooks[index].deps[i])) {
        effects.push(() => {
          hooks[index]?.cleanup?.();
          hooks[index] = { deps, cleanup: callback() };
        });
      }
    },
  } }, { window, document, Event, structuredClone, StorageEvent: class extends Event {} });
  const Selector = load("src/components/login/LanguageSelector.tsx").default;
  const settings = load("src/services/settings.ts");
  function render(props = {}) {
    cursor = 0;
    effects = [];
    const tree = Selector(props);
    tree.props.ref.current = root;
    const button = findAll(tree, (node) => node.props["aria-haspopup"] === "listbox")[0];
    const selected = findAll(tree, (node) => node.props.role === "option")[0];
    button.props.ref.current = trigger;
    if (selected) selected.props.ref.current = option;
    effects.forEach((effect) => effect());
    return { tree, button: button.props, option: selected?.props };
  }
  function key(view, key) {
    let prevented = false;
    view.tree.props.onKeyDown({ key, preventDefault: () => { prevented = true; }, stopPropagation() {} });
    return prevented;
  }
  return {
    render, key, settings, values, listeners, document, inside, trigger, option, owner: load("src/lib/preference-owner.ts"),
    get focus() { return focus; },
    failWrites: () => { failWrite = true; },
  };
}

test("Login preserves its layout, form and help while linking registration and legal routes", () => {
  const Form = () => React.createElement("form", { "data-testid": "existing-login-form" });
  const load = sourceLoader({
    "@/components/LoginForm": { default: Form, __esModule: true },
    "next/link": { default: ({ children, ...props }) => React.createElement("a", props, children), __esModule: true },
  });
  const Page = load("src/app/login/page.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Page));
  for (const removed of ["Ambiente Enterprise v4.8", "Conexão Segura SSL 256-bit", "Disponibilidade SLA 99,98%", "Acesso unificado com 2FA", "♧", "♢"]) {
    assert.equal(html.includes(removed), false, removed);
  }
  assert.match(html, /Não possui uma conta\?/);
  assert.match(html, /href="\/cadastro"[^>]*>Criar conta na BEVOX/);
  assert.match(html, /href="\/termos"/);
  assert.match(html, /href="\/privacidade"/);
  assert.match(html, /href="#"[^>]*>Fale com o Administrador do Sistema/);
  assert.match(html, /href="#"[^>]*>Suporte Técnico/);
  assert.match(html, /existing-login-form/);
  assert.match(html, /lg:grid-cols-\[1.1fr_1fr\]/);
  assert.match(html, /Detecção Automática de Unidade/);
});

test("selector opens on click with one named, selected Portuguese option and moves focus", () => {
  const fixture = selectorFixture();
  let view = fixture.render();
  assert.equal(view.button["aria-expanded"], false);
  assert.equal(view.button["aria-label"], "Selecionar idioma: Português (Brasil)");
  view.button.onClick();
  view = fixture.render();
  assert.equal(view.button["aria-expanded"], true);
  assert.equal(findAll(view.tree, (node) => node.props.role === "option").length, 1);
  assert.equal(view.option["aria-selected"], true);
  assert.equal(view.option.lang, "pt-BR");
  assert.equal(fixture.focus, "option");
  assert.equal(findAll(view.tree, (node) => node.props.role === "listbox")[0].props.id, view.button["aria-controls"]);
  view.button.onClick();
  assert.equal(fixture.render().button["aria-expanded"], false);
});

test("arrows, Home and End open/focus the option; Escape closes and restores trigger focus", () => {
  for (const key of ["ArrowDown", "ArrowUp", "Home", "End"]) {
    const fixture = selectorFixture();
    assert.equal(fixture.key(fixture.render(), key), true);
    const opened = fixture.render();
    assert.equal(opened.button["aria-expanded"], true);
    assert.equal(fixture.focus, "option");
    assert.equal(fixture.key(opened, "Escape"), true);
    assert.equal(fixture.render().button["aria-expanded"], false);
    assert.equal(fixture.focus, "trigger");
  }
});

test("outside pointer and leaving by Tab close; internal focus stays open; listeners are cleaned", () => {
  const fixture = selectorFixture();
  fixture.render().button.onClick();
  let view = fixture.render();
  fixture.listeners.get("pointerdown")({ target: fixture.inside });
  view = fixture.render();
  assert.equal(view.button["aria-expanded"], true);
  view.tree.props.onBlur({ currentTarget: { contains: (target) => target === fixture.option }, relatedTarget: fixture.option });
  assert.equal(fixture.render().button["aria-expanded"], true);
  fixture.listeners.get("pointerdown")({ target: {} });
  assert.equal(fixture.render().button["aria-expanded"], false);
  assert.equal(fixture.listeners.has("pointerdown"), false);
  fixture.render().button.onClick();
  view = fixture.render();
  view.tree.props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null });
  assert.equal(fixture.render().button["aria-expanded"], false);
});

test("selection persists using existing settings, preserves latest preferences and isolates user", () => {
  const fixture = selectorFixture();
  fixture.render().button.onClick();
  const opened = fixture.render();
  const preferences = structuredClone(fixture.settings.DEFAULT_INTERFACE_PREFERENCES);
  preferences.user.theme = "dark";
  preferences.user.showVisualAlerts = false;
  preferences.global.timeZone = "UTC";
  preferences.global.tableView = "compact";
  fixture.settings.saveInterfacePreferences(preferences);
  opened.option.onClick();
  const saved = fixture.settings.readInterfacePreferences();
  assert.equal(saved.user.language, "pt-BR");
  preferences.user.language = "pt-BR";
  assert.deepEqual(JSON.parse(JSON.stringify(saved)), preferences);
  assert.equal(fixture.render().button["aria-expanded"], false);
  assert.equal(fixture.focus, "trigger");
  assert.equal(fixture.settings.readInterfacePreferences().user.language, "pt-BR");
  fixture.document.cookie = "bevox_session=other-user";
  assert.equal(fixture.settings.readInterfacePreferences().user.language, "pt-BR");
  fixture.owner.setPreferenceOwner("verified-other-user");
  assert.equal(fixture.settings.readInterfacePreferences().user.language, "inherit");
});

test("blocked or corrupt storage keeps Portuguese available, reports failure and preserves data", () => {
  for (const failure of ["blocked", "corrupt"]) {
    const fixture = selectorFixture();
    if (failure === "blocked") fixture.failWrites();
    else fixture.values.set("bevox.settings.interface.global", "{invalid");
    const previous = [...fixture.values];
    fixture.render().button.onClick();
    fixture.render().option.onClick();
    const view = fixture.render();
    assert.equal(view.button["aria-expanded"], false);
    assert.deepEqual([...fixture.values], previous);
    const message = findAll(view.tree, (node) => node.props.role === "status")[0].props.children;
    assert.match(message, /Não foi possível salvar/);
    assert.match(message, /Português \(Brasil\) continua ativo/);
  }
});

test("dark variant supports navy headers and server rendering needs no browser storage", () => {
  const Selector = sourceLoader()("src/components/login/LanguageSelector.tsx").default;
  const light = renderToStaticMarkup(React.createElement(Selector));
  const dark = renderToStaticMarkup(React.createElement(Selector, { variant: "dark" }));
  assert.match(light, /text-slate-600/);
  assert.match(dark, /text-slate-100/);
  assert.match(dark, /aria-expanded="false"/);
  assert.match(dark, /lucide-globe/);
});
