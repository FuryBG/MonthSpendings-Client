import { MaskedAmount } from '@/components/MaskedAmount';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { PeriodBarChart } from '../components/charts/PeriodBarChart';
import { DiffChip } from '../components/primitives/DiffChip';
import { RangeLegend } from '../components/primitives/RangeLegend';
import { StatCard } from '../components/primitives/StatCard';
import { useStatsColors } from '../components/primitives/useStatsColors';
import { buildTimeline, diff, sideAverage } from '../model/compare';
import { formatMoney, formatSpan } from '../model/format';
import { COMPARE_A_COLOR, COMPARE_B_COLOR } from '../model/palette';
import type { RangeSummary, ResolvedRange } from '../model/types';

type Props = {
  summaryA: RangeSummary;
  summaryB?: RangeSummary | null;
  rangeA: ResolvedRange;
  rangeB?: ResolvedRange | null;
  symbol: string;
  /** Shown above the number instead of the range label (e.g. a category name). */
  title?: string;
  onCompare?: () => void;
  /** Period pinned by tapping a bar (owned by the screen so other sections can follow it). */
  pinnedPeriodId: number | null;
  onPinPeriod: (periodId: number | null) => void;
  /** Text next to "Show all" while a bar is pinned, e.g. what the rest of the screen now shows. */
  pinnedHint?: string;
};

/**
 * The hero: total for the range plus the per-period chart.
 * Scrubbing the chart turns the big number into that period's value.
 */
export function TotalSection({ summaryA, summaryB, rangeA, rangeB, symbol, title, onCompare, pinnedPeriodId, onPinPeriod, pinnedHint }: Props) {
  const c = useStatsColors();
  const compare = summaryB != null && rangeB != null;
  const points = useMemo(() => buildTimeline(summaryA.periods, compare ? summaryB!.periods : null), [summaryA, summaryB, compare]);

  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const pinnedAt = points.findIndex(p => p.period.periodId === pinnedPeriodId);
  const pinnedIndex = pinnedAt >= 0 ? pinnedAt : null;
  const pin = (index: number | null) => onPinPeriod(index == null ? null : points[index]?.period.periodId ?? null);
  const selectedIndex = scrubIndex ?? pinnedIndex;
  const point = selectedIndex != null ? points[selectedIndex] : undefined;

  const showChart = points.length > 1;
  const isOpen = summaryA.endDate == null;

  // Big number: the selected bar's period, otherwise range A's total.
  const value = point ? point.total : summaryA.total;
  const valueColor = !compare ? null : point?.side === 'B' ? COMPARE_B_COLOR : COMPARE_A_COLOR;

  const caption = point
    ? formatSpan(point.period.startDate, point.period.endDate)
    : title ?? (isOpen && rangeA.count === 1 ? 'This period so far' : rangeA.label);

  const subline = point
    ? `Period ${point.index + 1} of ${points.length}`
    : rangeA.count > 1
      ? `${formatMoney(summaryA.averagePerPeriod, symbol)} per period on average`
      : formatSpan(summaryA.startDate, summaryA.endDate);

  // Second row in compare mode: B's total, or, for a selected bar, the other range's average.
  const otherSide = point?.side === 'B' ? 'A' : 'B';
  const otherAverage = compare && point ? sideAverage(points, otherSide) : null;
  const otherRange = otherSide === 'A' ? rangeA : rangeB;

  return (
    <StatCard style={s.card}>
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={[s.caption, { color: c.muted }]} numberOfLines={1}>{caption}</Text>
          <View style={s.valueRow}>
            {valueColor ? <View style={[s.dot, { backgroundColor: valueColor }]} /> : null}
            <MaskedAmount value={formatMoney(value, symbol)} style={[s.value, { color: c.text }]} adjustsFontSizeToFit numberOfLines={1} />
          </View>
        </View>

        {onCompare && !compare ? (
          <Pressable
            onPress={onCompare}
            style={({ pressed }) => [s.compareBtn, { borderColor: c.border, backgroundColor: c.surfaceRaised }, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
          >
            <Icon source="compare-horizontal" size={16} color={c.text} />
            <Text style={[s.compareText, { color: c.text }]}>Compare</Text>
          </Pressable>
        ) : null}
      </View>

      {!compare ? (
        <Text style={[s.subline, { color: c.muted }]}>{subline}</Text>
      ) : point && otherAverage != null && otherRange ? (
        <View>
          <View style={s.bRow}>
            <View style={[s.dot, { backgroundColor: otherSide === 'A' ? COMPARE_A_COLOR : COMPARE_B_COLOR }]} />
            <MaskedAmount value={formatMoney(otherAverage, symbol)} style={[s.valueB, { color: c.muted }]} />
            <DiffChip diff={diff(point.total, otherAverage)} symbol={symbol} />
          </View>
          <Text style={[s.bSpan, { color: c.muted }]}>average per period in {otherRange.label}</Text>
        </View>
      ) : (
        <View style={s.bRow}>
          <View style={[s.dot, { backgroundColor: COMPARE_B_COLOR }]} />
          <MaskedAmount value={formatMoney(summaryB!.total, symbol)} style={[s.valueB, { color: c.muted }]} />
          <DiffChip diff={diff(summaryA.total, summaryB!.total)} symbol={symbol} />
        </View>
      )}

      {showChart ? (
        <View style={s.chart}>
          {compare ? (
            <View style={s.legend}>
              <RangeLegend labelA={rangeA.label} labelB={rangeB!.label} />
            </View>
          ) : null}
          <PeriodBarChart
            points={points}
            compare={compare}
            selectedIndex={selectedIndex}
            onScrub={setScrubIndex}
            onRelease={(index) => { setScrubIndex(null); pin(index); }}
            onTap={(index) => pin(pinnedIndex === index ? null : index)}
            symbol={symbol}
          />
          {pinnedIndex != null && scrubIndex == null ? (
            <View style={s.pinnedRow}>
              <Text style={[s.pinnedHint, { color: c.muted }]} numberOfLines={1}>{pinnedHint ?? ''}</Text>
              <Pressable onPress={() => pin(null)} hitSlop={10} style={s.clear} accessibilityLabel="Show the whole range">
                <Text style={[s.clearText, { color: c.muted }]}>Show all</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[s.hint, { color: c.faint }]}>{scrubIndex == null ? 'Tap a period or slide across the bars' : ' '}</Text>
          )}
        </View>
      ) : null}
    </StatCard>
  );
}

const s = StyleSheet.create({
  card: { paddingBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 2 },
  caption: { fontSize: 14, fontWeight: '500' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 40, fontWeight: '700', letterSpacing: -1.4, fontVariant: ['tabular-nums'], flexShrink: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  compareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1 },
  compareText: { fontSize: 13, fontWeight: '600' },
  bRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  valueB: { fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
  subline: { fontSize: 14, marginTop: 2 },
  chart: { marginTop: 18 },
  legend: { marginBottom: 10 },
  bSpan: { fontSize: 13, marginTop: 2, marginLeft: 18 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  pinnedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  pinnedHint: { fontSize: 13, flex: 1 },
  clear: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 4 },
  clearText: { fontSize: 13, fontWeight: '600' },
});
