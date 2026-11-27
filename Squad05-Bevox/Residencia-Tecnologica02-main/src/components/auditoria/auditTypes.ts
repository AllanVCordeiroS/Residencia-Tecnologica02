export type AuditStatus = 'Bloqueada' | 'Concluída';
export type AuditAction = 'Exclusão' | 'Alteração' | 'Visualização' | 'Cadastro' | 'Configuração' | 'Exportação';

export type AuditRecord = {
  id: number;
  date: string;
  user: string;
  action: AuditAction;
  item: string;
  status: AuditStatus;
  details: string;
};
