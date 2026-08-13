import 'expo-router/entry';
import * as SecureStore from 'expo-secure-store';
import { AppRegistry } from 'react-native';
import { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import { GOOGLE_WALLET_PACKAGES, parseWalletNotification } from './utils/parseWalletNotification';

const API_BASE = process.env["EXPO_PUBLIC_API_URL"] ?? 'https://9186-190-2-151-137.ngrok-free.app';

const headlessNotificationTask = async ({ notification: notificationJson }) => {
  if (!notificationJson) return;

  let notification;
  try {
    notification = JSON.parse(notificationJson);
  } catch {
    return;
  }

  if (!GOOGLE_WALLET_PACKAGES.includes(notification.app)) return;

  const text = notification.text || notification.bigText || '';
  const parsed = parseWalletNotification(notification.title, text);
  if (!parsed) return;

  const token = await SecureStore.getItemAsync('token');
  if (!token) return;

  try {
    await fetch(`${API_BASE}/api/notification-transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed),
    });
  } catch {
    // Network error in headless context — silently ignore
  }
};

AppRegistry.registerHeadlessTask(
  RNAndroidNotificationListenerHeadlessJsName,
  () => headlessNotificationTask,
);
