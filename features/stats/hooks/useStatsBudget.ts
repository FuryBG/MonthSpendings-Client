import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { useEffect, useMemo } from 'react';
import { sortPeriods } from '../model/ranges';
import { useStatsSelection } from '../state/useStatsSelection';

/** The selected budget with its periods sorted oldest → newest. */
export function useStatsBudget() {
  const budgetId = useBudgetUIStore(s => s.selectedMainBudgetId);
  const { data: budgets = [], isLoading } = useBudgetsQuery();
  const syncBudget = useStatsSelection(s => s.syncBudget);

  useEffect(() => { syncBudget(budgetId); }, [budgetId, syncBudget]);

  const budget = budgets.find(b => b.id === budgetId) ?? null;
  const periods = useMemo(() => sortPeriods(budget?.budgetPeriods ?? []), [budget?.budgetPeriods]);

  return {
    budgetId,
    budget,
    periods,
    symbol: budget?.currency?.symbol ?? '€',
    isLoading,
  };
}
