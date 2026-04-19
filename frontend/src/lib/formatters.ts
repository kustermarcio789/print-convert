/**
 * Formatadores unificados (Brasil: dot=milhar, comma=decimal).
 */

export function fmtBRL(valor: number | string | null | undefined): string {
  const n = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (n === null || n === undefined || Number.isNaN(n)) {
    return 'R$ 0,00';
  }
  return `R$ ${Number(n).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtNumber(valor: number | string | null | undefined, decimals = 2): string {
  const n = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (n === null || n === undefined || Number.isNaN(n)) return '0';
  return Number(n).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtDateBR(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

export function fmtDateTimeBR(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
