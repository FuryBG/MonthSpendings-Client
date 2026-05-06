import { setOnUnauthorized } from '@/app/services/api';
import { GlobalSnackbar } from '@/components/GlobalSnackbar';
import { NotificationProvider } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? taviraDark : taviraLight;

  useEffect(() => {
    useAuthStore.getState().restoreSession();
    setOnUnauthorized(() => {
      useAuthStore.getState().clearUser();
    });
  }, []);

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <PaperProvider theme={theme}>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }} />
                <GlobalSnackbar />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              </ThemeProvider>
            </PaperProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
