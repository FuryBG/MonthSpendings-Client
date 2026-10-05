import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SectionHeader } from '../components/primitives/SectionHeader';
import { StatCard } from '../components/primitives/StatCard';
import { useStatsColors } from '../components/primitives/useStatsColors';
import { SpendingDetailSheet } from '../components/SpendingDetailSheet';
import { TopSpendingsList } from '../components/TopSpendingsList';
import { COMPARE_A_COLOR, COMPARE_B_COLOR } from '../model/palette';
import type { RangeSpending, RangeSummary, ResolvedRange } from '../model/types';

type Props = {
  summaryA: RangeSummary;
  summaryB?: RangeSummary | null;
  rangeA: ResolvedRange;
  rangeB?: ResolvedRange | null;
  symbol: string;
  initialCount?: number;
  hideCategory?: boolean;
  /** Set when the section shows one pinned period instead of the whole range. */
  scopeLabel?: string;
};

export function TopSpendingsSection({ summaryA, summaryB, rangeA, rangeB, symbol, initialCount = 5, hideCategory, scopeLabel }: Props) {
  const c = useStatsColors();
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<RangeSpending | null>(null);
  const compare = summaryB != null && rangeB != null;

  const count = expanded ? summaryA.topSpendings.length : initialCount;
  const canExpand = summaryA.topSpendings.length > initialCount || (summaryB?.topSpendings.length ?? 0) > initialCount;

  const group = (label: string | null, color: string, spendings: RangeSpending[]) => (
    <View style={s.group}>
      {label ? (
        <View style={s.groupLabel}>
          <View style={[s.dot, { backgroundColor: color }]} />
          <Text style={[s.groupText, { color: c.muted }]}>{label}</Text>
        </View>
      ) : null}
      {spendings.length === 0
        ? <Text style={[s.empty, { color: c.muted }]}>Nothing spent in this range yet.</Text>
        : <TopSpendingsList spendings={spendings.slice(0, count)} symbol={symbol} onPress={setSelected} hideCategory={hideCategory} />}
    </View>
  );

  return (
    <StatCard>
      <SectionHeader
        title="Biggest spendings"
        subtitle={scopeLabel}
        actionLabel={canExpand ? (expanded ? 'Show fewer' : 'Show more') : undefined}
        onAction={canExpand ? () => setExpanded(e => !e) : undefined}
      />

      {group(compare ? rangeA.label : null, COMPARE_A_COLOR, summaryA.topSpendings)}
      {compare ? group(rangeB!.label, COMPARE_B_COLOR, summaryB!.topSpendings) : null}

      <SpendingDetailSheet spending={selected} symbol={symbol} onClose={() => setSelected(null)} />
    </StatCard>
  );
}

const s = StyleSheet.create({
  group: { gap: 4 },
  groupLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  groupText: { fontSize: 13, fontWeight: '600' },
  empty: { fontSize: 14, paddingVertical: 8 },
});
