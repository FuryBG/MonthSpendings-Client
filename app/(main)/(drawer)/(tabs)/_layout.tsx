import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/IconSymbol";
import { Tavira } from "@/constants/theme";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_CONTENT_HEIGHT = Platform.OS === 'ios' ? 50 : 56;

export default function TabsLayout() {
  const theme = useTheme();
  const isDark = theme.dark;
  const insets = useSafeAreaInsets();

  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: isDark ? Tavira.teal : theme.colors.primary,
        tabBarInactiveTintColor: isDark ? 'rgba(242,244,248,0.38)' : 'rgba(11,27,58,0.4)',
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: insets.bottom,
            backgroundColor: isDark ? 'rgba(11,27,58,0.96)' : theme.colors.background,
            borderTopColor: isDark ? 'rgba(255,255,255,0.09)' : theme.colors.outlineVariant,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && isDark ? styles.activeIconWrap : undefined}>
              <IconSymbol size={24} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && isDark ? styles.activeIconWrap : undefined}>
              <IconSymbol size={24} name="chart.bar.fill" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabIcon: {
    marginTop: 4,
  },
  activeIconWrap: {
    backgroundColor: 'rgba(62,198,198,0.12)',
    borderRadius: 10,
    padding: 4,
  },
});
