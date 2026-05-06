import { Tavira } from '@/constants/theme';
import { Budget } from '@/types/Types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

interface HeaderMenuProps {
  budgets: Budget[];
  selectedMainBudgetId: number | null;
  onSelect: (budget: Budget) => void;
  onManage: (budgetId: number) => void;
  onCreate: () => void;
}

export const HeaderMenu = React.memo(function HeaderMenu({
  budgets,
  selectedMainBudgetId,
  onSelect,
  onManage,
  onCreate,
}: HeaderMenuProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View style={styles.container}>
      {budgets.map((b) => {
        const isSelected = b.id === selectedMainBudgetId;
        return (
          <TouchableOpacity key={b.id} onPress={() => onSelect(b)} activeOpacity={0.75}>
            <View
              style={[
                styles.budgetPill,
                {
                  borderColor: isSelected
                    ? isDark ? Tavira.teal : theme.colors.primary
                    : isDark ? 'rgba(255,255,255,0.14)' : theme.colors.outline,
                  backgroundColor: isSelected
                    ? isDark ? 'rgba(62,198,198,0.15)' : theme.colors.primaryContainer
                    : 'transparent',
                },
              ]}
            >
              <View style={styles.pillContent}>
                <Icon
                  source="wallet-outline"
                  size={15}
                  color={isSelected
                    ? isDark ? Tavira.teal : theme.colors.primary
                    : isDark ? 'rgba(242,244,248,0.5)' : theme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isSelected
                        ? isDark ? Tavira.teal : theme.colors.primary
                        : isDark ? 'rgba(242,244,248,0.7)' : theme.colors.onSurfaceVariant,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {b.name}
                </Text>
                {isSelected && (
                  <TouchableOpacity onPress={() => onManage(b.id)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                    <Icon
                      source="cog-outline"
                      size={16}
                      color={isDark ? 'rgba(62,198,198,0.7)' : theme.colors.primary}
                    />
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
    paddingLeft: 16,
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  budgetPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 130,
    borderRadius: 10,
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
