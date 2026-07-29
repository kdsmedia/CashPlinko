/**
 * Web / Expo Go fallback — 3-second mock progress bar, no native modules.
 * Metro auto-picks useAdReward.native.ts on Android/iOS.
 */
import { useState, useCallback, useRef } from 'react';

export interface AdRewardState {
  isWatching: boolean;
  progress: number;
  isReady: boolean;
}

export function useAdReward() {
  const [state, setState] = useState<AdRewardState>({
    isWatching: false,
    progress: 0,
    isReady: true,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const watchAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isWatching: true, progress: 0, isReady: true });
      let elapsed = 0;
      const DURATION = 3000;
      const TICK = 100;
      intervalRef.current = setInterval(() => {
        elapsed += TICK;
        const progress = Math.min(elapsed / DURATION, 1);
        setState({ isWatching: true, progress, isReady: true });
        if (elapsed >= DURATION) {
          clearInterval(intervalRef.current!);
          setState({ isWatching: false, progress: 0, isReady: true });
          resolve(true);
        }
      }, TICK);
    });
  }, []);

  const cancelAd = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState({ isWatching: false, progress: 0, isReady: true });
  }, []);

  return { ...state, watchAd, cancelAd };
}
