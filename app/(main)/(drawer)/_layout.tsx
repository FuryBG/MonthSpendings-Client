import { DrawerContent } from '@/components/DrawerContent';
import { HeaderMenu } from '@/components/HeaderMenu';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { Budget } from '@/types/Types';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';

export default function DrawerLayout() {
  const router = useRouter();
  const { data: budgets = [] } = useBudgetsQuery();
  const { selectedMainBudgetId, setMainBudget } = useBudgetUIStore();

  const onSelectMainBudget = useCallback(
    (budget: Budget) => {
      setMainBudget(budget.id);
    },
    [setMainBudget]
  );

  const onManageBudget = useCallback(
    (budgetId: number) => {
      router.push({
        pathname: '/(main)/ManageBudget',
        params: { budgetId },
      });
    },
    [router]
  );

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'right',
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          header: (props) => (
            <Appbar.Header>
              <HeaderMenu
                budgets={budgets}
                selectedMainBudgetId={selectedMainBudgetId}
                onSelect={onSelectMainBudget}
                onManage={onManageBudget}
              />
              <View style={{ flex: 1 }} />
              <Appbar.Action
                icon="menu"
                onPress={() => props.navigation.toggleDrawer()}
              />
            </Appbar.Header>
          ),
        }}
      />
    </Drawer>
  );
}
