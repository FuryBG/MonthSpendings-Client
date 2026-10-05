import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useStatsColors } from './useStatsColors';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ children, style }: Props) {
  const c = useStatsColors();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.border }, style]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
});
