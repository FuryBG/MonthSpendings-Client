import type { BudgetPeriod } from '@/types/Types';
import { formatShortSpan } from './format';
import type { PeriodRange, RangePreset, RangeSelection, ResolvedRange } from './types';

export const PRESETS: { preset: RangePreset; label: string; count: number }[] = [
  { preset: 'current', label: 'This period', count: 1 },
  { preset: 'last3', label: 'Last 3', count: 3 },
  { preset: 'last6', label: 'Last 6', count: 6 },
  { preset: 'last12', label: 'Last 12', count: 12 },
];

export const DEFAULT_SELECTION: RangeSelection = { kind: 'preset', preset: 'current' };

/** Budget periods sorted oldest → newest (the API returns them newest first). */
export function sortPeriods(periods: BudgetPeriod[]): BudgetPeriod[] {
  return [...periods].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

function build(periods: BudgetPeriod[], startIndex: number, endIndex: number, label: string): ResolvedRange {
  return {
    fromPeriodId: periods[startIndex].id,
    toPeriodId: periods[endIndex].id,
    startIndex,
    endIndex,
    count: endIndex - startIndex + 1,
    label,
  };
}

export function rangeFromIndices(periods: BudgetPeriod[], a: number, b: number): ResolvedRange {
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  return build(periods, start, end, labelForIndices(periods, start, end));
}

function labelForIndices(periods: BudgetPeriod[], start: number, end: number): string {
  const last = periods.length - 1;
  const count = end - start + 1;
  if (end === last) return count === 1 ? 'This period' : `Last ${count} periods`;
  // Past ranges are named by their dates, so A and B are never ambiguous.
  return formatShortSpan(periods[start].startDate, periods[end].endDate);
}

export function resolveSelection(selection: RangeSelection, periods: BudgetPeriod[]): ResolvedRange | null {
  if (periods.length === 0) return null;
  const last = periods.length - 1;

  if (selection.kind === 'preset') {
    const count = PRESETS.find(p => p.preset === selection.preset)?.count ?? 1;
    return rangeFromIndices(periods, Math.max(0, last - count + 1), last);
  }

  const from = periods.findIndex(p => p.id === selection.range.fromPeriodId);
  const to = periods.findIndex(p => p.id === selection.range.toPeriodId);
  if (from < 0 || to < 0) return null;
  return rangeFromIndices(periods, from, to);
}

/** The same number of periods right before the range (fewer if history is shorter). */
export function previousRange(range: ResolvedRange, periods: BudgetPeriod[]): ResolvedRange | null {
  if (range.startIndex === 0) return null;
  const end = range.startIndex - 1;
  const start = Math.max(0, end - range.count + 1);
  return rangeFromIndices(periods, start, end);
}

/** The same periods shifted ~a year back (12 periods), if that much history exists. */
export function yearEarlierRange(range: ResolvedRange, periods: BudgetPeriod[]): ResolvedRange | null {
  const shift = 12;
  if (range.startIndex - shift < 0) return null;
  return rangeFromIndices(periods, range.startIndex - shift, range.endIndex - shift);
}

export function selectionFromRange(range: PeriodRange): RangeSelection {
  return { kind: 'custom', range: { fromPeriodId: range.fromPeriodId, toPeriodId: range.toPeriodId } };
}

export function isPresetSelected(selection: RangeSelection, preset: RangePreset): boolean {
  return selection.kind === 'preset' && selection.preset === preset;
}
