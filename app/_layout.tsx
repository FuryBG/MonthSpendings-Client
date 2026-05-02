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

const customThemeLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5C7A1A',
    onPrimary: '#FFFFFF',
    secondaryContainer: '#E8F5C8',
    onSecondaryContainer: '#3D5212',
    surface: '#FFFFFF',
    surfaceVariant: '#EDF0F5',
    background: '#F5F7FA',
    onBackground: '#0C0E12',
    onSurface: '#0C0E12',
    outline: '#D0D5DF',
    error: '#D94F4F',
  },
};

const customThemeDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BADA55',
    onPrimary: '#0C0E12',
    secondaryContainer: '#1D2A0A',
    onSecondaryContainer: '#BADA55',
    surface: '#161B22',
    surfaceVariant: '#1E242E',
    background: '#0C0E12',
    onBackground: '#EDF0F5',
    onSurface: '#EDF0F5',
    outline: '#2E3440',
    error: '#FF6B6B',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? customThemeDark : customThemeLight;

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
                <StatusBar style="auto" />
              </ThemeProvider>
            </PaperProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
