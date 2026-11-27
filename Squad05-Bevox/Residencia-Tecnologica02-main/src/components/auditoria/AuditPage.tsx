import { useMemo, useState, type ReactNode } from 'react';
import './AuditPage.css';

type Status = 'Bloqueada' | 'Concluída';
type Action = 'Exclusão' | 'Alteração' | 'Visualização' | 'Cadastro' | 'Configuração' | 'Exportação';

type AuditRecord = {
  id: number;
  date: string;
  user: string;
  action: Action;
  item: string;
  status: Status;
  details: string;
};

const records: AuditRecord[] = [
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

const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

function ShieldIcon() {
  return <svg viewBox="0 0 72 82" aria-hidden="true"><path d="M36 4 65 15v23c0 19-12 32-29 40C19 70 7 57 7 38V15L36 4Z"/><path d="m22 40 9 9 20-22"/></svg>;
}
function Icon({ name }: { name: 'document' | 'alert' | 'check' | 'clock' | 'search' | 'calendar' | 'list' | 'eye' | 'trash' | 'edit' | 'plus' | 'settings' | 'download' | 'chevron' | 'filter' | 'close' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<typeof name, ReactNode> = {
    document: <><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h8"/></>,
    alert: <><path d="M12 2 21 6v6c0 5-3.5 8-9 10-5.5-2-9-5-9-10V6z"/><path d="M12 7v6M12 17h.01"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    list: <><path d="M9 5h12M9 12h12M9 19h12"/><path d="M3 5h.01M3 12h.01M3 19h.01"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 10v8M14 10v8"/></>,
    edit: <><path d="m4 16-.8 4.8L8 20l11-11-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2 1-1.5 2.6-1.5-.6a8 8 0 0 1-1.5.9l-.3 1.6h-3l-.3-1.6a8 8 0 0 1-1.5-.9l-1.5.6-1.5-2.6 1.2-1a8 8 0 0 1 0-1.8l-1.2-1 1.5-2.6 1.5.6a8 8 0 0 1 1.5-.9l.3-1.6h3l.3 1.6a8 8 0 0 1 1.5.9l1.5-.6 1.5 2.6-1.2 1a8 8 0 0 1 0 1.8Z"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 19v2h16v-2"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    filter: <path d="M3 4h18l-7 8v6l-4 2v-8z"/>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg className="audit-icon" viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

function ActionPill({ action }: { action: Action }) {
  const iconName = ({ Exclusão: 'trash', Alteração: 'edit', Visualização: 'document', Cadastro: 'plus', Configuração: 'settings', Exportação: 'download' } as const)[action];
  return <span className={`action-pill action-${action.toLowerCase()}`}><Icon name={iconName} />{action}</span>;
}

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('Últimos 30 dias');
  const [action, setAction] = useState('Todos');
  const [status, setStatus] = useState('Todos');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditRecord | null>(null);
  const pageSize = 6;

  const filtered = useMemo(() => records.filter((record) => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const matchesSearch = !term || [record.user, record.action, record.item, record.details].some((value) => value.toLocaleLowerCase('pt-BR').includes(term));
    return matchesSearch && (action === 'Todos' || record.action === action) && (status === 'Todos' || record.status === status);
  }), [search, action, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRecords = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetPage<T>(setter: (value: T) => void, value: T) { setter(value); setPage(1); }

  return (
    <main className="audit-page">
      <section className="audit-heading">
        <div className="audit-shield"><ShieldIcon /></div>
        <div><h1>Auditoria</h1><p>Histórico de atividades e alterações realizadas no sistema.</p></div>
      </section>

      <section className="audit-stats" aria-label="Resumo da auditoria">
        <article className="stat-card stat-total"><div className="stat-icon"><Icon name="document" /></div><div className="stat-copy"><span>Total de Registros</span><strong>1.284</strong></div><span className="stat-trend">↑ +12%</span></article>
        <article className="stat-card stat-blocked"><div className="stat-icon"><Icon name="alert" /></div><div className="stat-copy"><span>Ações Bloqueadas</span><strong>18</strong></div><span className="stat-trend">↑ +2%</span></article>
        <article className="stat-card stat-completed"><div className="stat-icon"><Icon name="check" /></div><div className="stat-copy"><span>Ações Concluídas</span><strong>1.266</strong></div><span className="stat-trend">↑ +12%</span></article>
        <article className="stat-card stat-last"><div className="stat-icon"><Icon name="clock" /></div><div className="stat-copy"><span>Última Atividade</span><strong className="last-activity"><i />Hoje, 17:47</strong></div></article>
      </section>

      <section className="audit-filters" aria-label="Filtros de auditoria">
        <label className="audit-search"><Icon name="search" /><input value={search} onChange={(event) => resetPage(setSearch, event.target.value)} placeholder="Buscar por usuário, ação ou item..." /></label>
        <label className="filter-select"><Icon name="calendar" /><span><small>Período</small><select value={period} onChange={(event) => resetPage(setPeriod, event.target.value)}><option>Últimos 30 dias</option><option>Últimos 7 dias</option><option>Hoje</option><option>Todo o período</option></select></span><Icon name="chevron" /></label>
        <label className="filter-select"><Icon name="list" /><span><small>Tipo de Ação</small><select value={action} onChange={(event) => resetPage(setAction, event.target.value)}><option>Todos</option><option>Exclusão</option><option>Alteração</option><option>Visualização</option><option>Cadastro</option><option>Configuração</option><option>Exportação</option></select></span><Icon name="chevron" /></label>
        <label className="filter-select"><Icon name="check" /><span><small>Resultado</small><select value={status} onChange={(event) => resetPage(setStatus, event.target.value)}><option>Todos</option><option>Concluída</option><option>Bloqueada</option></select></span><Icon name="chevron" /></label>
        <button className="filter-button" type="button" onClick={() => setPage(1)}><Icon name="filter" />Filtrar</button>
      </section>

      <section className="audit-table-wrap" aria-label="Histórico de atividades">
        <table className="audit-table">
          <thead><tr><th>Data e Hora <span>↕</span></th><th>Usuário <span>↕</span></th><th>Tipo de Ação <span>↕</span></th><th>Elemento <span>↕</span></th><th>Resultado <span>↕</span></th><th>Detalhes</th><th aria-label="Visualizar" /></tr></thead>
          <tbody>{visibleRecords.map((record) => <tr key={record.id}>
            <td className="date-cell">{record.date}</td>
            <td><div className="user-cell"><span className="avatar">{initials(record.user)}</span><span>{record.user}</span></div></td>
            <td><ActionPill action={record.action} /></td>
            <td>{record.item}</td>
            <td><span className={`status-pill ${record.status === 'Bloqueada' ? 'status-blocked' : 'status-done'}`}><Icon name={record.status === 'Bloqueada' ? 'alert' : 'check'} />{record.status}</span></td>
            <td className="details-cell">{record.details}</td>
            <td><button className="view-button" type="button" aria-label={`Ver detalhes de ${record.user}`} onClick={() => setSelected(record)}><Icon name="eye" /></button></td>
          </tr>)}
          {visibleRecords.length === 0 && <tr><td colSpan={7} className="empty-state">Nenhum registro encontrado para os filtros selecionados.</td></tr>}</tbody>
        </table>
      </section>

      <div className="audit-pagination"><span>Mostrando {filtered.length ? (page - 1) * pageSize + 1 : 0} a {Math.min(page * pageSize, filtered.length)} de {filtered.length} registros</span><nav aria-label="Paginação"><button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Página anterior">‹</button><button type="button" className="current-page">{page}</button><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Próxima página">›</button></nav></div>

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="audit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Fechar"><Icon name="close" /></button><span className="modal-eyebrow">DETALHES DO REGISTRO</span><h2 id="modal-title">{selected.action} — {selected.item}</h2><div className="modal-grid"><div><small>Usuário</small><strong>{selected.user}</strong></div><div><small>Data e hora</small><strong>{selected.date}</strong></div><div><small>Resultado</small><strong>{selected.status}</strong></div><div><small>Tipo de ação</small><strong>{selected.action}</strong></div></div><p>{selected.details}</p><button className="modal-confirm" onClick={() => setSelected(null)}>Fechar detalhes</button></section></div>}
    </main>
  );
}
