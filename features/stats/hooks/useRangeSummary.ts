import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getRangeSummary } from '../api/statsApi';
import { statsKeys } from '../api/statsKeys';
import type { PeriodRange } from '../model/types';

type Options = {
  categoryId?: number;
  top?: number;
};

export function useRangeSummary(budgetId: number | null, range: PeriodRange | null, { categoryId, top = 20 }: Options = {}) {
  return useQuery({
    queryKey: budgetId != null && range
      ? statsKeys.range(budgetId, range, categoryId, top)
      : [...statsKeys.all, 'idle'],
    queryFn: () => getRangeSummary({ budgetId: budgetId!, ...range!, categoryId, top }),
    enabled: budgetId != null && range != null,
    // Switching ranges keeps the old numbers on screen until the new ones arrive.
    placeholderData: keepPreviousData,
  });
}
