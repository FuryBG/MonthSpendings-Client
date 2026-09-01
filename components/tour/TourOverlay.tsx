import { Tavira } from '@/constants/theme';
import { tourTargets } from '@/utils/tourTargets';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import Svg, { Path, Rect as SvgRect } from 'react-native-svg';

export interface TourStep {
  key: string;
  icon: string;
  title: string;
  description: string;
}

interface Rect { x: number; y: number; width: number; height: number }

const CUTOUT_PAD = 12;
const CUTOUT_RADIUS = 16;
const DARK = 'rgba(4,10,24,0.86)';

function buildCutoutPath(sw: number, sh: number, x: number, y: number, w: number, h: number, r: number) {
  return [
    `M 0 0 H ${sw} V ${sh} H 0 Z`,
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y} Z`,
  ].join(' ');
}

async function measureWithRetry(id: string, attempts = 5): Promise<Rect | null> {
  for (let i = 0; i < attempts; i++) {
    const result = await new Promise<Rect | null>(resolve => {
      requestAnimationFrame(() => {
        const p = tourTargets.measure(id);
        if (!p) { resolve(null); return; }
        p.then(r => resolve(r.width > 0 && r.height > 0 ? r : null)).catch(() => resolve(null));
      });
    });
    if (result) return result;
    await new Promise(r => setTimeout(r, 80));
  }
  return null;
}

interface Props { steps: TourStep[]; visible: boolean; onDismiss: () => void }

export function TourOverlay({ steps, visible, onDismiss }: Props) {
  const { height: sh, width: sw } = useWindowDimensions();

  const [localVisible, setLocalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [closing, setClosing] = useState(false);

  const fadeOverlay = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible || steps.length === 0) return;
    setIndex(0);
    setRect(null);
    setLocalVisible(true);
    fadeOverlay.setValue(0);
    Animated.timing(fadeOverlay, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!localVisible || steps.length === 0) return;
    const step = steps[index];
    if (!step) return;
    setRect(null);
    cardFade.setValue(0);
    cardSlide.setValue(30);
    measureWithRetry(step.key).then(r => {
      setRect(r);
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }),
      ]).start();
    });
  }, [localVisible, index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    pulseLoop.current?.stop();
    if (!localVisible || !rect) return;
    pulseAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true })
    );
    pulseLoop.current = loop;
    loop.start();
    return () => loop.stop();
  }, [localVisible, rect]); // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    if (closing) return;
    setClosing(true);
    pulseLoop.current?.stop();
    Animated.parallel([
      Animated.timing(fadeOverlay, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(cardFade, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setLocalVisible(false);
      setRect(null);
      setClosing(false);
      onDismiss();
    });
  }

  function handleNext() {
    if (index >= steps.length - 1) { dismiss(); return; }
    Animated.timing(cardFade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setIndex(i => i + 1);
    });
  }

  if (!localVisible || steps.length === 0) return null;

  const step = steps[index] ?? steps[0];
  const isLast = index === steps.length - 1;

  const cut: Rect | null = rect
    ? {
        x: rect.x - CUTOUT_PAD,
        y: rect.y - CUTOUT_PAD,
        width: rect.width + CUTOUT_PAD * 2,
        height: rect.height + CUTOUT_PAD * 2,
      }
    : null;

  const spotlightBottom = cut ? cut.y + cut.height : 0;
  const cardAtBottom = !cut || spotlightBottom < sh * 0.55;
  const spotlightCenterX = cut ? cut.x + cut.width / 2 : sw / 2;
  const arrowLeft = Math.max(24, Math.min(spotlightCenterX - 10, sw - 44));

  const ringScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const ringOpacity = pulseAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.85, 0.2, 0] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeOverlay }]}>

        {cut ? (
          <>
            <Svg width={sw} height={sh} style={StyleSheet.absoluteFill}>
              <Path
                fillRule="evenodd"
                d={buildCutoutPath(sw, sh, cut.x, cut.y, cut.width, cut.height, CUTOUT_RADIUS)}
                fill={DARK}
              />
              <SvgRect
                x={cut.x}
                y={cut.y}
                width={cut.width}
                height={cut.height}
                rx={CUTOUT_RADIUS}
                ry={CUTOUT_RADIUS}
                fill="none"
                stroke={Tavira.teal}
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
            </Svg>
            <Animated.View
              style={[
                s.pulseRing,
                {
                  left: cut.x - 8,
                  top: cut.y - 8,
                  width: cut.width + 16,
                  height: cut.height + 16,
                  borderRadius: CUTOUT_RADIUS + 8,
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }],
                },
              ]}
              pointerEvents="none"
            />
          </>
        ) : (
          <View style={[s.dark, StyleSheet.absoluteFill]} />
        )}

        <Animated.View
          style={[
            s.card,
            { opacity: cardFade, transform: [{ translateY: cardSlide }] },
            cardAtBottom
              ? { position: 'absolute', bottom: 32, left: 16, right: 16 }
              : { position: 'absolute', top: 56, left: 16, right: 16 },
          ]}
        >
          {cut && (
            <View style={[cardAtBottom ? s.arrowUp : s.arrowDown, { left: arrowLeft }]} />
          )}

          <View style={s.stepLabel}>
            <View style={s.iconRing}>
              <Icon source={step.icon} size={20} color={Tavira.teal} />
            </View>
            <Text style={s.stepCount}>{index + 1} / {steps.length}</Text>
          </View>

          <Text style={s.title}>{step.title}</Text>
          <Text style={s.desc}>{step.description}</Text>

          <View style={s.footer}>
            <View style={s.dots}>
              {steps.map((_, i) => (
                <View key={i} style={[s.dot, i === index && s.dotActive]} />
              ))}
            </View>
            <View style={s.actions}>
              <Pressable onPress={dismiss} style={({ pressed }) => [s.skipBtn, pressed && { opacity: 0.4 }]}>
                <Text style={s.skipText}>Skip</Text>
              </Pressable>
              <Pressable onPress={handleNext} style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.8 }]}>
                <Text style={s.nextText}>{isLast ? 'Done' : 'Next →'}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  dark: {
    position: 'absolute',
    backgroundColor: DARK,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Tavira.teal,
  },
  card: {
    backgroundColor: '#0D1F47',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(62,198,198,0.18)',
    padding: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  arrowUp: {
    position: 'absolute',
    top: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0D1F47',
  },
  arrowDown: {
    position: 'absolute',
    bottom: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0D1F47',
  },
  stepLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  iconRing: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(62,198,198,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(62,198,198,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCount: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(62,198,198,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F2F4F8',
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 13,
    color: 'rgba(242,244,248,0.58)',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(62,198,198,0.18)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Tavira.teal,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    color: 'rgba(242,244,248,0.28)',
    fontSize: 13,
    fontWeight: '500',
  },
  nextBtn: {
    backgroundColor: Tavira.teal,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  nextText: {
    color: '#0B1B3A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
