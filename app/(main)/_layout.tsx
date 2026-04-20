import { OverlayLoader } from "@/components/OverlayLoader";
import { AuthContext } from "@/context/AuthContext";
import { useBudgets } from "@/context/BudgetContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { Budget } from "@/types/Types";
import { useRoute } from "@react-navigation/native";
import { Redirect, usePathname, useRouter } from "expo-router";
import { Drawer } from 'expo-router/drawer';
import React, { useContext, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Icon, Text, useTheme } from "react-native-paper";
import { DrawerContent } from "../../components/DrawerContent";


export default function MainLayout() {
  const route = useRoute();
  const pathname = usePathname();
  const anchorRef = useRef<any>(null);

  const router = useRouter();
  const { title } = useTitle();
  const { user, userLoading } = useContext(AuthContext);
  const { setMainBudget, budgetState } = useBudgets();
  const { colors } = useTheme();
  const selectedMainBudget = budgetState.budgets.find(b => b.id == budgetState.selectedMainBudgetId);

  function onSelectMainBudget(budget: Budget) {
    setMainBudget(budget.id);
  }

  function onManageBudget(budgetId: number) {
    router.push({
      pathname: "/(main)/ManageBudget",
      params: { budgetId: budgetId },
    });
  }

  const HeaderMenu = () => {
    return (
      <View style={{ paddingLeft: 20, display: 'flex', flexDirection: 'row', gap: 5 }}>
        {budgetState.budgets.map(b =>
          <TouchableOpacity key={b.id} onPress={() => onSelectMainBudget(b)}>
            <View style={{ borderWidth: 1, padding: 10, height: 45, maxWidth: 115, borderColor: b.id == selectedMainBudget?.id ? '' : colors.primary, backgroundColor: b.id == selectedMainBudget?.id ? colors.primary : '', borderRadius: 10 }}  >
              <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                <Icon source="account-cash" size={18} />
                <Text>{b.name}</Text>
                {b.id == selectedMainBudget?.id &&
                  <TouchableOpacity onPress={() => onManageBudget(b.id)}>
                    <Icon source="cog" size={24} />
                  </TouchableOpacity>
                }
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  if (userLoading || budgetState.budgetLoading == 'loading') {
    return (
      <OverlayLoader isVisible={true} message="Loading..."></OverlayLoader>
    );
  }

  if (user == null) {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
    <>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          drawerPosition: "right",
          header: (props) => (
            <Appbar.Header>
              {(router.canGoBack() && !pathname.includes("explore") && !(pathname == "/")) && (
                <Appbar.BackAction onPress={() => router.back()} />
              )}
              {!(pathname == "/") && (<Text style={{ paddingLeft: 20 }}>{title}</Text>)}

              <View style={{ flex: 1 }} />
              <Appbar.Action icon="menu" onPress={() => { props.navigation.toggleDrawer(); }} />
            </Appbar.Header>
          ),
        }}
      >
        <Drawer.Screen name="(tabs)" options={{
          header: (props) => (
            <Appbar.Header>
              {(router.canGoBack() && !pathname.includes("explore") && !(pathname == "/")) && (
                <Appbar.BackAction onPress={() => router.back()} />
              )}
              <HeaderMenu></HeaderMenu>
              <View style={{ flex: 1 }} />
              <Appbar.Action icon="menu" onPress={() => { props.navigation.toggleDrawer(); }} />
            </Appbar.Header>
          )
        }}></Drawer.Screen>
        <Drawer.Screen name="CreateBudget" />
        <Drawer.Screen name="spending-group/SpendingDetails" />
      </Drawer>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 128,
    borderRadius: 28,
    elevation: 4,
  },
});
