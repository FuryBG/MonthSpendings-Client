import { createSpending } from '@/app/services/api';
import { Modal, ModalRef } from '@/components/Modal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useBudgets } from '@/context/BudgetContext';
import { useTitle } from '@/context/NavBarTitleContext';
import { useNotification } from '@/context/NotificationContext';
import { BudgetCategory, Spending } from '@/types/Types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Avatar, Button, Card, HelperText, Icon, IconButton, MD2Colors, Text, TextInput } from 'react-native-paper';

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();
  const { selectedMainBudgetId, setSelectedBudgetCategory, selectedBudgetCategoryId, addSpending, budgets } = useBudgets();
  const [negativeInput, setNegativeInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setTitle } = useTitle();
  const modalRef = useRef<ModalRef>(null);
  const selectedMainBudget = budgets.find(b => b.id == selectedMainBudgetId);
  const selectedCategory = budgets.filter(b => b.id == selectedMainBudgetId).flatMap(x => x.budgetCategories).find(c => c?.id == selectedBudgetCategoryId);

  const { control, handleSubmit, watch, reset } = useForm<Spending>({
    defaultValues: {
      id: 0,
      amount: undefined,
      budgetCategoryId: 0,
      description: ""
    }
  });

  console.log("RERENDEEERS");


  useFocusEffect(() => {
    setTitle(selectedMainBudget ? `Budget: ${selectedMainBudget.name}` : "Home");
  });

    function onCreateBudget() {
    router.push("/(main)/CreateBudget");
  }

  const calculateRemaining = (spendings: Spending[]) => {
    return spendings.reduce((sum, s) => {
      if (s.amount > 0) return sum + s.amount;
      return sum - Math.abs(s.amount);
    }, 0);
  };

  function onOpenModal(budgetCategory: BudgetCategory, negativeInput: boolean) {
    setSelectedBudgetCategory(budgetCategory.id);
    setNegativeInput(negativeInput);
    modalRef.current?.open();
  }

  function onSpendingDetails(budgetCategory: BudgetCategory) {
    setSelectedBudgetCategory(budgetCategory.id);
    router.push("/spending-group/SpendingDetails");
  }

  async function onModalSubmit(spending: Spending) {
    setIsLoading(true);
    spending.budgetCategoryId = selectedBudgetCategoryId ?? 0;
    spending.amount = negativeInput ? -Number(spending.amount) : Number(spending.amount);
    let newSpending = await createSpending(spending);
    addSpending(newSpending);
    modalRef.current?.close();
    reset();
    setIsLoading(false);
  }

  return (
    <>
      <ScreenContainer scrollable={true}>
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
        {selectedMainBudget == null &&
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
          <Card key={bc.id} style={{ marginBottom: 12 }} onPress={() => onSpendingDetails(bc)}>
            <Card.Title
              title={bc.name}
              subtitle={`Money left: ${calculateRemaining(bc.spendings!)}`}
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
            validate: value => value > 0 || "Amount must be greater than 0"
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