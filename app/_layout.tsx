import { AuthProvider } from '@/context/AuthContext';
import { BudgetProvider } from '@/context/BudgetContext';
import { TitleProvider } from '@/context/NavBarTitleContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const scheme = useColorScheme();

  const customThemeLight = {
    ...MD3LightTheme,
    // Specify custom property
    myOwnProperty: true,
    // Specify custom property in nested object
    colors: {
      ...MD3LightTheme.colors,
      primary: '#BADA55',
      onBackground: "#0000",
      onPrimary: "#0000",
    },
  };

  const customThemeDark = {
    ...MD3DarkTheme,
    // Specify custom property
    myOwnProperty: true,
    // Specify custom property in nested object
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#BADA55',
      surface: "#0000",
      background: "#0000",
      onBackground: '#FFFFFF',
      onPrimary: "#0000",
    },
  };

  const theme = scheme === 'dark' ? customThemeDark : customThemeLight;

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <BudgetProvider>
          <NotificationProvider>
            <TitleProvider>
              <PaperProvider theme={theme}>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack screenOptions={{ headerShown: false }}>

                  </Stack>
                  <StatusBar style="auto" />
                </ThemeProvider>
              </PaperProvider>
            </TitleProvider>
          </NotificationProvider>
        </BudgetProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
