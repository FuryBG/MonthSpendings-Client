import React, { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme, } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean | null;
}

export const ScreenContainer = ({ children, scrollable = false }: ScreenContainerProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      paddingBottom: 0
    },
     container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 0,
      // marginBottom: -insets.bottom,
    },
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {scrollable ?
        <ScrollView style={styles.container}>{children}</ScrollView> :
        <View style={styles.container}>{children}</View>
      }
    </SafeAreaView>
  );
};
