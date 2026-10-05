import { MaskedAmount } from '@/components/MaskedAmount';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Pie, PolarChart } from 'victory-native';
import { formatMoney } from '../../model/format';
import { categoryColor } from '../../model/palette';
import type { RangeCategory } from '../../model/types';
import { useStatsColors } from '../primitives/useStatsColors';

type Props = {
  categories: RangeCategory[];
  total: number;
  symbol: string;
  /** Category to emphasise (others are dimmed); null = none. */
  focusedId: number | null;
  size?: number;
};

export function CategoryDonut({ categories, total, symbol, focusedId, size = 196 }: Props) {
  const c = useStatsColors();

  const data = useMemo(
    () => categories
      .filter(cat => cat.amount > 0)
      .map(cat => ({ id: cat.categoryId, label: cat.name, value: cat.amount, color: categoryColor(cat.categoryId, cat.isDeleted) })),
    [categories],
  );

  const focused = focusedId != null ? categories.find(cat => cat.categoryId === focusedId) : undefined;

  return (
    <View style={[s.root, { width: size, height: size }]}>
      <PolarChart data={data} labelKey="label" valueKey="value" colorKey="color">
        <Pie.Chart innerRadius="72%">
          {({ slice }) => {
            const dimmed = focusedId != null && slice.label !== focused?.name;
            return (
              <>
                <Pie.Slice opacity={dimmed ? 0.25 : 1} animate={{ type: 'spring', damping: 20, stiffness: 140 }} />
                <Pie.SliceAngularInset angularInset={{ angularStrokeWidth: 3, angularStrokeColor: c.canvasBg }} />
              </>
            );
          }}
        </Pie.Chart>
      </PolarChart>

      <View style={s.center} pointerEvents="none">
        <Text style={[s.centerLabel, { color: c.muted }]} numberOfLines={1}>
          {focused ? focused.name : 'Spent'}
        </Text>
        <MaskedAmount
          value={formatMoney(focused ? focused.amount : total, symbol, { compact: true })}
          style={[s.centerValue, { color: c.text }]}
        />
        {focused ? <Text style={[s.centerLabel, { color: c.muted }]}>{focused.share.toFixed(1)}%</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { alignSelf: 'center' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  centerLabel: { fontSize: 13 },
  centerValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
});
