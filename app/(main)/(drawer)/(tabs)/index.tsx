import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Tavira } from '@/constants/theme';
import { usePendingTransactionsQuery } from '@/hooks/useBankTransactionQueries';
import { useAddSpendingMutation, useBudgetsQuery, useUpdateBudgetCategoryNameMutation } from '@/hooks/useBudgetQueries';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { applyOrder, useOrderStore } from '@/stores/orderStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { BudgetCategory, Spending } from '@/types/Types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Button, HelperText, Icon, Text, TextInput, useTheme } from 'react-native-paper';
import ReorderableList, { reorderItems, useReorderableDrag } from 'react-native-reorderable-list';

const ACCENT_COLORS = [Tavira.teal, Tavira.purple, '#7B8FFF', '#2DE6D0', '#8B5CF6', '#10B981'];

interface CategoryCardProps {
  bc: BudgetCategory;
  currencySymbol: string;
  isDark: boolean;
  primaryColor: string;
  getSwipeableRef: (r: Swipeable | null) => void;
  onPress: () => void;
  onRenamePress: () => void;
  onMinus: () => void;
  onPlus: () => void;
}

function CategoryCard({ bc, currencySymbol, isDark, primaryColor, getSwipeableRef, onPress, onRenamePress, onMinus, onPlus }: CategoryCardProps) {
  const drag = useReorderableDrag();
  const remaining = bc.spendings!.reduce((sum, s) => (s.amount > 0 ? sum + s.amount : sum - Math.abs(s.amount)), 0);
  const accentColor = ACCENT_COLORS[bc.id % ACCENT_COLORS.length];
  const isPositive = remaining > 0;
  const minusDisabled = remaining <= 0;

  return (
    <Swipeable
      ref={getSwipeableRef}
      renderRightActions={() => (
        <TouchableOpacity style={styles.renameAction} onPress={onRenamePress}>
          <Icon source="pencil-outline" size={20} color="#fff" />
          <Text style={styles.renameActionText}>Edit</Text>
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity
        style={[
          styles.categoryCard,
          isDark
            ? { backgroundColor: Tavira.glassBg, borderColor: Tavira.glassBorder }
            : { backgroundColor: '#FFFFFF', borderColor: 'rgba(11,27,58,0.08)' },
        ]}
        onPress={onPress}
        onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); drag(); }}
        delayLongPress={300}
        activeOpacity={0.75}
      >
        <View style={[styles.cardAccentLine, { backgroundColor: accentColor }]} />
        <View style={styles.cardInner}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${accentColor}18` }]}>
            <Icon source="cash-fast" size={22} color={accentColor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.categoryName, { color: isDark ? '#F2F4F8' : '#000' }]}>{bc.name}</Text>
            <Text style={[styles.categoryBalance, { color: isPositive ? Tavira.income : Tavira.expense }]}>
              {remaining.toFixed(2)} {currencySymbol}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: minusDisabled ? 'rgba(255,107,107,0.06)' : 'rgba(255,107,107,0.12)' }]}
              disabled={minusDisabled}
              onPress={onMinus}
            >
              <Icon source="minus" size={16} color={minusDisabled ? 'rgba(255,107,107,0.3)' : Tavira.expense} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: 'rgba(62,198,198,0.12)' }]}
              onPress={onPlus}
            >
              <Icon source="plus" size={16} color={Tavira.income} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function HomeScreen() {
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: transactions = [] } = usePendingTransactionsQuery();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const user = useAuthStore((s) => s.user);
  const { categoryOrders, setCategoryOrder } = useOrderStore();
  const skipGlobal = { skipGlobalError: true };
  const addSpendingMutation = useAddSpendingMutation(skipGlobal);
  const updateCategoryNameMutation = useUpdateBudgetCategoryNameMutation(skipGlobal);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [negativeInput, setNegativeInput] = useState<boolean>(false);
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number>(0);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [renameSheetVisible, setRenameSheetVisible] = useState(false);
  const [renameCategory, setRenameCategory] = useState<BudgetCategory | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;
  const sheetRef = useRef<BottomSheetRef>(null);
  const renameSheetRef = useRef<BottomSheetRef>(null);
  const amountInputRef = useRef<any>(null);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());

  const selectedMainBudget = budgets.find(b => b.id === selectedMainBudgetId);
  const selectedCategory = budgets
    .filter(b => b.id === selectedMainBudgetId)
    .flatMap(x => x.budgetCategories)
    .find(c => c?.id === selectedBudgetCategoryId);

  const rawCategories = useMemo(
    () => selectedMainBudget?.budgetCategories ?? [],
    [selectedMainBudget]
  );

  const sortedCategories = useMemo(
    () => applyOrder(rawCategories, user ? (categoryOrders[selectedMainBudget?.id ?? 0] ?? []) : []),
    [rawCategories, categoryOrders, user, selectedMainBudget?.id]
  );

  const [listData, setListData] = useState<BudgetCategory[]>(sortedCategories);

  useEffect(() => {
    setListData(sortedCategories);
  }, [rawCategories, categoryOrders]); // eslint-disable-line react-hooks/exhaustive-deps


  const { control, handleSubmit, reset } = useForm<Spending>({
    defaultValues: { id: 0, amount: undefined, budgetCategoryId: 0, description: '' },
  });

  const { control: renameControl, handleSubmit: renameHandleSubmit, reset: renameReset, setValue: renameSetValue } =
    useForm<{ name: string }>({ defaultValues: { name: '' } });

  function onCreateBudget() { router.push('/(main)/CreateBudget'); }
  function onPendingTransactions() { router.push('/(main)/PendingTransactions'); }

  const emptySpending: Spending = {
    id: 0, amount: undefined as any, budgetCategoryId: 0, description: '',
    budgetPeriodId: 0, date: null, bankTransactionId: null,
    bankTransaction: null, createdByUserId: 0, createdByEmail: null, createdByName: null,
    transactionDate: null,
  };

  function openSheet(bc: BudgetCategory, isNegative: boolean) {
    setSelectedBudgetCategoryId(bc.id);
    setNegativeInput(isNegative);
    reset(emptySpending);
    setSheetVisible(true);
  }

  function handleSheetClose(onDone?: () => void) { setSheetVisible(false); reset(emptySpending); onDone?.(); }
  function openRenameSheet(bc: BudgetCategory) { setRenameCategory(bc); renameSetValue('name', bc.name); setRenameSheetVisible(true); }
  function handleRenameSheetClose(onDone?: () => void) { setRenameSheetVisible(false); onDone?.(); }

  async function onRenameSubmit({ name }: { name: string }) {
    if (!renameCategory) return;
    try {
      await updateCategoryNameMutation.mutateAsync({ id: renameCategory.id, newName: name });
      renameSheetRef.current?.close(() => { renameReset(); showSuccess('Category renamed.'); });
    } catch {
      renameSheetRef.current?.close(() => showError('Renaming failed.'));
    }
  }

  function onSpendingDetails(bc: BudgetCategory) {
    setSelectedBudgetCategoryId(bc.id);
    router.push({ pathname: '/spending-group/SpendingDetails', params: { selectedCategoryId: bc.id } });
  }

  async function onModalSubmit(spending: Spending) {
    try {
      spending.budgetCategoryId = selectedBudgetCategoryId ?? 0;
      spending.budgetPeriodId = selectedMainBudget?.budgetPeriods[0].id ?? 0;
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

  function handleReorder({ from, to }: { from: number; to: number }) {
    const newData = reorderItems(listData, from, to);
    setListData(newData);
    if (!user || !selectedMainBudget) return;
    setCategoryOrder(user.id, selectedMainBudget.id, newData.map(c => c.id));
  }

  const renderItem = ({ item: bc }: { item: BudgetCategory }) => (
    <CategoryCard
      bc={bc}
      currencySymbol={selectedMainBudget?.currency.symbol ?? ''}
      isDark={isDark}
      primaryColor={theme.colors.primary}
      getSwipeableRef={(r) => swipeableRefs.current.set(bc.id, r)}
      onPress={() => onSpendingDetails(bc)}
      onRenamePress={() => { swipeableRefs.current.get(bc.id)?.close(); openRenameSheet(bc); }}
      onMinus={() => openSheet(bc, true)}
      onPlus={() => openSheet(bc, false)}
    />
  );

  return (
    <>
      <ScreenContainer glowColor="teal" removeSafeBottom={true}>
        {(selectedMainBudgetId == null || budgets.length === 0) ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconRing}>
              <View style={styles.emptyIconGlow} />
              <Icon source="wallet-outline" size={40} color={Tavira.teal} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#F2F4F8' : theme.colors.onBackground }]}>
              Start your financial story
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? 'rgba(242,244,248,0.5)' : theme.colors.onSurfaceVariant }]}>
              Create your first shared budget and begin tracking spending together.
            </Text>
            <TouchableOpacity style={styles.createBudgetBtn} onPress={onCreateBudget}>
              <Icon source="plus" size={18} color="#0B1B3A" />
              <Text style={styles.createBudgetBtnText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={onPendingTransactions} style={styles.pendingBanner}>
                <View style={styles.pendingLeft}>
                  <View style={styles.pendingIconWrap}>
                    <Icon source="bank-transfer" size={18} color={Tavira.warning} />
                  </View>
                  <Text style={styles.pendingText}>Pending Bank Transactions</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{transactions.length}</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.budgetHeader}>
              <Text style={[styles.budgetName, { color: isDark ? 'rgba(242,244,248,0.45)' : theme.colors.onSurfaceVariant }]}>
                {selectedMainBudget?.name.toUpperCase()}
              </Text>
              <View style={styles.currencyPill}>
                <Text style={styles.currencyText}>{selectedMainBudget?.currency.symbol} {selectedMainBudget?.currency.code}</Text>
              </View>
            </View>

            <View style={styles.categoriesList}>
              <ReorderableList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(c) => c.id.toString()}
                onReorder={handleReorder}
                showsVerticalScrollIndicator={false}
                style={styles.categoriesList}
              />
            </View>
          </>
        )}
      </ScreenContainer>

      {/* Add Spending Sheet */}
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
          <Button mode="text" onPress={() => sheetRef.current?.close(reset)}>
            Cancel
          </Button>
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

      {/* Rename Sheet */}
      <BottomSheet ref={renameSheetRef} visible={renameSheetVisible} onClose={handleRenameSheetClose}>
        <Text style={sheetStyles.sheetTitle}>Rename — {renameCategory?.name}</Text>
        <Controller
          control={renameControl}
          rules={{ required: 'Name is required' }}
          name="name"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput
                label="Category name"
                value={value}
                onChangeText={onChange}
                error={fieldState.error != null}
                style={sheetStyles.sheetInput}
                autoFocus
                mode="outlined"
                activeOutlineColor={Tavira.teal}
              />
              <HelperText type="error" visible={!!fieldState.error}>{fieldState.error?.message}</HelperText>
            </>
          )}
        />
        <View style={sheetStyles.sheetActions}>
          <Button mode="text" onPress={() => renameSheetRef.current?.close(renameReset)}>
            Cancel
          </Button>
          <Button
            mode="contained"
            loading={updateCategoryNameMutation.isPending}
            onPress={renameHandleSubmit(onRenameSubmit)}
            buttonColor={Tavira.teal}
            textColor={Tavira.navy}
            contentStyle={sheetStyles.sheetConfirmContent}
          >
            Save
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  pendingBanner: {
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 14,
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  pendingBadgeText: {
    color: '#0C0E12',
    fontWeight: '800',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 16,
  },
  emptyIconRing: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(62,198,198,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(62,198,198,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(62,198,198,0.10)',
    top: -16,
    left: -16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  createBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Tavira.teal,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  createBudgetBtnText: {
    color: '#0B1B3A',
    fontWeight: '700',
    fontSize: 15,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  budgetName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  currencyPill: {
    backgroundColor: 'rgba(62,198,198,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(62,198,198,0.2)',
  },
  currencyText: {
    color: Tavira.teal,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoriesList: {
    flex: 1,
  },
  categoriesContent: {
    paddingBottom: 0,
  },
  categoryCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardAccentLine: {
    width: 3,
    borderRadius: 0,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  categoryBalance: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameAction: {
    backgroundColor: Tavira.purple,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 18,
    marginBottom: 10,
    gap: 4,
  },
  renameActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
