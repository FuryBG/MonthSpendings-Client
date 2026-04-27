import React, { ReactNode, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { Edge, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean | null;
  removeSafeBottom?: boolean | null;
  topEdge?: boolean;
}

export const ScreenContainer = ({ children, scrollable = false, removeSafeBottom = false, topEdge = false }: ScreenContainerProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const edges: Edge[] = topEdge
    ? ['top', 'bottom', 'left', 'right']
    : ['bottom', 'left', 'right'];

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          paddingHorizontal: 16,
          paddingBottom: 0,
          marginBottom: removeSafeBottom ? -insets.bottom : 0,
        },
      }),
    [insets.bottom, removeSafeBottom]
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {scrollable ?
        <ScrollView style={dynamicStyles.container}>{children}</ScrollView> :
        <View style={dynamicStyles.container}>{children}</View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: 0,
    paddingTop: 10,
  },
});
