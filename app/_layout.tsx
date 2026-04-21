import { setOnUnauthorized } from '@/app/services/api';
import { NotificationProvider } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

const customThemeLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#BADA55',
    secondaryContainer: '#BADA55',
    onSecondaryContainer: '#000000',
    surface: "#F1F1F1F1",
    onBackground: '#000000',
    onPrimary: "#000000",
  },
};

const customThemeDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BADA55',
    secondaryContainer: '#BADA55',
    onSecondaryContainer: '#000000',
    surface: "#1F2021",
    surfaceVariant: "#1F2021",
    background: "#0000",
    onBackground: '#FFFFFF',
    onPrimary: "#000000",
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
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <PaperProvider theme={theme}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </ThemeProvider>
          </PaperProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
