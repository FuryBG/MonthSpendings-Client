import type { PeriodRange } from '../model/types';

export const statsKeys = {
  all: ['stats'] as const,
  range: (budgetId: number, range: PeriodRange, categoryId?: number, top?: number) =>
    ['stats', 'range', budgetId, range.fromPeriodId, range.toPeriodId, categoryId ?? null, top ?? null] as const,
};
