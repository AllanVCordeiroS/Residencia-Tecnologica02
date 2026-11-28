"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Wallet, Save, X } from "lucide-react";
import { financeEntrySchema } from "@/schemas/finance";
import type { FinanceEntryFormValues } from "@/types/finance";
import { useUnitsQuery } from "@/hooks/queries/useUnitsQuery";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useFinanceMutation, useFinanceQuery } from "@/components/financeiro/useFinanceQuery";
import { dateISO, dateLabel, money, parseFinanceAmount } from "@/components/financeiro/financeMath";

type FormValues = Omit<FinanceEntryFormValues, "valor"> & { valor: string };
const input = "w-full rounded-lg border border-line bg-surface-raised px-3 py-2.5 text-sm text-foreground focus:outline-2 focus:outline-blue-600";
const card = "rounded-xl border border-line bg-surface-raised p-5 shadow-sm";
function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: ReactNode }) {
  return <div><label htmlFor={name} className="mb-2 block text-xs font-semibold">{label}</label>{children}{error && <p id={name + "-error"} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-300">{error}</p>}</div>;
}
export default function NovoLancamentoPage() {
  const router = useRouter();
  const units = useUnitsQuery();
  const recent = useFinanceQuery();
  const mutation = useFinanceMutation();
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState("");
  const today = dateISO(new Date());
  const methods = useForm<FormValues>({ defaultValues: { tipo: "Receita", categoria: "", subcategoria: "", descricao: "", valor: "", unidade: "", contraparte: "", dataVencimento: today, dataLancamento: today, status: "Pendente", formaPagamento: "PIX", observacao: "" } });
  const values = useWatch({ control: methods.control });
  const { isDirty, errors, isSubmitting } = methods.formState;
  const guard = useUnsavedChanges({ dirty: isDirty || !!file, onDiscard: () => { methods.reset(); setFile(undefined); } });
  const attrs = (name: keyof FormValues) => ({ id: name, "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? name + "-error" : undefined, className: input, ...methods.register(name) });
  async function submit(data: FormValues) {
    methods.clearErrors();
    // Aceita decimal BR (1.234,56) ou simples (1234.56), sem truncar texto inválido.
    const amount = parseFinanceAmount(data.valor);
    const parsed = financeEntrySchema.safeParse({ ...data, valor: amount });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        methods.setError(key, { type: "schema", message: key === "valor" ? "Informe um valor positivo com até duas casas decimais (ex.: 1.234,56)." : issue.message }, { shouldFocus: true });
      }
      return;
    }
    if (fileError) return;
    try {
      await mutation.mutateAsync({ ...parsed.data, arquivo: file });
      guard.allowNavigation(); methods.reset(); setFile(undefined);
      router.push("/financeiro");
    } catch (error) { methods.setError("root", { message: error instanceof Error ? error.message : "Não foi possível salvar. Seus dados foram preservados." }); }
  }
  function selectFile(selected?: File) {
    setFileError("");
    if (!selected) { setFile(undefined); return; }
    if (!/\.(pdf|jpe?g|png)$/i.test(selected.name) || selected.size > 10 * 1024 * 1024) { setFileError("Selecione PDF, JPG ou PNG de até 10 MB."); return; }
    setFile(selected);
  }
  const formValue = (key: keyof FormValues) => values[key] || "—";
  return <div className="min-h-screen bg-surface-muted p-4 text-foreground sm:p-6"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex items-center gap-3"><span className="rounded-lg bg-blue-600 p-3 text-white"><Wallet size={22}/></span><div><h1 className="text-xl font-bold">Novo Lançamento</h1><p className="text-sm text-foreground-muted">Registre receitas, despesas ou outras movimentações financeiras.</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => guard.requestNavigation("/financeiro")} className="flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-4 py-2.5 text-sm font-semibold"><X size={16}/>Cancelar</button><button form="finance-entry" type="submit" disabled={isSubmitting || units.isPending || units.isError} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{isSubmitting ? "Salvando…" : "Salvar Lançamento"}</button></div></header>
    <p className="text-xs text-foreground-muted">Cadastro e anexo ficam somente em memória nesta sessão. Recarregar a página descarta os registros locais. Não há envio ao servidor ou banco de dados.</p>
    {units.isError && <p role="alert" className="text-red-600">Não foi possível carregar unidades. <button type="button" onClick={() => units.refetch()} className="underline">Tentar novamente</button></p>}
    {errors.root && <p role="alert" className="rounded-lg border border-red-300 p-3 text-sm text-red-600 dark:text-red-300">{errors.root.message}</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><form id="finance-entry" noValidate onSubmit={methods.handleSubmit(submit)} className="min-w-0 space-y-6"><section className={card}><h2 className="mb-6 border-b border-line pb-3 font-bold text-blue-700 dark:text-blue-300">Dados do Lançamento</h2><div className="grid gap-5 md:grid-cols-2">
      <Field name="tipo" label="Tipo de lançamento *" error={errors.tipo?.message}><select {...attrs("tipo")}><option>Receita</option><option>Despesa</option></select></Field>
      <Field name="categoria" label="Categoria *" error={errors.categoria?.message}><input {...attrs("categoria")} list="finance-categories" maxLength={100} placeholder="Selecione ou informe uma categoria"/><datalist id="finance-categories">{[...new Set(["Vendas", "Operacional", ...(recent.data ?? []).map((e) => e.categoria)])].map((c) => <option key={c} value={c}/>)}</datalist></Field>
      <Field name="subcategoria" label="Subcategoria" error={errors.subcategoria?.message}><input {...attrs("subcategoria")} maxLength={100}/></Field>
      <Field name="descricao" label="Descrição *" error={errors.descricao?.message}><input {...attrs("descricao")} maxLength={200} placeholder="Ex.: Venda de bebidas - Cliente XYZ"/><p className="mt-1 text-right text-xs text-foreground-muted">{values.descricao?.length ?? 0}/200</p></Field>
      <Field name="valor" label="Valor (R$) *" error={errors.valor?.message}><input {...attrs("valor")} inputMode="decimal" placeholder="1.234,56"/></Field>
      <Field name="unidade" label="Unidade *" error={errors.unidade?.message}><select {...attrs("unidade")} disabled={units.isPending}><option value="">{units.isPending ? "Carregando…" : "Selecione a unidade"}</option>{(units.data ?? []).filter((u) => u.ativa !== false).map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}</select>{!units.isPending && !units.isError && !(units.data ?? []).some((u) => u.ativa !== false) && <p className="mt-1 text-xs text-foreground-muted">Nenhuma unidade ativa disponível.</p>}</Field>
      <Field name="contraparte" label="Contraparte *" error={errors.contraparte?.message}><input {...attrs("contraparte")} maxLength={200} placeholder="Fornecedor ou cliente"/></Field>
      <Field name="dataVencimento" label="Data de vencimento *" error={errors.dataVencimento?.message}><input type="date" {...attrs("dataVencimento")}/></Field>
      <Field name="dataLancamento" label="Data do lançamento *" error={errors.dataLancamento?.message}><input type="date" {...attrs("dataLancamento")}/></Field>
      <Field name="status" label="Status *" error={errors.status?.message}><select {...attrs("status")}><option value="Pendente">Pendente</option><option value="Realizado">{values.tipo === "Receita" ? "Recebido" : "Pago"} (realizado)</option></select></Field>
      <Field name="formaPagamento" label="Forma de pagamento/recebimento *" error={errors.formaPagamento?.message}><select {...attrs("formaPagamento")}>{["PIX", "Boleto", "Transferência", "Cartão", "Dinheiro"].map((f) => <option key={f}>{f}</option>)}</select></Field>
      <Field name="observacao" label="Observação" error={errors.observacao?.message}><textarea {...attrs("observacao")} rows={3} maxLength={500}/><p className="mt-1 text-right text-xs text-foreground-muted">{values.observacao?.length ?? 0}/500</p></Field>
    </div></section><section className={card}><h2 className="mb-3 font-bold">Documentos (opcional)</h2><div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files[0]); }} className="rounded-xl border-2 border-dashed border-line bg-surface-muted p-5"><label htmlFor="finance-file" className="mb-3 block text-sm">Arraste um arquivo ou selecione abaixo · PDF, JPG, PNG · até 10 MB</label><input id="finance-file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => selectFile(e.target.files?.[0])} className="w-full text-xs"/>{file && <p className="mt-3 break-all text-sm">{file.name} <button type="button" onClick={() => setFile(undefined)} className="ml-2 underline">Remover</button></p>}{fileError && <p role="alert" className="mt-2 text-sm text-red-600">{fileError}</p>}</div></section></form>
    <aside className="min-w-0 space-y-6"><section className={card}><h2 className="mb-4 font-bold">Resumo do Lançamento</h2><dl className="space-y-3 text-sm">{[["Tipo", formValue("tipo")], ["Categoria", formValue("categoria")], ["Descrição", formValue("descricao")], ["Valor (R$)", formValue("valor")], ["Unidade", units.data?.find((u) => u.id === values.unidade)?.nome ?? "—"], ["Contraparte", formValue("contraparte")], ["Lançamento", values.dataLancamento ? dateLabel(values.dataLancamento) : "—"], ["Vencimento", values.dataVencimento ? dateLabel(values.dataVencimento) : "—"], ["Status", formValue("status")], ["Forma", formValue("formaPagamento")]].map(([title, value]) => <div key={title} className="flex justify-between gap-3"><dt className="text-foreground-muted">{title}</dt><dd className="max-w-[60%] break-words text-right font-semibold">{value}</dd></div>)}</dl></section><section className={card}><h2 className="mb-3 font-bold">Informações importantes</h2><p className="text-xs leading-5 text-foreground-muted">Pendências alimentam contas e previsão por vencimento. Realizados compõem o saldo do período. O anexo permanece em memória junto ao lançamento, sem upload permanente. Não há histórico de auditoria financeira nesta entrega.</p></section><section className={card}><h2 className="mb-3 font-bold">Lançamentos recentes</h2>{recent.isPending ? <p role="status">Carregando…</p> : recent.isError ? <p role="alert">Não foi possível carregar os lançamentos.</p> : <ul className="space-y-3">{(recent.data ?? []).slice(0, 3).map((e) => <li key={e.id} className="border-b border-line pb-3 text-xs"><p className="font-semibold">{e.descricao}</p><p className="text-foreground-muted">{e.unidadeNome} · {dateLabel(e.dataLancamento)}</p><p className="mt-1 font-semibold">{money(e.valor)} · {e.tipo}</p>{e.demonstrativo && <span className="text-foreground-muted">Exemplo demonstrativo</span>}</li>)}</ul>}</section></aside></div>
  </div>{guard.dialog}</div>;
}

