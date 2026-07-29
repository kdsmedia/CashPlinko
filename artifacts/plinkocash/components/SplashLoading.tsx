import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');
const DURATION_MS = 10000; // 10 seconds

interface SplashLoadingProps {
  onFinished: () => void;
}

export function SplashLoading({ onFinished }: SplashLoadingProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const ballY = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const percent = useRef(new Animated.Value(0)).current;
  const percentDisplay = useRef(0);

  useEffect(() => {
    // Progress bar + percent counter
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    Animated.timing(percent, {
      toValue: 100,
      duration: DURATION_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Bouncing ball animation (looped)
    Animated.loop(
      Animated.sequence([
        Animated.timing(ballY, {
          toValue: 30,
          duration: 600,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(ballY, {
          toValue: -30,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fade out and call onFinished after duration
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFinished());
    }, DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const [displayPct, setDisplayPct] = React.useState(0);
  useEffect(() => {
    const id = percent.addListener(({ value }) => {
      setDisplayPct(Math.round(value));
    });
    return () => percent.removeListener(id);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <LinearGradient
        colors={['#0F063A', '#07041A', '#000000']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Logo + bouncing ball */}
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ translateY: ballY }] }}>
          <View style={styles.ballOuter}>
            <View style={styles.ball} />
          </View>
        </Animated.View>

        <Text style={styles.title}>
          <Text style={styles.titleGold}>Plinko</Text>
          <Text style={styles.titleNeon}>Cash</Text>
        </Text>

        <Text style={styles.tagline}>Jatuhkan bola, raih hadiah!</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <Text style={styles.pctText}>{displayPct}%</Text>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              { width: barWidth },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 80,
  },
  ballOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  ball: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 42,
    letterSpacing: 2,
  },
  titleGold: {
    fontFamily: 'Inter_700Bold',
    color: '#FFD700',
  },
  titleNeon: {
    fontFamily: 'Inter_700Bold',
    color: '#00F5D4',
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  progressSection: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
    alignItems: 'center',
    gap: 10,
  },
  pctText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#FFD700',
  },
  barTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
});
