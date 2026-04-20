import { createSpending } from '@/app/services/api';
import { Modal, ModalRef } from '@/components/Modal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useBankTransactions } from '@/context/BankTransactionsContext';
import { useBudgets } from '@/context/BudgetContext';
import { useNotification } from '@/context/NotificationContext';
import { BudgetCategory, Spending } from '@/types/Types';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';
import { Avatar, Badge, Button, Card, HelperText, Icon, IconButton, MD2Colors, Text, TextInput } from 'react-native-paper';

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();
  const { addSpending, budgetState } = useBudgets();
  const { transactions } = useBankTransactions();
  const [negativeInput, setNegativeInput] = useState<boolean>(false);
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const modalRef = useRef<ModalRef>(null);
  const selectedMainBudget = budgetState.budgets.find(b => b.id == budgetState.selectedMainBudgetId);
  const selectedCategory = budgetState.budgets.filter(b => b.id == budgetState.selectedMainBudgetId).flatMap(x => x.budgetCategories).find(c => c?.id == selectedBudgetCategoryId);

  const { control, handleSubmit, watch, reset } = useForm<Spending>({
    defaultValues: {
      id: 0,
      amount: undefined,
      budgetCategoryId: 0,
      description: ""
    }
  });
  // console.log(expoPushToken);

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
    setIsLoading(true);
    spending.budgetCategoryId = selectedBudgetCategoryId ?? 0;
    spending.budgetPeriodId = selectedMainBudget?.budgetPeriods[0].id ?? 0;
    spending.amount = negativeInput ? -Number(spending.amount) : Number(spending.amount);
    let newSpending = await createSpending(spending);
    addSpending(newSpending, selectedBudgetCategoryId);
    modalRef.current?.close();
    reset();
    setIsLoading(false);
  }
  const LeftContent = (props: any) => <Icon source={"bank"} color={MD2Colors.black} size={48} />

  return (
    <>
      <ScreenContainer scrollable={true} removeSafeBottom={true}>
        {transactions.length > 0 &&
          <View>
            <TouchableOpacity onPress={onPendingTransactions}>
              <Card style={{ marginTop: 15, marginBottom: 12, backgroundColor: MD2Colors.orange300 }}>
                <Badge size={30} style={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'red', color: 'white' }}>{transactions.length}</Badge>
                <Card.Title title="Pending Bank Transactions" style={{ alignItems: "center" }} titleStyle={{ color: "black", textAlign: 'center', justifyContent: 'center', marginTop: 10 }} left={LeftContent} />
              </Card>
            </TouchableOpacity>
          </View>
        }
        {/* <Text>Updates Demo 1</Text>
        <Text style={{ color: "red" }}>
          Your push token:
        </Text>
        <Text>{expoPushToken}</Text>
        <Text>Latest notification:</Text>
        <Text>{notification?.request.content.title}</Text>
        <Text>
          {JSON.stringify(notification?.request.content.data, null, 2)}
        </Text> */}
        {budgetState.selectedMainBudgetId == null && budgetState.budgetLoading == 'ready' &&
          <View>
            <View style={{ alignItems: "center", paddingBottom: 40 }}>
              <Icon
                source="cash-fast"
                size={100}
              />
            </View>
            <Text style={{ textAlign: "center", paddingBottom: 20 }} variant='bodyLarge'>Your financial story starts here. Add your first budget and begin building healthy money habits.</Text>
            <Button onPress={onCreateBudget} mode='contained' icon="plus">Create Budget</Button>
          </View>
        }
        {selectedMainBudget != null && selectedMainBudget.budgetCategories?.map(bc =>
          <Card mode='contained' key={bc.id} style={{ marginBottom: 12 }} onPress={() => onSpendingDetails(bc)}>
            <Card.Title
              title={bc.name}
              subtitle={`Balance: ${calculateRemaining(bc.spendings!)} ${selectedMainBudget.currency.symbol}`}
              left={(props) => <Avatar.Icon {...props} icon="cash" />}
              right={(props) => <View style={{ flexDirection: "row" }}>
                {calculateRemaining(bc.spendings!) <= 0
                  ? <IconButton icon="minus" iconColor={MD2Colors.red200} onPress={() => null} />
                  : <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => onOpenModal(bc, true)} />}
                <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => onOpenModal(bc, false)} />
              </View>} />
          </Card>
        )}
      </ScreenContainer>
      {/* <FloatingButton iconName='plus'></FloatingButton> */}
      <Modal ref={modalRef} loading={isLoading} onSubmit={(cancelled: boolean) => cancelled ? reset() : handleSubmit(onModalSubmit)()} title={negativeInput ? `${selectedCategory?.name} - Spent` : `${selectedCategory?.name} - Add`}>
        <Controller
          control={control}
          rules={{
            required: "Amount is required",
            validate: value => value > 0 || "Amount must be greater than 0",
          }}
          name="amount"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput keyboardType='numeric' left={<TextInput.Icon icon={negativeInput ? "minus" : "plus"} />} error={fieldState.error != null} value={value ? value.toString() : ""} onChangeText={onChange} style={{ marginBottom: 0, width: "100%" }} />
              <HelperText type="error" visible={!!fieldState.error}>
                {fieldState.error?.message}
              </HelperText>
            </>
          )} />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value }, fieldState }) => (
            <TextInput value={value} onChangeText={onChange} style={{ marginBottom: 0, width: "100%" }} label={"Description"} />
          )} />
      </Modal>
    </>
  );
}