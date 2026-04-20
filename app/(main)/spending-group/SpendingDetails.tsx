import { deleteSpending } from '@/app/services/api';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useBudgets } from '@/context/BudgetContext';
import { useTitle } from '@/context/NavBarTitleContext';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Card, IconButton, MD2Colors, Text } from 'react-native-paper';

type DrawerParamList = {
  GroupDetails: { id: string; title: string };
};

// Props type for React Navigation Drawer screen
type Props = DrawerScreenProps<DrawerParamList, 'GroupDetails'>;


export default function SpendingDetailsScreen() {
  const { setTitle } = useTitle();
  const { budgetState, removeSpending } = useBudgets();
  const { selectedCategoryId } = useLocalSearchParams();
  const selectedCategory = budgetState.budgets.filter(b => b.id == budgetState.selectedMainBudgetId).flatMap(x => x.budgetCategories).find(c => c?.id == Number(selectedCategoryId));
  const selectedMainBudget = budgetState.budgets.find(b => b.id == budgetState.selectedMainBudgetId);

  useFocusEffect(() => {
    setTitle(selectedCategory?.name ? selectedCategory.name : "");
  });

  async function onDeleteSpending(spendingId: number) {
    try {
      await deleteSpending(spendingId);
      removeSpending(spendingId, Number(selectedCategoryId));
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
    <ScreenContainer scrollable={true}>
      {selectedCategory?.spendings?.length == 0 ? <Text style={{ textAlign: "center" }}>No spending history</Text> : null}
      {selectedCategory?.spendings?.map(sp =>
        <Card key={sp.id} style={{ marginBottom: 12 }}>
          <Card.Title titleStyle={{ color: sp.amount < 0 ? "red" : "green" }}
            title={`${sp.amount} ${selectedMainBudget?.currency.symbol}`}
            subtitle={sp.description}
            left={(props) => <Text>{sp.date}</Text>}
            right={(props) =>
              <IconButton iconColor={MD2Colors.red800} icon="close" onPress={() => onDeleteSpending(sp.id)} />} />
        </Card>
      )}
    </ScreenContainer>
  );
}