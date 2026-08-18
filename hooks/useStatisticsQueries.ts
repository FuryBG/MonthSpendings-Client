import { getPeriodComparison, getPeriodsHistory } from '@/app/services/api';
import { useQuery } from '@tanstack/react-query';

export const usePeriodComparisonQuery = (budgetId: number | null) =>
  useQuery({
    queryKey: ['period-comparison', budgetId],
    queryFn: () => getPeriodComparison(budgetId!),
    enabled: budgetId != null,
  });

export const usePeriodsHistoryQuery = (budgetId: number | null) =>
  useQuery({
    queryKey: ['periods-history', budgetId],
    queryFn: () => getPeriodsHistory(budgetId!),
    enabled: budgetId != null,
  });
