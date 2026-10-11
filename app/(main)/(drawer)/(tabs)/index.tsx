import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { MaskedAmount } from '@/components/MaskedAmount';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TourOverlay, TourStep } from '@/components/tour/TourOverlay';
import { TourTarget } from '@/components/tour/TourTarget';
import { Tavira } from '@/constants/theme';
import { useAddSpendingMutation, useBudgetsQuery, useUpdateBudgetCategoryNameMutation } from '@/hooks/useBudgetQueries';
import { usePendingNotificationTransactionsQuery } from '@/hooks/useNotificationTransactionQueries';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { applyOrder, useOrderStore } from '@/stores/orderStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { useTourStore } from '@/stores/tourStore';
import { BudgetCategory, Spending } from '@/types/Types';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Button, HelperText, Icon, Text, TextInput, useTheme } from 'react-native-paper';
import ReorderableList, { reorderItems, useReorderableDrag } from 'react-native-reorderable-list';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { getApiErrorMessage } from '@/utils/apiError';

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
  highlightActions?: boolean;
}

function CategoryCard({ bc, currencySymbol, isDark, primaryColor, getSwipeableRef, onPress, onRenamePress, onMinus, onPlus, highlightActions }: CategoryCardProps) {
  const drag = useReorderableDrag();
  const { t } = useTranslation();
  const remaining = Math.round(bc.spendings!.reduce((sum, s) => (s.amount > 0 ? sum + s.amount : sum - Math.abs(s.amount)), 0) * 100) / 100 || 0;
  const accentColor = ACCENT_COLORS[bc.id % ACCENT_COLORS.length];
  const isPositive = remaining > 0;
  const minusDisabled = remaining <= 0;

  return (
    <Swipeable
      ref={getSwipeableRef}
      renderRightActions={() => (
        <TouchableOpacity style={styles.renameAction} onPress={onRenamePress}>
          <Icon source="pencil-outline" size={20} color="#fff" />
          <Text style={styles.renameActionText}>{t('common.actions.edit')}</Text>
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
            <MaskedAmount
              style={[styles.categoryBalance, { color: isPositive ? Tavira.income : Tavira.expense }]}
              value={`${remaining.toFixed(2)} ${currencySymbol}`}
            />
          </View>
          {highlightActions ? (
            <TourTarget id="cardActions">
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
            </TourTarget>
          ) : (
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
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

function getHomeSteps(t: TFunction): TourStep[] {
  return [
    { key: 'budgetHeader', icon: 'wallet-outline', title: t('tour.home.budgetHeader.title'), description: t('tour.home.budgetHeader.description') },
    { key: 'categoryCard', icon: 'cash-fast', title: t('tour.home.categoryCard.title'), description: t('tour.home.categoryCard.description') },
    { key: 'cardActions', icon: 'plus-minus', title: t('tour.home.cardActions.title'), description: t('tour.home.cardActions.description') },
    { key: 'eyeToggle', icon: 'eye-outline', title: t('tour.home.eyeToggle.title'), description: t('tour.home.eyeToggle.description') },
    { key: 'menuButton', icon: 'menu', title: t('tour.home.menuButton.title'), description: t('tour.home.menuButton.description') },
  ];
}

function getPendingStep(t: TFunction): TourStep {
  return { key: 'pendingBanner', icon: 'bank-transfer', title: t('tour.home.pendingBanner.title'), description: t('tour.home.pendingBanner.description') };
}

export default function HomeScreen() {
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: transactions = [] } = usePendingNotificationTransactionsQuery();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const user = useAuthStore((s) => s.user);
  const { categoryOrders, setCategoryOrder } = useOrderStore();
  const isActive = useTourStore((s) => s.isActive);
  const hasSeenTour = useTourStore((s) => s.hasSeenTour);
  const { endTour } = useTourStore.getState();
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
  const { t } = useTranslation();
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
    budgetPeriodId: 0, date: null, notificationTransactionId: null,
    notificationTransaction: null, createdByUserId: 0, createdByEmail: null, createdByName: null,
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
      renameSheetRef.current?.close(() => { renameReset(); showSuccess(t('budget.manage.messages.categoryRenamed')); });
    } catch (e) {
      renameSheetRef.current?.close(() => showError(getApiErrorMessage(e, t('home.messages.renameFailed'))));
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
      sheetRef.current?.close(() => { reset(); showSuccess(t('home.messages.spendingAdded')); });
    } catch (e) {
      sheetRef.current?.close(() => showError(getApiErrorMessage(e, t('home.messages.spendingFailed'))));
    }
  }

  useEffect(() => {
    if (!sheetVisible) return;
    const timer = setTimeout(() => amountInputRef.current?.focus?.(), 350);
    return () => clearTimeout(timer);
  }, [sheetVisible]);

  // Start tour the first time a budget exists and the tour hasn't been seen
  // useFocusEffect so it re-checks when returning from Settings after "Show App Tour"
  useFocusEffect(useCallback(() => {
    if (budgets.length === 0) return;
    if (!hasSeenTour) {
      const timer = setTimeout(() => useTourStore.getState().startTour(), 700);
      return () => clearTimeout(timer);
    }
  }, [budgets.length, hasSeenTour])); // eslint-disable-line react-hooks/exhaustive-deps

  const tourSteps = useMemo<TourStep[]>(() => {
    const steps = getHomeSteps(t);
    if (transactions.length > 0) {
      steps.splice(3, 0, getPendingStep(t));
    }
    return steps;
  }, [transactions.length, t]);

  function handleReorder({ from, to }: { from: number; to: number }) {
    const newData = reorderItems(listData, from, to);
    setListData(newData);
    if (!user || !selectedMainBudget) return;
    setCategoryOrder(user.id, selectedMainBudget.id, newData.map(c => c.id));
  }

  const renderItem = ({ item: bc, index: itemIndex }: { item: BudgetCategory; index: number }) => {
    const card = (
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
        highlightActions={itemIndex === 0}
      />
    );
    return itemIndex === 0 ? (
      <TourTarget id="categoryCard">{card}</TourTarget>
    ) : card;
  };

  return (
    <>
      <TourOverlay steps={tourSteps} visible={isActive} onDismiss={endTour} />
      <ScreenContainer glowColor="teal" removeSafeBottom={true}>
        {(selectedMainBudgetId == null || budgets.length === 0) ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconRing}>
              <View style={styles.emptyIconGlow} />
              <Icon source="wallet-outline" size={40} color={Tavira.teal} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#F2F4F8' : theme.colors.onBackground }]}>
              {t('home.empty.title')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? 'rgba(242,244,248,0.5)' : theme.colors.onSurfaceVariant }]}>
              {t('home.empty.description')}
            </Text>
            <TouchableOpacity style={styles.createBudgetBtn} onPress={onCreateBudget}>
              <Icon source="plus" size={18} color="#0B1B3A" />
              <Text style={styles.createBudgetBtnText}>{t('navigation.createBudget')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {transactions.length > 0 && (
              <TourTarget id="pendingBanner">
                <TouchableOpacity onPress={onPendingTransactions} style={styles.pendingBanner}>
                  <View style={styles.pendingLeft}>
                    <View style={styles.pendingIconWrap}>
                      <Icon source="bank-transfer" size={18} color={Tavira.warning} />
                    </View>
                    <Text style={styles.pendingText}>{t('home.pendingBanner')}</Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{transactions.length}</Text>
                  </View>
                </TouchableOpacity>
              </TourTarget>
            )}

            <TourTarget id="budgetHeader">
              <View style={styles.budgetHeader}>
                <Text style={[styles.budgetName, { color: isDark ? 'rgba(242,244,248,0.45)' : theme.colors.onSurfaceVariant }]}>
                  {selectedMainBudget?.name.toUpperCase()}
                </Text>
                <View style={styles.currencyPill}>
                  <Text style={styles.currencyText}>{selectedMainBudget?.currency.symbol} {selectedMainBudget?.currency.code}</Text>
                </View>
              </View>
            </TourTarget>

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
          {negativeInput
            ? t('home.sheet.spentTitle', { name: selectedCategory?.name })
            : t('home.sheet.addTitle', { name: selectedCategory?.name })}
        </Text>
        <Controller
          control={control}
          rules={{ required: t('home.validation.amountRequired'), validate: v => v > 0 || t('home.validation.amountPositive') }}
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
                label={t('budget.fields.amount')}
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
              label={t('home.sheet.description')}
              mode="outlined"
              outlineColor="rgba(255,255,255,0.15)"
              activeOutlineColor={Tavira.teal}
              textColor="#F2F4F8"
            />
          )}
        />
        <View style={sheetStyles.sheetActions}>
          <Button mode="text" onPress={() => sheetRef.current?.close(reset)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            mode="contained"
            loading={addSpendingMutation.isPending}
            onPress={handleSubmit(onModalSubmit)}
            buttonColor={Tavira.teal}
            textColor={Tavira.navy}
            contentStyle={sheetStyles.sheetConfirmContent}
          >
            {t('common.actions.confirm')}
          </Button>
        </View>
      </BottomSheet>

      {/* Rename Sheet */}
      <BottomSheet ref={renameSheetRef} visible={renameSheetVisible} onClose={handleRenameSheetClose}>
        <Text style={sheetStyles.sheetTitle}>{t('budget.manage.rename.title', { name: renameCategory?.name })}</Text>
        <Controller
          control={renameControl}
          rules={{ required: t('budget.validation.categoryNameRequired') }}
          name="name"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput
                label={t('budget.fields.categoryName')}
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
            {t('common.actions.cancel')}
          </Button>
          <Button
            mode="contained"
            loading={updateCategoryNameMutation.isPending}
            onPress={renameHandleSubmit(onRenameSubmit)}
            buttonColor={Tavira.teal}
            textColor={Tavira.navy}
            contentStyle={sheetStyles.sheetConfirmContent}
          >
            {t('common.actions.save')}
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
