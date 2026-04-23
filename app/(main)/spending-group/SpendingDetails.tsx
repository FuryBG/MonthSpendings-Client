import { ScreenContainer } from '@/components/ScreenContainer';
import { useBudgetsQuery, useDeleteSpendingMutation } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { useTitleStore } from '@/stores/titleStore';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Button, Card, Dialog, Icon, Portal, Text, useTheme } from 'react-native-paper';

const COLOR_EXPENSE = '#F87171';
const COLOR_INCOME = '#4ADE80';

export default function SpendingDetailsScreen() {
  const setTitle = useTitleStore((s) => s.setTitle);
  const { data: budgets = [] } = useBudgetsQuery();
  const { selectedMainBudgetId } = useBudgetUIStore();
  const deleteSpendingMutation = useDeleteSpendingMutation();
  const { selectedCategoryId } = useLocalSearchParams();
  const theme = useTheme();
  const [confirmSpendingId, setConfirmSpendingId] = useState<number | null>(null);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());

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

  const renderDeleteAction = (spendingId: number) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => {
      swipeableRefs.current.get(spendingId)?.close();
      setConfirmSpendingId(spendingId);
    }}>
      <Icon source="trash-can-outline" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenContainer scrollable={true}>
        {selectedCategory?.spendings?.length == 0
          ? <Text style={styles.emptyText}>No spending history</Text>
          : null}
        {selectedCategory?.spendings?.map(sp =>
          <Swipeable
            key={sp.id}
            ref={(r) => { swipeableRefs.current.set(sp.id, r); }}
            renderRightActions={() => renderDeleteAction(sp.id)}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.row}>
                  <View style={styles.leftContent}>
                    <Text style={[styles.amount, { color: sp.amount < 0 ? COLOR_EXPENSE : COLOR_INCOME }]}>
                      {sp.amount} {selectedMainBudget?.currency.symbol}
                    </Text>
                    <Text variant="bodySmall" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                      {sp.description}
                    </Text>
                  </View>
                  <View style={styles.rightContent}>
                    <Text variant="bodySmall">
                      {sp.date ? new Date(sp.date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Swipeable>
        )}
      </ScreenContainer>

      <Portal>
        <Dialog visible={confirmSpendingId != null} onDismiss={() => setConfirmSpendingId(null)}>
          <Dialog.Title>Delete Spending</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmSpendingId(null)}>Cancel</Button>
            <Button
              textColor={COLOR_EXPENSE}
              onPress={() => {
                if (confirmSpendingId != null) {
                  onDeleteSpending(confirmSpendingId);
                  setConfirmSpendingId(null);
                }
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
  },
  card: {
    marginBottom: 8,
    borderRadius: 14,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 14,
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
    justifyContent: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    marginTop: 2,
  },
  deleteAction: {
    backgroundColor: '#F87171',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 14,
    marginBottom: 8,
  },
});
