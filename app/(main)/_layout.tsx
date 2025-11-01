import { ScreenContainer } from "@/components/ScreenContainer";
import { AuthContext } from "@/context/AuthContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRoute } from "@react-navigation/native";
import { Redirect, Slot, useRouter } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { DrawerContent } from "../../components/DrawerContent";
import CreateBudgetScreen from "./CreateBudget";
import SpendingDetailsScreen from "./spending-group/SpendingDetails";
const Drawer = createDrawerNavigator();

export default function MainLayout() {
  const route = useRoute();
console.log(route);

  const router = useRouter();
  const { title } = useTitle();
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <ScreenContainer>
        <Text>Loading...</Text>
      </ScreenContainer>
    );
  }

  if (user == null) {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          drawerPosition: "right",
          header: (props) => (
            <Appbar.Header>
              {router.canGoBack() && (
                <Appbar.BackAction onPress={() => router.back()} />
              )}
              <Appbar.Content title={title} />
              <Appbar.Action icon="menu" onPress={() => props.navigation.toggleDrawer()} />
            </Appbar.Header>
          ),
        }}
      >
        <Drawer.Screen name="Tabs" component={Slot} />
        <Drawer.Screen name="spending-group/SpendingDetails" component={SpendingDetailsScreen} />
        <Drawer.Screen name="CreateBudget" component={CreateBudgetScreen} />
      </Drawer.Navigator>
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
