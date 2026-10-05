import { BottomSheet } from '@/components/BottomSheet';
import { MaskedAmount } from '@/components/MaskedAmount';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatLongDate, formatMoney } from '../model/format';
import { categoryColor } from '../model/palette';
import type { RangeSpending } from '../model/types';
import { useStatsColors } from './primitives/useStatsColors';

type Props = {
  spending: RangeSpending | null;
  symbol: string;
  onClose: () => void;
};

export function SpendingDetailSheet({ spending, symbol, onClose }: Props) {
  const c = useStatsColors();

  return (
    <BottomSheet visible={spending != null} onClose={(done) => { onClose(); done?.(); }}>
      {spending ? (
        <View style={s.root}>
          <MaskedAmount value={formatMoney(spending.amount, symbol)} style={[s.amount, { color: c.text }]} />
          <Text style={[s.title, { color: c.text }]}>{spending.description?.trim() || 'No description'}</Text>

          <View style={[s.table, { borderColor: c.border }]}>
            <Row label="Category" colors={c}>
              <View style={s.category}>
                <View style={[s.swatch, { backgroundColor: categoryColor(spending.categoryId) }]} />
                <Text style={[s.value, { color: c.text }]}>{spending.categoryName}</Text>
              </View>
            </Row>
            <Row label="Date" colors={c}>
              <Text style={[s.value, { color: c.text }]}>{formatLongDate(spending.date)}</Text>
            </Row>
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

function Row({ label, colors, children }: { label: string; colors: ReturnType<typeof useStatsColors>; children: React.ReactNode }) {
  return (
    <View style={[s.row, { borderColor: colors.border }]}>
      <Text style={[s.label, { color: colors.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 6, paddingBottom: 4 },
  amount: { fontSize: 34, fontWeight: '700', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 10 },
  table: { borderTopWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, borderBottomWidth: 1 },
  label: { fontSize: 14 },
  value: { fontSize: 15, fontWeight: '600' },
  category: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
});
