import { MaskedAmount } from '@/components/MaskedAmount';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import type { Diff } from '../../model/compare';
import { formatMoney, formatPercent } from '../../model/format';
import { useStatsColors } from './useStatsColors';

type Props = {
  diff: Diff;
  symbol: string;
  /** Hide the amount and show only the % (for dense rows). */
  compact?: boolean;
};

/** Spending went up = red, down = teal. */
export function DiffChip({ diff, symbol, compact = false }: Props) {
  const c = useStatsColors();
  const color = diff.direction === 'up' ? c.more : diff.direction === 'down' ? c.less : c.muted;
  const icon = diff.direction === 'up' ? 'arrow-top-right' : diff.direction === 'down' ? 'arrow-bottom-right' : 'minus';
  const percent = diff.percent == null ? 'new' : formatPercent(diff.percent);

  return (
    <View
      style={[s.chip, { backgroundColor: color.startsWith('#') ? `${color}1F` : c.track }]}
      accessibilityLabel={`${diff.direction === 'up' ? 'More' : diff.direction === 'down' ? 'Less' : 'No change'}, ${percent}`}
    >
      <Icon source={icon} size={13} color={color} />
      {!compact && (
        <MaskedAmount value={formatMoney(diff.amount, symbol, { signed: true, compact: true })} style={[s.text, { color }]} />
      )}
      <Text style={[s.text, { color }]}>{compact ? percent : `(${percent})`}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
