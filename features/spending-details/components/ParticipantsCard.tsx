import { MaskedAmount } from '@/components/MaskedAmount';
import { Tavira } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import type { ParticipantShare } from '../model/participants';
import { ParticipantAvatar } from './ParticipantAvatar';

type Props = {
  participants: ParticipantShare[];
  symbol: string;
  selectedUserId: number | null;
  onSelect: (userId: number | null) => void;
};

/** Rows shown before "Show all"; the list is sorted by amount, so these are the biggest spenders. */
const COLLAPSED_COUNT = 2;

function money(amount: number, symbol: string) {
  return `${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

/** Who spent how much in this category; tap a person to filter the list to their spendings. */
export function ParticipantsCard({ participants, symbol, selectedUserId, onSelect }: Props) {
  const theme = useTheme();
  const dark = theme.dark;
  const text = dark ? '#F2F4F8' : theme.colors.onSurface;
  const muted = theme.colors.onSurfaceVariant;
  const track = dark ? 'rgba(255,255,255,0.08)' : 'rgba(11,27,58,0.06)';
  const anySpent = participants.some(p => p.spent > 0);
  const [expanded, setExpanded] = useState(false);

  const canExpand = participants.length > COLLAPSED_COUNT;
  // A filtered person always stays visible, even if they're not in the top rows.
  const visible = expanded || !canExpand
    ? participants
    : participants.filter((p, i) => i < COLLAPSED_COUNT || p.userId === selectedUserId);

  const toggle = (userId: number) => {
    Haptics.selectionAsync().catch(() => {});
    onSelect(selectedUserId === userId ? null : userId);
  };

  return (
    <View style={[s.card, { backgroundColor: dark ? Tavira.glassBg : theme.colors.surfaceVariant, borderColor: dark ? Tavira.glassBorder : 'transparent' }]}>
      <View style={s.header}>
        <Text style={[s.title, { color: text }]}>Who spent</Text>
        {selectedUserId != null ? (
          <Pressable onPress={() => onSelect(null)} hitSlop={10} style={s.clear} accessibilityLabel="Show everyone's spendings">
            <Text style={[s.clearText, { color: muted }]}>Show everyone</Text>
            <Icon source="close" size={14} color={muted} />
          </Pressable>
        ) : (
          <Text style={[s.hint, { color: muted }]}>Tap a person to filter</Text>
        )}
      </View>

      {anySpent ? (
        <View style={[s.stack, { backgroundColor: track }]}>
          {participants.filter(p => p.spent > 0).map(p => (
            <View
              key={p.userId}
              style={{ flex: p.spent, backgroundColor: p.color, opacity: selectedUserId == null || selectedUserId === p.userId ? 1 : 0.25 }}
            />
          ))}
        </View>
      ) : null}

      {visible.map(p => {
        const selected = selectedUserId === p.userId;
        const dimmed = selectedUserId != null && !selected;
        return (
          <Pressable
            key={p.userId}
            onPress={() => toggle(p.userId)}
            style={({ pressed }) => [s.row, selected && { backgroundColor: track }, (pressed || dimmed) && { opacity: dimmed ? 0.45 : 0.7 }]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${p.isYou ? 'You' : p.name} spent ${money(p.spent, symbol)}, ${p.share.toFixed(0)} percent`}
          >
            <ParticipantAvatar name={p.name} photoUrl={p.photoUrl} color={p.color} />
            <View style={s.rowText}>
              <Text style={[s.name, { color: text }]} numberOfLines={1}>{p.isYou ? 'You' : p.name}</Text>
              <Text style={[s.meta, { color: muted }]}>
                {p.count === 0 ? 'Nothing spent' : `${p.count} ${p.count === 1 ? 'spending' : 'spendings'}, ${p.share.toFixed(0)}%`}
              </Text>
            </View>
            <MaskedAmount value={money(p.spent, symbol)} style={[s.amount, { color: p.spent > 0 ? Tavira.expense : muted }]} />
          </Pressable>
        );
      })}

      {canExpand ? (
        <Pressable
          onPress={() => setExpanded(e => !e)}
          style={({ pressed }) => [s.more, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
        >
          <Text style={[s.moreText, { color: dark ? Tavira.teal : '#3E5BDB' }]}>
            {expanded ? 'Show fewer' : `Show all ${participants.length}`}
          </Text>
          <Icon source={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={dark ? Tavira.teal : '#3E5BDB'} />
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12, gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  hint: { fontSize: 12 },
  clear: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 28 },
  clearText: { fontSize: 12, fontWeight: '600' },
  stack: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 12 },
  rowText: { flex: 1, gap: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12 },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 40, marginTop: 2 },
  moreText: { fontSize: 13, fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
