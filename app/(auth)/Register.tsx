import { useAuthStore } from '@/stores/authStore';
import { registerWithEmail } from '../services/api';
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

const PASSWORD_CHECKS = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One digit', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[\W_]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  return (
    <View style={strengthStyles.wrap}>
      {PASSWORD_CHECKS.map((c) => {
        const ok = c.test(password);
        return (
          <View key={c.label} style={strengthStyles.row}>
            <Icon
              source={ok ? 'check-circle-outline' : 'circle-outline'}
              size={13}
              color={ok ? '#3EC6C6' : 'rgba(242,244,248,0.25)'}
            />
            <Text style={[strengthStyles.label, ok && strengthStyles.labelOk]}>{c.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const strengthStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginLeft: 4, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '47%' },
  label: { fontSize: 11, color: 'rgba(242,244,248,0.28)' },
  labelOk: { color: '#3EC6C6' },
});

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  function clearError(field: keyof FieldErrors) {
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e: FieldErrors = {};
    if (!firstName.trim()) e.firstName = 'Required.';
    if (!lastName.trim()) e.lastName = 'Required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (!PASSWORD_CHECKS.every((c) => c.test(password)))
      e.password = 'Password does not meet all requirements.';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const tokens = await registerWithEmail({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await signIn(tokens);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setSnackMessage('An account with this email already exists.');
      } else if (status === 429) {
        setSnackMessage('Too many attempts. Please wait a minute and try again.');
      } else {
        setSnackMessage('Something went wrong. Please try again.');
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start tracking your spending with Tavira</Text>
          </View>

          <View style={styles.card}>
            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={[styles.fieldGroup, styles.nameField]}>
                <TextInput
                  label="First name"
                  value={firstName}
                  onChangeText={(v) => { setFirstName(v); clearError('firstName'); }}
                  autoCapitalize="words"
                  textContentType="givenName"
                  mode="flat"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!errors.firstName}
                />
                {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
              </View>
              <View style={[styles.fieldGroup, styles.nameField]}>
                <TextInput
                  label="Last name"
                  value={lastName}
                  onChangeText={(v) => { setLastName(v); clearError('lastName'); }}
                  autoCapitalize="words"
                  textContentType="familyName"
                  mode="flat"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!errors.lastName}
                />
                {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(v) => { setEmail(v); clearError('email'); }}
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

            {/* Password */}
            <View style={styles.fieldGroup}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={(v) => { setPassword(v); clearError('password'); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="newPassword"
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
              <PasswordStrength password={password} />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <TextInput
                label="Confirm password"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                textContentType="newPassword"
                mode="flat"
                style={styles.input}
                theme={inputTheme}
                error={!!errors.confirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    color="rgba(242,244,248,0.4)"
                    onPress={() => setShowConfirm((v) => !v)}
                  />
                }
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtnWrap}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#3EC6C6', '#5B7BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Creating account…' : 'Create account'}</Text>
              {!loading && <Icon source="arrow-right" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/EmailLogin')}
            activeOpacity={0.75}
            style={styles.switchLink}
          >
            <Text style={styles.switchText}>
              Already have an account?{'  '}
              <Text style={styles.switchHighlight}>Sign in</Text>
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
  nameRow: { flexDirection: 'row', gap: 12 },
  nameField: { flex: 1 },
  fieldGroup: { marginBottom: 4 },
  input: { backgroundColor: 'transparent' },
  errorText: { fontSize: 12, color: '#FF6B6B', marginTop: 2, marginLeft: 4 },
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
