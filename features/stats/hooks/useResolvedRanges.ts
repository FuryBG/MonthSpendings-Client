import type { BudgetPeriod } from '@/types/Types';
import { useMemo } from 'react';
import { DEFAULT_SELECTION, resolveSelection } from '../model/ranges';
import { useStatsSelection } from '../state/useStatsSelection';
import { useTranslation } from 'react-i18next';

/** Range A and (optional) range B resolved against the budget's periods. */
export function useResolvedRanges(periods: BudgetPeriod[]) {
  const selectionA = useStatsSelection(s => s.selectionA);
  const selectionB = useStatsSelection(s => s.selectionB);
  const { i18n } = useTranslation();

  return useMemo(() => {
    // A custom range can point at periods that no longer exist; fall back to "This period".
    const rangeA = resolveSelection(selectionA, periods) ?? resolveSelection(DEFAULT_SELECTION, periods);
    const rangeB = selectionB ? resolveSelection(selectionB, periods) : null;
    return { rangeA, rangeB, selectionA, selectionB };
  }, [periods, selectionA, selectionB, i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps
}
