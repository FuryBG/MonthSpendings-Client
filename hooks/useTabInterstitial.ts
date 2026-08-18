import { mobileAdsReady } from '@/app/_layout';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';

const PROD_ANDROID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_ID ?? TestIds.INTERSTITIAL;
const PROD_IOS = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS_ID ?? TestIds.INTERSTITIAL;
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : (Platform.select({ android: PROD_ANDROID, ios: PROD_IOS }) ?? TestIds.INTERSTITIAL);

export function useTabInterstitial() {
  const isPro = false; //useAuthStore((s) => s.user?.isPro ?? false);
  const { isLoaded, isClosed, load, show, error } = useInterstitialAd(AD_UNIT_ID);
  useEffect(() => { if (error) console.log('[Ad] load error:', error); }, [error]);
  const isProRef = useRef(isPro);
  isProRef.current = isPro;
  const isLoadedRef = useRef(isLoaded);
  isLoadedRef.current = isLoaded;
  const showRef = useRef(show);
  showRef.current = show;

  useEffect(() => {
    mobileAdsReady.then(() => {
      console.log('[Ad] calling load()');
      load();
    });
  }, [isPro]);

  useEffect(() => {
    if (isClosed && !isProRef.current) load();
  }, [isClosed]);

  function showAd() {
    console.log('[Ad] showAd — isLoaded:', isLoadedRef.current, 'isPro:', isProRef.current);
    if (isProRef.current || !isLoadedRef.current) return;
    try {
      showRef.current();
    } catch {
      // ad may have expired between load and show
    }
  }

  return { showAd };
}
