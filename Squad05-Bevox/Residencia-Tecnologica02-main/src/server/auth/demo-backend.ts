import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { cwd } from "node:process";
import { z } from "zod";
import { PERMISSOES_POR_PERFIL, USUARIOS_MOCK } from "@/lib/usuarios-mock";
import { unidadesOperacionaisDemo } from "@/data/mockData";
import { mesmaIdentidade } from "@/services/unitRules";
import { demoPasswordHash, verifyDemoPassword } from "@/server/auth/demo-credentials";
import { isSessionToken, type AuthBackend, type ServerAccount } from "@/server/auth/core";

const recordSchema = z.object({ accountId: z.string().min(1), expiresAt: z.number().finite(), revoked: z.boolean() });
const isMissing = (error: unknown) => error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT";

/**
 * Adaptador exclusivamente demonstrativo, sem banco, API externa ou configuração.
 * Reutiliza os oito registros existentes, sem tornar contas pendentes/inativas ativas.
 * Arquivos temporários permitem que Proxy e Route Handlers validem/revoguem a mesma
 * sessão, sem depender de globals compartilhados entre os workers do Next.js.
 * Não é autenticação adequada para produção ou múltiplos servidores.
 */
export function createDemoBackend(directory = resolve(cwd(), ".next/cache/bevox-demo-sessions")): AuthBackend {
  function account(id: string): ServerAccount | null {
    const passwordHash = demoPasswordHash(id);
    const user = USUARIOS_MOCK.find((item) => item.id === id);
    if (!passwordHash || !user) return null;
    return {
      id: user.id, nome: user.nome, email: user.email.trim().toLowerCase(), perfil: user.perfil,
      unidade: user.unidade,
      unidadeId: user.unidadeId ?? unidadesOperacionaisDemo.find((unit) => mesmaIdentidade(user.unidade, unit))?.id,
      status: user.status, cadastroPendente: user.cadastroPendente ?? false,
      permissoes: structuredClone(user.permissoes ?? PERMISSOES_POR_PERFIL[user.perfil]), passwordHash,
    };
  }

  // O nome de arquivo nunca usa o token bruto nem um caminho recebido do cliente.
  const sessionFile = (token: string) => join(directory, createHash("sha256").update(token).digest("hex") + ".json");
  async function remove(token: string) {
    try { await unlink(sessionFile(token)); } catch (error) { if (!isMissing(error)) throw error; }
  }

  return {
    async findAccountByEmail(email) {
      const user = USUARIOS_MOCK.find((item) => item.email.trim().toLowerCase() === email.trim().toLowerCase());
      return user ? account(user.id) : null;
    },
    async findAccountById(id) { return account(id); },
    async verifyPassword(password, storedHash) { return verifyDemoPassword(password, storedHash); },
    async createSession(accountId, expiresAt) {
      const user = account(accountId);
      if (!user || user.status !== "ativo" || user.cadastroPendente || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        throw new Error("Sessão demonstrativa não autorizada.");
      }
      const token = randomBytes(32).toString("base64url");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(sessionFile(token), JSON.stringify({ accountId, expiresAt, revoked: false }), { encoding: "utf8", mode: 0o600, flag: "wx" });
      return token;
    },
    async readSession(token) {
      if (!isSessionToken(token)) return null;
      let raw: string;
      try { raw = await readFile(sessionFile(token), "utf8"); }
      catch (error) { if (isMissing(error)) return null; throw error; }
      let value: unknown;
      try { value = JSON.parse(raw); } catch { return null; }
      const parsed = recordSchema.safeParse(value);
      if (!parsed.success) return null;
      if (parsed.data.expiresAt <= Date.now() || parsed.data.revoked) {
        await remove(token);
        return null;
      }
      return parsed.data;
    },
    async revokeSession(token) { if (isSessionToken(token)) await remove(token); },
  };
}
