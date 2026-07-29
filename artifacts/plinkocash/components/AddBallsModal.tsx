import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { useAdReward } from '@/hooks/useAdReward';
import {
  POINTS_PER_BALL_PACK,
  BALLS_PER_PACK,
  BALLS_PER_AD,
} from '@/constants/game';

interface AddBallsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddBallsModal({ visible, onClose }: AddBallsModalProps) {
  const colors = useColors();
  const { points, balls, spendPoints, addBalls } = useGame();
  const { isWatching, progress, watchAd } = useAdReward();

  const handleBuyBalls = () => {
    if (points < POINTS_PER_BALL_PACK) {
      Alert.alert('Poin tidak cukup', `Kamu butuh ${POINTS_PER_BALL_PACK} poin untuk membeli ${BALLS_PER_PACK} bola.`);
      return;
    }
    const ok = spendPoints(POINTS_PER_BALL_PACK);
    if (ok) {
      addBalls(BALLS_PER_PACK);
      Alert.alert('Berhasil!', `+${BALLS_PER_PACK} bola ditambahkan!`, [
        { text: 'OK', onPress: onClose },
      ]);
    }
  };

  const handleWatchAd = async () => {
    if (isWatching) return;
    const success = await watchAd();
    if (success) {
      addBalls(BALLS_PER_AD);
      Alert.alert('Selesai!', `+${BALLS_PER_AD} bola gratis dari iklan!`, [
        { text: 'OK', onPress: onClose },
      ]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.gold }]}>TAMBAH BOLA</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isWatching}>
              <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current balls */}
          <View style={[styles.ballsBadge, { backgroundColor: colors.muted }]}>
            <MaterialIcons name="sports-baseball" size={20} color={colors.neon} />
            <Text style={[styles.ballsText, { color: colors.neon }]}>
              Sisa Bola: <Text style={styles.ballsNum}>{balls}</Text>
            </Text>
          </View>

          {/* Points display */}
          <Text style={[styles.pointsInfo, { color: colors.mutedForeground }]}>
            Poin kamu:{' '}
            <Text style={[styles.pointsNum, { color: colors.gold }]}>{points}</Text>
          </Text>

          {/* Option 1: Buy with points */}
          <TouchableOpacity
            style={[
              styles.optionBtn,
              {
                backgroundColor: points >= POINTS_PER_BALL_PACK ? colors.primary + '22' : colors.muted,
                borderColor: points >= POINTS_PER_BALL_PACK ? colors.primary : colors.border,
              },
            ]}
            onPress={handleBuyBalls}
            disabled={points < POINTS_PER_BALL_PACK || isWatching}
            activeOpacity={0.75}
          >
            <View style={styles.optionLeft}>
              <MaterialIcons name="monetization-on" size={28} color={colors.gold} />
              <View style={styles.optionTextGroup}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Tukar {POINTS_PER_BALL_PACK} Poin
                </Text>
                <Text style={[styles.optionSub, { color: colors.mutedForeground }]}>
                  Dapatkan {BALLS_PER_PACK} bola
                </Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
              <Text style={[styles.badgeText, { color: '#07041A' }]}>+{BALLS_PER_PACK}</Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Watch ad */}
          <TouchableOpacity
            style={[
              styles.optionBtn,
              {
                backgroundColor: colors.neon + '15',
                borderColor: colors.neon,
                opacity: isWatching ? 0.8 : 1,
              },
            ]}
            onPress={handleWatchAd}
            disabled={isWatching}
            activeOpacity={0.75}
          >
            <View style={styles.optionLeft}>
              <MaterialIcons name="play-circle-filled" size={28} color={colors.neon} />
              <View style={styles.optionTextGroup}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Tonton Iklan
                </Text>
                <Text style={[styles.optionSub, { color: colors.mutedForeground }]}>
                  {isWatching ? `Menonton... ${Math.round(progress * 100)}%` : `Gratis ${BALLS_PER_AD} bola`}
                </Text>
              </View>
            </View>
            {isWatching ? (
              <ActivityIndicator size="small" color={colors.neon} />
            ) : (
              <View style={[styles.badge, { backgroundColor: colors.neon }]}>
                <Text style={[styles.badgeText, { color: '#07041A' }]}>+{BALLS_PER_AD}</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.dailyNote, { color: colors.mutedForeground }]}>
            Jatah harian: {10} bola/hari (reset tengah malam)
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    padding: 24,
    paddingBottom: 36,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 4,
  },
  ballsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ballsText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  ballsNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  pointsInfo: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  pointsNum: {
    fontFamily: 'Inter_700Bold',
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionTextGroup: {
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  optionSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  dailyNote: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
});
