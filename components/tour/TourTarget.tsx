import { tourTargets } from '@/utils/tourTargets';
import { FC, ReactNode, useEffect, useRef } from 'react';
import { View } from 'react-native';

interface Props {
  id: string;
  children: ReactNode;
}

export const TourTarget: FC<Props> = ({ id, children }) => {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (!id) return;
    // measure() returns pageX/pageY relative to the root RN view — the same
    // coordinate space as a Modal without statusBarTranslucent. This is more
    // reliable than measureInWindow() which returns physical-screen coords and
    // diverges from Modal/Portal space by the status-bar height on Android.
    tourTargets.register(id, () => new Promise((resolve, reject) => {
      requestAnimationFrame(() => {
        if (!ref.current) { reject(new Error(`TourTarget "${id}" unmounted`)); return; }
        ref.current.measure((_x, _y, width, height, pageX, pageY) => {
          resolve({ x: pageX, y: pageY, width, height });
        });
      });
    }));
    return () => tourTargets.unregister(id);
  }, [id]);

  return (
    <View ref={ref} collapsable={false}>
      {children}
    </View>
  );
};
