import type { BudgetPeriod } from '@/types/Types';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useStatsColors } from '../components/primitives/useStatsColors';
import { CompareHeader } from '../components/range/CompareHeader';
import { CompareSheet } from '../components/range/CompareSheet';
import { PeriodTimelineSheet } from '../components/range/PeriodTimelineSheet';
import { RangePresetChips } from '../components/range/RangePresetChips';
import { formatSpan, pluralPeriods } from '../model/format';
import { previousRange, resolveSelection, selectionFromRange, yearEarlierRange } from '../model/ranges';
import type { RangeSelection, ResolvedRange } from '../model/types';
import { useStatsSelection } from '../state/useStatsSelection';

type Props = {
  periods: BudgetPeriod[];
  symbol: string;
  totalsById: Map<number, number>;
  rangeA: ResolvedRange;
  rangeB: ResolvedRange | null;
  compareOpen: boolean;
  onCompareOpenChange: (open: boolean) => void;
};

/** Sticky range controls: presets, custom picker, and the compare flow. */
export function RangeBar({ periods, symbol, totalsById, rangeA, rangeB, compareOpen, onCompareOpenChange }: Props) {
  const c = useStatsColors();
  const selectionA = useStatsSelection(s => s.selectionA);
  const setA = useStatsSelection(s => s.setA);
  const setB = useStatsSelection(s => s.setB);
  const [pickerFor, setPickerFor] = useState<'A' | 'B' | null>(null);

  // While comparing, B follows A: it becomes the same number of periods right before the new A.
  const changeA = (selection: RangeSelection) => {
    setA(selection);
    if (!rangeB) return;
    const nextA = resolveSelection(selection, periods);
    const nextB = nextA ? previousRange(nextA, periods) : null;
    setB(nextB ? selectionFromRange(nextB) : null);
  };

  const span = formatSpan(periods[rangeA.startIndex].startDate, periods[rangeA.endIndex].endDate);

  return (
    <View style={s.root}>
      <RangePresetChips selection={selectionA} onSelect={changeA} onCustom={() => setPickerFor('A')} />

      {rangeB ? (
        <CompareHeader rangeA={rangeA} rangeB={rangeB} onEditB={() => onCompareOpenChange(true)} onClose={() => setB(null)} />
      ) : (
        <Text style={[s.span, { color: c.muted }]}>
          {pluralPeriods(rangeA.count)}, {span}
        </Text>
      )}

      <CompareSheet
        visible={compareOpen}
        periods={periods}
        rangeA={rangeA}
        previous={previousRange(rangeA, periods)}
        yearEarlier={yearEarlierRange(rangeA, periods)}
        onPick={(range) => setB(selectionFromRange(range))}
        onCustom={() => setPickerFor('B')}
        onClose={() => onCompareOpenChange(false)}
      />

      <PeriodTimelineSheet
        visible={pickerFor != null}
        title={pickerFor === 'B' ? 'Compare with which periods?' : 'Choose periods'}
        periods={periods}
        totalsById={totalsById}
        symbol={symbol}
        initial={pickerFor === 'B' ? rangeB : rangeA}
        onConfirm={(range) => (pickerFor === 'B' ? setB : changeA)(selectionFromRange(range))}
        onClose={() => setPickerFor(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 10, paddingBottom: 12 },
  span: { fontSize: 13, paddingHorizontal: 2 },
});
