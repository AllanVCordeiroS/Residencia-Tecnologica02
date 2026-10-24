import {
  MODULOS,
  type Modulo,
  type Perfil,
  type Permissoes,
  type Usuario,
} from "@/types/usuarios";

export const UNIDADES = [
  "Matriz — Recife",
  "Jaboatão",
  "Paulista",
  "Caruaru",
  "Olinda",
  "Salvador",
] as const;

export const RESUMO_MOCK = {
  total: 48,
  ativos: 42,
  convitesPendentes: 4,
  inativos: 2,
};

export const USUARIOS_MOCK: Usuario[] = [
  { id: "1", nome: "Ricardo Silveira", email: "ricardo@adega.com.br", cargo: "Diretor", perfil: "Administrador Geral", unidade: "Todas as unidades", status: "ativo", ultimoAcesso: "17/04/2026 09:32", avatarTone: "blueDark" },
  { id: "2", nome: "Carlos Mendes", email: "carlos@adega.com.br", cargo: "Gerente de Loja", perfil: "Gestor de Unidade", unidade: "Jaboatão", status: "ativo", ultimoAcesso: "16/04/2026 16:45", avatarTone: "green" },
  { id: "3", nome: "Ana Souza", email: "ana@adega.com.br", cargo: "Analista Financeira", perfil: "Financeiro", unidade: "Matriz — Recife", status: "ativo", ultimoAcesso: "16/04/2026 14:12", avatarTone: "blueLight" },
  { id: "4", nome: "Mariana Costa", email: "mariana@adega.com.br", cargo: "Coordenadora de Operações", perfil: "Operacional", unidade: "Paulista", status: "ativo", ultimoAcesso: "15/04/2026 11:27", avatarTone: "yellow" },
  { id: "5", nome: "Pedro Lima", email: "pedro@adega.com.br", cargo: "Vendedor", perfil: "Colaborador", unidade: "Olinda", status: "convite_pendente", ultimoAcesso: null, avatarTone: "red" },
  { id: "6", nome: "Gabriel Fernandes", email: "gabriel@adega.com.br", cargo: "Gerente de Loja", perfil: "Gestor de Unidade", unidade: "Caruaru", status: "ativo", ultimoAcesso: "14/04/2026 10:03", avatarTone: "mint" },
  { id: "7", nome: "Tatiana Lopes", email: "tatiana@adega.com.br", cargo: "Analista Financeira", perfil: "Financeiro", unidade: "Jaboatão", status: "inativo", ultimoAcesso: "08/04/2026 15:20", avatarTone: "lavender" },
  { id: "8", nome: "Bruno Rodrigues", email: "bruno@adega.com.br", cargo: "Auxiliar de Operações", perfil: "Operacional", unidade: "Paulista", status: "ativo", ultimoAcesso: "17/04/2026 08:17", avatarTone: "blue" },
];

const p = (s: string) => ({
  visualizar: s[0] === "V",
  criar: s[1] === "C",
  editar: s[2] === "E",
  excluir: s[3] === "X",
});

const build = (m: Record<Modulo, string>): Permissoes =>
  Object.fromEntries(MODULOS.map((mod) => [mod, p(m[mod])])) as Permissoes;

export const PERMISSOES_POR_PERFIL: Record<Perfil, Permissoes> = {
  "Administrador Geral": build({
    Dashboard: "VCEX",
    Documentos: "VCEX",
    Tarefas: "VCEX",
    "Licenças e Alvarás": "VCEX",
    Financeiro: "VCEX",
    Usuários: "VCEX",
  }),
  "Gestor de Unidade": build({
    Dashboard: "VC--",
    Documentos: "VCEX",
    Tarefas: "VCEX",
    "Licenças e Alvarás": "VCE-",
    Financeiro: "V---",
    Usuários: "V---",
  }),
  Financeiro: build({
    Dashboard: "V---",
    Documentos: "VC--",
    Tarefas: "V---",
    "Licenças e Alvarás": "V---",
    Financeiro: "VCEX",
    Usuários: "----",
  }),
  Operacional: build({
    Dashboard: "VC--",
    Documentos: "VCE-",
    Tarefas: "VCEX",
    "Licenças e Alvarás": "VCE-",
    Financeiro: "----",
    Usuários: "----",
  }),
  Colaborador: build({
    Dashboard: "VC--",
    Documentos: "VCE-",
    Tarefas: "VCE-",
    "Licenças e Alvarás": "VCE-",
    Financeiro: "----",
    Usuários: "----",
  }),
};
