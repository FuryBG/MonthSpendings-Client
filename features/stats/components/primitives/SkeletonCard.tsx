import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { StatCard } from './StatCard';
import { useStatsColors } from './useStatsColors';

type Props = {
  /** Heights of the placeholder lines inside the card. */
  lines?: number[];
};

export function SkeletonCard({ lines = [14, 40, 120] }: Props) {
  const c = useStatsColors();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.45, { duration: 750 }), -1, true);
  }, [opacity, reduceMotion]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <StatCard>
      <Animated.View style={[s.stack, pulse]}>
        {lines.map((height, i) => (
          <View
            key={i}
            style={{ height, borderRadius: 8, backgroundColor: c.skeleton, width: i === 0 ? '40%' : i === 1 ? '65%' : '100%' }}
          />
        ))}
      </Animated.View>
    </StatCard>
  );
}

const s = StyleSheet.create({
  stack: { gap: 12 },
});
