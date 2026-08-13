import { setOnUnauthorized, updateNotificationToken, updateUserActivity } from '@/app/services/api';
import { configureRevenueCat, identifyUser, logOutRevenueCat } from '@/app/services/revenuecat';
import Purchases from 'react-native-purchases';
import { GlobalSnackbar } from '@/components/GlobalSnackbar';
import { LockGate } from '@/components/LockGate';
import { NotificationProvider, useNotification } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/queryClient';
import { useAppLockStore } from '@/stores/appLockStore';
import { useAuthStore } from '@/stores/authStore';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AppState, Modal, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

const taviraDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary:            '#3EC6C6',
    onPrimary:          '#0B1B3A',
    primaryContainer:   'rgba(62,198,198,0.15)',
    onPrimaryContainer: '#3EC6C6',
    secondary:          '#5B7BFF',
    onSecondary:        '#FFFFFF',
    secondaryContainer: 'rgba(91,123,255,0.15)',
    onSecondaryContainer: '#5B7BFF',
    surface:            'rgba(255,255,255,0.07)',
    surfaceVariant:     'rgba(255,255,255,0.12)',
    background:         '#0B1B3A',
    onBackground:       '#F2F4F8',
    onSurface:          '#F2F4F8',
    onSurfaceVariant:   'rgba(242,244,248,0.65)',
    outline:            'rgba(255,255,255,0.15)',
    outlineVariant:     'rgba(255,255,255,0.08)',
    error:              '#FF6B6B',
    onError:            '#FFFFFF',
    elevation: {
      level0: 'transparent',
      level1: 'rgba(255,255,255,0.07)',
      level2: 'rgba(255,255,255,0.07)',
      level3: 'rgba(255,255,255,0.07)',
      level4: 'rgba(255,255,255,0.07)',
      level5: 'rgba(255,255,255,0.07)',
    },
  },
};

const taviraLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:            '#0B1B3A',
    onPrimary:          '#FFFFFF',
    primaryContainer:   'rgba(11,27,58,0.08)',
    onPrimaryContainer: '#0B1B3A',
    secondary:          '#5B7BFF',
    onSecondary:        '#FFFFFF',
    secondaryContainer: 'rgba(91,123,255,0.10)',
    onSecondaryContainer: '#3B57B5',
    surface:            '#FFFFFF',
    surfaceVariant:     '#F2F4F8',
    background:         '#F2F4F8',
    onBackground:       '#0B1B3A',
    onSurface:          '#0B1B3A',
    onSurfaceVariant:   'rgba(11,27,58,0.55)',
    outline:            'rgba(11,27,58,0.15)',
    outlineVariant:     'rgba(11,27,58,0.08)',
    error:              '#D94F4F',
    onError:            '#FFFFFF',
  },
};

function NotificationTokenSync() {
  const { expoPushToken } = useNotification();
  const user = useAuthStore((s) => s.user);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (user && expoPushToken) {
      updateNotificationToken(expoPushToken).catch(() => {});
    }
  }, [user?.id, expoPushToken]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        const currentUser = useAuthStore.getState().user;
        if (currentUser && expoPushToken) {
          updateNotificationToken(expoPushToken).catch(() => {});
        }
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [expoPushToken]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? taviraDark : taviraLight;
  const user = useAuthStore((s) => s.user);
  const userLoading = useAuthStore((s) => s.userLoading);
  const appState = useRef(AppState.currentState);
  const [isLocked, setIsLocked] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    configureRevenueCat();
    const onCustomerInfoUpdate = () => { useAuthStore.getState().refreshUser(); };
    Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdate);

    const init = async () => {
      // Read lock pref and stored token in parallel — both are fast local reads.
      // Do this BEFORE restoreSession so the gate appears before any app content shows.
      const [, token] = await Promise.all([
        useAppLockStore.getState().load(),
        SecureStore.getItemAsync('token'),
      ]);
      if (useAppLockStore.getState().lockEnabled && token) {
        setIsLocked(true);
      }
      setBootDone(true);

      await useAuthStore.getState().restoreSession();
    };
    init();

    setOnUnauthorized(() => {
      useAuthStore.getState().clearUser();
    });

    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        useAuthStore.getState().refreshUser();
        const { lockEnabled } = useAppLockStore.getState();
        if (lockEnabled && useAuthStore.getState().user) {
          setIsLocked(true);
        }
      }
      appState.current = next;
    });
    return () => {
      Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdate);
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      identifyUser(user.id.toString());
      updateUserActivity({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
        .catch(() => {});
    } else if (!userLoading) {
      // Only log out RC once the session is fully resolved — avoids a race where
      // logOut() fires concurrently with identifyUser() during session restore.
      logOutRevenueCat();
    }
  }, [user?.id, userLoading]);

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <NotificationTokenSync />
            <PaperProvider theme={theme}>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }} />
                <GlobalSnackbar />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              </ThemeProvider>
              {isLocked && <LockGate onUnlock={() => setIsLocked(false)} />}
            </PaperProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </KeyboardProvider>
      <Modal visible={!bootDone} transparent={false} animationType="none" statusBarTranslucent>
        <View style={styles.bootCover} />
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bootCover: {
    flex: 1,
    backgroundColor: '#0B1B3A',
  },
});
