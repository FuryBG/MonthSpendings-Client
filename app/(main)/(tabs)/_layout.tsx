import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useTheme } from "react-native-paper";
import HomeScreen from ".";
import ExploreScreen from "./explore";

const Tabs = createBottomTabNavigator();

export default function TabsLayout() {
  const theme = useTheme();
    
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false, tabBarButton: HapticTab }}>
      <Tabs.Screen
        name="index"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarActiveTintColor: theme.colors.primary,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={theme.colors.primary} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        component={ExploreScreen}
        options={{
          title: "Explore",
          tabBarActiveTintColor: theme.colors.primary,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={theme.colors.primary} />,
        }}
      />
    </Tabs.Navigator>
  );
}
