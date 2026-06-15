import { OverlayLoader } from "@/components/OverlayLoader";
import { Tavira } from "@/constants/theme";
import { useBudgetsQuery } from "@/hooks/useBudgetQueries";
import { useAuthStore } from "@/stores/authStore";
import { useAmountVisibilityStore } from "@/stores/amountVisibilityStore";
import { useBudgetUIStore } from "@/stores/budgetUIStore";
import { useTitleStore } from "@/stores/titleStore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
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
    GoogleSignin.configure({ webClientId: "39532728902-fqpfrpmt101jr4v956vr1ufmsnea76bg.apps.googleusercontent.com" });
    useBudgetUIStore.getState().loadMainBudgetId();
    useAmountVisibilityStore.getState().loadHidden();
  }, []);

  useEffect(() => {
    if (!budgets || budgets.length === 0) return;
    const selected = budgets.find(b => b.id === selectedMainBudgetId);
    if (!selected) {
      useBudgetUIStore.getState().setMainBudget(budgets[0].id);
    }
  }, [budgets, selectedMainBudgetId]);

  if (userLoading || budgetsLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size={36} color={Tavira.teal} />
          <Text style={styles.loadingMessage}>Loading…</Text>
        </View>
      </View>
    );
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
      <Stack.Screen name="ConnectedBanks" options={{ title: 'Connected Banks' }} />
      <Stack.Screen name="Invites" options={{ title: 'Invitations' }} />
      <Stack.Screen name="spending-group/SpendingDetails" options={{ title: 'Spending Details' }} />
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
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(7,18,40,0.75)',
  },
  loadingCard: {
    backgroundColor: 'rgba(15,34,68,0.97)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Tavira.glassBorder,
    minWidth: 180,
  },
  loadingMessage: {
    color: 'rgba(242,244,248,0.8)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
