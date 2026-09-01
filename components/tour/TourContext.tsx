import React, { createContext, FC, ReactNode, useCallback, useContext, useRef } from 'react';
import { View } from 'react-native';

interface TourContextValue {
  registerRef: (key: string, ref: React.RefObject<View | null>) => void;
  getRef: (key: string) => React.RefObject<View | null> | undefined;
}

const TourContext = createContext<TourContextValue>({
  registerRef: () => {},
  getRef: () => undefined,
});

export const TourProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const refs = useRef(new Map<string, React.RefObject<View | null>>());

  const registerRef = useCallback((key: string, ref: React.RefObject<View | null>) => {
    if (key) refs.current.set(key, ref);
  }, []);

  const getRef = useCallback((key: string) => refs.current.get(key), []);

  return (
    <TourContext.Provider value={{ registerRef, getRef }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTourContext = () => useContext(TourContext);
