import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { COMPARE_A_COLOR, COMPARE_B_COLOR } from '../../model/palette';
import type { ResolvedRange } from '../../model/types';
import { useStatsColors } from '../primitives/useStatsColors';

type Props = {
  rangeA: ResolvedRange;
  rangeB: ResolvedRange;
  onEditB: () => void;
  onClose: () => void;
};

/** Compact "A vs B" bar shown while comparing; tap B to change it, × to stop comparing. */
export function CompareHeader({ rangeA, rangeB, onEditB, onClose }: Props) {
  const c = useStatsColors();
  return (
    <View style={[s.root, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={s.side}>
        <View style={[s.dot, { backgroundColor: COMPARE_A_COLOR }]} />
        <Text style={[s.label, { color: c.text }]} numberOfLines={1}>{rangeA.label}</Text>
      </View>
      <Text style={[s.vs, { color: c.faint }]}>vs</Text>
      <Pressable onPress={onEditB} style={({ pressed }) => [s.side, pressed && { opacity: 0.6 }]} accessibilityLabel="Change comparison range">
        <View style={[s.dot, { backgroundColor: COMPARE_B_COLOR }]} />
        <Text style={[s.label, { color: c.text }]} numberOfLines={1}>{rangeB.label}</Text>
        <Icon source="chevron-down" size={16} color={c.muted} />
      </Pressable>
      <Pressable onPress={onClose} hitSlop={10} style={s.close} accessibilityLabel="Stop comparing">
        <Icon source="close" size={18} color={c.muted} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 6,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  vs: { fontSize: 13 },
  close: { marginLeft: 'auto', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
