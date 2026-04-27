import { ScreenContainer } from '@/components/ScreenContainer';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { usePeriodComparisonQuery } from '@/hooks/useStatisticsQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { CategoryComparisonDto } from '@/types/Types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Icon, Text, useTheme } from 'react-native-paper';

const C_CURRENT = '#F59E0B';
const C_PREVIOUS = 'rgba(148, 163, 184, 0.5)';
const C_POSITIVE = '#4ADE80';
const C_NEGATIVE = '#F87171';
const C_NEUTRAL = '#94A3B8';

function fmt(amount: number, sym: string): string {
  if (Math.abs(amount) >= 1000) return `${sym}${(amount / 1000).toFixed(1)}k`;
  return `${sym}${Math.abs(amount).toFixed(0)}`;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type BarRowProps = {
  label: string;
  labelColor: string;
  pct: number;
  trackBg: string;
  fillColor: string;
  amount: string;
  amountOpacity?: number;
  delay: number;
  onSurface: string;
};

function BarRow({ label, labelColor, pct, trackBg, fillColor, amount, amountOpacity = 1, delay, onSurface }: BarRowProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 550,
      delay,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={rowStyles.barRow}>
      <Text style={[rowStyles.barLabel, { color: labelColor }]}>{label}</Text>
      <View style={[rowStyles.barTrack, { backgroundColor: trackBg }]}>
        <Animated.View
          style={[
            rowStyles.barFill,
            {
              backgroundColor: fillColor,
              width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(pct * 100).toFixed(2)}%`] }),
            },
          ]}
        />
      </View>
      <Text style={[rowStyles.barAmt, { color: onSurface, opacity: amountOpacity }]}>{amount}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  barLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, width: 32 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  barAmt: { fontSize: 12, fontWeight: '700', width: 48, textAlign: 'right' },
});

type CategoryRowProps = {
  cat: CategoryComparisonDto;
  prevAmt: number;
  maxVal: number;
  sym: string;
  onSurface: string;
  surfaceVariant: string;
  index: number;
};

function CategoryRow({ cat, prevAmt, maxVal, sym, onSurface, surfaceVariant, index }: CategoryRowProps) {
  const curPct = maxVal > 0 ? cat.amount / maxVal : 0;
  const prevPct = maxVal > 0 ? prevAmt / maxVal : 0;
  const delta = cat.amount - prevAmt;
  const hasPrev = prevAmt > 0;
  const deltaColor = !hasPrev ? C_NEUTRAL : delta > 0 ? C_NEGATIVE : delta < 0 ? C_POSITIVE : C_NEUTRAL;

  return (
    <View style={[catStyles.row, { borderBottomColor: surfaceVariant }]}>
      <View style={catStyles.header}>
        <Text style={[catStyles.name, { color: onSurface }]}>{cat.categoryName}</Text>
        {hasPrev && (
          <Text style={[catStyles.delta, { color: deltaColor }]}>
            {delta > 0 ? '+' : ''}{fmt(delta, sym)}
          </Text>
        )}
      </View>
      <BarRow
        label="NOW"
        labelColor={C_CURRENT}
        pct={curPct}
        trackBg={`${C_CURRENT}1A`}
        fillColor={C_CURRENT}
        amount={fmt(cat.amount, sym)}
        delay={index * 60}
        onSurface={onSurface}
      />
      {hasPrev && (
        <BarRow
          label="PREV"
          labelColor={C_NEUTRAL}
          pct={prevPct}
          trackBg="rgba(148,163,184,0.12)"
          fillColor={C_PREVIOUS}
          amount={fmt(prevAmt, sym)}
          amountOpacity={0.5}
          delay={index * 60 + 80}
          onSurface={onSurface}
        />
      )}
    </View>
  );
}

const catStyles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  delta: { fontSize: 12, fontWeight: '700' },
});

export default function StatsScreen() {
  const theme = useTheme();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: comparison, isLoading, isError } = usePeriodComparisonQuery(selectedMainBudgetId);

  const budget = budgets.find(b => b.id === selectedMainBudgetId);
  const sym = budget?.currency?.symbol ?? '€';

  if (!selectedMainBudgetId) {
    return (
      <ScreenContainer>
        <View style={styles.centerState}>
          <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.primary}1A` }]}>
            <Icon source="chart-bar" size={36} color={theme.colors.primary} />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.onSurface }]}>No Budget Selected</Text>
          <Text style={[styles.stateSub, { color: theme.colors.onSurfaceVariant }]}>
            Tap the menu at the top to select a budget, then return here to see your spending analytics.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={C_CURRENT} />
          <Text style={[styles.stateSub, { color: theme.colors.onSurfaceVariant, marginTop: 12 }]}>
            Crunching the numbers…
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !comparison) {
    return (
      <ScreenContainer>
        <View style={styles.centerState}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(248,113,113,0.1)' }]}>
            <Icon source="alert-circle-outline" size={36} color={C_NEGATIVE} />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.onSurface }]}>No Data Yet</Text>
          <Text style={[styles.stateSub, { color: theme.colors.onSurfaceVariant }]}>
            Add some spendings to your budget categories and come back here to see your stats.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const hasPrev = comparison.previousPeriod != null;
  const delta = comparison.totalDelta;
  const deltaColor = delta === 0 ? C_NEUTRAL : delta > 0 ? C_NEGATIVE : C_POSITIVE;
  const deltaIcon = delta > 0 ? 'arrow-up-thick' : delta < 0 ? 'arrow-down-thick' : 'minus';

  const prevMap = new Map<number, number>(
    (comparison.previousPeriod?.categories ?? []).map(c => [c.categoryId, c.amount])
  );

  const allAmounts = comparison.currentPeriod.categories.flatMap(c => [
    c.amount,
    prevMap.get(c.categoryId) ?? 0,
  ]);
  const maxVal = Math.max(...allAmounts, 1);

  return (
    <ScreenContainer scrollable>

      {/* ── OVERVIEW CARD ── */}
      <Card style={[styles.summaryCard, { borderColor: `${deltaColor}40` }]}>
        <Card.Content>
          <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>PERIOD OVERVIEW</Text>

          <View style={styles.totalsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bigAmount, { color: theme.colors.onSurface }]}>
                {sym}{comparison.currentPeriod.totalSpent.toFixed(0)}
              </Text>
              <Text style={[styles.periodTag, { color: C_CURRENT }]}>CURRENT</Text>
              <Text style={[styles.dateRange, { color: theme.colors.onSurfaceVariant }]}>
                {fmtDate(comparison.currentPeriod.startDate)}
                {comparison.currentPeriod.endDate
                  ? ` – ${fmtDate(comparison.currentPeriod.endDate)}`
                  : ' – now'}
              </Text>
            </View>

            {hasPrev && (
              <>
                <View style={[styles.vDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bigAmount, { color: theme.colors.onSurface, opacity: 0.4 }]}>
                    {sym}{comparison.previousPeriod!.totalSpent.toFixed(0)}
                  </Text>
                  <Text style={[styles.periodTag, { color: C_NEUTRAL }]}>PREVIOUS</Text>
                  <Text style={[styles.dateRange, { color: theme.colors.onSurfaceVariant }]}>
                    {fmtDate(comparison.previousPeriod!.startDate)}
                    {comparison.previousPeriod!.endDate
                      ? ` – ${fmtDate(comparison.previousPeriod!.endDate)}`
                      : ''}
                  </Text>
                </View>
              </>
            )}
          </View>

          {hasPrev && (
            <View style={[styles.deltaBadge, { backgroundColor: `${deltaColor}1A` }]}>
              <Icon source={deltaIcon} size={16} color={deltaColor} />
              <Text style={[styles.deltaNum, { color: deltaColor }]}>
                {delta > 0 ? '+' : ''}{sym}{Math.abs(delta).toFixed(0)}
              </Text>
              {comparison.totalDeltaPercent != null && (
                <Text style={[styles.deltaPct, { color: deltaColor }]}>
                  ({delta > 0 ? '+' : ''}{comparison.totalDeltaPercent.toFixed(1)}%)
                </Text>
              )}
              <Text style={[styles.deltaMsg, { color: deltaColor }]}>
                {delta > 0 ? 'more than last' : delta < 0 ? 'less than last' : 'same as last'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* ── BY CATEGORY ── */}
      {!hasPrev ? (
        <View style={[styles.noPrevBox, { borderColor: theme.colors.surfaceVariant }]}>
          <Icon source="calendar-arrow-right" size={28} color={C_CURRENT} />
          <Text style={[styles.noPrevTitle, { color: theme.colors.onSurface }]}>
            Finish your first period
          </Text>
          <Text style={[styles.noPrevSub, { color: theme.colors.onSurfaceVariant }]}>
            Close the current period and start a new one — the next time you open this screen you'll see a full period-over-period breakdown.
          </Text>
        </View>
      ) : (
        <Card style={styles.categoriesCard}>
          <Card.Content style={styles.categoriesContent}>
            <View style={styles.categoriesHeader}>
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>BY CATEGORY</Text>
              <View style={styles.legend}>
                <View style={[styles.legendDot, { backgroundColor: C_CURRENT }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Current</Text>
                <View style={[styles.legendDot, { backgroundColor: C_PREVIOUS }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Previous</Text>
              </View>
            </View>

            {comparison.currentPeriod.categories.map((cat, i) => (
              <CategoryRow
                key={cat.categoryId}
                cat={cat}
                prevAmt={prevMap.get(cat.categoryId) ?? 0}
                maxVal={maxVal}
                sym={sym}
                onSurface={theme.colors.onSurface}
                surfaceVariant={theme.colors.surfaceVariant}
                index={i}
              />
            ))}
          </Card.Content>
        </Card>
      )}

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 10,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stateTitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.65,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    opacity: 0.4,
    marginBottom: 14,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  bigAmount: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  periodTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 3,
  },
  dateRange: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.55,
  },
  vDivider: {
    width: 1,
    alignSelf: 'stretch',
    opacity: 0.4,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  deltaNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  deltaPct: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.75,
  },
  deltaMsg: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
    marginLeft: 2,
  },
  categoriesCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  categoriesContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: 4,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 10,
    opacity: 0.6,
    marginRight: 6,
  },
  noPrevBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  noPrevTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  noPrevSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.65,
  },
});
