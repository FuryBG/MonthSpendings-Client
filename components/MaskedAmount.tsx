import { useAmountVisibilityStore } from '@/stores/amountVisibilityStore';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type Props = Omit<React.ComponentProps<typeof Text>, 'children'> & { value: string };

const FAKE_VALUE = '****';

export function MaskedAmount({ value, style, ...rest }: Props) {
  const hidden = useAmountVisibilityStore((s) => s.hidden);

  if (!hidden) {
    return <Text style={style} {...rest}>{value}</Text>;
  }

  return (
    <Text style={[style, s.blurred]} {...rest}>{FAKE_VALUE}</Text>
  );
}

const s = StyleSheet.create({
  blurred: {
    filter: 'blur(4px)',
  },
});
