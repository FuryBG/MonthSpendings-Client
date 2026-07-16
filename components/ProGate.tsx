import { Tavira } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Status = 'idle' | 'activating' | 'success' | 'timedOut' | 'error';

type ProGateProps = {
  featureName: string;
  onUnlocked?: () => void;
};

export function ProGate({ featureName, onUnlocked }: ProGateProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const insets = useSafeAreaInsets();
  const headerHeight = 64 + insets.top;
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [isRestore, setIsRestore] = useState(false);

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

  async function pollForPro() {
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 2000));
      await refreshUser();
      if (useAuthStore.getState().user?.isPro) {
        setStatus('success');
        setTimeout(() => onUnlocked?.(), 1500);
        return;
      }
    }
    setStatus('timedOut');
  }

  async function handleUnlock() {
    onUnlocked?.(); return; // TODO: restore when production RC keys are ready
    setLoading(true);
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'Tavira Pro',
      });
      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          setLoading(false);
          setStatus('activating');
          await pollForPro();
          return;
        case PAYWALL_RESULT.RESTORED:
          setIsRestore(true);
          setLoading(false);
          setStatus('activating');
          await pollForPro();
          return;
        case PAYWALL_RESULT.ERROR:
          setStatus('error');
          break;
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.NOT_PRESENTED:
          break;
      }
    } catch (e) {
      console.warn('[RC] paywall error:', e);
      setStatus('error');
    }
    setLoading(false);
  }

  async function handleCheckAgain() {
    setStatus('activating');
    await refreshUser();
    if (useAuthStore.getState().user?.isPro) {
      setStatus('success');
      setTimeout(() => onUnlocked?.(), 1500);
    } else {
      setStatus('timedOut');
    }
  }

  const iconRingEl = (iconName: string) => (
    <LinearGradient
      colors={[Tavira.teal, Tavira.purple]}
      style={s.iconRing}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[s.iconInner, { backgroundColor: isDark ? '#0A1C3E' : '#F2F4F8' }]}>
        <Icon source={iconName} size={30} color={Tavira.teal} />
      </View>
    </LinearGradient>
  );

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

      <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {status === 'activating' && (
          <>
            <ActivityIndicator size="large" color={Tavira.teal} style={{ marginBottom: 8 }} />
            <Text style={[s.title, { color: titleColor }]}>
              {isRestore ? 'Restoring your Pro account…' : 'Activating your Pro account…'}
            </Text>
            <Text style={[s.description, { color: subtitleColor }]}>
              Confirming with our servers.{'\n'}This usually takes a few seconds.
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            {iconRingEl('check-circle-outline')}
            <Text style={[s.title, { color: titleColor }]}>You're now Pro!</Text>
            <Text style={[s.description, { color: subtitleColor }]}>
              Welcome to Tavira Pro.{'\n'}All features are now unlocked.
            </Text>
          </>
        )}

        {status === 'timedOut' && (
          <>
            {iconRingEl('clock-outline')}
            <Text style={[s.title, { color: titleColor }]}>
              {isRestore ? 'Restore in progress' : 'Purchase received'}
            </Text>
            <Text style={[s.description, { color: subtitleColor }]}>
              {isRestore
                ? 'Your Pro access is being restored.\nCheck again or come back shortly.'
                : 'Your Pro account is still activating.\nCheck again or come back shortly.'}
            </Text>
            <TouchableOpacity onPress={handleCheckAgain} activeOpacity={0.82} style={s.unlockBtn}>
              <LinearGradient
                colors={[Tavira.teal, Tavira.purple]}
                style={s.unlockGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={s.unlockBtnText}>Check again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {status === 'error' && (
          <>
            {iconRingEl('alert-circle-outline')}
            <Text style={[s.title, { color: titleColor }]}>Purchase failed</Text>
            <Text style={[s.description, { color: subtitleColor }]}>
              Something went wrong.{'\n'}Please try again or contact support.
            </Text>
            <TouchableOpacity onPress={() => setStatus('idle')} activeOpacity={0.82} style={s.unlockBtn}>
              <LinearGradient
                colors={[Tavira.teal, Tavira.purple]}
                style={s.unlockGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={s.unlockBtnText}>Try again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {status === 'idle' && (
          <>
            <View style={s.iconArea}>
              <Animated.View
                style={[s.glowRingOuter, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
              />
              {iconRingEl('crown')}
            </View>

            <LinearGradient
              colors={[Tavira.teal, Tavira.purple]}
              style={s.proBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={s.proBadgeText}>PRO</Text>
            </LinearGradient>

            <Text style={[s.title, { color: titleColor }]}>
              {featureName} is a{'\n'}Pro Feature
            </Text>

            <Text style={[s.description, { color: subtitleColor }]}>
              Unlock unlimited budgets, bank sync,{'\n'}and collaborative spending with Tavira Pro.
            </Text>

            <TouchableOpacity onPress={handleUnlock} disabled={loading} activeOpacity={0.82} style={s.unlockBtn}>
              <LinearGradient
                colors={[Tavira.teal, Tavira.purple]}
                style={s.unlockGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={s.unlockBtnText}>{loading ? 'Opening…' : 'Unlock Pro'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <LinearGradient
              colors={['transparent', Tavira.teal, 'transparent']}
              style={s.bottomLine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </>
        )}
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
  unlockBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  unlockGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1B3A',
    letterSpacing: 0.3,
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
