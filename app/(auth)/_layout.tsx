import { useAuth } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function PagesLayout() {
  const { user, loading } = useAuth();


  if (user != undefined) {
    return <Redirect href="/(main)/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
    </Stack>
  );
}