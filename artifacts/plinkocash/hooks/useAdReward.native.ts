/**
 * Native (Android/iOS) — uses real react-native-google-mobile-ads.
 * Metro auto-picks this file on native builds; .ts is used on web.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { ADMOB_REWARD_UNIT_ID } from '@/constants/game';

export interface AdRewardState {
  isWatching: boolean;
  progress: number;
  isReady: boolean;
}

export function useAdReward() {
  const [state, setState] = useState<AdRewardState>({
    isWatching: false,
    progress: 0,
    isReady: false,
  });

  const adRef = useRef<ReturnType<typeof RewardedAd.createForAdRequest> | null>(null);
  const resolveRef = useRef<((earned: boolean) => void) | null>(null);

  useEffect(() => {
    const ad = RewardedAd.createForAdRequest(ADMOB_REWARD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setState((s) => ({ ...s, isReady: true }));
    });
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      if (resolveRef.current) { resolveRef.current(true); resolveRef.current = null; }
    });
    const unsubClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setState({ isWatching: false, progress: 0, isReady: false });
      setTimeout(() => ad.load(), 500);
      if (resolveRef.current) { resolveRef.current(false); resolveRef.current = null; }
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setState({ isWatching: false, progress: 0, isReady: false });
      if (resolveRef.current) { resolveRef.current(false); resolveRef.current = null; }
      setTimeout(() => ad.load(), 5000);
    });

    ad.load();
    return () => { unsubLoaded(); unsubEarned(); unsubClose(); unsubError(); };
  }, []);

  const watchAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!adRef.current) { resolve(false); return; }
      resolveRef.current = resolve;
      setState((s) => ({ ...s, isWatching: true }));
      try { adRef.current.show(); }
      catch { setState({ isWatching: false, progress: 0, isReady: false }); resolve(false); }
    });
  }, []);

  const cancelAd = useCallback(() => {
    setState({ isWatching: false, progress: 0, isReady: false });
  }, []);

  return { ...state, watchAd, cancelAd };
}
