/**
 * Web / Expo Go AdBanner — neon-styled placeholder, zero native imports.
 * Metro auto-picks AdBanner.native.tsx on Android/iOS EAS builds.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const BANNER_HEIGHT = 60;

export function AdBanner() {
  return (
    <View style={styles.placeholder}>
      <LinearGradient
        colors={[
          'rgba(0,245,212,0.04)',
          'rgba(136,0,255,0.06)',
          'rgba(0,245,212,0.04)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.dot} />
        <View style={styles.labelGroup}>
          <Text style={styles.sponsoredTag}>SPONSOR</Text>
          <Text style={styles.adLine}>Advertisement Space · Plinko Cash</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AD</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    height: BANNER_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,245,212,0.15)',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F5D4',
    opacity: 0.6,
  },
  labelGroup: { flex: 1, gap: 1 },
  sponsoredTag: {
    fontSize: 8,
    color: '#00F5D4',
    opacity: 0.7,
    letterSpacing: 2,
    fontFamily: 'Inter_700Bold',
  },
  adLine: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: 'rgba(0,245,212,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,245,212,0.25)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    color: '#00F5D4',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
});
