import { useMemo } from 'react';
import { View } from 'react-native';
import type { CategoryLine } from '../model/compare';
import { CategoryRow } from './CategoryRow';

type Props = {
  lines: CategoryLine[];
  symbol: string;
  focusedId: number | null;
  onPress: (line: CategoryLine) => void;
  onFocusChange?: (categoryId: number | null) => void;
};

export function CategoryList({ lines, symbol, focusedId, onPress, onFocusChange }: Props) {
  const maxAmount = useMemo(() => Math.max(0, ...lines.map(l => Math.max(l.amountA, l.amountB ?? 0))), [lines]);

  return (
    <View>
      {lines.map(line => (
        <CategoryRow
          key={line.categoryId}
          line={line}
          maxAmount={maxAmount}
          symbol={symbol}
          focused={focusedId === line.categoryId}
          onPress={() => onPress(line)}
          onPressIn={() => onFocusChange?.(line.categoryId)}
          onPressOut={() => onFocusChange?.(null)}
        />
      ))}
    </View>
  );
}
