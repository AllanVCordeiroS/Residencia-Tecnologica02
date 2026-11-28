import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Follow the existing settings tests: execute real TSX without a browser or new dependencies.
const require = createRequire(import.meta.url);
const directory = import.meta.dirname;
const css = readFileSync(path.join(directory, "Sidebar.module.css"), "utf8");
const styles = Object.fromEntries([...css.matchAll(/\.([a-zA-Z]+)\b/g)].map((match) => [match[1], match[1]]));
const project = path.resolve(directory, "../../..");

function load(relative, overrides = {}) {
  const filename = path.join(project, relative);
  const code = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, require: (name) => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name.endsWith(".module.css")) return { default: styles, __esModule: true };
    return require(name);
  }, document: overrides.document });
  return loaded.exports;
}

const navigation = load("src/config/navigation.ts").navGroups;
function sidebarFixture(pathname = "/configuracoes/empresa") {
  const calls = [];
  const Sidebar = load("src/components/layout/Sidebar.tsx", {
    react: { ...React, useId: () => "sidebar-nav" },
    "next/link": { default: ({ children, ...props }) => React.createElement("a", props, children), __esModule: true },
    "next/image": { default: ({ src, alt, className }) => React.createElement("img", { src, alt, className }), __esModule: true },
    "next/navigation": { usePathname: () => pathname, useRouter: () => ({ replace: (route) => calls.push(route) }) },
    "@/config/navigation": { navGroups: navigation },
    "@/hooks/useSessionUser": { useSessionUser: () => ({ iniciais: "AS", nome: "Ana da Sessão", perfil: "Administradora" }) },
    "@/data/mockData": { empresaDemo: { nome: "Adega Distribution", status: "Ativa", sede: "Matriz" } },
    "@/providers/AuthProvider": { useAuth: () => ({ logout: () => calls.push("logout"), loggingOut: false, error: null }) },
  }).default;
  return { Sidebar, calls };
}

function find(element, predicate) {
  if (!React.isValidElement(element)) return undefined;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props.children)) {
    const result = find(child, predicate);
    if (result) return result;
  }
}

// Run the actual shell's handlers/state updaters; browser focus/scroll visuals remain a main check.
function shellFixture() {
  const state = [];
  let cursor = 0;
  let pathname = "/dashboard";
  let effects = [];
  const listeners = new Map();
  const Sidebar = () => null;
  const Header = () => null;
  const AppShell = load("src/components/layout/AppShell.tsx", {
    react: { ...React,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
      },
      useEffect: (effect) => effects.push(effect),
    },
    "next/navigation": { usePathname: () => pathname },
    "./Sidebar": { default: Sidebar, __esModule: true },
    "./Header": { default: Header, __esModule: true },
    document: { addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: (key) => listeners.delete(key) },
  }).default;
  const render = () => {
    cursor = 0;
    effects = [];
    const tree = AppShell({ children: "Page content", footer: "Existing footer" });
    return {
      tree,
      aside: find(tree, (item) => item.type === "aside").props,
      sidebar: find(tree, (item) => item.type === Sidebar).props,
      header: find(tree, (item) => item.type === Header).props,
      dialog: find(tree, (item) => item.props.role === "dialog"),
    };
  };
  return { render, listeners, runEffects: () => effects.map((effect) => effect()), navigate: (route) => { pathname = route; } };
}

test("desktop starts collapsed without persistence; mouse hover expands and leaving collapses", () => {
  const fixture = shellFixture();
  let view = fixture.render();
  assert.equal(view.sidebar.collapsed, true);
  assert.equal(view.sidebar.pinned, false);
  assert.equal(view.tree.props["data-sidebar-expanded"], false);
  view.aside.onPointerEnter({ pointerType: "touch" });
  assert.equal(fixture.render().sidebar.collapsed, true);
  view.aside.onPointerEnter({ pointerType: "mouse" });
  view = fixture.render();
  assert.equal(view.sidebar.collapsed, false);
  assert.equal(view.tree.props["data-sidebar-expanded"], true);
  view.aside.onPointerLeave();
  assert.equal(fixture.render().sidebar.collapsed, true);
  assert.equal(shellFixture().render().sidebar.pinned, false);
});

test("pin holds expansion outside sidebar; unpin resumes hover then collapses after mouse leaves", () => {
  const fixture = shellFixture();
  let view = fixture.render();
  view.aside.onPointerEnter({ pointerType: "mouse" });
  view.sidebar.onTogglePin();
  view.aside.onPointerLeave();
  view = fixture.render();
  assert.equal(view.sidebar.pinned, true);
  assert.equal(view.sidebar.collapsed, false);
  view.aside.onPointerEnter({ pointerType: "mouse" });
  view.aside.onPointerDownCapture();
  view.aside.onFocusCapture({ target: { matches: () => false } });
  view.sidebar.onTogglePin();
  assert.equal(fixture.render().sidebar.collapsed, false);
  view.aside.onPointerLeave();
  assert.equal(fixture.render().sidebar.pinned, false);
  assert.equal(fixture.render().sidebar.collapsed, true);
});

test("keyboard focus opens sidebar, stays open between links and releases on tabbing outside", () => {
  const fixture = shellFixture();
  let view = fixture.render();
  const target = { matches: (selector) => selector === ":focus-visible" };
  view.aside.onFocusCapture({ target });
  assert.equal(fixture.render().sidebar.collapsed, false);
  view.aside.onBlurCapture({ currentTarget: { contains: () => true }, relatedTarget: target });
  view.aside.onPointerLeave();
  assert.equal(fixture.render().sidebar.collapsed, false);
  view.aside.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: {} });
  assert.equal(fixture.render().sidebar.collapsed, true);
  view = fixture.render();
  view.aside.onKeyDownCapture({ key: "Tab" });
  assert.equal(fixture.render().sidebar.collapsed, false);
  view.aside.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: null });
  assert.equal(fixture.render().sidebar.collapsed, true);
});

test("hover and keyboard focus hold expansion independently; pointer clicks do not latch focus", () => {
  const fixture = shellFixture();
  const view = fixture.render();
  view.aside.onPointerEnter({ pointerType: "mouse" });
  view.aside.onFocusCapture({ target: { matches: () => true } });
  view.aside.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: null });
  assert.equal(fixture.render().sidebar.collapsed, false);
  view.aside.onFocusCapture({ target: { matches: () => true } });
  view.aside.onPointerDownCapture();
  view.aside.onPointerLeave();
  assert.equal(fixture.render().sidebar.collapsed, true);
});

test("mobile button opens full drawer; backdrop, navigation, Escape and route change close it", () => {
  for (const method of ["backdrop", "navigate", "escape", "route"]) {
    const fixture = shellFixture();
    fixture.render().header.onAbrirMenu();
    const view = fixture.render();
    assert.ok(view.dialog);
    const mobileSidebar = find(view.dialog, (item) => typeof item.type === "function");
    assert.equal(mobileSidebar.props.collapsed, undefined);
    assert.equal(mobileSidebar.props.onTogglePin, undefined);
    assert.equal(view.dialog.props.onPointerEnter, undefined);
    if (method === "backdrop") find(view.dialog, (item) => item.type === "button").props.onClick();
    if (method === "navigate") mobileSidebar.props.onNavigate();
    if (method === "escape") {
      fixture.runEffects();
      fixture.listeners.get("keydown")({ key: "Escape" });
    }
    if (method === "route") {
      fixture.navigate("/unidades");
      fixture.render(); // React rerenders after the guarded render-time route update.
    }
    assert.equal(fixture.render().dialog, undefined, method);
  }
});

test("all links, icons, company, logos, footer and nested active route survive both widths", () => {
  const { Sidebar } = sidebarFixture();
  for (const collapsed of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(Sidebar, { collapsed, onTogglePin() {} }));
    assert.ok(html.includes(`data-collapsed="${collapsed}"`));
    for (const group of navigation) {
      assert.ok(html.includes(group.label));
      for (const item of group.items) {
        assert.ok(html.includes(`href="${item.href}"`));
        assert.ok(html.includes(`aria-label="${item.label}"`));
        assert.ok(html.includes(`title="${item.label}"`));
      }
    }
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
    assert.match(html, /href="\/configuracoes"[^>]*aria-current="page"/);
    for (const text of ["/bevox-logo-oficial.png", "/adega-distribution.jpg", "Adega Distribution", "Ana da Sessão", "Administradora", "Sair da plataforma", "overflow-y-auto", "min-h-0"]) assert.ok(html.includes(text));
    assert.equal((html.match(/<a /g) ?? []).length, navigation.flatMap((group) => group.items).length);
    assert.equal((html.match(/<svg /g) ?? []).length, navigation.flatMap((group) => group.items).length + 3);
  }
});

test("pin exposes its state, action and navigation target; mobile defaults to full labels", () => {
  const { Sidebar } = sidebarFixture();
  for (const pinned of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(Sidebar, { collapsed: !pinned, pinned, onTogglePin() {} }));
    assert.ok(html.includes(`aria-pressed="${pinned}"`));
    assert.ok(html.includes(`aria-expanded="${pinned}"`));
    assert.ok(html.includes(`aria-label="${pinned ? "Desafixar" : "Fixar"} menu lateral"`));
    assert.ok(html.includes(pinned ? "Menu fixado" : "Fixar menu"));
    const controlled = html.match(/aria-controls="([^"]+)"/)[1];
    assert.ok(html.includes(`<nav id="${controlled}"`));
  }
  const mobile = renderToStaticMarkup(React.createElement(Sidebar));
  assert.ok(mobile.includes('data-collapsed="false"'));
  assert.ok(!mobile.includes("aria-pressed"));
});

test("navigation and logout keep their existing actions", () => {
  const { Sidebar, calls } = sidebarFixture("/dashboard");
  let navigated = 0;
  const tree = Sidebar({ onNavigate: () => navigated++ });
  find(tree, (item) => item.props.href === "/documentos").props.onClick();
  assert.equal(navigated, 1);
  find(tree, (item) => item.props["aria-label"] === "Sair da plataforma").props.onClick();
  assert.deepEqual(calls, ["logout"]);
});

test("CSS scopes hidden scrollbars, syncs widths, honors reduced motion and preserves mobile layout", () => {
  assert.match(css, /--sidebar-width: 72px/);
  assert.match(css, /data-sidebar-expanded="true"[\s\S]*?--sidebar-width: 256px/);
  assert.match(css, /\.desktopSidebar\s*\{[^}]*width: var\(--sidebar-width\)/);
  assert.match(css, /@media \(min-width: 64rem\)[\s\S]*?\.content\s*\{\s*padding-left: var\(--sidebar-width\)/);
  assert.match(css, /transition: width 180ms ease-in-out/);
  assert.match(css, /transition: padding-left 180ms ease-in-out/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?transition: none/);
  assert.match(css, /\.navigation\s*\{[^}]*scrollbar-width: none/);
  assert.match(css, /\.navigation::-webkit-scrollbar\s*\{[^}]*display: none/);
  assert.match(css, /\.groupLabel\s*\{[^}]*white-space: nowrap/);
  assert.match(css, /data-collapsed="true"\]\s+\.groupLabel\s*\{[^}]*display: block;[^}]*visibility: hidden/);
  assert.ok(!/overflow(?:-y)?:\s*hidden/.test(css));
});
