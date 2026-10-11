import * as LocalAuthentication from 'expo-local-authentication';
import i18n from '@/i18n';

export async function isDeviceLockAvailable(): Promise<boolean> {
  // SecurityLevel.NONE means no protection at all; anything above that (SECRET = PIN/pattern/password,
  // BIOMETRIC_WEAK/STRONG = biometrics) is sufficient for the lock feature.
  const level = await LocalAuthentication.getEnrolledLevelAsync();
  return level > LocalAuthentication.SecurityLevel.NONE;
}

/** @deprecated use isDeviceLockAvailable */
export async function isBiometricsAvailable(): Promise<boolean> {
  return isDeviceLockAvailable();
}

export async function authenticate(reason = i18n.t('lock.prompt')): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    fallbackLabel: i18n.t('lock.usePasscode'),
    cancelLabel: i18n.t('common.actions.cancel'),
    disableDeviceFallback: false,
  });
  return result.success;
}

export async function getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
  return LocalAuthentication.supportedAuthenticationTypesAsync();
}
