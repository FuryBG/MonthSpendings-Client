import { ScreenContainer } from '@/components/ScreenContainer';
import { Stack, useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/primitives/EmptyState';
import { SkeletonCard } from '../components/primitives/SkeletonCard';
import { useStatsColors } from '../components/primitives/useStatsColors';
import { usePeriodDrillIn } from '../hooks/usePeriodDrillIn';
import { useRangeSummary } from '../hooks/useRangeSummary';
import { useResolvedRanges } from '../hooks/useResolvedRanges';
import { useStatsBudget } from '../hooks/useStatsBudget';
import { formatShortSpan } from '../model/format';
import { TopSpendingsSection } from '../sections/TopSpendingsSection';
import { TotalSection } from '../sections/TotalSection';

/** One category over the range picked on Stats (and the comparison range, if one is active). */
export default function CategoryDetailScreen() {
  const c = useStatsColors();
  const params = useLocalSearchParams<{ categoryId: string; name?: string }>();
  const categoryId = Number(params.categoryId);
  const { budgetId, periods, symbol } = useStatsBudget();
  const { rangeA, rangeB } = useResolvedRanges(periods);

  const queryA = useRangeSummary(budgetId, rangeA, { categoryId, top: 20 });
  const queryB = useRangeSummary(budgetId, rangeB, { categoryId, top: 20 });
  const summaryA = queryA.data;
  const summaryB = rangeB ? queryB.data ?? null : null;

  // Tapping a bar (when not comparing) narrows the spendings list to that period.
  const { pinnedPeriodId, setPinnedPeriodId, drillPeriod, sectionSummary, sectionStale } =
    usePeriodDrillIn(budgetId, summaryA, summaryB, { categoryId, top: 20 });
  const scopeLabel = drillPeriod ? formatShortSpan(drillPeriod.startDate, drillPeriod.endDate) : undefined;

  return (
    <ScreenContainer glowColor="teal" removeSafeBottom>
      <Stack.Screen options={{ title: params.name ?? 'Category' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={queryA.isRefetching} onRefresh={() => { queryA.refetch(); queryB.refetch(); }} tintColor={c.muted} colors={[c.accent]} />}
      >
        {queryA.isError && !summaryA ? (
          <EmptyState icon="cloud-alert" title="Stats didn't load" body="Check your connection, then try again." actionLabel="Try again" onAction={() => queryA.refetch()} />
        ) : !summaryA || !rangeA ? (
          <View style={s.stack}>
            <SkeletonCard lines={[14, 44, 150]} />
            <SkeletonCard lines={[18, 40, 40, 40]} />
          </View>
        ) : (
          <View style={s.stack}>
            <TotalSection
              summaryA={summaryA}
              summaryB={summaryB}
              rangeA={rangeA}
              rangeB={rangeB}
              symbol={symbol}
              title={`${params.name ?? 'Category'}, ${rangeA.label.toLowerCase()}`}
              pinnedPeriodId={pinnedPeriodId}
              onPinPeriod={setPinnedPeriodId}
              pinnedHint={drillPeriod ? 'Showing this period below' : undefined}
            />
            <View style={sectionStale && s.stale}>
            <TopSpendingsSection
              summaryA={sectionSummary!}
              scopeLabel={scopeLabel}
              summaryB={summaryB}
              rangeA={rangeA}
              rangeB={rangeB}
              symbol={symbol}
              initialCount={10}
              hideCategory
            />
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 60 },
  stack: { gap: 14 },
  stale: { opacity: 0.6 },
});
