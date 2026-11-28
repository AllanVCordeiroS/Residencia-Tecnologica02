import { unidadesOperacionaisDemo } from "@/data/mockData";
import type { OperationalUnit, UnitFormValues } from "@/types/unit";
import { digitsOnly, unitSchema } from "@/schemas/unit";
import { getUsers } from "@/services/users";
import { getDocuments } from "@/services/documents";
import { getTasks } from "@/services/tasks";
import { mesmaIdentidade, verificarExclusaoUnidade } from "@/services/unitRules";
import { getLicenses, getUnitLicenseRestriction } from "@/services/licenses";

export type { OperationalUnit } from "@/types/unit";
let unitsDemo: OperationalUnit[] = unidadesOperacionaisDemo.map((unit) => ({ ...unit, ativa: true }));

/** Adaptador demonstrativo de leitura; não representa uma consulta ao banco. */
export async function getOperationalUnits(): Promise<OperationalUnit[]> {
  return structuredClone(unitsDemo);
}

function findUnit(id: string) {
  const unit = unitsDemo.find((item) => item.id === id);
  if (!unit) throw new Error("Unidade não encontrada.");
  return unit;
}

/** Mesmo armazenamento temporário em memória dos demais serviços de demonstração. */
export async function saveUnitDemo(input: UnitFormValues, id?: string): Promise<OperationalUnit> {
  const values = unitSchema.parse(input);
  const previous = id ? findUnit(id) : undefined;
  if (previous && previous.ativa !== false) {
    const restriction = await getUnitLicenseRestriction(previous.id);
    if (restriction.blocked) throw new Error(restriction.mensagem ?? "Unidade com bloqueio cautelar operacional.");
  }
  const users = await getUsers();
  const owner = users.find((user) => user.id === values.responsavelId);
  if (!owner) throw new Error("Selecione um responsável existente.");
  if (unitsDemo.some((unit) => unit.id !== id && (digitsOnly(unit.cnpj) === digitsOnly(values.cnpj) || unit.identificadorOperacional?.toLowerCase() === values.identificadorOperacional.toLowerCase() || unit.nome.trim().toLowerCase() === values.nome.toLowerCase()))) throw new Error("Já existe uma unidade com este CNPJ, identificador ou nome.");
  // Os vínculos legados de documentos e tarefas utilizam nome. Renomear um registro
  // referenciado os deixaria órfãos; preservamos a identidade até existir vínculo por ID.
  if (previous && previous.nome !== values.nome) {
    const [documents, tasks, licenses] = await Promise.all([getDocuments(), getTasks(), getLicenses()]);
    if (documents.some((item) => mesmaIdentidade(item.unit, previous)) || tasks.some((item) => mesmaIdentidade(item.unit, previous)) || licenses.some((item) => item.unidade === previous.id || mesmaIdentidade(item.unidadeNome, previous)) || previous.documentosPendentes || previous.tarefasAtrasadas || previous.licencasVencendo) throw new Error("Esta unidade possui vínculos. Preserve o nome para manter documentos, tarefas e licenças associados.");
  }
  const unit: OperationalUnit = {
    ...(previous ?? { id: globalThis.crypto.randomUUID(), tipo: "Filial", funcionarios: 0, documentosPendentes: 0, tarefasAtrasadas: 0, licencasVencendo: 0, situacao: "Regular", ativa: true }),
    ...values, subtipo: values.formatoOperacional, cidade: `${values.municipio}/${values.uf}`, responsavel: owner.nome,
  };
  unitsDemo = previous ? unitsDemo.map((item) => item.id === id ? unit : item) : [unit, ...unitsDemo];
  return structuredClone(unit);
}

export async function toggleUnitDemo(id: string): Promise<void> {
  const unit = findUnit(id);
  if (unit.ativa === false) {
    const restriction = await getUnitLicenseRestriction(id);
    if (restriction.blocked) throw new Error(restriction.mensagem ?? "Ativação impedida por bloqueio cautelar.");
  }
  unitsDemo = unitsDemo.map((item) => item.id === id ? { ...item, ativa: unit.ativa === false } : item);
}

export async function deleteUnitDemo(id: string): Promise<void> {
  const [documents, tasks, licenses] = await Promise.all([getDocuments(), getTasks(), getLicenses()]);
  const unit = findUnit(id);
  const result = verificarExclusaoUnidade(unit, documents, tasks);
  if (!result.permitido) throw new Error(result.mensagem ?? "Exclusão bloqueada.");
  if (licenses.some((item) => item.unidade === id || mesmaIdentidade(item.unidadeNome, unit))) throw new Error("Unidade com licenças vinculadas. Desative para preservar o histórico.");
  unitsDemo = unitsDemo.filter((unit) => unit.id !== id);
}
