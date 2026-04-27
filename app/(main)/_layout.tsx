import { OverlayLoader } from "@/components/OverlayLoader";
import { useBudgetsQuery } from "@/hooks/useBudgetQueries";
import { useAuthStore } from "@/stores/authStore";
import { useBudgetUIStore } from "@/stores/budgetUIStore";
import { useTitleStore } from "@/stores/titleStore";
import { Redirect, Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Appbar } from "react-native-paper";

export default function MainLayout() {
  const router = useRouter();
  const title = useTitleStore((s) => s.title);
  const user = useAuthStore((s) => s.user);
  const userLoading = useAuthStore((s) => s.userLoading);
  const { data: budgets, isLoading: budgetsLoading } = useBudgetsQuery();
  const selectedMainBudgetId = useBudgetUIStore((s) => s.selectedMainBudgetId);

  useEffect(() => {
    useBudgetUIStore.getState().loadMainBudgetId();
  }, []);

  useEffect(() => {
    if (!budgets || budgets.length === 0) return;
    const selected = budgets.find(b => b.id === selectedMainBudgetId);
    if (!selected) {
      useBudgetUIStore.getState().setMainBudget(budgets[0].id);
    }
  }, [budgets, selectedMainBudgetId]);

  if (userLoading || budgetsLoading) {
    return <OverlayLoader isVisible={true} message="Loading..." />;
  }

  if (user == null) {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ navigation, options }) => (
          <Appbar.Header>
            {navigation.canGoBack() && (
              <Appbar.BackAction onPress={() => router.back()} />
            )}
            <Appbar.Content title={options.title ?? title} />
            {options.headerRight?.({ canGoBack: navigation.canGoBack() })}
          </Appbar.Header>
        ),
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="ManageBudget" options={{ title: 'Manage Budget' }} />
      <Stack.Screen name="CreateBudget" options={{ title: 'Create Budget' }} />
      <Stack.Screen name="PendingTransactions" options={{ title: 'Pending Transactions' }} />
      <Stack.Screen name="ConnectBank" options={{ title: 'Connect Bank' }} />
      <Stack.Screen name="ConnectBankSuccess" options={{ title: 'Success' }} />
      <Stack.Screen name="ConnectBankError" options={{ title: 'Error' }} />
      <Stack.Screen name="Invites" options={{ title: 'Invitations' }} />
      <Stack.Screen name="spending-group/SpendingDetails" options={{ title: 'Spending Details' }} />
      <Stack.Screen name="SavingsPots" options={{ headerShown: false }} />
      <Stack.Screen name="SavingsPotDetail" options={{ title: 'Savings Pot' }} />
    </Stack>
  );
}
