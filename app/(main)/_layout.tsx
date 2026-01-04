import { OverlayLoader } from "@/components/OverlayLoader";
import { AuthContext } from "@/context/AuthContext";
import { useBudgets } from "@/context/BudgetContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { Budget } from "@/types/Types";
import { useRoute } from "@react-navigation/native";
import { Redirect, usePathname, useRouter } from "expo-router";
import { Drawer } from 'expo-router/drawer';
import React, { useContext, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Appbar, Menu, Text } from "react-native-paper";
import { DrawerContent } from "../../components/DrawerContent";


export default function MainLayout() {
  const route = useRoute();
  const pathname = usePathname();
  const anchorRef = useRef<any>(null);

  const router = useRouter();
  const { title } = useTitle();
  const { user, loading } = useContext(AuthContext);
  const { budgets, setMainBudget, loading: budgetsLoading, selectedMainBudgetId } = useBudgets();
  const [visible, setVisible] = useState(false);

  const selectedMainBudget = budgets.find(b => b.id == selectedMainBudgetId);

  function onManageBudget(budgetId: number) {
    router.push({ pathname: "/(main)/ManageBudget", params: { budgetId: budgetId } });
    setVisible(false);
  }

  function onSelectMainBudget(budget: Budget) {
    setMainBudget(budget.id);
    setVisible(false);
  }



  const HeaderMenu = () => {
    return (
      <View style={{ paddingLeft: 20 }}>
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchorPosition="bottom"
          anchor={
            <Pressable
              ref={anchorRef}
              onPress={() => setVisible(true)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text>{selectedMainBudget?.name}</Text>
              <Appbar.Action icon="menu-down" />
            </Pressable>
          }>
          {budgets.map(b =>
            <Menu.Item key={b.id} title={b.name} onPress={() => onSelectMainBudget(b)} trailingIcon={({ size, color }) => (
              <Pressable
                onPress={() => onManageBudget(b.id)}>
                <Appbar.Action icon="cog" style={{ paddingBottom: 0, paddingRight: 20 }} color={color} size={size} />
              </Pressable>
            )} />
          )}
        </Menu>
      </View>
    )
  }

  if (loading || budgetsLoading) {
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
