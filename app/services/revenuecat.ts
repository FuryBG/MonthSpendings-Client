import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

// TODO: replace with separate platform-specific production keys before store submission
const API_KEYS = {
  ios: 'test_ImwgKzPeVHYrwBCcgQBxHvwSiwa',
  android: 'test_ImwgKzPeVHYrwBCcgQBxHvwSiwa',
};

export const ENTITLEMENT_ID = 'Tavira Pro';

export function configureRevenueCat(): void {
  return; // TODO: restore when production RC keys are ready
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({
    apiKey: Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android,
  });
}

export async function identifyUser(userId: string): Promise<void> {
  return; // TODO: restore when production RC keys are ready
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    console.warn('[RC] logIn error:', e);
  }
}

export async function logOutRevenueCat(): Promise<void> {
  return; // TODO: restore when production RC keys are ready
  try {
    const info = await Purchases.getCustomerInfo();
    if (!info.originalAppUserId.startsWith('$RCAnonymousID:')) {
      await Purchases.logOut();
    }
  } catch (e) {
    console.warn('[RC] logOut error:', e);
  }
}

export async function hasProEntitlement(): Promise<boolean> {
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    return !!info.entitlements.active[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}
