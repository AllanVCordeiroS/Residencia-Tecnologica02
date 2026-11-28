import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const require = createRequire(import.meta.url);
const project = path.resolve(import.meta.dirname, '../../../../../..');
function loader(overrides = {}) {
  const usersSource = [
    { id: '1', nome: 'Ricardo Silveira', perfil: 'Administrador Geral', status: 'ativo' },
    { id: 'live-user', nome: 'Usuário da sessão', perfil: 'Financeiro', status: 'inativo' },
  ];
  overrides = { '@/hooks/queries/useUsersQuery': { useUsersQuery: () => ({ data: usersSource, isPending: false, isError: false }) }, ...overrides };
  const cache = new Map();
  return function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(project, relative);
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
    }).outputText;
    const loaded = { exports: {} };
    vm.runInNewContext(compiled, { module: loaded, exports: loaded.exports, require: name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      if (name.startsWith('./')) {
        const base = path.relative(project, path.resolve(path.dirname(filename), name));
        return load(base + (existsSync(path.join(project, base + '.tsx')) ? '.tsx' : '.ts'));
      }
      return require(name);
    } }, { filename });
    cache.set(relative, loaded.exports);
    return loaded.exports;
  };
}

test('renders every shared profile and only modules authorized by its shared matrix', () => {
  const load = loader();
  const { PERFIS, MODULOS, ACOES } = load('src/types/usuarios.ts');
  const { PERMISSOES_POR_PERFIL } = load('src/lib/usuarios-mock.ts');
  const { SecurityAccessProfiles } = load('src/app/(app)/configuracoes/seguranca/SecurityAccessProfiles.tsx');
  const html = renderToStaticMarkup(React.createElement(SecurityAccessProfiles));
  for (const perfil of PERFIS) {
    assert.ok(html.includes(perfil));
    const modules = MODULOS.filter(module => ACOES.some(action => PERMISSOES_POR_PERFIL[perfil][module][action]));
    assert.ok(html.includes(modules.join(', ')));
    assert.ok(html.includes(`Ações de ${perfil}`));
  }
  assert.ok(html.includes('/usuarios/1/editar'));
  assert.ok(html.includes('2 usuário(s) no cadastro') === false);
  assert.ok(html.includes('Criação, edição e ativação de perfis indisponíveis'));
  assert.ok(!html.includes('Analista Financeiro'));
});

test('profile details use live user query rather than a second static user list', () => {
  const { SecurityAccessProfiles } = loader({ react: { ...React, useState: () => ['Financeiro', () => {}] } })('src/app/(app)/configuracoes/seguranca/SecurityAccessProfiles.tsx');
  const html = renderToStaticMarkup(React.createElement(SecurityAccessProfiles));
  assert.ok(html.includes('Usuário da sessão'));
  assert.ok(html.includes('/usuarios/live-user/editar'));
  assert.ok(!html.includes('Ana Souza'));
});

test('session examples cannot report termination; 2FA remains a preference', () => {
  const load = loader({ 'next/navigation': { useRouter: () => ({ push() {} }) }, '@/hooks/useSettingsForm': {
    useSettingsForm: (_key, _schema, defaults) => ({ ready: true, data: defaults, message: '', field: key => [defaults[key], () => {}], save() {} }),
  } });
  const Page = load('src/app/(app)/configuracoes/seguranca/page.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Page));
  assert.ok(html.includes('Registros de exemplo'));
  assert.equal((html.match(/disabled=""/g) || []).length, 4);
  assert.ok(!html.includes('Preferência local de método 2FA.'));
  assert.ok(!html.includes('BEVOX</span>'));
  for (const method of ['Aplicativo', 'E-mail', 'SMS']) assert.ok(html.includes(method));
  assert.ok(!html.includes('2FA está ativada'));
  assert.ok(!html.includes('Sistema seguro'));
  assert.ok(!html.includes('Políticas salvas somente neste navegador.'));
});

test('security schema rejects unsupported policies and accepts existing defaults', () => {
  const { securitySettingsSchema, DEFAULT_SECURITY_SETTINGS } = loader()('src/services/settingsSchemas.ts');
  assert.equal(securitySettingsSchema.safeParse(DEFAULT_SECURITY_SETTINGS).success, true);
  for (const field of ['expiry', 'minimum', 'attempts', 'lockout', 'selected2FA']) {
    assert.equal(securitySettingsSchema.safeParse({ ...DEFAULT_SECURITY_SETTINGS, [field]: 'invalid' }).success, false);
  }
});

