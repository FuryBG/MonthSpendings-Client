import { Tavira } from '@/constants/theme';
import { LinearGradient, Line, vec } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { Bar, CartesianChart } from 'victory-native';
import type { TimelinePoint } from '../../model/compare';
import { COMPARE_A_COLOR, COMPARE_B_COLOR } from '../../model/palette';
import { useStatsColors } from '../primitives/useStatsColors';
import { PeriodAxisLabels } from './PeriodAxisLabels';
import { useBarScrubGesture } from './useBarScrubGesture';

type Props = {
  points: TimelinePoint[];
  compare: boolean;
  /** Highlighted bar (while scrubbing or after release); null = none. */
  selectedIndex: number | null;
  onScrub: (index: number) => void;
  onRelease: (index: number) => void;
  onTap: (index: number) => void;
  symbol: string;
  height?: number;
};

/** Where the chart actually drew its bars, so labels and touches line up with them exactly. */
export type BarGeometry = {
  /** Centre x of each bar, in px from the chart's left edge. */
  xs: number[];
};

const SPRING = { type: 'spring', damping: 18, stiffness: 160 } as const;
const INNER_PADDING = 0.38;
const CORNERS = { topLeft: 7, topRight: 7 };

/**
 * One bar per period in date order. When comparing, range A bars are teal and range B bars purple.
 * Drag horizontally to scrub, tap to select.
 */
export function PeriodBarChart({ points, compare, selectedIndex, onScrub, onRelease, onTap, symbol, height = 150 }: Props) {
  const c = useStatsColors();

  const selected = selectedIndex != null ? points[selectedIndex] : undefined;

  // Three series on the same x positions; each bar has its value in exactly one of them
  // (A, B, or "selected"). Same series length => identical bar widths, so the highlight fits exactly.
  const data = useMemo(
    () => points.map(p => {
      const isSelected = p.index === selected?.index;
      return {
        x: p.index,
        a: !isSelected && p.side === 'A' ? p.total : 0,
        b: !isSelected && p.side === 'B' ? p.total : 0,
        s: isSelected ? p.total : 0,
      };
    }),
    [points, selected?.index],
  );

  // Pad the x domain by half a slot on each side so the outer bars are never clipped.
  const [width, setWidth] = useState(0);
  const sidePadding = width / (2 * Math.max(points.length, 1));

  const [xs, setXs] = useState<number[]>([]);
  const handleScale = useCallback((xScale: (x: number) => number) => {
    const next = data.map(d => xScale(d.x));
    setXs(prev => (prev.length === next.length && prev.every((v, i) => Math.abs(v - next[i]) < 0.5) ? prev : next));
  }, [data]);

  const gesture = useBarScrubGesture(xs, { onScrub, onRelease, onTap });

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <View style={{ height }} onLayout={e => setWidth(e.nativeEvent.layout.width)} accessibilityLabel="Spending per period chart. Tap a bar or slide across the bars to see each period.">
          {/* Draw only once the width is known, so bars don't animate in from a wrong layout. */}
          {width > 0 ? (
            <CartesianChart
              data={data}
              xKey="x"
              yKeys={['a', 'b', 's']}
              domain={{ y: [0] }}
              domainPadding={{ left: sidePadding, right: sidePadding, top: 14 }}
              // No axes or grid: values are shown under the bars and in the header.
              xAxis={{ lineWidth: 0, tickCount: 0 }}
              yAxis={[{ lineWidth: 0, tickCount: 0 }]}
              frame={{ lineWidth: 0 }}
              onScaleChange={handleScale}
            >
              {({ points: pts, chartBounds }) => {
                const dim = selected ? 0.35 : 1;
                // victory-native divides by (bars - 1), which makes few bars far too wide;
                // size them from the real spacing between bars instead.
                const slot = pts.a.length > 1 ? pts.a[1].x - pts.a[0].x : chartBounds.right - chartBounds.left;
                const barWidth = slot * (1 - INNER_PADDING);
                const bar = { chartBounds, barWidth, roundedCorners: CORNERS, animate: SPRING };

                return (
                  <>
                    {selected && (
                      <Line
                        p1={vec(pts.a[selected.index].x, chartBounds.top - 6)}
                        p2={vec(pts.a[selected.index].x, chartBounds.bottom)}
                        color={c.faint}
                        strokeWidth={1}
                      />
                    )}

                    {compare ? (
                      <>
                        <Bar points={pts.a} {...bar} color={COMPARE_A_COLOR} opacity={dim} />
                        <Bar points={pts.b} {...bar} color={c.ghostBar} opacity={dim} />
                      </>
                    ) : (
                      <Bar points={pts.a} {...bar} opacity={dim}>
                        <LinearGradient start={vec(0, chartBounds.top)} end={vec(0, chartBounds.bottom)} colors={[Tavira.teal, Tavira.purple]} />
                      </Bar>
                    )}

                    <Bar points={pts.s} {...bar} color={selected?.side === 'B' ? COMPARE_B_COLOR : COMPARE_A_COLOR} />
                  </>
                );
              }}
            </CartesianChart>
          ) : null}
        </View>
      </GestureDetector>

      {width > 0 && xs.length === points.length ? (
        <PeriodAxisLabels
          points={points}
          compare={compare}
          symbol={symbol}
          selectedIndex={selectedIndex}
          onSelect={onTap}
          geometry={{ xs }}
          width={width}
        />
      ) : null}
    </View>
  );
}
