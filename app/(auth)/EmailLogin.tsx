import { useAuthStore } from '@/stores/authStore';
import { loginWithEmail } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const inputTheme = {
  colors: {
    primary: '#3EC6C6',
    onSurfaceVariant: 'rgba(242,244,248,0.45)',
    onSurface: '#F2F4F8',
    surfaceVariant: 'rgba(255,255,255,0.06)',
    error: '#FF6B6B',
  },
};

export default function EmailLoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignIn() {
    if (!validate()) return;
    setLoading(true);
    try {
      const tokens = await loginWithEmail({ email: email.trim(), password });
      await signIn(tokens);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: unknown } })?.response?.status;
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      if (status === 423) {
        setSnackMessage(typeof data === 'string' ? data : 'Account locked. Try again later.');
      } else if (status === 429) {
        setSnackMessage('Too many attempts. Please wait a minute and try again.');
      } else {
        setSnackMessage('Invalid email or password.');
      }
      setSnackVisible(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0B1B3A', '#071228', '#050E1F']} style={styles.root}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Icon source="arrow-left" size={20} color="rgba(242,244,248,0.5)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in with your Tavira account</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                mode="flat"
                style={styles.input}
                theme={inputTheme}
                error={!!errors.email}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="password"
                mode="flat"
                style={styles.input}
                theme={inputTheme}
                error={!!errors.password}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    color="rgba(242,244,248,0.4)"
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity style={styles.forgotWrap} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryBtnWrap}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#3EC6C6', '#5B7BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
              {!loading && <Icon source="arrow-right" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/Register')}
            activeOpacity={0.75}
            style={styles.switchLink}
          >
            <Text style={styles.switchText}>
              No account?{'  '}
              <Text style={styles.switchHighlight}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={4000}
          action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
        >
          {snackMessage}
        </Snackbar>
      </Portal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  orb1: {
    position: 'absolute', top: -60, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(62,198,198,0.07)',
  },
  orb2: {
    position: 'absolute', bottom: 100, left: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(91,123,255,0.07)',
  },
  scroll: { paddingHorizontal: 24 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 32,
  },
  backText: { fontSize: 14, color: 'rgba(242,244,248,0.5)' },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: '#F2F4F8', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: 'rgba(242,244,248,0.4)', marginTop: 6 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    marginBottom: 20,
  },
  fieldGroup: { marginBottom: 4 },
  input: { backgroundColor: 'transparent' },
  errorText: { fontSize: 12, color: '#FF6B6B', marginTop: 2, marginLeft: 4 },
  forgotWrap: { alignSelf: 'flex-end', paddingVertical: 8, marginTop: 4 },
  forgotText: { fontSize: 13, color: 'rgba(62,198,198,0.65)' },
  primaryBtnWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  switchLink: { alignItems: 'center', paddingVertical: 4 },
  switchText: { fontSize: 13, color: 'rgba(242,244,248,0.35)' },
  switchHighlight: { color: 'rgba(62,198,198,0.75)', fontWeight: '600' },
});
