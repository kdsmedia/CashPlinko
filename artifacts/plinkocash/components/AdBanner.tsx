/**
 * AdBanner — renders the AdMob banner (ca-app-pub-6881903056221433/5160607111).
 *
 * In development / Expo Go this shows a styled placeholder.
 * In a native EAS build, swap the placeholder View for the real BannerAd
 * component from `react-native-google-mobile-ads`.
 *
 * Example native replacement:
 *   import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
 *   <BannerAd unitId={ADMOB_BANNER_UNIT_ID} size={BannerAdSize.FULL_BANNER} />
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ADMOB_BANNER_UNIT_ID } from '@/constants/game';

const BANNER_HEIGHT = 50;

export function AdBanner() {
  // On a native build you would render the real BannerAd here.
  // For Expo Go / web preview we show a styled placeholder.
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Advertisement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: '#0A0A1A',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 1,
    fontFamily: 'Inter_400Regular',
  },
});
