import { MaskedAmount } from '@/components/MaskedAmount';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatMoney, formatShortDate } from '../model/format';
import { categoryColor } from '../model/palette';
import type { RangeSpending } from '../model/types';
import { useStatsColors } from './primitives/useStatsColors';

type Props = {
  spendings: RangeSpending[];
  symbol: string;
  onPress: (spending: RangeSpending) => void;
  /** Hide the category name when every row is the same category. */
  hideCategory?: boolean;
};

export function TopSpendingsList({ spendings, symbol, onPress, hideCategory = false }: Props) {
  const c = useStatsColors();

  return (
    <View>
      {spendings.map(sp => {
        const color = categoryColor(sp.categoryId);
        const title = sp.description?.trim() || sp.categoryName;
        const meta = hideCategory ? formatShortDate(sp.date) : `${sp.categoryName}, ${formatShortDate(sp.date)}`;
        return (
          <Pressable
            key={sp.id}
            onPress={() => onPress(sp)}
            style={({ pressed }) => [s.row, pressed && { backgroundColor: c.track }]}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${formatMoney(sp.amount, symbol)}, ${meta}`}
          >
            <View style={[s.badge, { backgroundColor: `${color}26` }]}>
              <Text style={[s.badgeText, { color }]}>{sp.categoryName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.text}>
              <Text style={[s.title, { color: c.text }]} numberOfLines={1}>{title}</Text>
              <Text style={[s.meta, { color: c.muted }]} numberOfLines={1}>{meta}</Text>
            </View>
            <MaskedAmount value={formatMoney(sp.amount, symbol)} style={[s.amount, { color: c.text }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 10, marginHorizontal: -10, borderRadius: 14 },
  badge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 16, fontWeight: '700' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13 },
  amount: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
