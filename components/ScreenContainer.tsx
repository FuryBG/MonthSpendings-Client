import React, { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
}

export const ScreenContainer = ({ children }: ScreenContainerProps) => {
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
      marginBottom: -insets.bottom,
    },
  });
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.container}>{children}</ScrollView>
    </SafeAreaView>
  );
};
