import { OverlayLoader } from "@/components/OverlayLoader";
import { AuthContext } from "@/context/AuthContext";
import { useBudgets } from "@/context/BudgetContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { useRoute } from "@react-navigation/native";
import { Redirect, usePathname, useRouter } from "expo-router";
import { Drawer } from 'expo-router/drawer';
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import { DrawerContent } from "../../components/DrawerContent";


export default function MainLayout() {
  const route = useRoute();
  const pathname = usePathname();

  const router = useRouter();
  const { title } = useTitle();
  const { user, loading } = useContext(AuthContext);
  const { loading: budgetsLoading } = useBudgets();

  if (loading || budgetsLoading) {
    return (
      <OverlayLoader isVisible={true} message="Loading..."></OverlayLoader>
    );
  }

  if (user == null) {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerPosition: "right",
        header: (props) => (
          <Appbar.Header>
            {(router.canGoBack() && !pathname.includes("explore") && !(pathname == "/")) && (
              <Appbar.BackAction onPress={() => router.back()} />
            )}
            <Appbar.Content title={title} />
            <Appbar.Action icon="menu" onPress={() => { props.navigation.toggleDrawer(); }} />
          </Appbar.Header>
        ),
      }}
    >
      <Drawer.Screen name="(tabs)"></Drawer.Screen>
      <Drawer.Screen name="CreateBudget" />
      <Drawer.Screen name="spending-group/SpendingDetails" />
    </Drawer>
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
