import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useStatsColors } from './useStatsColors';

type Props = {
  icon: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  const c = useStatsColors();
  return (
    <View style={s.root}>
      <View style={[s.iconWrap, { backgroundColor: c.track }]}>
        <Icon source={icon} size={28} color={c.muted} />
      </View>
      <Text style={[s.title, { color: c.text }]}>{title}</Text>
      <Text style={[s.body, { color: c.muted }]}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [s.button, { backgroundColor: c.accent }, pressed && { opacity: 0.85 }]}
        >
          <Text style={[s.buttonText, { color: c.onAccent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 24, gap: 8 },
  iconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 300 },
  button: { marginTop: 12, borderRadius: 14, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700' },
});
