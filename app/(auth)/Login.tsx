import { Tavira } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Portal, Snackbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { googleLogin } from '../services/api';

function TaviraLogoMark() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.96, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.logoMark, { transform: [{ scale }] }]}>
      <View style={styles.glowHalo} />
      <View style={styles.glowHaloInner} />
      <Image
        source={require('@/assets/images/splash-icon.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

function GoogleButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.timing(opacity, { toValue: 0.7, duration: 100, useNativeDriver: true }).start();
  }
  function handlePressOut() {
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={[styles.googleBtnWrap, { opacity }]}>
      <TouchableOpacity
        style={styles.googleBtn}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        activeOpacity={1}
      >
        <View style={styles.googleIconCircle}>
          <Text style={styles.googleG}>G</Text>
        </View>
        <Text style={styles.googleBtnText}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </Text>
        {!loading && <Icon source="arrow-right" size={18} color="rgba(242,244,248,0.5)" />}
        {loading && (
          <Animated.View>
            <Icon source="loading" size={18} color={Tavira.teal} />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [signing, setSigning] = useState(false);
  const insets = useSafeAreaInsets();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 900, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 900, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  async function onSignIn() {
    try {
      await GoogleSignin.configure();
      const userInfo = await GoogleSignin.signIn();
      const googleToken = userInfo.data?.user.id;
      if (googleToken != undefined) {
        setSigning(true);
        const jwt = await googleLogin({
          id: userInfo.data!.user.id,
          notificationToken: '',
          email: userInfo.data!.user.email,
          familyName: userInfo.data!.user.familyName,
          givenName: userInfo.data!.user.givenName,
          photo: userInfo.data!.user.photo,
        });
        await signIn(jwt);
        setSigning(false);
      }
    } catch (e) {
      console.log(e);
      setVisible(true);
      setSigning(false);
    }
  }

  return (
    <LinearGradient colors={['#0B1B3A', '#071228', '#050E1F']} style={styles.root}>
      {/* Decorative ambient orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <Animated.View
        style={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          { opacity: fadeIn, transform: [{ translateY: slideUp }] },
        ]}
      >
        {/* Brand mark */}
        <View style={styles.brandSection}>
          <TaviraLogoMark />

          <Image
            source={require('@/assets/images/slogan.png')}
            style={styles.sloganImage}
            resizeMode="contain"
          />
        </View>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          {['Joint budgets', 'Bank sync', 'Live stats'].map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Sign-in */}
        <View style={styles.authSection}>
          <Text style={styles.authHint}>Sign in to your account</Text>
          <GoogleButton onPress={onSignIn} loading={signing} />
          <Text style={styles.legalText}>
            By continuing you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/(auth)/TermsOfService')}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/(auth)/PrivacyPolicy')}>
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </Animated.View>

      <Portal>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={5000}
          action={{ label: 'OK', onPress: () => setVisible(false) }}
        >
          Google sign-in failed. Please try again.
        </Snackbar>
      </Portal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  orb1: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(62,198,198,0.07)',
  },
  orb2: {
    position: 'absolute',
    bottom: 80,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(91,123,255,0.07)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  brandSection: {
    alignItems: 'center',
    gap: 28,
  },
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(62,198,198,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(62,198,198,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  glowHalo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(62,198,198,0.12)',
    top: -22,
    left: -22,
  },
  glowHaloInner: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(62,198,198,0.08)',
    top: -7,
    left: -7,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  sloganImage: {
    width: 290,
    height: 90,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pillText: {
    fontSize: 12,
    color: 'rgba(242,244,248,0.55)',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  authSection: {
    gap: 14,
    alignItems: 'center',
  },
  authHint: {
    fontSize: 13,
    color: 'rgba(242,244,248,0.4)',
    letterSpacing: 0.5,
  },
  googleBtnWrap: {
    width: '100%',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  googleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#F2F4F8',
    letterSpacing: 0.2,
  },
  legalText: {
    fontSize: 11,
    color: 'rgba(242,244,248,0.28)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  legalLink: {
    color: 'rgba(62,198,198,0.65)',
    textDecorationLine: 'underline',
  },
});
