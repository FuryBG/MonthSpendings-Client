import { Tavira } from '@/constants/theme';
import { useTourStore } from '@/stores/tourStore';
import { FC, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Bullet {
  icon: string;
  text: string;
}

interface ScreenIntroSheetProps {
  screenKey: string;
  icon: string;
  title: string;
  bullets: Bullet[];
}

export const ScreenIntroSheet: FC<ScreenIntroSheetProps> = ({ screenKey, icon, title, bullets }) => {
  const theme = useTheme();
  const isDark = theme.dark;
  const insets = useSafeAreaInsets();
  const hasSeenScreen = useTourStore((s) => s.hasSeenScreen);
  const markScreenSeen = useTourStore((s) => s.markScreenSeen);
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (hasSeenScreen(screenKey)) return;
    const t = setTimeout(() => setVisible(true), 450);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visible) return;
    backdropOpacity.setValue(0);
    translateY.setValue(400);
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 280, mass: 0.8 }),
    ]).start();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function close() {
    if (isClosing) return;
    setIsClosing(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 400, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setIsClosing(false);
      setVisible(false);
      markScreenSeen(screenKey);
    });
  }

  const panelBg = isDark ? 'rgba(10,22,50,0.97)' : theme.colors.surface;
  const borderColor = isDark ? Tavira.glassBorder : theme.colors.outlineVariant;
  const dragPillColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>
      <View style={s.wrapper}>
        <Animated.View style={[
          s.panel,
          { backgroundColor: panelBg, borderColor, paddingBottom: insets.bottom + 24 },
          { transform: [{ translateY }] },
        ]}>
          <Pressable style={s.dragArea} onPress={close}>
            <View style={[s.dragPill, { backgroundColor: dragPillColor }]} />
          </Pressable>

          <View style={s.iconContainer}>
            <View style={s.iconRing}>
              <Icon source={icon} size={28} color={Tavira.teal} />
            </View>
          </View>

          <Text style={[s.title, { color: isDark ? '#F2F4F8' : theme.colors.onSurface }]}>{title}</Text>

          <View style={s.bullets}>
            {bullets.map((b, i) => (
              <View key={i} style={s.bullet}>
                <View style={s.bulletIcon}>
                  <Icon source={b.icon} size={16} color={Tavira.teal} />
                </View>
                <Text style={[s.bulletText, { color: isDark ? 'rgba(242,244,248,0.72)' : theme.colors.onSurfaceVariant }]}>
                  {b.text}
                </Text>
              </View>
            ))}
          </View>

          <Pressable style={({ pressed }) => [s.gotItBtn, pressed && { opacity: 0.82 }]} onPress={close}>
            <Text style={s.gotItText}>Got it</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
    paddingTop: 0,
    gap: 10,
  },
  dragArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  iconRing: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(62,198,198,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(62,198,198,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  bullets: {
    gap: 12,
    marginTop: 4,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(62,198,198,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  gotItBtn: {
    backgroundColor: Tavira.teal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  gotItText: {
    color: Tavira.navy,
    fontSize: 15,
    fontWeight: '700',
  },
});
