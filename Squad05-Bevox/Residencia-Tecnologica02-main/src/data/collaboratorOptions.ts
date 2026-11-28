import { USUARIOS_MOCK } from "@/lib/usuarios-mock";
import { GESTORES_DOCUMENTO } from "@/data/documentFormOptions";

// Catálogos derivados dos cargos e áreas já presentes na demonstração.
// Não atribuem perfil RBAC nem vinculam automaticamente gestores ao cadastro.
export const COLLABORATOR_JOBS = [...new Set(USUARIOS_MOCK.map((user) => user.cargo))];
export const COLLABORATOR_DEPARTMENTS = [...new Set(GESTORES_DOCUMENTO.map((item) => item.departamento))];
