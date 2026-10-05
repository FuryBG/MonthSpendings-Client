import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CategoryDonut } from '../components/charts/CategoryDonut';
import { CategoryList } from '../components/CategoryList';
import { RangeLegend } from '../components/primitives/RangeLegend';
import { SectionHeader } from '../components/primitives/SectionHeader';
import { StatCard } from '../components/primitives/StatCard';
import { useStatsColors } from '../components/primitives/useStatsColors';
import { CategoryLine, CategorySort, mergeCategories, sortCategoryLines } from '../model/compare';
import type { RangeSummary, ResolvedRange } from '../model/types';

type Props = {
  summaryA: RangeSummary;
  summaryB?: RangeSummary | null;
  rangeA: ResolvedRange;
  rangeB?: ResolvedRange | null;
  symbol: string;
  /** Set when the section shows one pinned period instead of the whole range, e.g. "28 May – 27 Jun". */
  scopeLabel?: string;
  onOpenCategory: (line: CategoryLine) => void;
};

export function CategoriesSection({ summaryA, summaryB, rangeA, rangeB, symbol, scopeLabel, onOpenCategory }: Props) {
  const c = useStatsColors();
  const compare = summaryB != null;
  const [sort, setSort] = useState<CategorySort>('amount');
  const [focusedId, setFocusedId] = useState<number | null>(null);

  const lines = useMemo(
    () => sortCategoryLines(mergeCategories(summaryA.categories, summaryB?.categories), compare ? sort : 'amount'),
    [summaryA, summaryB, compare, sort],
  );

  return (
    <StatCard>
      <SectionHeader
        title="By category"
        subtitle={compare ? (sort === 'change' ? 'Sorted by biggest change' : 'Sorted by amount') : scopeLabel}
        actionLabel={compare ? (sort === 'change' ? 'Sort by amount' : 'Sort by change') : undefined}
        onAction={compare ? () => setSort(sort === 'change' ? 'amount' : 'change') : undefined}
      />

      {compare && rangeB ? (
        <View style={s.legend}>
          <RangeLegend labelA={rangeA.label} labelB={rangeB.label} />
        </View>
      ) : null}

      {lines.length === 0 ? (
        <Text style={[s.empty, { color: c.muted }]}>Nothing spent in this range yet.</Text>
      ) : (
        <>
          {!compare ? (
            <View style={s.donut}>
              <CategoryDonut categories={summaryA.categories} total={summaryA.total} symbol={symbol} focusedId={focusedId} />
            </View>
          ) : null}
          <CategoryList
            lines={lines}
            symbol={symbol}
            focusedId={focusedId}
            onPress={onOpenCategory}
            onFocusChange={compare ? undefined : setFocusedId}
          />
        </>
      )}
    </StatCard>
  );
}

const s = StyleSheet.create({
  legend: { marginTop: -4, marginBottom: 8 },
  donut: { marginBottom: 12 },
  empty: { fontSize: 14, paddingVertical: 8 },
});
