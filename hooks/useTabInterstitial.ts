import { mobileAdsReady } from '@/app/_layout';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useRef } from 'react';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = TestIds.INTERSTITIAL;

const MIN_AD_INTERVAL_MS = 3 * 60 * 1000;

export function useTabInterstitial() {
  const isPro = useAuthStore((s) => s.user?.isPro ?? false);
  const adRef = useRef<InterstitialAd | null>(null);
  const isLoadedRef = useRef(false);
  const isProRef = useRef(isPro);
  const lastAdTimeRef = useRef(0);
  isProRef.current = isPro;

  useEffect(() => {
    if (isPro) return;

    function loadNext() {
      if (isProRef.current) return;
      const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
      adRef.current = ad;
      isLoadedRef.current = false;

      ad.addAdEventListener(AdEventType.LOADED, () => {
        console.log('[Ad] Loaded');
        isLoadedRef.current = true;
      });
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        isLoadedRef.current = false;
        adRef.current = null;
        loadNext();
      });
      ad.addAdEventListener(AdEventType.ERROR, (e) => {
        console.log('[Ad] Error', e);
        isLoadedRef.current = false;
        setTimeout(loadNext, 5000);
      });

      ad.load();
    }

    mobileAdsReady.then(() => {
      console.log('[Ad] SDK ready, starting load');
      loadNext();
    });

    return () => {
      adRef.current = null;
      isLoadedRef.current = false;
    };
  }, [isPro]);

  function showAd() {
    const now = Date.now();
    if (isProRef.current || !isLoadedRef.current || !adRef.current) return;
    if (now - lastAdTimeRef.current < MIN_AD_INTERVAL_MS) return;
    lastAdTimeRef.current = now;
    try {
      adRef.current.show();
    } catch {
      // ad may have expired between load and show
    }
  }

  return { showAd };
}
