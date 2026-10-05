import api from '@/app/services/api';
import type { PeriodRange, RangeSummary } from '../model/types';

export type RangeSummaryParams = PeriodRange & {
  budgetId: number;
  categoryId?: number;
  top?: number;
};

export const getRangeSummary = async ({ budgetId, fromPeriodId, toPeriodId, categoryId, top }: RangeSummaryParams): Promise<RangeSummary> => {
  const response = await api.get('/api/statistics/range-summary', {
    params: { budgetId, fromPeriodId, toPeriodId, categoryId, top },
  });
  return response.data;
};
