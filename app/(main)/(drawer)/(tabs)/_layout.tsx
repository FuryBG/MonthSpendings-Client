import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/IconSymbol";
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.colors.primary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarActiveTintColor: theme.colors.primary,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={theme.colors.primary} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarActiveTintColor: theme.colors.primary,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={theme.colors.primary} />,
        }}
      />
    </Tabs>
  );
}
