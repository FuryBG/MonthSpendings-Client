import type { RangeCategory, RangePeriod } from './types';

export type Direction = 'up' | 'down' | 'flat';

export type Diff = {
  amount: number;          // a − b
  percent: number | null;  // relative to b; null when b is 0
  direction: Direction;
};

export function diff(a: number, b: number): Diff {
  const amount = a - b;
  const percent = b === 0 ? null : (amount / b) * 100;
  const direction: Direction = Math.abs(amount) < 0.005 ? 'flat' : amount > 0 ? 'up' : 'down';
  return { amount, percent, direction };
}

export type CategoryLine = {
  categoryId: number;
  name: string;
  isDeleted: boolean;
  amountA: number;
  share: number;
  amountB: number | null; // null when not comparing
  diff: Diff | null;
};

/** Joins category totals of two ranges; categories present in only one side get 0 on the other. */
export function mergeCategories(a: RangeCategory[], b?: RangeCategory[] | null): CategoryLine[] {
  if (!b) {
    return a.map(c => ({ ...c, amountA: c.amount, amountB: null, diff: null }));
  }

  const byId = new Map<number, CategoryLine>();
  for (const c of a) {
    byId.set(c.categoryId, { categoryId: c.categoryId, name: c.name, isDeleted: c.isDeleted, share: c.share, amountA: c.amount, amountB: 0, diff: null });
  }
  for (const c of b) {
    const line = byId.get(c.categoryId);
    if (line) line.amountB = c.amount;
    else byId.set(c.categoryId, { categoryId: c.categoryId, name: c.name, isDeleted: c.isDeleted, share: 0, amountA: 0, amountB: c.amount, diff: null });
  }
  return [...byId.values()].map(l => ({ ...l, diff: diff(l.amountA, l.amountB ?? 0) }));
}

export type CategorySort = 'amount' | 'change';

export function sortCategoryLines(lines: CategoryLine[], sort: CategorySort): CategoryLine[] {
  const sorted = [...lines];
  if (sort === 'change') sorted.sort((x, y) => Math.abs(y.diff?.amount ?? 0) - Math.abs(x.diff?.amount ?? 0));
  else sorted.sort((x, y) => Math.max(y.amountA, y.amountB ?? 0) - Math.max(x.amountA, x.amountB ?? 0));
  return sorted;
}

export type RangeSide = 'A' | 'B';

export type TimelinePoint = {
  index: number;       // position in the chart, oldest → newest
  period: RangePeriod;
  total: number;
  side: RangeSide;
};

/**
 * All periods of range A (and B, when comparing) on one chronological timeline.
 * There is deliberately no pairing between A and B periods: the user picks any two bars to compare.
 * A period in both ranges is shown once, as A.
 */
export function buildTimeline(a: RangePeriod[], b?: RangePeriod[] | null): TimelinePoint[] {
  const inA = new Set(a.map(p => p.periodId));
  const merged = [
    ...a.map(period => ({ period, side: 'A' as const })),
    ...(b ?? []).filter(p => !inA.has(p.periodId)).map(period => ({ period, side: 'B' as const })),
  ].sort((x, y) => new Date(x.period.startDate).getTime() - new Date(y.period.startDate).getTime());

  return merged.map((m, index) => ({ index, period: m.period, total: m.period.total, side: m.side }));
}

/** Average spent per period on one side of the timeline; null when that side has no bars. */
export function sideAverage(points: TimelinePoint[], side: RangeSide): number | null {
  const own = points.filter(p => p.side === side);
  return own.length === 0 ? null : own.reduce((sum, p) => sum + p.total, 0) / own.length;
}
