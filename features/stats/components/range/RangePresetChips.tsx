import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { isPresetSelected, PRESETS } from '../../model/ranges';
import type { RangeSelection } from '../../model/types';
import { useStatsColors } from '../primitives/useStatsColors';

type Props = {
  selection: RangeSelection;
  onSelect: (selection: RangeSelection) => void;
  onCustom: () => void;
};

export function RangePresetChips({ selection, onSelect, onCustom }: Props) {
  const c = useStatsColors();

  const chip = (key: string, label: string, active: boolean, onPress: () => void, icon?: string) => (
    <Pressable
      key={key}
      onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        s.chip,
        { backgroundColor: active ? c.accent : c.surface, borderColor: active ? c.accent : c.border },
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon ? <Icon source={icon} size={15} color={active ? c.onAccent : c.text} /> : null}
      <Text style={[s.label, { color: active ? c.onAccent : c.text }]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {PRESETS.map(p => chip(p.preset, p.label, isPresetSelected(selection, p.preset), () => onSelect({ kind: 'preset', preset: p.preset })))}
      {chip('custom', 'Custom', selection.kind === 'custom', onCustom, 'calendar-range')}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: { fontSize: 14, fontWeight: '600' },
});
