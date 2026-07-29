/**
 * Native AdBanner — real AdMob BannerAd (Android/iOS EAS builds).
 * Metro auto-picks this file on native; AdBanner.tsx is used on web.
 *
 * Unit ID: ca-app-pub-6881903056221433/5160607111
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { ADMOB_BANNER_UNIT_ID } from '@/constants/game';

export const BANNER_HEIGHT = 60;

export function AdBanner() {
  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={ADMOB_BANNER_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#050314',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
