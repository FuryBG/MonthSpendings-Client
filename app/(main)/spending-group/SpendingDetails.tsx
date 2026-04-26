import { ScreenContainer } from '@/components/ScreenContainer';
import { useBudgetsQuery, useDeleteSpendingMutation } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { useTitleStore } from '@/stores/titleStore';
import { Spending } from '@/types/Types';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Button, Card, Chip, Dialog, Divider, Icon, Portal, Surface, Text, useTheme } from 'react-native-paper';

// Semantic signal colours — intentional, not theme-derived
const COLOR_EXPENSE = '#F87171';
const COLOR_INCOME  = '#4ADE80';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function toDateKey(isoDate: string): string {
  return isoDate.slice(0, 10); // "YYYY-MM-DD"
}

function todayKey(): string {
  return toDateKey(new Date().toISOString());
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d.toISOString());
}

function getDateLabel(isoDate: string): string {
  const key = toDateKey(isoDate);
  if (key === todayKey())     return 'Today';
  if (key === yesterdayKey()) return 'Yesterday';
  return new Date(isoDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  });
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('en-GB', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatAmount(amount: number, symbol: string): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${amount.toLocaleString('en-GB')} ${symbol}`;
}

type SpendingGroup = {
  dateKey: string;
  label:   string;
  items:   Spending[];
};

function groupSpendings(spendings: Spending[]): SpendingGroup[] {
  const sorted = [...spendings].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  const map = new Map<string, Spending[]>();
  for (const sp of sorted) {
    const key = sp.date ? toDateKey(sp.date) : 'no-date';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(sp);
  }

  return Array.from(map.entries())
    .map(([key, items]) => ({
      dateKey: key,
      label:   items[0].date ? getDateLabel(items[0].date) : 'Unknown date',
      items,
    }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type SummaryProps = { spendings: Spending[]; symbol: string };

function SummaryHeaderCard({ spendings, symbol }: SummaryProps) {
  const theme = useTheme();
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    let income = 0, expense = 0;
    for (const sp of spendings) {
      if (sp.amount >= 0) income  += sp.amount;
      else                expense += Math.abs(sp.amount);
    }
    return { totalIncome: income, totalExpense: expense, netBalance: income - expense };
  }, [spendings]);

  const balanceColor = netBalance >= 0 ? COLOR_INCOME : COLOR_EXPENSE;

  return (
    <Surface style={[s.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
      <View style={s.summaryCenter}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          NET BALANCE
        </Text>
        <Text style={[s.summaryBalance, { color: balanceColor }]}>
          {formatAmount(netBalance, symbol)}
        </Text>
      </View>
      <View style={[s.summaryDivider, { backgroundColor: theme.colors.outline }]} />
      <View style={s.summarySides}>
        <View style={s.summaryStat}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>INCOME</Text>
          <Text style={[s.summaryStatAmount, { color: COLOR_INCOME }]}>
            +{totalIncome.toLocaleString('en-GB')} {symbol}
          </Text>
        </View>
        <View style={s.summaryStat}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>SPENT</Text>
          <Text style={[s.summaryStatAmount, { color: COLOR_EXPENSE }]}>
            -{totalExpense.toLocaleString('en-GB')} {symbol}
          </Text>
        </View>
      </View>
    </Surface>
  );
}

function DateSectionHeader({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={s.dateHeaderContainer}>
      <Text variant="labelMedium" style={[s.dateHeaderText, { color: theme.colors.onSurfaceVariant }]}>
        {label.toUpperCase()}
      </Text>
      <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
    </View>
  );
}

function EmptyState() {
  const theme = useTheme();
  return (
    <View style={s.emptyContainer}>
      <Icon source="receipt-text-outline" size={52} color={theme.colors.onSurfaceVariant} />
      <Text variant="titleMedium" style={s.emptyTitle}>No transactions yet</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
        Swipe left on a transaction to delete it.
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SpendingDetailsScreen() {
  const setTitle               = useTitleStore((s) => s.setTitle);
  const { data: budgets = [] } = useBudgetsQuery();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const deleteSpendingMutation = useDeleteSpendingMutation();
  const { selectedCategoryId } = useLocalSearchParams();
  const theme = useTheme();

  const [confirmSpendingId, setConfirmSpendingId] = useState<number | null>(null);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());

  const selectedCategory = useMemo(
    () =>
      budgets
        .filter(b => b.id === selectedMainBudgetId)
        .flatMap(x => x.budgetCategories ?? [])
        .find(c => c?.id === Number(selectedCategoryId)),
    [budgets, selectedMainBudgetId, selectedCategoryId]
  );

  const selectedMainBudget = useMemo(
    () => budgets.find(b => b.id === selectedMainBudgetId),
    [budgets, selectedMainBudgetId]
  );

  const groupedSpendings = useMemo(
    () => groupSpendings(selectedCategory?.spendings ?? []),
    [selectedCategory?.spendings]
  );

  const hasItems = (selectedCategory?.spendings?.length ?? 0) > 0;
  const symbol   = selectedMainBudget?.currency.symbol ?? '';

  useFocusEffect(() => {
    setTitle(selectedCategory?.name ?? '');
  });

  const renderDeleteAction = (spendingId: number) => (
    <TouchableOpacity
      style={[s.deleteAction, { backgroundColor: theme.colors.error }]}
      onPress={() => {
        swipeableRefs.current.get(spendingId)?.close();
        setConfirmSpendingId(spendingId);
      }}
    >
      <Icon source="trash-can-outline" size={22} color={theme.colors.onError} />
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenContainer scrollable={true}>
        {hasItems && (
          <SummaryHeaderCard spendings={selectedCategory!.spendings} symbol={symbol} />
        )}

        {!hasItems && <EmptyState />}

        {groupedSpendings.map(group => (
          <View key={group.dateKey}>
            <DateSectionHeader label={group.label} />
            {group.items.map(sp => (
              <Swipeable
                key={sp.id}
                ref={(r) => { swipeableRefs.current.set(sp.id, r); }}
                renderRightActions={() => renderDeleteAction(sp.id)}
              >
                <Card style={s.card}>
                  <Card.Content style={s.cardContent}>
                    <View style={s.row}>
                      <View style={s.leftContent}>
                        <Text style={[s.amount, { color: sp.amount < 0 ? COLOR_EXPENSE : COLOR_INCOME }]}>
                          {formatAmount(sp.amount, symbol)}
                        </Text>
                        {sp.description ? (
                          <Text
                            variant="bodySmall"
                            style={[s.description, { color: theme.colors.onSurfaceVariant }]}
                            numberOfLines={1}
                          >
                            {sp.description}
                          </Text>
                        ) : null}
                      </View>
                      <View style={s.rightContent}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {sp.date ? formatTime(sp.date) : ''}
                        </Text>
                        {sp.bankTransactionId !== null && (
                          <Chip
                            icon="bank-outline"
                            compact
                            mode="outlined"
                            style={[s.bankChip, { borderColor: theme.colors.outline }]}
                            textStyle={[s.bankChipText, { color: theme.colors.onSurfaceVariant }]}
                          >
                            Bank
                          </Chip>
                        )}
                        {sp.createdByEmail != null && (
                          <Text
                            variant="labelSmall"
                            style={[s.creatorEmail, { color: theme.colors.onSurfaceVariant }]}
                            numberOfLines={1}
                          >
                            {sp.createdByEmail}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </Swipeable>
            ))}
          </View>
        ))}

        <View style={s.bottomSpacer} />
      </ScreenContainer>

      <Portal>
        <Dialog visible={confirmSpendingId != null} onDismiss={() => setConfirmSpendingId(null)}>
          <Dialog.Title>Delete Transaction</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmSpendingId(null)}>Cancel</Button>
            <Button
              textColor={theme.colors.error}
              onPress={() => {
                if (confirmSpendingId != null) {
                  deleteSpendingMutation.mutate(confirmSpendingId);
                  setConfirmSpendingId(null);
                }
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  summaryCard: {
    borderRadius:   16,
    padding:        16,
    marginTop:      4,
    marginBottom:   20,
    flexDirection:  'row',
    alignItems:     'center',
    gap:            16,
  },
  summaryCenter: {
    flex:           1,
    alignItems:     'center',
  },
  summaryBalance: {
    fontSize:       22,
    fontWeight:     '800',
    marginTop:      2,
  },
  summaryDivider: {
    width:          1,
    height:         40,
    borderRadius:   1,
  },
  summarySides: {
    flex:           1,
    gap:            10,
  },
  summaryStat: {
    alignItems:     'flex-start',
  },
  summaryStatAmount: {
    fontSize:       14,
    fontWeight:     '700',
    marginTop:      1,
  },
  dateHeaderContainer: {
    marginTop:      8,
    marginBottom:   6,
  },
  dateHeaderText: {
    letterSpacing:  0.8,
    fontWeight:     '600',
    marginBottom:   4,
  },
  card: {
    marginBottom:   8,
    borderRadius:   14,
  },
  cardContent: {
    paddingVertical:   12,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection:  'row',
    alignItems:     'flex-start',
  },
  leftContent: {
    flex:           1,
    justifyContent: 'center',
  },
  rightContent: {
    alignItems:     'flex-end',
    justifyContent: 'flex-start',
    gap:            6,
  },
  amount: {
    fontSize:       17,
    fontWeight:     '700',
  },
  description: {
    marginTop:      2,
  },
  bankChip: {
    borderRadius:   6,
  },
  bankChipText: {
    fontSize:       11,
  },
  creatorEmail: {
    fontSize:       10,
    opacity:        0.7,
    maxWidth:       110,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems:     'center',
    width:          72,
    borderRadius:   14,
    marginBottom:   8,
  },
  emptyContainer: {
    flex:           1,
    alignItems:     'center',
    paddingTop:     80,
    gap:            10,
  },
  emptyTitle: {
    fontWeight:     '600',
  },
  bottomSpacer: {
    height:         24,
  },
});
