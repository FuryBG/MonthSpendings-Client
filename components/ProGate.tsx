import { Tavira } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProGateProps = {
  featureName: string;
};

export function ProGate({ featureName }: ProGateProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const insets = useSafeAreaInsets();
  const headerHeight = 64 + insets.top;

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.5] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  const cardBg = isDark ? Tavira.glassBg : 'rgba(255,255,255,0.97)';
  const cardBorder = isDark ? Tavira.glassBorder : 'rgba(62,198,198,0.18)';
  const titleColor = isDark ? '#F2F4F8' : Tavira.navy;
  const subtitleColor = isDark ? 'rgba(242,244,248,0.42)' : 'rgba(11,27,58,0.42)';

  return (
    <View style={[s.root, { backgroundColor: isDark ? Tavira.navy : '#F2F4F8', paddingBottom: headerHeight }]}>
      <View style={s.bgGlowContainer} pointerEvents="none">
        <LinearGradient
          colors={['rgba(62,198,198,0.07)', 'rgba(91,123,255,0.05)', 'transparent']}
          style={s.bgGlow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View
        style={[
          s.card,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
      >
        {/* Icon with animated glow */}
        <View style={s.iconArea}>
          <Animated.View
            style={[
              s.glowRingOuter,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          />
          <LinearGradient
            colors={[Tavira.teal, Tavira.purple]}
            style={s.iconRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View
              style={[
                s.iconInner,
                { backgroundColor: isDark ? '#0A1C3E' : '#F2F4F8' },
              ]}
            >
              <Icon source="crown" size={30} color={Tavira.teal} />
            </View>
          </LinearGradient>
        </View>

        {/* PRO badge */}
        <LinearGradient
          colors={[Tavira.teal, Tavira.purple]}
          style={s.proBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={s.proBadgeText}>PRO</Text>
        </LinearGradient>

        {/* Title */}
        <Text style={[s.title, { color: titleColor }]}>
          {featureName} is a{'\n'}Pro Feature
        </Text>

        {/* Description */}
        <Text style={[s.description, { color: subtitleColor }]}>
          Payments are coming soon.{'\n'}You'll be notified when Pro becomes available.
        </Text>

        {/* Decorative separator */}
        <LinearGradient
          colors={['transparent', Tavira.teal, 'transparent']}
          style={s.bottomLine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );
}

export function ProBadge() {
  return (
    <LinearGradient
      colors={[Tavira.teal, Tavira.purple]}
      style={pb.pill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={pb.text}>PRO</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bgGlowContainer: {
    ...StyleSheet.absoluteFill,
  },
  bgGlow: {
    height: '55%',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: Tavira.teal,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.13,
        shadowRadius: 28,
      },
      android: { elevation: 8 },
    }),
  },
  iconArea: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  glowRingOuter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(62,198,198,0.15)',
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 22,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    flex: 1,
    width: '100%',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#0B1B3A',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bottomLine: {
    height: 1.5,
    width: '55%',
    borderRadius: 1,
    marginTop: 8,
  },
});

const pb = StyleSheet.create({
  pill: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  text: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#0B1B3A',
  },
});
