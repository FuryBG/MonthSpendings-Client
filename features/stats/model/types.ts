// DTOs returned by GET /api/statistics/range-summary (amounts are positive = money spent).

export type RangePeriod = {
  periodId: number;
  startDate: string;
  endDate: string | null;
  total: number;
};

export type RangeCategory = {
  categoryId: number;
  name: string;
  isDeleted: boolean;
  amount: number;
  share: number; // % of the range total
};

export type RangeSpending = {
  id: number;
  amount: number;
  description: string | null;
  categoryId: number;
  categoryName: string;
  date: string;
};

export type RangeSummary = {
  startDate: string;
  endDate: string | null;
  total: number;
  averagePerPeriod: number;
  periods: RangePeriod[];
  categories: RangeCategory[];
  topSpendings: RangeSpending[];
};

// ── Selection ────────────────────────────────────────────────────────────────

/** A contiguous run of budget periods, identified by its first and last period. */
export type PeriodRange = {
  fromPeriodId: number;
  toPeriodId: number;
};

export type RangePreset = 'current' | 'last3' | 'last6' | 'last12';

export type RangeSelection =
  | { kind: 'preset'; preset: RangePreset }
  | { kind: 'custom'; range: PeriodRange };

/** A selection resolved against the budget's periods. */
export type ResolvedRange = PeriodRange & {
  startIndex: number; // index into periods sorted oldest → newest
  endIndex: number;
  count: number;
  label: string;
};
