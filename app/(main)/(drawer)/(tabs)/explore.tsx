import { ScreenContainer } from '@/components/ScreenContainer';
import { Tavira } from '@/constants/theme';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { usePeriodComparisonQuery } from '@/hooks/useStatisticsQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { CategoryComparisonDto } from '@/types/Types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';

const C_CURRENT = Tavira.teal;
const C_PREVIOUS = 'rgba(255,255,255,0.22)';
const C_POSITIVE = Tavira.income;
const C_NEGATIVE = Tavira.expense;
const C_NEUTRAL = 'rgba(242,244,248,0.4)';

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
  fillColor: string;
  amount: string;
  amountOpacity?: number;
  delay: number;
  onSurface: string;
  isDark: boolean;
};

function BarRow({ label, labelColor, pct, fillColor, amount, amountOpacity = 1, delay, onSurface, isDark }: BarRowProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 600, delay, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={rowStyles.barRow}>
      <Text style={[rowStyles.barLabel, { color: labelColor }]}>{label}</Text>
      <View style={[rowStyles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,27,58,0.06)' }]}>
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
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  barLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, width: 32 },
  barTrack: { flex: 1, height: 7, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barAmt: { fontSize: 12, fontWeight: '700', width: 48, textAlign: 'right' },
});

type CategoryRowProps = {
  cat: CategoryComparisonDto;
  prevAmt: number;
  maxVal: number;
  sym: string;
  onSurface: string;
  isDark: boolean;
  index: number;
};

const C_DELETED = '#E8934A';

function CategoryRow({ cat, prevAmt, maxVal, sym, onSurface, isDark, index }: CategoryRowProps) {
  const curPct = maxVal > 0 ? cat.amount / maxVal : 0;
  const prevPct = maxVal > 0 ? prevAmt / maxVal : 0;
  const delta = cat.amount - prevAmt;
  const hasPrev = prevAmt > 0;
  const deltaColor = !hasPrev ? C_NEUTRAL : delta > 0 ? C_NEGATIVE : delta < 0 ? C_POSITIVE : C_NEUTRAL;

  return (
    <View style={[catStyles.row, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,27,58,0.06)' }]}>
      <View style={catStyles.header}>
        <View style={catStyles.nameRow}>
          <Text style={[catStyles.name, { color: onSurface }]}>{cat.categoryName}</Text>
          {cat.isDeleted && (
            <View style={catStyles.deletedBadge}>
              <Text style={catStyles.deletedText}>DELETED</Text>
            </View>
          )}
        </View>
        {hasPrev && (
          <View style={[catStyles.deltaBadge, { backgroundColor: `${deltaColor}18` }]}>
            <Text style={[catStyles.delta, { color: deltaColor }]}>
              {delta > 0 ? '+' : ''}{fmt(delta, sym)}
            </Text>
          </View>
        )}
      </View>
      <BarRow
        label="NOW"
        labelColor={C_CURRENT}
        pct={curPct}
        fillColor={C_CURRENT}
        amount={fmt(cat.amount, sym)}
        delay={index * 60}
        onSurface={onSurface}
        isDark={isDark}
      />
      {hasPrev && (
        <BarRow
          label="PREV"
          labelColor={C_NEUTRAL}
          pct={prevPct}
          fillColor={C_PREVIOUS}
          amount={fmt(prevAmt, sym)}
          amountOpacity={0.45}
          delay={index * 60 + 80}
          onSurface={onSurface}
          isDark={isDark}
        />
      )}
    </View>
  );
}

const catStyles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  deletedBadge: { backgroundColor: 'rgba(232,147,74,0.14)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  deletedText: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: C_DELETED },
  deltaBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  delta: { fontSize: 12, fontWeight: '800' },
});

export default function StatsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const { selectedMainBudgetId } = useBudgetUIStore();
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: comparison, isLoading, isError } = usePeriodComparisonQuery(selectedMainBudgetId);

  const budget = budgets.find(b => b.id === selectedMainBudgetId);
  const sym = budget?.currency?.symbol ?? '€';

  const cardBg = isDark ? Tavira.glassBg : '#FFFFFF';
  const cardBorder = isDark ? Tavira.glassBorder : 'rgba(11,27,58,0.08)';

  if (!selectedMainBudgetId) {
    return (
      <ScreenContainer glowColor="purple">
        <View style={styles.centerState}>
          <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : 'rgba(11,27,58,0.06)', borderColor: isDark ? 'rgba(62,198,198,0.2)' : 'rgba(11,27,58,0.1)', borderWidth: 1 }]}>
            <Icon source="chart-bar" size={34} color={isDark ? Tavira.teal : theme.colors.primary} />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.onSurface }]}>No Budget Selected</Text>
          <Text style={[styles.stateSub, { color: theme.colors.onSurfaceVariant }]}>
            Select a budget from the menu above to view your spending analytics.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer glowColor="teal">
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={isDark ? Tavira.teal : theme.colors.primary} />
          <Text style={[styles.stateSub, { color: theme.colors.onSurfaceVariant, marginTop: 16 }]}>
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
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,107,107,0.10)', borderColor: 'rgba(255,107,107,0.2)', borderWidth: 1 }]}>
            <Icon source="alert-circle-outline" size={34} color={Tavira.expense} />
          </View>
          <Text style={[styles.stateTitle, { color: theme.colors.onSurface }]}>No Data Yet</Text>
          <Text style={[styles.stateSub, { color: theme.colors.onSurfaceVariant }]}>
            Add spendings to your budget categories to see analytics here.
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
    <ScreenContainer scrollable glowColor="purple">

      {/* Overview card */}
      <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: `${deltaColor}35` }]}>
        <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(242,244,248,0.35)' : 'rgba(11,27,58,0.35)' }]}>
          PERIOD OVERVIEW
        </Text>

        <View style={styles.totalsRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bigAmount, { color: theme.colors.onSurface }]}>
              {sym}{comparison.currentPeriod.totalSpent.toFixed(0)}
            </Text>
            <Text style={[styles.periodTag, { color: C_CURRENT }]}>CURRENT</Text>
            <Text style={[styles.dateRange, { color: theme.colors.onSurfaceVariant }]}>
              {fmtDate(comparison.currentPeriod.startDate)}
              {comparison.currentPeriod.endDate ? ` – ${fmtDate(comparison.currentPeriod.endDate)}` : ' – now'}
            </Text>
          </View>

          {hasPrev && (
            <>
              <View style={[styles.vDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(11,27,58,0.10)' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bigAmount, { color: theme.colors.onSurface, opacity: 0.35 }]}>
                  {sym}{comparison.previousPeriod!.totalSpent.toFixed(0)}
                </Text>
                <Text style={[styles.periodTag, { color: C_NEUTRAL }]}>PREVIOUS</Text>
                <Text style={[styles.dateRange, { color: theme.colors.onSurfaceVariant }]}>
                  {fmtDate(comparison.previousPeriod!.startDate)}
                  {comparison.previousPeriod!.endDate ? ` – ${fmtDate(comparison.previousPeriod!.endDate)}` : ''}
                </Text>
              </View>
            </>
          )}
        </View>

        {hasPrev && (
          <View style={[styles.deltaBadge, { backgroundColor: `${deltaColor}15` }]}>
            <Icon source={deltaIcon} size={14} color={deltaColor} />
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
      </View>

      {/* By Category */}
      {!hasPrev ? (
        <View style={[styles.noPrevBox, { borderColor: isDark ? Tavira.glassBorder : 'rgba(11,27,58,0.12)', backgroundColor: isDark ? Tavira.glassBg : '#FFFFFF' }]}>
          <Icon source="calendar-arrow-right" size={28} color={isDark ? Tavira.teal : theme.colors.primary} />
          <Text style={[styles.noPrevTitle, { color: theme.colors.onSurface }]}>Finish your first period</Text>
          <Text style={[styles.noPrevSub, { color: theme.colors.onSurfaceVariant }]}>
            Close the current period and start a new one &mdash; you&apos;ll see a full period-over-period breakdown next time.
          </Text>
        </View>
      ) : (
        <View style={[styles.categoriesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.categoriesHeader}>
            <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(242,244,248,0.35)' : 'rgba(11,27,58,0.35)' }]}>
              BY CATEGORY
            </Text>
            <View style={styles.legend}>
              <View style={[styles.legendDot, { backgroundColor: C_CURRENT }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Now</Text>
              <View style={[styles.legendDot, { backgroundColor: C_PREVIOUS }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Prev</Text>
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
              isDark={isDark}
              index={i}
            />
          ))}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stateTitle: { fontSize: 19, fontWeight: '700', textAlign: 'center' },
  stateSub: { fontSize: 13, textAlign: 'center', lineHeight: 19, opacity: 0.65 },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  totalsRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  bigAmount: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, lineHeight: 36 },
  periodTag: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 3 },
  dateRange: { fontSize: 11, marginTop: 2, opacity: 0.55 },
  vDivider: { width: 1, alignSelf: 'stretch', opacity: 0.5 },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deltaNum: { fontSize: 14, fontWeight: '800' },
  deltaPct: { fontSize: 12, fontWeight: '600', opacity: 0.75 },
  deltaMsg: { fontSize: 11, fontWeight: '600', opacity: 0.7, marginLeft: 2 },
  categoriesCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontSize: 10, opacity: 0.6, marginRight: 6 },
  noPrevBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  noPrevTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  noPrevSub: { fontSize: 13, textAlign: 'center', lineHeight: 19, opacity: 0.65 },
});
