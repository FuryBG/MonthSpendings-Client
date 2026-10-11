import { requestAccountDeletion, updateNotificationToken, updateSyncWalletTransactions } from '@/app/services/api';
import { isDeviceLockAvailable } from '@/app/services/biometrics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenIntroSheet } from '@/components/tour/ScreenIntroSheet';
import { Tavira } from '@/constants/theme';
import { useAmountVisibilityStore } from '@/stores/amountVisibilityStore';
import { useAppLockStore } from '@/stores/appLockStore';
import { useAuthStore } from '@/stores/authStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { useTourStore } from '@/stores/tourStore';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Linking, NativeModules, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import i18n, { LANGUAGE_NATIVE_NAMES, localeTag } from '@/i18n';
import { LanguageSheet } from '@/components/LanguageSheet';
import { useLanguageStore } from '@/stores/languageStore';
import { getApiErrorMessage } from '@/utils/apiError';

const WalletSync = NativeModules.WalletSync as
  | { isNotificationListenerEnabled: () => Promise<boolean> }
  | undefined;

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

function NotificationBanner({ canAskAgain, onPress }: { canAskAgain: boolean; onPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isDark = theme.dark;
  const subtitleColor = isDark ? 'rgba(245,158,11,0.65)' : 'rgba(160,95,0,0.85)';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.notifBanner,
        {
          backgroundColor: isDark ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.08)',
          borderColor: isDark ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.38)',
          opacity: pressed ? 0.72 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
        <Icon source="bell-off-outline" size={20} color={Tavira.warning} />
      </View>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: Tavira.warning }]}>{t('settings.notificationsOff.title')}</Text>
        <Text style={[styles.description, { color: subtitleColor }]}>
          {canAskAgain ? t('settings.notificationsOff.tapToEnable') : t('settings.notificationsOff.openSettings')}
        </Text>
      </View>
      <Icon
        source={canAskAgain ? 'bell-outline' : 'open-in-new'}
        size={18}
        color={isDark ? 'rgba(245,158,11,0.50)' : 'rgba(160,95,0,0.50)'}
      />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { t, i18n: i18nInstance } = useTranslation();
  const isDark = theme.dark;
  const language = useLanguageStore((s) => s.language);
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const lockEnabled = useAppLockStore((s) => s.lockEnabled);
  const setLockEnabled = useAppLockStore((s) => s.setLockEnabled);
  const amountsHidden = useAmountVisibilityStore((s) => s.hidden);
  const toggleAmountsHidden = useAmountVisibilityStore((s) => s.toggleHidden);

  const [syncValue, setSyncValue] = useState(user!.syncWalletTransactions);
  const [lockValue, setLockValue] = useState(lockEnabled);
  const [amountsValue, setAmountsValue] = useState(amountsHidden);
  const pendingEnable = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem('@wallet_sync_pending').then((val) => {
      if (val === '1') pendingEnable.current = true;
    });
  }, []);

  const [notifStatus, setNotifStatus] = useState<{ status: string; canAskAgain: boolean } | null>(null);
  const pendingNotifEnable = useRef(false);

  useEffect(() => { setSyncValue(user!.syncWalletTransactions); }, [user?.syncWalletTransactions]);
  useEffect(() => { setLockValue(lockEnabled); }, [lockEnabled]);
  useEffect(() => { setAmountsValue(amountsHidden); }, [amountsHidden]);

  useEffect(() => {
    useAppLockStore.getState().load();
  }, []);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status, canAskAgain }) => {
      setNotifStatus({ status, canAskAgain });
    });
  }, []);

  const tryRegisterPushToken = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) await updateNotificationToken(token);
      showSuccess(i18n.t('settings.messages.notificationsEnabled'));
    } catch {
      // token registration failed silently
    }
  };

  const handleLockToggle = async (newValue: boolean) => {
    setLockValue(newValue);
    if (newValue) {
      const available = await isDeviceLockAvailable();
      if (!available) {
        setLockValue(false);
        await setLockEnabled(false);
        showError(t('settings.messages.noDeviceLock'));
        return;
      }
    }
    await setLockEnabled(newValue);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount.title'),
      t('settings.deleteAccount.message'),
      [
        { text: t('common.actions.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await requestAccountDeletion();
              showSuccess(t('settings.deleteAccount.submitted'));
            } catch (e) {
              showError(getApiErrorMessage(e, t('settings.deleteAccount.failed')));
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;

      if (pendingEnable.current) {
        pendingEnable.current = false;
        AsyncStorage.removeItem('@wallet_sync_pending');
        const enabled = WalletSync ? await WalletSync.isNotificationListenerEnabled() : false;
        if (enabled) {
          try {
            await updateSyncWalletTransactions(true);
            await refreshUser();
          } catch {
            setSyncValue(false);
            showError(i18n.t('settings.messages.walletSyncEnableFailed'));
          }
        } else {
          setSyncValue(false);
          showError(i18n.t('settings.messages.walletSyncAccessRequired'));
        }
      }

      if (pendingNotifEnable.current) {
        pendingNotifEnable.current = false;
        const { status, canAskAgain } = await Notifications.getPermissionsAsync();
        setNotifStatus({ status, canAskAgain });
        if (status === 'granted') await tryRegisterPushToken();
      }
    });
    return () => subscription.remove();
  }, []);

  const handleEnableNotifications = async () => {
    if (!notifStatus) return;
    if (notifStatus.canAskAgain) {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      setNotifStatus({ status, canAskAgain });
      if (status === 'granted') await tryRegisterPushToken();
    } else {
      pendingNotifEnable.current = true;
      Linking.openSettings();
    }
  };

  const handleSyncToggle = async (newValue: boolean) => {
    setSyncValue(newValue);

    if (newValue) {
      const enabled = WalletSync ? await WalletSync.isNotificationListenerEnabled() : false;
      if (!enabled) {
        pendingEnable.current = true;
        await AsyncStorage.setItem('@wallet_sync_pending', '1');
        Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS').catch(() => {});
        return;
      }
    }

    try {
      await updateSyncWalletTransactions(newValue);
      await refreshUser();
    } catch {
      setSyncValue(!newValue);
      showError(t('settings.messages.walletSyncUpdateFailed'));
    }
  };

  const sectionLabelColor = isDark ? 'rgba(62,198,198,0.65)' : theme.colors.primary;

  return (
    <ScreenContainer scrollable>
      <Stack.Screen options={{ title: t('settings.title') }} />

      {notifStatus && notifStatus.status !== 'granted' && (
        <NotificationBanner canAskAgain={notifStatus.canAskAgain} onPress={handleEnableNotifications} />
      )}

      {Platform.OS === 'android' && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>{t('settings.sections.notifications')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? Tavira.glassBg : theme.colors.surface, borderColor: isDark ? Tavira.glassBorder : 'transparent' }]}>
            <SettingRow
              icon="bell-sync-outline"
              label={t('settings.walletSync.label')}
              description={t('settings.walletSync.description')}
              value={syncValue}
              onValueChange={handleSyncToggle}
              disabled={!user!.isPro || notifStatus?.status !== 'granted'}
            />
          </View>
          {!user!.isPro ? (
            <Text style={[styles.proHint, { color: isDark ? 'rgba(242,244,248,0.35)' : theme.colors.onSurfaceVariant }]}>
              {t('settings.walletSync.proHint')}
            </Text>
          ) : notifStatus?.status !== 'granted' && (
            <Text style={[styles.proHint, { color: isDark ? 'rgba(242,244,248,0.35)' : theme.colors.onSurfaceVariant }]}>
              {t('settings.walletSync.notificationsHint')}
            </Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>{t('settings.sections.security')}</Text>
        <View style={[styles.card, { backgroundColor: isDark ? Tavira.glassBg : theme.colors.surface, borderColor: isDark ? Tavira.glassBorder : 'transparent' }]}>
          <SettingRow
            icon="fingerprint"
            label={t('settings.lockApp.label')}
            description={t('settings.lockApp.description')}
            value={lockValue}
            onValueChange={handleLockToggle}
          />
          <View style={[styles.rowDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]} />
          <SettingRow
            icon="eye-off-outline"
            label={t('settings.hideAmounts.label')}
            description={t('settings.hideAmounts.description')}
            value={amountsValue}
            onValueChange={(v) => { setAmountsValue(v); toggleAmountsHidden(); }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>{t('settings.sections.general')}</Text>
        <View style={[styles.card, { backgroundColor: isDark ? Tavira.glassBg : theme.colors.surface, borderColor: isDark ? Tavira.glassBorder : 'transparent' }]}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            onPress={() => setLanguageSheetVisible(true)}
            accessibilityRole="button"
          >
            <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant }]}>
              <Icon source="translate" size={20} color={isDark ? Tavira.teal : theme.colors.primary} />
            </View>
            <View style={styles.labelWrap}>
              <Text style={[styles.label, { color: isDark ? '#F2F4F8' : theme.colors.onBackground }]}>{t('settings.language.label')}</Text>
              <Text style={[styles.description, { color: isDark ? 'rgba(242,244,248,0.45)' : theme.colors.onSurfaceVariant }]}>
                {LANGUAGE_NATIVE_NAMES[language]}
              </Text>
            </View>
            <Icon source="chevron-right" size={18} color={isDark ? 'rgba(242,244,248,0.30)' : theme.colors.onSurfaceVariant} />
          </Pressable>
          <View style={[styles.rowDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            onPress={async () => {
              await useTourStore.getState().resetTour();
              router.back();
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant }]}>
              <Icon source="compass-outline" size={20} color={isDark ? Tavira.teal : theme.colors.primary} />
            </View>
            <View style={styles.labelWrap}>
              <Text style={[styles.label, { color: isDark ? '#F2F4F8' : theme.colors.onBackground }]}>{t('settings.appTour.label')}</Text>
              <Text style={[styles.description, { color: isDark ? 'rgba(242,244,248,0.45)' : theme.colors.onSurfaceVariant }]}>
                {t('settings.appTour.description')}
              </Text>
            </View>
            <Icon source="chevron-right" size={18} color={isDark ? 'rgba(242,244,248,0.30)' : theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,107,107,0.55)' : theme.colors.error }]}>{t('settings.sections.dangerZone')}</Text>
        <View style={[styles.card, { backgroundColor: isDark ? Tavira.glassBg : theme.colors.surface, borderColor: isDark ? 'rgba(255,107,107,0.15)' : 'rgba(217,79,79,0.15)' }]}>
          <DangerRow
            icon="account-remove-outline"
            label={t('settings.deleteAccount.title')}
            onPress={handleDeleteAccount}
          />
        </View>
      </View>

      <View style={styles.versionBlock}>
        <View style={[styles.versionDivider, { backgroundColor: isDark ? 'rgba(242,244,248,0.08)' : 'rgba(11,27,58,0.08)' }]} />
        <Text style={[styles.versionLabel, { color: isDark ? 'rgba(242,244,248,0.28)' : 'rgba(11,27,58,0.28)' }]}>
          {t('settings.version.label')}
        </Text>
        <Text style={[styles.versionNumber, { color: isDark ? 'rgba(242,244,248,0.55)' : 'rgba(11,27,58,0.55)' }]}>
          {Constants.expoConfig?.version ?? '—'}
        </Text>
        <Text style={[styles.versionMeta, { color: isDark ? 'rgba(242,244,248,0.25)' : 'rgba(11,27,58,0.25)' }]}>
          {Updates.updateId
            ? 'OTA · ' + Updates.updateId.slice(0, 8) + (Updates.createdAt != null ? ' · ' + Updates.createdAt.toLocaleDateString(localeTag(i18nInstance.language), { day: 'numeric', month: 'short', year: 'numeric' }) : '')
            : t('settings.version.embedded')}
        </Text>
      </View>
      <ScreenIntroSheet
        screenKey="Settings"
        icon="cog-outline"
        title={t('settings.intro.title')}
        bullets={[
          { icon: 'fingerprint', text: t('settings.intro.lockApp') },
          { icon: 'bell-sync-outline', text: t('settings.intro.walletSync') },
          { icon: 'eye-outline', text: t('settings.intro.amounts') },
          { icon: 'translate', text: t('settings.intro.language') },
          { icon: 'compass-outline', text: t('settings.intro.appTour') },
        ]}
      />
      <LanguageSheet
        visible={languageSheetVisible}
        onClose={() => setLanguageSheetVisible(false)}
        onChanged={() => showSuccess(i18n.t('settings.language.changed'))}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
  },
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
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
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
  versionBlock: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 32,
    gap: 5,
  },
  versionDivider: {
    width: 40,
    height: 1,
    marginBottom: 16,
  },
  versionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.2,
  },
  versionNumber: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  versionMeta: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
