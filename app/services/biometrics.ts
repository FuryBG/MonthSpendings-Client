import * as LocalAuthentication from 'expo-local-authentication';

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

export async function authenticate(reason = 'Unlock Tavira'): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    fallbackLabel: 'Use Passcode',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}

export async function getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
  return LocalAuthentication.supportedAuthenticationTypesAsync();
}
