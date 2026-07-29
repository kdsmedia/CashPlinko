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
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { SPIN_SEGMENTS, RIGGED_SPIN_INDICES } from '@/constants/game';
import { useAdReward } from '@/hooks/useAdReward';
import { useGame } from '@/context/GameContext';

interface SpinWheelModalProps {
  visible: boolean;
  onClose: () => void;
}

const WHEEL_SIZE = 280;
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const R = CX - 8;
const SEG_COUNT = SPIN_SEGMENTS.length;
const SEG_ANGLE = 360 / SEG_COUNT;

function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function slicePath(startAngle: number, endAngle: number): string {
  const s = polarToXY(startAngle, R);
  const e = polarToXY(endAngle, R);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

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

    const targetIdx = RIGGED_SPIN_INDICES[Math.floor(Math.random() * RIGGED_SPIN_INDICES.length)];
    const segMid = targetIdx * SEG_ANGLE + SEG_ANGLE / 2;
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

          {/* Wheel */}
          <View style={styles.wheelWrap}>
            {/* Pointer */}
            <View style={[styles.pointer, { borderBottomColor: colors.gold }]} />

            <Animated.View style={{ transform: [{ rotate }] }}>
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                <Circle cx={CX} cy={CY} r={R + 4} fill="#1A0E3A" />
                {SPIN_SEGMENTS.map((seg, i) => {
                  const start = i * SEG_ANGLE;
                  const end = (i + 1) * SEG_ANGLE;
                  const mid = start + SEG_ANGLE / 2;
                  const lp = polarToXY(mid, R * 0.65);
                  return (
                    <React.Fragment key={i}>
                      <Path
                        d={slicePath(start, end)}
                        fill={seg.color}
                        stroke="#07041A"
                        strokeWidth="1.5"
                      />
                      <SvgText
                        x={lp.x}
                        y={lp.y + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={seg.label.length > 4 ? 7 : 9}
                        fontWeight="bold"
                      >
                        {seg.label}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
                <Circle cx={CX} cy={CY} r={14} fill="#07041A" />
                <Circle cx={CX} cy={CY} r={10} fill={colors.gold} />
              </Svg>
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
            <Text style={[styles.wonText, { color: colors.success, textAlign: 'center' }]}>
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
    marginBottom: 12,
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
    marginBottom: 16,
  },
  pointer: {
    position: 'absolute',
    top: -6,
    zIndex: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  wonBadge: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
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
