import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/** Credencial pública de DEMONSTRAÇÃO. Não usar este mecanismo em produção. */
const DEMO_PASSWORD = "123456";
const DEMO_ACCOUNT_IDS = new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);
const passwordDigest = (value: string) => createHash("sha256").update(value).digest();
const demoDigest = passwordDigest(DEMO_PASSWORD);

// Somente IDs: identidade, status, unidade e permissões continuam nos mocks existentes.
export function demoPasswordHash(accountId: string): string | null {
  return DEMO_ACCOUNT_IDS.has(accountId) ? demoDigest.toString("hex") : null;
}

export function verifyDemoPassword(password: string, storedHash: string): boolean {
  return storedHash === demoDigest.toString("hex") && timingSafeEqual(passwordDigest(password), demoDigest);
}
