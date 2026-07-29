import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useAdReward } from '@/hooks/useAdReward';
import { GameHeader } from '@/components/GameHeader';
import { PlinkoBoard } from '@/components/PlinkoBoard';
import { SpinWheelModal } from '@/components/SpinWheelModal';
import { AddBallsModal } from '@/components/AddBallsModal';
import { WinCelebration } from '@/components/WinCelebration';
import { SplashLoading } from '@/components/SplashLoading';
import { AdBanner } from '@/components/AdBanner';
import { Prize } from '@/constants/game';

const HEADER_HEIGHT = 52;
const BANNER_HEIGHT = 50;
const CONTROLS_HEIGHT = 80;

export default function GameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { balls, dropBall, addBalls, addGameRecord, isLoaded } = useGame();
  const { playWin } = useGameAudio();
  const adReward = useAdReward();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const boardWidth = screenW;
  const boardHeight =
    screenH - topPad - HEADER_HEIGHT - BANNER_HEIGHT - CONTROLS_HEIGHT - bottomPad;

  const [showSplash, setShowSplash] = useState(true);
  const [dropTrigger, setDropTrigger] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [highlightSlot, setHighlightSlot] = useState<number | null>(null);
  const [lastPrize, setLastPrize] = useState<Prize | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showSpin, setShowSpin] = useState(false);
  const [showBalls, setShowBalls] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);

  const autoRef = useRef(autoMode);
  autoRef.current = autoMode;
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerDrop = useCallback(() => {
    const ok = dropBall();
    if (!ok) return false;
    setIsDropping(true);
    setHighlightSlot(null);
    setDropTrigger((t) => t + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return true;
  }, [dropBall]);

  const handleDropComplete = useCallback(() => {
    setIsDropping(false);
    // If auto mode still on, schedule next drop
    if (autoRef.current) {
      autoTimerRef.current = setTimeout(() => {
        if (autoRef.current) triggerDrop();
      }, 1800);
    }
  }, [triggerDrop]);

  const handlePrizeLanded = useCallback(
    (prize: Prize, slotIndex: number) => {
      setHighlightSlot(slotIndex);
      setLastPrize(prize);

      if (prize === 'ads') {
        setShowAdsModal(true);
        return;
      }

      if (prize !== 'zonk') {
        playWin();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      addGameRecord(prize);
      setShowWin(true);
    },
    [addGameRecord, playWin],
  );

  const toggleAuto = useCallback(() => {
    const next = !autoMode;
    setAutoMode(next);
    if (!next) {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    } else {
      // Start immediately
      if (!isDropping) triggerDrop();
    }
  }, [autoMode, isDropping, triggerDrop]);

  // Cleanup auto timer
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  // Stop auto if out of balls
  useEffect(() => {
    if (balls <= 0 && autoMode) {
      setAutoMode(false);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    }
  }, [balls, autoMode]);

  // Show splash until both data is loaded AND 10s have passed
  // isLoaded gates the game content; SplashLoading handles the 10s timer
  const handleSplashFinished = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!isLoaded) {
    // Data not loaded yet — show splash unconditionally until data + timer done
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <SplashLoading onFinished={() => {}} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0F063A', '#07041A', '#000000']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header — icons only, no brand name */}
      <GameHeader onOpenSpin={() => setShowSpin(true)} onOpenBalls={() => setShowBalls(true)} />

      {/* Board */}
      <View style={styles.boardContainer}>
        <PlinkoBoard
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          onPrizeLanded={handlePrizeLanded}
          dropTrigger={dropTrigger}
          onDropComplete={handleDropComplete}
          highlightSlot={highlightSlot}
        />
        <WinCelebration
          prize={lastPrize}
          visible={showWin}
          onDone={() => setShowWin(false)}
        />
      </View>

      {/* AdMob Banner above controls */}
      <AdBanner />

      {/* Controls */}
      <View
        style={[
          styles.controls,
          { paddingBottom: bottomPad + 8 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.ctrlBtn,
            autoMode
              ? { backgroundColor: colors.accent, borderColor: colors.accent }
              : { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: colors.border },
          ]}
          onPress={toggleAuto}
          activeOpacity={0.75}
        >
          <MaterialIcons
            name="autorenew"
            size={22}
            color={autoMode ? '#FFF' : colors.mutedForeground}
          />
          <Text
            style={[
              styles.ctrlText,
              { color: autoMode ? '#FFF' : colors.mutedForeground },
            ]}
          >
            AUTO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ctrlBtnMain,
            {
              backgroundColor:
                balls > 0 && !isDropping ? colors.gold : colors.muted,
              borderColor: balls > 0 && !isDropping ? colors.gold : 'transparent',
              shadowColor: colors.gold,
            },
          ]}
          onPress={() => !isDropping && triggerDrop()}
          disabled={balls <= 0 || isDropping}
          activeOpacity={0.75}
        >
          {isDropping ? (
            <ActivityIndicator color="#07041A" size="small" />
          ) : (
            <>
              <MaterialIcons name="sports-baseball" size={22} color="#07041A" />
              <Text style={styles.ctrlTextMain}>DROP</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Spin Wheel Modal */}
      <SpinWheelModal visible={showSpin} onClose={() => setShowSpin(false)} />

      {/* Add Balls Modal */}
      <AddBallsModal visible={showBalls} onClose={() => setShowBalls(false)} />

      {/* Ads Prize Modal */}
      <Modal
        visible={showAdsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdsModal(false)}
      >
        <View style={styles.adsOverlay}>
          <View style={[styles.adsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name="play-circle-filled" size={48} color={colors.neon} />
            <Text style={[styles.adsTitle, { color: colors.text }]}>Hadiah Iklan!</Text>
            <Text style={[styles.adsSub, { color: colors.mutedForeground }]}>
              Tonton iklan untuk mendapat +1 bola gratis
            </Text>
            <TouchableOpacity
              style={[styles.adsBtn, { backgroundColor: colors.neon }]}
              onPress={async () => {
                const ok = await adReward.watchAd();
                if (ok) {
                  addBalls(1);
                  addGameRecord('ads');
                }
                setShowAdsModal(false);
              }}
              disabled={adReward.isWatching}
            >
              {adReward.isWatching ? (
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <ActivityIndicator color="#07041A" size="small" />
                  <Text style={styles.adsBtnText}>{Math.round(adReward.progress * 100)}%</Text>
                </View>
              ) : (
                <Text style={styles.adsBtnText}>KLAIM (+1 Bola)</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdsModal(false)} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Lewati</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 10-second splash overlay — shown on first load */}
      {showSplash && <SplashLoading onFinished={handleSplashFinished} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boardContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1.5,
    minWidth: 100,
    justifyContent: 'center',
  },
  ctrlBtnMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 2,
    minWidth: 130,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  ctrlText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  ctrlTextMain: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#07041A',
    letterSpacing: 1,
  },
  adsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adsCard: {
    width: 300,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  adsTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  adsSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  adsBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 180,
    alignItems: 'center',
    marginTop: 4,
  },
  adsBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#07041A',
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
