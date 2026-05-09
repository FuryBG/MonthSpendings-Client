import { DrawerContent } from '@/components/DrawerContent';
import { HeaderMenu } from '@/components/HeaderMenu';
import { Tavira } from '@/constants/theme';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { useOrderStore } from '@/stores/orderStore';
import { Budget } from '@/types/Types';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DrawerLayout() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data: budgets = [] } = useBudgetsQuery();
  const { selectedMainBudgetId, setMainBudget } = useBudgetUIStore();
  const user = useAuthStore((s) => s.user);
  const { loadOrders } = useOrderStore();

  const budgetIdsKey = budgets.map((b) => b.id).join(',');

  useEffect(() => {
    if (user && budgets.length > 0) {
      loadOrders(user.id, budgets.map((b) => b.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, budgetIdsKey]);

  const onSelectMainBudget = useCallback((budget: Budget) => {
    setMainBudget(budget.id);
  }, [setMainBudget]);

  const onManageBudget = useCallback((budgetId: number) => {
    router.push({ pathname: '/(main)/ManageBudget', params: { budgetId } });
  }, [router]);

  const onCreate = useCallback(() => router.push('/CreateBudget'), [router]);

  const headerBg = theme.dark ? Tavira.navy : theme.colors.background;
  const headerBorder = theme.dark ? 'rgba(255,255,255,0.08)' : theme.colors.outlineVariant;

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: theme.dark ? Tavira.navy : theme.colors.background,
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          header: (props) => (
            <Appbar.Header
              style={[styles.header, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}
              statusBarHeight={insets.top}
            >
              <HeaderMenu
                budgets={budgets}
                selectedMainBudgetId={selectedMainBudgetId}
                onSelect={onSelectMainBudget}
                onManage={onManageBudget}
                onCreate={onCreate}
              />
              <Appbar.Action
                icon="menu"
                onPress={() => props.navigation.toggleDrawer()}
                iconColor={theme.dark ? Tavira.teal : theme.colors.primary}
              />
            </Appbar.Header>
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    borderBottomWidth: 1,
  },
});
