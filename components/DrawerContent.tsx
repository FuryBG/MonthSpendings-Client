import { useAuthStore } from "@/stores/authStore";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Badge, Button, Text, useTheme } from "react-native-paper";

export function DrawerContent(props: any) {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  if (!user) return null;

  function onCreateBudget() {
    router.push("/(main)/CreateBudget");
  }

  function onInvitations() {
    router.push("/(main)/Invites");
  }

  function onConnectBank() {
    router.push("/(main)/ConnectBank");
  }

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.surface }}>
      <View style={styles.root}>
        <View style={styles.userRow}>
          <Avatar.Icon size={36} icon="account" />
          <Text>{user.email}</Text>
        </View>
        <View style={styles.actionColumn}>
          <Button icon={"plus"} mode="contained" onPress={onCreateBudget}>Create Budget</Button>
          <View>
            <Button icon={"account-plus"} mode="contained" onPress={onInvitations}>Invitations</Button>
            {user.receivedBudgetInvites.length > 0 && <Badge style={styles.badge}>{user.receivedBudgetInvites.length}</Badge>}
          </View>
        </View>
      </View>
      <Button style={styles.connectButton} icon={"account"} mode="contained" onPress={onConnectBank}>Connect Bank</Button>
      <Button icon={"account"} mode="contained" onPress={async () => await signOut()}>Logout</Button>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 20,
  },
  actionColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 20,
  },
  badge: {
    backgroundColor: "red",
    color: "white",
    position: 'absolute',
    top: -4,
    right: -4,
  },
  connectButton: {
    marginBottom: 10,
  },
});
