const LOCALE = 'en-GB';

type MoneyOptions = {
  /** Shorten large values: 12 400 → 12.4k */
  compact?: boolean;
  /** Prefix + / − */
  signed?: boolean;
};

export function formatMoney(amount: number, symbol: string, { compact = false, signed = false }: MoneyOptions = {}): string {
  const abs = Math.abs(amount);
  const sign = signed ? (amount > 0 ? '+' : amount < 0 ? '−' : '') : amount < 0 ? '−' : '';

  let body: string;
  if (compact && abs >= 10_000) {
    body = `${(abs / 1000).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}k`;
  } else if (compact && abs >= 1000) {
    body = abs.toLocaleString(LOCALE, { maximumFractionDigits: 0 });
  } else {
    body = abs.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return `${sign}${symbol}${body}`;
}

export function formatPercent(percent: number | null, { signed = true } = {}): string {
  if (percent == null || !Number.isFinite(percent)) return '—';
  const abs = Math.abs(percent);
  const digits = abs >= 100 ? 0 : 1;
  const sign = signed ? (percent > 0 ? '+' : percent < 0 ? '−' : '') : '';
  return `${sign}${abs.toFixed(digits)}%`;
}

/** Tight labels under chart bars: €850, €3.2k, €12k. */
export function formatMoneyTiny(amount: number, symbol: string): string {
  const abs = Math.abs(amount);
  if (abs < 1000) return `${symbol}${Math.round(abs)}`;
  const k = abs / 1000;
  return `${symbol}${k.toLocaleString(LOCALE, { maximumFractionDigits: k >= 10 ? 0 : 1 })}k`;
}

export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { month: 'short' });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "3 Oct – 2 Nov 2025", "3 Oct 2025 – now" */
export function formatSpan(startIso: string, endIso: string | null): string {
  const start = new Date(startIso);
  if (!endIso) return `${start.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })} – now`;

  const end = new Date(endIso);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startText = start.toLocaleDateString(LOCALE, sameYear
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' });
  const endText = end.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
  return `${startText} – ${endText}`;
}

/** Compact span for labels: "25 Jul – 24 Sept", with years only when not the current year. */
export function formatShortSpan(startIso: string, endIso: string | null): string {
  const thisYear = new Date().getFullYear();
  const part = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(LOCALE, d.getFullYear() === thisYear
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: '2-digit' });
  };
  return `${part(startIso)} – ${endIso ? part(endIso) : 'now'}`;
}

export function pluralPeriods(count: number): string {
  return count === 1 ? '1 period' : `${count} periods`;
}
