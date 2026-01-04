import { useAuth } from "@/context/AuthContext";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Badge, Button, Text, useTheme } from "react-native-paper";

export function DrawerContent(props: any) {
  const theme = useTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();

  function onCreateBudget() {
    router.push("/(main)/CreateBudget");
  }

  function onInvitations() {
    router.push("/(main)/Invites");
  }

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.surface }}>
      <View style={{flex: 1}}>
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 20 }}>
          <Avatar.Icon size={36} icon="account" />
          <Text>{user!.email}</Text>
        </View>
        <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, paddingBottom: 20 }}>
          <Button icon={"plus"} mode="contained" onPress={onCreateBudget}>Create Budget</Button>
          <View>
            <Button icon={"account-plus"} mode="contained" onPress={onInvitations}>Invitations</Button>
            {user!.receivedBudgetInvites.length > 0 && <Badge style={styles.badge}>{user!.receivedBudgetInvites.length}</Badge> }
           
          </View>
        </View>

      </View>
      <Button icon={"account"} mode="contained" onPress={async () => await signOut()}>Logout</Button>
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
