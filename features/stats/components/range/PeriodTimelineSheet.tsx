import { BottomSheet, BottomSheetRef } from '@/components/BottomSheet';
import { MaskedAmount } from '@/components/MaskedAmount';
import type { BudgetPeriod } from '@/types/Types';
import * as Haptics from 'expo-haptics';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatMoney, formatSpan, pluralPeriods } from '../../model/format';
import { rangeFromIndices } from '../../model/ranges';
import type { ResolvedRange } from '../../model/types';
import { useStatsColors } from '../primitives/useStatsColors';

type Props = {
  visible: boolean;
  title: string;
  periods: BudgetPeriod[];               // oldest → newest
  totalsById: Map<number, number>;       // spent per period, for context
  symbol: string;
  initial: ResolvedRange | null;
  onConfirm: (range: ResolvedRange) => void;
  onClose: () => void;
};

type Draft = { start: number; end: number };

/**
 * Range picker: tap one period, then another, and everything between them is selected.
 * Tapping again after a range is complete starts a new one. "Show N periods" applies it.
 */
export function PeriodTimelineSheet({ visible, title, periods, totalsById, symbol, initial, onConfirm, onClose }: Props) {
  const c = useStatsColors();
  const sheetRef = useRef<BottomSheetRef>(null);
  const [touched, setTouched] = useState<Draft | null>(null);

  // Until the user taps, the sheet shows the range that is currently applied.
  const draft: Draft | null = touched ?? (initial ? { start: initial.startIndex, end: initial.endIndex } : null);
  const lo = draft ? Math.min(draft.start, draft.end) : -1;
  const hi = draft ? Math.max(draft.start, draft.end) : -1;
  const waitingForEnd = touched != null && touched.start === touched.end;

  const rows = useMemo(() => periods.map((p, index) => ({ period: p, index })).reverse(), [periods]);
  const maxTotal = useMemo(() => Math.max(1, ...totalsById.values()), [totalsById]);

  const selectedTotal = useMemo(() => {
    let sum = 0;
    for (let i = lo; i >= 0 && i <= hi; i++) sum += totalsById.get(periods[i].id) ?? 0;
    return sum;
  }, [lo, hi, periods, totalsById]);

  const handlePress = (index: number) => {
    Haptics.selectionAsync().catch(() => {});
    setTouched(waitingForEnd ? { start: touched!.start, end: index } : { start: index, end: index });
  };

  const apply = () => {
    if (!draft) return;
    const range = rangeFromIndices(periods, draft.start, draft.end);
    sheetRef.current?.close(() => onConfirm(range));
  };

  const hint = waitingForEnd
    ? 'Now tap the other end of the range.'
    : 'Tap a period, then another one. Everything between them is included.';

  return (
    <BottomSheet ref={sheetRef} visible={visible} onClose={(done) => { setTouched(null); onClose(); done?.(); }} panelStyle={s.panel}>
      <Text style={[s.title, { color: c.text }]}>{title}</Text>
      <Text style={[s.hint, { color: c.muted }]}>{hint}</Text>

      <FlatList
        data={rows}
        keyExtractor={r => String(r.period.id)}
        style={s.list}
        renderItem={({ item: { period, index } }) => {
          const selected = index >= lo && index <= hi;
          // Rows are newest first, so the top of the block is the range's last period.
          const isTop = index === hi;
          const isBottom = index === lo;
          const total = totalsById.get(period.id) ?? 0;
          return (
            <Pressable
              onPress={() => handlePress(index)}
              style={({ pressed }) => [
                s.row,
                selected && { backgroundColor: c.surfaceRaised, borderColor: c.accent },
                selected && !isTop && s.joinTop,
                selected && !isBottom && s.joinBottom,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View style={[s.marker, { backgroundColor: selected ? c.accent : c.track }]} />
              <View style={s.rowText}>
                <Text style={[s.dates, { color: c.text }]}>{formatSpan(period.startDate, period.endDate)}</Text>
                <View style={[s.track, { backgroundColor: c.track }]}>
                  <View style={[s.fill, { width: `${(total / maxTotal) * 100}%`, backgroundColor: selected ? c.accent : c.faint }]} />
                </View>
              </View>
              <MaskedAmount value={formatMoney(total, symbol, { compact: true })} style={[s.amount, { color: selected ? c.text : c.muted }]} />
            </Pressable>
          );
        }}
      />

      {draft ? (
        <View style={[s.footer, { borderColor: c.border }]}>
          <View style={s.summary}>
            <Text style={[s.summaryTitle, { color: c.text }]}>{pluralPeriods(hi - lo + 1)}</Text>
            <Text style={[s.summaryDetail, { color: c.muted }]} numberOfLines={1}>
              {formatSpan(periods[lo].startDate, periods[hi].endDate)}
            </Text>
          </View>
          <MaskedAmount value={formatMoney(selectedTotal, symbol, { compact: true })} style={[s.summaryAmount, { color: c.text }]} />
        </View>
      ) : null}

      <Pressable
        onPress={apply}
        disabled={!draft || waitingForEnd}
        style={({ pressed }) => [s.apply, { backgroundColor: c.accent, opacity: !draft || waitingForEnd ? 0.4 : pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
      >
        <Text style={[s.applyText, { color: c.onAccent }]}>
          {waitingForEnd ? 'Pick the other end' : `Show ${pluralPeriods(hi - lo + 1)}`}
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  panel: { maxHeight: '85%' },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  hint: { fontSize: 14, lineHeight: 19, marginBottom: 6 },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  // Adjacent selected rows merge into one continuous block.
  joinTop: { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: 0 },
  joinBottom: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0, marginBottom: 0 },
  marker: { width: 4, alignSelf: 'stretch', marginVertical: 10, borderRadius: 2 },
  rowText: { flex: 1, gap: 6 },
  dates: { fontSize: 15, fontWeight: '600' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  amount: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  summary: { flex: 1, gap: 2 },
  summaryTitle: { fontSize: 15, fontWeight: '700' },
  summaryDetail: { fontSize: 13 },
  summaryAmount: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  apply: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  applyText: { fontSize: 15, fontWeight: '700' },
});
