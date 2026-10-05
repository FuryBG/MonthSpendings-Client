import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenIntroSheet } from '@/components/tour/ScreenIntroSheet';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { statsKeys } from '../api/statsKeys';
import { EmptyState } from '../components/primitives/EmptyState';
import { SkeletonCard } from '../components/primitives/SkeletonCard';
import { useStatsColors } from '../components/primitives/useStatsColors';
import { usePeriodDrillIn } from '../hooks/usePeriodDrillIn';
import { useRangeSummary } from '../hooks/useRangeSummary';
import { useResolvedRanges } from '../hooks/useResolvedRanges';
import { useStatsBudget } from '../hooks/useStatsBudget';
import type { CategoryLine } from '../model/compare';
import { formatShortSpan } from '../model/format';
import { CategoriesSection } from '../sections/CategoriesSection';
import { RangeBar } from '../sections/RangeBar';
import { TopSpendingsSection } from '../sections/TopSpendingsSection';
import { TotalSection } from '../sections/TotalSection';
import { useStatsSelection } from '../state/useStatsSelection';

/** Remounted (via sessionKey) whenever the selection is reset, so local UI state resets too. */
export default function StatsScreen() {
  const sessionKey = useStatsSelection(s => s.sessionKey);
  return <StatsContent key={sessionKey} />;
}

function StatsContent() {
  const c = useStatsColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { budgetId, budget, periods, symbol, isLoading: budgetLoading } = useStatsBudget();
  const { rangeA, rangeB } = useResolvedRanges(periods);
  const [compareOpen, setCompareOpen] = useState(false);

  const allRange = periods.length > 0 ? { fromPeriodId: periods[0].id, toPeriodId: periods[periods.length - 1].id } : null;
  const queryA = useRangeSummary(budgetId, rangeA);
  const queryB = useRangeSummary(budgetId, rangeB);
  const queryAll = useRangeSummary(budgetId, allRange, { top: 1 }); // per-period totals for the period picker

  const totalsById = useMemo(
    () => new Map((queryAll.data?.periods ?? []).map(p => [p.periodId, p.total])),
    [queryAll.data],
  );

  const summaryA = queryA.data;
  const summaryB = rangeB ? queryB.data ?? null : null;

  const openCategory = (line: CategoryLine) =>
    router.push({ pathname: '/stats/CategoryDetail', params: { categoryId: String(line.categoryId), name: line.name } });

  // Tapping a bar (when not comparing) narrows the sections below to that period.
  const { pinnedPeriodId, setPinnedPeriodId, drillPeriod, sectionSummary, sectionStale } =
    usePeriodDrillIn(budgetId, summaryA, summaryB, { top: 20 });
  const scopeLabel = drillPeriod ? formatShortSpan(drillPeriod.startDate, drillPeriod.endDate) : undefined;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: statsKeys.all });
  };

  if (!budgetLoading && !budget) {
    return (
      <ScreenContainer glowColor="purple" removeSafeBottom>
        <EmptyState
          icon="chart-donut"
          title="No budget selected"
          body="Create a budget or pick one from the menu to see where your money goes."
          actionLabel="Create budget"
          onAction={() => router.push('/(main)/CreateBudget')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer glowColor="purple" removeSafeBottom>
      {rangeA ? (
        <RangeBar
          periods={periods}
          symbol={symbol}
          totalsById={totalsById}
          rangeA={rangeA}
          rangeB={rangeB}
          compareOpen={compareOpen}
          onCompareOpenChange={setCompareOpen}
        />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={queryA.isRefetching} onRefresh={refresh} tintColor={c.muted} colors={[c.accent]} />}
      >
        {queryA.isError && !summaryA ? (
          <EmptyState
            icon="cloud-alert"
            title="Stats didn't load"
            body="Check your connection, then try again."
            actionLabel="Try again"
            onAction={() => queryA.refetch()}
          />
        ) : !summaryA || !rangeA ? (
          <View style={s.stack}>
            <SkeletonCard lines={[14, 44, 150]} />
            <SkeletonCard lines={[18, 180, 40, 40]} />
          </View>
        ) : (
          <View style={[s.stack, queryA.isPlaceholderData && s.stale]}>
            <TotalSection
              summaryA={summaryA}
              summaryB={summaryB}
              rangeA={rangeA}
              rangeB={rangeB}
              symbol={symbol}
              onCompare={() => setCompareOpen(true)}
              pinnedPeriodId={pinnedPeriodId}
              onPinPeriod={setPinnedPeriodId}
              pinnedHint={drillPeriod ? 'Showing this period below' : undefined}
            />
            <View style={[s.stack, sectionStale && s.stale]}>
              <CategoriesSection summaryA={sectionSummary!} summaryB={summaryB} rangeA={rangeA} rangeB={rangeB} symbol={symbol} scopeLabel={scopeLabel} onOpenCategory={openCategory} />
              <TopSpendingsSection summaryA={sectionSummary!} summaryB={summaryB} rangeA={rangeA} rangeB={rangeB} symbol={symbol} scopeLabel={scopeLabel} />
            </View>
          </View>
        )}
      </ScrollView>

      <ScreenIntroSheet
        screenKey="Stats"
        icon="chart-box-outline"
        title="Your spending, any way you slice it"
        bullets={[
          { icon: 'calendar-range', text: 'Pick this period, the last 3, 6 or 12, or any custom run of periods.' },
          { icon: 'gesture-swipe-horizontal', text: 'Slide across the chart to see each period’s total.' },
          { icon: 'compare-horizontal', text: 'Tap Compare to put two ranges side by side, category by category.' },
        ]}
      />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: 120 },
  stack: { gap: 14 },
  stale: { opacity: 0.6 },
});
