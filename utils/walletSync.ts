import { getWalletIngestToken } from '@/app/services/api';
import { NativeModules, Platform } from 'react-native';

type WalletSyncModule = {
  isNotificationListenerEnabled: () => Promise<boolean>;
  setToken: (token: string) => Promise<void>;
  deleteToken: () => Promise<void>;
  flushOutbox: () => Promise<void>;
};

export const WalletSync = NativeModules.WalletSync as WalletSyncModule | undefined;

/**
 * Hands the background wallet listener its own long-lived, ingest-only token and retries anything it queued
 * (offline, or while it had no valid token). Best-effort: the listener keeps its queue until the next try.
 */
export async function refreshWalletIngestToken(): Promise<void> {
  if (Platform.OS !== 'android' || !WalletSync) return;
  try {
    const { token } = await getWalletIngestToken();
    await WalletSync.setToken(token);
    await WalletSync.flushOutbox();
  } catch {
    // best-effort
  }
}

export function clearWalletIngestToken(): void {
  WalletSync?.deleteToken().catch(() => {});
}
