import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { SPIN_SEGMENTS, riggedSpinIndex } from '@/constants/game';
import { useAdReward } from '@/hooks/useAdReward';
import { useGame } from '@/context/GameContext';

const WHEEL_IMAGE = require('@/assets/images/spinwheel.png');

interface SpinWheelModalProps {
  visible: boolean;
  onClose: () => void;
}

const WHEEL_SIZE = 300;
const SEG_COUNT = SPIN_SEGMENTS.length;
const SEG_ANGLE = 360 / SEG_COUNT; // 36° per segment

export function SpinWheelModal({ visible, onClose }: SpinWheelModalProps) {
  const colors = useColors();
  const { addPoints, addBalls } = useGame();
  const { isWatching, progress, watchAd } = useAdReward();

  const rotation = useRef(new Animated.Value(0)).current;
  const currentAngle = useRef(0);

  const [isSpinning, setIsSpinning] = useState(false);
  const [wonIndex, setWonIndex] = useState<number | null>(null);
  const [showClaim, setShowClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleSpin = () => {
    if (isSpinning || showClaim) return;

    setWonIndex(null);
    setClaimed(false);
    setIsSpinning(true);

    // Pick rigged target segment (30% win, 70% lose)
    const targetIdx = riggedSpinIndex();

    // Mid-angle of the target segment in the image (clockwise from top)
    // Segment 0 center = 18°, segment 1 = 54°, etc.
    const segMid = targetIdx * SEG_ANGLE + SEG_ANGLE / 2;

    // Total rotation: full spins + alignment to bring segMid to the top pointer
    const spins = 8 + Math.floor(Math.random() * 4);
    const stopAt = spins * 360 + (360 - segMid);
    const finalAngle = currentAngle.current + stopAt;

    rotation.setValue(currentAngle.current);
    Animated.timing(rotation, {
      toValue: finalAngle,
      duration: 10000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      currentAngle.current = finalAngle;
      setIsSpinning(false);
      setWonIndex(targetIdx);
      setShowClaim(true);
    });
  };

  const handleClaim = async () => {
    if (wonIndex === null) return;
    const success = await watchAd();
    if (!success) return;

    const seg = SPIN_SEGMENTS[wonIndex];
    if (seg.value === 'zonk') {
      // nothing
    } else if (typeof seg.balls === 'number') {
      addBalls(seg.balls);
    } else if (typeof seg.points === 'number') {
      addPoints(seg.points);
    }
    setClaimed(true);
    setShowClaim(false);
    setTimeout(() => {
      setWonIndex(null);
      setClaimed(false);
      onClose();
    }, 1200);
  };

  // Interpolate rotation degrees — extrapolate:'extend' handles large accumulated values
  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const wonSeg = wonIndex !== null ? SPIN_SEGMENTS[wonIndex] : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.gold }]}>SPIN WHEEL</Text>
            {!isSpinning && !showClaim && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Wheel + pointer */}
          <View style={styles.wheelWrap}>
            {/* Gold triangle pointer */}
            <View style={styles.pointerOuter}>
              <View style={[styles.pointer, { borderBottomColor: '#FFD700' }]} />
            </View>

            {/* Rotating wheel image */}
            <Animated.View style={[styles.wheelContainer, { transform: [{ rotate }] }]}>
              <Image
                source={WHEEL_IMAGE}
                style={styles.wheelImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Won label */}
          {wonSeg && !claimed && (
            <View style={[styles.wonBadge, { backgroundColor: wonSeg.color + '33', borderColor: wonSeg.color }]}>
              <Text style={[styles.wonText, { color: '#FFFFFF' }]}>
                {wonSeg.value === 'zonk' ? '😔 ZONK!' : `Menang: ${wonSeg.label}`}
              </Text>
            </View>
          )}
          {claimed && (
            <Text style={[styles.wonText, { color: colors.success, textAlign: 'center', marginBottom: 8 }]}>
              ✓ Hadiah diklaim!
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.btnRow}>
            {!isSpinning && !showClaim && !claimed && (
              <TouchableOpacity
                style={[styles.spinBtn, { backgroundColor: colors.gold }]}
                onPress={handleSpin}
              >
                <Text style={[styles.spinBtnText, { color: '#07041A' }]}>PUTAR</Text>
              </TouchableOpacity>
            )}

            {showClaim && !claimed && (
              <TouchableOpacity
                style={[styles.spinBtn, { backgroundColor: colors.accent }]}
                onPress={handleClaim}
                disabled={isWatching}
              >
                {isWatching ? (
                  <View style={styles.adRow}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.spinBtnText}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.spinBtnText}>
                    {wonSeg?.value === 'zonk' ? 'OK' : '📺 KLAIM HADIAH'}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {isSpinning && (
              <ActivityIndicator color={colors.gold} size="large" />
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 340,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  wheelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pointerOuter: {
    position: 'absolute',
    top: -2,
    zIndex: 10,
    alignItems: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    // shadow for pointer
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelImage: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
  },
  wonBadge: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  wonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  btnRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    minHeight: 48,
    justifyContent: 'center',
  },
  spinBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  spinBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  adRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
