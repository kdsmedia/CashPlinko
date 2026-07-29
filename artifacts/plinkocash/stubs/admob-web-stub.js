// Web stub for react-native-google-mobile-ads
// This file is returned by Metro on the web platform so native-only
// internals (codegenNativeComponent) are never bundled.
// All values are safe no-ops; real AdMob runs via .native.ts files.

const noop = () => {};
const noopAd = {
  addAdEventListener: () => noop,
  load: noop,
  show: noop,
};

module.exports = {
  // Ad classes
  BannerAd: () => null,
  GAMBannerAd: () => null,
  InterstitialAd: {
    createForAdRequest: () => noopAd,
  },
  GAMInterstitialAd: {
    createForAdRequest: () => noopAd,
  },
  RewardedAd: {
    createForAdRequest: () => noopAd,
  },
  RewardedInterstitialAd: {
    createForAdRequest: () => noopAd,
  },
  AppOpenAd: {
    createForAdRequest: () => noopAd,
  },

  // Event types
  AdEventType: {
    LOADED: 'loaded',
    ERROR: 'error',
    OPENED: 'opened',
    CLICKED: 'clicked',
    CLOSED: 'closed',
  },
  RewardedAdEventType: {
    LOADED: 'rewarded-loaded',
    EARNED_REWARD: 'rewarded-earned-reward',
  },
  BannerAdSize: {
    BANNER: 'BANNER',
    FULL_BANNER: 'FULL_BANNER',
    LARGE_BANNER: 'LARGE_BANNER',
    LEADERBOARD: 'LEADERBOARD',
    MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
    ADAPTIVE_BANNER: 'ADAPTIVE_BANNER',
  },
  TestIds: {
    BANNER: 'test-banner',
    INTERSTITIAL: 'test-interstitial',
    REWARDED: 'test-rewarded',
    APP_OPEN: 'test-app-open',
  },
  MaxAdContentRating: {},
  AdsConsent: { requestInfoUpdate: noop, showForm: noop },
  AdsConsentStatus: {},
  AdsConsentDebugGeography: {},
  MobileAds: () => ({ initialize: noop }),
};
