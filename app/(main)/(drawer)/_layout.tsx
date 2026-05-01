import { DrawerContent } from '@/components/DrawerContent';
import { HeaderMenu } from '@/components/HeaderMenu';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { Budget } from '@/types/Types';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Appbar, Button } from 'react-native-paper';

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

  const onCreate = useCallback((() =>
    router.push('/CreateBudget')
  ),
    [router]);

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
                onCreate={onCreate}
              />
              {budgets.length == 0 &&
                <Button icon={'plus'} mode="contained" onPress={() => onCreate()}>
                  Create Budget
                </Button>
              }

              <View style={{ flex: 1, }} />
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
