import { MaskedAmount } from '@/components/MaskedAmount';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { TimelinePoint } from '../../model/compare';
import { formatMoneyTiny, formatMonth, formatShortDate } from '../../model/format';
import { COMPARE_A_COLOR, COMPARE_B_COLOR } from '../../model/palette';
import { useStatsColors } from '../primitives/useStatsColors';
import type { BarGeometry } from './PeriodBarChart';

type Props = {
  points: TimelinePoint[];
  compare: boolean;
  symbol: string;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  geometry: BarGeometry;
  width: number;
};

/** Beyond this many bars there is no room for amounts; dates shrink to months. */
const DETAILED_MAX = 6;

/**
 * Date and amount under every bar, at the x positions the chart drew them at.
 * In compare mode the amount takes its range's colour. Tapping a label selects that bar.
 */
export function PeriodAxisLabels({ points, compare, symbol, selectedIndex, onSelect, geometry, width }: Props) {
  const c = useStatsColors();
  const { xs } = geometry;
  const detailed = points.length <= DETAILED_MAX;
  const slot = xs.length > 1 ? xs[1] - xs[0] : width;

  return (
    <View style={[s.row, { width, height: detailed ? 40 : 22 }]}>
      {points.map((p, i) => {
        const selected = selectedIndex === p.index;
        const amountColor = compare ? (p.side === 'A' ? COMPARE_A_COLOR : COMPARE_B_COLOR) : c.text;
        return (
          <Pressable
            key={p.period.periodId}
            onPress={() => { Haptics.selectionAsync().catch(() => {}); onSelect(p.index); }}
            style={[s.cell, { left: xs[i] - slot / 2, width: slot }, selected && { backgroundColor: c.track }]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              style={[s.date, { color: selected ? c.text : c.muted }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {detailed ? formatShortDate(p.period.startDate) : formatMonth(p.period.startDate)}
            </Text>
            {detailed ? (
              <MaskedAmount
                value={formatMoneyTiny(p.total, symbol)}
                style={[s.amount, { color: amountColor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { marginTop: 6 },
  cell: { position: 'absolute', top: 0, bottom: 0, borderRadius: 8, alignItems: 'center', paddingTop: 3, paddingHorizontal: 2 },
  date: { fontSize: 11 },
  amount: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
