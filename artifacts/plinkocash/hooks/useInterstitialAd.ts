/**
 * Web / Expo Go fallback — silent no-op, no native modules.
 * Metro auto-picks useInterstitialAd.native.ts on Android/iOS.
 */
export function useInterstitialAd() {
  return {
    startTimer: () => {},
    stopTimer: () => {},
  };
}
