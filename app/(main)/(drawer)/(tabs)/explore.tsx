import { ScreenContainer } from '@/components/ScreenContainer';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

export default function StatsScreen() {
  const theme = useTheme();
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Icon source="chart-line" size={64} color={theme.colors.primary} />
        <Text variant="titleLarge" style={styles.title}>Statistics</Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Charts and spending insights coming soon.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
