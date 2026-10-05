import { getAppVersion } from '@/app/services/api';
import { Tavira } from '@/constants/theme';
import { AppVersionInfo } from '@/types/Types';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

type UpdateKind = 'optional' | 'required';

type PendingUpdate = {
  kind: UpdateKind;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
};

/** Compares dotted numeric versions ("1.2.0" vs "1.10.0"). Returns <0, 0, >0. */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function resolveUpdate(info: AppVersionInfo, currentVersion: string): PendingUpdate | null {
  // Minimum wins even if LatestVersion wasn't bumped alongside it.
  const latestVersion = compareVersions(info.minimumVersion, info.latestVersion) > 0 ? info.minimumVersion : info.latestVersion;
  if (compareVersions(currentVersion, latestVersion) >= 0) return null;
  return {
    kind: compareVersions(currentVersion, info.minimumVersion) < 0 ? 'required' : 'optional',
    currentVersion,
    latestVersion,
    storeUrl: info.androidStoreUrl,
  };
}

/**
 * Prompts the user to install a new native build from Google Play.
 * OTA updates are bound to the app version (runtimeVersion policy "appVersion"),
 * so once a newer store build ships, older installs can only catch up via the store.
 * Checked on launch and whenever the app returns to the foreground.
 */
export function UpdateRequiredDialog() {
  const theme = useTheme();
  const isDark = theme.dark;
  const [update, setUpdate] = useState<PendingUpdate | null>(null);
  const dismissedVersion = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const currentVersion = Constants.expoConfig?.version;
    if (!currentVersion) return;

    const check = async () => {
      try {
        const next = resolveUpdate(await getAppVersion(), currentVersion);
        if (next?.kind === 'optional' && dismissedVersion.current === next.latestVersion) return;
        setUpdate(next);
      } catch {
        // Offline or API unreachable — never block the app on a failed check.
      }
    };
    check();

    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') check();
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  if (!update) return null;

  const isRequired = update.kind === 'required';

  const openStore = async () => {
    const packageId = Constants.expoConfig?.android?.package;
    try {
      if (packageId) {
        await Linking.openURL(`market://details?id=${packageId}`);
        return;
      }
    } catch {
      // Play Store app missing — fall through to the web listing.
    }
    Linking.openURL(update.storeUrl).catch(() => {});
  };

  const dismiss = () => {
    dismissedVersion.current = update.latestVersion;
    setUpdate(null);
  };

  const cardBg = isDark ? Tavira.navyCard : Tavira.white;
  const cardBorder = isDark ? Tavira.glassBorder : 'rgba(62,198,198,0.18)';
  const titleColor = isDark ? Tavira.lightBg : Tavira.navy;
  const bodyColor = isDark ? 'rgba(242,244,248,0.6)' : 'rgba(11,27,58,0.6)';
  const mutedColor = isDark ? 'rgba(242,244,248,0.38)' : 'rgba(11,27,58,0.38)';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isRequired ? () => {} : dismiss}
    >
      <View style={[s.backdrop, { backgroundColor: isDark ? 'rgba(7,18,40,0.82)' : 'rgba(11,27,58,0.45)' }]}>
        <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <LinearGradient colors={Tavira.gradTeal} style={s.iconRing} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={[s.iconInner, { backgroundColor: isDark ? Tavira.navyCard : Tavira.lightBg }]}>
              <Icon source="cellphone-arrow-down" size={30} color={Tavira.teal} />
            </View>
          </LinearGradient>

          <View style={s.versionRow} accessible accessibilityLabel={`Version ${update.currentVersion} to ${update.latestVersion}`}>
            <Text style={[s.versionOld, { color: mutedColor }]}>{update.currentVersion}</Text>
            <Icon source="chevron-double-right" size={18} color={mutedColor} />
            <Text style={s.versionNew}>{update.latestVersion}</Text>
          </View>

          <Text style={[s.title, { color: titleColor }]}>
            {isRequired ? 'Update Tavira to continue' : 'A new version of Tavira is out'}
          </Text>

          <Text style={[s.body, { color: bodyColor }]}>
            {isRequired
              ? 'This version is no longer supported. Install the update from Google Play to keep your budgets in sync.'
              : 'This update can’t install in the background like smaller ones. Get it from Google Play — your data stays as it is.'}
          </Text>

          <TouchableOpacity onPress={openStore} activeOpacity={0.82} style={s.primaryBtn} accessibilityRole="button">
            <LinearGradient colors={Tavira.gradTeal} style={s.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Icon source="google-play" size={18} color={Tavira.navy} />
              <Text style={s.primaryText}>Update on Google Play</Text>
            </LinearGradient>
          </TouchableOpacity>

          {!isRequired && (
            <TouchableOpacity onPress={dismiss} activeOpacity={0.6} style={s.secondaryBtn} accessibilityRole="button">
              <Text style={[s.secondaryText, { color: bodyColor }]}>Not now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Tavira.teal,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.13,
        shadowRadius: 28,
      },
      android: { elevation: 12 },
    }),
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 22,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    flex: 1,
    width: '100%',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  versionOld: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  versionNew: {
    fontSize: 22,
    fontWeight: '800',
    color: Tavira.teal,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 12,
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 24,
  },
  primaryGradient: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: Tavira.navy,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
