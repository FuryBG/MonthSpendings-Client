import { AuthContext } from "@/context/AuthContext";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { View } from "react-native";
import { Avatar, Button, Text, useTheme } from "react-native-paper";

export function DrawerContent(props: any) {
  const theme = useTheme();
  const router = useRouter();
  const { signOut, user } = useContext(AuthContext);


  function openModal() {
    router.push("/CreateBudget")
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
          <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
            <Button icon={"plus"} mode="contained" onPress={openModal}>Create Budget </Button>
            <Button icon={"account"} mode="contained" onPress={async () => await signOut()}>Logout</Button>
          </View>
        </View>}
    </DrawerContentScrollView>
  );
}
