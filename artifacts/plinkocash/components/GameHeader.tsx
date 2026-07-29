import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';

interface GameHeaderProps {
  onOpenSpin: () => void;
  onOpenBalls: () => void;
}

export function GameHeader({ onOpenSpin, onOpenBalls }: GameHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { balls, points } = useGame();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 6 }]}>
      {/* All icons in a single row — no brand name, no decorative logo */}

      {/* Spin Wheel */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onOpenSpin}
        activeOpacity={0.7}
      >
        <MaterialIcons name="card-giftcard" size={26} color={colors.gold} />
      </TouchableOpacity>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Ball counter */}
      <TouchableOpacity
        style={styles.ballBtn}
        onPress={onOpenBalls}
        activeOpacity={0.7}
      >
        <MaterialIcons name="sports-baseball" size={18} color={colors.neon} />
        <Text style={[styles.ballCount, { color: colors.neon }]}>{balls}</Text>
        <MaterialIcons name="add-circle-outline" size={14} color={colors.neon} />
      </TouchableOpacity>

      {/* Wallet */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => router.push('/withdrawal')}
        activeOpacity={0.7}
      >
        <FontAwesome5 name="wallet" size={20} color={colors.gold} />
        <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>
          {points >= 1000 ? `${(points / 1000).toFixed(1)}K` : points}
        </Text>
      </TouchableOpacity>

      {/* Info */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => router.push('/info')}
        activeOpacity={0.7}
      >
        <Ionicons name="information-circle-outline" size={24} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  spacer: { flex: 1 },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  ballBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,245,212,0.1)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  ballCount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    minWidth: 18,
    textAlign: 'center',
  },
  pointsLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});
