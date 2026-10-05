import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useStatsColors } from './useStatsColors';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, subtitle, actionLabel, onAction }: Props) {
  const c = useStatsColors();
  return (
    <View style={s.row}>
      <View style={s.titles}>
        <Text style={[s.title, { color: c.text }]}>{title}</Text>
        {subtitle ? <Text style={[s.subtitle, { color: c.muted }]}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={12} style={({ pressed }) => [s.action, pressed && { opacity: 0.6 }]}>
          <Text style={[s.actionText, { color: c.dark ? c.accent : '#3E5BDB' }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  titles: { flex: 1, gap: 2 },
  title: { fontSize: 19, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { fontSize: 13 },
  action: { minHeight: 32, justifyContent: 'center' },
  actionText: { fontSize: 14, fontWeight: '600' },
});
