"use client";

import { useTasksQuery } from "@/hooks/queries/useTasksQuery";
import { useDocumentsQuery } from "@/hooks/queries/useDocumentsQuery";
import { useOccurrencesQuery } from "@/hooks/queries/useOccurrencesQuery";
import { useLicensesQuery } from "@/hooks/queries/useLicensesQuery";
import { useFinanceQuery } from "@/components/financeiro/useFinanceQuery";
import { daysUntilExpiration, getLicenseStatus } from "@/services/licenses";
import { useRouter } from "next/navigation";

export function NotificationPreview({ eventId, horario, channels, frequency }: {
  eventId: string; horario: string; channels: string[]; frequency?: string;
}) {
  const router = useRouter();
  const tasks = useTasksQuery();
  const documents = useDocumentsQuery();
  const occurrences = useOccurrencesQuery();
  const licenses = useLicensesQuery();
  const finance = useFinanceQuery();
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const task = tasks.data?.find((item) => item.late);
  const license = licenses.data?.find((item) => {
    const distance = daysUntilExpiration(item.dataVencimento, date);
    return getLicenseStatus(item, date) === "A vencer" && distance >= 0 && distance <= 7;
  });
  const document = documents.data?.[0];
  const occurrence = occurrences.data?.find((item) => item.status !== "Resolvida");
  const account = finance.data?.find((item) => item.status === "Pendente" && item.dataVencimento < date);
  const selected = eventId === "1" ? {
    query: tasks, record: task && { title: task.title, detail: task.unit, owner: task.owner, due: task.due, href: "/tarefas", action: "Ver lista de tarefas" },
  } : eventId === "2" ? {
    query: licenses, record: license && { title: license.tipoLicenca, detail: license.unidadeNome, owner: license.responsavelNome, due: license.dataVencimento.split("-").reverse().join("/"), href: "/licencas", action: "Ver licenças" },
  } : eventId === "3" ? {
    query: finance, record: account && { title: account.descricao, detail: account.unidadeNome, owner: "Não informado", due: account.dataVencimento.split("-").reverse().join("/"), href: "/financeiro", action: "Ver contas" },
  } : eventId === "4" ? {
    query: documents, record: document && { title: document.title, detail: document.unit, owner: document.responsible, due: document.dueDate, href: "/documentos", action: "Ver documentos" },
  } : {
    query: occurrences, record: occurrence && { title: occurrence.title, detail: occurrence.unitName, owner: occurrence.owner, due: occurrence.resolutionDeadline.split("-").reverse().join("/"), href: "/operacional", action: "Ver ocorrências" },
  };
  const record = selected.record;
  return <div className="rounded-lg border border-line bg-surface-muted/50 p-3 space-y-3 text-xs" aria-live="polite">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2"><span className="rounded bg-slate-950 p-2 font-bold text-white">BX</span><div><strong>BEVOX</strong><p className="text-[10px] text-foreground-muted">Exemplo de pré-visualização</p></div></div>
      <span className="text-[10px] text-foreground-muted">{today.toLocaleDateString("pt-BR")}, {horario}</span>
    </div>
    {selected.query.isPending ? <p>Carregando exemplo…</p> : selected.query.isError ? <div role="alert"><p>Não foi possível carregar os dados do exemplo.</p><button type="button" className="mt-2 underline" onClick={() => void selected.query.refetch()}>Tentar novamente</button></div> : record ? <>
      <div><h4 className="font-semibold">{record.title}</h4><p className="mt-1 text-foreground-muted">{record.detail}</p></div>
      <div className="rounded bg-blue-50 p-3 dark:bg-blue-950/40"><p>Responsável: <strong>{record.owner || "Não informado"}</strong></p><p>Prazo: {record.due || "Não informado"}</p></div>
      <button type="button" onClick={() => router.push(record.href)} className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">{record.action} →</button>
    </> : <p className="text-foreground-muted">Nenhum registro correspondente disponível para este evento.</p>}
    <p className="border-t border-line pt-2 text-[10px] text-foreground-muted">{channels.length ? channels.join(" · ") : "Nenhum canal selecionado"} · {frequency || "Sem frequência"}</p>
  </div>;
}
