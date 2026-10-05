import { MaskedAmount } from '@/components/MaskedAmount';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { CategoryLine } from '../model/compare';
import { formatMoney } from '../model/format';
import { categoryColor, COMPARE_A_COLOR, COMPARE_B_COLOR } from '../model/palette';
import { DiffChip } from './primitives/DiffChip';
import { useStatsColors } from './primitives/useStatsColors';

type Props = {
  line: CategoryLine;
  maxAmount: number;
  symbol: string;
  focused: boolean;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
};

export function CategoryRow({ line, maxAmount, symbol, focused, onPress, onPressIn, onPressOut }: Props) {
  const c = useStatsColors();
  const comparing = line.amountB != null;
  const pct = (amount: number) => (maxAmount > 0 ? (amount / maxAmount) * 100 : 0);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [s.row, (pressed || focused) && { backgroundColor: c.track }]}
      accessibilityRole="button"
      accessibilityLabel={`${line.name}, ${formatMoney(line.amountA, symbol)}${comparing ? `, compared with ${formatMoney(line.amountB ?? 0, symbol)}` : ''}`}
    >
      <View style={s.top}>
        <View style={[s.swatch, { backgroundColor: categoryColor(line.categoryId, line.isDeleted) }]} />
        <Text style={[s.name, { color: c.text }]} numberOfLines={1}>{line.name}</Text>
        {line.isDeleted ? <Text style={[s.deleted, { color: c.faint, borderColor: c.border }]}>Deleted</Text> : null}
        <View style={s.spacer} />
        {comparing && line.diff
          ? <DiffChip diff={line.diff} symbol={symbol} compact />
          : <MaskedAmount value={formatMoney(line.amountA, symbol)} style={[s.amount, { color: c.text }]} />}
      </View>

      {comparing ? (
        <View style={s.bars}>
          <BarLine color={COMPARE_A_COLOR} width={pct(line.amountA)} amount={formatMoney(line.amountA, symbol)} strong />
          <BarLine color={COMPARE_B_COLOR} width={pct(line.amountB ?? 0)} amount={formatMoney(line.amountB ?? 0, symbol)} />
        </View>
      ) : (
        <View style={s.bars}>
          <View style={[s.track, { backgroundColor: c.track }]}>
            <View style={[s.fill, { width: `${pct(line.amountA)}%`, backgroundColor: categoryColor(line.categoryId, line.isDeleted) }]} />
          </View>
          <Text style={[s.share, { color: c.muted }]}>{line.share.toFixed(1)}% of spending</Text>
        </View>
      )}
    </Pressable>
  );
}

/** One side of a comparison: range dot, bar and amount, all in the range's colour. */
function BarLine({ color, width, amount, strong = false }: { color: string; width: number; amount: string; strong?: boolean }) {
  const c = useStatsColors();
  return (
    <View style={s.barLine}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <View style={[s.track, s.flex, { backgroundColor: c.track }]}>
        <View style={[s.fill, { width: `${width}%`, backgroundColor: color, opacity: strong ? 1 : 0.75 }]} />
      </View>
      <MaskedAmount value={amount} style={[s.lineAmount, { color: strong ? c.text : c.muted, fontWeight: strong ? '700' : '500' }]} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingVertical: 12, paddingHorizontal: 10, marginHorizontal: -10, borderRadius: 14, gap: 8, minHeight: 56 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  name: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  deleted: { fontSize: 11, borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' },
  spacer: { flex: 1 },
  amount: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bars: { gap: 6, paddingLeft: 20 },
  barLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  flex: { flex: 1 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  lineAmount: { fontSize: 13, fontVariant: ['tabular-nums'], minWidth: 84, textAlign: 'right' },
  share: { fontSize: 12 },
});
