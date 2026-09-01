import { FC, ReactNode, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useTourContext } from './TourContext';

interface TourSpotlightProps {
  tourKey: string;
  children: ReactNode;
}

export const TourSpotlight: FC<TourSpotlightProps> = ({ tourKey, children }) => {
  const { registerRef } = useTourContext();
  const innerRef = useRef<View>(null);

  useEffect(() => {
    if (tourKey) registerRef(tourKey, innerRef);
  }, [tourKey, registerRef]);

  return (
    <View ref={innerRef} collapsable={false}>
      {children}
    </View>
  );
};
