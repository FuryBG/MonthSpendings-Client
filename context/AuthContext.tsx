import * as SecureStore from 'expo-secure-store';
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react';

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user/token from secure storage
    const restoreSession = async () => {
      try {
        const user = await SecureStore.getItemAsync('user');

        if (user) {
          // Optionally validate token with your backend
          setUser(JSON.parse(user));
        }
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signIn = async (token: string, userData: any) => {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
