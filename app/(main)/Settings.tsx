import { requestAccountDeletion, updateSyncWalletTransactions } from '@/app/services/api';
import { isDeviceLockAvailable } from '@/app/services/biometrics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Tavira } from '@/constants/theme';
import { useAppLockStore } from '@/stores/appLockStore';
import { useAuthStore } from '@/stores/authStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Platform, Pressable, StyleSheet, View } from 'react-native';
import RNAndroidNotificationListener from 'react-native-android-notification-listener';
import { Icon, Switch, Text, useTheme } from 'react-native-paper';

function SettingRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  icon: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const isDark = theme.dark;
  const iconColor = isDark ? Tavira.teal : theme.colors.primary;
  const iconBg = isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant;

  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon source={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: isDark ? '#F2F4F8' : theme.colors.onBackground }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.description, { color: isDark ? 'rgba(242,244,248,0.45)' : theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        color={Tavira.teal}
      />
    </View>
  );
}

function DangerRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,107,107,0.12)' }]}>
        <Icon source={icon} size={20} color={Tavira.expense} />
      </View>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: Tavira.expense }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const lockEnabled = useAppLockStore((s) => s.lockEnabled);
  const setLockEnabled = useAppLockStore((s) => s.setLockEnabled);

  const [syncValue, setSyncValue] = useState(user!.syncWalletTransactions);
  const pendingEnable = useRef(false);

  useEffect(() => {
    setSyncValue(user!.syncWalletTransactions);
  }, [user?.syncWalletTransactions]);

  useEffect(() => {
    useAppLockStore.getState().load();
  }, []);

  const handleLockToggle = async (newValue: boolean) => {
    if (newValue) {
      const available = await isDeviceLockAvailable();
      if (!available) {
        showError('No biometrics or device PIN set up. Enable a screen lock in your device settings first.');
        return;
      }
    }
    await setLockEnabled(newValue);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Your request will be reviewed. Your account and all associated data will be permanently deleted within 30 days. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: async () => {
            try {
              await requestAccountDeletion();
              showSuccess('Deletion request submitted. We will process it within 30 days.');
            } catch {
              showError('Failed to submit request. Please try again.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState !== 'active' || !pendingEnable.current) return;
      pendingEnable.current = false;

      const status = await RNAndroidNotificationListener.getPermissionStatus();
      if (status === 'authorized') {
        try {
          await updateSyncWalletTransactions(true);
          await refreshUser();
        } catch {
          setSyncValue(false);
          showError('Failed to enable Wallet Sync. Please try again.');
        }
      } else {
        setSyncValue(false);
        showError('Notification access is required for Wallet Sync.');
      }
    });
    return () => subscription.remove();
  }, []);

  const handleSyncToggle = async (newValue: boolean) => {
    setSyncValue(newValue);

    if (newValue) {
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      if (status !== 'authorized') {
        pendingEnable.current = true;
        RNAndroidNotificationListener.requestPermission();
        return;
      }
    }

    try {
      await updateSyncWalletTransactions(newValue);
      await refreshUser();
    } catch {
      setSyncValue(!newValue);
      showError('Failed to update Wallet Sync. Please try again.');
    }
  };

  const sectionLabelColor = isDark ? 'rgba(62,198,198,0.65)' : theme.colors.primary;

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Settings' }} />

      {Platform.OS === 'android' && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>NOTIFICATIONS</Text>
          <View style={[styles.card, { backgroundColor: isDark ? Tavira.glassBg : theme.colors.surface, borderColor: isDark ? Tavira.glassBorder : 'transparent' }]}>
            <SettingRow
              icon="bell-sync-outline"
              label="Wallet Sync"
              description="Reads payment notifications to log transactions automatically."
              value={syncValue}
              onValueChange={handleSyncToggle}
              disabled={!user!.isPro}
            />
          </View>
          {!user!.isPro && (
            <Text style={[styles.proHint, { color: isDark ? 'rgba(242,244,248,0.35)' : theme.colors.onSurfaceVariant }]}>
              Upgrade to Tavira Pro to enable Wallet Sync.
            </Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>SECURITY</Text>
        <View style={[styles.card, { backgroundColor: isDark ? Tavira.glassBg : theme.colors.surface, borderColor: isDark ? Tavira.glassBorder : 'transparent' }]}>
          <SettingRow
            icon="fingerprint"
            label="Lock App"
            description="Require biometrics or device PIN to open Tavira."
            value={lockEnabled}
            onValueChange={handleLockToggle}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,107,107,0.55)' : theme.colors.error }]}>DANGER ZONE</Text>
        <View style={[styles.card, { backgroundColor: isDark ? Tavira.glassBg : theme.colors.surface, borderColor: isDark ? 'rgba(255,107,107,0.15)' : 'rgba(217,79,79,0.15)' }]}>
          <DangerRow
            icon="account-remove-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  proHint: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
});
