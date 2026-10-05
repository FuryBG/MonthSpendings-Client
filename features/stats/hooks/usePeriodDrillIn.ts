import { useState } from 'react';
import type { RangeSummary } from '../model/types';
import { useRangeSummary } from './useRangeSummary';

type Options = {
  categoryId?: number;
  top?: number;
};

/**
 * Tapping a bar pins one period. When not comparing, the sections below the chart
 * (categories, biggest spendings) switch to that single period.
 */
export function usePeriodDrillIn(
  budgetId: number | null,
  summaryA: RangeSummary | undefined,
  summaryB: RangeSummary | null | undefined,
  options: Options = {},
) {
  const [pinnedId, setPinnedId] = useState<number | null>(null);

  // A pin from a previous range is ignored rather than cleared, so no effect is needed.
  const inView = pinnedId != null && [...(summaryA?.periods ?? []), ...(summaryB?.periods ?? [])].some(p => p.periodId === pinnedId);
  const pinnedPeriodId = inView ? pinnedId : null;

  const drillPeriod = !summaryB && pinnedPeriodId != null ? summaryA?.periods.find(p => p.periodId === pinnedPeriodId) ?? null : null;
  const detail = useRangeSummary(
    budgetId,
    drillPeriod ? { fromPeriodId: drillPeriod.periodId, toPeriodId: drillPeriod.periodId } : null,
    options,
  );

  // Until the period's own numbers arrive, keep showing what we have (dimmed by the caller).
  const sectionSummary = drillPeriod ? detail.data ?? summaryA : summaryA;
  const sectionStale = drillPeriod != null && (detail.data == null || detail.isPlaceholderData);

  return { pinnedPeriodId, setPinnedPeriodId: setPinnedId, drillPeriod, sectionSummary, sectionStale };
}
