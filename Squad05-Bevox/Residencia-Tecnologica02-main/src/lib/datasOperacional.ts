/** Soma (ou subtrai) dias de uma data AAAA-MM-DD. */
export function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Ex.: "17 de abril de 2026". */
export function formatarDataLonga(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${data}T12:00:00Z`));
}

/** Ex.: "18/04/2026". */
export function formatarDataCurta(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}