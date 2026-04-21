import { ScreenContainer } from '@/components/ScreenContainer';
import { useBudgetsQuery, useDeleteSpendingMutation } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { useTitleStore } from '@/stores/titleStore';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, IconButton, MD2Colors, Text } from 'react-native-paper';

export default function SpendingDetailsScreen() {
  const setTitle = useTitleStore((s) => s.setTitle);
  const { data: budgets = [] } = useBudgetsQuery();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const deleteSpendingMutation = useDeleteSpendingMutation();
  const { selectedCategoryId } = useLocalSearchParams();
  const selectedCategory = budgets
    .filter(b => b.id === selectedMainBudgetId)
    .flatMap(x => x.budgetCategories)
    .find(c => c?.id === Number(selectedCategoryId));
  const selectedMainBudget = budgets.find(b => b.id === selectedMainBudgetId);

  useFocusEffect(() => {
    setTitle(selectedCategory?.name ? selectedCategory.name : "");
  });

  function onDeleteSpending(spendingId: number) {
    deleteSpendingMutation.mutate(spendingId);
  }

  return (
    <ScreenContainer scrollable={true}>
      {selectedCategory?.spendings?.length == 0 ? <Text style={styles.emptyText}>No spending history</Text> : null}
      {selectedCategory?.spendings?.map(sp =>
        <Card key={sp.id} style={styles.card}>
          <Card.Title titleStyle={{ color: sp.amount < 0 ? "red" : "green" }}
            title={`${sp.amount} ${selectedMainBudget?.currency.symbol}`}
            subtitle={sp.description}
            left={() => <Text>{sp.date}</Text>}
            right={() =>
              <IconButton iconColor={MD2Colors.red800} icon="close" onPress={() => onDeleteSpending(sp.id)} />} />
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
  },
});
