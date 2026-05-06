import { OverlayLoader } from "@/components/OverlayLoader";
import { Tavira } from "@/constants/theme";
import { useBudgetsQuery } from "@/hooks/useBudgetQueries";
import { useAuthStore } from "@/stores/authStore";
import { useBudgetUIStore } from "@/stores/budgetUIStore";
import { useTitleStore } from "@/stores/titleStore";
import { Redirect, Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainLayout() {
  const router = useRouter();
  const title = useTitleStore((s) => s.title);
  const user = useAuthStore((s) => s.user);
  const userLoading = useAuthStore((s) => s.userLoading);
  const { data: budgets, isLoading: budgetsLoading } = useBudgetsQuery();
  const selectedMainBudgetId = useBudgetUIStore((s) => s.selectedMainBudgetId);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
    return <OverlayLoader isVisible={true} message="Loading…" />;
  }

  if (user == null) {
    return <Redirect href="/(auth)/Login" />;
  }

  const headerBg = theme.dark ? Tavira.navy : theme.colors.background;
  const headerBorder = theme.dark ? 'rgba(255,255,255,0.08)' : theme.colors.outlineVariant;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ navigation, options }) => (
          <Appbar.Header
            style={[
              styles.header,
              {
                backgroundColor: headerBg,
                borderBottomColor: headerBorder,
              },
            ]}
            statusBarHeight={insets.top}
          >
            {navigation.canGoBack() && (
              <Appbar.BackAction
                onPress={() => router.back()}
                iconColor={theme.dark ? Tavira.teal : theme.colors.primary}
              />
            )}
            <Appbar.Content
              title={options.title ?? title}
              titleStyle={[
                styles.headerTitle,
                { color: theme.dark ? '#F2F4F8' : theme.colors.onBackground },
              ]}
            />
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
      <Stack.Screen name="ConnectSaltEdgeBank" options={{ title: 'Connect Bank' }} />
      <Stack.Screen name="ConnectSaltEdgePending" options={{ title: 'Connecting…' }} />
      <Stack.Screen name="ConnectSaltEdgeSuccess" options={{ title: 'Connected!' }} />
      <Stack.Screen name="ConnectSaltEdgeError" options={{ title: 'Connection Failed' }} />
      <Stack.Screen name="Invites" options={{ title: 'Invitations' }} />
      <Stack.Screen name="spending-group/SpendingDetails" options={{ title: 'Spending Details' }} />
      <Stack.Screen name="SavingsPots" options={{ title: 'Savings Pots' }} />
      <Stack.Screen name="SavingsPotDetail" options={{ title: 'Savings Pot' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
