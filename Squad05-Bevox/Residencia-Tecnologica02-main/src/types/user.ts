export type UserRole =
  | "Administrador Geral"
  | "Gestor de Unidade"
  | "Financeiro"
  | "Operacional"
  | "Colaborador";

export type UserStatus =
  | "Ativo"
  | "Convite pendente"
  | "Inativo";

export interface UserActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  ipAddress: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  units: string[] | string;
  status: UserStatus;
  lastAccess: string;
  phone: string;
  jobTitle: string;
  mfaEnabled: boolean;
  createdAt: string;
  createdWith: string;
  primaryUnit?: string;
  startDate?: string;
  endDate?: string | null;
  isOnline?: boolean;
  fullAccess?: boolean;
  authorizedModules?: string[];
  activities?: UserActivity[];
}
