import { getUser } from '@/app/services/api';
import { AppUser } from '@/types/Types';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext({
  user: {} as AppUser | null | undefined,
  loading: true as boolean,
  signIn: (token: string, userData: any) => { },
  signOut: () => { },
  reFetchAuth: () => { }
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>();
  const [token, setToken] = useState<string | null>();
  const [loading, setLoading] = useState(true);
  const [triggerReload, setTriggerReload] = useState<boolean>(false);

  useEffect(() => {
    // Load user/token from secure storage
    const restoreSession = async () => {
      try {
        let jwtToken = await SecureStore.getItemAsync('token');

        if (jwtToken != null) {
          let userData = await getUser();
          setUser(userData);
        }

      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [token, triggerReload]);

  const signIn = async (token: string) => {
    await SecureStore.setItemAsync('token', token);
    setToken(token);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
    setToken(null);
  };

  const reFetchAuth = () => {
    setTriggerReload(prev => !prev);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, reFetchAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
