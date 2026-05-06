import { useAuthStore } from '@/stores/authStore';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function PagesLayout() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Redirect href="/(main)/(drawer)/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="TermsOfService" options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" options={{ headerShown: false }} />
    </Stack>
  );
}
