import { useAuthStore } from '@/stores/authStore';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const PROD_ANDROID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_ID ?? TestIds.INTERSTITIAL;
const PROD_IOS = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS_ID ?? TestIds.INTERSTITIAL;
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : (Platform.select({ android: PROD_ANDROID, ios: PROD_IOS }) ?? TestIds.INTERSTITIAL);

export function useTabInterstitial() {
  const isPro = useAuthStore((s) => s.user?.isPro ?? false);
  const adRef = useRef<InterstitialAd | null>(null);
  const isLoadedRef = useRef(false);
  const isProRef = useRef(isPro);
  isProRef.current = isPro;

  useEffect(() => {
    if (isPro) return;

    function loadNext() {
      if (isProRef.current) return;
      const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
      adRef.current = ad;
      isLoadedRef.current = false;

      ad.addAdEventListener(AdEventType.LOADED, () => {
        isLoadedRef.current = true;
      });
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        isLoadedRef.current = false;
        adRef.current = null;
        loadNext();
      });
      ad.addAdEventListener(AdEventType.ERROR, () => {
        isLoadedRef.current = false;
        setTimeout(loadNext, 5000);
      });

      ad.load();
    }

    loadNext();
    return () => {
      adRef.current = null;
      isLoadedRef.current = false;
    };
  }, [isPro]);

  function showAd() {
    if (isProRef.current) return;
    if (isLoadedRef.current && adRef.current) {
      try {
        adRef.current.show();
      } catch {
        // ignore — ad may have expired between load and show
      }
    }
  }

  return { showAd };
}
