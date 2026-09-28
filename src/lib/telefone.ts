/** Só os dígitos, sem o 55 da frente. */
export function soDigitos(t: string): string {
  let d = (t || "").replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  return d.slice(0, 11);
}

/** Vai formatando enquanto a pessoa digita: (14) 99999-0000 */
export function formatarEnquantoDigita(t: string): string {
  const d = soDigitos(t);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function telefoneValido(t: string): boolean {
  const d = soDigitos(t);
  return d.length === 10 || d.length === 11;
}

/** Para mostrar um número já guardado. */
export function formatarTelefone(t: string | null): string {
  if (!t) return "";
  return formatarEnquantoDigita(t);
}

export const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro"
];

/**
 * Monta a data de aniversário.
 *
 * Guardamos sempre no ano 2000 de propósito: a loja precisa do dia
 * e do mês para parabenizar, e ninguém gosta de informar a idade.
 * 2000 é bissexto, então 29 de fevereiro também funciona.
 */
export function montarAniversario(dia: string, mes: string): string | null {
  const d = Number(dia);
  const m = Number(mes);
  if (!d || !m) return null;
  const limite = new Date(2000, m, 0).getDate();
  if (d < 1 || d > limite) return null;
  return `2000-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
