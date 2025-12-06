import { AuthContext } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';
import React, { useContext } from 'react';

export default function PagesLayout() {
  const { user, loading } = useContext(AuthContext);


  if (user != undefined) {
    return <Redirect href="/(main)/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
    </Stack>
  );
}