import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { COMPARE_A_COLOR, COMPARE_B_COLOR } from '../../model/palette';
import { useStatsColors } from './useStatsColors';

type Props = {
  labelA: string;
  labelB: string;
};

/** "● Last 3 periods  ● 29 Apr – 27 Jul": names the two colours used in compare mode. */
export function RangeLegend({ labelA, labelB }: Props) {
  const c = useStatsColors();
  return (
    <View style={s.legend}>
      {[{ color: COMPARE_A_COLOR, label: labelA }, { color: COMPARE_B_COLOR, label: labelB }].map(item => (
        <View key={item.color} style={s.item}>
          <View style={[s.dot, { backgroundColor: item.color }]} />
          <Text style={[s.text, { color: c.text }]} numberOfLines={1}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: '600' },
});
