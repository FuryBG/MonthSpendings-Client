import { useAuth } from "@/context/AuthContext";
import { useBudgets } from "@/context/BudgetContext";
import { Budget } from "@/types/Types";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Badge, Button, IconButton, List, MD2Colors, Text, useTheme } from "react-native-paper";

export function DrawerContent(props: any) {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { budgets, setMainBudget } = useBudgets();

  function onCreateBudget() {
    router.push("/(main)/CreateBudget");
  }

    function onInvitations() {
    router.push("/(main)/Invites");
  }

  function onManageBudget(budgetId: number) {
    router.push({ pathname: "/(main)/ManageBudget", params: { budgetId: budgetId } });
  }

  function onSelectMainBudget(budget: Budget) {
    setMainBudget(budget.id);

    setTimeout(() => {
      router.back();
    }, 50);
  }

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.surface }}>
      {user == null ?
        <DrawerItem label="Login" onPress={() => router.replace("/(auth)/Login")} />
        : <View>
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 20 }}>
            <Avatar.Icon size={36} icon="account" />
            <Text>{user.email}</Text>
          </View>
          <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, paddingBottom: 20 }}>
            <Button icon={"plus"} mode="contained" onPress={onCreateBudget}>Create Budget</Button>
            <View>
              <Button icon={"account-plus"} mode="contained" onPress={onInvitations}>Invitations</Button>
              <Badge style={styles.badge}>{user.receivedBudgetInvites.length}</Badge>
            </View>
          </View>
          <View>
            <List.Accordion title="Budgets" id="1">
              {budgets.map(b =>
                <List.Item left={props => <List.Icon {...props} icon="account-cash" />} right={props => <IconButton icon="cog" iconColor={MD2Colors.white} onPress={() => onManageBudget(b.id)} />} onPress={() => onSelectMainBudget(b)} key={b.id} title={b.name} />
              )}
            </List.Accordion>
          </View>
          <Button icon={"account"} mode="contained" onPress={async () => await signOut()}>Logout</Button>
        </View>}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    backgroundColor: "red",
    color: "white",
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
