import { ScreenContainer } from '@/components/ScreenContainer';
import { useAddSpendingMutation, useBudgetsQuery, useUpdateBudgetCategoryNameMutation } from '@/hooks/useBudgetQueries';
import { usePendingTransactionsQuery } from '@/hooks/useBankTransactionQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { BudgetCategory, Spending } from '@/types/Types';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Button, Card, HelperText, Icon, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';

const COLOR_EXPENSE = '#F87171';
const COLOR_INCOME = '#4ADE80';

export default function HomeScreen() {
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: transactions = [] } = usePendingTransactionsQuery();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const addSpendingMutation = useAddSpendingMutation();
  const updateCategoryNameMutation = useUpdateBudgetCategoryNameMutation();
  const [negativeInput, setNegativeInput] = useState<boolean>(false);
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number>(0);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [renameSheetVisible, setRenameSheetVisible] = useState(false);
  const [renameCategory, setRenameCategory] = useState<BudgetCategory | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetRef>(null);
  const renameSheetRef = useRef<BottomSheetRef>(null);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());

  const selectedMainBudget = budgets.find(b => b.id === selectedMainBudgetId);
  const selectedCategory = budgets
    .filter(b => b.id === selectedMainBudgetId)
    .flatMap(x => x.budgetCategories)
    .find(c => c?.id === selectedBudgetCategoryId);

  const { control, handleSubmit, reset } = useForm<Spending>({
    defaultValues: {
      id: 0,
      amount: undefined,
      budgetCategoryId: 0,
      description: ""
    }
  });

  const { control: renameControl, handleSubmit: renameHandleSubmit, reset: renameReset, setValue: renameSetValue } = useForm<{ name: string }>({
    defaultValues: { name: '' }
  });

  function onCreateBudget() {
    router.push("/(main)/CreateBudget");
  }

  function onPendingTransactions() {
    router.push("/(main)/PendingTransactions");
  }

  const calculateRemaining = (spendings: Spending[]) => {
    return spendings.reduce((sum, s) => {
      if (s.amount > 0) return sum + s.amount;
      return sum - Math.abs(s.amount);
    }, 0);
  };

  function openSheet(budgetCategory: BudgetCategory, isNegative: boolean) {
    setSelectedBudgetCategoryId(budgetCategory.id);
    setNegativeInput(isNegative);
    setSheetVisible(true);
  }

  function handleSheetClose(onDone?: () => void) {
    setSheetVisible(false);
    onDone?.();
  }

  function openRenameSheet(bc: BudgetCategory) {
    setRenameCategory(bc);
    renameSetValue('name', bc.name);
    setRenameSheetVisible(true);
  }

  function handleRenameSheetClose(onDone?: () => void) {
    setRenameSheetVisible(false);
    onDone?.();
  }

  async function onRenameSubmit({ name }: { name: string }) {
    if (!renameCategory) return;
    try {
      await updateCategoryNameMutation.mutateAsync({ id: renameCategory.id, newName: name });
      renameSheetRef.current?.close(renameReset);
    } catch {
      // global MutationCache shows Snackbar
    }
  }

  function onSpendingDetails(budgetCategory: BudgetCategory) {
    setSelectedBudgetCategoryId(budgetCategory.id);
    router.push({
      pathname: "/spending-group/SpendingDetails",
      params: { selectedCategoryId: budgetCategory.id },
    });
  }

  async function onModalSubmit(spending: Spending) {
    try {
      spending.budgetCategoryId = selectedBudgetCategoryId ?? 0;
      spending.budgetPeriodId = selectedMainBudget?.budgetPeriods[0].id ?? 0;
      spending.amount = negativeInput ? -Number(spending.amount) : Number(spending.amount);
      await addSpendingMutation.mutateAsync(spending);
      sheetRef.current?.close(reset);
    } catch {
      // global MutationCache shows Snackbar
    }
  }

  const renderCategoryRenameAction = (bc: BudgetCategory) => (
    <TouchableOpacity style={styles.renameAction} onPress={() => {
      swipeableRefs.current.get(bc.id)?.close();
      openRenameSheet(bc);
    }}>
      <Icon source="pencil-outline" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenContainer scrollable={true} removeSafeBottom={true}>
        {transactions.length > 0 && (
          <TouchableOpacity onPress={onPendingTransactions} style={styles.pendingBanner}>
            <View style={styles.pendingLeft}>
              <Icon source="bank-transfer" size={20} color="#F59E0B" />
              <Text style={styles.pendingText}>Pending Bank Transactions</Text>
            </View>
            <View style={styles.pendingBadgeContainer}>
              <Text style={styles.pendingBadgeText}>{transactions.length}</Text>
            </View>
          </TouchableOpacity>
        )}

        {selectedMainBudgetId == null && budgets.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon source="cash-fast" size={64} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.emptyTitle}>
              Start your financial story
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurface }]}>
              Add your first budget to begin tracking spending and building healthy money habits.
            </Text>
            <Button
              onPress={onCreateBudget}
              mode="contained"
              icon="plus"
              style={styles.emptyButton}
              contentStyle={styles.emptyButtonContent}
            >
              Create Budget
            </Button>
          </View>
        )}

        {selectedMainBudget != null && (
          <>
            <View style={styles.statsPlaceholder} />
            {selectedMainBudget.budgetCategories?.map(bc => {
              const remaining = calculateRemaining(bc.spendings!);
              return (
                <Swipeable
                  key={bc.id}
                  ref={(r) => { swipeableRefs.current.set(bc.id, r); }}
                  renderRightActions={() => renderCategoryRenameAction(bc)}
                >
                  <Card style={styles.categoryCard} onPress={() => onSpendingDetails(bc)}>
                    <Card.Content style={styles.categoryCardContent}>
                      <View style={styles.categoryRow}>
                        <View style={styles.categoryIcon}>
                          <Icon source="cash-fast" size={28} color={theme.colors.primary} />
                        </View>
                        <View style={styles.categoryLeft}>
                          <Text style={styles.categoryName}>{bc.name}</Text>
                          <Text style={[styles.categoryBalance, { color: remaining <= 0 ? COLOR_EXPENSE : COLOR_INCOME }]}>
                            {remaining} {selectedMainBudget.currency.symbol}
                          </Text>
                        </View>
                        <View style={styles.categoryActions}>
                          <IconButton
                            icon="minus"
                            size={20}
                            style={{ margin: 0 }}
                            iconColor={remaining <= 0 ? COLOR_EXPENSE + '40' : COLOR_EXPENSE}
                            disabled={remaining <= 0}
                            onPress={() => remaining > 0 && openSheet(bc, true)}
                          />
                          <IconButton
                            icon="plus"
                            size={20}
                            style={{ margin: 0 }}
                            iconColor={COLOR_INCOME}
                            onPress={() => openSheet(bc, false)}
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                </Swipeable>
              );
            })}
          </>
        )}
      </ScreenContainer>

      <BottomSheet ref={sheetRef} visible={sheetVisible} onClose={handleSheetClose}>
        <Text style={sheetStyles.sheetTitle}>
          {negativeInput ? `${selectedCategory?.name} — Spent` : `${selectedCategory?.name} — Add`}
        </Text>
        <Controller
          control={control}
          rules={{
            required: "Amount is required",
            validate: value => value > 0 || "Amount must be greater than 0",
          }}
          name="amount"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput
                keyboardType="numeric"
                left={<TextInput.Icon icon={negativeInput ? "minus" : "plus"} />}
                error={fieldState.error != null}
                value={value ? value.toString() : ""}
                onChangeText={onChange}
                style={sheetStyles.sheetInput}
                label="Amount"
              />
              <HelperText type="error" visible={!!fieldState.error}>
                {fieldState.error?.message}
              </HelperText>
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
              style={sheetStyles.sheetInput}
              label="Description (optional)"
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
            contentStyle={sheetStyles.sheetConfirmContent}
          >
            Confirm
          </Button>
        </View>
      </BottomSheet>

      <BottomSheet ref={renameSheetRef} visible={renameSheetVisible} onClose={handleRenameSheetClose}>
        <Text style={sheetStyles.sheetTitle}>Rename — {renameCategory?.name}</Text>
        <Controller
          control={renameControl}
          rules={{ required: "Name is required" }}
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
              />
              <HelperText type="error" visible={!!fieldState.error}>
                {fieldState.error?.message}
              </HelperText>
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
    backgroundColor: '#2A1F0A',
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
    gap: 8,
  },
  pendingText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  pendingBadgeContainer: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pendingBadgeText: {
    color: '#0C0E12',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 20,
    borderRadius: 12,
  },
  emptyButtonContent: {
    paddingVertical: 6,
  },
  statsPlaceholder: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(186,218,85,0.15)',
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 8,
    borderRadius: 16,
  },
  categoryCardContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryLeft: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryBalance: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renameAction: {
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 16,
    marginBottom: 8,
  },
});
