import type { AuditRecord } from './auditTypes';

export const auditRecords: AuditRecord[] = [
  { id: 1, date: '09/11/2026 às 17:47', user: 'Matheus Oliveira', action: 'Exclusão', item: 'Unidade Recife', status: 'Bloqueada', details: 'Exclusão bloqueada por documentos pendentes.' },
  { id: 2, date: '09/11/2026 às 16:42', user: 'Ana Carolina', action: 'Alteração', item: 'Dados cadastrais', status: 'Concluída', details: 'Atualização de informações da unidade.' },
  { id: 3, date: '09/11/2026 às 16:20', user: 'Lucas Santos', action: 'Visualização', item: 'Relatório de Vendas', status: 'Concluída', details: 'Acesso ao relatório mensal.' },
  { id: 4, date: '09/11/2026 às 15:55', user: 'Thays Mendes', action: 'Cadastro', item: 'Nova Unidade', status: 'Concluída', details: 'Cadastro da unidade Salvador.' },
  { id: 5, date: '09/11/2026 às 14:33', user: 'Matheus Oliveira', action: 'Configuração', item: 'Roteirização', status: 'Concluída', details: 'Alteração nas rotas de entrega.' },
  { id: 6, date: '09/11/2026 às 13:12', user: 'Ana Carolina', action: 'Exportação', item: 'Relatório Financeiro', status: 'Concluída', details: 'Exportação de relatório.' },
  { id: 7, date: '08/11/2026 às 18:06', user: 'Lucas Santos', action: 'Alteração', item: 'Cadastro de fornecedor', status: 'Concluída', details: 'Atualização dos dados do fornecedor.' },
  { id: 8, date: '08/11/2026 às 16:31', user: 'Thays Mendes', action: 'Exclusão', item: 'Documento fiscal', status: 'Bloqueada', details: 'Ação bloqueada por falta de permissão.' },
  { id: 9, date: '08/11/2026 às 14:10', user: 'Ana Carolina', action: 'Cadastro', item: 'Produto', status: 'Concluída', details: 'Novo produto incluído no catálogo.' },
  { id: 10, date: '08/11/2026 às 11:24', user: 'Matheus Oliveira', action: 'Configuração', item: 'Estoque', status: 'Concluída', details: 'Parâmetros de estoque atualizados.' },
];
