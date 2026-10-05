// Gesture callbacks run on touch events (UI thread), never during render; the compiler-based
// rules can't see that through the Gesture builder API, so they're disabled for this file only.
/* eslint-disable react-hooks/refs, react-hooks/immutability */
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

type Handlers = {
  /** Finger crossed into a new bar while dragging. */
  onScrub: (index: number) => void;
  /** Drag ended on this bar. */
  onRelease: (index: number) => void;
  /** Quick tap on a bar. */
  onTap: (index: number) => void;
};

/**
 * Touch handling for a bar chart: the bar under the finger is the one whose centre (xs) is nearest,
 * using the positions the chart actually drew, so it always matches what is on screen.
 * Horizontal drag scrubs (vertical drag keeps scrolling the page); a tap selects one bar.
 */
export function useBarScrubGesture(xs: number[], handlers: Handlers) {
  const handlersRef = useRef(handlers);
  useEffect(() => { handlersRef.current = handlers; });
  const lastIndex = useSharedValue(-1);

  const scrubbed = useCallback((i: number) => {
    Haptics.selectionAsync().catch(() => {});
    handlersRef.current.onScrub(i);
  }, []);
  const released = useCallback((i: number) => handlersRef.current.onRelease(i), []);
  const tapped = useCallback((i: number) => {
    Haptics.selectionAsync().catch(() => {});
    handlersRef.current.onTap(i);
  }, []);

  return useMemo(() => {
    const centres = [...xs];
    const indexAt = (x: number) => {
      'worklet';
      let best = -1;
      let bestDistance = Infinity;
      for (let i = 0; i < centres.length; i++) {
        const d = Math.abs(centres[i] - x);
        if (d < bestDistance) { bestDistance = d; best = i; }
      }
      return best;
    };

    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onStart(e => {
        const i = indexAt(e.x);
        lastIndex.value = i;
        if (i >= 0) scheduleOnRN(scrubbed, i);
      })
      .onUpdate(e => {
        const i = indexAt(e.x);
        if (i >= 0 && i !== lastIndex.value) {
          lastIndex.value = i;
          scheduleOnRN(scrubbed, i);
        }
      })
      .onEnd(() => {
        if (lastIndex.value >= 0) scheduleOnRN(released, lastIndex.value);
        lastIndex.value = -1;
      });

    const tap = Gesture.Tap().onEnd(e => {
      const i = indexAt(e.x);
      if (i >= 0) scheduleOnRN(tapped, i);
    });

    return Gesture.Exclusive(pan, tap);
  }, [xs, lastIndex, scrubbed, released, tapped]);
}
