import { Budget } from '@/types/Types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

interface HeaderMenuProps {
  budgets: Budget[];
  selectedMainBudgetId: number | null;
  onSelect: (budget: Budget) => void;
  onManage: (budgetId: number) => void;
}

export const HeaderMenu = React.memo(function HeaderMenu({
  budgets,
  selectedMainBudgetId,
  onSelect,
  onManage,
}: HeaderMenuProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {budgets.map((b) => {
        const isSelected = b.id === selectedMainBudgetId;
        return (
          <TouchableOpacity key={b.id} onPress={() => onSelect(b)}>
            <View
              style={[
                styles.budgetPill,
                {
                  borderColor: isSelected ? colors.primary : colors.primary,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                },
              ]}
            >
              <View style={styles.pillContent}>
                <Icon source="account-cash" size={18} />
                <Text>{b.name}</Text>
                {isSelected && (
                  <TouchableOpacity onPress={() => onManage(b.id)}>
                    <Icon source="cog" size={24} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    flexDirection: 'row',
    gap: 5,
  },
  budgetPill: {
    borderWidth: 1,
    padding: 10,
    height: 45,
    maxWidth: 115,
    borderRadius: 10,
  },
  pillContent: {
    flexDirection: 'row',
    gap: 5,
  },
});
