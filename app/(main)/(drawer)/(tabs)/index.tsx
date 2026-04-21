import { Modal, ModalRef } from '@/components/Modal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAddSpendingMutation, useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { usePendingTransactionsQuery } from '@/hooks/useBankTransactionQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { BudgetCategory, Spending } from '@/types/Types';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge, Button, Card, HelperText, Icon, IconButton, MD2Colors, Text, TextInput } from 'react-native-paper';

export default function HomeScreen() {
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: transactions = [] } = usePendingTransactionsQuery();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const addSpendingMutation = useAddSpendingMutation();
  const [negativeInput, setNegativeInput] = useState<boolean>(false);
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number>(0);
  const router = useRouter();
  const modalRef = useRef<ModalRef>(null);
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

  function onOpenModal(budgetCategory: BudgetCategory, negativeInput: boolean) {
    setSelectedBudgetCategoryId(budgetCategory.id);
    setNegativeInput(negativeInput);
    modalRef.current?.open();
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
      modalRef.current?.close();
      reset();
    } catch {
      // global MutationCache shows Snackbar
    }
  }

  const LeftContent = () => <Icon source={"bank"} color={MD2Colors.black} size={48} />;

  return (
    <>
      <ScreenContainer scrollable={true} removeSafeBottom={true}>
        {transactions.length > 0 &&
          <View>
            <TouchableOpacity onPress={onPendingTransactions}>
              <Card style={styles.pendingCard}>
                <Badge size={30} style={styles.pendingBadge}>{transactions.length}</Badge>
                <Card.Title title="Pending Bank Transactions" style={styles.pendingTitle} titleStyle={styles.pendingTitleText} left={LeftContent} />
              </Card>
            </TouchableOpacity>
          </View>
        }
        {selectedMainBudgetId == null && budgets.length === 0 &&
          <View>
            <View style={styles.emptyIconContainer}>
              <Icon source="cash-fast" size={100} />
            </View>
            <Text style={styles.emptyText} variant='bodyLarge'>Your financial story starts here. Add your first budget and begin building healthy money habits.</Text>
            <Button onPress={onCreateBudget} mode='contained' icon="plus">Create Budget</Button>
          </View>
        }
        {selectedMainBudget != null && selectedMainBudget.budgetCategories?.map(bc =>
          <Card mode='contained' key={bc.id} style={styles.categoryCard} onPress={() => onSpendingDetails(bc)}>
            <Card.Title
              title={bc.name}
              subtitle={`Balance: ${calculateRemaining(bc.spendings!)} ${selectedMainBudget.currency.symbol}`}
              left={(props) => <Avatar.Icon {...props} icon="cash" />}
              right={() => <View style={styles.actionButtons}>
                {calculateRemaining(bc.spendings!) <= 0
                  ? <IconButton icon="minus" iconColor={MD2Colors.red200} onPress={() => null} />
                  : <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => onOpenModal(bc, true)} />}
                <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => onOpenModal(bc, false)} />
              </View>} />
          </Card>
        )}
      </ScreenContainer>
      <Modal ref={modalRef} loading={addSpendingMutation.isPending} onSubmit={(cancelled: boolean) => cancelled ? reset() : handleSubmit(onModalSubmit)()} title={negativeInput ? `${selectedCategory?.name} - Spent` : `${selectedCategory?.name} - Add`}>
        <Controller
          control={control}
          rules={{
            required: "Amount is required",
            validate: value => value > 0 || "Amount must be greater than 0",
          }}
          name="amount"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput keyboardType='numeric' left={<TextInput.Icon icon={negativeInput ? "minus" : "plus"} />} error={fieldState.error != null} value={value ? value.toString() : ""} onChangeText={onChange} style={styles.modalInput} />
              <HelperText type="error" visible={!!fieldState.error}>
                {fieldState.error?.message}
              </HelperText>
            </>
          )} />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput value={value} onChangeText={onChange} style={styles.modalInput} label={"Description"} />
          )} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pendingCard: {
    marginTop: 15,
    marginBottom: 12,
    backgroundColor: MD2Colors.orange300,
  },
  pendingBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    color: 'white',
  },
  pendingTitle: {
    alignItems: 'center',
  },
  pendingTitleText: {
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyIconContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    paddingBottom: 20,
  },
  categoryCard: {
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  modalInput: {
    marginBottom: 0,
    width: '100%',
  },
});
