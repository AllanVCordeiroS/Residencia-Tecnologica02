import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const loaded = { exports: {} };
  const code = ts.transpileModule(readFileSync(resolve(sourceRoot, relative), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", code)(name => name.startsWith("@/") ? load(name.slice(2) + ".ts") : require(name), loaded, loaded.exports);
  cache.set(relative, loaded.exports);
  return loaded.exports;
}
const { runNotificationTest } = load("services/notificationTest.ts");
const settings = () => ({ emailActive: true, sistemaActive: true, whatsappActive: true, selectedDays: ["Seg"], horario: "08:00", preferences: [{ id: "event", evento: "Tarefas atrasadas", descricao: "Descrição de configuração", email: true, sistema: true, whatsapp: true, frequencia: "Imediato" }] });
const effects = overrides => ({ beforeNotify: async () => {}, notify: () => {}, ...overrides });

test("local test waits for processing, publishes once and reports unavailable external channels", async () => {
  let release;
  const seen = [];
  const pending = runNotificationTest(settings(), "event", effects({ beforeNotify: () => new Promise(resolve => { release = resolve; }), notify: notification => seen.push(notification) }));
  assert.equal(seen.length, 0);
  release();
  const result = await pending;
  assert.equal(seen.length, 1);
  assert.equal(seen[0].title, "Tarefas atrasadas — teste local");
  assert.match(seen[0].description, /^Teste de configuração:/);
  assert.ok(Number.isFinite(Date.parse(seen[0].createdAt)));
  assert.deepEqual(result.unsupported, ["E-mail", "WhatsApp"]);
  assert.equal(result.soundFailed, false);
});

test("disabled global or event system channel never reports local delivery", async () => {
  for (const value of [{ ...settings(), sistemaActive: false }, { ...settings(), preferences: [{ ...settings().preferences[0], sistema: false }] }]) {
    let published = false;
    await assert.rejects(runNotificationTest(value, "event", effects({ notify: () => { published = true; } })), /Ative o canal Sistema.*não possuem serviço de envio conectado/);
    assert.equal(published, false);
  }
});

test("missing channels, unknown events and invalid settings produce actionable errors", async () => {
  await assert.rejects(runNotificationTest({ ...settings(), emailActive: false, sistemaActive: false, whatsappActive: false }, "event", effects()), /Nenhum canal local está ativo/);
  await assert.rejects(runNotificationTest(settings(), "missing", effects()), /Selecione um evento/);
  await assert.rejects(runNotificationTest({ ...settings(), selectedDays: [] }, "event", effects()), /Revise as configurações/);
});

test("local publish failures propagate and a subsequent attempt can succeed", async () => {
  await assert.rejects(runNotificationTest(settings(), "event", effects({ notify: () => { throw new Error("Falha local"); } })), /Falha local/);
  let count = 0;
  await runNotificationTest(settings(), "event", effects({ notify: () => { count++; } }));
  assert.equal(count, 1);
});

test("sound failure is a warning after actual local publication, not external success", async () => {
  let published = false;
  const result = await runNotificationTest(settings(), "event", effects({ notify: () => { published = true; }, playSound: async () => { throw new Error("Audio blocked"); } }));
  assert.equal(published, true);
  assert.equal(result.soundFailed, true);
});

test("test does not mutate or persist draft settings and only reports requested external channels", async () => {
  const value = settings();
  value.whatsappActive = false;
  const snapshot = structuredClone(value);
  const result = await runNotificationTest(value, "event", effects());
  assert.deepEqual(value, snapshot);
  assert.deepEqual(result.unsupported, ["E-mail"]);
});

