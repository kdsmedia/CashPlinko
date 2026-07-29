import { useState, useCallback, useRef } from 'react';

export interface AdRewardState {
  isWatching: boolean;
  progress: number; // 0 to 1
}

/**
 * Mock AdMob Reward hook.
 * In a production native build, replace the `watchAd` implementation
 * with the actual react-native-google-mobile-ads rewardedAd API.
 *
 * AdMob App ID: ca-app-pub-6881903056221433~3983256819
 * Reward Unit ID: ca-app-pub-6881903056221433/6525779813
 */
export function useAdReward() {
  const [state, setState] = useState<AdRewardState>({
    isWatching: false,
    progress: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const watchAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isWatching: true, progress: 0 });
      let elapsed = 0;
      const DURATION = 3000; // 3 second mock ad
      const TICK = 100;

      intervalRef.current = setInterval(() => {
        elapsed += TICK;
        const progress = Math.min(elapsed / DURATION, 1);
        setState({ isWatching: true, progress });

        if (elapsed >= DURATION) {
          clearInterval(intervalRef.current!);
          setState({ isWatching: false, progress: 0 });
          resolve(true);
        }
      }, TICK);
    });
  }, []);

  const cancelAd = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState({ isWatching: false, progress: 0 });
  }, []);

  return { ...state, watchAd, cancelAd };
}
