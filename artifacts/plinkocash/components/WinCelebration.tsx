import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Prize, getPrizeBrightColor } from '@/constants/game';

const { width: SCREEN_W } = Dimensions.get('window');

interface WinCelebrationProps {
  prize: Prize | null;
  visible: boolean;
  onDone: () => void;
}

function PrizeLabelText({ prize }: { prize: Prize }) {
  const colors = useColors();
  if (prize === 'zonk') {
    return <Text style={[styles.mainLabel, { color: colors.mutedForeground }]}>ZONK</Text>;
  }
  if (prize === 'ads') {
    return null; // ads handled separately
  }
  return (
    <Text style={[styles.mainLabel, { color: colors.gold }]}>+{prize}</Text>
  );
}

export function WinCelebration({ prize, visible, onDone }: WinCelebrationProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || prize === null || prize === 'ads') {
      scale.setValue(0);
      opacity.setValue(0);
      return;
    }

    if (prize === 'zonk') {
      // Subtle grey shake for zonk
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(800),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        scale.setValue(0);
        onDone();
      });
      return;
    }

    // Win animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.15,
          tension: 180,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.spring(scale, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      scale.setValue(0);
      onDone();
    });
  }, [visible, prize]);

  if (!visible || prize === null || prize === 'ads') return null;

  const color = getPrizeBrightColor(prize);
  const isZonk = prize === 'zonk';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isZonk ? '#2C2C44' : '#07041A',
            borderColor: color,
            shadowColor: color,
          },
        ]}
      >
        <PrizeLabelText prize={prize} />
        {!isZonk && (
          <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>POIN</Text>
        )}
        {isZonk && (
          <Text style={[styles.zonkSub, { color: colors.mutedForeground }]}>
            Lebih beruntung lain kali!
          </Text>
        )}
      </View>

      {/* Sparkle dots for wins */}
      {!isZonk &&
        [-60, -30, 30, 60, -80, 80].map((offsetX, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              {
                backgroundColor: i % 2 === 0 ? color : colors.neon,
                left: SCREEN_W / 2 + offsetX - 5,
                top: -20 + (i % 3) * 10,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  bubble: {
    borderRadius: 20,
    borderWidth: 2,
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  mainLabel: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  pointsLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 3,
    marginTop: -4,
  },
  zonkSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  sparkle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
