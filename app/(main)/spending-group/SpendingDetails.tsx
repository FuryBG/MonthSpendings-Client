import { ScreenContainer } from '@/components/ScreenContainer';
import { useBudgetsQuery, useDeleteSpendingMutation } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { useTitleStore } from '@/stores/titleStore';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
          <Card.Content style={styles.cardContent}>
            <View style={styles.row}>
              <View style={styles.leftContent}>
                <Text style={{ color: sp.amount < 0 ? "red" : "green", fontWeight: 'bold' }}>
                  {sp.amount} {selectedMainBudget?.currency.symbol}
                </Text>
                <Text variant="bodySmall" style={styles.description}>{sp.description}</Text>
              </View>
              <View style={styles.rightContent}>
                <Text variant="bodySmall">
                  {sp.date ? new Date(sp.date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                </Text>
                <IconButton
                  iconColor={MD2Colors.red800}
                  icon="close"
                  size={20}
                  style={{ margin: 0 }}
                  onPress={() => onDeleteSpending(sp.id)}
                />
              </View>
            </View>
          </Card.Content>
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
  cardContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContent: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  description: {
    marginTop: 2,
  },
});
