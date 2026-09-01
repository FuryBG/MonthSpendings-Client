import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { MaskedAmount } from '@/components/MaskedAmount';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TourOverlay, TourStep } from '@/components/tour/TourOverlay';
import { TourTarget } from '@/components/tour/TourTarget';
import { Tavira } from '@/constants/theme';
import { useAddSpendingMutation, useBudgetsQuery, useDeleteSpendingMutation, useHistoricalSpendingsQuery } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { useTitleStore } from '@/stores/titleStore';
import { useTourStore } from '@/stores/tourStore';
import { BudgetPeriod, Spending } from '@/types/Types';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ActivityIndicator, Button, Card, Chip, Divider, HelperText, Icon, Surface, Text, TextInput, useTheme } from 'react-native-paper';

const COLOR_EXPENSE = Tavira.expense;
const COLOR_INCOME  = Tavira.income;

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
  return `${prefix}${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

type SpendingGroup = {
  dateKey: string;
  label:   string;
  items:   Spending[];
};

function formatPeriodLabel(period: BudgetPeriod): string {
  const d = new Date(period.startDate);
  const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return period.endDate === null ? `${label} · Current` : label;
}

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
    <Surface style={[s.summaryCard, { backgroundColor: theme.dark ? Tavira.glassBg : theme.colors.surfaceVariant, borderWidth: 1, borderColor: theme.dark ? Tavira.glassBorder : 'transparent' }]} elevation={0}>
      <View style={s.summaryCenter}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          NET BALANCE
        </Text>
        <MaskedAmount style={[s.summaryBalance, { color: balanceColor }]} value={formatAmount(netBalance, symbol)} />
      </View>
      <View style={[s.summaryDivider, { backgroundColor: theme.colors.outline }]} />
      <View style={s.summarySides}>
        <View style={s.summaryStat}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>INCOME</Text>
          <MaskedAmount style={[s.summaryStatAmount, { color: COLOR_INCOME }]} value={`+${totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`} />
        </View>
        <View style={s.summaryStat}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>SPENT</Text>
          <MaskedAmount style={[s.summaryStatAmount, { color: COLOR_EXPENSE }]} value={`-${totalExpense.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`} />
        </View>
      </View>
    </Surface>
  );
}

type ActionRowProps = { remaining: number; onMinus: () => void; onPlus: () => void };

function ActionRow({ remaining, onMinus, onPlus }: ActionRowProps) {
  const minusDisabled = remaining <= 0;
  return (
    <View style={s.actionRow}>
      <TouchableOpacity
        style={[s.actionRowBtn, { backgroundColor: minusDisabled ? 'rgba(255,107,107,0.05)' : 'rgba(255,107,107,0.12)', borderColor: minusDisabled ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.3)' }]}
        disabled={minusDisabled}
        onPress={onMinus}
        activeOpacity={0.7}
      >
        <Icon source="minus" size={16} color={minusDisabled ? 'rgba(255,107,107,0.3)' : Tavira.expense} />
        <Text style={[s.actionRowBtnText, { color: minusDisabled ? 'rgba(255,107,107,0.3)' : Tavira.expense }]}>Spend</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.actionRowBtn, { backgroundColor: 'rgba(62,198,198,0.10)', borderColor: 'rgba(62,198,198,0.28)' }]}
        onPress={onPlus}
        activeOpacity={0.7}
      >
        <Icon source="plus" size={16} color={Tavira.teal} />
        <Text style={[s.actionRowBtnText, { color: Tavira.teal }]}>Add Funds</Text>
      </TouchableOpacity>
    </View>
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
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  const addSpendingMutation = useAddSpendingMutation({ skipGlobalError: true });
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError   = useSnackbarStore((s) => s.showError);
  const sheetRef       = useRef<BottomSheetRef>(null);
  const deleteSheetRef = useRef<BottomSheetRef>(null);
  const amountInputRef = useRef<any>(null);
  const [sheetVisible,       setSheetVisible]       = useState(false);
  const [negativeInput,      setNegativeInput]      = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);

  const hasSeenScreen = useTourStore((s) => s.hasSeenScreen);
  const [tourVisible, setTourVisible] = useState(false);

  useEffect(() => {
    if (!hasSeenScreen('SpendingDetails')) {
      const t = setTimeout(() => setTourVisible(true), 700);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onSpendingTourDismiss() {
    setTourVisible(false);
    useTourStore.getState().markScreenSeen('SpendingDetails');
  }

  const { control, handleSubmit, reset } = useForm<Spending>({
    defaultValues: { id: 0, amount: undefined as any, budgetCategoryId: 0, description: '' },
  });

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

  const currentPeriod = useMemo(
    () => selectedMainBudget?.budgetPeriods.find(p => p.endDate === null),
    [selectedMainBudget]
  );

  useEffect(() => {
    if (currentPeriod && selectedPeriodId === null) {
      setSelectedPeriodId(currentPeriod.id);
    }
  }, [currentPeriod]);

  const isCurrentPeriod = selectedPeriodId === currentPeriod?.id;

  const { data: historicalSpendings = [], isLoading: isHistoricalLoading } = useHistoricalSpendingsQuery(
    Number(selectedCategoryId),
    selectedPeriodId,
    !isCurrentPeriod
  );

  const isPeriodLoading = !isCurrentPeriod && isHistoricalLoading;

  const displayedSpendings = isCurrentPeriod
    ? (selectedCategory?.spendings ?? [])
    : historicalSpendings;

  const groupedSpendings = useMemo(
    () => groupSpendings(displayedSpendings),
    [displayedSpendings]
  );

  const hasItems = displayedSpendings.length > 0;
  const symbol   = selectedMainBudget?.currency.symbol ?? '';

  const spendingTourSteps = useMemo<TourStep[]>(() => {
    const steps: TourStep[] = [
      { key: 'sd_periods', icon: 'calendar-range', title: 'Browse Periods', description: 'Tap a period chip to switch between months and review your full spending history.' },
    ];
    if (hasItems) steps.push({ key: 'sd_summary', icon: 'chart-line', title: 'Period Summary', description: 'Shows net balance, total income added, and total spent for the selected period.' });
    if (isCurrentPeriod) steps.push({ key: 'sd_actions', icon: 'plus-minus', title: 'Record Transactions', description: 'Tap Spend to deduct from this category, or Add Funds to top it up. Swipe left on any transaction to delete it.' });
    return steps;
  }, [hasItems, isCurrentPeriod]);

  const remaining = useMemo(() =>
    (selectedCategory?.spendings ?? []).reduce(
      (sum, sp) => sp.amount > 0 ? sum + sp.amount : sum - Math.abs(sp.amount), 0
    ), [selectedCategory]);

  const emptySpending: Spending = {
    id: 0, amount: undefined as any, budgetCategoryId: 0, description: '',
    budgetPeriodId: 0, date: null, notificationTransactionId: null,
    notificationTransaction: null, createdByUserId: 0, createdByEmail: null, createdByName: null,
  };

  function openSheet(isNegative: boolean) {
    setNegativeInput(isNegative);
    reset(emptySpending);
    setSheetVisible(true);
  }

  function handleSheetClose(onDone?: () => void) { setSheetVisible(false); reset(emptySpending); onDone?.(); }

  async function onModalSubmit(spending: Spending) {
    try {
      spending.budgetCategoryId = Number(selectedCategoryId);
      spending.budgetPeriodId   = currentPeriod?.id ?? 0;
      spending.amount = negativeInput ? -Number(spending.amount) : Number(spending.amount);
      await addSpendingMutation.mutateAsync(spending);
      sheetRef.current?.close(() => { reset(); showSuccess('Spending added.'); });
    } catch {
      sheetRef.current?.close(() => showError('Adding spending failed.'));
    }
  }

  useEffect(() => {
    if (!sheetVisible) return;
    const t = setTimeout(() => amountInputRef.current?.focus?.(), 350);
    return () => clearTimeout(t);
  }, [sheetVisible]);

  useFocusEffect(() => {
    setTitle(selectedCategory?.name ?? '');
  });

  const renderDeleteAction = (spendingId: number) => (
    <TouchableOpacity
      style={[s.deleteAction, { backgroundColor: theme.colors.error }]}
      onPress={() => {
        swipeableRefs.current.get(spendingId)?.close();
        setConfirmSpendingId(spendingId);
        setDeleteSheetVisible(true);
      }}
    >
      <Icon source="trash-can-outline" size={22} color={theme.colors.onError} />
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenContainer scrollable={true}>
        <TourTarget id="sd_periods">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.periodPicker}
          >
            {(selectedMainBudget?.budgetPeriods ?? []).map(period => (
              <Chip
                key={period.id}
                selected={period.id === selectedPeriodId}
                onPress={() => setSelectedPeriodId(period.id)}
                mode="outlined"
                style={s.periodChip}
              >
                {formatPeriodLabel(period)}
              </Chip>
            ))}
          </ScrollView>
        </TourTarget>

        {isPeriodLoading ? (
          <View style={s.loaderContainer}>
            <ActivityIndicator size="large" color={Tavira.teal} />
          </View>
        ) : (
          <>
            {hasItems && <TourTarget id="sd_summary"><SummaryHeaderCard spendings={displayedSpendings} symbol={symbol} /></TourTarget>}
            {!hasItems && <EmptyState />}
            {isCurrentPeriod && <TourTarget id="sd_actions"><ActionRow remaining={remaining} onMinus={() => openSheet(true)} onPlus={() => openSheet(false)} /></TourTarget>}
          </>
        )}

        {!isPeriodLoading && groupedSpendings.map(group => (
          <View key={group.dateKey}>
            <DateSectionHeader label={group.label} />
            {group.items.map(sp => (
              <Swipeable
                key={sp.id}
                ref={(r) => { swipeableRefs.current.set(sp.id, r); }}
                renderRightActions={isCurrentPeriod ? () => renderDeleteAction(sp.id) : undefined}
              >
                <Card mode="outlined" style={[s.card, theme.dark ? { backgroundColor: Tavira.glassBg, borderColor: Tavira.glassBorder } : {}]}>
                  <Card.Content style={s.cardContent}>
                    <View style={s.row}>
                      <View style={s.leftContent}>
                        <MaskedAmount style={[s.amount, { color: sp.amount < 0 ? COLOR_EXPENSE : COLOR_INCOME }]} value={formatAmount(sp.amount, symbol)} />
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
                        {sp.notificationTransactionId !== null && (
                          <Chip
                            icon="wallet-outline"
                            compact
                            mode="outlined"
                            style={[s.bankChip, { borderColor: theme.colors.outline }]}
                            textStyle={[s.bankChipText, { color: theme.colors.onSurfaceVariant }]}
                          >
                            Wallet
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

      <BottomSheet
        ref={deleteSheetRef}
        visible={deleteSheetVisible}
        onClose={(onDone) => { setDeleteSheetVisible(false); setConfirmSpendingId(null); onDone?.(); }}
      >
        <View style={sheetStyles.sheetCenteredContent}>
          <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: theme.colors.errorContainer }]}>
            <Icon source="trash-can-outline" size={28} color={theme.colors.error} />
          </View>
          <Text style={[sheetStyles.sheetConfirmTitle, { color: theme.colors.onSurface }]}>Delete Transaction</Text>
          <Text style={[sheetStyles.sheetConfirmDesc, { color: theme.colors.onSurface }]}>This action cannot be undone.</Text>
        </View>
        <View style={sheetStyles.sheetActions}>
          <Button mode="text" onPress={() => deleteSheetRef.current?.close()}>Cancel</Button>
          <Button
            mode="contained"
            loading={deleteSpendingMutation.isPending}
            buttonColor={theme.colors.error}
            textColor={theme.colors.onError}
            contentStyle={sheetStyles.sheetConfirmContent}
            onPress={() => {
              if (confirmSpendingId != null) {
                deleteSpendingMutation.mutate(confirmSpendingId);
                deleteSheetRef.current?.close();
              }
            }}
          >
            Delete
          </Button>
        </View>
      </BottomSheet>

      <BottomSheet ref={sheetRef} visible={sheetVisible} onClose={handleSheetClose}>
        <Text style={sheetStyles.sheetTitle}>
          {negativeInput ? `${selectedCategory?.name} — Spent` : `${selectedCategory?.name} — Add`}
        </Text>
        <Controller
          control={control}
          rules={{ required: 'Amount is required', validate: v => v > 0 || 'Must be > 0' }}
          name="amount"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput
                ref={amountInputRef}
                keyboardType="numeric"
                returnKeyType="done"
                left={<TextInput.Icon icon={negativeInput ? 'minus' : 'plus'} />}
                error={fieldState.error != null}
                value={value ? value.toString() : ''}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onModalSubmit)}
                blurOnSubmit
                style={sheetStyles.sheetInput}
                label="Amount"
                mode="outlined"
                activeOutlineColor={Tavira.teal}
              />
              <HelperText type="error" visible={!!fieldState.error}>{fieldState.error?.message}</HelperText>
            </>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onModalSubmit)}
              blurOnSubmit
              style={sheetStyles.sheetInput}
              label="Description (optional)"
              mode="outlined"
              outlineColor="rgba(255,255,255,0.15)"
              activeOutlineColor={Tavira.teal}
              textColor="#F2F4F8"
            />
          )}
        />
        <View style={sheetStyles.sheetActions}>
          <Button mode="text" onPress={() => sheetRef.current?.close(reset)}>Cancel</Button>
          <Button
            mode="contained"
            loading={addSpendingMutation.isPending}
            onPress={handleSubmit(onModalSubmit)}
            buttonColor={Tavira.teal}
            textColor={Tavira.navy}
            contentStyle={sheetStyles.sheetConfirmContent}
          >
            Confirm
          </Button>
        </View>
      </BottomSheet>
      <TourOverlay steps={spendingTourSteps} visible={tourVisible} onDismiss={onSpendingTourDismiss} />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  periodPicker: {
    flexDirection:  'row',
    gap:            8,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  periodChip: {
    marginBottom:   4,
  },
  summaryCard: {
    borderRadius:   16,
    padding:        16,
    marginTop:      4,
    marginBottom:   12,
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
  transactionDate: {
    fontSize:       10,
    opacity:        0.6,
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
  actionRow: {
    flexDirection:  'row',
    gap:            10,
    marginBottom:   20,
  },
  actionRowBtn: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    paddingVertical: 11,
    borderRadius:   12,
    borderWidth:    1,
  },
  actionRowBtnText: {
    fontSize:       14,
    fontWeight:     '600',
  },
  loaderContainer: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    paddingTop:     80,
  },
});
