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
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          // Optionally validate token with your backend
          setUser({ token });
        }
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signIn = async (token: string, userData: any) => {
    await SecureStore.setItemAsync('token', token);
    setUser({ token, ...userData });
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
