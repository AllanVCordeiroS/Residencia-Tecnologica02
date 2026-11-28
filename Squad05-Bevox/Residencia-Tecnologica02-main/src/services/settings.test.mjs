import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

// Execute the actual TypeScript services without installing a test runner or emitting project files.
const require = createRequire(import.meta.url);
const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function loadSource(path) {
  if (modules.has(path)) return modules.get(path).exports;
  const loadedModule = { exports: {} };
  modules.set(path, loadedModule);
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const resolveImport = (name) => name.startsWith("@/") ? loadSource(resolve(sourceRoot, `${name.slice(2)}.ts`)) : require(name);
  new Function("require", "module", "exports", outputText)(resolveImport, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const settings = loadSource(resolve(sourceRoot, "services/settings.ts"));
const schemas = loadSource(resolve(sourceRoot, "services/settingsSchemas.ts"));
const preferenceSchemas = loadSource(resolve(sourceRoot, "schemas/preferences.ts"));
const preferenceOwner = loadSource(resolve(sourceRoot, "lib/preference-owner.ts"));
const { parametrosFinanceirosMock } = loadSource(resolve(sourceRoot, "lib/configuracoes-mock.ts"));

class LocalStorage {
  values = new Map();
  failOnceFor = null;
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) {
    if (key === this.failOnceFor) { this.failOnceFor = null; throw new Error("QuotaExceededError"); }
    this.values.set(key, String(value));
  }
  removeItem(key) { this.values.delete(key); }
}
let storage;
beforeEach(() => {
  preferenceOwner.setPreferenceOwner("ana-verified-id");
  storage = new LocalStorage();
  globalThis.window = Object.assign(new EventTarget(), { localStorage: storage });
  globalThis.document = { cookie: "bevox_session=ana%40example.com" };
  globalThis.StorageEvent = class extends Event { constructor(type, init) { super(type); Object.assign(this, init); } };
});
const defaults = () => structuredClone(settings.DEFAULT_INTERFACE_PREFERENCES);

test("persists preferences and notifies compatible consumers only after a successful commit", () => {
  const value = defaults();
  value.global.tableView = "compact";
  value.user.theme = "dark";
  let notified = 0;
  window.addEventListener(settings.SETTINGS_CHANGED, () => notified++);
  settings.saveInterfacePreferences(value);
  assert.deepEqual(settings.readInterfacePreferences(), value);
  assert.equal(storage.getItem("bevox.theme"), "dark");
  assert.equal(notified, 1);
});

test("personal settings use verified identity, ignore forged cookies and keep global table settings shared locally", () => {
  const value = defaults();
  value.global.showRowSummary = false;
  value.user.showVisualAlerts = false;
  settings.saveInterfacePreferences(value);
  document.cookie = "bevox_session=bruno%40example.com";
  assert.equal(settings.readInterfacePreferences().user.showVisualAlerts, false);
  preferenceOwner.setPreferenceOwner("bruno-verified-id");
  assert.equal(settings.readInterfacePreferences().user.showVisualAlerts, true);
  assert.equal(settings.readInterfacePreferences().global.showRowSummary, false);
  document.cookie = "bevox_session=ana%40example.com";
  preferenceOwner.setPreferenceOwner("ana-verified-id");
  assert.equal(settings.readInterfacePreferences().user.showVisualAlerts, false);
});

test("failed multi-key commit restores previously persisted settings and does not notify success", () => {
  settings.saveInterfacePreferences(defaults());
  const previous = [...storage.values];
  let notified = 0;
  window.addEventListener(settings.SETTINGS_CHANGED, () => notified++);
  storage.failOnceFor = `bevox.settings.interface.user.${settings.settingsUserKey()}`;
  const value = defaults(); value.global.tableView = "compact";
  assert.throws(() => settings.saveInterfacePreferences(value), /QuotaExceededError/);
  assert.deepEqual([...storage.values], previous);
  assert.equal(notified, 0);
});

test("invalid or corrupted settings are rejected without replacing stored data", () => {
  storage.setItem("bevox.settings.interface.global", "{invalid json");
  assert.throws(() => settings.readInterfacePreferences());
  assert.equal(storage.getItem("bevox.settings.interface.global"), "{invalid json");
  const value = defaults(); value.global.language = "en-US";
  assert.throws(() => settings.saveInterfacePreferences(value));
  assert.equal(storage.getItem("bevox.settings.interface.global"), "{invalid json");
});

test("date-only values keep their day, timestamp dates use the configured zone, and personal formats override global", () => {
  const value = defaults();
  value.global.timeZone = "America/Rio_Branco";
  value.global.dateFormat = "AAAA-MM-DD";
  assert.equal(settings.formatPreferenceDate("2026-11-26", value), "2026-11-26");
  assert.equal(settings.formatPreferenceDate("2026-11-26T02:00:00Z", value), "2026-11-25");
  value.user.dateFormat = "DD/MM/AAAA";
  assert.equal(settings.formatPreferenceDate("2026-11-26", value), "26/11/2026");
  assert.equal(settings.formatPreferenceDate("invalid", value), "Data inválida");
});

test("legacy theme remains available without any previously saved interface settings", () => {
  storage.setItem("bevox.theme", "system");
  assert.equal(settings.readInterfacePreferences().user.theme, "system");
});

test("normalized preference drafts can be saved repeatedly without a property-order difference", () => {
  const draft = defaults();
  const parsed = preferenceSchemas.interfacePreferencesSchema.parse(draft);
  settings.saveInterfacePreferences(parsed);
  assert.equal(JSON.stringify(preferenceSchemas.interfacePreferencesSchema.parse(settings.readInterfacePreferences())), JSON.stringify(parsed));
});

test("company settings validate contact data and persistent logos while preserving supplied records", () => {
  const value = schemas.DEFAULT_COMPANY_SETTINGS;
  assert.equal(schemas.companySettingsSchema.safeParse(value).success, true);
  assert.equal(schemas.companySettingsSchema.safeParse({ ...value, email: "invalid", cep: "12" }).success, false);
  assert.equal(schemas.companySettingsSchema.safeParse({ ...value, logo: "blob:temporary" }).success, false);
  const key = "bevox.settings.company";
  settings.writeSettings(key, schemas.companySettingsSchema, value);
  assert.deepEqual(settings.readSettings(key, schemas.companySettingsSchema, value), value);
});

test("financial validation rejects empty or duplicated categories and invalid conversion rates", () => {
  assert.equal(schemas.financialSettingsSchema.safeParse(parametrosFinanceirosMock).success, true);
  const value = structuredClone(parametrosFinanceirosMock);
  value.categorias.push({ id: "new", nome: value.categorias[0].nome.toUpperCase() });
  assert.equal(schemas.financialSettingsSchema.safeParse(value).success, false);
  value.categorias.pop(); value.configuracaoGeral.moedas[0].taxaConversao = 0;
  assert.equal(schemas.financialSettingsSchema.safeParse(value).success, false);
});

test("security and notification settings accept supported options and reject invented methods or empty schedule", () => {
  assert.equal(schemas.securitySettingsSchema.safeParse(schemas.DEFAULT_SECURITY_SETTINGS).success, true);
  assert.equal(schemas.securitySettingsSchema.safeParse({ ...schemas.DEFAULT_SECURITY_SETTINGS, selected2FA: "Fake" }).success, false);
  assert.equal(schemas.notificationSettingsSchema.safeParse({ emailActive: true, sistemaActive: true, whatsappActive: false, selectedDays: [], horario: "08:00", preferences: [] }).success, false);
});

