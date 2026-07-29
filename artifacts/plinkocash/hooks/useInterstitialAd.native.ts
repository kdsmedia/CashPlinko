/**
 * Native (Android/iOS) — real AdMob interstitial, fires every 5 minutes.
 * Metro auto-picks this file on native; .ts (no-op) is used on web.
 */
import { useEffect, useRef, useCallback } from 'react';
import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { ADMOB_INTERSTITIAL_UNIT_ID, INTERSTITIAL_INTERVAL_MS } from '@/constants/game';

export function useInterstitialAd() {
  const adRef = useRef<ReturnType<typeof InterstitialAd.createForAdRequest> | null>(null);
  const isReadyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAd = useCallback(() => {
    const ad = InterstitialAd.createForAdRequest(ADMOB_INTERSTITIAL_UNIT_ID);
    adRef.current = ad;
    isReadyRef.current = false;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      isReadyRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isReadyRef.current = false;
      unsubLoaded(); unsubClosed(); unsubError();
      setTimeout(loadAd, 500);
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      isReadyRef.current = false;
      unsubLoaded(); unsubClosed(); unsubError();
      setTimeout(loadAd, 10000);
    });

    ad.load();
  }, []);

  useEffect(() => {
    loadAd();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadAd]);

  const showIfReady = useCallback(() => {
    if (!adRef.current || !isReadyRef.current) return;
    try { adRef.current.show(); } catch { /* ignore */ }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(showIfReady, INTERSTITIAL_INTERVAL_MS);
  }, [showIfReady]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  return { startTimer, stopTimer };
}
