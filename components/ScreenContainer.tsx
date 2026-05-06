import { Tavira } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean | null;
  removeSafeBottom?: boolean | null;
  topEdge?: boolean;
  glowColor?: 'teal' | 'purple';
}

export const ScreenContainer = ({
  children,
  scrollable = false,
  removeSafeBottom = false,
  topEdge = false,
  glowColor,
}: ScreenContainerProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme.dark;

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

  const glowStyle = glowColor
    ? {
        position: 'absolute' as const,
        top: -30,
        right: -20,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: glowColor === 'teal' ? Tavira.glowTeal : Tavira.glowPurple,
        opacity: 0.6,
      }
    : null;

  if (isDark) {
    return (
      <LinearGradient
        colors={Tavira.gradNavy}
        style={styles.flex}
      >
        {glowStyle && <View style={glowStyle} />}
        <SafeAreaView edges={edges} style={styles.safeArea}>
          {scrollable ? (
            <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            <View style={dynamicStyles.container}>{children}</View>
          )}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {glowStyle && <View style={glowStyle} />}
      {scrollable ? (
        <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={dynamicStyles.container}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 0,
    paddingTop: 10,
  },
});
