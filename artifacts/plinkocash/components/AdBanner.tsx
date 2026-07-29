/**
 * Web / Expo Go AdBanner — empty container, no text or icons.
 * Metro auto-picks AdBanner.native.tsx on Android/iOS (real AdMob BannerAd).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

export const BANNER_HEIGHT = 60;

export function AdBanner() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: '#050314',
  },
});
